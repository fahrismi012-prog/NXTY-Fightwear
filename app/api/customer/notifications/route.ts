import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/customer/notifications — notif customer yang login + jumlah belum dibaca. */
export async function GET() {
  const user = await getCurrentCustomerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const [list, unread] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, body, order_id, read_at, created_at")
      .eq("audience", "customer")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("audience", "customer")
      .eq("recipient_id", user.id)
      .is("read_at", null),
  ]);

  return NextResponse.json({
    notifications: list.data ?? [],
    unread: unread.count ?? 0,
  });
}
