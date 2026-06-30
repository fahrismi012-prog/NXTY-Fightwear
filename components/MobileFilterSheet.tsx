"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Sheet from "./Sheet";

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Pencak Silat",
  "Taekwondo",
  "Karate",
  "Muaythai",
  "Boxing",
  "Matras",
];

export default function MobileFilterSheet({
  isOpen,
  onClose,
}: MobileFilterSheetProps) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);

  const handleSelect = (cat: string | null) => {
    setActive(cat);
    onClose();
    if (cat === null) {
      router.push("/");
    } else {
      router.push(`/?category=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Kategori">
      <div className="p-4">
        <p className="text-body-sm text-text-muted mb-3">
          Pilih kategori produk
        </p>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                "w-full text-left px-4 py-3 border rounded-subtle font-semibold text-body-sm transition-colors min-h-[48px]",
                active === null
                  ? "bg-brand-green border-brand-green text-white"
                  : "bg-surface-1 border-border-subtle text-text-secondary hover:border-brand-green hover:text-brand-green"
              )}
            >
              Semua Kategori
            </button>
          </li>
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => handleSelect(cat)}
                className="w-full text-left px-4 py-3 border border-border-subtle rounded-subtle bg-surface-1 text-text-secondary hover:border-brand-green hover:text-brand-green font-semibold text-body-sm transition-colors min-h-[48px] flex items-center justify-between"
              >
                <span>{cat}</span>
                <span className="text-brand-green" aria-hidden>
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
