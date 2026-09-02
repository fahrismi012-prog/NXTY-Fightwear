import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/orders/[id]/confirm-payment
 * Admin konfirmasi pembayaran manual (mode manual).
 * Body: {} (kosong)
 * Effect: status -> 'paid', set payment_confirmed_at + payment_confirmed_by
 *
 * Auth: admin session cookie required.
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // Fetch order dulu untuk validasi
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, payment_method, payment_proof_url, customer_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  // Validasi: hanya untuk mode manual
  if (order.payment_method !== "manual") {
    return NextResponse.json(
      { error: "Pesanan ini bukan mode pembayaran manual" },
      { status: 400 },
    );
  }

  // Validasi: status harus awaiting_confirmation (customer sudah upload bukti)
  if (
    order.status !== "awaiting_confirmation" &&
    order.status !== "awaiting_payment"
  ) {
    return NextResponse.json(
      { error: `Tidak bisa konfirmasi pembayaran dari status '${order.status}'` },
      { status: 400 },
    );
  }

  // Validasi ringan: warning kalau belum ada bukti transfer
  // (admin boleh override dengan asumsi cek mutasi langsung)
  const confirmedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_confirmed_at: confirmedAt,
      payment_rejection_reason: null, // clear any prior rejection
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await notify({
    audience: "customer",
    type: "payment_verified",
    title: "Pembayaran dikonfirmasi",
    body: `Pembayaran pesanan …${id.slice(-8)} sudah kami verifikasi. Pesanan akan diproses.`,
    orderId: id,
    recipientId: order.customer_id,
  });

  return NextResponse.json({ ok: true, order: updated });
}
