"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import productsData from "@/data/products.json";
import promotionsData from "@/data/promotions.json";
import type { Product, Promotion } from "@/types";
import HeroSection from "@/components/HeroSection";
import BrandIntroSection from "@/components/BrandIntroSection";
import CategoryPills from "@/components/CategoryPills";
import ProductGrid from "@/components/ProductGrid";
import ScrollToTop from "@/components/ScrollToTop";
import BannerCarousel from "@/components/BannerCarousel";
import FlashSaleSection from "@/components/FlashSaleSection";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

const PROMO_MARQUEE = [
  "Premium Gear",
  "Fast Shipping",
  "100% Authentic",
  "Fight Spirit",
  "Indonesian Brand",
  "Limited Drop",
];

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams?.get("q") ?? "";
    const cat = searchParams?.get("category");
    setSearchQuery(q);
    setActiveCategory(cat || null);
  }, [searchParams]);

  const categories = useMemo(() => {
    const set = new Set(productsData.products.map((p) => p.category));
    return Array.from(set).sort();
  }, []);

  const filteredProducts = useMemo<Product[]>(() => {
    let result = productsData.products;
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, activeCategory]);

  const banners: Promotion[] = useMemo(
    () =>
      (promotionsData.promotions as Promotion[]).filter((p) => p.type === "banner"),
    []
  );

  const flashSales: Promotion[] = useMemo(
    () =>
      (promotionsData.promotions as Promotion[]).filter((p) => p.type === "flash_sale"),
    []
  );

  return (
    <div className="min-h-screen bg-canvas">
      <ScrollToTop />
      <HeroSection />
      <BrandIntroSection />

      {/* Marquee promo strip */}
      <div
        id="categories"
        className="bg-brand-red text-white overflow-hidden"
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

      <main id="catalog" className="pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 pt-8 space-y-10">
          {/* Banner carousel */}
          {banners.length > 0 && (
            <BannerCarousel banners={banners} />
          )}

          {/* Flash sales */}
          {flashSales.map((fs) => (
            <FlashSaleSection key={fs.id} promotion={fs} />
          ))}

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-border-subtle">
            <div>
              <Eyebrow color="red" className="mb-1">
                Katalog
              </Eyebrow>
              <h2 className="text-heading-1 font-bold text-text-primary">
                {activeCategory || "Semua Produk"}
              </h2>
              <p className="text-body-sm text-text-muted mt-1">
                {filteredProducts.length} produk ditemukan
              </p>
            </div>
            {(searchQuery || activeCategory) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
              >
                Atur Ulang
              </Button>
            )}
          </div>

          {/* Category pills */}
          <section>
            <CategoryPills
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </section>

          {/* Product grid */}
          <ProductGrid products={filteredProducts} />
        </div>
      </main>
    </div>
  );
}
