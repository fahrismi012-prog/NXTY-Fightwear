"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
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
import { PriceTag } from "@/components/ui/PriceTag";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { resolvePrice } from "@/lib/pricing";
import type { PriceTier } from "@/types/database";

// Trust items untuk product detail
const PRODUCT_TRUST_ITEMS = [
  { icon: <Truck className="w-5 h-5" />, label: "Kirim Cepat" },
  { icon: <Shield className="w-5 h-5" />, label: "100% Original" },
  { icon: <RotateCcw className="w-5 h-5" />, label: "Bisa Retur" },
];

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  variantPrices: Record<string, number>;
  legacyPrice: number | null;
  sizes: string[];
  colors: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
}

interface ProductDetailProps {
  product: ProductDetailData;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState<"cart" | "buy" | null>(null);
  // Multi-image gallery state (kalau produk punya >1 foto)
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [priceTier, setPriceTier] = useState<PriceTier>("standard");
  const hasMultipleImages = product.images.length > 1;
  const mainImage = product.images[activeImageIndex] ?? product.images[0];

  useEffect(() => {
    fetch("/api/customer/price-tier")
      .then((res) => res.json())
      .then((data) => setPriceTier(data.tier === "legacy" ? "legacy" : "standard"))
      .catch(() => setPriceTier("standard"));
  }, []);

  const displayPrice = useMemo(
    () =>
      resolvePrice(
        { price: product.price, variant_prices: product.variantPrices, legacy_price: product.legacyPrice },
        selectedSize,
        selectedColor,
        priceTier,
      ),
    [product, selectedSize, selectedColor, priceTier],
  );

  const isPromo =
    product.originalPrice !== undefined && product.originalPrice > displayPrice;
  const canAdd = selectedSize && selectedColor;

  const buildCartItem = () => ({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0],
    price: displayPrice,
    size: selectedSize,
    color: selectedColor,
    quantity,
  });

  const handleAddToCart = () => {
    if (!canAdd) return;
    setAdding("cart");
    addToCart(buildCartItem());
    showToast("cart", "Ditambahkan ke keranjang", `${product.name.slice(0, 30)}...`);
    setTimeout(() => setAdding(null), 400);
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    setAdding("buy");
    addToCart(buildCartItem());
    showToast("buy", "Checkout langsung", "Mengalihkan ke pembayaran...");
    setTimeout(() => {
      router.push("/checkout");
    }, 350);
  };

  return (
    <div className="min-h-screen bg-canvas pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button mobile */}
        <button
          onClick={() => router.back()}
          className="md:hidden fixed top-[4.5rem] left-4 z-30 w-11 h-11 flex items-center justify-center bg-white rounded-full border border-border-default shadow-md"
          aria-label="Kembali"
        >
          <ChevronLeft className="w-7 h-7 text-text-primary" strokeWidth={2.5} />
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Image gallery */}
          <div className="relative">
            {/* Main image frame - edge-to-edge on mobile */}
            <div className="relative aspect-square bg-surface-1 overflow-hidden md:rounded-card">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={`${product.name} (gambar ${activeImageIndex + 1})`}
                  fill
                  className="object-cover transition-opacity duration-200"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={activeImageIndex === 0}
                  key={mainImage}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                  Tidak ada gambar
                </div>
              )}
              {isPromo && (
                <div className="absolute top-3 right-3 bg-brand-black text-text-primary text-eyebrow font-bold uppercase tracking-[0.08em] px-2.5 py-1.5 rounded-subtle">
                  Promo
                </div>
              )}
              {/* Image counter overlay (kalau multiple images) */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-subtle">
                  {activeImageIndex + 1} / {product.images.length}
                </div>
              )}
              {/* Prev/Next buttons (desktop only) */}
              {hasMultipleImages && product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        (activeImageIndex - 1 + product.images.length) %
                          product.images.length,
                      )
                    }
                    aria-label="Gambar sebelumnya"
                    className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        (activeImageIndex + 1) % product.images.length,
                      )
                    }
                    aria-label="Gambar selanjutnya"
                    className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip (mobile + desktop, kalau multiple images) */}
            {hasMultipleImages && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={`thumb-${idx}-${img.slice(-12)}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Lihat gambar ${idx + 1}`}
                    aria-current={activeImageIndex === idx ? "true" : undefined}
                    className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? "border-black shadow-[2px_2px_0_black]"
                        : "border-neutral-300 hover:border-black opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col px-4 mt-4 lg:mt-0 lg:px-0">
            {/* Category */}
            <Eyebrow color="default" className="mb-2">
              {product.category}
            </Eyebrow>

            {/* Title */}
            <h1 className="text-heading-1 font-bold text-text-primary mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-brand-red text-brand-black" />
                <span className="text-body-sm font-semibold text-text-primary">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-body-sm text-text-muted">
                / 5.0 · {product.reviewsCount} ulasan
              </span>
            </div>

            {/* Price */}
            <div className="mb-5">
              <PriceTag
                price={displayPrice}
                originalPrice={product.originalPrice}
                size="xl"
                showDiscountBadge
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <p className="text-body text-text-secondary leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-body-sm font-semibold text-text-primary">Ukuran</p>
                  {selectedSize && (
                    <span className="text-body-sm font-semibold text-brand-black">
                      {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.5rem] px-4 py-3 text-body-sm font-semibold rounded-subtle border transition-all min-h-[44px] ${
                        selectedSize === size
                          ? "bg-brand-black border-brand-black text-text-primary"
                          : "bg-transparent border-border-default text-text-secondary hover:border-brand-black hover:text-brand-black"
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
                  <p className="text-body-sm font-semibold text-text-primary">Warna</p>
                  {selectedColor && (
                    <span className="text-body-sm font-semibold text-brand-black">
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-3 text-body-sm font-semibold rounded-subtle border transition-all min-h-[44px] ${
                        selectedColor === color
                          ? "bg-brand-black border-brand-black text-text-primary"
                          : "bg-transparent border-border-default text-text-secondary hover:border-brand-black hover:text-brand-black"
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
              <p className="text-body-sm font-semibold text-text-primary mb-2">Jumlah</p>
              <div className="inline-flex items-stretch border border-border-default rounded-subtle">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-text-secondary hover:bg-surface-1 hover:text-text-primary transition-colors rounded-l-subtle"
                  aria-label="Kurangi"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-body font-semibold text-text-primary flex items-center justify-center border-l border-r border-border-default">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-text-secondary hover:bg-surface-1 hover:text-text-primary transition-colors rounded-r-subtle"
                  aria-label="Tambah"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions — inline (mobile & desktop) */}
            <div className="flex flex-col gap-3 mb-4">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={!canAdd || adding !== null}
                leftIcon={adding === "cart" ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              >
                {adding === "cart" ? "Ditambahkan" : "Tambah ke Keranjang"}
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleBuyNow}
                disabled={!canAdd || adding !== null}
                leftIcon={adding === "buy" ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                className="!text-white"
              >
                {adding === "buy" ? "OK" : "Beli"}
              </Button>
            </div>

            {!canAdd && (
              <p className="text-body-sm text-text-muted">
                Pilih ukuran dan warna terlebih dahulu
              </p>
            )}

            {/* Trust signals */}
            <div className="border-t border-border-subtle pt-4 mt-4">
              <TrustStrip variant="compact" items={PRODUCT_TRUST_ITEMS} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
