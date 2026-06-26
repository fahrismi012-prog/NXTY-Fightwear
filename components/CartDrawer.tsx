"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

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

      {/* Drawer - brutalist: no rounded, hard borders */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#0a0a0a] border-l-2 border-[#dc2626] z-50 transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b-2 border-[#dc2626] bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#dc2626]" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
              KERANJANG
              <span className="ml-2 text-[#dc2626] font-mono">
                [{String(items.length).padStart(2, "0")}]
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border-2 border-[#262626] flex items-center justify-center hover:bg-[#dc2626] hover:border-[#dc2626]"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 border-2 border-[#262626] flex items-center justify-center mb-4 bg-stripes-red">
                <ShoppingBag className="w-7 h-7 text-neutral-700" />
              </div>
              <p className="text-xl font-black text-white uppercase tracking-tighter mb-1">
                KOSONG
              </p>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-6">
                // keranjang kosong
              </p>
              <button
                onClick={onClose}
                className="px-5 py-3 bg-[#dc2626] text-white text-xs font-black uppercase tracking-[0.25em] hover:bg-white hover:text-[#dc2626] transition-colors"
              >
                MULAI BELANJA →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-0 border-2 border-[#262626]">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${idx}`}
                  className="flex gap-3 bg-[#0a0a0a] p-4 border-b-2 border-[#262626] last:border-b-0"
                >
                  {/* Index */}
                  <div className="text-[10px] font-mono font-black text-[#dc2626] pt-1 w-5 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-[#161616] overflow-hidden shrink-0 border border-[#262626]">
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
                      className="text-xs font-black text-white line-clamp-2 uppercase block hover:text-[#dc2626]"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                    <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase tracking-wider">
                      {item.size} · {item.color}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-stretch border border-[#262626]">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity - 1
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:bg-[#dc2626] hover:text-white"
                          aria-label="Kurangi"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-9 text-center text-xs font-mono font-black text-white flex items-center justify-center border-l border-r border-[#262626]">
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
                          className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:bg-[#dc2626] hover:text-white"
                          aria-label="Tambah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-black text-white font-mono">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      removeFromCart(item.productId, item.size, item.color)
                    }
                    className="self-start p-1 text-neutral-500 hover:text-[#dc2626]"
                    aria-label="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t-2 border-[#dc2626] bg-[#0a0a0a] px-4 py-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                SUBTOTAL
              </span>
              <span className="text-xl font-black text-white font-mono tracking-tight">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3.5 bg-[#dc2626] text-white text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-white hover:text-[#dc2626] transition-colors"
              >
                CHECKOUT SEKARANG
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={clearCart}
                className="w-full py-2 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 hover:text-[#dc2626]"
              >
                HAPUS SEMUA
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
