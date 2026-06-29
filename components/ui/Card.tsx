"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Card primitive — container surface untuk grouping konten.
 *
 * Variants:
 * - default  : subtle border, surface-1 bg
 * - elevated : surface-1 bg + shadow-md (untuk floating)
 * - outlined : transparent bg, border-default
 */

export type CardVariant = "default" | "elevated" | "outlined";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface-1 border border-border-subtle",
  elevated: "bg-surface-1 border border-border-subtle shadow-md",
  outlined: "bg-transparent border border-border-default",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", padding = "md", className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-card",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
