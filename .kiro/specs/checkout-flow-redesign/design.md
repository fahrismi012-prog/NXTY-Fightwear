# Design Document — Checkout Flow Redesign

## Overview

Redesign 3 halaman/komponen kritis di conversion funnel: Product Detail, Cart Page, CartDrawer, dan Checkout. Semua pakai design tokens dan UI primitives dari `design-foundation` (fase 1).

Prinsip: **kurangi visual noise, tambah kejelasan**. Setiap elemen yang ada harus punya alasan — jika tidak membantu user memutuskan beli, hilangkan.

## Architecture

### File yang diubah

| File | Aksi | Catatan |
|------|------|---------|
| `app/products/[slug]/page.tsx` | REFACTOR besar | Hapus grayscale, sticky internal header, index ID. Pakai UI primitives. |
| `app/cart/page.tsx` | REFACTOR | Pakai tokens, Card, Button, hapus index numbering |
| `components/CartDrawer.tsx` | REFACTOR | Konsistensi dengan design system baru |
| `app/checkout/page.tsx` | REFACTOR besar | Selaraskan visual, pakai Input/Button/Textarea primitives, TrustStrip |

### Dependency

Semua komponen fase ini depend pada:
- `@/components/ui` — Button, Input, Textarea, Card, Badge, PriceTag, Eyebrow, IconButton, Sheet
- `@/components/TrustStrip` — trust signals
- Design tokens dari `app/globals.css` — `bg-canvas`, `text-text-primary`, `bg-surface-1`, `brand-red`, dll

## Components and Interfaces

### Product Detail Page Layout

**Mobile (single scroll column):**

```
[gambar edge-to-edge, aspect-square, no grayscale]
  ↑ badge promo (pojok kanan atas gambar)

[padding horizontal 16px mulai dari sini]
[Eyebrow: kategori]
[h1: nama produk, text-heading-1, mixed case]
[rating + review count]
[PriceTag xl, dengan originalPrice jika diskon]

[section: Ukuran]
  label: "Ukuran" + link "Panduan Ukuran ?"
  pill buttons: size S/M/L/XL/dll, min 44px height

[section: Warna]
  label: "Warna"
  pill buttons: nama warna, min 44px height

[section: Deskripsi]
  teks paragraf, mixed case, readable

[TrustStrip: 3 signals horizontal]

─────────────────────────────────────
[Sticky bottom bar, fixed bottom-16]
  [qty −/1/+] [Tambah ke Keranjang] [Beli Langsung]
  note: "Pilih ukuran & warna" jika belum dipilih
─────────────────────────────────────
```

**Desktop (2 kolom):**
- Kiri (sticky): gambar + thumbnails (jika multi-image di masa depan)
- Kanan: semua info + CTA (non-sticky, scroll normal)
- CTA desktop: tombol full-width "Tambah ke Keranjang" + "Beli Langsung" di bawahnya

### Cart Page Layout

**Mobile:**
```
[page title: "Keranjang (3 item)"]
[list items, no border-2 outer, separator 1px antar item]
  per item: img 80×80 | nama | varian | harga | qty stepper | trash
[sticky bottom-16: total + tombol Checkout]
```

**Desktop (2 kolom grid):**
```
[kiri, 60%: list cart items]
[kanan, 40%: Card ringkasan]
  Subtotal
  Estimasi ongkir (placeholder "Dihitung di checkout")
  Total
  Button "Checkout Sekarang" (lg, full width)
```

**Empty State:**
```
[ikon shopping cart sederhana, neutral color]
[heading "Keranjang kosong"]
[body "Yuk temukan produk favoritmu"]
[Button "Mulai Belanja" → /]
```

### CartDrawer Layout

```
[Header: "Keranjang" + count badge + close X]
[items list — mirip cart page, compact]
[Footer:]
  [subtotal row]
  [Button primary "Checkout Sekarang" full width]
  [link kecil "Lihat keranjang" text-center]
```

### Checkout Page Layout

**Mobile (scroll penuh, tanpa BottomNav/Footer karena AppShell sudah hide):**

```
[Minimal header: ← back | "Checkout"]

[Collapsible: Ringkasan Pesanan ▼]
  (default collapsed, show "3 item · Rp xxx.xxx")
  (expanded: list item mini)

[Section 1: Informasi Kontak]
  Input: Nama Lengkap
  Input: Email (inputMode="email")
  Input: Nomor HP (inputMode="tel")

[Section 2: Alamat Pengiriman]
  Textarea: Alamat Lengkap
  Input: Kota / Kabupaten

[Section 3: Catatan (opsional)]
  Textarea: Catatan pengiriman

[TrustStrip: Pembayaran Aman · Garansi 30 Hari · Dukungan WhatsApp]

[Button "Bayar Sekarang" full width, size lg]

[note kecil: "Pembayaran via Midtrans"]
```

**Desktop:** sama tapi max-width 600px centered, tanpa sticky bar (tombol inline di bawah form).

## Data Models

Tidak ada perubahan data model atau schema database. Semua state tetap di `CartContext`. Form data tetap di local state component.

### CartItem (existing, unchanged)
```typescript
interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}
```

### CheckoutFormData (existing, refactored)
```typescript
interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}
```

## Correctness Properties

### Property 1: Cart state integrity

CartContext state tidak berubah setelah redesign visual. Add, remove, update quantity semua berfungsi.

**Validates: Requirements 5.2**

### Property 2: Checkout Midtrans flow intact

Midtrans Snap script load, `window.snap.pay()`, onSuccess/onPending/onError/onClose — semua tetap berjalan.

**Validates: Requirements 5.1**

### Property 3: CTA tidak tersembunyi

Tidak ada CTA yang `hidden md:flex` tanpa padanan mobile. Tombol Bayar selalu visible.

**Validates: Requirements 4.12**

### Property 4: Tap target compliance

Semua interactive element di cart, drawer, checkout, dan product detail minimal 44×44px.

**Validates: Requirements 1.6, 1.7, 2.3, 2.4, 3.4**

### Property 5: Visual consistency

Tidak ada `rounded-xl`, `red-600`, `red-700`, `font-black uppercase tracking-[0.25em]` di halaman yang sudah diredesign — semua pakai design tokens.

**Validates: Requirements 2.1, 4.1**

### Property 6: Build determinism

Build dan typecheck pass tanpa error baru.

**Validates: Requirements 5.3**

## Error Handling

| Skenario | Penanganan |
|----------|------------|
| Checkout submit gagal (Midtrans error) | Tampilkan error inline menggunakan `text-error-500`, bukan hardcode `text-red-400` |
| Cart kosong saat buka /checkout | Redirect ke `/` dengan pesan menggunakan design tokens |
| Quantity update gagal | Optimistic update dengan rollback, loading state pada stepper |
| Gambar produk gagal load | Next.js Image fallback, background surface-2 sebagai placeholder |

## Testing Strategy

### Manual Smoke Test (per task)
1. Product Detail: buka produk, pilih ukuran+warna, sticky bar muncul dan berfungsi, Add to Cart → toast, Beli Langsung → /checkout
2. Cart Page: tambah item, edit qty, hapus item, total update, tombol Checkout → /checkout
3. CartDrawer: buka dari TopHeader, edit qty, hapus item, Checkout → /checkout, close via backdrop
4. Checkout: isi form, validasi inline, submit → Midtrans popup atau fallback, halaman payment success/failed berfungsi

### Build Verification
- `npm run build` SUCCESS
- `npx tsc --noEmit` zero errors
- `npx eslint` zero errors di file yang diubah

## Migration Plan

### Apa yang dihapus dari tiap file

**product detail:**
- Hapus: sticky internal header yang punya tombol back
- Hapus: stripe accent div `bg-stripes-red-dense`
- Hapus: ITEM ID overlay di pojok gambar
- Hapus: font-black, uppercase tracking, font-mono di teks konten
- Hapus: grayscale filter pada gambar
- Ganti: border-2 border-[#262626] → Card component atau border-subtle token
- Ganti: formatPrice → PriceTag component
- Ganti: Trust signals inline → TrustStrip component

**cart page:**
- Hapus: index numbering (01, 02)
- Hapus: bg-stripes-red di empty state
- Hapus: font-mono di harga dan label
- Hapus: border-2 border-[#dc2626] di checkout button
- Ganti: semua hardcoded color ke design tokens
- Ganti: qty buttons 36×36 → min 44×44 via padding

**cart drawer:**
- Hapus: border-l-2 border-[#dc2626] pada panel → border-border-default
- Hapus: index numbering
- Hapus: bg-stripes-red di empty state
- Hapus: "LIHAT CART PAGE" button (ganti jadi link kecil)
- Ganti: semua hardcoded colors ke tokens

**checkout:**
- Hapus: sticky internal header yang double dengan TopHeader
- Hapus: rounded-xl → rounded-card atau rounded-subtle
- Hapus: hardcoded `bg-red-600`, `hover:bg-red-700`, `focus:border-red-500`
- Hapus: label kapitalisasi random ("nama Lengkap" → "Nama Lengkap")
- Hapus: `hidden md:flex` pada tombol submit
- Ganti: semua `<input>` dan `<textarea>` → `Input` dan `Textarea` components
- Tambah: TrustStrip di atas tombol bayar
- Tambah: collapsible order summary di mobile
- Tambah: section headings yang jelas

## Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| Midtrans Snap popup tidak muncul setelah refactor | Pertahankan logic load script tanpa perubahan, hanya ubah visual wrapper |
| Form validation berubah perilaku | Test setiap field secara eksplisit sebelum dan sesudah |
| Cart state hilang karena perubahan struktur | CartContext tidak diubah sama sekali |
| Back button di product detail navigate ke halaman yang salah | Gunakan `router.back()` bukan hardcode `href="/"` |

## Success Criteria

1. ✅ Product Detail: gambar edge-to-edge mobile, no grayscale, sticky CTA berfungsi, visual konsisten
2. ✅ Cart Page: design tokens, qty stepper 44px, layout 2 kolom desktop, empty state clean
3. ✅ CartDrawer: konsisten dengan design system, single CTA, no index numbering
4. ✅ Checkout: visual konsisten, form inputs pakai primitives, TrustStrip, CTA selalu visible
5. ✅ Build + typecheck pass
6. ✅ Midtrans flow masih berfungsi
