import { NextResponse } from "next/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentCustomerUser();
  if (!user) return NextResponse.json({ authenticated: false });

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const [profileResult, addressResult] = await Promise.all([
    supabase
      .from("customer_profiles")
      .select("full_name, phone, default_address_id")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("customer_addresses")
      .select("id, label, recipient_name, phone, street, city, province, postal_code, is_default")
      .eq("customer_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (profileResult.error || addressResult.error) {
    return NextResponse.json({ error: "Gagal memuat profil checkout" }, { status: 500 });
  }

  const addresses = addressResult.data ?? [];
  const preferred =
    addresses.find((address) => address.id === profileResult.data?.default_address_id) ??
    addresses.find((address) => address.is_default) ??
    addresses[0] ??
    null;

  return NextResponse.json({
    authenticated: true,
    profile: {
      email: user.email,
      fullName: profileResult.data?.full_name ?? "",
      phone: profileResult.data?.phone ?? "",
    },
    address: preferred,
    addresses,
  });
}
