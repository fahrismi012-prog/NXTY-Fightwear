import { NextResponse } from "next/server";
import { getProducts } from "@/lib/storefront/products";
import type { ProductWithRelations } from "@/types/database";

/**
 * GET /api/storefront/search?q=keyword
 *
 * Returns up to 8 matching products from Supabase untuk search suggestion.
 * Dipakai oleh SearchModal.
 *
 * Cache: revalidate setiap 60 detik (sinkron dengan homepage ISR).
 */
export const revalidate = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Number(url.searchParams.get("limit") ?? "8");

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const products = await getProducts();

  const matches = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q),
  );

  const results = matches.slice(0, Math.min(Math.max(limit, 1), 50)).map(toLegacyShape);

  return NextResponse.json({ results });
}

function toLegacyShape(p: ProductWithRelations) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category?.name ?? "",
    description: p.description ?? "",
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    images: (p.images ?? []).map((img) => img.url).filter(Boolean),
    rating: p.rating ?? 0,
    reviewsCount: p.reviews_count ?? 0,
  };
}
