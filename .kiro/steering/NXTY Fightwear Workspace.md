# NXTY Fightwear Workspace Rules

## Bahasa

- Selalu gunakan Bahasa Indonesia untuk komunikasi.
- Jangan menggunakan Bahasa Inggris kecuali:
  - Source Code
  - Nama Library
  - API
  - Terminal
  - Error Message

---

## Tujuan Project

NXTY Fightwear adalah toko online mobile-first yang terinspirasi dari pengalaman belanja Shopee, namun disederhanakan untuk kebutuhan UMKM.

Fokus utama:

- Mobile First
- Cepat
- Mudah digunakan
- Modern
- Siap Production

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

---

## Coding Rules

- Jangan membuat duplicate component.
- Gunakan reusable component.
- Jangan membuat library baru jika tidak diperlukan.
- Jangan mengubah database tanpa persetujuan.
- Jangan mengubah API tanpa persetujuan.
- Jangan mengubah struktur folder besar tanpa persetujuan.

---

## Workflow

Sebelum coding wajib:

1. Analisis
2. Planning
3. File yang akan diubah
4. Risiko

Setelah coding wajib:

1. Build
2. Typecheck
3. Testing
4. Summary perubahan

---

## Mobile First

Semua UI harus:

- Responsive
- Touch Friendly
- Minimum 44px Tap Area
- Optimized untuk Android

---

## Quality

Prioritas:

1. Readability
2. Maintainability
3. Performance
4. Accessibility
5. SEO

---

## Design System (post design-foundation)

Sejak fase 1 redesign selesai, gunakan design tokens dan UI primitives berikut alih-alih hard-coded values.

### Color tokens utama

- `bg-canvas`, `bg-surface-1`, `bg-surface-2` — backgrounds
- `text-text-primary`, `text-text-secondary`, `text-text-muted` — typography
- `border-border-subtle`, `border-border-default`, `border-border-strong` — borders
- `bg-brand-red`, `text-brand-red` — HANYA untuk CTA primer, badge promo, urgency
- Neutral scale: `*-neutral-50` … `*-neutral-950` (dark theme)
- Semantic: `*-success-500/600`, `*-warning-500/600`, `*-error-500/600`

### Typography tokens

- Heading: `text-display-1`, `text-display-2`, `text-heading-1`, `text-heading-2`, `text-heading-3`
- Body: `text-body-lg`, `text-body`, `text-body-sm`
- Label: `text-caption`, `text-eyebrow` (uppercase)
- Price: `text-price-md`, `text-price-lg`, `text-price-xl` (pakai juga `tabular-nums`)

### Radius tokens

- `rounded-subtle` (4px) untuk input, button, badge
- `rounded-card` (8px) untuk card, dialog, sheet
- `rounded-full` untuk pill, avatar
- Hindari `rounded-xl` generik

### Motion tokens

- `duration-fast` (150ms), `duration-normal` (200ms), `duration-slow` (300ms)
- Pastikan respect `prefers-reduced-motion` (sudah di-handle global)

### UI Primitives

Import dari `@/components/ui`:

- `Button`, `IconButton` (variants: primary, secondary, ghost, destructive / ghost, solid, outline)
- `Input`, `Textarea` (dengan label, error, hint, icon slots)
- `Card`, `Badge`, `Eyebrow`
- `Sheet` (side: bottom, right, fullscreen)
- `Dialog`
- `PriceTag` (formatted IDR dengan tabular-nums)
- `Skeleton`

### Navigation system

Render via `AppShell` (sudah otomatis):

- `TopHeader` — mobile 56px, desktop 72px, auto-hide on scroll, search persisten
- `BottomNav` — 5 tab mobile, hidden di /checkout, /payment/*, /admin/*
- `MegaMenuSheet`, `SearchModal`, `MobileSearchSheet`, `CartDrawer`, `MobileFilterSheet`
- `Footer` — multi-kolom desktop, accordion mobile

### Aturan pemakaian warna merah brand

Merah `#dc2626` HANYA dipakai untuk:

1. CTA primer (Beli, Checkout, Bayar)
2. Badge promo dengan persentase diskon aktif
3. Urgency indicator (stok rendah, countdown)
4. Active state navigation (dot indicator, BUKAN background)

JANGAN pakai untuk:

- Border dekoratif default
- Ikon biasa (pakai neutral)
- Eyebrow kategori (pakai neutral)

### Status spec

- `design-foundation`: selesai
- `checkout-flow-redesign`: belum dimulai (Product Detail + Cart + Checkout)
- `discovery-redesign`: belum dimulai (Homepage + Product Listing + ProductCard + HeroSection + BrandIntroSection + FlashSaleSection)
- `editorial-pages-redesign`: belum dimulai (About + Contact)

### Legacy components yang belum diredesign

Beberapa komponen masih pakai brutalist style lama:

- `components/HeroSection.tsx`, `components/BrandIntroSection.tsx`, `components/FlashSaleSection.tsx`, `components/ProductCard.tsx`, `components/ProductGrid.tsx` (fase 3)
- `components/CartDrawer.tsx` (fase 2)
- `components/MobileFilterSheet.tsx`, `components/Sheet.tsx` legacy (akan dimigrasi di fase 3)
- `components/Skeleton.tsx`, `components/SkeletonCard.tsx`, `components/SkeletonBanner.tsx` (legacy, sudah ada `ui/Skeleton` baru)
- Page header internal di `/cart`, `/promo`, `/tentang-kami`, `/kontak` (akan diredesign penuh di fase 2-4)

Saat redesign halaman, ganti komponen legacy dengan UI primitives baru.
