"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, removeFromCart, items } = useCart();
  const { showToast } = useToast();
  const isPromo =
    product.originalPrice !== undefined && product.originalPrice > product.price;

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
    <div className="group relative flex flex-col h-full bg-canvas border border-border-subtle overflow-hidden transition-all hover:border-brand-green rounded-card">
      {/* Promo badge */}
      {isPromo && (
        <div className="absolute top-2 right-2 z-10 bg-[#40916c] text-white text-caption font-bold px-2 py-1 rounded-subtle">
          Promo
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block shrink-0">
        <div className="relative aspect-square bg-surface-1 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="block">
          {/* Name */}
          <h3 className="text-body-sm font-medium text-text-primary line-clamp-2 leading-snug mb-2 min-h-[2.25rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mb-3">
            <PriceTag
              price={product.price}
              originalPrice={product.originalPrice}
              size="md"
              showDiscountBadge={false}
            />
          </div>
        </Link>

        {/* Quick actions - mobile */}
        <div className="flex items-stretch gap-2 mt-auto md:hidden">
          <Button
            variant="secondary"
            size="md"
            onClick={handleAddToCart}
            aria-label="Tambah ke keranjang"
            className="shrink-0 h-9 w-9 px-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleBuyNow}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
            className="h-9 text-body-sm gap-1.5 text-white"
          >
            Beli
          </Button>
        </div>

        {/* Quick actions - desktop */}
        <div className="hidden md:flex items-center justify-between pt-3 mt-auto border-t border-border-subtle">
          <div className="flex items-center gap-1 text-body-sm text-text-muted">
            <span className="text-brand-green">★</span>
            <span className="font-semibold text-text-primary">{product.rating.toFixed(1)}</span>
            <span>/5</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="sm" onClick={handleBuyNow}>
              Beli
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
