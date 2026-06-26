"use client";

import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden border-b-2 border-[#262626]">
      {/* Background stripes */}
      <div className="absolute inset-0 bg-stripes-red pointer-events-none" />

      {/* Huge background number */}
      <div
        aria-hidden
        className="absolute -top-12 -right-8 text-[10rem] sm:text-[22rem] lg:text-[30rem] font-black text-[#161616] leading-[0.85] pointer-events-none select-none italic"
      >
        01
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-24">
        {/* Status tag */}
        <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 bg-white animate-pulse" />
          <span>STATUS / SIAP</span>
        </div>

        {/* Headline */}
        <h1 className="font-black tracking-tighter leading-[0.85] mb-8 sm:mb-10">
          <span className="block text-white text-5xl sm:text-7xl lg:text-8xl">PERLENGKAPAN</span>
          <span className="block text-[#dc2626] italic text-5xl sm:text-7xl lg:text-8xl">
            UNTUK
          </span>
          <span className="block text-white text-5xl sm:text-7xl lg:text-8xl">PETARUNG</span>
        </h1>

        {/* Subhead */}
        <div className="max-w-md mb-8 border-l-4 border-[#dc2626] pl-4">
          <p className="text-sm sm:text-base text-white font-bold uppercase tracking-wide mb-1">
            NXTY FIGHTWEAR
          </p>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Dibuat untuk atlet combat sports dan pencak silat. Sarung tinju, hand wrap, matras, deker, dan masih banyak lagi. Tanpa kompromi, tanpa alasan.{" "}
            <span className="text-[#dc2626] font-black uppercase">Siap. Tempur. Menang.</span>
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 sm:mb-14">
          <a
            href="#catalog"
            className="inline-flex items-center justify-center gap-3 bg-[#dc2626] text-white px-6 py-4 font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-[#dc2626] transition-colors"
          >
            BELANJA SEKARANG
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#categories"
            className="inline-flex items-center justify-center gap-3 border-2 border-white text-white px-6 py-4 font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-colors"
          >
            LIHAT KATEGORI
          </a>
        </div>

        {/* Stats bar - no rounded */}
        <div className="grid grid-cols-3 border-2 border-[#262626]">
          {[
            { num: "35", label: "PRODUK" },
            { num: "13", label: "KATEGORI" },
            { num: "4.9", label: "RATING" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-4 sm:p-6 bg-[#0a0a0a]/50 ${i < 2 ? "border-r-2 border-[#262626]" : ""}`}
            >
              <div className="text-3xl sm:text-5xl font-black text-white leading-none mb-2 tracking-tighter">
                {stat.num}
                <span className="text-[#dc2626]">+</span>
              </div>
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
