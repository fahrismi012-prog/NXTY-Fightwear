import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "payment-proofs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/upload-proof
 *
 * Customer upload bukti transfer untuk order dengan payment_method=manual.
 * Hanya boleh:
 * - Order milik customer sendiri (auth check via session cookie user)
 * - Order dengan payment_method = 'manual'
 * - Order status = 'awaiting_payment' (belum pernah upload)
 *
 * Effect: status 'awaiting_payment' -> 'awaiting_confirmation'.
 *
 * File disimpan di storage bucket 'payment-proofs' (private) dengan
 * path: {order_id}/{uuid}.{ext}
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // Auth check (untuk guest order, identifier order_id saja sudah cukup)
  const user = await getCurrentCustomerUser();
  // Guest order (customer_id NULL) tidak butuh auth — order_id adalah identifier
  // Order dengan customer_id butuh login + ownership match

  // Validate order
  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, customer_id, customer_email, payment_method, status, payment_proof_url")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  // Untuk order dengan customer_id (linked user), wajib login + ownership match
  if (order.customer_id) {
    if (!user) {
      return NextResponse.json(
        { error: "Anda harus login untuk upload bukti pesanan ini" },
        { status: 401 },
      );
    }
    const isOwner =
      order.customer_id === user.id ||
      (order.customer_email && order.customer_email === user.email);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Anda tidak punya akses ke pesanan ini" },
        { status: 403 },
      );
    }
  }

  // Validasi payment method
  if (order.payment_method !== "manual") {
    return NextResponse.json(
      { error: "Pesanan ini bukan mode pembayaran manual" },
      { status: 400 },
    );
  }

  // Validasi status
  if (order.status !== "awaiting_payment") {
    return NextResponse.json(
      { error: `Tidak bisa upload bukti dari status '${order.status}'` },
      { status: 400 },
    );
  }

  // Validasi belum pernah upload
  if (order.payment_proof_url) {
    return NextResponse.json(
      { error: "Bukti transfer sudah pernah di-upload" },
      { status: 400 },
    );
  }

  // Parse multipart upload
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Body harus multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Field 'file' wajib diisi" },
      { status: 400 },
    );
  }
  if (file.size <= 0) {
    return NextResponse.json({ error: "File kosong" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 5MB" },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipe file harus JPEG, PNG, atau WebP" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "bin";
  const filename = `${randomUUID()}.${safeExt}`;
  // Path: {order_id}/{filename} — biar RLS-friendly (customer scoped by order)
  const path = `${id}/${filename}`;

  // Upload ke storage (pakai service_role untuk bypass RLS — admin client)
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("[upload-proof] storage error:", uploadError);
    return NextResponse.json(
      { error: `Upload gagal: ${uploadError.message}` },
      { status: 500 },
    );
  }

  // Update order dengan proof URL + status awaiting_confirmation
  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      payment_proof_url: path, // Simpan path saja (bukan full URL karena private)
      status: "awaiting_confirmation",
    })
    .eq("id", id);

  if (updateError) {
    console.error("[upload-proof] update error:", updateError);
    return NextResponse.json(
      { error: `Gagal update pesanan: ${updateError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, proofPath: path });
}
