import { notFound } from "next/navigation";
import ProductDetail from "./_components/ProductDetail";
import { getProductBySlug } from "@/lib/storefront/products";
import type { ProductWithRelations } from "@/types/database";

// ISR: re-fetch produk setiap 60 detik (sinkron dengan homepage).
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Map ProductWithRelations (Supabase) → shape legacy yang dipakai
  // ProductDetail component. Bisa dihapus setelah ProductDetail di-refactor
  // terima shape baru langsung.
  return <ProductDetail product={toDetail(product)} />;
}

function toDetail(p: ProductWithRelations) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category?.name ?? "",
    description: p.description ?? "",
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    variantPrices: p.variant_prices ?? {},
    legacyPrice: p.legacy_price,
    isPreorder: p.is_preorder,
    preorderDays: p.preorder_days,
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    images: (p.images ?? []).map((img) => img.url).filter(Boolean),
    rating: p.rating ?? 0,
    reviewsCount: p.reviews_count ?? 0,
  };
}
