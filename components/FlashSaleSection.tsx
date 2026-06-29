"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, ArrowRight, ShoppingCart } from "lucide-react";
import type { Promotion, Product } from "@/types";
import productsData from "@/data/products.json";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import CountdownTimer from "./CountdownTimer";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface FlashSaleSectionProps {
  promotion: Promotion;
}

export default function FlashSaleSection({ promotion }: FlashSaleSectionProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    promotion.productIds?.forEach((id, idx) => {
      map[id] = Math.max(5, Math.floor(((promotion.flashStock ?? 50) - idx * 3) / 4));
    });
    return map;
  });

  const products = useMemo<Product[]>(() => {
    if (!promotion.productIds) return [];
    return productsData.products.filter((p) => promotion.productIds!.includes(p.id));
  }, [promotion.productIds]);

  const handleBuy = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.sizes.length || !product.colors.length) return;
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: promotion.flashPrice ?? product.price,
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    });
    setStockMap((m) => ({ ...m, [product.id]: Math.max(0, (m[product.id] ?? 1) - 1) }));
    showToast("cart", "Harga flash dikunci", `${product.name.slice(0, 28)}...`);
  };

  return (
    <Card variant="outlined" padding="none" className="border-brand-red overflow-hidden">
      {/* Header */}
      <div className="bg-brand-red px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-canvas rounded-subtle flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-brand-red animate-pulse" />
            </div>
            <div>
              <Eyebrow color="white" className="mb-0.5 opacity-80">
                Waktu Terbatas
              </Eyebrow>
              <h2 className="text-heading-2 font-bold text-white">
                {promotion.title}
              </h2>
              {promotion.subtitle && (
                <p className="text-body-sm text-white/80 font-medium mt-0.5">
                  {promotion.subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-medium text-white/80 hidden sm:inline">
              Berakhir dalam:
            </span>
            {promotion.endTime && <CountdownTimer endTime={promotion.endTime} size="sm" />}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {products.map((product) => {
            const stock = stockMap[product.id] ?? 0;
            const stockPercent = Math.max(5, Math.min(100, (stock / 30) * 100));
            return (
              <Card
                key={product.id}
                variant="default"
                padding="none"
                className="overflow-hidden"
              >
                {/* Flash badge */}
                <div className="relative aspect-square bg-surface-1 overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                  <div className="absolute top-2 right-2 bg-yellow-500 text-canvas text-caption font-bold px-2 py-0.5 rounded-subtle">
                    ⚡ Flash
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-body-sm font-semibold text-text-primary line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-2">
                    <PriceTag
                      price={promotion.flashPrice ?? product.price}
                      originalPrice={product.price}
                      size="md"
                      showDiscountBadge
                    />
                  </div>

                  {/* Stock progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-caption text-text-muted">Stok</span>
                      <span className="text-caption font-semibold text-brand-red">
                        {stock} tersisa
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-red transition-all duration-500 rounded-full"
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={(e) => handleBuy(e, product)}
                    leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                  >
                    Ambil
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* See all */}
        <div className="mt-4 text-center">
          <Link
            href="/promo"
            className="inline-flex items-center gap-2 text-body-sm font-semibold text-text-primary hover:text-brand-red transition-colors"
          >
            Lihat Semua Promo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
