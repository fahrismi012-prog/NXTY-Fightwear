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
  Edit3,
  Save,
  Trash2,
  Settings,
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

  // Manual payment confirmation state
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingPayment, setRejectingPayment] = useState(false);
  const [proofZoomed, setProofZoomed] = useState(false);
  const [proofSignedUrl, setProofSignedUrl] = useState<string | null>(null);

  // Admin order actions state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingShipping, setSavingShipping] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch signed URL untuk payment proof (private storage bucket)
  useEffect(() => {
    if (!order.payment_proof_url) {
      setProofSignedUrl(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/admin/orders/${order.id}/proof-url`)
      .then((r) => (r.ok ? r.json() : { url: null }))
      .then((data: { url?: string | null }) => {
        if (!cancelled) setProofSignedUrl(data.url ?? null);
      })
      .catch(() => {
        if (!cancelled) setProofSignedUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [order.id, order.payment_proof_url]);
  const [editShipping, setEditShipping] = useState({
    carrier: order.shipping_manual_carrier ?? "",
    cost: order.shipping_manual_cost ?? 0,
    receipt: order.shipping_manual_receipt ?? "",
  });

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

  async function handleGenerateAwb() {    if (!canCreateAwb || generatingAwb) return;

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

  async function handleConfirmPayment() {
    if (!confirm("Konfirmasi pembayaran pesanan ini? Status akan menjadi PAID.")) {
      return;
    }
    setConfirmingPayment(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast("info", json.error ?? "Gagal konfirmasi");
        return;
      }
      showToast("success", "Pembayaran dikonfirmasi");
      window.location.reload();
    } catch {
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setConfirmingPayment(false);
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    if (!confirm(`Ubah status pesanan ke '${newStatus}'?`)) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast("info", json.error ?? "Gagal update status");
        return;
      }
      showToast("success", `Status diubah ke '${newStatus}'`);
      window.location.reload();
    } catch {
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleSaveShipping() {
    setSavingShipping(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_manual_carrier: editShipping.carrier.trim() || null,
          shipping_manual_cost: editShipping.cost || null,
          shipping_manual_receipt: editShipping.receipt.trim() || null,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast("info", json.error ?? "Gagal update pengiriman");
        return;
      }
      showToast("success", "Info pengiriman disimpan");
      window.location.reload();
    } catch {
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setSavingShipping(false);
    }
  }

  async function handleDeleteOrder() {
    if (
      !confirm(
        `Hapus pesanan ${order.id}? Tindakan ini TIDAK bisa dibatalkan. Data order + bukti transfer akan dihapus permanen.`,
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast("info", json.error ?? "Gagal menghapus");
        return;
      }
      showToast("success", "Pesanan dihapus");
      window.location.reload();
    } catch {
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleRejectPayment() {
    const reason = rejectReason.trim();
    if (!reason) {
      showToast("info", "Alasan penolakan wajib diisi");
      return;
    }
    if (!confirm(`Tolak pembayaran pesanan ini? Status menjadi CANCELLED.\n\nAlasan: ${reason}`)) {
      return;
    }
    setRejectingPayment(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/reject-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast("info", json.error ?? "Gagal menolak");
        return;
      }
      showToast("info", "Pembayaran ditolak, pesanan dibatalkan");
      window.location.reload();
    } catch {
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setRejectingPayment(false);
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

          {/* Pembayaran Manual (hanya untuk mode manual) */}
          {order.payment_method === "manual" && (
            <ManualPaymentSection
              order={order}
              confirmingPayment={confirmingPayment}
              showRejectForm={showRejectForm}
              setShowRejectForm={setShowRejectForm}
              rejectReason={rejectReason}
              setRejectReason={setRejectReason}
              rejectingPayment={rejectingPayment}
              proofZoomed={proofZoomed}
              setProofZoomed={setProofZoomed}
              proofSignedUrl={proofSignedUrl}
              onConfirm={handleConfirmPayment}
              onReject={handleRejectPayment}
            />
          )}

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

          {/* Admin Order Actions */}
          <AdminOrderActions
            order={order}
            updatingStatus={updatingStatus}
            savingShipping={savingShipping}
            deleting={deleting}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            editShipping={editShipping}
            setEditShipping={setEditShipping}
            onUpdateStatus={handleUpdateStatus}
            onSaveShipping={handleSaveShipping}
            onDelete={handleDeleteOrder}
          />
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

function ManualPaymentSection({
  order,
  confirmingPayment,
  showRejectForm,
  setShowRejectForm,
  rejectReason,
  setRejectReason,
  rejectingPayment,
  proofZoomed,
  setProofZoomed,
  proofSignedUrl,
  onConfirm,
  onReject,
}: {
  order: Order;
  confirmingPayment: boolean;
  showRejectForm: boolean;
  setShowRejectForm: (v: boolean) => void;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  rejectingPayment: boolean;
  proofZoomed: boolean;
  setProofZoomed: (v: boolean) => void;
  proofSignedUrl: string | null;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const needsConfirmation =
    order.status === "awaiting_confirmation" ||
    order.status === "awaiting_payment";
  const isResolved =
    order.status === "paid" || order.status === "cancelled";

  return (
    <section>
      <SectionHeader
        icon={FileText}
        title="Pembayaran Manual"
      />

      <div className="bg-white border-2 border-neutral-800 p-4 space-y-3">
        {/* Status badge inline */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
            Status Pembayaran:
          </span>
          <StatusBadge status={order.status} />
          {order.payment_confirmed_at && (
            <span className="text-[10px] text-neutral-500">
              · dikonfirmasi {formatDate(order.payment_confirmed_at)}
            </span>
          )}
        </div>

        {/* Bukti transfer */}
        {order.payment_proof_url ? (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">
              Bukti Transfer
            </p>
            {proofSignedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proofSignedUrl}
                alt="Bukti transfer"
                onClick={() => setProofZoomed(true)}
                className="max-w-full max-h-64 border-2 border-neutral-800 cursor-zoom-in"
              />
            ) : (
              <div className="border-2 border-dashed border-neutral-400 p-3 text-[11px] text-neutral-500 italic">
                File bukti transfer tidak dapat dimuat.
              </div>
            )}
            <p className="text-[10px] text-neutral-500 mt-1">
              Klik gambar untuk memperbesar. Link berlaku 1 jam.
            </p>
          </div>
        ) : needsConfirmation ? (
          <div className="border-2 border-dashed border-neutral-400 p-3 text-[11px] text-neutral-500 italic">
            Customer belum upload bukti transfer.
          </div>
        ) : null}

        {/* Rejection reason (kalau ada) */}
        {order.payment_rejection_reason && (
          <div className="border-2 border-black bg-neutral-100 p-3 text-xs">
            <p className="font-black uppercase tracking-wider mb-1">
              Alasan Ditolak
            </p>
            <p className="text-neutral-700">{order.payment_rejection_reason}</p>
          </div>
        )}

        {/* Action buttons — hanya kalau masih awaiting */}
        {needsConfirmation && (
          <div className="border-t-2 border-neutral-200 pt-3 space-y-3">
            {!showRejectForm ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={confirmingPayment}
                  className="flex-1 px-4 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 min-h-[44px] inline-flex items-center justify-center gap-2"
                >
                  {confirmingPayment ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "✓ Konfirmasi Pembayaran"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  disabled={confirmingPayment}
                  className="flex-1 px-4 py-3 border-2 border-black text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  ✕ Tolak
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600">
                  Alasan Penolakan
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer tidak terbaca, nominal tidak sesuai..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-white text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-xs resize-none"
                />
                <p className="text-[10px] text-neutral-500">
                  {rejectReason.length}/500 karakter
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onReject}
                    disabled={rejectingPayment || !rejectReason.trim()}
                    className="flex-1 px-4 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 min-h-[44px] inline-flex items-center justify-center gap-2"
                  >
                    {rejectingPayment ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "✕ Konfirmasi Tolak"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
                    disabled={rejectingPayment}
                    className="px-4 py-3 border-2 border-neutral-800 text-[11px] font-black uppercase tracking-widest hover:border-black transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info kalau sudah resolved */}
        {isResolved && !needsConfirmation && (
          <p className="text-[11px] text-neutral-500 italic border-t-2 border-neutral-200 pt-3">
            Pembayaran sudah diproses dan tidak dapat diubah lagi.
          </p>
        )}
      </div>

      {/* Proof zoom modal */}
      {proofZoomed && proofSignedUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setProofZoomed(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proofSignedUrl}
            alt="Bukti transfer (perbesar)"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </section>
  );
}

function AdminOrderActions({
  order,
  updatingStatus,
  savingShipping,
  deleting,
  showDeleteConfirm,
  setShowDeleteConfirm,
  editShipping,
  setEditShipping,
  onUpdateStatus,
  onSaveShipping,
  onDelete,
}: {
  order: Order;
  updatingStatus: boolean;
  savingShipping: boolean;
  deleting: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  editShipping: { carrier: string; cost: number; receipt: string };
  setEditShipping: React.Dispatch<
    React.SetStateAction<{ carrier: string; cost: number; receipt: string }>
  >;
  onUpdateStatus: (s: string) => void;
  onSaveShipping: () => void;
  onDelete: () => void;
}) {
  // Status transition options sesuai state machine (lihat API)
  const transitions: { value: string; label: string; primary?: boolean }[] = [];
  switch (order.status) {
    case "awaiting_payment":
      // Mode manual — confirmation handled di section Pembayaran Manual
      break;
    case "awaiting_confirmation":
      // Mode manual — confirmation handled di section Pembayaran Manual
      break;
    case "pending":
      transitions.push({ value: "paid", label: "Tandai Paid (Gateway)", primary: true });
      transitions.push({ value: "cancelled", label: "Batalkan" });
      break;
    case "paid":
      transitions.push({ value: "processed", label: "Diproses", primary: true });
      transitions.push({ value: "shipped", label: "Dikirim" });
      transitions.push({ value: "delivered", label: "Sampai" });
      transitions.push({ value: "cancelled", label: "Batalkan" });
      break;
    case "processed":
      transitions.push({ value: "shipped", label: "Dikirim", primary: true });
      transitions.push({ value: "cancelled", label: "Batalkan" });
      break;
    case "shipped":
      transitions.push({ value: "delivered", label: "Sampai", primary: true });
      transitions.push({ value: "cancelled", label: "Batalkan" });
      break;
    default:
      // delivered/cancelled: tidak ada transition
      break;
  }

  const showShippingForm =
    order.status === "processed" ||
    order.status === "shipped" ||
    order.status === "delivered" ||
    Boolean(order.shipping_manual_carrier) ||
    Boolean(order.shipping_manual_receipt);

  return (
    <section>
      <SectionHeader icon={Settings} title="Aksi Admin" />

      {/* Status transition buttons */}
      {transitions.length > 0 && (
        <div className="bg-white border-2 border-neutral-800 p-4 mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-3">
            Ubah Status
          </p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onUpdateStatus(t.value)}
                disabled={updatingStatus}
                className={`inline-flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-wider border-2 transition-all disabled:opacity-50 ${
                  t.primary
                    ? "bg-black text-white border-black hover:bg-white hover:text-black"
                    : "bg-white text-black border-neutral-800 hover:border-black"
                }`}
              >
                {updatingStatus ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : null}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shipping info form (untuk mode manual shipping) */}
      {showShippingForm && (
        <div className="bg-white border-2 border-neutral-800 p-4 mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-3">
            Info Pengiriman (Mode Manual)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">
                Kurir
              </label>
              <input
                type="text"
                value={editShipping.carrier}
                onChange={(e) =>
                  setEditShipping((s) => ({ ...s, carrier: e.target.value }))
                }
                placeholder="JNE / J&T / SiCepat"
                className="w-full bg-canvas text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">
                Ongkir (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={editShipping.cost}
                onChange={(e) =>
                  setEditShipping((s) => ({
                    ...s,
                    cost: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                placeholder="0"
                className="w-full bg-canvas text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">
                No. Resi
              </label>
              <input
                type="text"
                value={editShipping.receipt}
                onChange={(e) =>
                  setEditShipping((s) => ({ ...s, receipt: e.target.value }))
                }
                placeholder="JX1234567890"
                className="w-full bg-canvas text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-xs"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onSaveShipping}
            disabled={savingShipping}
            className="mt-3 inline-flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-2 text-[11px] font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {savingShipping ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} strokeWidth={2.5} />
            )}
            Simpan Info Pengiriman
          </button>
        </div>
      )}

      {/* Delete order (with confirmation) */}
      <div className="bg-white border-2 border-red-600 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">
          Zona Berbahaya
        </p>
        <p className="text-xs text-neutral-700 mb-3">
          Hapus pesanan permanen. Data order + bukti transfer di storage akan
          ikut terhapus. Tidak bisa dibatalkan.
        </p>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 bg-white text-red-600 border-2 border-red-600 px-4 py-2 text-[11px] font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors"
          >
            <Trash2 size={12} strokeWidth={2.5} />
            Hapus Pesanan
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 bg-red-600 text-white border-2 border-red-600 px-4 py-2 text-[11px] font-black uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} strokeWidth={2.5} />
              )}
              Konfirmasi Hapus
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="inline-flex items-center gap-2 bg-white text-black border-2 border-neutral-800 px-4 py-2 text-[11px] font-black uppercase tracking-wider hover:border-black transition-colors disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </section>
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
