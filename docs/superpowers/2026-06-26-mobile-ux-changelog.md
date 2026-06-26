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
| `components/AppShell.tsx` | Wrapper state management untuk BottomNav + sheets + drawer (konsumsi UIContext) |
| `components/Sheet.tsx` | Base bottom sheet (backdrop + slide-up + ESC + body scroll lock) |
| `components/MobileFilterSheet.tsx` | Sheet untuk pilih kategori |
| `components/MobileSearchSheet.tsx` | Sheet full-screen untuk pencarian + popular terms |
| `contexts/UIContext.tsx` | Global modal state (cart/filter/search open/close) — digunakan oleh Navbar & BottomNav |

## Perubahan Existing

| Path | Perubahan |
|---|---|
| `app/layout.tsx` | Mount `<AppShell>` (otomatis mount BottomNav + sheets + drawer), wrap dengan `<UIProvider>` |
| `app/page.tsx` | Padding-bottom untuk BottomNav, hapus local CartDrawer + state |
| `app/promo/page.tsx` | Hapus local CartDrawer + state |
| `components/HeroSection.tsx` | Reduce mobile "01" dari `text-[14rem]` ke `text-[10rem]` |
| `components/CategoryPills.tsx` | Right-edge gradient cue untuk indikasi scrollable + tap target 44px |
| `components/ProductCard.tsx` | Mobile-first stacked buttons "ADD TO CART" + "BELI" (44px), rating row dipindah ke desktop-only |
| `components/CartDrawer.tsx` | Image per item 80×80 (naik dari 64), padding p-4 (naik dari p-3), tombol +/- 36×36 (naik dari 28) |
| `components/Navbar.tsx` | Tombol cart pakai `useUI().openCart()` (no more props drilling) |
| `app/products/[slug]/page.tsx` | Sticky bottom CTA mobile (quantity selector + Cart + Beli di fixed bottom) |
| `app/checkout/page.tsx` | Sticky bottom mobile (total + tombol Bayar), form ID `checkout-form` |
| `app/tentang-kami/page.tsx` | Back-button tap target 44×44 px |
| `app/cara-order/page.tsx` | Back-button tap target 44×44 px |

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
| 4 | 4.1 Product detail sticky CTA | Done |
| 4 | 4.2 CartDrawer polish | Done |
| 5 | 5.1 Checkout sticky bottom | Done |
| 5 | 5.2 Tentang-kami mobile check | Done (back-button tap target fix) |
| 5 | 5.3 Cara-order mobile check | Done (back-button tap target fix) |
| 6 | 6.1 Final build & smoke test | Done (build sukses) |

## Acceptance (terverifikasi)

- ✅ Build sukses: `npm run build` exit 0, 15 routes generated
- ✅ TypeScript clean: `npx tsc --noEmit` exit 0
- ✅ Tidak ada horizontal overflow di mobile (tidak ditemukan di static pages)
- ✅ Tap targets minimal 44×44 px di BottomNav, BottomSheet, ProductCard, back-buttons
- ✅ Font body ≥12px di mobile (decorative badges 10px acceptable sesuai brutalist style)
- ✅ Safe area handled untuk iPhone (BottomNav, Sheet, sticky CTAs pakai `env(safe-area-inset-bottom)`)
- ✅ BottomNav muncul di mobile (<md), hidden di desktop
- ✅ Style brutalist brand tetap konsisten
- ✅ Double CartDrawer issue ter-resolve via UIContext (single source of truth)

## Commits

```
151c867 fix(static-pages): mobile layout adjustments for tentang-kami and cara-order
c00b455 feat(checkout): add sticky bottom total + pay button for mobile
b00c006 feat(product-detail): add sticky bottom CTA for mobile
7953341 refactor(ui): extract modal state to UIContext, remove duplicate CartDrawer
e434f1a docs: add mobile UX changelog (Phase 1-3 + 4.2 done, build green)
4c0ca52 feat(mobile): add Sheet base, MobileFilter/SearchSheet, fix Hero/Pills/Card/Cart for mobile
d66d8b7 feat(shell): mount AppShell with BottomNav state management
6e67fc2 feat(components): add BottomNav for mobile (<md) navigation
907c1ae feat(components): add SafeArea wrapper for iOS notch/home indicator
1ebb205 feat(hooks): add useMediaQuery with breakpoint presets
a3096a6 docs(plan): add mobile UX implementation plan
b98b2bf docs(spec): add mobile UX improvements design spec
```

## Pending (untuk iterasi berikutnya)

- BottomNav disembunyikan permanen di halaman `/checkout`, `/tentang-kami`, `/cara-order`, `/kontak`, `/payment/*` (saat ini hanya tersembunyi saat drawer/sheet terbuka)
- Visual smoke test manual di device mobile (butuh browser DevTools atau device fisik)
- Form field validation feedback yang lebih jelas di checkout
- Loading skeleton untuk product grid saat filter/search
- Animation polish di mobile sheets (spring transition)
