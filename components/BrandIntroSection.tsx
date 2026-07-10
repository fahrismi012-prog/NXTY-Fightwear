"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBrand } from "@/contexts/BrandContext";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Intro brand scroll-driven: saat pengguna scroll, teks WELCOME memudar dan
 * kartu logo membesar sampai persegi penuh selebar layar mobile (dibatasi
 * 560px di layar besar). Progress 0..1 disimpan di CSS variable --p sehingga
 * semua interpolasi berjalan lewat calc() tanpa re-render React per frame.
 * Pengguna dengan prefers-reduced-motion mendapat layout statis tanpa animasi.
 */
export default function BrandIntroSection() {
  const { brandName } = useBrand();
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  );

  useEffect(() => {
    if (reducedMotion) return;
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      track.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const textStyle = reducedMotion
    ? undefined
    : ({
        opacity: "clamp(0, calc(1 - var(--p, 0) * 1.8), 1)",
        transform: "translateY(calc(var(--p, 0) * -1.5rem))",
      } as React.CSSProperties);

  const panelStyle = reducedMotion
    ? undefined
    : ({
        width: "min(calc(7rem + (100vw - 7rem) * var(--p, 0)), 560px)",
        borderRadius: "calc((1 - var(--p, 0)) * 0.75rem)",
      } as React.CSSProperties);

  return (
    <section className="bg-surface-1">
      <div
        ref={trackRef}
        className={reducedMotion ? "" : "relative h-[180vh]"}
        style={{ "--p": 0 } as React.CSSProperties}
      >
        <div
          className={
            reducedMotion
              ? "max-w-2xl mx-auto px-4 py-10 sm:py-14 flex flex-col items-center gap-6 text-center"
              : "sticky top-14 md:top-[72px] h-[calc(100vh-3.5rem)] md:h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-6 overflow-hidden text-center"
          }
        >
          {/* Teks: WELCOME + deskripsi singkat (memudar saat scroll) */}
          <div style={textStyle} className="max-w-2xl px-4 will-change-transform">
            <h2 className="text-heading-2 font-bold text-text-primary uppercase tracking-wide mb-1.5">
              Welcome
            </h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Anxiety Fightwear adalah brand peralatan olahraga beladiri yang berasal dari Bandung. Berdiri sejak 2014 dan kami memproduksi barang di pabrik kami sendiri sehingga dapat menjamin kualitas dan harga yang bersaing.
            </p>
          </div>

          {/* Kartu logo (membesar jadi persegi penuh saat scroll) */}
          <div
            style={panelStyle}
            className="w-28 aspect-square shrink-0 bg-brand-black flex items-center justify-center shadow-sm will-change-[width]"
          >
            <img
              src="/brand/logo-full.png"
              alt={brandName}
              className="w-3/4 h-auto object-contain"
              width={313}
              height={113}
            />
          </div>

          {/* CTA */}
          <Link href="/#catalog">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lihat Katalog
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
