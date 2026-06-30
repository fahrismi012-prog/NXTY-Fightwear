"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function BrandIntroSection() {
  return (
    <section className="bg-surface-1 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto px-4">

        {/* Baris atas: logo kiri + welcome + deskripsi singkat di kanan */}
        <div className="flex items-center gap-4 sm:gap-5 mb-6">
          {/* Logo */}
          <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-brand-green rounded-xl flex items-center justify-center px-3 shadow-sm">
            <img
              src="/brand/logo-full.png"
              alt="Anxiety Fightwear"
              className="w-full h-auto object-contain"
              width={313}
              height={113}
            />
          </div>

          {/* Teks kanan: WELCOME + deskripsi singkat */}
          <div className="flex-1">
            <h2 className="text-heading-2 font-bold text-text-primary uppercase tracking-wide mb-1.5">
              Welcome
            </h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Anxiety Fightwear adalah brand peralatan olahraga beladiri yang berasal dari Bandung. Berdiri sejak 2014 dan kami memproduksi barang di pabrik kami sendiri sehingga dapat menjamin kualitas dan harga yang bersaing.
            </p>
          </div>
        </div>

        {/* Teks panjang full-width di bawah */}
        <p className="text-body-sm text-text-secondary leading-relaxed mb-6">
          Dari sarung tinju, hand wrap, matras, deker, seragam pencak silat, hingga perlengkapan taekwondo dan karate — setiap produk dirancang dengan standar kualitas tinggi untuk mendukung performa atlet di semua level.
        </p>

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
    </section>
  );
}
