"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import type { Order, OrderStatus } from "@/types/database";
import OrderDetailModal from "@/components/admin/OrderDetailModal";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Props {
  orders: Order[];
}

const PAGE_SIZE = 20;

const STATUS_FILTERS: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "awaiting_shipping_cost", label: "Perlu Ongkir" },
  { value: "awaiting_payment", label: "Menunggu Bayar" },
  { value: "awaiting_confirmation", label: "Menunggu Konfirmasi" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processed", label: "Processed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function formatRupiah(value: number | null): string {
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
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function shortOrderId(id: string): string {
  // Tampilkan 8 char terakhir biar muat di tabel; full id tetap ada di modal.
  return id.length > 10 ? `…${id.slice(-8)}` : id;
}

export default function OrderListClient({ orders }: Props) {
  // Deep-link dari notifikasi admin: /admin/pesanan?order=<id> -> buka modal
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(
    () => orders.find((o) => o.id === searchParams.get("order")) ?? null,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customer_name?.toLowerCase().includes(q) ?? false) ||
        (o.customer_email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">
          Manajemen
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Pesanan
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Daftar pesanan masuk Anxiety Fightwear. Total {orders.length} pesanan.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-2 border-neutral-800 p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label
            htmlFor="search"
            className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2"
          >
            Cari Order / Customer
          </label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              strokeWidth={2.5}
            />
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Order ID, nama, atau email…"
              className="w-full bg-white border-2 border-neutral-600 pl-10 pr-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2"
          >
            Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "" | OrderStatus);
              setPage(1);
            }}
            className="w-full bg-white border-2 border-neutral-600 px-3 py-3 text-sm text-black focus:outline-none focus:border-black transition-colors"
          >
            {STATUS_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-neutral-800 overflow-x-auto">
        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag
              size={32}
              strokeWidth={2}
              className="mx-auto mb-3 text-neutral-400"
            />
            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">
              Belum ada pesanan
            </p>
            <p className="text-[11px] text-neutral-500">
              Pesanan akan muncul di sini setelah customer checkout.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">
              Tidak ada hasil
            </p>
            <p className="text-[11px] text-neutral-500">
              Coba ubah filter atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-12">
                  #
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-32">
                  Order ID
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-40">
                  Tanggal
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800">
                  Customer
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-36 text-right">
                  Total
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-32">
                  Status
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest w-28">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((o, idx) => {
                const itemCount = Array.isArray(o.items) ? o.items.length : 0;
                return (
                  <tr
                    key={o.id}
                    className="border-t-2 border-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                    onClick={() => setSelected(o)}
                  >
                    <td className="px-3 py-3 text-xs font-black text-neutral-500 border-r-2 border-neutral-200">
                      {start + idx + 1}
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-black border-r-2 border-neutral-200">
                      {shortOrderId(o.id)}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-neutral-600 border-r-2 border-neutral-200">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="px-3 py-3 text-xs text-black border-r-2 border-neutral-200">
                      <div className="font-black truncate max-w-xs">
                        {o.customer_name ?? "—"}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono truncate max-w-xs">
                        {o.customer_email ?? "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-black text-black border-r-2 border-neutral-200 font-mono text-right">
                      {formatRupiah(o.total)}
                      <div className="text-[10px] text-neutral-500 font-normal mt-0.5">
                        {itemCount} item
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs border-r-2 border-neutral-200">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(o);
                        }}
                        className="inline-flex items-center gap-1.5 bg-black text-white border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-[4px_4px_0_black] transition-all"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Halaman {safePage} dari {totalPages} — Menampilkan {start + 1}–
            {Math.min(start + PAGE_SIZE, filtered.length)} dari {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 bg-white text-black border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white hover:shadow-[4px_4px_0_black] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={12} strokeWidth={2.5} />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 bg-white text-black border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white hover:shadow-[4px_4px_0_black] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : null}

      {selected ? (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
