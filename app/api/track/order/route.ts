import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/track/order?id=XXX&contact=YYY
 * Lookup order by id + contact verification (email or phone).
 * Return order info + shipping info.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const contact = searchParams.get("contact") || searchParams.get("email");

  if (!id || !contact || /[,()]/.test(contact)) {
    return NextResponse.json(
      { error: "id & contact required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, items, shipping, created_at, customer_name, customer_address")
    .eq("id", id)
    .or(`customer_email.eq.${contact},customer_phone.eq.${contact}`)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan atau email tidak cocok" },
      { status: 404 }
    );
  }

  return NextResponse.json({ order: data });
}
