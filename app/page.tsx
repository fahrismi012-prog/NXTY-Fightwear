import { Suspense } from "react";
import BrandIntroSection from "@/components/BrandIntroSection";
import ScrollToTop from "@/components/ScrollToTop";
import ProductList from "./_components/ProductList";
import { getProducts, getPromotions } from "@/lib/storefront/products";
import type { ProductWithRelations } from "@/types/database";
import type { Product as LegacyProduct } from "@/types";

// ISR: re-fetch data setiap 60 detik di Vercel. Perubahan admin di Supabase
// akan ter-reflect di website maksimal 60 detik kemudian (bisa di-tune).
// Set ke 0 untuk selalu fresh (cost lebih tinggi). Set ke `false` untuk
// pure static (data hanya berubah saat redeploy).
export const revalidate = 60;

const PROMO_MARQUEE = [
  "Kualitas Premium",
  "Pengiriman Cepat",
  "100% Original",
  "Produksi Pabrik Sendiri",
  "Brand Indonesia",
  "Harga Pabrik",
];

// Urutan kategori yang diprioritaskan sesuai permintaan klien
const PRIORITY_CATEGORIES = [
  "Pencak Silat",
  "Taekwondo",
  "Karate",
  "Muaythai",
  "Boxing",
  "Matras",
];

interface PageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params?.category ?? null;
  const q = params?.q ?? "";

  // Fetch dari Supabase (atau fallback ke JSON kalau env belum diset).
  // getProducts() sudah cache-aware via Next.js fetch cache + revalidate.
  const [allProducts, promotions] = await Promise.all([
    getProducts(),
    getPromotions(),
  ]);

  // Extract unique categories dari produk
  const categoryMap = new Map<string, { name: string; slug: string }>();
  for (const p of allProducts) {
    if (p.category && !categoryMap.has(p.category.slug)) {
      categoryMap.set(p.category.slug, {
        name: p.category.name,
        slug: p.category.slug,
      });
    }
  }
  const allCategories = Array.from(categoryMap.values());

  // Priority order: tampilkan priority duluan dalam urutan yang ditentukan,
  // lalu sisanya alfabet
  const priorityCats = PRIORITY_CATEGORIES.map((name) =>
    allCategories.find((c) => c.name === name),
  ).filter((c): c is { name: string; slug: string } => Boolean(c));
  const restCats = allCategories
    .filter((c) => !PRIORITY_CATEGORIES.includes(c.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const categories = [...priorityCats, ...restCats];

  // Filter di server
  let products: ProductWithRelations[] = allProducts;
  if (category) {
    products = products.filter(
      (p) => p.category?.slug === category || p.category?.name === category,
    );
  }
  if (q.trim()) {
    const lower = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.category?.name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower),
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <ScrollToTop />
      <BrandIntroSection />

      {/* Marquee promo strip */}
      <div
        id="categories"
        className="bg-brand-black text-white overflow-hidden border-t border-white/15"
      >
        <div className="flex animate-marquee whitespace-nowrap py-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {PROMO_MARQUEE.map((t, j) => (
                <span
                  key={j}
                  className="px-6 text-body-sm font-semibold flex items-center gap-6"
                >
                  {t}
                  <span className="text-canvas/40">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Suspense fallback={null}>
        <ProductList
          products={toLegacyProducts(products)}
          categories={categories}
          initialCategory={category}
          initialQuery={q}
          promotions={promotions}
        />
      </Suspense>
    </div>
  );
}

// Map ProductWithRelations (Supabase shape) ke legacy Product (yang dipakai
// ProductGrid/ProductCard saat ini). Bisa dihapus setelah ProductGrid
// di-refactor untuk terima shape baru langsung.
function toLegacyProducts(items: ProductWithRelations[]): LegacyProduct[] {
  return items.map((p) => ({
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
    featured: p.featured,
    inStock: p.in_stock,
  }));
}
