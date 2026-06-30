"use client";

import { Slot } from "@/lib/slot";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Button primitive — pondasi semua CTA di NXTY Fightwear.
 *
 * Variants:
 * - primary    : red solid, untuk CTA utama (Beli, Checkout, Bayar)
 * - secondary  : white outline, untuk action sekunder
 * - ghost      : text only, untuk action tersier
 * - destructive: error, untuk destructive action (Hapus, Batal)
 *
 * Sizes:
 * - sm: 32px tinggi (gunakan dalam container 44×44 untuk tap target)
 * - md: 44px tinggi (default, sudah memenuhi tap target)
 * - lg: 56px tinggi (CTA utama mobile)
 *
 * Pakai `asChild` untuk wrap Next/Link tanpa nested button:
 *   <Button asChild><Link href="/">Beranda</Link></Button>
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-brand-green text-white !text-white",
    "hover:bg-brand-green-hover",
    "active:bg-brand-green-hover",
    "disabled:bg-neutral-200 disabled:text-neutral-400",
  ].join(" "),
  secondary: [
    "bg-transparent text-text-primary border border-border-default",
    "hover:bg-surface-1 hover:border-brand-green hover:text-brand-green",
    "active:bg-surface-2",
    "disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent",
  ].join(" "),
  ghost: [
    "bg-transparent text-text-secondary",
    "hover:text-text-primary hover:bg-surface-1",
    "active:bg-surface-2",
    "disabled:text-neutral-400 disabled:hover:bg-transparent",
  ].join(" "),
  destructive: [
    "bg-error-500 text-white",
    "hover:bg-error-600",
    "active:bg-error-600",
    "disabled:bg-neutral-200 disabled:text-neutral-400",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-body-sm gap-1.5",
  md: "h-11 px-4 text-body gap-2",
  lg: "h-14 px-6 text-body-lg gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    loading = false,
    fullWidth = false,
    asChild = false,
    className,
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref
) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  const classes = cn(
    // Base
    "inline-flex items-center justify-center font-semibold",
    "rounded-subtle",
    "transition-colors duration-fast",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:cursor-not-allowed",
    "select-none whitespace-nowrap",
    // Variant + size
    variantClasses[variant],
    sizeClasses[size],
    // Modifiers
    fullWidth && "w-full",
    className
  );

  return (
    <Comp
      ref={ref as never}
      className={classes}
      disabled={isDisabled}
      type={asChild ? undefined : type}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
      ) : leftIcon ? (
        <span className="inline-flex shrink-0" aria-hidden>
          {leftIcon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
      {!loading && rightIcon ? (
        <span className="inline-flex shrink-0" aria-hidden>
          {rightIcon}
        </span>
      ) : null}
    </Comp>
  );
});
