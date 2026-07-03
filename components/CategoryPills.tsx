"use client";

import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryPills({
  categories,
  activeCategory,
  onSelect,
}: CategoryPillsProps) {
  return (
    <div className="w-full">
      {/* Grid 3 kolom (mobile) / 6 kolom (sm+) — semua kategori langsung terlihat.
          Mobile: padding lebih besar supaya kotak lebih visible & tap-friendly.
          Desktop: padding lebih compact karena grid lebih lebar. */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-2">
        {/* Tombol "Semua" */}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex flex-col items-center justify-center",
            "py-4 sm:py-3 px-2 rounded-subtle border transition-all duration-150 min-h-[88px] sm:min-h-[72px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-1",
            activeCategory === null
              ? "bg-brand-black border-brand-black text-white shadow-[2px_2px_0_black]"
              : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-black hover:text-brand-black"
          )}
        >
          <span className="text-[10px] sm:text-[10px] font-semibold leading-tight text-center tracking-wide">
            Semua
          </span>
        </button>

        {/* Kategori */}
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "flex flex-col items-center justify-center",
              "py-4 sm:py-3 px-2 rounded-subtle border transition-all duration-150 min-h-[88px] sm:min-h-[72px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-1",
              activeCategory === cat
                ? "bg-brand-black border-brand-black text-white shadow-[2px_2px_0_black]"
                : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-black hover:text-brand-black"
            )}
          >
            <span className="text-[10px] font-semibold leading-tight text-center line-clamp-2 tracking-wide px-0.5">
              {cat}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
