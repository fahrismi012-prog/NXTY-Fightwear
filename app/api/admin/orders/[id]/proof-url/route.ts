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
 * GET /api/admin/orders/[id]/proof-url
 *
 * Generate signed URL untuk payment proof (private storage bucket).
 * Valid 1 jam. Frontend pakai ini untuk render <img src>.
 *
 * Return: { url: string } atau null (kalau order belum upload bukti).
 *
 * Auth: admin only.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
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

  // Fetch order — ambil payment_proof_url (path di storage)
  const { data: order, error } = await supabase
    .from("orders")
    .select("payment_proof_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!order?.payment_proof_url) {
    return NextResponse.json({ url: null });
  }

  // Generate signed URL (private bucket)
  const { data: signed, error: signErr } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(order.payment_proof_url, 3600); // 1 jam

  if (signErr || !signed) {
    return NextResponse.json(
      { error: signErr?.message ?? "Gagal generate signed URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: signed.signedUrl });
}
