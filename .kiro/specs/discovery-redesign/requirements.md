# Requirements Document — Discovery Redesign (Fase 3)

## Introduction

Fase 3 fokus pada **discovery experience**: Homepage, Product Listing, ProductCard, HeroSection, BrandIntroSection, FlashSaleSection. Semua komponen yang user lihat saat menjelajahi produk.

## Posisi di Roadmap

| Fase | Spec | Status |
|------|------|--------|
| 1 | design-foundation | ✅ Selesai |
| 2 | checkout-flow-redesign | ✅ Selesai |
| 3 | **discovery-redesign** (spec ini) | 🔄 In Progress |
| 4 | editorial-pages-redesign | Belum dimulai |

## Requirements

### Requirement 1: HeroSection Redesign

**User Story:** Sebagai pembeli, saya ingin hero section yang bersih dan fokus pada CTA utama, agar saya langsung mengerti apa yang ditawarkan.

#### Acceptance Criteria

1. THE HeroSection SHALL menghapus background stripes
2. THE HeroSection SHALL menghapus huge background number "01"
3. THE HeroSection SHALL menghapus border-b-2 yang menciptakan visual noise
4. THE HeroSection SHALL menggunakan design tokens (bg-canvas, text-text-primary, bg-brand-red)
5. THE HeroSection SHALL menampilkan headline dengan `text-display-1` atau `text-heading-1`
6. THE HeroSection CTA buttons SHALL menggunakan `Button` component dari `@/components/ui`
7. THE HeroSection SHALL menghapus status tag "STATUS / SIAP" yang redundant
8. THE HeroSection stats bar SHALL menggunakan `Card` atau design tokens
9. THE HeroSection SHALL memiliki spacing yang konsisten dengan design system

**Prioritas:** Critical

---

### Requirement 2: BrandIntroSection Redesign

**User Story:** Sebagai pembeli, saya ingin memahami brand dengan cepat tanpa visual noise.

#### Acceptance Criteria

1. THE BrandIntroSection SHALL menggunakan design tokens
2. THE BrandIntroSection SHALL menghapus emoji di feature grid (ganti dengan ikon lucide)
3. THE BrandIntroSection SHALL menggunakan `text-heading-1` atau `text-heading-2` untuk judul
4. THE BrandIntroSection CTA SHALL menggunakan `Button` component
5. THE BrandIntroSection SHALL menghapus border-b-2 dekoratif
6. THE BrandIntroSection SHALL menggunakan `Eyebrow` component untuk label kecil

**Prioritas:** High

---

### Requirement 3: ProductCard Redesign

**User Story:** Sebagai pembeli, saya ingin product card yang bersih, informatif, dan konsisten dengan design system.

#### Acceptance Criteria

1. THE ProductCard SHALL menghapus grayscale filter pada gambar
2. THE ProductCard SHALL menghapus index numbering (01, 02, 03)
3. THE ProductCard SHALL menggunakan design tokens
4. THE ProductCard harga SHALL menggunakan `PriceTag` component
5. THE ProductCard category SHALL menggunakan `Eyebrow` component
6. THE ProductCard CTA buttons SHALL menggunakan `Button` component
7. THE ProductCard SHALL memiliki hover effect yang subtle (scale 1.02, tidak 1.1)
8. THE ProductCard nama produk SHALL mixed case dengan `text-body font-semibold`

**Prioritas:** Critical

---

### Requirement 4: ProductGrid Redesign

**User Story:** Sebagai pembeli, saya ingin grid produk yang bersih tanpa visual noise.

#### Acceptance Criteria

1. THE ProductGrid SHALL menghapus outer border-2 yang menciptakan box effect
2. THE ProductGrid SHALL menggunakan gap antar card
3. THE ProductGrid SHALL menggunakan design tokens
4. THE ProductGrid empty state SHALL menggunakan design tokens dan `Button` component

**Prioritas:** High

---

### Requirement 5: FlashSaleSection Redesign

**User Story:** Sebagai pembeli, saya ingin flash sale section yang urgency tanpa brutalist noise.

#### Acceptance Criteria

1. THE FlashSaleSection SHALL menghapus grayscale filter pada gambar
2. THE FlashSaleSection SHALL menghapus index numbering
3. THE FlashSaleSection SHALL menggunakan design tokens
4. THE FlashSaleSection harga SHALL menggunakan `PriceTag` component
5. THE FlashSaleSection CTA buttons SHALL menggunakan `Button` component
6. THE FlashSaleSection header SHALL menggunakan `text-heading-2` atau `text-heading-3`
7. THE FlashSaleSection SHALL menggunakan `Card` untuk container

**Prioritas:** High

---

### Requirement 6: CategoryPills Redesign

**User Story:** Sebagai pembeli, saya ingin category filter yang konsisten dengan design system.

#### Acceptance Criteria

1. THE CategoryPills SHALL menggunakan design tokens
2. THE CategoryPills SHALL menggunakan `rounded-subtle` untuk border radius
3. THE CategoryPills selected state SHALL menggunakan `bg-brand-red border-brand-red`
4. THE CategoryPills SHALL tetap memenuhi 44px minimum tap target

**Prioritas:** Medium

---

### Requirement 7: BannerCarousel Redesign

**User Story:** Sebagai pembeli, saya ingin banner yang fokus pada konten tanpa visual noise.

#### Acceptance Criteria

1. THE BannerCarousel SHALL menghapus background stripes
2. THE BannerCarousel SHALL menggunakan design tokens
3. THE BannerCarousel CTA SHALL menggunakan `Button` component
4. THE BannerCarousel navigation arrows SHALL menggunakan `IconButton` component
5. THE BannerCarousel SHALL menggunakan `Card` atau design tokens untuk container

**Prioritas:** Medium

---

### Requirement 8: Homepage Page Redesign

**User Story:** Sebagai pembeli, saya ingin homepage yang kohesif dengan design system.

#### Acceptance Criteria

1. THE Homepage SHALL menggunakan `bg-canvas` sebagai background
2. THE Homepage marquee SHALL menggunakan design tokens
3. THE Homepage section header SHALL menggunakan `text-heading-1` atau `text-heading-2`
4. THE Homepage SHALL menghapus hardcoded colors
5. THE Homepage SHALL memiliki spacing konsisten dengan design system

**Prioritas:** High

---

## Out of Scope

- Perubahan data structure (products.json, promotions.json)
- Perubahan routing
- Integrasi baru (ongkir real-time, dll)
- Editorial pages (About, Contact) - fase 4
