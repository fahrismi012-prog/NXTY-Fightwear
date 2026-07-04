import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getIntegrationCredential } from "@/lib/integrations/credentials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TrackingCallback {
  awb_number?: string;
  client_order_no?: string;
  tracking_code?: string;
  cancel_reason?: string;
}

export async function POST(request: NextRequest) {
  const credential = await getIntegrationCredential("everpro");
  const expected = credential.secrets.callbackSecret;
  const received = request.headers.get("x-everpro-key") ?? "";
  if (!expected || received !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null) as TrackingCallback | null;
  if (!body?.client_order_no || !body.tracking_code) {
    return NextResponse.json({ error: "Callback tidak lengkap" }, { status: 400 });
  }
  const code = body.tracking_code.toUpperCase();
  const status = code === "DELIVERED"
    ? "delivered"
    : ["CANCELED", "REJECTED"].includes(code)
      ? "cancelled"
      : "shipped";
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  const { data: order } = await supabase
    .from("orders")
    .select("shipping")
    .eq("id", body.client_order_no)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  const shipping = {
    ...((order.shipping ?? {}) as Record<string, unknown>),
    waybill: body.awb_number ?? (order.shipping as Record<string, unknown> | null)?.waybill,
    trackingCode: code,
    cancelReason: body.cancel_reason ?? null,
    updatedAt: new Date().toISOString(),
  };
  const { error } = await supabase.from("orders").update({ status, shipping }).eq("id", body.client_order_no);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
