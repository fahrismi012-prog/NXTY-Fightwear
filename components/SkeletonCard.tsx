"use client";

import Skeleton from "./Skeleton";

/**
 * Skeleton product card component
 * Representasi placeholder untuk product card saat loading
 */
export default function SkeletonCard() {
  return (
    <div className="bg-canvas border-2 border-border-subtle overflow-hidden">
      {/* Index badge skeleton */}
      <div className="absolute top-0 left-0 z-10 bg-canvas border-r-2 border-b-2 border-border-subtle px-2 py-1 flex items-center gap-1">
        <span className="w-1 h-1 bg-brand-green" />
        <Skeleton className="w-8 h-3" height="12px" />
      </div>

      {/* Promo badge skeleton */}
      <div className="absolute top-0 right-0 z-10 bg-brand-green">
        <Skeleton className="w-12 h-6" height="24px" />
      </div>

      {/* Image skeleton */}
      <div className="relative aspect-square bg-surface-1 overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="p-3 border-t-2 border-border-subtle bg-canvas">
        {/* Category skeleton */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 bg-brand-green" />
          <Skeleton className="w-16 h-3" height="12px" />
        </div>

        {/* Name skeleton */}
        <div className="mb-3 space-y-2">
          <Skeleton className="w-full h-3" height="12px" />
          <Skeleton className="w-3/4 h-3" height="12px" />
        </div>

        {/* Price skeleton */}
        <div className="flex items-baseline gap-2 mb-3">
          <Skeleton className="w-24 h-5" height="20px" />
          <Skeleton className="w-20 h-3" height="12px" />
        </div>

        {/* Action buttons skeleton */}
        <div className="grid grid-cols-5 gap-0 mb-3 border border-border-subtle">
          <Skeleton className="col-span-3 h-10" height="40px" />
          <Skeleton className="col-span-2 h-10" height="40px" />
        </div>

        {/* Bottom row skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 text-brand-green text-[10px]">★</span>
            <Skeleton className="w-8 h-3" height="12px" />
          </div>
          <Skeleton className="w-16 h-3" height="12px" />
        </div>
      </div>
    </div>
  );
}
