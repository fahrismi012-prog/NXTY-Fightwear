import { Suspense } from "react";
import { Factory, ShieldCheck, Truck } from "lucide-react";
import BannerCarousel from "@/components/BannerCarousel";
import BrandIntroSection from "@/components/BrandIntroSection";
import ScrollToTop from "@/components/ScrollToTop";
import { TrustStrip } from "@/components/TrustStrip";
import ProductList from "./_components/ProductList";
import { getProducts, getPromotions } from "@/lib/storefront/products";
import type { ProductWithRelations } from "@/types/database";
import type { Product as LegacyProduct } from "@/types";

// ISR: re-fetch data setiap 60 detik di Vercel. Perubahan admin di Supabase
// akan ter-reflect di website maksimal 60 detik kemudian (bisa di-tune).
// Set ke 0 untuk selalu fresh (cost lebih tinggi). Set ke `false` untuk
// pure static (data hanya berubah saat redeploy).
export const revalidate = 60;

const TRUST_ITEMS = [
  {
    icon: <Factory className="w-5 h-5" />,
    label: "Produksi Pabrik Sendiri",
    description: "Harga pabrik, kualitas terkontrol",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    label: "100% Original",
    description: "Kualitas premium terjamin",
  },
  {
    icon: <Truck className="w-5 h-5" />,
    label: "Kirim ke Seluruh Indonesia",
    description: "Pengiriman cepat & aman",
  },
];

// Urutan kategori yang diprioritaskan sesuai permintaan klien.
// Match berdasarkan slug (stabil & ternormalisasi server) — nama kategori
// bebas ditulis ulang admin tanpa merusak urutan ini.
// ponytail: hardcoded per klien; pindah ke kolom display_order di admin
// kalau sudah multi-klien.
const PRIORITY_SLUGS = [
  "pencak-silat",
  "tae-kwon-do",
  "karate",
  "muay-thai",
  "boxing",
  "matras",
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
  const priorityCats = PRIORITY_SLUGS.map((slug) =>
    allCategories.find((c) => c.slug === slug),
  ).filter((c): c is { name: string; slug: string } => Boolean(c));
  const restCats = allCategories
    .filter((c) => !PRIORITY_SLUGS.includes(c.slug))
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

  const heroBanners = promotions.filter(
    (p) => p.type === "banner" && p.image,
  );

  return (
    <div className="min-h-screen bg-canvas">
      <ScrollToTop />
      {/* Hero: slider foto dari promo banner admin; kalau belum ada banner,
          fallback ke hero teks brand supaya home tidak tanpa kepala. */}
      {heroBanners.length > 0 ? (
        <BannerCarousel banners={heroBanners} />
      ) : (
        <BrandIntroSection />
      )}

      {/* Trust strip tipis (pengganti marquee) */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <TrustStrip items={TRUST_ITEMS} variant="compact" />
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
