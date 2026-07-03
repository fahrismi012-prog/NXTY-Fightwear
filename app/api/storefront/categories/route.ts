import { NextResponse } from "next/server";
import { getProducts } from "@/lib/storefront/products";

/**
 * GET /api/storefront/categories
 *
 * Returns list kategori + thumbnail produk pertama per kategori.
 * Dipakai oleh MegaMenuSheet untuk sync dengan database Supabase.
 *
 * Cache: revalidate setiap 60 detik (sinkron dengan homepage ISR).
 */
export const revalidate = 60;

export async function GET() {
  const products = await getProducts();

  const map = new Map<string, { category: string; thumbnail: string | null }>();
  for (const p of products) {
    if (!p.category) continue;
    if (map.has(p.category.name)) continue;
    map.set(p.category.name, {
      category: p.category.name,
      thumbnail: (p.images ?? []).map((img) => img.url).find(Boolean) ?? null,
    });
  }

  const categories = Array.from(map.values()).map(
    ({ category, thumbnail }) => ({
      category,
      thumbnail,
      href: `/?category=${encodeURIComponent(category)}`,
    }),
  );

  return NextResponse.json({ categories });
}
