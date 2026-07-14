"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { PriceTag } from "@/components/ui/PriceTag";

interface ProductCardProps {
  product: Product;
  index?: number;
}

/**
 * Kartu produk editorial: foto besar, nama, harga — tanpa quick-buy.
 * Seluruh kartu link ke halaman produk; pilih ukuran/warna terjadi di sana
 * (mencegah salah ukuran dari auto-pick varian pertama).
 */
export default function ProductCard({ product }: ProductCardProps) {
  const isPromo =
    product.originalPrice !== undefined && product.originalPrice > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col h-full bg-canvas border border-border-subtle overflow-hidden transition-all hover:border-brand-black rounded-card"
    >
      {isPromo && (
        <div className="absolute top-2 right-2 z-10 bg-accent text-white text-caption font-bold px-2 py-1 rounded-subtle">
          Promo
        </div>
      )}
      {product.isPreorder && (
        <div className="absolute top-2 left-2 z-10 bg-brand-black text-text-primary text-caption font-bold px-2 py-1 rounded-subtle">
          Pre-Order
        </div>
      )}

      <div className="relative aspect-[4/5] bg-surface-1 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300 motion-reduce:transition-none"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-body-sm font-medium text-text-primary line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <PriceTag
            price={product.price}
            originalPrice={product.originalPrice}
            size="md"
            showDiscountBadge={false}
          />
          {product.reviewsCount > 0 && (
            <span className="text-caption text-text-muted">
              ★ {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
