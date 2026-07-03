"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  const shippingCost = 0;
  const totalWithShipping = totalPrice + shippingCost;

  const handleUpdateQuantity = async (productId: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    updateQuantity(productId, size, color, newQuantity);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-canvas pb-24 md:pb-8">
      {/* Page heading */}
      <div className="max-w-3xl mx-auto px-4 pt-5 pb-3">
        <h1 className="text-heading-2 font-bold text-text-primary">
          Keranjang
          {items.length > 0 && (
            <span className="ml-2 text-body text-text-muted font-normal">
              ({items.length} item)
            </span>
          )}
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-surface-1 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-text-muted" />
            </div>
            <p className="text-heading-3 font-bold text-text-primary mb-2">
              Keranjang kosong
            </p>
            <p className="text-body text-text-muted mb-8">
              Yuk temukan produk favoritmu
            </p>
            <Link href="/">
              <Button variant="primary" size="lg">
                Mulai Belanja
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-0">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 bg-canvas p-4 border-b border-border-subtle last:border-b-0"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-surface-1 overflow-hidden shrink-0 rounded-subtle">
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
                      className="text-body font-semibold text-text-primary line-clamp-2 block hover:text-brand-black transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-body-sm text-text-muted mt-1">
                      {item.size} · {item.color}
                    </p>
                    <PriceTag price={item.price} size="md" className="mt-2" />
                    
                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Quantity Control */}
                      <div className="flex items-stretch border border-border-default rounded-subtle">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="w-11 h-11 flex items-center justify-center text-text-muted hover:bg-surface-1 hover:text-text-primary transition-colors rounded-l-subtle"
                          aria-label="Kurangi"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-11 text-center text-body font-semibold text-text-primary flex items-center justify-center border-l border-r border-border-default">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="w-11 h-11 flex items-center justify-center text-text-muted hover:bg-surface-1 hover:text-text-primary transition-colors rounded-r-subtle"
                          aria-label="Tambah"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="p-2.5 text-text-muted hover:text-error-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="md:col-span-1">
              <Card variant="default" padding="lg" className="sticky top-20">
                <p className="text-body-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  Ringkasan
                </p>
                
                <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3">
                  <span className="text-body-sm font-medium text-text-secondary">
                    Subtotal
                  </span>
                  <PriceTag price={totalPrice} size="md" />
                </div>
                
                <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3">
                  <div className="flex flex-col items-start">
                    <span className="text-body-sm font-medium text-text-secondary">
                      Ongkir
                    </span>
                    <span className="text-caption text-text-muted">Dihitung di checkout</span>
                  </div>
                  <span className="text-body font-semibold text-text-muted">
                    Gratis
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-2 mb-4">
                  <span className="text-body font-semibold text-text-primary">
                    Total
                  </span>
                  <PriceTag price={totalWithShipping} size="lg" />
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                >
                  Checkout Sekarang
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Checkout Bar */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-canvas border-t border-border-subtle p-3 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-caption text-text-muted uppercase tracking-wider">
                Total
              </p>
              <PriceTag price={totalWithShipping} size="md" />
            </div>
            <Button variant="primary" size="md" onClick={handleCheckout}>
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
