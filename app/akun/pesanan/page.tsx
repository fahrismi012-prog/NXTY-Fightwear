import { requireCustomerUser } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/StatusBadge";
import OrderStatusTabs, { type OrderTab } from "@/components/customer/OrderStatusTabs";
import type { OrderStatus } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const VALID_STATUSES: OrderStatus[] = [
  "awaiting_shipping_cost",
  "awaiting_payment",
  "awaiting_confirmation",
  "paid",
  "processed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_shipping_cost: "Menunggu Ongkir",
  awaiting_payment: "Menunggu Bayar",
  awaiting_confirmation: "Menunggu Konfirmasi",
  pending: "Pending",
  paid: "Diproses",
  processed: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
};

export default async function PesananSayaPage({ searchParams }: PageProps) {
  const user = await requireCustomerUser();
  const params = await searchParams;
  const filterStatus = (params?.status ?? "all") as "all" | OrderStatus;

  const supabase = createAdminClient();
  if (!supabase) return null;

  // Validasi filter status
  const isValidStatus =
    filterStatus === "all" ||
    VALID_STATUSES.includes(filterStatus as OrderStatus);

  // Query orders (filtered) + count per status paralel
  // Tampilkan order milik user (customer_id match) + order lama dari guest
  // checkout yang email-nya match dengan user.email (backward compat).
  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, status, total, created_at, items, payment_method",
    )
    .or(`customer_id.eq.${user.id},customer_email.eq.${user.email ?? ""}`)
    .order("created_at", { ascending: false });

  if (isValidStatus && filterStatus !== "all") {
    ordersQuery = ordersQuery.eq("status", filterStatus as OrderStatus);
  }

  const { data: orders } = await ordersQuery;

  // Hitung count per status untuk badge (single query dengan group by manual)
  const { data: allOrdersForCount } = await supabase
    .from("orders")
    .select("status")
    .or(`customer_id.eq.${user.id},customer_email.eq.${user.email ?? ""}`);

  const countByStatus = (allOrdersForCount ?? []).reduce(
    (acc, o) => {
      acc[o.status as OrderStatus] = (acc[o.status as OrderStatus] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const tabs: OrderTab[] = [
    {
      value: "all",
      label: "Semua",
      count: allOrdersForCount?.length ?? 0,
    },
    { value: "awaiting_shipping_cost", label: "Ongkir", count: countByStatus.awaiting_shipping_cost ?? 0 },
    { value: "awaiting_payment", label: "Menunggu", count: countByStatus.awaiting_payment ?? 0 },
    { value: "awaiting_confirmation", label: "Konfirmasi", count: countByStatus.awaiting_confirmation ?? 0 },
    { value: "paid", label: "Dibayar", count: countByStatus.paid ?? 0 },
    { value: "processed", label: "Diproses", count: countByStatus.processed ?? 0 },
    { value: "shipped", label: "Dikirim", count: countByStatus.shipped ?? 0 },
    { value: "delivered", label: "Selesai", count: countByStatus.delivered ?? 0 },
    { value: "cancelled", label: "Dibatalkan", count: countByStatus.cancelled ?? 0 },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">
          Pesanan Saya
        </h1>
        <p className="text-sm text-text-muted">
          Riwayat pesanan Anda
        </p>
      </div>

      {/* Tabs filter */}
      <OrderStatusTabs tabs={tabs} activeValue={isValidStatus ? filterStatus : "all"} />

      {/* List orders */}
      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const itemCount = Array.isArray(order.items)
              ? order.items.reduce((sum, i) => sum + (i.quantity ?? 0), 0)
              : 0;
            return (
              <Link
                key={order.id}
                href={`/akun/pesanan/${order.id}`}
                className="block bg-surface-1 border border-border-subtle rounded-subtle hover:border-brand-black hover:shadow-sm transition-all p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package
                      size={16}
                      strokeWidth={2.5}
                      className="text-brand-black shrink-0"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-text-muted truncate">
                      {order.id}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {itemCount > 0
                        ? `${itemCount} item`
                        : "Detail produk"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-black text-text-primary">
                      {formatPrice(order.total ?? 0)}
                    </p>
                    <ChevronRight
                      size={16}
                      className="text-text-muted"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-1 border border-dashed border-border-subtle rounded-subtle p-10 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-sm font-bold text-text-primary uppercase tracking-tight mb-1">
            {isValidStatus && filterStatus !== "all"
              ? `Tidak Ada Pesanan ${
                  STATUS_LABELS[filterStatus as OrderStatus] ?? filterStatus
                }`
              : "Belum Ada Pesanan"}
          </p>
          <p className="text-xs text-text-muted mb-4">
            Pesanan Anda akan muncul di sini
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-brand-black text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors rounded-subtle min-h-[44px]"
          >
            Mulai Belanja
          </Link>
        </div>
      )}
    </div>
  );
}
