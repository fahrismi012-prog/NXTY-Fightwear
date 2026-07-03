import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]
 *
 * Customer fetch order detail untuk halaman payment/pending.
 *
 * Hanya boleh diakses oleh customer yang order-nya sendiri
 * (verified via session cookie atau email match).
 *
 * Return: order info + bank_account info (kalau payment_method=manual).
 * BUKAN return full proof URL kalau bucket private — admin yang baca.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // Auth: customer harus login
  const supabaseAuth = createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Anda harus login untuk melihat pesanan" },
      { status: 401 },
    );
  }

  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id, customer_id, customer_email, customer_name, customer_phone,
      customer_address, notes, subtotal, shipping_cost, total,
      status, items, payment_id, payment_method, payment_expires_at,
      payment_proof_url, payment_rejection_reason, bank_account_id,
      shipping_method_used, shipping_manual_carrier, shipping_manual_cost,
      shipping_manual_receipt, created_at, updated_at,
      bank_account:bank_accounts(id, bank_name, account_number, account_holder, instructions)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  // Ownership check
  const isOwner =
    (order.customer_id && order.customer_id === user.id) ||
    (order.customer_email && order.customer_email === user.email);
  if (!isOwner) {
    return NextResponse.json(
      { error: "Anda tidak punya akses ke pesanan ini" },
      { status: 403 },
    );
  }

  return NextResponse.json({ order });
}
