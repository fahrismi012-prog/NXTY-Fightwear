"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useBrand } from "@/contexts/BrandContext";

/**
 * Bar promo tipis di atas header. Teks dari theme settings
 * (admin Tampilan); kosong = tidak render. Dismiss hanya per-halaman
 * (state lokal) — sengaja tanpa persistence supaya promo tetap terlihat
 * di kunjungan berikutnya.
 */
export default function PromoTopBar() {
  const { promoBarText } = useBrand();
  const [closed, setClosed] = useState(false);

  if (!promoBarText || closed) return null;

  return (
    <div className="relative bg-accent text-white text-body-sm font-semibold text-center py-2 px-10">
      {promoBarText}
      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="Tutup promo"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-subtle transition-colors"
      >
        <X className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}
