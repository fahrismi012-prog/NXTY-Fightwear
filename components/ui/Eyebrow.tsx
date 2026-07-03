"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Eyebrow primitive — small uppercase label di atas heading/section.
 *
 * Pakai untuk "kicker text" yang memberi konteks pada heading utama.
 * Spec typography: 11px uppercase tracking 0.08em font-weight 600.
 */

export type EyebrowColor = "default" | "red" | "white";

export interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  color?: EyebrowColor;
}

const colorClasses: Record<EyebrowColor, string> = {
  default: "text-text-secondary",
  red: "text-brand-black",
  white: "text-text-primary",
};

export const Eyebrow = forwardRef<HTMLParagraphElement, EyebrowProps>(function Eyebrow(
  { color = "default", className, children, ...rest },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn(
        "text-eyebrow font-semibold uppercase",
        "tracking-[0.08em]",
        colorClasses[color],
        className
      )}
      {...rest}
    >
      {children}
    </p>
  );
});
