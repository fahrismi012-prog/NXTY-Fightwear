import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";
import { getProductById } from "@/lib/storefront/products";
import { getActiveBankAccounts, getShippingManualFee, getShippingMode } from "@/lib/storefront/settings";
import type { CartItem, Customer } from "@/types";
import { getRates } from "@/lib/shipping/everpro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  customer: Customer;
  items: CartItem[];
  shipping?: { courier: string; service: string; rateCode?: string; cost: number; etd?: string } | null;
}

/**
 * POST /api/orders/create-manual
 *
 * Buat order di Supabase untuk mode pembayaran MANUAL.
 * - Insert ke tabel `orders` dengan status `awaiting_payment`
 * - Set `payment_method = 'manual'`, `bank_account_id` (first active)
 * - Set `payment_expires_at` (now + expire hours dari setting)
 * - Shipping cost = 0 (akan di-set admin nanti untuk mode manual)
 * - Return orderId untuk redirect ke /payment/pending
 *
 * Public endpoint (no auth) — guest checkout OK.
 */
export async function POST(request: NextRequest) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  // Validation
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart tidak boleh kosong" }, { status: 400 });
  }
  const customer = body.customer;
  if (
    !customer?.name?.trim() ||
    !customer?.email?.trim() ||
    !customer?.phone?.trim() ||
    !customer?.address?.trim() ||
    !customer?.city?.trim()
  ) {
    return NextResponse.json(
      { error: "Data customer tidak lengkap" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // Kalau user login, link order ke customer_id supaya muncul di "Pesanan Saya".
  // Guest checkout (no session) tetap boleh — customer_id = null.
  const currentUser = await getCurrentCustomerUser();

  // Recompute items server-side (never trust frontend price)
  const validatedItems: Array<{
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
  }> = [];

  let subtotal = 0;
  let totalWeight = 0;
  for (const ci of body.items) {
    const product = await getProductById(ci.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Produk tidak ditemukan: ${ci.productId}` },
        { status: 400 },
      );
    }
    const qty = Math.max(1, Math.floor(ci.quantity || 1));
    subtotal += product.price * qty;
    totalWeight += Math.max(1, product.weight_grams || 500) * qty;
    validatedItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: (product.images ?? [])[0]?.url ?? "",
      price: product.price,
      quantity: qty,
      size: ci.size,
      color: ci.color,
    });
  }

  // Ambil bank account aktif (untuk info ke customer)
  const bankAccounts = await getActiveBankAccounts();
  if (bankAccounts.length === 0) {
    return NextResponse.json(
      {
        error:
          "Belum ada rekening bank aktif. Silakan tambahkan di admin /admin/settings sebelum customer bisa checkout manual.",
      },
      { status: 400 },
    );
  }
  const primaryBank = bankAccounts[0];

  // Hitung shipping cost (untuk mode manual, fixed fee; tapi admin bisa adjust)
  const shippingMode = await getShippingMode();
  let shippingFee = await getShippingManualFee();
  let shipping: Record<string, unknown> | null = null;
  if (shippingMode === "auto") {
    if (!body.shipping?.courier || !body.shipping.service || !customer.postalCode) {
      return NextResponse.json({ error: "Layanan pengiriman wajib dipilih" }, { status: 400 });
    }
    const rates = await getRates({
      origin: "",
      destination: customer.postalCode,
      weight: totalWeight,
      courier: body.shipping.courier,
    });
    const selected = rates.find((rate) =>
      rate.courier.toLowerCase() === body.shipping!.courier.toLowerCase() &&
      (rate.rateCode === body.shipping!.rateCode || rate.service === body.shipping!.service),
    );
    if (!selected) return NextResponse.json({ error: "Tarif pengiriman sudah tidak tersedia" }, { status: 409 });
    shippingFee = selected.cost;
    shipping = { ...selected, weight: totalWeight };
  }
  const total = subtotal + shippingFee;

  // Payment expires at = now + expire hours dari setting
  const expireHoursSetting = await supabase
    .from("settings")
    .select("value")
    .eq("key", "payment_manual_expire_hours")
    .maybeSingle();
  const expireHours = (() => {
    const n = Number(expireHoursSetting.data?.value);
    return Number.isFinite(n) && n >= 1 ? Math.round(n) : 24;
  })();
  const expiresAt = new Date(Date.now() + expireHours * 3600 * 1000).toISOString();

  // Unique order ID
  const orderId = `NXTY-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  // Customer address (stringified JSON for backward compat)
  const customerAddress = JSON.stringify({
    recipient_name: customer.name,
    phone: customer.phone,
    street: customer.address,
    city: customer.city,
    province: customer.province ?? "",
    postal_code: customer.postalCode ?? "",
  });

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      customer_id: currentUser?.id ?? null, // null = guest; link ke user.id kalau login
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customerAddress,
      notes: customer.notes ?? null,
      subtotal,
      shipping_cost: shippingFee,
      total,
      status: "awaiting_payment",
      items: validatedItems,
      shipping,
      payment_id: null,
      payment_method: "manual",
      payment_proof_url: null,
      payment_expires_at: expiresAt,
      payment_confirmed_at: null,
      payment_confirmed_by: null,
      payment_rejection_reason: null,
      bank_account_id: primaryBank.id,
      shipping_method_used: shippingMode,
      shipping_manual_carrier: null,
      shipping_manual_cost: shippingMode === "manual" ? shippingFee : null,
      shipping_manual_receipt: null,
      shipping_manual_receipt_url: null,
    })
    .select()
    .single();

  if (error) {
    console.error("[orders/create-manual] insert error:", error);
    return NextResponse.json(
      { error: `Gagal membuat pesanan: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ orderId, order }, { status: 201 });
}
