import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]
 *
 * Customer fetch order detail untuk halaman payment/pending & lacak.
 *
 * Akses diizinkan untuk:
 * - Order milik customer yang login (customer_id atau email match)
 * - Guest order (customer_id IS NULL) — publik, identifier = order_id
 *
 * Catatan keamanan: order_id adalah identifier semi-random (timestamp +
 * random 5 digit), tidak enumerable dengan mudah. Untuk mutate (upload
 * bukti), butuh verifikasi tambahan (lihat /upload-proof endpoint).
 *
 * Return: order info + bank_account info (kalau payment_method=manual).
 * BUKAN return full proof URL kalau bucket private — admin yang baca.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

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

  // Ownership check (hanya untuk order yang terkait customer_id/login)
  // Guest orders (customer_id IS NULL) — publik read-only, identifier order_id
  if (order.customer_id) {
    const user = await getCurrentCustomerUser();
    if (!user) {
      return NextResponse.json(
        { error: "Login dulu untuk melihat pesanan Anda" },
        { status: 401 },
      );
    }
    const isOwner =
      order.customer_id === user.id ||
      (order.customer_email && order.customer_email === user.email);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Anda tidak punya akses ke pesanan ini" },
        { status: 403 },
      );
    }
  }

  return NextResponse.json({ order });
}
