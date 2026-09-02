import { NextResponse } from "next/server";
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

/** GET /api/admin/notifications — 50 notif admin terbaru + jumlah belum dibaca. */
export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const [list, unread] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, body, order_id, read_at, created_at")
      .eq("audience", "admin")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("audience", "admin")
      .is("read_at", null),
  ]);

  return NextResponse.json({
    notifications: list.data ?? [],
    unread: unread.count ?? 0,
  });
}
