import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/orders/[id]/reject-payment
 * Admin tolak pembayaran manual (mode manual).
 * Body: { reason: string }
 * Effect: status -> 'cancelled', set payment_rejection_reason
 *
 * Auth: admin session cookie required.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let body: { reason?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  const reason = String(body.reason ?? "").trim();
  if (!reason) {
    return NextResponse.json(
      { error: "Alasan penolakan wajib diisi" },
      { status: 400 },
    );
  }
  if (reason.length > 500) {
    return NextResponse.json(
      { error: "Alasan terlalu panjang (maks 500 karakter)" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, payment_method")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  if (order.payment_method !== "manual") {
    return NextResponse.json(
      { error: "Pesanan ini bukan mode pembayaran manual" },
      { status: 400 },
    );
  }

  if (
    order.status !== "awaiting_confirmation" &&
    order.status !== "awaiting_payment"
  ) {
    return NextResponse.json(
      { error: `Tidak bisa tolak dari status '${order.status}'` },
      { status: 400 },
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      payment_rejection_reason: reason,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, order: updated });
}
