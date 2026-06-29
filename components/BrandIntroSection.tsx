"use client";

import Link from "next/link";
import { ArrowRight, Factory, Calendar, Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function BrandIntroSection() {
  return (
    <section className="bg-surface-1 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          {/* Logo Brand */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
            <img
              src="/brand/logo-full.png"
              alt="NXTY Fightwear"
              className="h-24 sm:h-28 md:h-36 w-auto object-contain"
              width={313}
              height={113}
            />
          </div>

          {/* Brand Info */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div>
              <p className="text-body-lg text-brand-red font-semibold mb-1">
                Welcome to Anxiety Fightwear
              </p>
            </div>

            {/* Description */}
            <p className="text-body text-text-secondary leading-relaxed">
              Anxiety Fightwear adalah brand peralatan olahraga beladiri asal Bandung yang berdiri sejak tahun 2014. Seluruh produk diproduksi di pabrik milik kami sendiri sehingga kualitas tetap terjaga dengan harga yang kompetitif.
            </p>

            {/* CTA */}
            <div>
              <Link href="/products/search">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Lihat Katalog
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border-subtle">
              <Card variant="default" padding="sm" className="text-center">
                <Factory className="w-6 h-6 text-brand-red mx-auto mb-2" />
                <p className="text-body-sm font-semibold text-text-primary">Produksi Sendiri</p>
              </Card>
              <Card variant="default" padding="sm" className="text-center">
                <Calendar className="w-6 h-6 text-brand-red mx-auto mb-2" />
                <p className="text-body-sm font-semibold text-text-primary">Berdiri 2014</p>
              </Card>
              <Card variant="default" padding="sm" className="text-center">
                <Banknote className="w-6 h-6 text-brand-red mx-auto mb-2" />
                <p className="text-body-sm font-semibold text-text-primary">Harga Bersaing</p>
              </Card>
              <Card variant="default" padding="sm" className="text-center">
                <Check className="w-6 h-6 text-brand-red mx-auto mb-2" />
                <p className="text-body-sm font-semibold text-text-primary">Kualitas Terjaga</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
