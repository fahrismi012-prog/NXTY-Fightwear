"use client";

import { ArrowRight, Factory, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function HeroSection() {
  return (
    <section className="relative bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        {/* Headline */}
        <div className="mb-8">
          <Eyebrow color="red" className="mb-3">
            Premium Fightwear
          </Eyebrow>
          <h1 className="text-display-1 font-bold text-text-primary leading-[0.9] mb-4">
            Perlengkapan
            <br />
            <span className="text-brand-black">Petarung</span>
          </h1>
          <p className="text-body-lg text-text-secondary max-w-md leading-relaxed">
            Dibuat untuk atlet combat sports dan pencak silat. Sarung tinju, hand wrap, matras, deker, dan masih banyak lagi.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <a href="#catalog">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<ArrowRight className="w-5 h-5" />}
            >
              Belanja Sekarang
            </Button>
          </a>
          <a href="#categories">
            <Button variant="secondary" size="lg">
              Lihat Kategori
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card variant="default" padding="md" className="text-center">
            <div className="text-heading-1 font-bold text-text-primary mb-1">
              35<span className="text-brand-black">+</span>
            </div>
            <p className="text-body-sm text-text-muted">Produk</p>
          </Card>
          <Card variant="default" padding="md" className="text-center">
            <div className="text-heading-1 font-bold text-text-primary mb-1">
              13<span className="text-brand-black">+</span>
            </div>
            <p className="text-body-sm text-text-muted">Kategori</p>
          </Card>
          <Card variant="default" padding="md" className="text-center">
            <div className="text-heading-1 font-bold text-text-primary mb-1">
              4.9<span className="text-brand-black">★</span>
            </div>
            <p className="text-body-sm text-text-muted">Rating</p>
          </Card>
        </div>

        {/* Trust Strip */}
        <div className="mt-12 pt-8 border-t border-border-subtle">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 text-text-secondary">
              <Truck className="w-5 h-5 text-brand-black" />
              <span className="text-body-sm font-medium">Kirim Cepat</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Shield className="w-5 h-5 text-brand-black" />
              <span className="text-body-sm font-medium">100% Original</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Factory className="w-5 h-5 text-brand-black" />
              <span className="text-body-sm font-medium">Produksi Sendiri</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
