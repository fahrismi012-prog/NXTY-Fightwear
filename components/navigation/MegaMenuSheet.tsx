"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Grid3x3 } from "lucide-react";
import { Sheet, Eyebrow } from "@/components/ui";
import { useUI } from "@/contexts/UIContext";
import { cn } from "@/lib/utils";

interface CategoryEntry {
  category: string;
  thumbnail: string | null;
  href: string;
}

/**
 * MegaMenuSheet — overlay kategori dengan thumbnail produk hero per kategori.
 *
 * Mobile: bottom sheet full-height.
 * Desktop: panel fullscreen dengan max-width centered (basic implementation;
 *          desktop mega menu dropdown advanced dapat dibuat di iterasi berikut).
 *
 * Triggered via useUI().openMegaMenu().
 *
 * Data source: /api/storefront/categories (Supabase via ISR 60s) — fallback
 * ke array kosong kalau fetch gagal / data belum loaded.
 */
export function MegaMenuSheet() {
  const { megaMenuOpen, closeMegaMenu } = useUI();
  const [categories, setCategories] = useState<CategoryEntry[]>([]);

  // Fetch categories dari API saat MegaMenu pertama kali dibuka (lazy load).
  // Pakai flag open untuk skip fetch kalau user belum pernah buka menu.
  useEffect(() => {
    if (!megaMenuOpen || categories.length > 0) return;
    let cancelled = false;
    fetch("/api/storefront/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((data: { categories: CategoryEntry[] }) => {
        if (!cancelled) setCategories(data.categories ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [megaMenuOpen, categories.length]);

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
              "bg-brand-black text-text-primary rounded-subtle"
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
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-text-muted text-xs">·</span>
                  )}
                </span>
                <span className="flex-1 text-body font-medium text-text-primary">
                  {category}
                </span>
                <ChevronRight className="w-5 h-5 text-text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom action — promo dihapus */}
      </div>
    </Sheet>
  );
}

export default MegaMenuSheet;
