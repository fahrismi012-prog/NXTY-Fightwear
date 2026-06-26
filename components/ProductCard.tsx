"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, removeFromCart, items } = useCart();
  const { showToast } = useToast();
  const isPromo =
    product.originalPrice !== undefined && product.originalPrice > product.price;
  const discount = isPromo
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.sizes.length || !product.colors.length) return;
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    });
    showToast("cart", "Ditambahkan ke keranjang", `${product.name.slice(0, 28)}...`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.sizes.length || !product.colors.length) return;
    const size = product.sizes[0];
    const color = product.colors[0];
    // Remove any existing same variant in cart to avoid duplicates in "instant buy" flow
    const existing = items.find(
      (i) => i.productId === product.id && i.size === size && i.color === color
    );
    if (existing) {
      removeFromCart(product.id, size, color);
    }
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size,
      color,
      quantity: 1,
    });
    showToast("buy", "Checkout langsung", "Mengalihkan ke pembayaran...");
    router.push("/checkout");
  };

  return (
    <div className="group relative bg-[#0a0a0a] border-2 border-[#262626] overflow-hidden transition-colors hover:border-[#dc2626]">
      {/* Index number badge */}
      <div className="absolute top-0 left-0 z-10 bg-[#0a0a0a] border-r-2 border-b-2 border-[#262626] px-2 py-1 flex items-center gap-1">
        <span className="w-1 h-1 bg-[#dc2626]" />
        <span className="text-[10px] font-black text-[#dc2626] tracking-[0.15em] font-mono">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Promo badge */}
      {isPromo && (
        <div className="absolute top-0 right-0 z-10 bg-[#dc2626] text-white text-[10px] font-black tracking-[0.15em] px-2 py-1 border-l-2 border-b-2 border-[#0a0a0a]">
          -{discount}%
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-[#161616] overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0a0a]/80 to-transparent" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 border-t-2 border-[#262626] bg-[#0a0a0a]">
        <Link href={`/products/${product.slug}`} className="block">
          {/* Category */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 bg-[#dc2626]" />
            <p className="text-[9px] font-black text-[#dc2626] uppercase tracking-[0.25em]">
              {product.category}
            </p>
          </div>

          {/* Name */}
          <h3 className="text-sm font-black text-white line-clamp-2 leading-tight mb-3 uppercase min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap mb-3">
            <span className="text-base font-black text-white tracking-tight">
              {formatPrice(product.price)}
            </span>
            {isPromo && (
              <span className="text-[10px] text-neutral-500 line-through font-mono">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
        </Link>

        {/* Quick actions - mobile: stacked full-width buttons (44px tap target) */}
        <div className="flex flex-col gap-1.5 mb-2 md:hidden">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-3 bg-[#dc2626] hover:bg-white text-white hover:text-[#dc2626] text-xs font-black uppercase tracking-[0.15em] transition-colors border-2 border-[#dc2626] hover:border-white min-h-[44px]"
            aria-label="Tambah ke keranjang"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            MASUKKAN KERANJANG
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-3 bg-transparent hover:bg-[#dc2626] text-[#dc2626] hover:text-white border-2 border-[#dc2626] text-xs font-black uppercase tracking-[0.15em] transition-colors min-h-[44px]"
            aria-label="Beli sekarang"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            BELI SEKARANG
          </button>
        </div>

        {/* Quick actions - desktop: split buttons + rating */}
        <div className="hidden md:block">
          <div className="grid grid-cols-5 gap-0 mb-3 border border-[#262626]">
            <button
              onClick={handleAddToCart}
              className="col-span-3 flex items-center justify-center gap-1.5 px-2 py-2 bg-transparent hover:bg-[#dc2626] text-neutral-300 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] transition-colors border-r border-[#262626]"
              aria-label="Tambah ke keranjang"
            >
              <ShoppingCart className="w-3 h-3" />
              <span className="hidden sm:inline">KERANJANG</span>
              <span className="sm:hidden">+</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="col-span-2 flex items-center justify-center gap-1.5 px-2 py-2 bg-[#dc2626] hover:bg-white text-white hover:text-[#dc2626] text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
              aria-label="Beli sekarang"
            >
              <Zap className="w-3 h-3 fill-current" />
              BELI
            </button>
          </div>

          {/* Bottom row: rating */}
          <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
            <div className="flex items-center gap-1 font-mono">
              <span className="text-[#dc2626] text-[10px]">★</span>
              <span className="text-[10px] text-white font-bold">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[9px] text-neutral-600">/5</span>
            </div>
            <Link
              href={`/products/${product.slug}`}
              className="text-[9px] font-black uppercase tracking-[0.2em] text-[#dc2626] hover:text-white transition-colors"
            >
              DETAILS →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
