"use client";

interface SkeletonProps {
  className?: string;
  animation?: "pulse" | "gradient";
  width?: string;
  height?: string;
}

/**
 * Generic skeleton loading component
 * - animation: "pulse" (default) atau "gradient"
 * - className: Tailwind classes untuk styling
 * - width/height: custom dimensions (default: 100%)
 */
export default function Skeleton({
  className = "",
  animation = "gradient",
  width = "100%",
  height = "auto",
}: SkeletonProps) {
  const animationClass =
    animation === "gradient"
      ? "animate-skeleton-gradient"
      : "animate-skeleton-pulse";

  return (
    <div
      className={`${animationClass} bg-[#262626] rounded-none ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    />
  );
}
