# Mobile UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Meningkatkan kenyamanan mobile UX NXTY Fightwear melalui bottom navigation, perbaikan overflow, tap targets, dan typography — dengan tetap mempertahankan brutalist aesthetic.

**Architecture:** Mobile-first pattern dengan bottom navigation bar sebagai primary navigation. Komponen-komponen baru (BottomNav, MobileFilterSheet, MobileSearchSheet, SafeArea) ditambahkan; komponen existing (Navbar, ProductCard, CartDrawer, dll) diperbaiki styling untuk mobile. Tidak ada perubahan logika bisnis.

**Tech Stack:** Next.js 16.2.9 (App Router), TypeScript, Tailwind CSS, React 19.2.4. Existing utility: `cn()` dari `@/lib/utils`.

**Spec reference:** `docs/superpowers/specs/2026-06-26-mobile-ux-design.md`

**Verification strategy:** Project ini tidak punya test framework. Verification per task menggunakan:
- `npx tsc --noEmit` — TypeScript check
- `npm run build` — production build
- Manual visual smoke test di browser dev mode (http://localhost:3000)

**Dev server:** Sedang berjalan di PID 22808 di http://localhost:3000. Perubahan komponen akan auto-reload via Turbopack.

---

## Task Map

| Fase | Task | Output |
|---|---|---|
| 1 — Fondasi | 1.1 Hook `useMediaQuery` | `hooks/useMediaQuery.ts` |
| 1 — Fondasi | 1.2 Component `SafeArea` | `components/SafeArea.tsx` |
| 1 — Fondasi | 1.3 Component `BottomNav` | `components/BottomNav.tsx` |
| 1 — Fondasi | 1.4 Mount di layout & homepage | `app/layout.tsx`, `app/page.tsx` |
| 2 — Sheets | 2.1 Base component `Sheet` | `components/Sheet.tsx` |
| 2 — Sheets | 2.2 Component `MobileFilterSheet` | `components/MobileFilterSheet.tsx` |
| 2 — Sheets | 2.3 Component `MobileSearchSheet` | `components/MobileSearchSheet.tsx` |
| 3 — Homepage | 3.1 HeroSection overflow fix | `components/HeroSection.tsx` |
| 3 — Homepage | 3.2 CategoryPills scroll cue | `components/CategoryPills.tsx` |
| 3 — Homepage | 3.3 ProductCard mobile layout | `components/ProductCard.tsx` |
| 4 — Detail & Cart | 4.1 Product detail sticky CTA | `app/products/[slug]/page.tsx` |
| 4 — Detail & Cart | 4.2 CartDrawer polish | `components/CartDrawer.tsx` |
| 5 — Form & Static | 5.1 Checkout sticky bottom | `app/checkout/page.tsx` |
| 5 — Form & Static | 5.2 Tentang-kami mobile check | `app/tentang-kami/page.tsx` |
| 5 — Form & Static | 5.3 Cara-order mobile check | `app/cara-order/page.tsx` |
| 6 — Verifikasi | 6.1 Final build & smoke test | All components verified |

---

## Fase 1 — Fondasi

### Task 1.1: Hook `useMediaQuery`

**Files:**
- Create: `hooks/useMediaQuery.ts`

- [ ] **Step 1: Buat folder & file hook**

```bash
mkdir -p /home/administrator/projects/nxty-fightwear/hooks
```

- [ ] **Step 2: Tulis hook implementation**

Buat file `hooks/useMediaQuery.ts`:

```typescript
"use client";

import { useEffect, useState } from "react";

/**
 * Hook untuk mendeteksi apakah viewport saat ini cocok dengan media query.
 * SSR-safe: default ke `false` di server, lalu di-hydrate di client.
 *
 * @param query - CSS media query string, mis. "(max-width: 767px)" atau "(min-width: 768px)"
 * @returns boolean — true jika media query match
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 767px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** Preset breakpoints untuk konsistensi. md = 768px (Tailwind default). */
export const BREAKPOINTS = {
  isMobile: "(max-width: 767px)",
  isTablet: "(min-width: 768px) and (max-width: 1023px)",
  isDesktop: "(min-width: 768px)",
} as const;
```

- [ ] **Step 3: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add hooks/useMediaQuery.ts
git commit -m "feat(hooks): add useMediaQuery with breakpoint presets"
```

---

### Task 1.2: Component `SafeArea`

**Files:**
- Create: `components/SafeArea.tsx`

- [ ] **Step 1: Tulis component**

```typescript
import { cn } from "@/lib/utils";

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  /** Apply top safe area (untuk header di bawah notch) */
  top?: boolean;
  /** Apply bottom safe area (untuk konten di atas home indicator) */
  bottom?: boolean;
}

/**
 * Wrapper yang apply safe-area padding untuk device iOS dengan notch/home indicator.
 * Pakai CSS env() function yang native di-support iOS 11+ dan Android.
 */
export default function SafeArea({
  children,
  className,
  top = false,
  bottom = true,
}: SafeAreaProps) {
  return (
    <div
      className={cn(
        top && "pt-[env(safe-area-inset-top)]",
        bottom && "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/SafeArea.tsx
git commit -m "feat(components): add SafeArea wrapper for iOS notch/home indicator"
```

---

### Task 1.3: Component `BottomNav`

**Files:**
- Create: `components/BottomNav.tsx`

- [ ] **Step 1: Tulis component**

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onFilterClick: () => void;
  onSearchClick: () => void;
  onCartClick: () => void;
}

const ICON_SIZE = 22;

export default function BottomNav({
  onFilterClick,
  onSearchClick,
  onCartClick,
}: BottomNavProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const items = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      type: "link" as const,
      href: "/",
      active: pathname === "/",
    },
    {
      key: "kategori",
      label: "Kategori",
      icon: LayoutGrid,
      type: "action" as const,
      onClick: onFilterClick,
    },
    {
      key: "cari",
      label: "Cari",
      icon: Search,
      type: "action" as const,
      onClick: onSearchClick,
    },
    {
      key: "cart",
      label: "Cart",
      icon: ShoppingBag,
      type: "action" as const,
      onClick: onCartClick,
      badge: totalItems,
    },
    {
      key: "akun",
      label: "Akun",
      icon: User,
      type: "link" as const,
      href: "/tentang-kami",
      active: pathname === "/tentang-kami",
    },
  ];

  return (
    <nav
      aria-label="Navigasi utama"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0a] border-t-2 border-[#dc2626] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          const content = (
            <>
              {/* Active indicator (top bar) */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 transition-colors",
                  isActive ? "bg-[#dc2626]" : "bg-transparent"
                )}
              />
              {/* Icon with badge */}
              <span className="relative">
                <Icon
                  size={ICON_SIZE}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-[#dc2626]" : "text-neutral-400"
                  )}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#dc2626] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center border border-[#0a0a0a]">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-wide mt-1 transition-colors",
                  isActive ? "text-[#dc2626]" : "text-neutral-400"
                )}
              >
                {item.label}
              </span>
            </>
          );

          const className = cn(
            "relative flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
          );

          if (item.type === "link") {
            return (
              <li key={item.key} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className={className}
                >
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.key} className="flex-1">
              <button
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                className={className}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/BottomNav.tsx
git commit -m "feat(components): add BottomNav for mobile (<md) navigation"
```

---

### Task 1.4: Mount BottomNav di layout & homepage

**Files:**
- Modify: `app/layout.tsx` (tambah BottomNav, dengan state management)
- Modify: `app/page.tsx` (tambah padding-bottom)
- Create: `components/AppShell.tsx` (wrapper untuk state BottomNav + sheets + drawer)

- [ ] **Step 1: Buat `AppShell` wrapper**

`components/AppShell.tsx`:

```typescript
"use client";

import { useState } from "react";
import BottomNav from "./BottomNav";
import CartDrawer from "./CartDrawer";
import MobileFilterSheet from "./MobileFilterSheet";
import MobileSearchSheet from "./MobileSearchSheet";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Wrapper yang mengelola state global untuk:
 * - BottomNav (mobile only)
 * - CartDrawer
 * - MobileFilterSheet (kategori)
 * - MobileSearchSheet (pencarian)
 *
 * Dipasang di layout.tsx sehingga tersedia di semua halaman.
 */
export default function AppShell({ children }: AppShellProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {children}

      <MobileFilterSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
      <MobileSearchSheet
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* BottomNav disembunyikan saat overlay/sheet/drawer terbuka */}
      {!cartOpen && !filterOpen && !searchOpen && (
        <BottomNav
          onCartClick={() => setCartOpen(true)}
          onFilterClick={() => setFilterOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
        />
      )}
    </>
  );
}
```

> Catatan: `MobileFilterSheet` dan `MobileSearchSheet` dibuat di Fase 2. Untuk sekarang, file ini akan error sampai komponen tersebut dibuat. Kita lanjutkan dan akan resolve di Fase 2.

- [ ] **Step 2: Update `app/layout.tsx`**

Replace seluruh isi `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NXTY Fightwear — Peralatan Olahraga & Fightwear",
  description:
    "Toko online NXTY Fightwear. Jual boxing gloves, hand wrap, rashguard, fight shorts, shin guard, dan apparel olahraga berkualitas dengan harga terjangkau.",
  keywords: [
    "NXTY Fightwear",
    "boxing gloves",
    "hand wrap",
    "rashguard",
    "fight shorts",
    "shin guard",
    "mouth guard",
    "gym bag",
    "apparel olahraga",
    "aksesoris latihan",
    "toko online",
    "UMKM",
  ],
  authors: [{ name: "NXTY Fightwear" }],
  openGraph: {
    title: "NXTY Fightwear — Peralatan Olahraga & Fightwear",
    description:
      "Temukan perlengkapan latihan terbaik. Boxing gloves, rashguard, fight shorts, dan banyak lagi.",
    type: "website",
    locale: "id_ID",
    siteName: "NXTY Fightwear",
  },
  twitter: {
    card: "summary_large_image",
    title: "NXTY Fightwear",
    description: "Peralatan Olahraga & Fightwear Berkualitas",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} antialiased min-h-screen bg-[#0a0a0a] text-white selection:bg-[#dc2626] selection:text-white`}
      >
        <CartProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update `app/page.tsx` — tambah padding-bottom**

Read `app/page.tsx`, find the outermost `<main>` or main container. Add `pb-20 md:pb-0` class to ensure bottom content is not covered by BottomNav on mobile.

Specifically, the outermost div/main element should have `pb-20 md:pb-0` added. Example (adjust to actual code):

```tsx
<main className="... pb-20 md:pb-0">
```

- [ ] **Step 4: Verifikasi TypeScript (ekspektasi: error karena MobileFilterSheet & MobileSearchSheet belum ada)**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: errors about missing modules `MobileFilterSheet` and `MobileSearchSheet`. **Normal, akan fix di Fase 2.**

- [ ] **Step 5: Commit**

```bash
git add components/AppShell.tsx app/layout.tsx app/page.tsx
git commit -m "feat(shell): mount AppShell with BottomNav state management"
```

---

## Fase 2 — Sheets

### Task 2.1: Base component `Sheet`

**Files:**
- Create: `components/Sheet.tsx`

- [ ] **Step 1: Tulis base sheet component**

```typescript
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
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
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
          "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t-2 border-[#dc2626] transition-transform duration-300 max-h-[90vh] flex flex-col",
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
```

- [ ] **Step 2: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/Sheet.tsx
git commit -m "feat(components): add Sheet base component for mobile overlays"
```

---

### Task 2.2: Component `MobileFilterSheet`

**Files:**
- Create: `components/MobileFilterSheet.tsx`
- Modify: `app/page.tsx` (kirim kategori & active state via context atau props)

- [ ] **Step 1: Tulis component**

```typescript
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
  "Boxing Gloves",
  "Hand Wrap",
  "Rashguard",
  "Fight Shorts",
  "Shin Guard",
  "Mouth Guard",
  "Gym Bag",
  "Apparel",
  "Aksesoris",
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
      // Navigate ke homepage dengan query param (atau gunakan context untuk filter)
      // Untuk simplicity: navigate dengan hash, atau rely on global filter state
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
                  ? "bg-[#dc2626] border-[#dc2626] text-white"
                  : "bg-transparent border-[#262626] text-neutral-300 hover:border-[#dc2626] hover:text-[#dc2626]"
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
                className="w-full text-left px-4 py-3 border-2 border-[#262626] bg-transparent text-neutral-300 hover:border-[#dc2626] hover:text-[#dc2626] font-black uppercase tracking-wider text-sm transition-colors min-h-[44px] flex items-center justify-between"
              >
                <span>
                  <span className="text-[10px] text-[#dc2626] mr-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {cat}
                </span>
                <span className="text-[#dc2626]">→</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
```

- [ ] **Step 2: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/MobileFilterSheet.tsx
git commit -m "feat(components): add MobileFilterSheet for category selection"
```

---

### Task 2.3: Component `MobileSearchSheet`

**Files:**
- Create: `components/MobileSearchSheet.tsx`

- [ ] **Step 1: Tulis component**

```typescript
"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Sheet from "./Sheet";

interface MobileSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchSheet({
  isOpen,
  onClose,
}: MobileSearchSheetProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus saat dibuka
  useEffect(() => {
    if (isOpen) {
      // Delay agar transition selesai
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      onClose();
      router.push(`/?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} fullHeight title="Cari Produk">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <label htmlFor="mobile-search-input" className="sr-only">
            Cari produk
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#dc2626]"
              size={20}
            />
            <input
              ref={inputRef}
              id="mobile-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-[#161616] text-white text-base pl-11 pr-11 py-3 border-2 border-[#262626] focus:border-[#dc2626] focus:outline-none placeholder:text-neutral-600 min-h-[48px]"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-[#dc2626]"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>

        <div className="mt-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-3">
            // Populer
          </p>
          <div className="flex flex-wrap gap-2">
            {["Boxing Gloves", "Hand Wrap", "Rashguard", "Fight Shorts"].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    onClose();
                    router.push(`/?q=${encodeURIComponent(term)}`);
                  }}
                  className="px-3 py-2 border-2 border-[#262626] text-xs font-black uppercase tracking-wider text-neutral-300 hover:border-[#dc2626] hover:text-[#dc2626] transition-colors min-h-[40px]"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!query.trim()}
          className="w-full mt-8 py-3.5 bg-[#dc2626] text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#dc2626] disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors min-h-[48px]"
        >
          Cari
        </button>
      </div>
    </Sheet>
  );
}
```

- [ ] **Step 2: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Verifikasi build keseluruhan**

Run: `cd /home/administrator/projects/nxty-fightwear && npm run build`
Expected: exit 0. (MobileFilterSheet dan MobileSearchSheet sekarang sudah dibuat, AppShell tidak akan error lagi.)

- [ ] **Step 4: Commit**

```bash
git add components/MobileSearchSheet.tsx
git commit -m "feat(components): add MobileSearchSheet for mobile search"
```

---

## Fase 3 — Homepage Polish

### Task 3.1: HeroSection — fix overflow mobile

**Files:**
- Modify: `components/HeroSection.tsx`

- [ ] **Step 1: Update ukuran "01" background & marquee**

Di `components/HeroSection.tsx`, cari dan ganti:

**Baris 22-27** (background "01"):
```tsx
{/* Huge background number */}
<div
  aria-hidden
  className="absolute -top-12 -right-8 text-[14rem] sm:text-[22rem] lg:text-[30rem] font-black text-[#161616] leading-[0.85] pointer-events-none select-none italic"
>
  01
</div>
```

Menjadi:
```tsx
{/* Huge background number */}
<div
  aria-hidden
  className="absolute -top-12 -right-8 text-[10rem] sm:text-[22rem] lg:text-[30rem] font-black text-[#161616] leading-[0.85] pointer-events-none select-none italic"
>
  01
</div>
```

(Perubahan hanya `text-[14rem]` → `text-[10rem]` untuk mobile default.)

**Marquee text size** (baris 51):
```tsx
className="px-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] flex items-center gap-5"
```

Menjadi:
```tsx
className="px-5 text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] flex items-center gap-5"
```

(Perubahan hanya `text-[10px]` → `text-[11px]`.)

- [ ] **Step 2: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Smoke test visual**

Buka http://localhost:3000 di browser DevTools (device mode 375px). Verifikasi:
- [ ] Angka "01" di belakang hero tidak overflow di kanan
- [ ] Marquee text readable (tidak terlalu kecil)

- [ ] **Step 4: Commit**

```bash
git add components/HeroSection.tsx
git commit -m "fix(hero): reduce mobile size of background 01 and marquee text"
```

---

### Task 3.2: CategoryPills — scroll cue gradient

**Files:**
- Modify: `components/CategoryPills.tsx`

- [ ] **Step 1: Tambah gradient cue di kanan**

Replace seluruh isi `components/CategoryPills.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryPills({
  categories,
  activeCategory,
  onSelect,
}: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Detect apakah konten overflow di kanan (cue untuk scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide"
      >
        <div className="flex min-w-max">
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "shrink-0 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] border-2 transition-colors flex items-center gap-2 min-h-[44px]",
              activeCategory === null
                ? "bg-[#dc2626] border-[#dc2626] text-white"
                : "bg-transparent border-[#262626] text-neutral-400 hover:border-[#dc2626] hover:text-[#dc2626]"
            )}
          >
            <span className="text-[9px] opacity-70">00</span>
            ALL
          </button>
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                "shrink-0 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] border-2 border-l-0 transition-colors flex items-center gap-2 whitespace-nowrap min-h-[44px]",
                activeCategory === cat
                  ? "bg-[#dc2626] border-[#dc2626] text-white"
                  : "bg-transparent border-[#262626] text-neutral-400 hover:border-[#dc2626] hover:text-[#dc2626]"
              )}
            >
              <span className="text-[9px] opacity-70">{String(i + 1).padStart(2, "0")}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Right-edge gradient cue */}
      {canScrollRight && (
        <div
          aria-hidden
          className="md:hidden pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-[#0a0a0a]"
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/CategoryPills.tsx
git commit -m "feat(pills): add right-edge scroll cue and 44px tap target"
```

---

### Task 3.3: ProductCard — mobile layout

**Files:**
- Modify: `components/ProductCard.tsx`

- [ ] **Step 1: Replace quick actions section**

Di `components/ProductCard.tsx`, cari blok:

```tsx
{/* Quick actions */}
<div className="grid grid-cols-5 gap-0 mb-3 border border-[#262626]">
  <button ... >
  <button ... >
</div>
{/* Bottom row: rating */}
<div className="flex items-center justify-between pt-2 border-t border-[#262626]">
  ...
</div>
```

Ganti seluruh blok (mulai dari `{/* Quick actions */}` sampai akhir `{/* Bottom row: rating */}`) dengan:

```tsx
{/* Quick actions - mobile: stacked full-width buttons */}
<div className="flex flex-col gap-1.5 mb-2 md:hidden">
  <button
    onClick={handleAddToCart}
    className="w-full flex items-center justify-center gap-1.5 px-3 py-3 bg-[#dc2626] hover:bg-white text-white hover:text-[#dc2626] text-xs font-black uppercase tracking-[0.15em] transition-colors border-2 border-[#dc2626] hover:border-white min-h-[44px]"
    aria-label="Tambah ke keranjang"
  >
    <ShoppingCart className="w-3.5 h-3.5" />
    ADD TO CART
  </button>
  <button
    onClick={handleBuyNow}
    className="w-full flex items-center justify-center gap-1.5 px-3 py-3 bg-transparent hover:bg-[#dc2626] text-[#dc2626] hover:text-white border-2 border-[#dc2626] text-xs font-black uppercase tracking-[0.15em] transition-colors min-h-[44px]"
    aria-label="Beli sekarang"
  >
    <Zap className="w-3.5 h-3.5 fill-current" />
    BELI SEKARANG
  </button>
</div>

{/* Quick actions - desktop: split buttons + rating */}
<div className="hidden md:block">
  <div className="grid grid-cols-5 gap-0 mb-3 border border-[#262626]">
    <button
      onClick={handleAddToCart}
      className="col-span-3 flex items-center justify-center gap-1.5 px-2 py-2 bg-transparent hover:bg-[#dc2626] text-neutral-300 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] transition-colors border-r border-[#262626]"
      aria-label="Tambah ke keranjang"
    >
      <ShoppingCart className="w-3 h-3" />
      <span className="hidden sm:inline">CART</span>
      <span className="sm:hidden">+</span>
    </button>
    <button
      onClick={handleBuyNow}
      className="col-span-2 flex items-center justify-center gap-1.5 px-2 py-2 bg-[#dc2626] hover:bg-white text-white hover:text-[#dc2626] text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
      aria-label="Beli sekarang"
    >
      <Zap className="w-3 h-3 fill-current" />
      BUY
    </button>
  </div>

  {/* Bottom row: rating */}
  <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
    <div className="flex items-center gap-1 font-mono">
      <span className="text-[#dc2626] text-[10px]">★</span>
      <span className="text-[10px] text-white font-bold">
        {product.rating.toFixed(1)}
      </span>
      <span className="text-[9px] text-neutral-600">/5</span>
    </div>
    <Link
      href={`/products/${product.slug}`}
      className="text-[9px] font-black uppercase tracking-[0.2em] text-[#dc2626] hover:text-white transition-colors"
    >
      DETAILS →
    </Link>
  </div>
</div>
```

> Note: Pada mobile (`md:hidden`), rating & DETAILS link tidak ditampilkan — user mendapat rating & detail saat masuk product detail page. Ini menyederhanakan kartu dan mencegah overcrowding.

- [ ] **Step 2: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Smoke test visual**

Buka http://localhost:3000 di browser DevTools (device mode 375px). Verifikasi:
- [ ] ProductCard mobile menampilkan 2 tombol stacked: "ADD TO CART" (merah) + "BELI SEKARANG" (outline)
- [ ] Tombol minimal 44px tinggi (easy to tap)
- [ ] Tidak ada rating row di mobile
- [ ] Di desktop (≥768px), layout lama (split buttons + rating) masih berfungsi

- [ ] **Step 4: Commit**

```bash
git add components/ProductCard.tsx
git commit -m "feat(card): mobile-first stacked buttons (44px tap target), rating moved to detail page"
```

---

## Fase 4 — Detail & Cart

### Task 4.1: Product detail — sticky bottom CTA

**Files:**
- Modify: `app/products/[slug]/page.tsx`

> Asumsi: file ini sudah ada dan render detail produk. Pola yang akan ditambahkan: sticky bottom area dengan tombol "ADD TO CART" + "BELI" yang tidak tertutup BottomNav.

- [ ] **Step 1: Read existing file**

Run: `cd /home/administrator/projects/nxty-fightwear && wc -l app/products/[slug]/page.tsx`
Expected: ~300-400 baris.

- [ ] **Step 2: Identifikasi tombol CTA existing**

Cari di file `<button>` atau `<Link>` yang bertindak sebagai "Add to Cart" / "Beli Sekarang". Biasanya di bagian bawah sebelum closing `</div>`.

- [ ] **Step 3: Extract CTA ke sticky bottom**

Bungkus tombol CTA existing dengan wrapper sticky bottom mobile. Pattern:

```tsx
{/* Sticky bottom CTA - mobile only */}
<div className="md:hidden fixed bottom-16 left-0 right-0 z-20 bg-[#0a0a0a] border-t-2 border-[#dc2626] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
  <div className="flex gap-2">
    <button
      type="button"
      onClick={handleAddToCart}
      className="flex-1 py-3 bg-[#dc2626] text-white text-sm font-black uppercase tracking-wider hover:bg-white hover:text-[#dc2626] transition-colors min-h-[48px]"
    >
      Add to Cart
    </button>
    <button
      type="button"
      onClick={handleBuyNow}
      className="flex-1 py-3 bg-white text-[#dc2626] text-sm font-black uppercase tracking-wider border-2 border-[#dc2626] hover:bg-[#dc2626] hover:text-white transition-colors min-h-[48px]"
    >
      Beli
    </button>
  </div>
</div>
```

- [ ] **Step 4: Hide CTA original di mobile**

Cari CTA original, tambahkan class `hidden md:flex` atau bungkus dengan conditional `md:block`. Ini supaya tidak ada duplicate CTA.

- [ ] **Step 5: Tambah padding-bottom di main content**

Pastikan outer wrapper halaman punya `pb-32 md:pb-0` untuk accommodate sticky CTA + BottomNav di mobile.

- [ ] **Step 6: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Smoke test**

Buka halaman produk manapun di mobile view. Verifikasi:
- [ ] Bottom CTA sticky muncul, di atas BottomNav (z-20 vs z-30)
- [ ] Tap tombol bekerja (add to cart / checkout)
- [ ] CTA tidak menutupi konten penting

- [ ] **Step 8: Commit**

```bash
git add app/products/[slug]/page.tsx
git commit -m "feat(product-detail): add sticky bottom CTA for mobile"
```

---

### Task 4.2: CartDrawer polish

**Files:**
- Modify: `components/CartDrawer.tsx`

- [ ] **Step 1: Naikkan ukuran image per item**

Cari:
```tsx
<div className="relative w-16 h-16 bg-[#161616] overflow-hidden shrink-0 border border-[#262626]">
```

Ganti ke:
```tsx
<div className="relative w-20 h-20 bg-[#161616] overflow-hidden shrink-0 border border-[#262626]">
```

- [ ] **Step 2: Naikkan padding per item**

Cari:
```tsx
className="flex gap-3 bg-[#0a0a0a] p-3 border-b-2 border-[#262626] last:border-b-0"
```

Ganti `p-3` ke `p-4`:
```tsx
className="flex gap-3 bg-[#0a0a0a] p-4 border-b-2 border-[#262626] last:border-b-0"
```

- [ ] **Step 3: Perbesar tombol quantity**

Cari tombol quantity `Minus`/`Plus`:
```tsx
className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:bg-[#dc2626] hover:text-white"
```

Ganti `w-7 h-7` ke `w-9 h-9` (36×36 px, acceptable di dalam dense layout):
```tsx
className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:bg-[#dc2626] hover:text-white"
```

Juga update sibling-nya (yang ada border-l/r):
```tsx
className="w-8 text-center text-xs font-mono font-black text-white flex items-center justify-center border-l border-r border-[#262626]"
```

Ganti `w-8` ke `w-9`:
```tsx
className="w-9 text-center text-xs font-mono font-black text-white flex items-center justify-center border-l border-r border-[#262626]"
```

- [ ] **Step 4: Verifikasi TypeScript**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Smoke test**

Buka cart drawer di mobile (tambah item dulu ke cart). Verifikasi:
- [ ] Image per item lebih besar (80×80)
- [ ] Padding lebih lega
- [ ] Tombol +/- lebih mudah ditekan

- [ ] **Step 6: Commit**

```bash
git add components/CartDrawer.tsx
git commit -m "feat(cart-drawer): larger image, padding, and quantity buttons for mobile"
```

---

## Fase 5 — Form & Static Pages

### Task 5.1: Checkout — sticky bottom action

**Files:**
- Modify: `app/checkout/page.tsx`

- [ ] **Step 1: Identifikasi section total & tombol bayar**

Cari di file `app/checkout/page.tsx` bagian yang menampilkan total dan tombol "Bayar" / "Lanjut Bayar".

- [ ] **Step 2: Buat sticky bottom action bar mobile**

Tambahkan di akhir `<main>` atau sebagai sibling:

```tsx
{/* Sticky bottom action - mobile only */}
<div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#0a0a0a] border-t-2 border-[#dc2626] p-3 pb-[env(safe-area-inset-bottom)]">
  <div className="flex items-center gap-3">
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Total</p>
      <p className="text-base font-black text-white truncate">{formatPrice(total)}</p>
    </div>
    <button
      type="submit"
      form="checkout-form"
      className="px-5 py-3.5 bg-[#dc2626] text-white text-sm font-black uppercase tracking-wider hover:bg-white hover:text-[#dc2626] transition-colors min-h-[48px]"
    >
      Bayar
    </button>
  </div>
</div>
```

> Sesuaikan `id` form selector (`form="checkout-form"`) dengan id form checkout yang sudah ada.

- [ ] **Step 3: Add padding-bottom di main**

Cari main wrapper, tambah `pb-32 md:pb-0`:
```tsx
<main className="... pb-32 md:pb-0">
```

- [ ] **Step 4: Verifikasi TypeScript & smoke test**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Buka `/checkout` di mobile view. Verifikasi sticky bottom muncul.

- [ ] **Step 5: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat(checkout): add sticky bottom total + pay button for mobile"
```

---

### Task 5.2: Tentang-kami mobile check

**Files:**
- Modify: `app/tentang-kami/page.tsx`

- [ ] **Step 1: Read file & identifikasi masalah**

Run: `cd /home/administrator/projects/nxty-fightwear && wc -l app/tentang-kami/page.tsx`

Periksa apakah ada:
- Text dengan font size <12px di mobile
- Elemen dengan padding/width fixed yang bisa overflow di 320px
- Link/button dengan tinggi <44px

- [ ] **Step 2: Fix masalah yang ditemukan**

Misalnya:
- Naikkan font mobile dari `text-[10px]` ke `text-xs` (12px) untuk body text
- Ganti `width: 400px` jadi `max-w-[400px]`
- Tambah padding mobile yang sesuai

- [ ] **Step 3: Verifikasi**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Buka `/tentang-kami` di DevTools mobile view (375px). Verifikasi tidak ada overflow.

- [ ] **Step 4: Commit (jika ada perubahan)**

```bash
git add app/tentang-kami/page.tsx
git commit -m "fix(tentang-kami): mobile layout adjustments"
```

> Jika tidak ada masalah yang ditemukan, skip task ini dan laporkan.

---

### Task 5.3: Cara-order mobile check

**Files:**
- Modify: `app/cara-order/page.tsx`

- [ ] **Step 1: Read file & identifikasi masalah**

Run: `cd /home/administrator/projects/nxty-fightwear && wc -l app/cara-order/page.tsx`

Periksa hal yang sama seperti Task 5.2.

- [ ] **Step 2: Fix masalah yang ditemukan**

Naikkan font, fix overflow, perbesar tap targets jika perlu.

- [ ] **Step 3: Verifikasi**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Buka `/cara-order` di DevTools mobile view (375px). Verifikasi tidak ada overflow.

- [ ] **Step 4: Commit (jika ada perubahan)**

```bash
git add app/cara-order/page.tsx
git commit -m "fix(cara-order): mobile layout adjustments"
```

> Jika tidak ada masalah yang ditemukan, skip task ini dan laporkan.

---

## Fase 6 — Final Verifikasi

### Task 6.1: Full build & smoke test

**Files:** none (verification only)

- [ ] **Step 1: TypeScript check**

Run: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 2: Production build**

Run: `cd /home/administrator/projects/nxty-fightwear && npm run build`
Expected: exit 0, no errors. Build success message muncul.

- [ ] **Step 3: Restart dev server (jika perlu)**

Dev server PID 22808 masih jalan dengan Turbopack. Jika banyak file berubah, restart untuk memastikan tidak ada stale state:

```bash
kill 22808
cd /home/administrator/projects/nxty-fightwear && nohup bash -c "cd /home/administrator/projects/nxty-fightwear && npm run dev" > /tmp/nxty-dev.log 2>&1 & disown
sleep 8
tail -20 /tmp/nxty-dev.log
```

Expected: "Ready in Xms" muncul di log.

- [ ] **Step 4: Smoke test - homepage**

Buka http://localhost:3000 di DevTools mobile (iPhone 14 = 390×844). Verifikasi:
- [ ] BottomNav muncul dengan 5 item
- [ ] Tap "Kategori" → MobileFilterSheet muncul
- [ ] Tap "Cari" → MobileSearchSheet muncul
- [ ] Tap "Cart" → CartDrawer muncul
- [ ] Tap "Home" → kembali ke homepage (atau tetap jika sudah di /)
- [ ] Tap "Akun" → navigasi ke /tentang-kami
- [ ] Hero "01" tidak overflow
- [ ] Marquee text readable

- [ ] **Step 5: Smoke test - product card**

Di homepage, scroll ke product grid. Verifikasi:
- [ ] 2 kolom di mobile
- [ ] Tombol "ADD TO CART" dan "BELI SEKARANG" stacked, minimal 44px
- [ ] Tap "ADD TO CART" → toast muncul, item masuk cart
- [ ] Tap "BELI SEKARANG" → navigasi ke /checkout

- [ ] **Step 6: Smoke test - product detail**

Buka salah satu produk. Verifikasi:
- [ ] BottomNav hidden di halaman ini (sesuai spec)
- [ ] Sticky bottom CTA muncul
- [ ] Tap CTA bekerja

- [ ] **Step 7: Smoke test - cart**

Tap cart icon di BottomNav. Verifikasi:
- [ ] CartDrawer full-width di mobile
- [ ] Image item 80×80
- [ ] Tombol +/- responsive

- [ ] **Step 8: Smoke test - halaman statis**

Buka `/tentang-kami`, `/cara-order`, `/kontak`. Verifikasi:
- [ ] BottomNav hidden (sesuai spec)
- [ ] Kontak sudah menampilkan nomor baru & alamat baru
- [ ] Tidak ada horizontal overflow
- [ ] Font readable

- [ ] **Step 9: Horizontal overflow check**

Di DevTools console, jalankan:
```js
document.documentElement.scrollWidth <= window.innerWidth
```
Expected: `true`. Test di viewport 320px, 360px, 375px, 414px.

- [ ] **Step 10: Final commit (jika ada perubahan terakhir)**

```bash
git status
# Jika ada perubahan:
git add -A
git commit -m "chore: final adjustments after mobile UX implementation"
```

- [ ] **Step 11: Dokumentasikan**

Buat summary file `docs/superpowers/2026-06-26-mobile-ux-changelog.md`:

```markdown
# Mobile UX Improvements — Changelog

Tanggal: 2026-06-26

## Komponen Baru
- `hooks/useMediaQuery.ts` — hook deteksi breakpoint
- `components/SafeArea.tsx` — wrapper untuk iOS safe-area
- `components/BottomNav.tsx` — bottom navigation bar (mobile only)
- `components/AppShell.tsx` — wrapper state management
- `components/Sheet.tsx` — base bottom sheet
- `components/MobileFilterSheet.tsx` — sheet untuk kategori
- `components/MobileSearchSheet.tsx` — sheet untuk pencarian

## Perubahan Existing
- `app/layout.tsx` — mount AppShell
- `components/HeroSection.tsx` — reduce mobile "01" size
- `components/CategoryPills.tsx` — scroll cue gradient
- `components/ProductCard.tsx` — mobile-first stacked buttons
- `components/CartDrawer.tsx` — larger image & tap targets
- `app/products/[slug]/page.tsx` — sticky bottom CTA
- `app/checkout/page.tsx` — sticky bottom action
- `app/tentang-kami/page.tsx` — mobile layout fixes (jika ada)
- `app/cara-order/page.tsx` — mobile layout fixes (jika ada)
- `app/kontak/page.tsx` — kontak baru (sudah di-update sebelumnya)

## Acceptance
- ✅ Build sukses (npm run build exit 0)
- ✅ Tidak ada horizontal overflow di 320-414px
- ✅ Tap targets ≥44×44 px di mobile
- ✅ Font body ≥12px di mobile
- ✅ Safe area handled untuk iPhone
- ✅ BottomNav berfungsi dengan 5 item
- ✅ Style brutalist brand tetap konsisten
```

```bash
git add docs/superpowers/2026-06-26-mobile-ux-changelog.md
git commit -m "docs: add mobile UX changelog"
```

---

## Definition of Done

- [ ] Semua task di atas selesai
- [ ] `npm run build` exit 0
- [ ] `npx tsc --noEmit` exit 0
- [ ] Smoke test manual di mobile viewport lulus
- [ ] Tidak ada horizontal overflow di mobile
- [ ] Style brutalist brand tetap konsisten
- [ ] Dev server berjalan tanpa error
- [ ] Changelog ditulis
- [ ] Semua perubahan ter-commit di git
