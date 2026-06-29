# Implementation Plan: Discovery Redesign (Fase 3)

## Overview

Redesign semua komponen discovery: HeroSection, BrandIntroSection, ProductCard, ProductGrid, FlashSaleSection, CategoryPills, BannerCarousel, dan Homepage.

**Total tasks**: 8 task dalam 3 milestone.

## Tasks

---

## Milestone 1: Core Components

### Task D1: ProductCard Redesign

- **Status**: TODO
- **Priority**: Critical
- **Estimasi**: 2 jam
- **Dependencies**: design-foundation selesai
- **Files**: `components/ProductCard.tsx` (REFACTOR)

#### Subtasks
1. Hapus grayscale filter dari Image (`className="object-cover"`)
2. Hapus index numbering badge (div dengan String(index + 1).padStart)
3. Ganti semua hardcoded colors ke design tokens:
   - `#0a0a0a` → `bg-canvas`
   - `#161616` → `bg-surface-1`
   - `#262626` → `border-border-default`
   - `#dc2626` → `bg-brand-red`, `text-brand-red`
   - `text-neutral-*` → `text-text-secondary`, `text-text-muted`
4. Ganti formatPrice() lokal dengan `PriceTag` component
5. Ganti category label dengan `<Eyebrow color="red">{product.category}</Eyebrow>`
6. Ganti nama produk: `text-sm font-black uppercase` → `text-body font-semibold text-text-primary`
7. Ganti quick action buttons dengan `Button` component:
   - Mobile: `<Button variant="primary" size="md">Tambah ke Keranjang</Button>`
   - Mobile: `<Button variant="secondary" size="md">Beli Langsung</Button>`
   - Desktop: sama dengan compact styling
8. Hapus hover:scale-110 → hover:scale-[1.02]
9. Hapus border-2 decorative → border border-border-subtle
10. Rating section: pakai `text-body-sm text-text-muted`

---

### Task D2: ProductGrid Redesign

- **Status**: TODO
- **Priority**: High
- **Estimasi**: 1 jam
- **Dependencies**: D1
- **Files**: `components/ProductGrid.tsx` (REFACTOR)

#### Subtasks
1. Hapus outer border-2 dari grid container
2. Tambah gap-3 atau gap-4 antar card
3. Ganti hardcoded colors ke design tokens
4. Empty state: gunakan `Card` untuk container, `Button` untuk action
5. Hapus font-mono dan uppercase styling di empty state

---

### Task D3: CategoryPills Redesign

- **Status**: TODO
- **Priority**: Medium
- **Estimasi**: 1 jam
- **Dependencies**: design-foundation selesai
- **Files**: `components/CategoryPills.tsx` (REFACTOR)

#### Subtasks
1. Ganti hardcoded colors ke design tokens
2. Ganti border-2 → border
3. Ganti custom border-radius → `rounded-subtle`
4. Selected state: `bg-brand-red border-brand-red text-white`
5. Unselected: `bg-transparent border-border-default text-text-secondary`
6. Hapus index number prefix (00, 01, 02) dari pill text
7. Pertahankan min-h-[44px] untuk tap target

---

## Milestone 2: Homepage Sections

### Task D4: HeroSection Redesign

- **Status**: TODO
- **Priority**: Critical
- **Estimasi**: 2 jam
- **Dependencies**: design-foundation selesai
- **Files**: `components/HeroSection.tsx` (REFACTOR)

#### Subtasks
1. Hapus `<div className="absolute inset-0 bg-stripes-red" />`
2. Hapus huge background number "01"
3. Hapus border-b-2 dari section
4. Hapus status tag "STATUS / SIAP"
5. Ganti hardcoded colors ke design tokens
6. Headline: gunakan `text-display-1` untuk "PERLENGKAPAN" dan "PETARUNG"
7. Subhead text: gunakan `text-body text-text-secondary`
8. CTA buttons: gunakan `Button` component
9. Stats bar: gunakan `Card` atau design tokens, hapus border-2 decorative
10. Hapus font-mono dan excessive tracking

---

### Task D5: BrandIntroSection Redesign

- **Status**: TODO
- **Priority**: High
- **Estimasi**: 1.5 jam
- **Dependencies**: D4
- **Files**: `components/BrandIntroSection.tsx` (REFACTOR)

#### Subtasks
1. Ganti hardcoded colors ke design tokens
2. Hapus border-b-2 decorative
3. Ganti emoji (🏭, 💰, ✅, 2014) dengan ikon lucide (Factory, Banknote, Check, Calendar)
4. Judul: gunakan `text-heading-1 font-bold`
5. Subtitle: gunakan `Eyebrow` component
6. Deskripsi: gunakan `text-body text-text-secondary`
7. CTA: gunakan `Button` component
8. Feature grid: gunakan `Card` untuk setiap item, hapus border-2 decorative
9. Hapus font-mono dan uppercase excessive

---

### Task D6: FlashSaleSection Redesign

- **Status**: TODO
- **Priority**: High
- **Estimasi**: 2 jam
- **Dependencies**: D1 (ProductCard sebagai referensi)
- **Files**: `components/FlashSaleSection.tsx` (REFACTOR)

#### Subtasks
1. Hapus grayscale filter dari Image
2. Hapus index numbering badge
3. Ganti hardcoded colors ke design tokens
4. Container: gunakan `Card` dengan border-brand-red
5. Header: gunakan `text-heading-2` atau `text-heading-3`
6. Harga: gunakan `PriceTag` component
7. CTA button: gunakan `Button` component
8. Stock progress bar: gunakan design tokens
9. Hapus font-mono dan uppercase excessive
10. Hapus background stripes jika ada

---

### Task D7: BannerCarousel Redesign

- **Status**: TODO
- **Priority**: Medium
- **Estimasi**: 1.5 jam
- **Dependencies**: design-foundation selesai
- **Files**: `components/BannerCarousel.tsx` (REFACTOR)

#### Subtasks
1. Hapus background stripes
2. Ganti hardcoded colors ke design tokens
3. Navigation arrows: gunakan `IconButton` component
4. CTA button: gunakan `Button` component
5. Container: gunakan `Card` atau design tokens
6. Indicators: gunakan design tokens
7. Hapus font-mono dan uppercase excessive di text overlay

---

## Milestone 3: Integration

### Task D8: Homepage Integration

- **Status**: TODO
- **Priority**: High
- **Estimasi**: 1 jam
- **Dependencies**: D1-D7
- **Files**: `app/page.tsx` (MODIFY)

#### Subtasks
1. Ganti `bg-[#0a0a0a]` → `bg-canvas`
2. Marquee section: ganti hardcoded colors ke design tokens
3. Section header: gunakan `text-heading-1` atau `text-heading-2`
4. Hapus font-mono dan uppercase excessive
5. Ganti border-2 decorative ke border-border-subtle
6. "ATUR ULANG" button: gunakan `Button` component
7. Verifikasi semua komponen child sudah konsisten

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 1,
      "name": "Core Components",
      "tasks": ["D1", "D3"],
      "description": "ProductCard dan CategoryPills independent, bisa paralel"
    },
    {
      "id": 2,
      "name": "Product Grid",
      "tasks": ["D2"],
      "description": "D2 depend D1"
    },
    {
      "id": 3,
      "name": "Homepage Sections",
      "tasks": ["D4", "D5", "D6", "D7"],
      "description": "Semua section bisa paralel setelah core components"
    },
    {
      "id": 4,
      "name": "Integration",
      "tasks": ["D8"],
      "description": "Final integration setelah semua komponen selesai"
    }
  ]
}
```

## Notes

- Semua task adalah refactor visual, tidak ada perubahan data atau logic
- Prioritaskan ProductCard dan HeroSection karena paling visible
- Gunakan `PriceTag`, `Button`, `Eyebrow`, `Card` dari `@/components/ui`
- Setelah selesai, jalankan build dan typecheck
