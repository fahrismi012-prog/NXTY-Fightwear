import { NextRequest, NextResponse } from "next/server";
import { getRates, type Rate } from "@/lib/shipping/everpro";
import { getProductById } from "@/lib/storefront/products";
import { getShippingMode } from "@/lib/storefront/settings";
import type { CartItem } from "@/types";

interface RateRequest {
  destination: string; // city or postal code
  weight?: number; // grams
  items?: CartItem[];
  courier?: string; // optional specific courier
}

/**
 * POST /api/shipping/rates
 * Hitung ongkir dari Everpro berdasarkan kota tujuan & berat.
 * Digunakan di checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RateRequest;
    if ((await getShippingMode()) !== "auto") {
      return NextResponse.json({ error: "Pengiriman otomatis sedang tidak aktif" }, { status: 409 });
    }
    if (!body.destination) {
      return NextResponse.json(
        { error: "destination required" },
        { status: 400 }
      );
    }
    let weight = Math.max(0, Number(body.weight) || 0);
    if (Array.isArray(body.items) && body.items.length > 0) {
      weight = 0;
      for (const item of body.items) {
        const product = await getProductById(item.productId);
        if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 400 });
        weight += Math.max(1, product.weight_grams || 500) * Math.max(1, item.quantity || 1);
      }
    }
    if (weight <= 0) return NextResponse.json({ error: "Berat paket tidak valid" }, { status: 400 });

    // Origin = alamat toko (Lembang, Bandung Barat). Bisa di-hardcode atau dari env.
    const origin = "";
    const rates = await getRates({
      origin,
      destination: body.destination,
      weight,
      courier: body.courier,
    });

    return NextResponse.json({ rates, weight });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Rates API error:", message);
    return NextResponse.json(
      { error: "Gagal menghitung ongkir", detail: message },
      { status: 500 }
    );
  }
}

// Re-export type
export type { Rate };
