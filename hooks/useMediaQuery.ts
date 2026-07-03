"use client";

import { useSyncExternalStore } from "react";

/**
 * Hook untuk mendeteksi apakah viewport saat ini cocok dengan media query.
 * SSR-safe: default ke `false` di server, lalu di-hydrate di client.
 *
 * Pakai `useSyncExternalStore` untuk subscribe ke media query —
 * idiomatic React 18+ pattern, ESLint-compliant (no setState in effect).
 *
 * @param query - CSS media query string, mis. "(max-width: 767px)" atau "(min-width: 768px)"
 * @returns boolean - true jika media query match
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 767px)");
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Preset breakpoints untuk konsistensi. md = 768px (Tailwind default). */
export const BREAKPOINTS = {
  isMobile: "(max-width: 767px)",
  isTablet: "(min-width: 768px) and (max-width: 1023px)",
  isDesktop: "(min-width: 768px)",
} as const;
