import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/customer/notifications/read
 * Body: {} -> tandai semua notif milik user sebagai dibaca
 *       { id } -> tandai satu
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentCustomerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  const now = new Date().toISOString();

  let query = supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("audience", "customer")
    .eq("recipient_id", user.id)
    .is("read_at", null);

  if (typeof body.id === "string" && body.id) {
    query = supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("audience", "customer")
      .eq("recipient_id", user.id)
      .eq("id", body.id);
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
