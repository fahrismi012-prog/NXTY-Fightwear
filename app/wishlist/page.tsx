"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button, Card, Eyebrow, IconButton, PriceTag } from "@/components/ui";

/**
 * Wishlist page placeholder (fase 1).
 * Versi lengkap dengan filter/sort akan dibuat di fase 3 (discovery-redesign).
 */
export default function WishlistPage() {
  const { items, hydrated, remove } = useWishlist();

  return (
    <div className="min-h-screen bg-canvas pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        {/* Page header */}
        <div className="mb-6">
          <Eyebrow color="red">Disimpan untuk nanti</Eyebrow>
          <h1 className="text-heading-1 font-bold text-text-primary mt-2">
            Wishlist Saya
          </h1>
          {hydrated && (
            <p className="text-body-sm text-text-muted mt-1">
              {items.length === 0
                ? "Belum ada produk disimpan."
                : `${items.length} produk tersimpan`}
            </p>
          )}
        </div>

        {!hydrated ? (
          // Loading skeleton
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-surface-1 rounded-card animate-skeleton-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty state
          <Card variant="default" padding="lg" className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-2 inline-flex items-center justify-center">
              <Heart className="w-7 h-7 text-text-muted" />
            </div>
            <h2 className="text-heading-2 font-semibold text-text-primary mb-2">
              Belum ada favorit
            </h2>
            <p className="text-body text-text-secondary mb-6 max-w-sm mx-auto">
              Tap ikon hati di produk yang kamu suka untuk menyimpannya di sini.
            </p>
            <Link href="/">
              <Button>Mulai Belanja</Button>
            </Link>
          </Card>
        ) : (
          // List items
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Card
                key={item.productId}
                variant="default"
                padding="none"
                className="flex gap-3 p-3"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative w-20 h-20 shrink-0 bg-surface-2 rounded-subtle overflow-hidden"
                  aria-label={`Lihat detail ${item.name}`}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-body font-semibold text-text-primary line-clamp-2 hover:text-brand-green transition-colors"
                  >
                    {item.name}
                  </Link>
                  <PriceTag price={item.price} size="md" />
                </div>
                <IconButton
                  icon={<Trash2 className="w-4 h-4" />}
                  variant="ghost"
                  size="md"
                  aria-label={`Hapus ${item.name} dari wishlist`}
                  onClick={() => remove(item.productId)}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
