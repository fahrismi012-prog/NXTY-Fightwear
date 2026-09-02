"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, Loader2, PackageCheck, Truck, Wallet, XCircle } from "lucide-react";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string | null;
  order_id: string | null;
  read_at: string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function iconFor(type: string) {
  switch (type) {
    case "shipping_cost_set":
    case "payment_verified":
      return Wallet;
    case "order_shipped":
      return Truck;
    case "order_completed":
      return PackageCheck;
    case "payment_rejected":
    case "order_cancelled":
      return XCircle;
    default:
      return Bell;
  }
}

/** Notif yang butuh aksi bayar -> arahkan ke halaman pembayaran. */
function hrefFor(n: Notif): string | null {
  if (!n.order_id) return null;
  if (n.type === "shipping_cost_set" || n.type === "payment_rejected") {
    return `/payment/pending?order_id=${encodeURIComponent(n.order_id)}`;
  }
  return `/akun/pesanan/${encodeURIComponent(n.order_id)}`;
}

export default function CustomerNotifikasiPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = useCallback(() => {
    fetch("/api/customer/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setItems(d.notifications ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markAll() {
    setMarking(true);
    await fetch("/api/customer/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).catch(() => {});
    setMarking(false);
    load();
  }

  function markOne(id: string) {
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    fetch("/api/customer/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  const unreadCount = items.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">Notifikasi</h1>
          <p className="text-sm text-text-muted">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={marking}
            className="inline-flex items-center gap-2 border-2 border-black px-3 py-2 text-[11px] font-black uppercase tracking-wider text-text-primary hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            {marking ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
            Tandai semua dibaca
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-surface-1 border-2 border-border-subtle p-10 text-center">
          <Loader2 size={20} className="animate-spin mx-auto text-text-muted" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-1 border-2 border-border-subtle p-10 text-center">
          <Bell size={28} className="text-text-muted mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">Belum ada notifikasi</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const Icon = iconFor(n.type);
            const href = hrefFor(n);
            const inner = (
              <div
                className={`flex items-start gap-3 border-2 p-4 transition-colors ${
                  n.read_at ? "border-border-subtle bg-surface-1" : "border-brand-black bg-surface-2"
                }`}
              >
                <span className="shrink-0 w-9 h-9 border-2 border-brand-black flex items-center justify-center">
                  <Icon size={16} strokeWidth={2.5} className="text-text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!n.read_at && <span className="w-2 h-2 rounded-full bg-[#dc2626] shrink-0" />}
                    <p className="text-sm font-black text-text-primary">{n.title}</p>
                  </div>
                  {n.body && <p className="text-xs text-text-muted mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {href ? (
                  <Link href={href} onClick={() => markOne(n.id)}>
                    {inner}
                  </Link>
                ) : (
                  <button type="button" className="w-full text-left" onClick={() => markOne(n.id)}>
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
