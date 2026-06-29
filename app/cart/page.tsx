"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const [updating, setUpdating] = useState<string | null>(null);

  // Estimasi ongkir placeholder (akan diisi di Task D2)
  const shippingCost = 0;

  const totalWithShipping = totalPrice + shippingCost;

  const handleUpdateQuantity = async (productId: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setUpdating(`${productId}-${size}-${color}`);
    await updateQuantity(productId, size, color, newQuantity);
    setTimeout(() => setUpdating(null), 300);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a] border-b-2 border-[#dc2626]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 border-2 border-[#262626] flex items-center justify-center hover:bg-[#dc2626] hover:border-[#dc2626] transition-colors"
            aria-label="Kembali ke beranda"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white">
            KERANJANG
            <span className="ml-2 text-[#dc2626] font-mono">
              [{String(items.length).padStart(2, "0")}]
            </span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 border-2 border-[#262626] flex items-center justify-center mb-6 bg-stripes-red">
              <ShoppingCart className="w-12 h-12 text-neutral-700" />
            </div>
            <p className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
              KOSONG
            </p>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-8">
              // keranjang belum ada item
            </p>
            <Link
              href="/"
              className="px-8 py-4 bg-[#dc2626] text-white text-sm font-black uppercase tracking-[0.25em] hover:bg-white hover:text-[#dc2626] transition-colors"
            >
              MULAI BELANJA →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-0 border-2 border-[#262626] md:border-0">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 bg-[#0a0a0a] p-4 border-b-2 border-[#262626] last:border-b-0"
                >
                  {/* Index */}
                  <div className="text-[10px] font-mono font-black text-[#dc2626] pt-1 w-5 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-[#161616] overflow-hidden shrink-0 border border-[#262626]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-xs font-black text-white line-clamp-2 uppercase block hover:text-[#dc2626]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase tracking-wider">
                      {item.size} · {item.color}
                    </p>
                    <p className="text-xs font-black text-[#dc2626] mt-2 font-mono">
                      {formatPrice(item.price)}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Quantity Control */}
                      <div className="flex items-stretch border border-[#262626]">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          disabled={updating !== null}
                          className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:bg-[#dc2626] hover:text-white disabled:opacity-50"
                          aria-label="Kurangi"
                        >
                          {updating === `${item.productId}-${item.size}-${item.color}` ? (
                            <span className="text-[8px]">...</span>
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                        </button>
                        <span className="w-9 text-center text-xs font-mono font-black text-white flex items-center justify-center border-l border-r border-[#262626]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          disabled={updating !== null}
                          className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:bg-[#dc2626] hover:text-white disabled:opacity-50"
                          aria-label="Tambah"
                        >
                          {updating === `${item.productId}-${item.size}-${item.color}` ? (
                            <span className="text-[8px]">...</span>
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="p-1 text-neutral-500 hover:text-[#dc2626]"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="border-2 border-[#262626] bg-[#0a0a0a] p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 uppercase tracking-widest">
                  RINGKASAN
                </p>
                
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                    SUBTOTAL
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                      ONGKIR
                    </span>
                    <span className="text-[9px] text-neutral-600">Tunggu input alamat</span>
                  </div>
                  <span className="text-sm font-black text-white font-mono">
                    {formatPrice(shippingCost)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-black uppercase tracking-[0.25em] text-white">
                    TOTAL
                  </span>
                  <span className="text-lg font-black text-[#dc2626] font-mono tracking-tight">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={updating !== null}
                  className="w-full py-4 bg-[#dc2626] text-white text-xs font-black uppercase tracking-[0.25em] hover:bg-white hover:text-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CHECKOUT SEKARANG
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Checkout Bar */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t-2 border-[#dc2626] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_0_#dc2626]">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">
                Total
              </p>
              <p className="text-sm font-black text-[#dc2626] font-mono">
                {formatPrice(totalWithShipping)}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={updating !== null}
              className="px-6 py-3 bg-[#dc2626] text-white text-xs font-black uppercase tracking-[0.25em] hover:bg-white hover:text-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
