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
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Detect apakah konten overflow di kanan (cue untuk scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
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
    <div className="relative w-full">
      <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "shrink-0 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] border-2 transition-colors flex items-center gap-2 min-h-[44px]",
              activeCategory === null
                ? "bg-[#dc2626] border-[#dc2626] text-white"
                : "bg-transparent border-[#262626] text-neutral-400 hover:border-[#dc2626] hover:text-[#dc2626]"
            )}
          >
            <span className="text-[9px] opacity-70">00</span>
            ALL
          </button>
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                "shrink-0 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] border-2 border-l-0 transition-colors flex items-center gap-2 whitespace-nowrap min-h-[44px]",
                activeCategory === cat
                  ? "bg-[#dc2626] border-[#dc2626] text-white"
                  : "bg-transparent border-[#262626] text-neutral-400 hover:border-[#dc2626] hover:text-[#dc2626]"
              )}
            >
              <span className="text-[9px] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Right-edge gradient cue untuk mobile */}
      {canScrollRight && (
        <div
          aria-hidden
          className="md:hidden pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-[#0a0a0a]"
        />
      )}
    </div>
  );
}
