# Implementation Tasks - NXTY Fightwear MVP

## Sprint A - Stabilitas Project (High Priority)

### Task A1: Custom 404 Page
- **Status**: COMPLETED
- **Priority**: High
- **Estimasi**: 2 jam
- **Dependencies**: None
- **Files**: `app/not-found.tsx` (NEW)

#### Tasks:
1. Buat file `app/not-found.tsx` dengan layout brutalist
2. Tampilkan logo NXTY Fightwear
3. Tampilkan pesan 404 yang jelas
4. Tambahkan tombol "Kembali ke Homepage" (home icon)
5. Tambahkan background pattern stripes
6. Pastikan mobile-friendly dengan touch-friendly button (44px)

---

### Task A2: Global Error Page
- **Status**: COMPLETED
- **Priority**: High
- **Estimasi**: 2 jam
- **Dependencies**: Task A1
- **Files**: `app/error.tsx` (NEW)

#### Tasks:
1. Buat file `app/error.tsx` dengan layout brutalist
2. Tampilkan error icon dengan warna merah
3. Tampilkan pesan error yang user-friendly (tidak teknis)
4. Tambahkan tombol "Refresh Halaman"
5. Tambahkan tombol "Kembali ke Homepage"
6. Implement error tracking (console.warn)
7. Pastikan mobile-friendly

---

### Task A3: Skeleton Loading Component
- **Status**: COMPLETED
- **Priority**: High
- **Estimasi**: 3 jam
- **Dependencies**: None
- **Files**: `components/Skeleton.tsx`, `components/SkeletonCard.tsx`, `components/SkeletonBanner.tsx` (NEW)

#### Tasks:
1. Buat komponen `Skeleton.tsx` generic untuk loading
2. Buat komponen `SkeletonCard.tsx` untuk product card
3. Buat komponen `SkeletonBanner.tsx` untuk banner carousel
4. Implement skeleton dengan gradient animation
5. Tambahkan `SkeletonCard` ke `ProductGrid.tsx`
6. Tambahkan `SkeletonBanner` ke `BannerCarousel.tsx`
7. Tambahkan skeleton ke `HeroSection.tsx`
8. Pastikan skeleton mengikuti brand color

---

### Task A4: Build & Typecheck Verification
- **Status**: COMPLETED
- **Priority**: High
- **Estimasi**: 2 jam
- **Dependencies**: Task A1, A2, A3
- **Files**: None (verification)

**Verification Results:**
- ✅ `npm run build` - SUCCESS (compiled in 17.7s, all pages generated)
- ✅ `npx tsc --noEmit` - SUCCESS (no type errors)
- ✅ `npx eslint` on new files - SUCCESS (no errors on Skeleton.tsx, SkeletonCard.tsx, SkeletonBanner.tsx)
- ⏳ Development mode testing - Need to run manually (`npm run dev`)
- ⏳ Production build testing - Need to test manually

**Note:** Lint menemukan 32 issues di codebase lama (bukan dari perubahan task A1-A4). Issues mencakup:
- 19 errors (no-explicit-any, no-unused-vars, jsx-no-comment-textnodes, set-state-in-effect)
- 13 warnings (unused variables)

Issues ini bukan dari perubahan task A1-A3 yang baru, dan merupakan pre-existing issues dari project.

---

## Sprint B - Homepage Experience (High Priority)

### Task B1: Header Enhancement
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 2 jam
- **Dependencies**: Task A1, A2, A3
- **Files**: `components/Navbar.tsx` (MODIFY)

#### Tasks:
1. Pastikan header sticky saat scroll
2. Tambahkan search bar dengan autocomplete
3. Tambahkan cart icon dengan badge jumlah item
4. Tambahkan user menu dengan login/akun
5. Implement mobile menu button
6. Pastikan semua tombol 44px tap area
7. Tambahkan ARIA labels untuk accessibility

---

### Task B2: Hero Banner
- **Status**: TODO
- **Priority**: Medium
- **Estimasi**: 3 jam
- **Dependencies**: Task A3
- **Files**: `components/HeroSection.tsx` (MODIFY)

#### Tasks:
1. Tambahkan skeleton loading ke hero banner
2. Implement swipe gesture untuk mobile
3. Tambahkan autoplay untuk carousel (3s interval)
4. Tambahkan pagination dots
5. Tambahkan CTA button di setiap slide
6. Pastikan gambar responsive dan optimized

---

### Task B3: Search Functionality
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 4 jam
- **Dependencies**: Task B1
- **Files**: `components/Navbar.tsx`, `app/products/search/page.tsx` (NEW)

#### Tasks:
1. Implement search bar dengan live search di navbar
2. Tambahkan autocomplete suggestions
3. Navigate ke `/products/search?q={query}` saat submit
4. Buat `app/products/search/page.tsx` dengan:
   - Filter by category
   - Sort by price, rating, newest
   - Search results grid
5. Tambahkan skeleton loading untuk results
6. Tambahkan "No results found" state

---

### Task B4: Category List
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 2 jam
- **Dependencies**: Task A3
- **Files**: `components/CategoryPills.tsx` (MODIFY)

#### Tasks:
1. Tambahkan skeleton loading ke category pills
2. Implement horizontal scroll untuk kategori banyak
3. Tambahkan active state indicator
4. Tambahkan category icon (optional)
5. Navigate ke filtered products saat klik

---

### Task B5: Flash Sale Section
- **Status**: TODO
- **Priority**: Medium
- **Estimasi**: 3 jam
- **Dependencies**: Task A3, B1
- **Files**: `components/FlashSaleSection.tsx` (MODIFY)

#### Tasks:
1. Tambahkan skeleton loading ke flash sale
2. Implement countdown timer (optional)
3. Tampilkan badge "FLASH SALE" pada produk
4. Tampilkan harga diskon dengan original price
5. Navigate ke product detail saat klik
6. Tambahan "Lihat Semua" button

---

### Task B6: Product Grid
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 2 jam
- **Dependencies**: Task A3
- **Files**: `components/ProductGrid.tsx`, `components/ProductCard.tsx` (MODIFY)

#### Tasks:
1. Tambahkan skeleton loading ke product grid
2. Implement lazy loading untuk gambar
3. Tambahkan hover effect untuk produk
4. Pastikan grid responsif (2 cols mobile, 3-4 cols desktop)
5. Tambahkan spacing yang konsisten

---

### Task B7: Footer
- **Status**: TODO
- **Priority**: Low
- **Estimasi**: 2 jam
- **Dependencies**: Task A1
- **Files**: `app/page.tsx` (MODIFY)

#### Tasks:
1. Tambahkan footer dengan brand info
2. Tambahkan links ke about, terms, privacy
3. Tambahkan social media icons
4. Tambahkan contact info (email, phone)
5. Mobile-friendly layout

---

## Sprint C - Shopping Experience (High Priority)

### Task C1: Cart Page
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 6 jam
- **Dependencies**: Task B1
- **Files**: `app/cart/page.tsx` (NEW)

#### Tasks:
1. Buat `app/cart/page.tsx` dengan:
   - Cart items list
   - Update quantity controls
   - Delete item functionality
   - Subtotal, shipping, total calculation
   - Checkout button
   - Empty cart state
2. Implement update quantity dari cart page
3. Implement delete item dari cart page
4. Tambahan "Lanjut Belanja" button
5. Mobile sticky bottom action bar
6. Integration dengan CartContext

---

### Task C2: Search Result Page
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 4 jam
- **Dependencies**: Task B3
- **Files**: `app/products/search/page.tsx` (MODIFY)

#### Tasks:
1. Tambahkan filter sidebar/overlay
2. Implement sorting options (price, rating, newest)
3. Filter by category
4. Filter by price range
5. Filter by rating
6. Update search results when filter changes
7. Mobile-friendly filter sheet

---

### Task C3: Related Products
- **Status**: TODO
- **Priority**: Medium
- **Estimasi**: 2 jam
- **Dependencies**: Task B6
- **Files**: `app/products/[slug]/page.tsx` (MODIFY)

#### Tasks:
1. Tambahkan section "Produk Terkait" di product detail page
2. Tampilkan produk dari kategori yang sama
3. Limit 4-6 produk terkait
4. Tampilkan dalam grid layout
5. Navigate ke product detail saat klik

---

### Task C4: Wishlist Feature
- **Status**: TODO
- **Priority**: Low
- **Estimasi**: 4 jam
- **Dependencies**: Task B6
- **Files**: `app/wishlist/page.tsx`, `components/WishlistButton.tsx` (NEW)

#### Tasks:
1. Buat `components/WishlistButton.tsx` untuk toggle wishlist
2. Buat `app/wishlist/page.tsx` untuk wishlist page
3. Implement wishlist context/state
4. Save wishlist ke localStorage atau Supabase
5. Show toast notification saat add/remove wishlist
6. Navigate ke product detail saat klik wishlist item

---

## Sprint D - Checkout (High Priority)

### Task D1: Address Selection
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 4 jam
- **Dependencies**: Task C1
- **Files**: `app/api/checkout/address/route.ts`, `components/AddressSelector.tsx` (NEW)

#### Tasks:
1. Buat API endpoint `app/api/checkout/address/route.ts` (GET, POST)
2. Buat `components/AddressSelector.tsx` untuk select/add address
3. Implement address form validation
4. Tampilkan list address yang tersimpan
5. Tambahkan "Tambah Alamat Baru" button
6. Set default address option

---

### Task D2: Shipping Options
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 4 jam
- **Dependencies**: Task D1
- **Files**: `app/api/checkout/shipping/route.ts`, `components/ShippingOptions.tsx` (NEW)

#### Tasks:
1. Buat API endpoint `app/api/checkout/shipping/route.ts` untuk shipping rates
2. Buat `components/ShippingOptions.tsx` untuk shipping selection
3. Implement shipping rate calculation berdasarkan address
4. Tampilkan estimasi waktu pengiriman
5. Show selected shipping option
6. Update total harga saat shipping change

---

### Task D3: Payment Methods
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 4 jam
- **Dependencies**: Task D2
- **Files**: `components/PaymentMethods.tsx` (NEW)

#### Tasks:
1. Buat `components/PaymentMethods.tsx` untuk payment selection
2. Implement Midtrans payment options (Credit Card, Transfer Bank, E-Wallet)
3. Tampilkan payment instructions untuk Transfer Bank
4. Tampilkan QR code untuk E-Wallet
5. Validate payment method selection
6. Update total saat payment change

---

### Task D4: Order Review
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 4 jam
- **Dependencies**: Task D1, D2, D3
- **Files**: `app/checkout/page.tsx` (MODIFY)

#### Tasks:
1. Update `app/checkout/page.tsx` dengan:
   - Order summary (items, subtotal)
   - Shipping address display
   - Shipping method display
   - Payment method display
   - Total calculation
2. Implement order confirmation
3. Create Midtrans transaction API call
4. Redirect ke Midtrans payment page
5. Show loading state saat checkout

---

## Sprint E - Admin Panel (High Priority)

### Task E1: Admin Dashboard Chart
- **Status**: TODO
- **Priority**: Medium
- **Estimasi**: 4 jam
- **Dependencies**: Task A4
- **Files**: `app/admin/page.tsx`, `components/admin/StatsChart.tsx` (NEW)

#### Tasks:
1. Buat `components/admin/StatsChart.tsx` untuk chart statistik
2. Tambahkan chart penjualan harian/mingguan/bulanan
3. Tambahkan chart jumlah produk per kategori
4. Tambahkan chart order status distribution
5. Implement chart library (recharts)
6. Fetch data dari Supabase API

---

### Task E2: Export CSV Feature
- **Status**: TODO
- **Priority**: Medium
- **Estimasi**: 4 jam
- **Dependencies**: Task A4
- **Files**: `app/api/admin/export/route.ts`, `components/admin/ExportButton.tsx` (NEW)

#### Tasks:
1. Buat API endpoint `app/api/admin/export/route.ts` untuk generate CSV
2. Buat `components/admin/ExportButton.tsx` untuk trigger export
3. Implement export untuk:
   - Products (id, name, price, stock, category)
   - Orders (id, customer, total, status, date)
   - Categories (id, name, slug)
4. Download CSV file dengan proper encoding (UTF-8)
5. Show success/error toast

---

### Task E3: Order Management Enhancement
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 6 jam
- **Dependencies**: Task E1
- **Files**: `app/admin/pesanan/page.tsx` (MODIFY)

#### Tasks:
1. Update `app/admin/pesanan/page.tsx` dengan:
   - Filter by status (pending, paid, processed, shipped, delivered, cancelled)
   - Sort by date (newest, oldest)
   - Search by order id or customer name
2. Implement status update functionality
3. Tambahkan tracking number input
4. Show order details modal
5. Export orders to CSV button

---

### Task E4: Product Management Enhancement
- **Status**: TODO
- **Priority**: High
- **Estimasi**: 4 jam
- **Dependencies**: Task A4
- **Files**: `app/admin/produk/page.tsx` (MODIFY)

#### Tasks:
1. Update `app/admin/produk/page.tsx` dengan:
   - Search products
   - Filter by category
   - Sort by price, stock, date added
2. Implement bulk actions (delete multiple products)
3. Tambahkan stock adjustment functionality
4. Feature product toggle
5. Import products from CSV (optional)

---

## Task Dependencies Matrix

```
Sprint A (Stability) ───► Sprint B (Homepage) ───► Sprint C (Shopping)
        │                        │                        │
        ▼                        ▼                        ▼
   Task A4 ───────────────► Task B1 ─────────────► Task C1
        │                        │                        │
        ▼                        ▼                        ▼
   Task A1,A2,A3             Task B3,B4               Task C2
                              Task B5,B6               Task C3
                              Task B7                  Task C4
                                           
Sprint A ──────────────────► Sprint D (Checkout)
        │                           │
        ▼                           ▼
   Task A4                    Task D1
                                   │
                                   ▼
                               Task D2
                                   │
                                   ▼
                               Task D3
                                   │
                                   ▼
                               Task D4
                                           
Sprint A ──────────────────► Sprint E (Admin)
        │                           │
        ▼                           ▼
   Task A4                    Task E1
                                   │
                                   ▼
                               Task E2
                                   │
                                   ▼
                               Task E3
                                   │
                                   ▼
                               Task E4
```

## Priority Summary

### Critical (Must Have for MVP)
1. Task A1: Custom 404 Page
2. Task A2: Global Error Page
3. Task B1: Header Enhancement
4. Task B3: Search Functionality
5. Task B4: Category List
6. Task B6: Product Grid
7. Task C1: Cart Page
8. Task D1: Address Selection
9. Task D2: Shipping Options
10. Task D3: Payment Methods
11. Task D4: Order Review
12. Task E3: Order Management Enhancement
13. Task E4: Product Management Enhancement

### Important (Should Have for MVP)
1. Task A3: Skeleton Loading
2. Task B2: Hero Banner
3. Task B5: Flash Sale Section
4. Task C2: Search Result Page
5. Task E1: Admin Dashboard Chart
6. Task E2: Export CSV Feature

### Nice to Have (Optional for MVP)
1. Task C3: Related Products
2. Task C4: Wishlist Feature

## Testing Requirements

### Unit Testing
- Semua komponen harus memiliki unit test
- Target coverage: > 80%

### Integration Testing
- Test checkout flow end-to-end
- Test admin CRUD operations
- Test search functionality

### E2E Testing
- Test main user journey:
  - Browse products
  - Search products
  - Add to cart
  - Checkout with payment
  - View order history

### Manual Testing Checklist
- [ ] 404 page works
- [ ] Error page works
- [ ] Skeleton loading appears before content
- [ ] Build passes without errors
- [ ] Header sticky saat scroll
- [ ] Search autocomplete works
- [ ] Cart add/update/delete works
- [ ] Checkout flow works
- [ ] Admin CRUD works
- [ ] Export CSV works
- [ ] Mobile responsive (320px, 375px, 414px, 768px, 1024px)
- [ ] Touch targets >= 44px
- [ ] Accessibility labels present

## Success Criteria

### Build & Performance
- [ ] `npm run build` succeeds
- [ ] `npm run lint` no errors
- [ ] `npx tsc --noEmit` no errors
- [ ] Lighthouse performance > 80
- [ ] Lighthouse accessibility > 90

### Functionality
- [ ] Semua Sprint A tasks completed
- [ ] Semua Sprint B tasks completed
- [ ] Semua Sprint C tasks completed (critical features)
- [ ] Semua Sprint D tasks completed
- [ ] Semua Sprint E tasks completed (critical features)

### Quality
- [ ] Mobile responsive di semua breakpoints
- [ ] Touch-friendly dengan 44px minimum tap area
- [ ] Accessibility compliant (ARIA labels, keyboard navigation)
- [ ] No console errors di production
- [ ] Error boundaries implemented

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Ready for Implementation