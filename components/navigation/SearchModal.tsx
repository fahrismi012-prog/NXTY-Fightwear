"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Dialog, Eyebrow, Input, PriceTag } from "@/components/ui";
import { useUI } from "@/contexts/UIContext";
import productsData from "@/data/products.json";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/**
 * SearchModal — desktop search overlay dengan real-time suggestion.
 *
 * Pencarian client-side dari products.json. Akan diganti dengan
 * search backend (Algolia/Typesense) di fase production-readiness.
 */

const POPULAR_TERMS = ["Sarung Tinju", "Hand Wrap", "Matras", "Deker"];

export function SearchModal() {
  const { searchModalOpen, closeSearchModal } = useUI();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus saat dibuka
  useEffect(() => {
    if (searchModalOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchModalOpen]);

  // Debounce query 200ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo<Product[]>(() => {
    if (!debounced) return [];
    return (productsData.products as Product[])
      .filter(
        (p) =>
          p.name.toLowerCase().includes(debounced) ||
          p.category.toLowerCase().includes(debounced) ||
          p.description.toLowerCase().includes(debounced)
      )
      .slice(0, 8);
  }, [debounced]);

  const handleClose = () => {
    setQuery("");
    setDebounced("");
    closeSearchModal();
  };

  const navigateTo = (term: string) => {
    const q = term.trim();
    if (!q) return;
    setQuery("");
    setDebounced("");
    closeSearchModal();
    router.push(`/?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(query);
  };

  return (
    <Dialog open={searchModalOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          type="search"
          size="lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari sarung tinju, hand wrap..."
          autoComplete="off"
          inputMode="search"
          aria-label="Cari produk"
          leftIcon={<Search className="w-5 h-5" />}
          rightIcon={
            query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="pointer-events-auto inline-flex items-center justify-center w-7 h-7 text-text-muted hover:text-text-primary rounded-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            ) : undefined
          }
        />
      </form>

      {!debounced ? (
        <div className="mt-6">
          <Eyebrow className="mb-3">Pencarian Populer</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => navigateTo(term)}
                className="px-3.5 py-2 bg-surface-1 hover:bg-surface-2 border border-border-subtle hover:border-border-default text-body-sm text-text-primary rounded-subtle transition-colors duration-fast"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-6 text-center py-8">
          <p className="text-body text-text-secondary">
            Tidak ada hasil untuk{" "}
            <span className="text-text-primary font-semibold">
              &ldquo;{debounced}&rdquo;
            </span>
          </p>
          <p className="text-body-sm text-text-muted mt-1">
            Coba kata kunci lain
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <Eyebrow className="mb-3">
            {results.length} hasil ditemukan
          </Eyebrow>
          <ul className="flex flex-col gap-1">
            {results.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.slug}`}
                  onClick={handleClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5",
                    "hover:bg-surface-1 rounded-card",
                    "transition-colors duration-fast"
                  )}
                >
                  <span className="relative w-12 h-12 shrink-0 bg-surface-2 rounded-subtle overflow-hidden">
                    <Image
                      src={p.images[0]}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-body font-medium text-text-primary truncate">
                      {p.name}
                    </span>
                    <span className="block text-body-sm text-text-muted">
                      {p.category}
                    </span>
                  </span>
                  <PriceTag price={p.price} size="md" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Dialog>
  );
}

export default SearchModal;
