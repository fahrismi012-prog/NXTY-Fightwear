import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * POST /api/admin/notifications/read
 * Body: {} -> tandai semua notif admin sebagai dibaca
 *       { id } -> tandai satu
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  const now = new Date().toISOString();

  let query = supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("audience", "admin")
    .is("read_at", null);

  if (typeof body.id === "string" && body.id) {
    query = supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("audience", "admin")
      .eq("id", body.id);
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
