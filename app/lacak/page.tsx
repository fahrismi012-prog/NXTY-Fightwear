"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { ChevronLeft, Package, Loader2, MapPin } from "lucide-react";
import TrackingTimeline from "@/components/admin/TrackingTimeline";
import type { TrackingEvent } from "@/lib/shipping/everpro";

interface OrderItem {
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

interface ShippingInfo {
  waybill?: string;
  courier?: string;
}

interface CustomerAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
}

interface OrderData {
  id: string;
  status: string;
  total: number;
  items: OrderItem[];
  shipping: ShippingInfo;
  created_at: string;
  customer_name: string;
  customer_address: CustomerAddress;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

const STATUS_LABEL: Record<string, string> = {
  awaiting_shipping_cost: "Menunggu Ongkir",
  awaiting_payment: "Menunggu Pembayaran",
  awaiting_confirmation: "Menunggu Konfirmasi",
  pending: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  processed: "Diproses",
  shipped: "Dikirim",
  delivered: "Sampai",
  cancelled: "Dibatalkan",
};

export default function LacakPage() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setOrder(null);
    setEvents([]);
    try {
      const res = await fetch(
        `/api/track/order?id=${encodeURIComponent(orderId)}&contact=${encodeURIComponent(contact)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melacak");
      setOrder(data.order);

      // If has waybill, fetch tracking
      const waybill = data.order.shipping?.waybill;
      const courier = data.order.shipping?.courier;
      if (waybill && courier) {
        try {
          const trackRes = await fetch(
            `/api/shipping/track?waybill=${encodeURIComponent(waybill)}&courier=${encodeURIComponent(courier)}`
          );
          if (trackRes.ok) {
            const trackData = await trackRes.json();
            setEvents(trackData.events || []);
          }
        } catch {
          // Tracking opsional, jangan gagalkan seluruh flow
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal melacak pesanan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary mb-4 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Link>

        <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">
          Lacak Pesanan
        </h1>
        <p className="text-sm text-text-muted mb-6">
          Masukkan Order ID dan email/nomor HP yang dipakai saat checkout
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-1 border-2 border-border-subtle p-4 space-y-4 mb-6"
        >
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="NXTY-xxxxx"
              required
              className="w-full bg-canvas text-text-primary px-3 py-3 border-2 border-border-subtle focus:border-brand-black focus:outline-none placeholder:text-neutral-600 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
              Email atau Nomor HP
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@contoh.com atau 08123456789"
              required
              className="w-full bg-canvas text-text-primary px-3 py-3 border-2 border-border-subtle focus:border-brand-black focus:outline-none placeholder:text-neutral-600"
            />
          </div>

          {error && (
            <div className="border border-brand-black text-brand-black text-xs p-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-black text-text-primary font-black uppercase tracking-wider hover:bg-white hover:text-brand-black transition-colors disabled:bg-surface-2 disabled:text-neutral-600 disabled:cursor-not-allowed min-h-[48px]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Melacak...
              </span>
            ) : (
              "Lacak"
            )}
          </button>
        </form>

        {order && (
          <div className="space-y-4">
            {/* Status badge */}
            <div className="bg-surface-1 border-2 border-border-subtle p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                    Order
                  </p>
                  <p className="text-sm font-mono font-bold text-text-primary">
                    {order.id}
                  </p>
                </div>
                <span className="bg-brand-black text-text-primary text-[10px] font-black uppercase tracking-wider px-2 py-1">
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-neutral-500 mb-0.5">Total</p>
                  <p className="text-text-primary font-bold">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-0.5">Tanggal</p>
                  <p className="text-text-primary font-bold">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-surface-1 border-2 border-border-subtle p-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-muted mb-3">
                Items
              </h3>
              <div className="space-y-2">
                {order.items?.map((item: OrderItem, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-2 border-b border-border-subtle last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-bold truncate">
                        {item.name}
                      </p>
                      <p className="text-neutral-500">
                        {item.size} · {item.color} · ×{item.quantity}
                      </p>
                    </div>
                    <p className="text-text-primary font-bold ml-2">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking timeline */}
            {events.length > 0 && (
              <div className="bg-surface-1 border-2 border-border-subtle p-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-text-muted mb-3">
                  Tracking Pengiriman
                </h3>
                {order.shipping?.waybill && (
                  <p className="text-xs text-neutral-500 mb-3 font-mono">
                    Resi: {order.shipping.waybill} ({order.shipping.courier})
                  </p>
                )}
                <TrackingTimeline events={events} />
              </div>
            )}

            {/* Address */}
            {order.customer_address && (
              <div className="bg-surface-1 border-2 border-border-subtle p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-brand-black" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
                    Alamat Pengiriman
                  </h3>
                </div>
                <p className="text-xs text-text-muted">
                  {order.customer_address.street}, {order.customer_address.city}
                  , {order.customer_address.province}{" "}
                  {order.customer_address.postal_code}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
