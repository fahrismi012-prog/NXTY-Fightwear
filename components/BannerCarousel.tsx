"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Promotion } from "@/types/database";
import { Button } from "@/components/ui/Button";

const SLIDE_MS = 5000;

/**
 * Hero slider full-bleed (gaya editorial fashion brand):
 * foto kampanye layar lebar + progress bar segmented ala stories di atas.
 * Data dari promo admin bertipe "banner" yang punya gambar.
 */
export default function BannerCarousel({ banners }: { banners: Promotion[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      SLIDE_MS,
    );
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <section
      aria-label="Banner promo"
      className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[80vh] bg-brand-black overflow-hidden"
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={b.image ?? ""}
            alt={b.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
          {/* Scrim bawah supaya teks terbaca di atas foto apa pun */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-10 flex items-end justify-between gap-4 max-w-7xl mx-auto">
            <div>
              {b.badge && (
                <span className="inline-block bg-accent text-white text-caption font-bold px-2.5 py-1 mb-2 rounded-subtle">
                  {b.badge}
                </span>
              )}
              <h2 className="text-heading-1 md:text-display-2 font-black uppercase tracking-tight text-white">
                {b.title}
              </h2>
              {b.subtitle && (
                <p className="text-body md:text-body-lg text-white/80 mt-1">
                  {b.subtitle}
                </p>
              )}
            </div>
            <Link href={b.cta_href ?? "/#catalog"} className="shrink-0">
              <Button
                variant="primary"
                size="lg"
                className="bg-white !text-brand-black hover:bg-white/90"
              >
                {b.cta_label || "Shop Now"}
              </Button>
            </Link>
          </div>
        </div>
      ))}

      {/* Progress bar segmented ala stories */}
      {banners.length > 1 && (
        <div className="absolute top-3 inset-x-0 px-4 max-w-7xl mx-auto flex gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}: ${b.title}`}
              className="flex-1 h-3 flex items-center group"
            >
              <span className="w-full h-0.5 bg-white/30 overflow-hidden group-hover:bg-white/50 transition-colors">
                <span
                  key={index === i ? `run-${index}` : `idle-${i}`}
                  className={
                    i < index
                      ? "block h-full w-full bg-white"
                      : i === index
                        ? "block h-full bg-white animate-slide-progress motion-reduce:w-full motion-reduce:animate-none"
                        : "block h-full w-0"
                  }
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
