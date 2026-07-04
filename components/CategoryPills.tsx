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
      {/* Grid compact ala quick-category mobile: tetap 3 kolom pada layar
          kecil agar label 14px terbaca, lalu 6 kolom pada layar lebar. */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {/* Tombol "Semua" */}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex min-h-[52px] items-center justify-center px-2.5 py-2 sm:min-h-[48px]",
            "rounded-[6px] border transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-1",
            activeCategory === null
              ? "bg-brand-black border-brand-black text-white shadow-[2px_2px_0_black]"
              : "bg-surface-1 border-border-subtle text-brand-black hover:border-brand-black"
          )}
        >
          <span className="text-center text-sm font-bold leading-[1.2]">
            Semua
          </span>
        </button>

        {/* Kategori */}
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "flex min-h-[52px] items-center justify-center px-2.5 py-2 sm:min-h-[48px]",
              "rounded-[6px] border transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-1",
              activeCategory === cat
                ? "bg-brand-black border-brand-black text-white shadow-[2px_2px_0_black]"
                : "bg-surface-1 border-border-subtle text-brand-black hover:border-brand-black"
            )}
          >
            <span className="line-clamp-2 break-words text-center text-sm font-bold leading-[1.2]">
              {cat}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
