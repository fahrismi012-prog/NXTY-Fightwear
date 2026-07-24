import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";
import type { OrderStatus } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Valid status transition rules (state machine).
 * paid -> processed -> shipped -> delivered
 * (paid bisa skip processed manual; cancelled bisa dari status apapun
 *  sebelum shipped; awaiting_payment/awaiting_confirmation khusus mode manual).
 */
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  awaiting_payment: ["awaiting_confirmation", "cancelled"],
  awaiting_confirmation: ["paid", "cancelled"],
  pending: ["paid", "cancelled"],
  paid: ["processed", "shipped", "cancelled", "delivered"],
  processed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/**
 * PUT /api/admin/orders/[id]
 *
 * Edit order (admin only). Body (semua opsional):
 *   {
 *     status?: OrderStatus,                  // Transition validated
 *     notes?: string | null,
 *     customer_name?: string,
 *     customer_email?: string,
 *     customer_phone?: string,
 *     shipping_manual_carrier?: string | null,
 *     shipping_manual_cost?: number | null,
 *     shipping_manual_receipt?: string | null,    // resi
 *   }
 *
 * Effect samping saat status transition:
 *   - 'processed' (paid -> processed): siap diproses
 *   - 'shipped': set shipping_manual_carrier & shipping_manual_receipt
 *   - 'delivered': set payment_confirmed_at kalau belum (untuk mode manual)
 *
 * Validasi transisi: hanya boleh pindah ke status yang diizinkan.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const { id } = await context.params;

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // Fetch order saat ini untuk validasi transition
  const { data: current, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!current) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const update: Record<string, unknown> = {};

  // Status transition validation
  if (typeof body.status === "string" && body.status !== current.status) {
    const newStatus = body.status as OrderStatus;
    const allowed = STATUS_TRANSITIONS[current.status as OrderStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Tidak bisa ubah status dari '${current.status}' ke '${newStatus}'. Transisi yang diizinkan: ${allowed.join(", ") || "(tidak ada)"}`,
        },
        { status: 400 },
      );
    }
    update.status = newStatus;
    // Auto-set timestamps saat transisi penting
    if (newStatus === "delivered" && current.status !== "delivered") {
      // Tandai delivered time = now
      update.updated_at = new Date().toISOString();
    }
  }

  // Notes (internal admin notes, bukan notes customer)
  if (body.notes !== undefined) {
    update.notes = body.notes === null ? null : String(body.notes).trim();
  }

  // Customer info (kalau perlu update)
  if (typeof body.customer_name === "string") {
    const v = body.customer_name.trim();
    if (!v) return NextResponse.json({ error: "customer_name kosong" }, { status: 400 });
    update.customer_name = v;
  }
  if (typeof body.customer_email === "string") {
    const v = body.customer_email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) {
      return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
    }
    update.customer_email = v;
  }
  if (typeof body.customer_phone === "string") {
    update.customer_phone = body.customer_phone.trim();
  }

  // Shipping manual info (untuk mode shipping manual)
  if (body.shipping_manual_carrier !== undefined) {
    update.shipping_manual_carrier =
      body.shipping_manual_carrier === null
        ? null
        : String(body.shipping_manual_carrier).trim() || null;
  }
  if (body.shipping_manual_cost !== undefined) {
    if (body.shipping_manual_cost === null) {
      update.shipping_manual_cost = null;
    } else {
      const n = Number(body.shipping_manual_cost);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json(
          { error: "shipping_manual_cost harus angka >= 0" },
          { status: 400 },
        );
      }
      update.shipping_manual_cost = Math.round(n);
    }
  }
  if (body.shipping_manual_receipt !== undefined) {
    update.shipping_manual_receipt =
      body.shipping_manual_receipt === null
        ? null
        : String(body.shipping_manual_receipt).trim() || null;
  }
  if (body.shipping_manual_receipt_url !== undefined) {
    update.shipping_manual_receipt_url =
      body.shipping_manual_receipt_url === null
        ? null
        : String(body.shipping_manual_receipt_url).trim() || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Tidak ada field yang diubah" }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ order: updated });
}

/**
 * DELETE /api/admin/orders/[id]
 *
 * Hapus pesanan (admin only). Tidak bisa di-undelete.
 * Hanya untuk cleanup (misal test order duplikat, dsb).
 * Production: mungkin perlu soft-delete (status='deleted') bukan hard delete.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const { id } = await context.params;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // Hapus payment proof di storage dulu kalau ada
  const { data: order } = await supabase
    .from("orders")
    .select("payment_proof_url")
    .eq("id", id)
    .maybeSingle();

  if (order?.payment_proof_url) {
    // Storage path (bukan URL) — hapus file
    try {
      await supabase.storage
        .from("payment-proofs")
        .remove([order.payment_proof_url]);
    } catch (err) {
      console.warn("[admin/orders DELETE] storage cleanup failed:", err);
      // Tetap lanjut hapus order — file orphan bisa di-cleanup nanti
    }
  }

  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
