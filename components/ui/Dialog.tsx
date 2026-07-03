"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dialog primitive — centered modal untuk konfirmasi, size guide, dll.
 *
 * Untuk pattern slide-from-edge gunakan Sheet, bukan Dialog.
 *
 * Sizes:
 * - sm: max-w-sm (untuk konfirmasi singkat)
 * - md: max-w-md (default)
 * - lg: max-w-lg (untuk konten lebih panjang seperti size guide)
 */

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: DialogSize;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Dialog({
  open,
  onClose,
  title,
  size = "md",
  children,
  footer,
  className,
}: DialogProps) {
  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-40 transition-opacity duration-normal"
      />

      {/* Centered panel */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "dialog-title" : undefined}
          className={cn(
            "pointer-events-auto",
            "w-full bg-canvas border border-border-default",
            "rounded-card shadow-lg",
            "flex flex-col max-h-[90vh]",
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-5 h-14 border-b border-border-subtle shrink-0">
              <h2
                id="dialog-title"
                className="text-heading-3 font-semibold text-text-primary"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className={cn(
                  "w-10 h-10 -mr-2 inline-flex items-center justify-center",
                  "text-text-secondary hover:text-text-primary",
                  "rounded-subtle",
                  "transition-colors duration-fast",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black"
                )}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-border-subtle shrink-0 p-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
