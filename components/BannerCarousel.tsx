"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Promotion } from "@/types";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface BannerCarouselProps {
  banners: Promotion[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % banners.length);
  const prev = () => setIndex((i) => (i - 1 + banners.length) % banners.length);

  return (
    <div className="relative w-full min-h-[280px] sm:aspect-[21/9] bg-surface-1 rounded-card overflow-hidden">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={b.image || ""}
            alt={b.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-canvas/95 via-canvas/70 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-md">
                {b.badge && (
                  <div className="inline-block bg-brand-green text-text-primary text-caption font-bold px-2.5 py-1 mb-3 rounded-subtle">
                    {b.badge}
                  </div>
                )}
                <Eyebrow color="red" className="mb-2">
                  Promo
                </Eyebrow>
                <h2 className="text-heading-1 font-bold text-text-primary mb-2">
                  {b.title}
                </h2>
                {b.subtitle && (
                  <p className="text-body-lg font-semibold text-text-primary mb-2">
                    {b.subtitle}
                  </p>
                )}
                {b.description && (
                  <p className="text-body text-text-secondary mb-4 leading-relaxed line-clamp-2">
                    {b.description}
                  </p>
                )}
                {b.ctaHref && (
                  <Link href={b.ctaHref}>
                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      {b.ctaLabel || "Lihat Promo"}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <IconButton
            icon={<ChevronLeft className="w-5 h-5" />}
            aria-label="Previous"
            variant="solid"
            size="lg"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <IconButton
            icon={<ChevronRight className="w-5 h-5" />}
            aria-label="Next"
            variant="solid"
            size="lg"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
          
          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-brand-green" : "w-3 bg-surface-2 hover:bg-border-default"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
