"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Loader2,
  Package,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  Search,
} from "lucide-react";
import type { Order, OrderItem, OrderShipping } from "@/types/database";
import { useToast } from "@/contexts/ToastContext";
import TrackingTimeline, { type TrackingEventLite } from "./TrackingTimeline";
import { StatusBadge } from "./StatusBadge";

interface Props {
  order: Order;
  onClose: () => void;
}

/** Shape fleksibel untuk JSON customer_address (stringified). */
interface CustomerAddressJSON {
  recipient_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  label?: string;
  notes?: string;
  // Fallback keys
  name?: string;
  address?: string;
}

const SHIPPABLE_STATUSES = ["paid", "processed"] as const;

function formatRupiah(value: number | null | undefined): string {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function parseCustomerAddress(raw: string | null): CustomerAddressJSON | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as CustomerAddressJSON;
    // Kadang disimpen sebagai string biasa — bungkus.
    return { street: String(parsed) };
  } catch {
    // Bukan JSON → anggap sebagai string alamat mentah.
    return { street: raw };
  }
}

function safeItems(items: unknown): OrderItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (it): it is OrderItem =>
      !!it &&
      typeof it === "object" &&
      typeof (it as OrderItem).name === "string",
  );
}

export default function OrderDetailModal({ order, onClose }: Props) {
  const { showToast } = useToast();
  const [trackingEvents, setTrackingEvents] = useState<TrackingEventLite[] | null>(
    null,
  );
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [generatingAwb, setGeneratingAwb] = useState(false);

  const address = useMemo(
    () => parseCustomerAddress(order.customer_address),
    [order.customer_address],
  );
  const items = useMemo(() => safeItems(order.items), [order.items]);
  const shipping = (order.shipping ?? {}) as OrderShipping;

  const waybill = shipping.waybill;
  const canCreateAwb =
    SHIPPABLE_STATUSES.includes(
      order.status as (typeof SHIPPABLE_STATUSES)[number],
    ) && !waybill;
  const canTrack = !!waybill && !!shipping.courier;

  // Lock body scroll when modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleTrack() {
    if (!waybill || !shipping.courier) return;
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingEvents(null);
    try {
      const res = await fetch(
        `/api/admin/shipping/track?waybill=${encodeURIComponent(waybill)}&courier=${encodeURIComponent(shipping.courier)}`,
      );
      const json = (await res.json().catch(() => ({}))) as {
        events?: TrackingEventLite[];
        status?: string;
        error?: string;
      };
      if (!res.ok) {
        setTrackingError(json.error ?? "Gagal mengambil tracking");
        showToast("info", json.error ?? "Gagal mengambil tracking");
        return;
      }
      setTrackingEvents(json.events ?? []);
      setTrackingStatus(json.status ?? null);
    } catch {
      setTrackingError("Terjadi kesalahan jaringan");
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setTrackingLoading(false);
    }
  }

  async function handleGenerateAwb() {
    if (!canCreateAwb || generatingAwb) return;

    if (!address) {
      showToast("info", "Alamat customer belum lengkap — tidak bisa generate resi.");
      return;
    }

    // Hitung total weight & value dari items
    const totalQty = items.reduce((sum, it) => sum + (it.qty || 0), 0);
    const totalWeight = items.reduce(
      (sum, it) => sum + (it.qty || 0) * 500,
      0,
    ); // fallback 500g/item kalau tidak ada weight per item
    const totalValue = items.reduce(
      (sum, it) => sum + (it.price || 0) * (it.qty || 0),
      0,
    );

    if (totalQty <= 0) {
      showToast("info", "Order tidak punya item.");
      return;
    }

    const itemName =
      items.length === 1
        ? items[0].name
        : `${items[0]?.name ?? "Produk"} +${items.length - 1} item lain`;

    // Courier/service default. Admin bisa ubah via UI enhancement nanti.
    const courier = shipping.courier || "jne";
    const service = shipping.service || "REG";

    setGeneratingAwb(true);
    try {
      const res = await fetch("/api/admin/shipping/generate-awb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          origin: process.env.NEXT_PUBLIC_STORE_ORIGIN || "Lembang",
          destination:
            address.city || address.province || address.postal_code || "",
          weight: Math.max(totalWeight, 1),
          courier,
          service,
          recipient_name:
            address.recipient_name || order.customer_name || "Customer",
          recipient_phone: address.phone || order.customer_phone || "",
          recipient_address:
            address.street || address.address || JSON.stringify(address),
          recipient_postal_code: address.postal_code || "",
          item_name: itemName,
          item_value: totalValue,
          item_weight: Math.max(totalWeight, 1),
          item_qty: totalQty,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        waybill?: string;
        error?: string;
      };
      if (!res.ok) {
        showToast("info", json.error ?? "Gagal membuat resi");
        return;
      }
      showToast("success", `Resi berhasil dibuat: ${json.waybill}`);
      // Refresh halaman server-side agar tabel update
      window.location.reload();
    } catch {
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setGeneratingAwb(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white border-2 border-black my-4">
        {/* Header */}
        <div className="bg-white border-b-2 border-black px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-1">
              Detail Pesanan
            </p>
            <p className="text-xs font-mono font-black text-black truncate">
              {order.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="shrink-0 w-9 h-9 inline-flex items-center justify-center bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          {/* Meta row: status + tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border-2 border-neutral-800 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">
                Status
              </p>
              <StatusBadge status={order.status} />
            </div>
            <div className="bg-white border-2 border-neutral-800 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">
                Tanggal Order
              </p>
              <p className="text-xs font-black text-black">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          {/* Customer info */}
          <section>
            <SectionHeader icon={User} title="Customer" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InfoBlock
                icon={User}
                label="Nama"
                value={order.customer_name ?? "—"}
              />
              <InfoBlock
                icon={Mail}
                label="Email"
                value={order.customer_email ?? "—"}
              />
              <InfoBlock
                icon={Phone}
                label="Telepon"
                value={order.customer_phone ?? "—"}
              />
            </div>
          </section>

          {/* Address */}
          <section>
            <SectionHeader icon={MapPin} title="Alamat Pengiriman" />
            <div className="bg-white border-2 border-neutral-800 p-3">
              {address ? (
                <div className="space-y-1">
                  {address.recipient_name ? (
                    <p className="text-sm font-black text-black">
                      {address.recipient_name}
                      {address.label ? (
                        <span className="ml-2 inline-block bg-black text-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                          {address.label}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                  {address.phone ? (
                    <p className="text-[11px] text-neutral-600 font-mono">
                      {address.phone}
                    </p>
                  ) : null}
                  {address.street || address.address ? (
                    <p className="text-xs text-neutral-800">
                      {address.street || address.address}
                    </p>
                  ) : null}
                  <p className="text-[11px] text-neutral-500">
                    {[address.city, address.province, address.postal_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {address.notes ? (
                    <p className="text-[10px] text-neutral-500 italic mt-2">
                      Catatan: {address.notes}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 italic">
                  Alamat tidak tersedia.
                </p>
              )}
              {order.notes ? (
                <div className="mt-3 pt-3 border-t-2 border-neutral-200 flex gap-2 items-start">
                  <FileText
                    size={12}
                    strokeWidth={2.5}
                    className="text-neutral-500 mt-0.5 shrink-0"
                  />
                  <p className="text-[11px] text-neutral-600">{order.notes}</p>
                </div>
              ) : null}
            </div>
          </section>

          {/* Items */}
          <section>
            <SectionHeader icon={Package} title={`Item Pesanan (${items.length})`} />
            {items.length === 0 ? (
              <div className="bg-white border-2 border-neutral-800 p-4 text-xs text-neutral-500 italic">
                Tidak ada item.
              </div>
            ) : (
              <div className="bg-white border-2 border-neutral-800 divide-y-2 divide-neutral-200">
                {items.map((it, idx) => (
                  <div key={`${it.productId}-${idx}`} className="p-3 flex gap-3">
                    <div className="w-12 h-12 shrink-0 border-2 border-neutral-800 bg-white overflow-hidden flex items-center justify-center">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package
                          size={16}
                          strokeWidth={2}
                          className="text-neutral-600"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-black truncate">
                        {it.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {[
                          it.size ? `Size: ${it.size}` : null,
                          it.color ? `Color: ${it.color}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="text-[11px] text-neutral-600 mt-1">
                        {formatRupiah(it.price)} × {it.qty}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-black font-mono">
                        {formatRupiah(it.price * it.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Shipping & Total */}
          <section>
            <SectionHeader icon={Truck} title="Pengiriman & Total" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white border-2 border-neutral-800 p-3 space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                  Kurir
                </p>
                <p className="text-xs font-black text-black uppercase">
                  {shipping.courier
                    ? `${shipping.courier}${
                        shipping.service ? ` · ${shipping.service}` : ""
                      }`
                    : "Belum dipilih"}
                </p>
                {shipping.etd ? (
                  <p className="text-[10px] text-neutral-500">
                    ETD: {shipping.etd} hari
                  </p>
                ) : null}
                {shipping.weight ? (
                  <p className="text-[10px] text-neutral-500">
                    Berat: {shipping.weight}g
                  </p>
                ) : null}
                {waybill ? (
                  <p className="text-[10px] font-mono text-black mt-1 break-all">
                    AWB: {waybill}
                  </p>
                ) : null}
              </div>
              <div className="bg-white border-2 border-neutral-800 p-3 space-y-1">
                <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
                <Row label="Ongkir" value={formatRupiah(order.shipping_cost)} />
                <div className="border-t-2 border-neutral-200 my-1.5" />
                <Row label="Total" value={formatRupiah(order.total)} bold />
              </div>
            </div>
          </section>

          {/* Tracking Timeline (kalau ada waybill) */}
          {canTrack ? (
            <section>
              <SectionHeader icon={Truck} title="Live Tracking" />
              {trackingEvents === null ? (
                <button
                  type="button"
                  onClick={handleTrack}
                  disabled={trackingLoading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-black text-white border-2 border-black px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-[4px_4px_0_black] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trackingLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Search size={14} strokeWidth={2.5} />
                  )}
                  Lacak Paket
                </button>
              ) : (
                <>
                  <TrackingTimeline
                    events={trackingEvents}
                    status={trackingStatus ?? undefined}
                  />
                  {trackingError ? (
                    <p className="mt-2 text-[11px] text-[#dc2626] font-bold">
                      {trackingError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleTrack}
                    disabled={trackingLoading}
                    className="mt-3 inline-flex items-center gap-2 bg-white text-black border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                  >
                    {trackingLoading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Search size={12} strokeWidth={2.5} />
                    )}
                    Refresh Tracking
                  </button>
                </>
              )}
            </section>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="border-t-2 border-black p-4 flex flex-wrap items-center gap-2 justify-end sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-white text-black border-2 border-black px-4 py-3 text-[11px] font-black uppercase tracking-wider hover:bg-black hover:text-white hover:shadow-[4px_4px_0_black] transition-all"
          >
            Tutup
          </button>
          {canCreateAwb ? (
            <button
              type="button"
              onClick={handleGenerateAwb}
              disabled={generatingAwb}
              className="inline-flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-3 text-[11px] font-black uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-[4px_4px_0_black] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingAwb ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Truck size={14} strokeWidth={2.5} />
              )}
              Buat Resi
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={14} strokeWidth={2.5} className="text-black" />
      <h2 className="text-[10px] font-black uppercase tracking-widest text-black">
        {title}
      </h2>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border-2 border-neutral-800 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={10} strokeWidth={2.5} className="text-neutral-500" />
        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
          {label}
        </p>
      </div>
      <p className="text-xs font-bold text-black break-all">{value}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className={`text-[10px] font-black uppercase tracking-wider ${
          bold ? "text-black" : "text-neutral-500"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-xs font-mono ${
          bold ? "font-black text-black" : "text-neutral-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
