"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Check,
  Star,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import productsData from "@/data/products.json";
import type { Product } from "@/types";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function getProductBySlug(slug: string): Product | undefined {
  return productsData.products.find((p) => p.slug === slug);
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const product = getProductBySlug(slug);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState<"cart" | "buy" | null>(null);

  if (!product) {
    notFound();
  }

  const isPromo =
    product.originalPrice !== undefined && product.originalPrice > product.price;
  const canAdd = selectedSize && selectedColor;

  const buildCartItem = () => ({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0],
    price: product.price,
    size: selectedSize,
    color: selectedColor,
    quantity,
  });

  const handleAddToCart = async () => {
    if (!canAdd) return;
    setAdding("cart");
    addToCart(buildCartItem());
    showToast("cart", "Added to cart", `${product.name.slice(0, 30)}...`);
    setTimeout(() => setAdding(null), 400);
  };

  const handleBuyNow = async () => {
    if (!canAdd) return;
    setAdding("buy");
    addToCart(buildCartItem());
    showToast("buy", "Instant checkout", "Redirecting to payment...");
    setTimeout(() => {
      router.push("/checkout");
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32 md:pb-0">
      {/* Top nav */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a] border-b-2 border-[#dc2626]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 border-2 border-[#262626] flex items-center justify-center hover:bg-[#dc2626] hover:border-[#dc2626] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white truncate">
            {product.name}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Image */}
          <div className="relative">
            {/* Image frame with stripes accent */}
            <div className="relative aspect-square bg-[#161616] overflow-hidden border-2 border-[#262626]">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {isPromo && (
                <div className="absolute top-0 left-0 bg-[#dc2626] text-white text-[10px] font-black tracking-[0.2em] px-3 py-1.5 border-r-2 border-b-2 border-[#0a0a0a]">
                  PROMO
                </div>
              )}
              {/* Top-left corner number */}
              <div className="absolute bottom-0 left-0 bg-[#0a0a0a] border-r-2 border-t-2 border-[#262626] px-3 py-1.5">
                <span className="text-xs font-black font-mono text-[#dc2626] tracking-[0.2em]">
                  ITEM / {product.id.toUpperCase()}
                </span>
              </div>
            </div>
            {/* Image stripe accent under */}
            <div className="h-2 bg-stripes-red-dense mt-0" />
          </div>

          {/* Info */}
          <div className="flex flex-col mt-4 lg:mt-0">
            {/* Category */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-[#dc2626]" />
              <p className="text-[10px] font-black text-[#dc2626] uppercase tracking-[0.3em]">
                {product.category}
              </p>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-3 leading-tight">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#262626]">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-[#dc2626] text-[#dc2626]" />
                <span className="text-sm text-white font-black font-mono">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                / 5.0 · {product.reviewsCount} ULASAN
              </span>
            </div>

            {/* Price */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-1">
                HARGA
              </p>
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter font-mono">
                  {formatPrice(product.price)}
                </span>
                {isPromo && (
                  <>
                    <span className="text-base text-neutral-500 line-through font-mono mb-1">
                      {formatPrice(product.originalPrice!)}
                    </span>
                    <span className="text-[10px] font-black text-white bg-[#dc2626] px-2 py-1 tracking-[0.2em]">
                      HEMAT {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-1.5">
                DESKRIPSI
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">
                    UKURAN
                  </p>
                  {selectedSize && (
                    <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">
                      {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-3 py-2.5 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                        selectedSize === size
                          ? "bg-[#dc2626] border-[#dc2626] text-white shadow-[2px_2px_0_#fff]"
                          : "bg-transparent border-[#262626] text-neutral-300 hover:border-[#dc2626] hover:text-[#dc2626]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">
                    WARNA
                  </p>
                  {selectedColor && (
                    <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2.5 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                        selectedColor === color
                          ? "bg-[#dc2626] border-[#dc2626] text-white shadow-[2px_2px_0_#fff]"
                          : "bg-transparent border-[#262626] text-neutral-300 hover:border-[#dc2626] hover:text-[#dc2626]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-2">
                JUMLAH
              </p>
              <div className="inline-flex items-stretch border-2 border-[#262626]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:bg-[#dc2626] hover:text-white transition-colors"
                  aria-label="Kurangi"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black text-white font-mono flex items-center justify-center border-l-2 border-r-2 border-[#262626]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:bg-[#dc2626] hover:text-white transition-colors"
                  aria-label="Tambah"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop actions - 2 buttons */}
            <div className="hidden md:grid grid-cols-5 gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAdd || adding !== null}
                className={`col-span-3 py-4 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 transition-all ${
                  !canAdd
                    ? "bg-[#262626] text-neutral-600 cursor-not-allowed"
                    : adding === "cart"
                    ? "bg-green-600 text-white"
                    : "bg-transparent border-2 border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                }`}
              >
                {adding === "cart" ? (
                  <>
                    <Check className="w-4 h-4" />
                    ADDED
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    TAMBAH KE KERANJANG
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canAdd || adding !== null}
                className={`col-span-2 py-4 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 transition-all ${
                  !canAdd
                    ? "bg-[#262626] text-neutral-600 cursor-not-allowed"
                    : adding === "buy"
                    ? "bg-green-600 text-white"
                    : "bg-[#dc2626] hover:bg-white hover:text-[#dc2626] text-white"
                }`}
              >
                {adding === "buy" ? (
                  <>
                    <Check className="w-4 h-4" />
                    OK
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    BELI LANGSUNG
                  </>
                )}
              </button>
            </div>

            {!canAdd && (
              <p className="hidden md:block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-4">
                // PILIH UKURAN & WARNA TERLEBIH DAHULU
              </p>
            )}

            {/* Trust signals */}
            <div className="border-t-2 border-[#262626] pt-4 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-4 h-4 text-[#dc2626]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  FAST SHIP
                </p>
              </div>
              <div className="flex flex-col items-center text-center gap-1 border-l border-r border-[#262626]">
                <Shield className="w-4 h-4 text-[#dc2626]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  100% ORIGINAL
                </p>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#dc2626]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  EASY RETURN
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom action bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-[#0a0a0a] border-t-2 border-[#dc2626] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_0_#dc2626]">
        <div className="flex items-stretch gap-2">
          {/* Quantity selector compact */}
          <div className="flex items-stretch border-2 border-[#262626]">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 flex items-center justify-center text-neutral-300 hover:bg-[#dc2626] hover:text-white"
              aria-label="Kurangi"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-black text-white font-mono flex items-center justify-center border-l-2 border-r-2 border-[#262626]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 flex items-center justify-center text-neutral-300 hover:bg-[#dc2626] hover:text-white"
              aria-label="Tambah"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!canAdd || adding !== null}
            className={`flex-1 px-3 py-3 font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-1.5 transition-all ${
              !canAdd
                ? "bg-[#262626] text-neutral-600"
                : adding === "cart"
                ? "bg-green-600 text-white"
                : "border-2 border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
            }`}
          >
            {adding === "cart" ? (
              <>
                <Check className="w-3 h-3" />
                ADDED
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3" />
                CART
              </>
            )}
          </button>

          {/* Buy now button */}
          <button
            onClick={handleBuyNow}
            disabled={!canAdd || adding !== null}
            className={`flex-[1.4] px-3 py-3 font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-1.5 transition-all ${
              !canAdd
                ? "bg-[#262626] text-neutral-600"
                : adding === "buy"
                ? "bg-green-600 text-white"
                : "bg-[#dc2626] hover:bg-white hover:text-[#dc2626] text-white"
            }`}
          >
            {adding === "buy" ? (
              <>
                <Check className="w-3 h-3" />
                GO
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 fill-current" />
                BELI
              </>
            )}
          </button>
        </div>
        {!canAdd && (
          <p className="text-[9px] font-mono text-[#dc2626] uppercase tracking-widest text-center mt-2">
            // PILIH UKURAN & WARNA
          </p>
        )}
      </div>
    </div>
  );
}
