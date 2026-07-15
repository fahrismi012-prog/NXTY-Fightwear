import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * GET /api/admin/customers
 * List pelanggan (customer_profiles) + email dari auth.users, diurutkan terbaru.
 */
export async function GET() {
  const auth = await requireAuth();
  if (auth) return auth;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const [{ data: profiles, error: profilesError }, { data: usersPage, error: usersError }] =
    await Promise.all([
      supabase
        .from("customer_profiles")
        .select("id, full_name, phone, price_tier, created_at")
        .order("created_at", { ascending: false }),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const emailById = new Map(usersPage.users.map((u) => [u.id, u.email ?? "—"]));
  const customers = (profiles ?? []).map((p) => ({
    ...p,
    email: emailById.get(p.id) ?? "—",
  }));

  return NextResponse.json({ customers });
}
