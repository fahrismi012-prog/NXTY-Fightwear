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
import { PriceTag } from "@/components/ui/PriceTag";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TrustStrip } from "@/components/TrustStrip";
import productsData from "@/data/products.json";
import type { Product } from "@/types";

function getProductBySlug(slug: string): Product | undefined {
  return productsData.products.find((p) => p.slug === slug);
}

// Trust items untuk product detail
const PRODUCT_TRUST_ITEMS = [
  { icon: <Truck className="w-5 h-5" />, label: "Kirim Cepat" },
  { icon: <Shield className="w-5 h-5" />, label: "100% Original" },
  { icon: <RotateCcw className="w-5 h-5" />, label: "Bisa Retur" },
];

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
    showToast("cart", "Ditambahkan ke keranjang", `${product.name.slice(0, 30)}...`);
    setTimeout(() => setAdding(null), 400);
  };

  const handleBuyNow = async () => {
    if (!canAdd) return;
    setAdding("buy");
    addToCart(buildCartItem());
    showToast("buy", "Checkout langsung", "Mengalihkan ke pembayaran...");
    setTimeout(() => {
      router.push("/checkout");
    }, 350);
  };

  return (
    <div className="min-h-screen bg-canvas pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button mobile */}
        <button
          onClick={() => router.back()}
          className="md:hidden fixed top-4 left-4 z-20 w-12 h-12 flex items-center justify-center bg-surface-2 backdrop-blur-sm rounded-full border border-border-strong shadow-md"
          aria-label="Kembali"
        >
          <ChevronLeft className="w-7 h-7 text-text-primary" strokeWidth={2.5} />
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Image */}
          <div className="relative">
            {/* Image frame - edge-to-edge on mobile */}
            <div className="relative aspect-square bg-surface-1 overflow-hidden md:rounded-card">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {isPromo && (
                <div className="absolute top-3 right-3 bg-brand-green text-text-primary text-eyebrow font-bold uppercase tracking-[0.08em] px-2.5 py-1.5 rounded-subtle">
                  Promo
                </div>
              )}
            </div>
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
                <Star className="w-4 h-4 fill-brand-red text-brand-green" />
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
                price={product.price}
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
                    <span className="text-body-sm font-semibold text-brand-green">
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
                          ? "bg-brand-green border-brand-green text-text-primary"
                          : "bg-transparent border-border-default text-text-secondary hover:border-brand-green hover:text-brand-green"
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
                    <span className="text-body-sm font-semibold text-brand-green">
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
                          ? "bg-brand-green border-brand-green text-text-primary"
                          : "bg-transparent border-border-default text-text-secondary hover:border-brand-green hover:text-brand-green"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - Desktop only */}
            <div className="hidden md:block mb-5">
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

            {/* Desktop actions */}
            <div className="hidden md:flex flex-col gap-3 mb-4">
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
              >
                {adding === "buy" ? "OK" : "Beli"}
              </Button>
            </div>

            {!canAdd && (
              <p className="hidden md:block text-body-sm text-text-muted">
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

      {/* Mobile sticky bottom action bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-canvas border-t border-border-subtle p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex items-stretch gap-2">
          {/* Quantity selector compact */}
          <div className="flex items-stretch border border-border-default rounded-subtle">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-11 flex items-center justify-center text-text-secondary hover:bg-surface-1 rounded-l-subtle"
              aria-label="Kurangi"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center text-body-sm font-semibold text-text-primary flex items-center justify-center border-l border-r border-border-default">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-11 flex items-center justify-center text-text-secondary hover:bg-surface-1 rounded-r-subtle"
              aria-label="Tambah"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to cart button */}
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!canAdd || adding !== null}
            leftIcon={adding === "cart" ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          >
            {adding === "cart" ? "Added" : "Keranjang"}
          </Button>

          {/* Buy now button */}
          <Button
            variant="primary"
            size="md"
            className="flex-[1.4]"
            onClick={handleBuyNow}
            disabled={!canAdd || adding !== null}
            leftIcon={adding === "buy" ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
          >
            {adding === "buy" ? "OK" : "Beli"}
          </Button>
        </div>
        {!canAdd && (
          <p className="text-body-sm text-text-muted text-center mt-2">
            Pilih ukuran dan warna
          </p>
        )}
      </div>
    </div>
  );
}
