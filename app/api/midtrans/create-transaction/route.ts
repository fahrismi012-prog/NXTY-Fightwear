import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import midtransClient from "midtrans-client";
import type { CartItem, Customer } from "@/types";
import { getProductById } from "@/lib/storefront/products";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentCustomerUser } from "@/lib/supabase/server-auth";
import { getIntegrationCredential } from "@/lib/integrations/credentials";
import { getPaymentMode, getShippingMode, getManualShippingFee } from "@/lib/storefront/settings";
import { getRates } from "@/lib/shipping/everpro";
import { saveCheckoutAddress } from "@/lib/customer/save-address";

interface RequestBody {
  customer: Customer;
  items: CartItem[];
  shipping?: { courier: string; service: string; rateCode?: string; cost: number; etd?: string } | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    if ((await getPaymentMode()) !== "gateway") {
      return NextResponse.json({ error: "Pembayaran otomatis sedang tidak aktif" }, { status: 409 });
    }

    // Validation
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart tidak boleh kosong" },
        { status: 400 }
      );
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
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Recalculate prices server-side from products.json (never trust frontend price)
    const itemDetails: {
      id: string;
      price: number;
      quantity: number;
      name: string;
    }[] = [];
    const orderItems: Array<Record<string, unknown>> = [];
    let grossAmount = 0;
    let totalWeight = 0;

    for (const cartItem of body.items) {
      const product = await getProductById(cartItem.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produk tidak ditemukan: ${cartItem.productId}` },
          { status: 400 }
        );
      }
      if (!product.in_stock) {
        return NextResponse.json(
          { error: `Produk sudah habis: ${product.name}` },
          { status: 400 }
        );
      }
      const price = product.price;
      const quantity = Math.max(1, Math.floor(cartItem.quantity || 1));
      const lineTotal = price * quantity;
      grossAmount += lineTotal;
      totalWeight += Math.max(1, product.weight_grams || 500) * quantity;

      itemDetails.push({
        id: cartItem.productId,
        price,
        quantity,
        name: `${product.name} (${cartItem.size}, ${cartItem.color})`,
      });
      orderItems.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.url ?? "",
        price,
        quantity,
        size: cartItem.size,
        color: cartItem.color,
      });
    }

    // Unique order ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const orderId = `NXTY-${timestamp}-${random}`;

    const shippingMode = await getShippingMode();
    let shippingCost = 0;
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
      shippingCost = selected.cost;
      shipping = { ...selected, weight: totalWeight };
      grossAmount += shippingCost;
      itemDetails.push({ id: "SHIPPING", price: shippingCost, quantity: 1, name: `Ongkir ${selected.courier} ${selected.service}` });
    } else {
      shippingCost = await getManualShippingFee(customer.province);
      grossAmount += shippingCost;
      if (shippingCost > 0) {
        itemDetails.push({ id: "SHIPPING", price: shippingCost, quantity: 1, name: "Ongkir" });
      }
    }

    // Midtrans config
    const midtrans = await getIntegrationCredential("midtrans");
    const serverKey = midtrans.secrets.serverKey;
    if (!serverKey) {
      return NextResponse.json(
        { error: "Server key tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    const snap = new midtransClient.Snap({
      isProduction: midtrans.environment === "production",
      serverKey: serverKey,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customer.name.split(" ")[0],
        last_name: customer.name.split(" ").slice(1).join(" ") || undefined,
        email: customer.email,
        phone: customer.phone,
        billing_address: {
          first_name: customer.name.split(" ")[0],
          last_name: customer.name.split(" ").slice(1).join(" ") || undefined,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          country_code: "IDN",
        },
        shipping_address: {
          first_name: customer.name.split(" ")[0],
          last_name: customer.name.split(" ").slice(1).join(" ") || undefined,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          country_code: "IDN",
        },
      },
    };

    const transaction = await snap.createTransaction(parameter);

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
    }
    const currentUser = await getCurrentCustomerUser();
    const customerAddress = JSON.stringify({
      recipient_name: customer.name,
      phone: customer.phone,
      street: customer.address,
      city: customer.city,
      province: customer.province ?? "",
      postal_code: customer.postalCode ?? "",
    });
    const { error: insertError } = await supabase.from("orders").insert({
      id: orderId,
      customer_id: currentUser?.id ?? null,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customerAddress,
      notes: customer.notes ?? null,
      subtotal: grossAmount - shippingCost,
      shipping_cost: shippingCost,
      total: grossAmount,
      status: "pending",
      items: orderItems,
      shipping,
      payment_id: transaction.token,
      payment_method: "gateway",
      shipping_method_used: shippingMode,
    });
    if (insertError) {
      console.error("Midtrans order insert error:", insertError);
      return NextResponse.json({ error: "Transaksi dibuat tetapi order gagal disimpan" }, { status: 500 });
    }

    if (currentUser) {
      await saveCheckoutAddress(supabase, currentUser.id, customer);
    }

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error("Midtrans error:", error);
    return NextResponse.json(
      { error: "Gagal membuat transaksi. Coba lagi." },
      { status: 500 }
    );
  }
}
