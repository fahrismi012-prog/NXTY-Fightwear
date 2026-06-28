# Design Document - NXTY Fightwear MVP

## 1. Arsitektur Fitur

### Overview Arsitektur
Project menggunakan Next.js 14 dengan app router, struktur folder sudah ada dan dipertahankan. Arsitektur mengikuti prinsip **Mobile-First** dengan desain brutalist yang sudah ada.

```
┌─────────────────────────────────────────────────────────────┐
│                     NXTY Fightwear MVP                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Homepage    │  │ Shopping     │  │   Checkout       │  │
│  │  (Sprint B)  │  │ Experience   │  │   (Sprint D)     │  │
│  │              │  │ (Sprint C)   │  │                  │  │
│  │ - Header     │  │ - Cart Page  │  │ - Order Review   │  │
│  │ - Hero Banner│  │ - Search     │  │ - Address        │  │
│  │ - Search     │  │ - Sorting    │  │ - Shipping       │  │
│  │ - Categories │  │ - Related    │  │ - Payment        │  │
│  │ - Flash Sale │  │ - Wishlist   │  │                  │  │
│  │ - Product Grid│ │              │  │                  │  │
│  │ - Footer     │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ Admin Panel  │  │ Stability    │                          │
│  │ (Sprint E)   │  │ (Sprint A)   │                          │
│  │              │  │              │                          │
│  │ - Dashboard  │  │ - 404 Page   │                          │
│  │ - Product Mgt│  │ - Error Page │                          │
│  │ - Order Mgt  │  │ - Skeleton   │                          │
│  │ - Export CSV │  │ - Build Test │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Layer Arsitektur
```
┌────────────────────────────────────────────────────────────┐
│                      App Layer (app/)                      │
│  ├── admin/           - Admin panel pages                  │
│  ├── akun/            - Customer account pages             │
│  ├── api/             - API routes                         │
│  │   ├── admin/       - Admin API                          │
│  │   ├── customer/    - Customer API                       │
│  │   ├── midtrans/    - Payment API                        │
│  │   └── shipping/    - Shipping API                       │
│  ├── checkout/        - Checkout flow                      │
│  ├── products/        - Product pages                      │
│  └── ...              - Other pages                        │
├────────────────────────────────────────────────────────────┤
│                   Components Layer (components/)           │
│  ├── admin/           - Admin components                   │
│  ├── AppShell.tsx     - Layout shell                       │
│  ├── Navbar.tsx       - Header                             │
│  ├── HeroSection.tsx  - Hero banner                        │
│  ├── ProductGrid.tsx  - Product list                       │
│  ├── ProductCard.tsx  - Product card                       │
│  └── ...              - Other components                   │
├────────────────────────────────────────────────────────────┤
│                    Context Layer (contexts/)               │
│  ├── CartContext.tsx  - Cart state                         │
│  ├── UIContext.tsx    - UI state (modal, drawer)           │
│  └── ToastContext.tsx - Notification state                 │
├────────────────────────────────────────────────────────────┤
│                   Library Layer (lib/)                     │
│  ├── supabase/        - Database client                    │
│  ├── storefront/      - Storefront logic                   │
│  ├── shipping/        - Shipping integration               │
│  └── utils.ts         - Utility functions                  │
└────────────────────────────────────────────────────────────┘
```

## 2. Struktur Halaman

### Sprint A - Stabilitas Project

| Halaman | Path |Deskripsi |
|---------|------|----------|
| Custom 404 | `app/not-found.tsx` | Halaman 404 custom dengan desain brutalist |
| Global Error | `app/error.tsx` | Halaman error global untuk server/client errors |
| Skeleton Component | `components/Skeleton.tsx` | Komponen skeleton loading reusable |

**File yang dibuat:**
- `app/not-found.tsx` (NEW)
- `app/error.tsx` (NEW)
- `components/Skeleton.tsx` (NEW)

**File yang diubah:**
- `app/layout.tsx` - Tambah ErrorBoundary

---

### Sprint B - Homepage Experience

| Halaman | Path |Deskripsi |
|---------|------|----------|
| Homepage | `app/page.tsx` | Homepage utama (sudah ada, akan diupdate) |
| Category List | `components/CategoryPills.tsx` | Kategori pills horizontal (sudah ada) |
| Banner Carousel | `components/BannerCarousel.tsx` | Slider banner promo (sudah ada) |
| Flash Sale | `components/FlashSaleSection.tsx` | Section flash sale (sudah ada) |

**File yang dibuat:**
- `app/not-found.tsx` (NEW)
- `app/error.tsx` (NEW)
- `components/Skeleton.tsx` (NEW)

**File yang sudah ada (diperbarui jika perlu):**
- `app/page.tsx` - Tambah loading skeleton, improve accessibility
- `components/CategoryPills.tsx` - Tambah skeleton
- `components/BannerCarousel.tsx` - Tambah skeleton
- `components/FlashSaleSection.tsx` - Tambah skeleton

---

### Sprint C - Shopping Experience

| Halaman | Path |Deskripsi |
|---------|------|----------|
| Cart Page | `app/cart/page.tsx` | Halaman keranjang (NEW) |
| Search Result | `app/products/search/page.tsx` | Halaman hasil pencarian (NEW) |
| Product Detail | `app/products/[slug]/page.tsx` | Halaman detail produk (sudah ada) |

**File yang dibuat:**
- `app/cart/page.tsx` (NEW) - Cart page dengan review & checkout
- `app/products/search/page.tsx` (NEW) - Search result dengan filter & sorting

**File yang sudah ada (diperbarui):**
- `app/products/[slug]/page.tsx` - Tambah related product section
- `components/Navbar.tsx` - Tambah wishlist functionality
- `components/ProductCard.tsx` - Tambah wishlist button

---

### Sprint D - Checkout

| Halaman | Path |Deskripsi |
|---------|------|----------|
| Checkout | `app/checkout/page.tsx` | Checkout page (sudah ada, akan diupdate) |
| Order Success | `app/payment/success/page.tsx` | Success page (sudah ada) |
| Order Failed | `app/payment/failed/page.tsx` | Failed page (sudah ada) |
| Order Pending | `app/payment/pending/page.tsx` | Pending page (sudah ada) |

**File yang dibuat:**
- `app/wishlist/page.tsx` (NEW) - Wishlist page
- `app/wishlist/add/[id]/route.ts` (NEW) - Wishlist API
- `components/WishlistButton.tsx` (NEW) - Wishlist toggle button

**File yang sudah ada (diperbarui):**
- `app/checkout/page.tsx` - Tambah address selection, shipping options, payment methods
- `app/api/checkout/address/route.ts` (NEW) - Address management API
- `app/api/checkout/shipping/route.ts` (NEW) - Shipping rates API
- `app/api/checkout/payment/route.ts` (NEW) - Payment verification API

---

### Sprint E - Admin Panel

| Halaman | Path |Deskripsi |
|---------|------|----------|
| Admin Dashboard | `app/admin/page.tsx` - Dashboard dengan stats (sudah ada) |
| Product Management | `app/admin/produk/page.tsx` - Product list (sudah ada) |
| Order Management | `app/admin/pesanan/page.tsx` - Order list (sudah ada) |
| Category Management | `app/admin/kategori/page.tsx` - Category list (sudah ada) |
| Promo Management | `app/admin/promo/page.tsx` - Promo list (sudah ada) |
| Export CSV | `app/api/admin/export/route.ts` - Export API (NEW) |

**File yang dibuat:**
- `app/api/admin/export/route.ts` (NEW) - Export data to CSV
- `app/admin/dashboard/statistics/route.ts` (NEW) - Dashboard stats API

**File yang sudah ada (diperbarui):**
- `app/admin/page.tsx` - Tambah chart statistik penjualan
- `app/admin/produk/page.tsx` - Tambah bulk actions
- `app/admin/pesanan/page.tsx` - Tambah status update & tracking
- `components/admin/ExportButton.tsx` (NEW) - Export button component

---

## 3. Komponen yang Dibutuhkan

### Komponen yang Sudah Ada (Reusing)
```
components/
├── AppShell.tsx              - Layout shell (sudah ada)
├── Navbar.tsx                - Header dengan search, cart, user (sudah ada)
├── Footer.tsx                - Footer (sudah ada di page.tsx)
├── HeroSection.tsx           - Hero banner (sudah ada)
├── BannerCarousel.tsx        - Banner slider (sudah ada)
├── CategoryPills.tsx         - Kategori pills (sudah ada)
├── ProductGrid.tsx           - Product grid (sudah ada)
├── ProductCard.tsx           - Product card (sudah ada)
├── FlashSaleSection.tsx      - Flash sale (sudah ada)
├── CountdownTimer.tsx        - Countdown timer (sudah ada)
├── CartDrawer.tsx            - Cart drawer (sudah ada)
├── ScrollToTop.tsx           - Scroll to top (sudah ada)
└── admin/                    - Admin components (sudah ada)
    ├── Sidebar.tsx
    ├── BottomNav.tsx
    ├── ImageUploader.tsx
    ├── OrderDetailModal.tsx
    ├── StatusBadge.tsx
    └── TrackingTimeline.tsx
```

### Komponen Baru yang Dibuat
```
components/
├── Skeleton.tsx              - Skeleton loading (NEW)
├── WishlistButton.tsx        - Wishlist toggle (NEW)
├── WishlistDrawer.tsx        - Wishlist drawer (NEW)
├── AddressSelector.tsx       - Address selection (NEW)
├── ShippingOptions.tsx       - Shipping options (NEW)
├── PaymentMethods.tsx        - Payment methods (NEW)
├── SearchFilter.tsx          - Search filter (NEW)
├── SortOptions.tsx           - Sort options (NEW)
├── RelatedProducts.tsx       - Related products (NEW)
└── admin/
    ├── ExportButton.tsx      - Export CSV button (NEW)
    └── StatsChart.tsx        - Dashboard chart (NEW)
```

### Komponen yang Diperbarui
```
components/
├── Navbar.tsx                - Tambah wishlist functionality
├── ProductCard.tsx           - Tambah wishlist button
├── CartDrawer.tsx            - Tambah address & shipping
└── ProductGrid.tsx           - Tambah loading skeleton
```

## 4. Data Flow

### Data Flow - Homepage
```
User Request → Next.js Server → GET / → Layout.tsx → page.tsx
    ↓
Load products.json / Supabase
    ↓
Filter by category (optional)
    ↓
Render:
  - Header (Navbar)
  - Hero Banner
  - Category Pills
  - Flash Sale Section
  - Product Grid
  - Footer
```

### Data Flow - Search
```
User Input → Navbar.onSearch(query)
    ↓
Navigate to /products/search?q={query}
    ↓
Search Result Page
    ↓
Load products dari Supabase dengan filter
    ↓
Apply filters (category, price, rating)
    ↓
Apply sort (price, rating, newness)
    ↓
Render filtered products
```

### Data Flow - Cart
```
User Action → Add to Cart
    ↓
CartContext.addToCart(item)
    ↓
Update localStorage
    ↓
Show toast notification
    ↓
Update cart drawer badge
```

### Data Flow - Checkout
```
User Click Checkout
    ↓
Navigate to /checkout
    ↓
Load cart items dari CartContext
    ↓
Load shipping addresses dari Supabase
    ↓
Select shipping method
    ↓
Select payment method
    ↓
Create Midtrans transaction
    ↓
Redirect to Midtrans payment page
    ↓
Return to success/pending/failed page
```

### Data Flow - Admin
```
Admin Request → /admin
    ↓
Server-side authentication check
    ↓
Load admin stats dari Supabase
    ↓
Render dashboard dengan stats
    ↓
User clicks menu item
    ↓
Navigate to admin subpage
    ↓
Load data dari Supabase
    ↓
Render data list dengan CRUD actions
```

## 5. State Management

### State Management Strategy
Project menggunakan **Client Context API** untuk state management yang simple dan lightweight. Tidak menggunakan Redux, Zustand, atau state management library lainnya.

### Context yang Ada
```
contexts/
├── CartContext.tsx    - Cart state (items, total, actions)
├── UIContext.tsx      - UI state (cartOpen, filterOpen, searchOpen)
└── ToastContext.tsx   - Toast notifications
```

### Context yang Ditambahkan
```
contexts/
├── WishlistContext.tsx    - Wishlist state (NEW)
├── AddressContext.tsx     - Address state (NEW)
└── ShippingContext.tsx    - Shipping state (NEW)
```

### State Structure

#### Cart State
```typescript
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
```

#### UI State
```typescript
interface UIState {
  cartOpen: boolean;
  filterOpen: boolean;
  searchOpen: boolean;
  wishlistOpen: boolean;
  addressSheetOpen: boolean;
}
```

#### Wishlist State
```typescript
interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}
```

#### Address State
```typescript
interface AddressState {
  addresses: CustomerAddress[];
  defaultAddress: CustomerAddress | null;
  isLoading: boolean;
}
```

#### Shipping State
```typescript
interface ShippingState {
  selectedAddress: CustomerAddress | null;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  isLoading: boolean;
}
```

## 6. File/Folder yang Dibuat atau Diubah

### File Baru (Sprint A - Stabilitas)
```
app/
├── not-found.tsx              (NEW) - Custom 404 page
└── error.tsx                  (NEW) - Global error page

components/
├── Skeleton.tsx               (NEW) - Skeleton loading component
└── SkeletonCard.tsx           (NEW) - Skeleton product card
```

### File Baru (Sprint B - Homepage)
```
components/
└── SkeletonBanner.tsx         (NEW) - Skeleton banner
```

### File Baru (Sprint C - Shopping)
```
app/
├── cart/page.tsx              (NEW) - Cart page
└── products/search/page.tsx   (NEW) - Search result page

components/
├── WishlistButton.tsx         (NEW) - Wishlist toggle
├── WishlistDrawer.tsx         (NEW) - Wishlist drawer
├── SearchFilter.tsx           (NEW) - Search filter
└── SortOptions.tsx            (NEW) - Sort options
```

### File Baru (Sprint D - Checkout)
```
app/
├── wishlist/page.tsx          (NEW) - Wishlist page
└── api/
    ├── checkout/address/route.ts    (NEW) - Address API
    ├── checkout/shipping/route.ts   (NEW) - Shipping API
    └── checkout/payment/route.ts    (NEW) - Payment API

components/
├── AddressSelector.tsx        (NEW) - Address selector
├── ShippingOptions.tsx        (NEW) - Shipping options
└── PaymentMethods.tsx         (NEW) - Payment methods
```

### File Baru (Sprint E - Admin)
```
app/api/admin/
└── export/route.ts            (NEW) - Export to CSV

components/admin/
├── ExportButton.tsx           (NEW) - Export button
└── StatsChart.tsx             (NEW) - Dashboard chart
```

### File yang Diubah
```
app/
├── layout.tsx                 (MODIFY) - Add ErrorBoundary wrapper
├── page.tsx                   (MODIFY) - Add skeleton loading
└── products/[slug]/page.tsx   (MODIFY) - Add related products

components/
├── Navbar.tsx                 (MODIFY) - Add wishlist
├── ProductCard.tsx            (MODIFY) - Add wishlist button
├── CartDrawer.tsx             (MODIFY) - Add shipping options
└── ProductGrid.tsx            (MODIFY) - Add skeleton

contexts/
├── WishlistContext.tsx        (NEW) - Wishlist context
├── AddressContext.tsx         (NEW) - Address context
└── ShippingContext.tsx        (NEW) - Shipping context

app/api/
├── customer/wishlist/route.ts    (NEW) - Wishlist API
└── customer/address/route.ts     (NEW) - Address API
```

## 7. Risiko Teknis

### Risiko dan Solusi

| No | Risiko | Impact | Mitigasi |
|----|--------|--------|----------|
| 1 | **Database Migration** - Perubahan schema Supabase | HIGH | Gunakan Supabase migrations, test di staging dulu |
| 2 | **API Rate Limiting** - Supabase/Shipping API | MEDIUM | Implement caching, queue system |
| 3 | **Payment Integration** - Midtrans sandbox to prod | HIGH | Test thoroughly, use test cards |
| 4 | **Performance** - Large product catalog | MEDIUM | Implement lazy loading, pagination, infinite scroll |
| 5 | **Concurrency** - Multiple users same product | HIGH | Optimistic updates, lock mechanism |
| 6 | **Error Handling** - Network failures | MEDIUM | Retry logic, fallback to localStorage |
| 7 | **Type Safety** - Runtime type errors | MEDIUM | Strict TypeScript, runtime validation |
| 8 | **SEO** - Dynamic content | LOW | Implement SSR, meta tags, structured data |
| 9 | **Accessibility** - WCAG compliance | MEDIUM | ARIA labels, keyboard navigation, contrast |
| 10 | **Build Fail** - Dependency conflicts | HIGH | Lock versions, test CI/CD pipeline |

### Dependencies yang Ditambahkan
```
package.json
{
  // NEW dependencies:
  "react-slick": "^0.30.2",    // For banner carousel
  "slick-carousel": "^1.8.1",  // For banner carousel styles
  "recharts": "^2.12.0"        // For dashboard charts
}
```

### Environment Variables yang Ditambahkan
```
# Checkout & Payment
NEXT_PUBLIC_SHIPPING_API_URL=...
NEXT_PUBLIC_SHIPPING_API_KEY=...

# Wishlist (optional - jika login required)
NEXT_PUBLIC_ENABLE_WISHLIST=true

# Dashboard
NEXT_PUBLIC_ENABLE_CHARTS=true
```

## 8. Batasan Scope MVP

### Yang Dikerjakan (In Scope)
✅ Sprint A - Stabilitas Project
  - Custom 404 page
  - Global error page
  - Skeleton loading untuk semua halaman
  - Build process verification

✅ Sprint B - Homepage Experience
  - Header dengan search, cart, user menu
  - Hero banner dengan carousel
  - Search functionality
  - Category list
  - Flash sale section
  - Product grid
  - Footer

✅ Sprint C - Shopping Experience
  - Cart page
  - Search result dengan filtering & sorting
  - Related products
  - Wishlist (opsional)
  - Product detail page (udah ada, diupdate)

✅ Sprint D - Checkout
  - Order review
  - Address selection/add
  - Shipping options
  - Payment methods (Midtrans)

✅ Sprint E - Admin
  - Order management
  - Product management
  - Dashboard dengan stats
  - Export CSV

### Yang Tidak Dikerjakan (Out of Scope)
❌ User review/rating system
❌ User notification system
❌ Coupon code system (kecuali basic voucher)
❌ Multi-currency support
❌ Multi-language support
❌ Social login (Google, Facebook)
❌ Product Q&A
❌ User addresses book (bisa 1-2 address saja)
❌ Advanced analytics
❌ A/B testing

### Constraints
- **Mobile First**: Semua UI harus responsive untuk mobile (320px+)
- **Touch Friendly**: Semua button minimal 44px tap area
- **Performance**: Page load < 3 detik, API response < 500ms
- **No Breaking Changes**: Tidak mengubah struktur project yang ada
- **No New Libraries**: Hanya tambah library jika benar-benar diperlukan
- **Type Safe**: Semua code menggunakan TypeScript
- **Accessibility**: Minimum WCAG 2.1 AA compliance

### Success Criteria
- [ ] Semua fitur Sprint A-B-C-D-E selesai
- [ ] Build pass tanpa error
- [ ] Type check pass tanpa error
- [ ] Mobile responsive (320px - 1920px)
- [ ] Performance score > 80 di Lighthouse
- [ ] Accessibility score > 90 di Lighthouse
- [ ] Semua API endpoints tested
- [ ] Admin panel bisa CRUD produk, order, promo
- [ ] Checkout flow complete (test dengan Midtrans sandbox)

### Post-MVP Roadmap (Future)
- User review/rating system
- Push notification
- Loyalty program
- Referral system
- Multi-warehouse support
- Dropshipping integration
- Supplier portal

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Draft - Siap untuk Review