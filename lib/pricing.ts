import type { PriceTier } from "@/types/database";

interface PricedProduct {
  price: number;
  variant_prices?: Record<string, number> | null;
  legacy_price?: number | null;
}

/** Key format dipakai di `variant_prices`: "size|color" (sisi kosong kalau tidak ada). */
export function variantKey(size?: string, color?: string): string {
  return `${size ?? ""}|${color ?? ""}`;
}

/** Harga untuk kombinasi size/color, fallback ke harga dasar produk. */
export function getVariantPrice(
  product: PricedProduct,
  size?: string,
  color?: string,
): number {
  const override = product.variant_prices?.[variantKey(size, color)];
  return typeof override === "number" ? override : product.price;
}

/**
 * Harga final yang dilihat/dibayar customer: harga variasi, ditimpa
 * harga legacy kalau customer tier "legacy" dan produk punya legacy_price.
 */
export function resolvePrice(
  product: PricedProduct,
  size: string | undefined,
  color: string | undefined,
  tier: PriceTier | null | undefined,
): number {
  if (tier === "legacy" && typeof product.legacy_price === "number") {
    return product.legacy_price;
  }
  return getVariantPrice(product, size, color);
}
