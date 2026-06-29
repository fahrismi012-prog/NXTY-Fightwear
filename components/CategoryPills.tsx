"use client";

import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      setCanScrollLeft(scrollLeft > 10);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  return (
    <div className="relative w-full -mx-4 sm:mx-0">
      {/* Left-edge gradient fade */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-canvas via-canvas/80 to-transparent z-10 transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Right-edge gradient fade */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-canvas via-canvas/80 to-transparent z-10 transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Scrollable container - full width on mobile, contained on desktop */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide overflow-y-visible"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-2 px-4 sm:px-0 py-2">
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "shrink-0 px-3.5 py-1.5 text-body-sm font-medium rounded-full border transition-all min-h-[36px]",
              activeCategory === null
                ? "bg-brand-red border-brand-red text-white"
                : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-red hover:text-brand-red"
            )}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 text-body-sm font-medium rounded-full border transition-all whitespace-nowrap min-h-[36px]",
                activeCategory === cat
                  ? "bg-brand-red border-brand-red text-white"
                  : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-red hover:text-brand-red"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
