import { NextResponse } from "next/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tier harga customer yang sedang login, dipakai storefront untuk resolve harga legacy. */
export async function GET() {
  const user = await getCurrentCustomerUser();
  if (!user) return NextResponse.json({ tier: "standard" as const });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ tier: "standard" as const });

  const { data } = await supabase
    .from("customer_profiles")
    .select("price_tier")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({ tier: data?.price_tier ?? "standard" });
}
