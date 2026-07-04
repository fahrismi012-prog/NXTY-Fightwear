import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/customer/addresses/[id]/set-default
 *
 * Tandai alamat sebagai default. Otomatis unmark alamat lain untuk
 * customer yang sama (1 default per customer).
 *
 * Auth: customer harus login DAN address harus miliknya.
 */
export async function PUT(_request: NextRequest, context: RouteContext) {
  const user = await getCurrentCustomerUser();
  if (!user) {
    return NextResponse.json(
      { error: "Anda harus login" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // Validasi: address harus milik customer ini
  const { data: addr, error: addrErr } = await supabase
    .from("customer_addresses")
    .select("id, customer_id")
    .eq("id", id)
    .maybeSingle();
  if (addrErr) {
    return NextResponse.json({ error: addrErr.message }, { status: 500 });
  }
  if (!addr || addr.customer_id !== user.id) {
    return NextResponse.json(
      { error: "Alamat tidak ditemukan atau bukan milik Anda" },
      { status: 404 },
    );
  }

  // 1. Unset semua default address customer ini
  await supabase
    .from("customer_addresses")
    .update({ is_default: false })
    .eq("customer_id", user.id);

  // 2. Set address ini sebagai default
  const { error: updateErr } = await supabase
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // 3. Sinkronkan customer_profiles.default_address_id (kalau kolom ada)
  await supabase
    .from("customer_profiles")
    .upsert(
      { id: user.id, default_address_id: id },
      { onConflict: "id" },
    );

  return NextResponse.json({ ok: true });
}
