import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getIntegrationCredential } from "@/lib/integrations/credentials";
import type { OrderStatus } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface NotificationBody {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_id?: string;
  transaction_status?: string;
  fraud_status?: string;
}

function sameSignature(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as NotificationBody | null;
  if (!body?.order_id || !body.status_code || !body.gross_amount || !body.signature_key) {
    return NextResponse.json({ error: "Notification tidak lengkap" }, { status: 400 });
  }
  const credential = await getIntegrationCredential("midtrans");
  const serverKey = credential.secrets.serverKey;
  if (!serverKey) return NextResponse.json({ error: "Midtrans belum dikonfigurasi" }, { status: 503 });
  const expected = createHash("sha512")
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
    .digest("hex");
  if (!sameSignature(body.signature_key, expected)) {
    return NextResponse.json({ error: "Signature tidak valid" }, { status: 401 });
  }

  let status: OrderStatus = "pending";
  if (body.transaction_status === "settlement" || body.transaction_status === "capture") {
    status = body.fraud_status === "challenge" ? "pending" : "paid";
  } else if (["deny", "cancel", "expire", "failure"].includes(body.transaction_status ?? "")) {
    status = "cancelled";
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  const { error } = await supabase.from("orders").update({
    status,
    payment_id: body.transaction_id ?? null,
  }).eq("id", body.order_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
