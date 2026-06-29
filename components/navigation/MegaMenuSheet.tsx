"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Grid3x3, Tag } from "lucide-react";
import { Sheet, Eyebrow } from "@/components/ui";
import { useUI } from "@/contexts/UIContext";
import productsData from "@/data/products.json";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/**
 * MegaMenuSheet — overlay kategori dengan thumbnail produk hero per kategori.
 *
 * Mobile: bottom sheet full-height.
 * Desktop: panel fullscreen dengan max-width centered (basic implementation;
 *          desktop mega menu dropdown advanced dapat dibuat di iterasi berikut).
 *
 * Triggered via useUI().openMegaMenu().
 */
export function MegaMenuSheet() {
  const { megaMenuOpen, closeMegaMenu } = useUI();

  const categories = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of productsData.products as Product[]) {
      if (!map.has(p.category)) {
        map.set(p.category, p);
      }
    }
    return Array.from(map.entries()).map(([category, firstProduct]) => ({
      category,
      thumbnail: firstProduct.images[0],
      href: `/?category=${encodeURIComponent(category)}`,
    }));
  }, []);

  return (
    <Sheet
      open={megaMenuOpen}
      onClose={closeMegaMenu}
      side="bottom"
      size="full"
      title="Belanja"
    >
      <div className="px-4 py-3">
        <Eyebrow color="red" className="mb-3">
          Jelajahi
        </Eyebrow>

        {/* Top action — see all */}
        <Link
          href="/"
          onClick={closeMegaMenu}
          className={cn(
            "flex items-center gap-3 px-3 py-3 mb-2",
            "bg-surface-1 hover:bg-surface-2 rounded-card",
            "transition-colors duration-fast",
            "min-h-[56px]"
          )}
        >
          <span
            className={cn(
              "w-12 h-12 shrink-0 inline-flex items-center justify-center",
              "bg-brand-red text-white rounded-subtle"
            )}
            aria-hidden
          >
            <Grid3x3 className="w-5 h-5" />
          </span>
          <span className="flex-1 text-body font-semibold text-text-primary">
            Lihat Semua Produk
          </span>
          <ChevronRight className="w-5 h-5 text-text-muted" aria-hidden />
        </Link>

        {/* Categories list */}
        <ul className="flex flex-col gap-1.5">
          {categories.map(({ category, thumbnail, href }) => (
            <li key={category}>
              <Link
                href={href}
                onClick={closeMegaMenu}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5",
                  "hover:bg-surface-1 rounded-card",
                  "transition-colors duration-fast",
                  "min-h-[56px]"
                )}
              >
                <span
                  className={cn(
                    "relative w-12 h-12 shrink-0 overflow-hidden",
                    "bg-surface-2 rounded-subtle"
                  )}
                >
                  <Image
                    src={thumbnail}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <span className="flex-1 text-body font-medium text-text-primary">
                  {category}
                </span>
                <ChevronRight className="w-5 h-5 text-text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom action — promo */}
        <Link
          href="/promo"
          onClick={closeMegaMenu}
          className={cn(
            "flex items-center gap-3 px-3 py-3 mt-3",
            "bg-surface-1 hover:bg-surface-2 rounded-card",
            "transition-colors duration-fast",
            "min-h-[56px]"
          )}
        >
          <span
            className={cn(
              "w-12 h-12 shrink-0 inline-flex items-center justify-center",
              "bg-brand-red text-white rounded-subtle"
            )}
            aria-hidden
          >
            <Tag className="w-5 h-5" />
          </span>
          <span className="flex-1 text-body font-semibold text-text-primary">
            Promo Aktif
          </span>
          <ChevronRight className="w-5 h-5 text-text-muted" aria-hidden />
        </Link>
      </div>
    </Sheet>
  );
}

export default MegaMenuSheet;
