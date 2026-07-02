# Admin Redesain BW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesain UI/UX area `/admin/**` dari palette dark+merah menjadi putih+hitam brutalism dengan merah `#dc2626` terbatas untuk aksi destruktif saja. Style bahasa brutalism dipertahankan.

**Architecture:** Perubahan murni visual (Tailwind class) — tidak ada perubahan logika, API, atau data flow. Setiap file di-redesain sesuai pola di spec. Verifikasi via dev server (sudah jalan di port 3000) + grep compliance.

**Tech Stack:** Next.js 16.2.9 (App Router), React, Tailwind v4 (`@theme inline` di `globals.css`), lucide-react. Tidak ada test framework.

**Referensi utama:** `docs/superpowers/specs/2026-07-02-admin-redesain-bw-design.md` (sudah di-commit di `8ec9784`). Baca dulu sebelum mulai.

---

## Aturan global (untuk semua task)

1. **WAJIB baca spec** di `docs/superpowers/specs/2026-07-02-admin-redesain-bw-design.md` sebelum edit.
2. **Pola warna yang dipakai**:
   - Background canvas/surface: `bg-white`
   - Teks primer: `text-black` (atau `#0a0a0a` via `text-[#0a0a0a]` jika ada brand token)
   - Teks muted: `text-neutral-400` atau `text-neutral-500` (cek kontras)
   - Border default: `border-2 border-neutral-800` atau `border-black`
   - Border input: `border-2 border-neutral-600 focus:border-black`
   - Tombol primer: `bg-black text-white border-2 border-black hover:bg-white hover:text-black`
   - Tombol destructive: `bg-white text-[#dc2626] border-2 border-[#dc2626] hover:bg-[#dc2626] hover:text-white`
3. **JANGAN ubah**: logika bisnis, API routes, `proxy.ts`, `lib/`, copy bahasa Indonesia, ikon.
4. **Verifikasi per task**: load halaman via `curl -sS http://localhost:3000/admin/<path> -w "\nHTTP=%{http_code}\n"` → harus HTTP 200.
5. **Commit per task** dengan pesan: `style(admin): redesain bw - <nama file/komponen>`.

---

## Task 1: Login page

**File:**
- Modify: `app/admin/login/page.tsx`

- [ ] **Step 1: Tulis ulang halaman login**

Ganti semua class dengan pola BW. Kode lengkap ada di bawah.

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok || !data.success) {
        const message = data.error ?? "Login gagal";
        setError(message);
        showToast("info", message);
        setLoading(false);
        return;
      }

      showToast("success", "Login berhasil");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Tidak dapat menghubungi server";
      setError(message);
      showToast("info", message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-black">
            NXTY
          </h1>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-black">
            Admin Panel
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-black p-6"
        >
          <label
            htmlFor="password"
            className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2"
          >
            Password Admin
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            disabled={loading}
            className="w-full bg-white border-2 border-neutral-600 text-black px-3 py-3 text-sm font-bold placeholder:text-neutral-400 focus:outline-none focus:border-black disabled:opacity-50"
          />

          {error && (
            <p
              role="alert"
              className="mt-4 border-2 border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] text-xs font-bold px-3 py-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="mt-5 w-full bg-black text-white font-black uppercase tracking-wider text-sm py-3 border-2 border-black hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Akses terbatas. Hanya untuk staff NXTY.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi via dev server**

```bash
curl -sS -o /tmp/login.html -w "HTTP=%{http_code}\n" http://localhost:3000/admin/login
grep -c "bg-black" /tmp/login.html
```

Expected: HTTP=200 dan grep menemukan `bg-black` (tombol submit baru).

- [ ] **Step 3: Compliance check — tidak boleh ada `bg-\[#0a0a0a\]` atau `text-\[#dc2626\]` non-destructive**

```bash
grep -nE "bg-\[#0a0a0a\]|text-\[#dc2626\]|border-\[#dc2626\]|bg-\[#dc2626\]" app/admin/login/page.tsx
```

Expected: HANYA muncul di:
- `border-[#dc2626]` dan `bg-[#dc2626]/10` di blok error message
- Tidak ada di tempat lain

- [ ] **Step 4: Commit**

```bash
git add app/admin/login/page.tsx
git commit -m "style(admin): redesain bw - login page"
```

---

## Task 2: Layout chrome (sidebar + bottom nav)

**File:**
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Tulis ulang layout admin**

```tsx
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminBottomNav from "@/components/admin/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  // Login page: no chrome, just centered form
  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">{children}</main>
      <AdminBottomNav />
    </div>
  );
}
```

Perubahan kunci: `bg-[#0a0a0a]` → `bg-white` di container utama.

- [ ] **Step 2: Verifikasi**

```bash
curl -sS -o /dev/null -w "HTTP=%{http_code}\n" http://localhost:3000/admin
```

Expected: HTTP=200 (akan redirect ke /admin/login via proxy, lalu 200).

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "style(admin): redesain bw - layout container bg-white"
```

---

## Task 3: Sidebar

**File:**
- Modify: `components/admin/Sidebar.tsx`

- [ ] **Step 1: Tulis ulang sidebar**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Package,
  Tag,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Kategori", href: "/admin/kategori", icon: Layers },
  { label: "Produk", href: "/admin/produk", icon: Package },
  { label: "Promo", href: "/admin/promo", icon: Tag },
  { label: "Pesanan", href: "/admin/pesanan", icon: ShoppingBag },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      showToast("info", "Logout berhasil");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      showToast("info", "Logout gagal, coba lagi");
    }
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-white border-r-2 border-black flex-col z-40">
      {/* Logo */}
      <div className="border-b-2 border-black p-5">
        <p className="text-2xl font-black tracking-tighter text-black">NXTY</p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mt-1">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 text-xs font-black uppercase tracking-wider border-l-4 transition-colors",
                    active
                      ? "bg-black text-white border-white"
                      : "text-neutral-600 border-transparent hover:bg-neutral-100 hover:text-black",
                  )}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t-2 border-black p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-600 border-2 border-transparent hover:border-black hover:text-black transition-colors"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Compliance check**

```bash
grep -nE "bg-\[#0a0a0a\]|text-\[#dc2626\]|border-\[#dc2626\]|bg-\[#dc2626\]|brand-green" components/admin/Sidebar.tsx
```

Expected: TIDAK ADA match (semua sudah diganti).

- [ ] **Step 3: Commit**

```bash
git add components/admin/Sidebar.tsx
git commit -m "style(admin): redesain bw - sidebar monokromatik"
```

---

## Task 4: Bottom Nav (mobile)

**File:**
- Modify: `components/admin/BottomNav.tsx`

- [ ] **Step 1: Tulis ulang bottom nav**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Package,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_SIZE = 22;

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Kategori", href: "/admin/kategori", icon: Layers },
  { label: "Produk", href: "/admin/produk", icon: Package },
  { label: "Promo", href: "/admin/promo", icon: Tag },
  { label: "Pesanan", href: "/admin/pesanan", icon: ShoppingBag },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi admin"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-black pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className="relative flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 transition-colors",
                    active ? "bg-black" : "bg-transparent",
                  )}
                />
                <Icon
                  size={ICON_SIZE}
                  strokeWidth={active ? 2.5 : 2}
                  className={cn(
                    "transition-colors",
                    active ? "text-black" : "text-neutral-400",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wide mt-1 transition-colors",
                    active ? "text-black" : "text-neutral-400",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/BottomNav.tsx
git commit -m "style(admin): redesain bw - bottom nav monokromatik"
```

---

## Task 5: Dashboard (`/admin`)

**File:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Tulis ulang dashboard**

```tsx
import Link from "next/link";
import {
  Package,
  Layers,
  Tag,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getAdminStats } from "@/lib/storefront/products";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const statCards = [
    {
      label: "Total Produk",
      value: stats.totalProducts,
      icon: Package,
      href: "/admin/produk",
    },
    {
      label: "Total Kategori",
      value: stats.totalCategories,
      icon: Layers,
      href: "/admin/kategori",
    },
    {
      label: "Promo Aktif",
      value: stats.activePromotions,
      icon: Tag,
      href: "/admin/promo",
    },
    {
      label: "Pesanan Hari Ini",
      value: stats.ordersToday,
      icon: ShoppingBag,
      href: "/admin/pesanan",
    },
  ];

  const quickLinks = [
    {
      title: "Kelola Produk",
      desc: "Tambah, edit, dan atur stok produk fightwear",
      href: "/admin/produk",
      icon: Package,
    },
    {
      title: "Kelola Kategori",
      desc: "Manajemen kategori & subkategori produk",
      href: "/admin/kategori",
      icon: Layers,
    },
    {
      title: "Kelola Promo",
      desc: "Buat flash sale, voucher, dan banner promo",
      href: "/admin/promo",
      icon: Tag,
    },
    {
      title: "Kelola Pesanan",
      desc: "Lihat & proses pesanan masuk dari customer",
      href: "/admin/pesanan",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">
          Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Ringkasan Toko
        </h1>
        <p className="text-sm text-neutral-600 mt-2">
          Pantau performa Anxiety Fightwear secara real-time.
        </p>
      </div>

      {/* Stats grid */}
      <section
        aria-label="Statistik utama"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-white border-2 border-neutral-800 p-4 md:p-5 hover:border-black hover:shadow-[4px_4px_0_black] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="w-9 h-9 border-2 border-black flex items-center justify-center bg-white">
                  <Icon size={18} strokeWidth={2.5} className="text-black" />
                </span>
                <ArrowRight
                  size={16}
                  className="text-neutral-400 group-hover:text-black transition-colors"
                />
              </div>
              <p className="text-3xl md:text-4xl font-black text-black tracking-tight">
                {card.value}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                {card.label}
              </p>
            </Link>
          );
        })}
      </section>

      {/* Quick links */}
      <section aria-label="Aksi cepat" className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-black" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">
            Aksi Cepat
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-white border-2 border-neutral-800 p-5 flex items-start gap-4 hover:border-black hover:shadow-[4px_4px_0_black] transition-all"
              >
                <span className="shrink-0 w-12 h-12 border-2 border-black flex items-center justify-center group-hover:bg-black transition-colors">
                  <Icon
                    size={22}
                    strokeWidth={2.5}
                    className="text-black group-hover:text-white transition-colors"
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-wider text-black mb-1">
                    {link.title}
                  </p>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {link.desc}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-neutral-400 group-hover:text-black transition-colors shrink-0 mt-1"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent orders placeholder */}
      <section aria-label="Pesanan terbaru">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black mb-4">
          Pesanan Terbaru
        </h2>
        <div className="bg-white border-2 border-neutral-800 p-6 text-center">
          <ShoppingBag size={32} className="text-neutral-400 mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-neutral-600 mb-1">
            Belum ada pesanan
          </p>
          <p className="text-[10px] text-neutral-400">
            Daftar pesanan masuk akan tersedia di Fase 7.
          </p>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi via dev server (perlu login)**

Karena `/admin` protected, verifikasi visual hanya bisa via browser. Curl akan redirect ke `/admin/login`. Cukup pastikan tidak ada error compile:

```bash
curl -sS -o /dev/null -w "HTTP=%{http_code}\n" http://localhost:3000/admin
```

Expected: HTTP=200 (atau 307 ke login, yang juga OK).

- [ ] **Step 3: Compliance check**

```bash
grep -nE "bg-\[#0a0a0a\]|text-\[#dc2626\]|border-\[#dc2626\]|bg-\[#dc2626\]" app/admin/page.tsx
```

Expected: TIDAK ADA match.

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx
git commit -m "style(admin): redesain bw - dashboard"
```

---

## Task 6: StatusBadge (komponen bersama, dipakai banyak halaman)

**File:**
- Modify: `components/admin/StatusBadge.tsx`

- [ ] **Step 1: Tulis ulang StatusBadge — tanpa warna, pakai shape/icon**

```tsx
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STATUS_MAP: Record<
  string,
  { label: string; classes: string; icon?: "check" }
> = {
  pending: { label: "Menunggu", classes: "bg-white text-black border-2 border-black" },
  paid: { label: "Dibayar", classes: "bg-black text-white border-2 border-black" },
  processed: { label: "Diproses", classes: "bg-neutral-200 text-black border-2 border-neutral-800" },
  shipped: { label: "Dikirim", classes: "bg-neutral-800 text-white border-2 border-neutral-800" },
  delivered: { label: "Sampai", classes: "bg-black text-white border-2 border-black", icon: "check" },
  cancelled: { label: "Batal", classes: "bg-white text-[#dc2626] border-2 border-[#dc2626]" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const info = STATUS_MAP[status] || {
    label: status,
    classes: "bg-white text-neutral-600 border-2 border-neutral-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5",
        info.classes,
        className
      )}
    >
      {info.icon === "check" && <Check size={10} strokeWidth={3} aria-hidden />}
      {info.label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/StatusBadge.tsx
git commit -m "style(admin): redesain bw - status badge monokromatik"
```

---

## Task 7: Komponen lain (ImageUploader, OrderDetailModal, TrackingTimeline)

**File:**
- Modify: `components/admin/ImageUploader.tsx`
- Modify: `components/admin/OrderDetailModal.tsx`
- Modify: `components/admin/TrackingTimeline.tsx`

Untuk setiap file:
- Ganti `bg-[#0a0a0a]` → `bg-white`
- Ganti `bg-[#161616]` → `bg-white`
- Ganti `border-[#262626]` → `border-neutral-800`
- Ganti `text-white` di body/card → `text-black`
- Ganti `text-neutral-400` muted → `text-neutral-500` (cek kontras di putih)
- Ganti `border-[#dc2626]`/`bg-[#dc2626]`/`text-[#dc2626]` HANYA di tempat destructive (tombol hapus, error state, status batal)
- Ganti `border-neutral-600`/`text-neutral-300` di form input → `border-neutral-600`/`text-neutral-500`

- [ ] **Step 1: Baca setiap file, lalu rewrite per pola di spec**

Untuk setiap file:
1. `read` file lengkap
2. Identifikasi semua class yang perlu diganti
3. `edit` file dengan replacement sesuai pola

- [ ] **Step 2: Compliance check per file**

```bash
for f in components/admin/ImageUploader.tsx components/admin/OrderDetailModal.tsx components/admin/TrackingTimeline.tsx; do
  echo "=== $f ==="
  grep -nE "#dc2626" "$f" | head -5
done
```

Expected: Hanya muncul di blok destructive (tombol hapus, status batal, error message).

- [ ] **Step 3: Commit per file**

```bash
git add components/admin/ImageUploader.tsx
git commit -m "style(admin): redesain bw - image uploader"

git add components/admin/OrderDetailModal.tsx
git commit -m "style(admin): redesain bw - order detail modal"

git add components/admin/TrackingTimeline.tsx
git commit -m "style(admin): redesain bw - tracking timeline"
```

---

## Task 8: Modul Kategori (list + baru + edit + form + actions)

**File:**
- Modify: `app/admin/kategori/page.tsx`
- Modify: `app/admin/kategori/baru/page.tsx`
- Modify: `app/admin/kategori/[id]/page.tsx`
- Modify: `app/admin/kategori/CategoryForm.tsx`
- Modify: `app/admin/kategori/CategoryActions.tsx`

- [ ] **Step 1: Baca setiap file, identifikasi palette, rewrite**

Pola yang sama dengan Task 7: ganti `bg-[#0a0a0a]`/`bg-[#161616]` → `bg-white`, ganti `text-white` body → `text-black`, pertahankan `#dc2626` HANYA di tombol hapus.

- [ ] **Step 2: Compliance check**

```bash
grep -rn "#dc2626" app/admin/kategori/
```

Expected: Hanya muncul di `CategoryActions.tsx` (tombol hapus), atau tidak ada sama sekali jika kategori tidak punya destructive action di file lain.

- [ ] **Step 3: Commit per file atau kumpulan**

```bash
git add app/admin/kategori/
git commit -m "style(admin): redesain bw - modul kategori"
```

---

## Task 9: Modul Produk (list + baru + edit + form + list client)

**File:**
- Modify: `app/admin/produk/page.tsx`
- Modify: `app/admin/produk/baru/page.tsx`
- Modify: `app/admin/produk/[id]/page.tsx`
- Modify: `app/admin/produk/ProductForm.tsx`
- Modify: `app/admin/produk/ProductListClient.tsx`

- [ ] **Step 1-3: Pola sama dengan Task 8**

```bash
git add app/admin/produk/
git commit -m "style(admin): redesain bw - modul produk"
```

---

## Task 10: Modul Promo (list + baru + edit + form + actions + type filter)

**File:**
- Modify: `app/admin/promo/page.tsx`
- Modify: `app/admin/promo/baru/page.tsx`
- Modify: `app/admin/promo/[id]/page.tsx`
- Modify: `app/admin/promo/PromoForm.tsx`
- Modify: `app/admin/promo/PromoActions.tsx`
- Modify: `app/admin/promo/TypeFilter.tsx`

- [ ] **Step 1-3: Pola sama dengan Task 8, plus perhatian khusus**

File `app/admin/promo/page.tsx` punya banyak `#dc2626` untuk badge "flash_sale" dan tombol CTA. **Semua itu HARUS diganti** karena bukan destructive — pakai `bg-black` untuk primary, `bg-white border-black` untuk secondary.

File `PromoForm.tsx` juga punya banyak `#dc2626` di label/required indicator. Ganti ke `text-black`.

Hanya `PromoActions.tsx` (tombol hapus) yang boleh pakai `#dc2626`.

- [ ] **Step 2: Compliance check khusus**

```bash
grep -rn "#dc2626" app/admin/promo/
```

Expected: HANYA muncul di `PromoActions.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/admin/promo/
git commit -m "style(admin): redesain bw - modul promo"
```

---

## Task 11: Modul Pesanan (list + list client)

**File:**
- Modify: `app/admin/pesanan/page.tsx`
- Modify: `app/admin/pesanan/OrderListClient.tsx`

- [ ] **Step 1-3: Pola sama dengan Task 8**

Pesanan banyak pakai `StatusBadge` (sudah di Task 6), jadi perubahan di sini minimal — hanya ganti palette container.

```bash
git add app/admin/pesanan/
git commit -m "style(admin): redesain bw - modul pesanan"
```

---

## Task 12: Final compliance + visual verification

- [ ] **Step 1: Global grep untuk `#dc2626` di area admin**

```bash
grep -rn "#dc2626" app/admin/ components/admin/
```

Expected: Hanya muncul di:
- `app/admin/login/page.tsx` — error message block
- `components/admin/StatusBadge.tsx` — `cancelled` status
- `components/admin/PromoActions.tsx` — tombol hapus
- `components/admin/OrderDetailModal.tsx` — tombol batal pesanan (jika ada)
- File lain yang memang destructive (hapus kategori, hapus produk)

TIDAK BOLEH ada di: CTA primer, badge promo, label required, eyebrow text, icon highlight.

- [ ] **Step 2: Global grep untuk `bg-[#0a0a0a]` di area admin**

```bash
grep -rn "bg-\[#0a0a0a\]" app/admin/ components/admin/
```

Expected: TIDAK ADA match (semua canvas sudah putih).

- [ ] **Step 3: Global grep untuk `brand-green` di area admin**

```bash
grep -rn "brand-green" app/admin/ components/admin/
```

Expected: TIDAK ADA match (hijau brand sudah dihapus dari admin).

- [ ] **Step 4: Verifikasi dev server compile bersih**

```bash
curl -sS -o /dev/null -w "login=%{http_code}\n" http://localhost:3000/admin/login
curl -sS -o /dev/null -w "admin=%{http_code}\n" http://localhost:3000/admin
```

Expected: HTTP=200 keduanya.

- [ ] **Step 5: Cek log dev server untuk error compile**

```bash
tail -100 /tmp/nextdev.log | grep -iE "error|fail" | head -20
```

Expected: Tidak ada error baru dari perubahan kita (error lama terkait compile sebelumnya OK).

- [ ] **Step 6: Commit akhir + push**

```bash
git log --oneline -15
git status
git push origin feature/client-branding-v2
```

Expected: Working tree clean, push berhasil.

---

## Catatan penting untuk engineer

1. **Jangan ganggu** `proxy.ts`, `lib/`, API routes, `app/error.tsx`, `app/not-found.tsx` — itu di luar scope.
2. **Jangan ubah copy bahasa Indonesia** — hanya ganti class CSS.
3. **Jika menemui edge case** (misal class yang tidak ada di pola), default ke: `bg-white` untuk surface, `text-black` untuk body, `border-black` atau `border-neutral-800` untuk border, `bg-black` untuk primary action.
4. **Verifikasi visual akhir** di browser sebagai admin yang sudah login — bukan cukup dengan curl saja (curl tidak render JS Tailwind hover/focus states, hanya HTML statis).
5. **Backup plan**: Jika ada masalah visual yang tidak terduga, bisa rollback per-task dengan `git revert <commit-hash>`.

## Self-review plan (sudah selesai sebelum publish)

- Spec coverage: setiap aturan di spec tercakup di task terkait (tombol → Task 5+ ; kartu → Task 5 ; sidebar → Task 3 ; status badge → Task 6 ; dsb)
- Placeholder scan: tidak ada "TODO" atau "TBD" di plan
- Type consistency: nama class Tailwind konsisten di seluruh plan
- Scope check: 28 file masuk 12 task, doable sebagai single plan
