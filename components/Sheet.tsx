"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Full height vs auto height (untuk bottom sheet pattern) */
  fullHeight?: boolean;
}

/**
 * Base bottom sheet untuk mobile. Pattern:
 * - Slide up dari bawah
 * - Backdrop hitam semi-transparan
 * - Tap backdrop atau tombol close untuk dismiss
 * - Lock body scroll saat terbuka
 * - Pakai safe-area-bottom untuk iPhone home indicator
 */
export default function Sheet({
  isOpen,
  onClose,
  title,
  children,
  fullHeight = false,
}: SheetProps) {
  // Lock body scroll saat sheet terbuka
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // ESC key untuk close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "md:hidden fixed inset-0 bg-black/70 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t-2 border-[#dc2626] transition-transform duration-300 flex flex-col",
          fullHeight ? "h-[90vh]" : "max-h-[80vh]",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 h-12 border-b-2 border-[#dc2626] bg-[#0a0a0a] shrink-0">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="w-10 h-10 -mr-2 flex items-center justify-center text-neutral-400 hover:text-[#dc2626] active:scale-95 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </>
  );
}
