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
      {/* Grid 3 kolom — semua kategori langsung terlihat */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {/* Tombol "Semua" */}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5",
            "py-3 px-2 rounded-card border transition-all min-h-[72px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black",
            activeCategory === null
              ? "bg-brand-black border-brand-black text-white"
              : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-black hover:text-brand-black"
          )}
        >
          <span className="text-[11px] font-semibold leading-tight text-center">
            Semua
          </span>
        </button>

        {/* Kategori */}
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5",
              "py-3 px-2 rounded-card border transition-all min-h-[72px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black",
              activeCategory === cat
                ? "bg-brand-black border-brand-black text-white"
                : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-black hover:text-brand-black"
            )}
          >
            <span className="text-[11px] font-semibold leading-tight text-center line-clamp-2">
              {cat}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
