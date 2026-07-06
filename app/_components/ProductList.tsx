"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { Search } from "lucide-react";
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
  const [sortBy, setSortBy] = useState("default");

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

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    updateParam("q", query || null);
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
  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    if (sortBy === "price-asc") return sorted.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") return sorted.sort((a, b) => b.price - a.price);
    if (sortBy === "name") return sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, sortBy]);

  return (
    <main id="catalog" className="pb-20 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-7">
        <section aria-labelledby="catalog-heading" className="border-b border-neutral-200 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Eyebrow color="red" className="mb-1">Katalog</Eyebrow>
              <h2 id="catalog-heading" className="text-2xl font-black tracking-tight text-black sm:text-3xl">
                {headingText}
              </h2>
              <p className="mt-1 text-xs font-medium text-text-muted">
                {products.length} produk{isPending ? " · memuat…" : ""}
              </p>
            </div>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={isPending}>
                Atur Ulang
              </Button>
            )}
          </div>

          <form onSubmit={handleSearch} role="search" className="relative mt-5 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <input
              key={initialQuery}
              name="q"
              type="search"
              defaultValue={initialQuery}
              placeholder="Cari produk"
              aria-label="Cari produk"
              className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </form>

          <div className="mt-4">
            <CategoryPills
              categories={categories.map((c) => c.name)}
              activeCategory={initialCategory}
              onSelect={handleCategorySelect}
            />
          </div>
        </section>

        <div className="flex items-center justify-between gap-4 py-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Produk
          </p>
          <label className="flex items-center gap-2 text-xs font-bold text-black">
            <span>Sortir</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            >
              <option value="default">Rekomendasi</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="name">Nama A–Z</option>
            </select>
          </label>
        </div>

        {/* Product grid */}
        <ProductGrid products={sortedProducts} />
      </div>
    </main>
  );
}
