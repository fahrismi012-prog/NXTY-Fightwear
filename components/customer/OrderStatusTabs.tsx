"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface OrderTab {
  value: string; // "all" | "awaiting_payment" | "awaiting_confirmation" | "paid" | "processed" | "shipped" | "delivered" | "cancelled"
  label: string;
  count: number;
}

interface OrderStatusTabsProps {
  tabs: OrderTab[];
  activeValue: string;
}

/**
 * Tabs filter status pesanan. Mobile: horizontal scroll. Desktop: wrap.
 * Active tab: bg hitam + teks putih. Inactive: bg canvas + border + hover.
 */
export default function OrderStatusTabs({
  tabs,
  activeValue,
}: OrderStatusTabsProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
      <div className="flex gap-2 md:flex-wrap min-w-max md:min-w-0 pb-1">
        {tabs.map((tab) => {
          const active = tab.value === activeValue;
          return (
            <Link
              key={tab.value}
              href={
                tab.value === "all"
                  ? "/akun/pesanan"
                  : `/akun/pesanan?status=${tab.value}`
              }
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-subtle text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap",
                active
                  ? "bg-brand-black text-white"
                  : "bg-surface-1 text-text-secondary border border-border-subtle hover:border-brand-black hover:text-text-primary",
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full",
                    active
                      ? "bg-white text-brand-black"
                      : "bg-brand-black text-white",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
