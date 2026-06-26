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

interface FlashSaleSectionProps {
  promotion: Promotion;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
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
    <section className="relative bg-[#0a0a0a] border-2 border-[#dc2626] overflow-hidden">
      {/* Header */}
      <div className="relative bg-[#dc2626] px-4 py-4 sm:px-6 sm:py-5">
        <div className="absolute inset-0 bg-stripes-white pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0a0a0a] border-2 border-[#0a0a0a] flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#dc2626] fill-current animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-[#0a0a0a]/70 tracking-[0.3em] uppercase">
                // WAKTU TERBATAS
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter italic leading-none">
                {promotion.title}
              </h2>
              <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest mt-0.5">
                {promotion.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#0a0a0a] uppercase tracking-[0.25em] hidden sm:inline">
              BERAKHIR DALAM:
            </span>
            {promotion.endTime && <CountdownTimer endTime={promotion.endTime} size="sm" />}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 border border-[#262626]">
          {products.map((product, idx) => {
            const stock = stockMap[product.id] ?? 0;
            const stockPercent = Math.max(5, Math.min(100, (stock / 30) * 100));
            return (
              <div
                key={product.id}
                className={`relative bg-[#0a0a0a] border-[#262626] ${
                  idx < products.length - 1 ? "border-r border-b" : "border-b"
                } ${idx % 2 === 0 ? "sm:border-r" : ""} sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(5n)]:border-r-0`}
              >
                {/* Index */}
                <div className="absolute top-0 left-0 z-10 bg-[#dc2626] text-white text-[9px] font-black tracking-wider px-2 py-0.5">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-square bg-[#161616] overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                    {/* Flash badge */}
                    <div className="absolute top-0 right-0 bg-yellow-500 text-[#0a0a0a] text-[9px] font-black tracking-wider px-2 py-0.5">
                      ⚡ FLASH
                    </div>
                  </div>
                </Link>

                <div className="p-2.5">
                  <h3 className="text-[11px] font-black text-white line-clamp-2 uppercase leading-tight mb-2 min-h-[2rem]">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-sm font-black text-[#dc2626] font-mono">
                      {formatPrice(promotion.flashPrice ?? product.price)}
                    </span>
                    <span className="text-[10px] text-neutral-500 line-through font-mono">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Discount */}
                  {promotion.flashPrice && (
                    <div className="text-[9px] font-black text-yellow-500 uppercase tracking-wider mb-2">
                      HEMAT{" "}
                      {Math.round(
                        ((product.price - promotion.flashPrice) / product.price) * 100
                      )}
                      %
                    </div>
                  )}

                  {/* Stock progress */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase">
                        STOK
                      </span>
                      <span className="text-[9px] font-black text-[#dc2626] font-mono">
                        {stock} LEFT
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#262626] overflow-hidden">
                      <div
                        className="h-full bg-[#dc2626] transition-all duration-500"
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={(e) => handleBuy(e, product)}
                    className="w-full py-2 bg-[#dc2626] hover:bg-white text-white hover:text-[#dc2626] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    AMBIL
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* See all */}
        <div className="mt-4 text-center">
          <Link
            href="/promo"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-[#dc2626] transition-colors"
          >
            LIHAT SEMUA PROMO
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
