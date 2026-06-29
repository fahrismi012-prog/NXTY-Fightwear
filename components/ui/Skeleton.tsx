"use client";

import { type HTMLAttributes, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton primitive — placeholder loading state.
 *
 * Pakai untuk indicator konten yang masih loading.
 * Respect prefers-reduced-motion (animasi otomatis dinonaktifkan
 * via global CSS di app/globals.css).
 *
 * Variants animation:
 * - gradient: shimmer effect (default)
 * - pulse: simple opacity pulse
 *
 * Variants shape:
 * - text: line height untuk teks
 * - circle: bulat untuk avatar
 * - rect: rectangle generic (default)
 */

export type SkeletonAnimation = "gradient" | "pulse" | "none";
export type SkeletonShape = "text" | "circle" | "rect";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  animation?: SkeletonAnimation;
  shape?: SkeletonShape;
  width?: string | number;
  height?: string | number;
}

const animationClasses: Record<SkeletonAnimation, string> = {
  gradient: "animate-skeleton-gradient",
  pulse: "animate-skeleton-pulse bg-surface-2",
  none: "bg-surface-2",
};

const shapeClasses: Record<SkeletonShape, string> = {
  text: "h-4 rounded-subtle",
  circle: "rounded-full aspect-square",
  rect: "rounded-subtle",
};

export function Skeleton({
  animation = "gradient",
  shape = "rect",
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const inlineStyle: CSSProperties = {
    ...style,
    width:
      typeof width === "number" ? `${width}px` : width ?? style?.width,
    height:
      typeof height === "number" ? `${height}px` : height ?? style?.height,
  };

  return (
    <div
      className={cn(
        animationClasses[animation],
        shapeClasses[shape],
        className
      )}
      style={inlineStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    />
  );
}
