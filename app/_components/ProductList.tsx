"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryPills from "@/components/CategoryPills";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Product as LegacyProduct } from "@/types";
import type { Promotion } from "@/types/database";

interface CategoryLite {
  name: string;
  slug: string;
}

interface ProductListProps {
  products: LegacyProduct[];
  categories: CategoryLite[];
  initialCategory: string | null;
  initialQuery: string;
  promotions?: Promotion[];
}

/**
 * Client Component untuk daftar produk + filter interaktif.
 *
 * Filter dilakukan via URL params (`?category=...&q=...`) — Server Component
 * `app/page.tsx` baca searchParams dan pass hasil filter ke sini. Klik
 * CategoryPills atau tombol "Atur Ulang" trigger `router.replace()` yang
 * me-re-render Server Component dengan filter baru. Begitu setState in
 * effect dihindari (idiomatic Next.js App Router).
 */
export default function ProductList({
  products,
  categories,
  initialCategory,
  initialQuery,
  promotions: _promotions,
}: ProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = (key: "category" | "q", value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    });
  };

  const handleCategorySelect = (category: string | null) => {
    updateParam("category", category);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("q");
    params.delete("category");
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    });
  };

  const hasFilter = Boolean(initialCategory || initialQuery);
  const headingText = initialCategory || "Semua Produk";

  return (
    <main id="catalog" className="pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-border-subtle">
          <div>
            <Eyebrow color="red" className="mb-1">
              Katalog
            </Eyebrow>
            <h2 className="text-heading-1 font-bold text-text-primary">
              {headingText}
            </h2>
            <p className="text-body-sm text-text-muted mt-1">
              {products.length} produk ditemukan
              {isPending ? " (memuat…)" : ""}
            </p>
          </div>
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
            >
              Atur Ulang
            </Button>
          )}
        </div>

        {/* Category pills */}
        <section>
          <CategoryPills
            categories={categories.map((c) => c.name)}
            activeCategory={initialCategory}
            onSelect={handleCategorySelect}
          />
        </section>

        {/* Product grid */}
        <ProductGrid products={products} />
      </div>
    </main>
  );
}
