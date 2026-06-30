"use client";

import { cn } from "@/lib/utils";

// Icon mapping per kategori
const CATEGORY_ICONS: Record<string, string> = {
  "Pencak Silat": "🥋",
  "Taekwondo":    "🦵",
  "Karate":       "✊",
  "Muaythai":     "🥊",
  "Boxing":       "🥊",
  "Matras":       "🟩",
};

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
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
            activeCategory === null
              ? "bg-brand-green border-brand-green text-white"
              : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-green hover:text-brand-green"
          )}
        >
          <span className="text-xl leading-none">🛒</span>
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
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
              activeCategory === cat
                ? "bg-brand-green border-brand-green text-white"
                : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-green hover:text-brand-green"
            )}
          >
            <span className="text-xl leading-none">
              {CATEGORY_ICONS[cat] ?? "📦"}
            </span>
            <span className="text-[11px] font-semibold leading-tight text-center line-clamp-2">
              {cat}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
