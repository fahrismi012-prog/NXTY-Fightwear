"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Sheet from "./Sheet";

interface MobileSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchSheet({
  isOpen,
  onClose,
}: MobileSearchSheetProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus saat dibuka
  useEffect(() => {
    if (isOpen) {
      // Delay agar transition selesai
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (q) {
      onClose();
      router.push(`/?q=${encodeURIComponent(q)}`);
    }
  };

  const popularTerms = ["Sarung Tinju", "Hand Wrap", "Matras", "Deker"];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} fullHeight title="Cari Produk">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <label htmlFor="mobile-search-input" className="sr-only">
            Cari produk
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#dc2626]"
              size={20}
            />
            <input
              ref={inputRef}
              id="mobile-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-[#161616] text-white text-base pl-11 pr-11 py-3 border-2 border-[#262626] focus:border-[#dc2626] focus:outline-none placeholder:text-neutral-600 min-h-[48px]"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-[#dc2626]"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>

        <div className="mt-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-3">
            // Populer
          </p>
          <div className="flex flex-wrap gap-2">
            {popularTerms.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  onClose();
                  router.push(`/?q=${encodeURIComponent(term)}`);
                }}
                className="px-3 py-2 border-2 border-[#262626] text-xs font-black uppercase tracking-wider text-neutral-300 hover:border-[#dc2626] hover:text-[#dc2626] transition-colors min-h-[40px]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!query.trim()}
          className="w-full mt-8 py-3.5 bg-[#dc2626] text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#dc2626] disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors min-h-[48px]"
        >
          Cari
        </button>
      </div>
    </Sheet>
  );
}
