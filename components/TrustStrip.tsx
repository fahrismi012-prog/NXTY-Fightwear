"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * TrustStrip — komponen reusable untuk menampilkan trust signals.
 *
 * Dipakai di footer (gratis ongkir, garansi, payment aman), product detail
 * (kirim cepat, original, retur), dan checkout (di fase 2).
 *
 * Variants:
 * - default: padding generous untuk standalone section
 * - compact: minimal padding untuk inline dalam card
 */

export interface TrustStripItem {
  icon: ReactNode;
  label: string;
  description?: string;
}

export interface TrustStripProps {
  items: TrustStripItem[];
  variant?: "default" | "compact";
  className?: string;
}

export function TrustStrip({
  items,
  variant = "default",
  className,
}: TrustStripProps) {
  return (
    <div
      className={cn(
        "grid",
        items.length === 2 ? "grid-cols-2" : "grid-cols-3",
        variant === "default" ? "gap-3 py-5" : "gap-2 py-3",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "flex flex-col items-center text-center",
            variant === "default" ? "gap-2 px-2" : "gap-1.5 px-1"
          )}
        >
          <span
            className={cn(
              "inline-flex items-center justify-center",
              variant === "default"
                ? "w-8 h-8 text-brand-red"
                : "w-6 h-6 text-brand-red"
            )}
            aria-hidden
          >
            {item.icon}
          </span>
          <span
            className={cn(
              "font-semibold text-text-primary",
              variant === "default" ? "text-body-sm" : "text-caption"
            )}
          >
            {item.label}
          </span>
          {item.description && variant === "default" && (
            <span className="text-caption text-text-muted">
              {item.description}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
