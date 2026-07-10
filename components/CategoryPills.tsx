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
  const items = [{ label: "Semua", value: null }, ...categories.map((category) => ({
    label: category,
    value: category,
  }))];

  return (
    <div className="relative min-w-0">
      <div className="flex gap-2 overflow-x-auto pb-1 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ label, value }) => {
          const isActive = activeCategory === value;

          return (
            <button
              key={label}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(value)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2",
                isActive
                  ? "border-brand-black bg-brand-black text-white"
                  : "border-neutral-300 bg-white text-black hover:border-brand-black",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-end bg-gradient-to-l from-white via-white/90 to-transparent text-lg font-bold text-black"
        aria-hidden="true"
      >
        →
      </div>
    </div>
  );
}
