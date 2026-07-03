"use client";

import { Slot } from "@/lib/slot";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * IconButton primitive — tombol icon-only dengan badge optional.
 *
 * Sizes:
 * - sm: 32×32 (gunakan dalam container 44×44 untuk tap target)
 * - md: 40×40 (sub-44 — pertimbangkan padding tap area)
 * - lg: 44×44 (default, memenuhi tap target)
 *
 * aria-label WAJIB diisi (icon-only tidak punya text label).
 */

export type IconButtonVariant = "ghost" | "solid" | "outline";
export type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonOwnProps {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  badge?: number;
  asChild?: boolean;
  "aria-label": string;
}

export type IconButtonProps = IconButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">;

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: [
    "bg-transparent text-text-secondary",
    "hover:bg-surface-1 hover:text-text-primary",
    "active:bg-surface-2",
    "disabled:text-neutral-600 disabled:hover:bg-transparent",
  ].join(" "),
  solid: [
    "bg-brand-black text-text-primary",
    "hover:bg-brand-black-hover",
    "active:bg-brand-black-hover",
    "disabled:bg-neutral-800 disabled:text-neutral-600",
  ].join(" "),
  outline: [
    "bg-transparent text-text-primary border border-border-default",
    "hover:border-brand-black hover:text-brand-black",
    "active:bg-surface-1",
    "disabled:border-neutral-700 disabled:text-neutral-600",
  ].join(" "),
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-11 h-11",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    variant = "ghost",
    size = "lg",
    badge,
    asChild = false,
    className,
    type = "button",
    ...rest
  },
  ref
) {
  const Comp = asChild ? Slot : "button";
  const showBadge = typeof badge === "number" && badge > 0;

  return (
    <Comp
      ref={ref as never}
      className={cn(
        "relative inline-flex items-center justify-center shrink-0",
        "rounded-subtle",
        "transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      type={asChild ? undefined : type}
      {...rest}
    >
      <span className="inline-flex" aria-hidden>
        {icon}
      </span>
      {showBadge && (
        <span
          aria-label={`${badge} item`}
          className={cn(
            "absolute -top-1 -right-1",
            "min-w-[18px] h-[18px] px-1",
            "bg-brand-black text-text-primary",
            "rounded-full",
            "text-[10px] font-bold leading-none",
            "inline-flex items-center justify-center",
            "ring-2 ring-canvas"
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Comp>
  );
});
