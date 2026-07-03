"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Badge primitive — label kecil untuk status/promo/category.
 *
 * Variants:
 * - default : neutral surface
 * - promo   : red solid (untuk diskon, sale)
 * - new     : red outline (untuk produk baru)
 * - success : green semi-transparent
 * - warning : yellow semi-transparent
 */

export type BadgeVariant = "default" | "promo" | "new" | "success" | "warning";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-2 text-text-secondary",
  promo: "bg-brand-black text-text-primary",
  new: "bg-transparent text-brand-black border border-brand-black",
  success: "bg-success-500/15 text-success-500",
  warning: "bg-warning-500/15 text-warning-500",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-eyebrow px-1.5 py-0.5 leading-none",
  md: "text-caption px-2 py-1",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "default", size = "md", className, children, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-semibold",
        "rounded-subtle",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
});
