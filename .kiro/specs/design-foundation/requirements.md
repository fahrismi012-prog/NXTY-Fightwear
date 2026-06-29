# Requirements Document

## Introduction

Fase pertama dari redesign menyeluruh NXTY Fightwear menuju gaya **premium-minimal photography-led** ala Nike, Gymshark, Hayabusa, Venum, Apple, dan Muji. Spec ini fokus pada pondasi visual dan komponen dasar yang akan dipakai semua fase berikutnya.

Brand identity tetap: hitam (#0a0a0a), putih, merah (#dc2626). Yang berubah adalah bagaimana ketiganya digunakan dan dengan typography/spacing/komponen apa.

## Posisi di Roadmap

| Fase | Nama Spec | Cakupan |
|------|-----------|---------|
| 1 | **design-foundation** (spec ini) | Design tokens, UI primitives, Navigation, Footer |
| 2 | checkout-flow-redesign | Product Detail, Cart, Checkout |
| 3 | discovery-redesign | Homepage, Product Listing |
| 4 | editorial-pages-redesign | About, Contact |

Spec ini wajib selesai sebelum fase 2 dimulai karena komponen dan token yang dihasilkan menjadi dependency untuk fase berikutnya.

## Glossary

- **Design Token**: Variabel terstandar untuk warna, typography, spacing, radius, motion yang dipakai konsisten di seluruh aplikasi
- **UI Primitive**: Komponen dasar yang reusable (Button, Input, Card, Sheet, dll)
- **AppShell**: Layout container yang membungkus seluruh halaman publik dengan TopHeader, BottomNav, Footer, dan overlay layer
- **Thumb Zone**: Area layar mobile yang nyaman dijangkau ibu jari (umumnya bagian bawah)
- **Photography-led**: Pendekatan desain di mana foto produk/atlet menjadi elemen visual dominan, UI chrome diminimalkan

## Requirements

### Requirement 1: Design Tokens System

**User Story:** Sebagai developer, saya ingin design tokens yang terdefinisi jelas, agar seluruh halaman konsisten secara visual tanpa hard-coded values berserakan.

#### Acceptance Criteria

1. THE System SHALL menyediakan color tokens untuk brand (black, white, red), neutral scale (50–950), dan semantic (success, warning, error)
2. THE System SHALL menyediakan typography scale (display, heading, body, caption, eyebrow) dengan font-size, line-height, dan weight terdefinisi
3. THE System SHALL menyediakan spacing tokens (section padding, card padding, container padding)
4. THE System SHALL menyediakan radius tokens (0, 4px, 8px, full)
5. THE System SHALL menyediakan motion tokens (duration, easing) yang menghormati `prefers-reduced-motion`
6. WHERE token didefinisikan, THE System SHALL dipakai via Tailwind class atau CSS variable, bukan inline style
7. THE Red Color SHALL hanya dipakai untuk CTA primer, badge promo aktif, dan urgency indicator

**Prioritas:** Critical

### Requirement 2: UI Primitive Components

**User Story:** Sebagai developer, saya ingin komponen UI primitive yang konsisten, agar tidak ada duplikasi kode dan styling di seluruh halaman.

#### Acceptance Criteria

1. THE System SHALL menyediakan komponen Button dengan variants (primary, secondary, ghost, destructive) dan sizes (sm, md, lg)
2. THE Button Component SHALL support states: default, hover, active, disabled, loading
3. THE System SHALL menyediakan komponen Input dan Textarea dengan label, error, hint, dan icon slots
4. THE System SHALL menyediakan komponen Sheet (bottom, right, fullscreen) reusable
5. THE System SHALL menyediakan komponen Dialog/Modal untuk konfirmasi dan size guide
6. THE System SHALL menyediakan komponen Badge dengan variants (default, promo, new, success)
7. THE System SHALL menyediakan komponen PriceTag dengan tabular numeric dan handling original vs sale price
8. THE System SHALL menyediakan komponen IconButton dengan sizes minimal 32px (sm), 40px (md), 44px (lg)
9. ALL Interactive Components SHALL memenuhi minimum tap target 44×44px untuk size md/lg
10. ALL Components SHALL accessible (ARIA labels, keyboard navigation, focus visible)

**Prioritas:** Critical

### Requirement 3: New Top Header

**User Story:** Sebagai pengguna mobile, saya ingin header yang ringkas dan fitur cari yang langsung pakai, agar bisa mulai belanja tanpa menunggu beberapa tap.

#### Acceptance Criteria

1. THE Top Header SHALL tinggi 56px di mobile, tidak ada marquee strip
2. THE Top Header SHALL menampilkan logo (kiri), search field persisten (tengah), dan icon Cart dengan badge (kanan) di mobile
3. THE Top Header SHALL menampilkan logo, nav links, dan action icons di desktop
4. THE Search Field SHALL langsung tappable tanpa harus expand dulu di mobile
5. THE Top Header SHALL auto-hide saat scroll ke bawah dan tampil saat scroll ke atas
6. THE Top Header SHALL sticky di posisi atas dengan backdrop blur saat scroll
7. THE Top Header SHALL tidak menampilkan hamburger menu (digantikan oleh BottomNav untuk mobile)

**Prioritas:** Critical

### Requirement 4: Bottom Navigation Fix and Refresh

**User Story:** Sebagai pengguna mobile, saya ingin bottom nav yang fungsional dan tidak ada bug, agar setiap tap menuju halaman yang tepat.

#### Acceptance Criteria

1. THE Bottom Navigation SHALL terdiri dari 5 tab: Beranda, Belanja, Wishlist, Keranjang, Akun
2. WHEN user logged in DAN tap tab Akun, THE System SHALL navigate ke `/akun`
3. WHEN user guest DAN tap tab Akun, THE System SHALL navigate ke `/masuk`
4. THE Bottom Navigation SHALL tidak punya tab "Cari" (search sudah persisten di header)
5. THE Tab Belanja SHALL membuka MegaMenuSheet untuk kategori navigation
6. THE Tab Wishlist SHALL navigate ke `/wishlist` (halaman dibuat di fase berikutnya, di fase ini cukup link valid)
7. THE Bottom Navigation Labels SHALL pakai mixed case (Beranda, bukan BERANDA)
8. THE Bottom Navigation SHALL otomatis hidden pada route `/checkout`, `/payment/*`, `/admin/*`
9. THE Cart Tab SHALL menampilkan badge dengan jumlah item

**Prioritas:** Critical

### Requirement 5: Mega Menu Sheet

**User Story:** Sebagai pengguna, saya ingin menu kategori yang visual dan mudah dipindai, agar saya bisa langsung tahu ada produk apa saja di setiap kategori.

#### Acceptance Criteria

1. THE Mega Menu Sheet SHALL ditampilkan sebagai bottom sheet di mobile dan dropdown panel di desktop
2. THE Mega Menu Sheet SHALL menampilkan daftar kategori dengan thumbnail produk hero per kategori
3. THE Mega Menu Sheet SHALL menampilkan "Lihat semua produk" sebagai item pertama
4. THE Mega Menu Sheet SHALL menampilkan link "Promo" sebagai item terakhir
5. THE Mega Menu Sheet SHALL close otomatis setelah user memilih kategori

**Prioritas:** High

### Requirement 6: Wishlist Foundation

**User Story:** Sebagai pengguna, saya ingin bisa menyimpan produk favorit, agar saya tidak kehilangan intent saat browsing.

#### Acceptance Criteria

1. THE System SHALL menyediakan WishlistContext dengan methods add, remove, has, toggle, items
2. THE Wishlist SHALL persistent via localStorage
3. THE System SHALL menyediakan halaman `/wishlist` minimal (placeholder yang menampilkan daftar item tersimpan) di fase ini
4. THE Wishlist Tab di BottomNav SHALL menampilkan badge jumlah item tersimpan

**Prioritas:** High

### Requirement 7: New Footer

**User Story:** Sebagai pengguna, saya ingin footer yang informatif sebagai safety net untuk menemukan halaman penting (kebijakan, kontak, pembayaran yang diterima), agar saya yakin brand ini profesional.

#### Acceptance Criteria

1. THE Footer SHALL multi-kolom di desktop (4 kolom + newsletter) dan accordion di mobile
2. THE Footer SHALL berisi kolom: Belanja, Bantuan, Perusahaan, Newsletter
3. THE Footer SHALL menampilkan logo metode pembayaran (BCA, BNI, Mandiri, GoPay, OVO, DANA, ShopeePay, QRIS, COD)
4. THE Footer SHALL menampilkan link sosial media (Instagram, TikTok, YouTube) dengan tap target 44×44
5. THE Footer SHALL menampilkan link Privacy Policy, Terms of Service, Refund Policy
6. THE Footer SHALL berisi NewsletterSignup component dengan input email + tombol Berlangganan
7. THE Footer SHALL pakai design tokens baru (tidak pakai bg-stripes-red atau border merah dekoratif)

**Prioritas:** High

### Requirement 8: AppShell Refactor

**User Story:** Sebagai developer, saya ingin AppShell yang composable, agar saya bisa kontrol kapan TopHeader, BottomNav, dan Footer muncul berdasarkan route.

#### Acceptance Criteria

1. THE AppShell SHALL render TopHeader di semua route publik kecuali `/admin/*`
2. THE AppShell SHALL render BottomNav conditional (hide di `/checkout`, `/payment/*`, `/admin/*`)
3. THE AppShell SHALL render Footer di semua route publik kecuali `/admin/*`, `/checkout`, `/payment/*`
4. THE AppShell SHALL menjadi tempat overlay layer (CartDrawer, MegaMenuSheet, SearchModal) dirender
5. THE AppShell SHALL wrap children dengan WishlistProvider

**Prioritas:** Critical

### Requirement 9: Migration Compatibility

**User Story:** Sebagai developer, saya ingin redesign foundation tidak merusak halaman yang belum diredesign, agar saya bisa rilis bertahap tanpa downtime.

#### Acceptance Criteria

1. WHEN spec ini selesai, halaman existing (Homepage, Product Detail, Cart, Checkout, About, Contact) SHALL tetap dapat dibuka tanpa error meski masih pakai style lama di body content
2. THE TopHeader Baru SHALL dipakai oleh semua halaman publik existing
3. THE BottomNav Baru SHALL dipakai oleh semua halaman publik existing
4. THE Footer Baru SHALL dipakai oleh semua halaman publik existing (kecuali admin/checkout/payment)
5. THE Existing ProductCard, HeroSection, BrandIntroSection SHALL boleh tetap dengan style lama di fase ini; akan diredesign di fase 3
6. THE Build dan Typecheck SHALL pass tanpa error baru
7. THE Existing Functionality SHALL tidak ada yang break (cart, search, navigation, login flow)

**Prioritas:** Critical

## Out of Scope (Untuk Fase Berikutnya)

- Redesign ProductCard, HeroSection, BrandIntroSection, FlashSaleSection (fase 3)
- Redesign halaman Product Detail, Cart, Checkout (fase 2)
- Redesign halaman About, Contact (fase 4)
- Mengubah database schema atau API contracts
- Wishlist page lengkap dengan filter dan sort (fase ini cukup placeholder)
- Newsletter integration ke email service (fase ini cukup endpoint stub)
- Pembuatan asset foto baru (foto pabrik, foto atlet) — akan dilakukan terpisah
