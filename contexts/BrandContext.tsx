"use client";

import { createContext, useContext } from "react";
import { DEFAULT_THEME } from "@/lib/theme";

/**
 * BrandContext — identitas brand dari theme settings (white-label).
 * Value di-fetch server-side di app/layout.tsx lalu dipasang di sini
 * supaya komponen client (TopHeader, Footer, dll.) bisa membaca nama
 * brand & logo tanpa fetch tambahan.
 */

export interface BrandInfo {
  brandName: string;
  logoUrl: string;
  logoInvert: boolean;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  promoBarText: string;
  whatsappNumber: string;
  contactEmail: string;
}

const BrandContext = createContext<BrandInfo>({
  brandName: DEFAULT_THEME.brandName,
  logoUrl: DEFAULT_THEME.logoUrl,
  logoInvert: DEFAULT_THEME.logoInvert,
  heroEyebrow: DEFAULT_THEME.heroEyebrow,
  heroTitle: DEFAULT_THEME.heroTitle,
  heroSubtitle: DEFAULT_THEME.heroSubtitle,
  promoBarText: DEFAULT_THEME.promoBarText,
  whatsappNumber: DEFAULT_THEME.whatsappNumber,
  contactEmail: DEFAULT_THEME.contactEmail,
});

export function BrandProvider({
  value,
  children,
}: {
  value: BrandInfo;
  children: React.ReactNode;
}) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandInfo {
  return useContext(BrandContext);
}
