"use client";

import Link from "next/link";
import { ArrowRight, Factory, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBrand } from "@/contexts/BrandContext";

/**
 * Hero brand — full-bleed di atas warna utama brand (mengikuti theme
 * white-label). Mengganti versi scroll-driven 180vh sebelumnya: user
 * langsung melihat value proposition + CTA tanpa harus scroll 2 layar.
 */

const TRUST_ITEMS = [
  { icon: Factory, label: "Produksi Pabrik Sendiri" },
  { icon: ShieldCheck, label: "Kualitas Terjamin" },
  { icon: Truck, label: "Kirim ke Seluruh Indonesia" },
];

export default function BrandIntroSection() {
  const { brandName, logoUrl, logoInvert, heroEyebrow, heroTitle, heroSubtitle } =
    useBrand();
  const logoClass = logoInvert ? "brightness-0 invert" : "";

  return (
    <section className="relative bg-brand-black text-white overflow-hidden">
      {/* Watermark logo halus di background */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 hidden lg:flex items-center pr-[-4rem] opacity-[0.06] pointer-events-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          className={`h-[24rem] w-auto object-contain translate-x-1/4 ${logoClass}`}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-24 grid lg:grid-cols-[1fr_auto] gap-10 items-center">
        {/* Copy + CTA */}
        <div className="max-w-2xl">
          {heroEyebrow && (
            <p className="text-eyebrow font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
              {heroEyebrow}
            </p>
          )}
          <h1 className="text-display-2 md:text-display-1 font-black uppercase tracking-tight mb-4 whitespace-pre-line">
            {heroTitle}
          </h1>
          <p className="text-body md:text-body-lg text-white/70 leading-relaxed mb-8">
            {heroSubtitle.replaceAll("{brand}", brandName)}
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-10">
            {/* Plain anchor: hero hanya tampil di home, scroll native ke #catalog */}
            <a href="#catalog">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-white !text-brand-black hover:bg-white/90"
              >
                Lihat Katalog
              </Button>
            </a>
            <Link href="/tentang-kami">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
              >
                Tentang Kami
              </Button>
            </Link>
          </div>

          {/* Trust chips */}
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-body-sm font-semibold text-white/80"
              >
                <Icon className="w-4 h-4 shrink-0 text-white/50" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Panel logo (desktop) */}
        <div className="hidden lg:flex w-72 aspect-square shrink-0 border border-white/15 bg-white/5 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={brandName}
            className={`w-3/4 h-auto object-contain ${logoClass}`}
            width={313}
            height={113}
          />
        </div>
      </div>
    </section>
  );
}
