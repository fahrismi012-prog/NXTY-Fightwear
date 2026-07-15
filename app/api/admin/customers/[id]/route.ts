import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";
import type { PriceTier } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TIERS: PriceTier[] = ["standard", "legacy"];

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * PATCH /api/admin/customers/[id]
 * Ubah price_tier pelanggan secara manual.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (auth) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const tier = body.price_tier as PriceTier;

  if (!VALID_TIERS.includes(tier)) {
    return NextResponse.json(
      { error: `price_tier harus salah satu dari: ${VALID_TIERS.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const { error } = await supabase
    .from("customer_profiles")
    .update({ price_tier: tier })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
