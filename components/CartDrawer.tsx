"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/70 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-canvas border-l border-border-default z-50 transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border-subtle bg-canvas">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-brand-red" />
            <h2 className="text-heading-3 font-semibold text-text-primary">
              Keranjang
            </h2>
            {items.length > 0 && (
              <span className="text-body-sm font-semibold text-text-muted">
                ({items.length})
              </span>
            )}
          </div>
          <IconButton
            icon={<X className="w-5 h-5" />}
            aria-label="Tutup"
            onClick={onClose}
            variant="ghost"
          />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-surface-1 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-heading-3 font-bold text-text-primary mb-2">
                Keranjang kosong
              </p>
              <p className="text-body-sm text-text-muted mb-6">
                Yuk mulai belanja
              </p>
              <Button variant="primary" size="md" onClick={onClose}>
                Mulai Belanja
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-0 border border-border-subtle rounded-card overflow-hidden">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${idx}`}
                  className="flex gap-3 bg-canvas p-4 border-b border-border-subtle last:border-b-0"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-surface-1 overflow-hidden shrink-0 rounded-subtle">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-body font-semibold text-text-primary line-clamp-2 block hover:text-brand-red transition-colors"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                    <p className="text-body-sm text-text-muted mt-1">
                      {item.size} · {item.color}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-stretch border border-border-default rounded-subtle">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity - 1
                            )
                          }
                          className="w-11 h-11 flex items-center justify-center text-text-muted hover:bg-surface-1 hover:text-text-primary transition-colors rounded-l-subtle"
                          aria-label="Kurangi"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-11 text-center text-body-sm font-semibold text-text-primary flex items-center justify-center border-l border-r border-border-default">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity + 1
                            )
                          }
                          className="w-11 h-11 flex items-center justify-center text-text-muted hover:bg-surface-1 hover:text-text-primary transition-colors rounded-r-subtle"
                          aria-label="Tambah"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <PriceTag price={item.price * item.quantity} size="md" />
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      removeFromCart(item.productId, item.size, item.color)
                    }
                    className="self-start p-2.5 text-text-muted hover:text-error-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Hapus"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border-subtle bg-canvas px-4 py-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <span className="text-body-sm font-medium text-text-secondary">
                Subtotal
              </span>
              <PriceTag price={totalPrice} size="lg" />
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/checkout" onClick={onClose} className="w-full">
                <Button variant="primary" size="lg" fullWidth>
                  Checkout Sekarang
                </Button>
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="text-body-sm text-text-muted text-center block hover:text-text-primary transition-colors"
              >
                Lihat keranjang lengkap
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
