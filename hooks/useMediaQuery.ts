"use client";

import { useEffect, useState } from "react";

/**
 * Hook untuk mendeteksi apakah viewport saat ini cocok dengan media query.
 * SSR-safe: default ke `false` di server, lalu di-hydrate di client.
 *
 * @param query - CSS media query string, mis. "(max-width: 767px)" atau "(min-width: 768px)"
 * @returns boolean - true jika media query match
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 767px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** Preset breakpoints untuk konsistensi. md = 768px (Tailwind default). */
export const BREAKPOINTS = {
  isMobile: "(max-width: 767px)",
  isTablet: "(min-width: 768px) and (max-width: 1023px)",
  isDesktop: "(min-width: 768px)",
} as const;
