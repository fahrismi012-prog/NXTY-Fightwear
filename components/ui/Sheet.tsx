"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sheet primitive — overlay panel yang slide dari edge layar.
 *
 * Variants `side`:
 * - bottom     : slide from bottom (mobile drawer pattern)
 * - right      : slide from right (cart drawer pattern)
 * - fullscreen : full-screen overlay (mobile search/menu)
 *
 * Features:
 * - Backdrop click → close
 * - ESC → close
 * - Body scroll lock saat open
 * - Swipe-to-close di mobile bottom sheet (threshold 80px)
 * - Focus trap basic (TODO: full focus management di fase berikut)
 *
 * Backward compatibility:
 * - `isOpen` (legacy) dan `open` (new) keduanya didukung
 * - `fullHeight` (legacy) di-map ke side="bottom" size="full"
 */

export type SheetSide = "bottom" | "right" | "fullscreen";
export type SheetSize = "sm" | "md" | "lg" | "full";

export interface SheetProps {
  /** State open (preferred) */
  open?: boolean;
  /** Legacy alias untuk `open` */
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  /** Slide direction */
  side?: SheetSide;
  /** Max-size constraint */
  size?: SheetSize;
  children: ReactNode;
  /** Optional footer slot (sticky bottom dalam sheet) */
  footer?: ReactNode;
  /** Legacy alias untuk side="bottom" size="full" */
  fullHeight?: boolean;
  /** Apakah sheet hanya muncul di mobile (md:hidden) — legacy behavior */
  mobileOnly?: boolean;
  /** ClassName untuk panel */
  className?: string;
}

const sideClasses: Record<SheetSide, { panel: string; closed: string; open: string }> = {
  bottom: {
    panel: "fixed bottom-0 left-0 right-0 border-t border-border-default",
    closed: "translate-y-full",
    open: "translate-y-0",
  },
  right: {
    panel: "fixed top-0 right-0 bottom-0 border-l border-border-default",
    closed: "translate-x-full",
    open: "translate-x-0",
  },
  fullscreen: {
    panel: "fixed inset-0",
    closed: "opacity-0 pointer-events-none",
    open: "opacity-100",
  },
};

function sizeClassesFor(side: SheetSide, size: SheetSize): string {
  if (side === "fullscreen") return "w-full h-full";
  if (side === "right") {
    const widths: Record<SheetSize, string> = {
      sm: "w-full sm:w-80",
      md: "w-full sm:w-96",
      lg: "w-full sm:w-[28rem]",
      full: "w-full",
    };
    return cn("h-full", widths[size]);
  }
  // bottom
  const heights: Record<SheetSize, string> = {
    sm: "max-h-[40vh]",
    md: "max-h-[60vh]",
    lg: "max-h-[80vh]",
    full: "h-[90vh]",
  };
  return cn("w-full", heights[size]);
}

export function Sheet({
  open: openProp,
  isOpen,
  onClose,
  title,
  side = "bottom",
  size = "md",
  children,
  footer,
  fullHeight = false,
  mobileOnly = false,
  className,
}: SheetProps) {
  // Resolve open state
  const resolvedOpen = openProp ?? isOpen ?? false;
  // Legacy: fullHeight maps to bottom + full
  const resolvedSide = fullHeight && side === "bottom" ? "bottom" : side;
  const resolvedSize = fullHeight ? "full" : size;

  const panelRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);

  // Body scroll lock
  useEffect(() => {
    if (!resolvedOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [resolvedOpen]);

  // ESC to close
  useEffect(() => {
    if (!resolvedOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [resolvedOpen, onClose]);

  // Swipe to close (bottom sheet only)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (resolvedSide !== "bottom") return;
    dragStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (resolvedSide !== "bottom" || dragStartY.current === null) return;
    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (deltaY > 0) setDragY(deltaY);
  };
  const handleTouchEnd = () => {
    if (resolvedSide !== "bottom") return;
    if (dragY > 80) {
      onClose();
    }
    setDragY(0);
    dragStartY.current = null;
  };

  const sideCfg = sideClasses[resolvedSide];
  const wrapperHiddenClass = mobileOnly ? "md:hidden" : "";

  const panelTransform =
    resolvedOpen && dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          wrapperHiddenClass,
          "fixed inset-0 bg-black/70 z-40 transition-opacity duration-normal",
          resolvedOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          wrapperHiddenClass,
          "z-50 bg-canvas flex flex-col",
          "transition-transform duration-slow ease-out",
          sideCfg.panel,
          sizeClassesFor(resolvedSide, resolvedSize),
          resolvedOpen ? sideCfg.open : sideCfg.closed,
          className
        )}
        style={panelTransform}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle (bottom sheet only) */}
        {resolvedSide === "bottom" && (
          <div className="flex justify-center pt-2 shrink-0" aria-hidden>
            <div className="w-10 h-1 bg-border-default rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 h-14 border-b border-border-subtle shrink-0">
            <h2 className="text-heading-3 font-semibold text-text-primary">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className={cn(
                "w-10 h-10 -mr-2 inline-flex items-center justify-center",
                "text-text-secondary hover:text-white",
                "rounded-subtle",
                "transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
              )}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className={cn(
            "flex-1 overflow-y-auto",
            resolvedSide === "bottom" && "pb-[env(safe-area-inset-bottom)]"
          )}
        >
          {children}
        </div>

        {/* Footer slot */}
        {footer && (
          <div
            className={cn(
              "border-t border-border-subtle shrink-0",
              resolvedSide === "bottom" && "pb-[env(safe-area-inset-bottom)]"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
