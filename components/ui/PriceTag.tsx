"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * PriceTag primitive — formatted IDR price dengan optional original price.
 *
 * Sizes:
 * - md: 16px (default, untuk card)
 * - lg: 24px (untuk hero card, banner)
 * - xl: 32px (untuk product detail page)
 *
 * Otomatis tampilkan harga coret jika `originalPrice > price`.
 * Tambah `showDiscountBadge` untuk render badge "-X%".
 */

export type PriceTagSize = "md" | "lg" | "xl";

export interface PriceTagProps extends HTMLAttributes<HTMLDivElement> {
  price: number;
  originalPrice?: number;
  size?: PriceTagSize;
  showDiscountBadge?: boolean;
}

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatIDR(value: number): string {
  return priceFormatter.format(value);
}

const sizeClasses: Record<PriceTagSize, string> = {
  md: "text-price-md sm:text-price-md",
  lg: "text-price-lg sm:text-[1.75rem]",
  xl: "text-price-xl sm:text-[2.25rem]",
};

const originalSizeClasses: Record<PriceTagSize, string> = {
  md: "text-body-sm",
  lg: "text-body",
  xl: "text-body-lg",
};

export function PriceTag({
  price,
  originalPrice,
  size = "md",
  showDiscountBadge = false,
  className,
  ...rest
}: PriceTagProps) {
  const hasDiscount =
    typeof originalPrice === "number" && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-2 flex-wrap",
        className
      )}
      {...rest}
    >
      <span
        className={cn(
          "font-extrabold text-text-primary tracking-tight tabular-nums",
          sizeClasses[size]
        )}
      >
        {formatIDR(price)}
      </span>
      {hasDiscount && (
        <>
          <span
            className={cn(
              "text-text-muted line-through tabular-nums",
              originalSizeClasses[size]
            )}
          >
            {formatIDR(originalPrice)}
          </span>
          {showDiscountBadge && (
            <span
              className={cn(
                "inline-flex items-center justify-center",
                "rounded-subtle bg-brand-black text-text-primary",
                "text-eyebrow font-bold uppercase tracking-[0.08em]",
                "px-1.5 py-0.5"
              )}
            >
              -{discountPercent}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
