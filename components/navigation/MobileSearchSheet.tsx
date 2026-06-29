"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Sheet, Button, Eyebrow, Input } from "@/components/ui";
import { useUI } from "@/contexts/UIContext";

/**
 * MobileSearchSheet — search overlay untuk mobile.
 *
 * Direfaktor dari components/MobileSearchSheet.tsx lama ke pakai UI primitives
 * baru. Trigger via useUI().openSearch().
 */

const POPULAR_TERMS = ["Sarung Tinju", "Hand Wrap", "Matras", "Deker"];

export function MobileSearchSheet() {
  const { searchOpen, closeSearch } = useUI();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus saat dibuka
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const handleClose = () => {
    setQuery("");
    closeSearch();
  };

  const navigateTo = (term: string) => {
    const q = term.trim();
    if (!q) return;
    setQuery("");
    closeSearch();
    router.push(`/?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(query);
  };

  return (
    <Sheet
      open={searchOpen}
      onClose={handleClose}
      side="bottom"
      size="full"
      title="Cari Produk"
    >
      <div className="px-4 py-3">
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
                  className="pointer-events-auto inline-flex items-center justify-center w-7 h-7 text-text-muted hover:text-white rounded-subtle"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </form>

        <div className="mt-6">
          <Eyebrow className="mb-3">Populer</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => navigateTo(term)}
                className="px-3.5 py-2 bg-surface-1 hover:bg-surface-2 border border-border-subtle hover:border-border-default text-body-sm text-text-primary rounded-subtle transition-colors duration-fast min-h-[40px]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-8"
          onClick={() => navigateTo(query)}
          disabled={!query.trim()}
        >
          Cari
        </Button>
      </div>
    </Sheet>
  );
}

export default MobileSearchSheet;
