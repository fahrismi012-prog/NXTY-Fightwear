# Mobile UX Improvements — Design Spec

**Tanggal:** 2026-06-26
**Project:** NXTY Fightwear Store (`/home/administrator/projects/nxty-fightwear`)
**Pendekatan:** A — Quick Wins + Bottom Navigation Bar
**Scope:** Komprehensif (semua halaman)
**Style:** Mempertahankan brutalist aesthetic (hitam #0a0a0a, merah #dc2626, hard borders, no rounded)

---

## Tujuan

Meningkatkan kenyamanan penggunaan website di perangkat mobile (≤768px) melalui:
1. Menambah bottom navigation bar (mobile-first pattern)
2. Memperbaiki elemen yang terpotong di layar (overflow)
3. Memperbesar tap targets ke standar minimum 44×44 px
4. Meningkatkan legibilitas tipografi mobile
5. Menambah safe-area handling untuk iPhone dengan notch/home indicator

## Non-Tujuan

- Redesign visual identity atau warna brand
- Tambah fitur baru di luar perbaikan UX (mis. login, wishlist, notifikasi push)
- Migrasi ke PWA atau installable app
- Perubahan besar pada logika bisnis (cart, checkout, payment)

---

## Arsitektur & Komponen

### Komponen Baru

| Path | Tipe | Tujuan |
|---|---|---|
| `components/BottomNav.tsx` | Client component | Sticky bottom navigation 5 item, hanya tampil di mobile (<md) |
| `components/MobileFilterSheet.tsx` | Client component | Bottom sheet overlay untuk pilih kategori |
| `components/MobileSearchSheet.tsx` | Client component | Bottom sheet full-screen untuk pencarian |
| `hooks/useMediaQuery.ts` | Hook | Helper deteksi breakpoint media |
| `components/SafeArea.tsx` | Wrapper | Apply `pb-[env(safe-area-inset-bottom)]` untuk device iPhone |

### Komponen yang Dimodifikasi

| Path | Perubahan |
|---|---|
| `components/Navbar.tsx` | Hamburger tetap sebagai menu sekunder; search inline toggle diganti trigger `MobileSearchSheet` |
| `components/HeroSection.tsx` | Reduce ukuran "01" background di mobile, padding adjustments |
| `components/ProductCard.tsx` | Layout lebih clean, tombol lebih besar, hapus rating row di mobile |
| `components/ProductGrid.tsx` | Tetap 2 kolom mobile dengan gap lebih lega |
| `components/CategoryPills.tsx` | Tambah right-edge gradient cue untuk indikasi scrollable |
| `components/CartDrawer.tsx` | Item layout lebih lega, image lebih besar, tap target lebih besar |
| `app/products/[slug]/page.tsx` | Gallery swipeable, sticky bottom CTA, variant selector lebih besar |
| `app/checkout/page.tsx` | Form field 44px tinggi, sticky bottom total + tombol bayar |
| `app/page.tsx` & `app/layout.tsx` | Mount `<BottomNav />`, padding-bottom di main content |

### Style Guide (Mobile)

- **Tap target minimum**: 44×44 px (standar Apple HIG / WCAG 2.5.5)
- **Font size minimum body**: 12px (saat ini banyak 9-10px di mobile)
- **Spacing rhythm**: gap-3 (12px) standar antar elemen interaktif
- **Safe area**: `padding-bottom: env(safe-area-inset-bottom)` untuk device dengan home indicator
- **Breakpoints**: pakai default Tailwind — `md` = 768px. BottomNav muncul hanya `<md`.

---

## Section A — Bottom Navigation Bar

### Items (5, kiri ke kanan)

| Pos | Icon (lucide-react) | Label | Behavior |
|---|---|---|---|
| 1 | `Home` | "Home" | Navigate ke `/` |
| 2 | `LayoutGrid` | "Kategori" | Buka `MobileFilterSheet` (overlay, tidak navigate) |
| 3 | `Search` | "Cari" | Buka `MobileSearchSheet` (full-screen overlay) |
| 4 | `ShoppingBag` | "Cart" | Buka `CartDrawer` (existing). Tampilkan badge count dari `useCart().totalItems` |
| 5 | `User` | "Akun" | Navigate ke `/tentang-kami` (placeholder; tidak ada fitur login) |

### Visual Spec

- Background: `#0a0a0a` dengan top border `2px solid #dc2626`
- Height: 64px + safe-area-bottom (otomatis via wrapper)
- Icon: 22px, label: 10px uppercase tracking-wide font-black
- Active state: icon + label warna `#dc2626`, top indicator 3px merah di atas item aktif
- Inactive: icon + label warna `#a3a3a3` (neutral-400)
- Hover/active press: scale 0.95, transition 150ms

### Show/Hide Logic

| Kondisi | Status BottomNav |
|---|---|
| Viewport ≥ md (≥768px) | **Hidden** (selalu) |
| Viewport < md, halaman biasa | **Visible** |
| `CartDrawer` terbuka | **Hidden** (sementara) |
| `MobileFilterSheet` / `MobileSearchSheet` terbuka | **Hidden** (sementara) |
| Halaman `/checkout`, `/payment/*` | **Hidden permanen** (fokus form) |
| Halaman `/kontak`, `/tentang-kami`, `/cara-order` | **Hidden permanen** (halaman sekunder) |

### Aksesibilitas

- `aria-label` di setiap button (Indonesia)
- `aria-current="page"` untuk item yang sesuai rute aktif
- Keyboard tab order natural
- Focus visible (outline merah 2px)

### Z-Index

- BottomNav: `z-30`
- Navbar: `z-40`
- CartDrawer / Sheets: `z-50` (di atas BottomNav)

---

## Section B — Mobile Improvements Per Halaman

### B.1 Homepage

**HeroSection:**
- Background "01": `text-[10rem] sm:text-[22rem] lg:text-[30rem]` (saat ini `text-[14rem]` di mobile)
- Padding mobile: `pt-10 pb-12` (tetap)
- Stats bar mobile: text number `text-2xl sm:text-5xl`, label `text-[10px]`
- Marquee: text mobile `text-[11px]` (sedikit naik dari 10px untuk readability)

**Page layout:**
- `<main>` tambah `pb-20` (128px) supaya konten terakhir tidak tertutup BottomNav
- BottomNav mount di `app/layout.tsx` agar konsisten di semua halaman

### B.2 ProductCard

**Layout mobile (<md):**
- Image tetap aspect 1:1, tetap 2 kolom grid
- Tombol: stack jadi 1 tombol utama "ADD TO CART" full-width + 1 tombol secondary "BELI"
  - "ADD TO CART": `py-3` (44px tinggi), background `#dc2626`, text putih
  - "BELI": `py-3`, border 2px putih, text putih, background transparan
- Hapus rating row di mobile (rating pindah ke product detail)
- Name tetap `line-clamp-2 text-sm`
- Price tetap `text-base font-black`
- Index badge `01, 02` tetap (brutalist)

**Desktop (≥md):** tetap seperti sekarang (split buttons + rating row)

### B.3 CategoryPills

- Tambah gradient cue di kanan: relative wrapper dengan absolute element `bg-gradient-to-r from-transparent to-[#0a0a0a]`, width ~32px
- Position: di luar container scroll, hanya tampil jika konten overflow (gunakan state `canScrollRight`)

### B.4 Product Detail (`app/products/[slug]/page.tsx`)

**Asumsi (perlu verifikasi saat implementasi):**
- Gallery gambar: carousel swipeable di mobile dengan indicator dots
- Tombol "ADD TO CART" + "BELI": sticky bottom di mobile (`fixed bottom-0 left-0 right-0`)
  - Padding-bottom safe area
  - Background `#0a0a0a` dengan top border merah
  - 2 tombol side-by-side, masing-masing tinggi 48px
- Variant selector (size/color): pill button dengan min-height 44px, padding `px-4 py-2.5`
- Quantity selector: tombol `+`/`−` 40×40 px (acceptable di dalam form, di luar tap-target area utama)
- BottomNav hidden di halaman ini (sudah di Section A)

### B.5 Cart Drawer

- Image per item: 64×64 → 80×80 di mobile
- Padding item: `p-3` → `p-4`
- Quantity selector: tombol `+`/`−` 32×32 → 36×36 px
- Tombol trash: tetap pojok kanan, tap target 36×36 px (border transparan hingga hover)
- Empty state: tetap, tambah padding lebih lega
- Total section: tetap, tambah subtle micro-animation saat item count berubah

### B.6 Checkout (`app/checkout/page.tsx`)

- Form input minimal 44px tinggi (`h-11` atau `py-3`)
- Field spacing `gap-4` (16px) antar field
- Bottom action: sticky bottom dengan total + tombol "BAYAR SEKARANG" full-width, tinggi 52px
- Step indicator di atas: 3 step (Order → Payment → Confirmation), visual jelas
- BottomNav hidden (sudah di Section A)

### B.7 Halaman Statis

- `/kontak`: sudah dicek, layout OK. Konten baru sudah ter-update.
- `/tentang-kami`: perlu dicek apakah ada overflow di mobile, fix accordingly (padding, font size).
- `/cara-order`: sama, perlu dicek dan fix.
- BottomNav disembunyikan (Section A).

---

## Section C — Verifikasi & Acceptance

### Kriteria Sukses

1. **Build sukses**: `npm run build` exit 0, tidak ada TypeScript error
2. **No horizontal overflow**: di viewport 320px, 360px, 375px, 414px — `document.documentElement.scrollWidth <= window.innerWidth`
3. **Tap targets**: setiap interactive element ≥44×44 px (verify via DevTools atau automated check)
4. **Font legibility**: tidak ada body text <12px di mobile (kecuali dekoratif marquee)
5. **Safe area**: tested di iPhone simulator dengan home indicator — tidak ada konten tertutup
6. **Visual smoke test**: screenshot before/after untuk homepage, product card, cart drawer di mobile viewport 375px
7. **No regression**: dev server (PID 22808) tetap jalan tanpa error, hot reload bekerja
8. **Style consistency**: brand colors, brutalist aesthetic, numbered badges tetap konsisten

### Cara Test

- Buka http://localhost:3000 di browser
- Toggle DevTools device mode (Ctrl+Shift+M di Chrome)
- Test viewport presets: iPhone SE (375×667), iPhone 14 (390×844), Pixel 7 (412×915), iPhone SE 1st gen (320×568)
- Manual checklist per Section B
- Verifikasi navigasi bottom: tap tiap item, pastikan routing & overlay bekerja
- Verifikasi bottom sheets: tap Kategori & Cari, pastikan overlay muncul dan dismiss benar

### Out of Scope

- Performance optimization (lazy loading, image optimization)
- A11y audit penuh (cukup standar minimal)
- Cross-browser testing (fokus Chromium)
- Testing di device fisik

---

## Implementation Plan

Setelah spec ini disetujui, akan dibuat implementation plan dengan urutan eksekusi (per fase):

1. **Fase 1 — Fondasi**: BottomNav, useMediaQuery, SafeArea, layout.tsx mount
2. **Fase 2 — Sheets & Hooks**: MobileFilterSheet, MobileSearchSheet
3. **Fase 3 — Homepage Polish**: HeroSection, CategoryPills, ProductCard mobile
4. **Fase 4 — Product Detail & Cart**: Product page, CartDrawer polish
5. **Fase 5 — Checkout & Static Pages**: Checkout, tentang-kami, cara-order
6. **Fase 6 — Verifikasi**: Build, manual test, screenshot, dokumentasi

Detail setiap fase akan diuraikan di plan setelah spec ini disetujui.

---

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Hot reload break saat edit banyak file | Test build (`npm run build`) per fase, jangan tunggu akhir |
| BottomNav nutupin konten penting | Test di viewport kecil (320px), tambah `pb-20` di main |
| Perubahan style merusak desktop | Verify di viewport ≥768px setiap perubahan mobile-first class |
| Sheet component reuses pattern berbeda | Bikin reusable `<Sheet>` base component untuk konsistensi |
| Existing functionality regress | Manual smoke test homepage → product → cart → checkout end-to-end |

---

## Referensi

- File project: `/home/administrator/projects/nxty-fightwear/`
- Existing components: `components/` (Navbar, HeroSection, ProductCard, CartDrawer, CategoryPills, FlashSaleSection, dll)
- App routes: `app/` (page.tsx, products/[slug], checkout, kontak, tentang-kami, cara-order, payment)
- Design system existing: Tailwind CSS dengan custom palette + brutalist aesthetic
- Dev server: `npm run dev` di localhost:3000 (PID 22808)
