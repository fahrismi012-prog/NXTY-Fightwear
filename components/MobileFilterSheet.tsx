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
  "Sarung Tinju",
  "Hand Wrap",
  "Rashguard",
  "Celana Tarung",
  "Pelindung Kaki",
  "Pelindung Gigi",
  "Pelindung",
  "Tas Gym",
  "Pakaian Olahraga",
  "Aksesoris Latihan",
  "Matras",
  "Pencak Silat",
  "Renang",
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
        <p className="text-xs text-neutral-500 mb-3 uppercase tracking-wider">
          Pilih kategori produk
        </p>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                "w-full text-left px-4 py-3 border-2 font-black uppercase tracking-wider text-sm transition-colors min-h-[44px]",
                active === null
                  ? "bg-brand-green border-brand-green text-text-primary"
                  : "bg-transparent border-border-subtle text-neutral-300 hover:border-brand-green hover:text-brand-green"
              )}
            >
              Semua Kategori
            </button>
          </li>
          {CATEGORIES.map((cat, i) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => handleSelect(cat)}
                className="w-full text-left px-4 py-3 border-2 border-border-subtle bg-transparent text-neutral-300 hover:border-brand-green hover:text-brand-green font-black uppercase tracking-wider text-sm transition-colors min-h-[44px] flex items-center justify-between"
              >
                <span>
                  <span className="text-[10px] text-brand-green mr-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {cat}
                </span>
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
