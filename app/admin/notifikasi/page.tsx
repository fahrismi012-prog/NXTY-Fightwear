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
    case "order_created":
      return Bell;
    case "payment_submitted":
      return Wallet;
    case "order_shipped":
      return Truck;
    case "order_completed":
      return PackageCheck;
    case "order_cancelled":
      return XCircle;
    default:
      return Bell;
  }
}

export default function AdminNotifikasiPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/notifications", { cache: "no-store" })
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
    await fetch("/api/admin/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).catch(() => {});
    setMarking(false);
    load();
  }

  function markOne(id: string) {
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    fetch("/api/admin/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  const unreadCount = items.filter((n) => !n.read_at).length;

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">Aktivitas</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">Notifikasi</h1>
          <p className="text-sm text-neutral-500 mt-2">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={marking}
            className="inline-flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-2 text-[11px] font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {marking ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
            Tandai semua dibaca
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white border-2 border-neutral-800 p-10 text-center">
          <Loader2 size={20} className="animate-spin mx-auto text-neutral-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border-2 border-neutral-800 p-10 text-center">
          <Bell size={28} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Belum ada notifikasi</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const Icon = iconFor(n.type);
            const inner = (
              <div
                className={`flex items-start gap-3 border-2 p-4 transition-colors ${
                  n.read_at ? "border-neutral-200 bg-white" : "border-black bg-neutral-50"
                }`}
              >
                <span className="shrink-0 w-9 h-9 border-2 border-black flex items-center justify-center">
                  <Icon size={16} strokeWidth={2.5} className="text-black" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!n.read_at && <span className="w-2 h-2 rounded-full bg-[#dc2626] shrink-0" />}
                    <p className="text-sm font-black text-black">{n.title}</p>
                  </div>
                  {n.body && <p className="text-xs text-neutral-600 mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.order_id ? (
                  <Link href={`/admin/pesanan?order=${encodeURIComponent(n.order_id)}`} onClick={() => markOne(n.id)}>
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
