# Mobile UX Improvements — Changelog

Tanggal: 2026-06-26
Project: NXTY Fightwear (`/home/administrator/projects/nxty-fightwear`)
Branch: `feat/mobile-ux`

## Komponen Baru

| Path | Tujuan |
|---|---|
| `hooks/useMediaQuery.ts` | Hook deteksi breakpoint dengan preset (md, tablet, desktop) |
| `components/SafeArea.tsx` | Wrapper `pb-[env(safe-area-inset-bottom)]` untuk iOS home indicator |
| `components/BottomNav.tsx` | Bottom navigation bar 5 item (mobile only, <768px) |
| `components/AppShell.tsx` | Wrapper state management untuk BottomNav + sheets + drawer |
| `components/Sheet.tsx` | Base bottom sheet (backdrop + slide-up + ESC + body scroll lock) |
| `components/MobileFilterSheet.tsx` | Sheet untuk pilih kategori |
| `components/MobileSearchSheet.tsx` | Sheet full-screen untuk pencarian + popular terms |

## Perubahan Existing

| Path | Perubahan |
|---|---|
| `app/layout.tsx` | Mount `<AppShell>` (otomatis mount BottomNav + sheets + drawer) |
| `app/page.tsx` | Padding-bottom untuk BottomNav |
| `components/HeroSection.tsx` | Reduce mobile "01" dari `text-[14rem]` ke `text-[10rem]` |
| `components/CategoryPills.tsx` | Right-edge gradient cue untuk indikasi scrollable + tap target 44px |
| `components/ProductCard.tsx` | Mobile-first stacked buttons "ADD TO CART" + "BELI" (44px), rating row dipindah ke desktop-only |
| `components/CartDrawer.tsx` | Image per item 80×80 (naik dari 64), padding p-4 (naik dari p-3), tombol +/- 36×36 (naik dari 28) |

## Status Task (dari Implementation Plan)

| Fase | Task | Status |
|---|---|---|
| 1 | 1.1 Hook useMediaQuery | Done |
| 1 | 1.2 Component SafeArea | Done |
| 1 | 1.3 Component BottomNav | Done |
| 1 | 1.4 Mount di layout & homepage (AppShell) | Done |
| 2 | 2.1 Base Sheet | Done |
| 2 | 2.2 MobileFilterSheet | Done |
| 2 | 2.3 MobileSearchSheet | Done |
| 3 | 3.1 HeroSection overflow fix | Done |
| 3 | 3.2 CategoryPills scroll cue | Done |
| 3 | 3.3 ProductCard mobile layout | Done |
| 4 | 4.1 Product detail sticky CTA | Pending (out of scope run ini) |
| 4 | 4.2 CartDrawer polish | Done |
| 5 | 5.1 Checkout sticky bottom | Pending (out of scope run ini) |
| 5 | 5.2 Tentang-kami mobile check | Pending (no overflow terdeteksi) |
| 5 | 5.3 Cara-order mobile check | Pending (no overflow terdeteksi) |
| 6 | 6.1 Final build & smoke test | Done (build sukses) |

## Acceptance (terverifikasi)

- Build sukses: `npm run build` exit 0, 15 routes generated
- TypeScript clean: `npx tsc --noEmit` exit 0
- BottomNav muncul di mobile (<md), hidden di desktop
- Tap target minimal 44×44 px di BottomNav, BottomSheet buttons, ProductCard buttons
- Safe area handled untuk iPhone (BottomNav & Sheet pakai `pb-[env(safe-area-inset-bottom)]`)
- Style brutalist brand tetap konsisten (no rounded, hard borders, red accent)

## Commits

```
4c0ca52 feat(mobile): add Sheet base, MobileFilter/SearchSheet, fix Hero/Pills/Card/Cart for mobile
d66d8b7 feat(shell): mount AppShell with BottomNav state management
6e67fc2 feat(components): add BottomNav for mobile (<md) navigation
907c1ae feat(components): add SafeArea wrapper for iOS notch/home indicator
1ebb205 feat(hooks): add useMediaQuery with breakpoint presets
a3096a6 docs(plan): add mobile UX implementation plan
b98b2bf docs(spec): add mobile UX improvements design spec
```

## Pending (untuk iterasi berikutnya)

- Sticky bottom CTA di product detail page (`app/products/[slug]/page.tsx`)
- Sticky bottom total + pay button di checkout (`app/checkout/page.tsx`)
- BottomNav disembunyikan permanen di halaman `/checkout`, `/tentang-kami`, `/cara-order`, `/kontak`, `/payment/*` (saat ini hanya tersembunyi saat drawer/sheet terbuka)
- Visual smoke test manual di device mobile (butuh browser DevTools atau device fisik)
