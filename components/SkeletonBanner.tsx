"use client";

import Skeleton from "./Skeleton";

/**
 * Skeleton banner carousel component
 * Representasi placeholder untuk banner carousel saat loading
 */
export default function SkeletonBanner() {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-surface-1 border-2 border-brand-black overflow-hidden">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/70 to-transparent" />
      {/* Stripes */}
      <div className="absolute inset-0 bg-stripes-red pointer-events-none" />
      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-md">
            {/* Badge skeleton */}
            <div className="inline-block bg-brand-black mb-3">
              <Skeleton className="w-20 h-6" height="24px" />
            </div>

            {/* Title skeleton */}
            <div className="mb-2 space-y-2">
              <Skeleton className="w-3/4 h-6" height="24px" />
              <Skeleton className="w-1/2 h-6" height="24px" />
            </div>

            {/* Subtitle skeleton */}
            <div className="mb-2">
              <Skeleton className="w-1/3 h-4" height="16px" />
            </div>

            {/* Description skeleton */}
            <div className="mb-4 space-y-2">
              <Skeleton className="w-full h-3" height="12px" />
              <Skeleton className="w-full h-3" height="12px" />
            </div>

            {/* CTA skeleton */}
            <Skeleton className="w-32 h-9" height="36px" />
          </div>
        </div>
      </div>

      {/* Indicators skeleton */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            className={i === 0 ? "w-8" : "w-3"}
            height="4px"
            width={i === 0 ? "32px" : "12px"}
          />
        ))}
      </div>
    </div>
  );
}
