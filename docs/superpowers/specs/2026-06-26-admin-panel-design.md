# Admin Panel, Customer & Shipping — Design Spec

**Tanggal:** 2026-06-26 (last updated)
**Project:** NXTY Fightwear Store (`/home/administrator/projects/nxty-fightwear`)
**Status:** Spec approved (Sections 1-3 admin + customer & shipping extensions)

---

## Tujuan

Membangun halaman admin di `/admin/*` dengan kemampuan:
- Login admin sederhana (single password env var)
- CRUD Kategori
- CRUD Produk (termasuk **multiple images** per produk)
- CRUD Promo (banner, flash sale, voucher, bundle, add_on)
- Read-only daftar Pesanan
- Integrasi Everpro Shipping API (cek ongkir, generate AWB, tracking)
- Manajemen customer (login, alamat tersimpan)

**Storefront customer features:**
- Customer login dengan email + OTP (Supabase Auth)
- Customer punya akun dengan multiple alamat tersimpan
- Order tracking: guest via Order ID + email, atau login untuk history lengkap
- Live tracking dari Everpro API (timeline lengkap)
- Ongkir otomatis dari API Everpro saat checkout

## Non-Tujuan

- Multi-user admin dengan role/hak akses berbeda
- Email notification ke customer (selain OTP)
- Payment processing (sudah ada)
- Refund/return management
- Advanced analytics dashboard

---

## Stack & Integrasi

- **Database**: Supabase Postgres
- **File storage**: Supabase Storage (bucket `product-images`)
- **Admin auth**: Single password env var + JWT cookie
- **Customer auth**: Supabase Auth (email OTP/magic link)
- **Shipping**: Everpro Shipping API (https://developer.everpro.id/)

---

## Bagian A — Admin Panel

### Struktur Folder Admin

```
app/
├── admin/
│   ├── login/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                          ← Dashboard
│   ├── categories/{page,new/page,[id]/page}.tsx
│   ├── products/{page,new/page,[id]/page}.tsx
│   ├── promotions/{page,new/page,[id]/page}.tsx
│   └── orders/page.tsx                   ← Read-only
├── api/admin/
│   ├── auth/{login,logout}/route.ts
│   ├── categories/{route,[id]/route}.ts
│   ├── products/{route,[id]/route}.ts
│   ├── promotions/{route,[id]/route}.ts
│   ├── upload/route.ts                   ← File to Supabase Storage
│   ├── orders/route.ts
│   └── shipping/
│       ├── rates/route.ts                ← Cek ongkir (proxy to Everpro)
│       ├── generate-awb/route.ts         ← Buat resi
│       └── track/route.ts                ← Tracking
├── middleware.ts                         ← Protect /admin/*
lib/
├── supabase/{client,server,auth}.ts
├── admin/helpers.ts
└── shipping/everpro.ts                   ← Everpro API client
```

### Database Schema (Bagian Admin)

```sql
-- ===== Categories =====
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- ===== Products =====
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  price integer NOT NULL,
  original_price integer,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  rating numeric(2,1) DEFAULT 4.5,
  reviews_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  in_stock boolean DEFAULT true,
  weight_grams integer DEFAULT 500,       -- untuk hitung ongkir
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);

-- ===== Product Images =====
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id, sort_order);

-- ===== Promotions =====
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('banner','flash_sale','voucher','bundle','add_on')),
  title text NOT NULL,
  subtitle text,
  description text,
  image text,
  badge text,
  discount_type text CHECK (discount_type IN ('percentage','fixed')),
  discount_value numeric,
  min_purchase integer,
  flash_price integer,
  flash_stock integer,
  product_ids uuid[] DEFAULT '{}',
  end_time timestamptz,
  cta_label text,
  cta_href text,
  priority integer DEFAULT 99,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===== Orders =====
CREATE TABLE orders (
  id text PRIMARY KEY,                     -- "NXTY-{ts}-{rand}"
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,                   -- JSON: {street, city, province, postal_code}
  notes text,
  subtotal integer,
  shipping_cost integer,
  total integer,
  status text CHECK (status IN ('pending','paid','processed','shipped','delivered','cancelled')),
  items jsonb,                            -- [{productId, name, price, qty, size, color}]
  shipping jsonb,                         -- {courier, service, waybill, etd, weight}
  payment_id text,                        -- Midtrans transaction ID
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

### Admin UI Pages

#### Login (`/admin/login`)
- Single password input
- POST `/api/admin/auth/login`
- Set HttpOnly JWT cookie `admin_session` (7 hari)
- Redirect ke `/admin`

#### Dashboard (`/admin`)
- Statistik: total produk, kategori, promo aktif, pesanan hari ini
- Pesanan terbaru (5 terakhir)
- Quick links

#### CRUD Kategori
- List table + form create/edit
- Field: nama, slug (auto), deskripsi
- Hapus: block kalau ada produk terkait (FK constraint)

#### CRUD Produk
- List table dengan filter kategori, search, pagination
- Form: nama, slug, kategori, deskripsi, harga, harga coret, **berat (gram)**, ukuran, warna, rating, featured, in_stock
- **Multiple Images**: drag-drop upload ke Supabase Storage, sortable

#### CRUD Promo
- List table dengan filter tipe
- Form dengan field kondisional per tipe (banner/flash_sale/voucher/bundle/add_on)

#### Orders List (read-only)
- Tabel: Order ID | Tanggal | Customer | Total | Status | Aksi
- Filter by status, search
- Klik row → modal detail (items, alamat, shipping info)
- Tombol "Buat Resi" untuk order yang sudah paid/processed (panggil Everpro)

---

## Bagian B — Customer Authentication (Storefront)

### Pendekatan: Supabase Auth

Gunakan Supabase Auth built-in untuk customer login:
- Customer input email → dapat magic link ATAU 6-digit OTP via email
- Klik link / input OTP → terverifikasi otomatis
- Session via Supabase JWT cookie
- Gratis sampai 50rb email/bulan

### Customer UI

#### Login/Register (`/masuk`)
- Single input: email
- Tombol "Kirim Link Login" atau "Kirim OTP"
- Supabase kirim magic link ke email
- Halaman konfirmasi: "Cek email Anda, klik link untuk masuk"
- Mode toggle: "Login dengan Link" / "Login dengan OTP"

#### Customer Header (saat login)
- Avatar/initial di header storefront
- Dropdown: "Akun Saya", "Pesanan Saya", "Alamat", "Logout"

#### Halaman Customer
- `/akun` — Profil (nama, email, phone)
- `/akun/alamat` — List & manage multiple alamat
- `/akun/pesanan` — History order dengan filter status
- `/akun/alamat/baru` — Tambah alamat baru
- `/akun/alamat/[id]` — Edit alamat

### Customer Database

Pakai Supabase Auth built-in:
- `auth.users` (id, email, created_at, dll)
- Custom table `customer_profiles` untuk data tambahan (nama, phone)
- Custom table `customer_addresses` untuk multiple alamat

```sql
-- Customer Profile (1-to-1 dengan auth.users)
CREATE TABLE customer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  default_address_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer Addresses (1-to-many)
CREATE TABLE customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,                    -- "Rumah", "Kantor", dll
  recipient_name text NOT NULL,
  phone text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  province text NOT NULL,
  postal_code text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);
```

### Checkout Integration
- Saat checkout: jika customer login, tampilkan dropdown pilih alamat dari `customer_addresses`
- Bisa tambah alamat baru inline (modal)
- Address baru langsung disimpan ke `customer_addresses`

---

## Bagian C — Order Tracking

### Guest Tracking (`/lacak`)
- Input form: Order ID + email
- POST `/api/track/order` (lookup di tabel orders)
- Tampilkan: status order, items, alamat, **tracking info dari Everpro** (jika ada waybill)

### Auth Customer Tracking (`/akun/pesanan` atau `/akun/pesanan/[id]`)
- Customer login langsung lihat history order
- Klik order → detail + tracking

### Tracking Display
- **Status internal**: badge warna (pending/paid/processed/shipped/delivered)
- **Live tracking dari Everpro**: timeline event (mis. "Paket diterima kurir", "Dalam perjalanan ke Jakarta", "Tiba di hub Bandung", "Sedang diantar", "Diterima oleh Budi")
- Link fallback ke website kurir resmi

### API Routes
- `GET /api/track/order?id=XXX&email=YYY` — guest tracking lookup
- `GET /api/admin/shipping/track?waybill=XXX&courier=jne` — proxy ke Everpro (admin only)
- `GET /api/shipping/track?order_id=XXX` — public tracking (cuma return data, bukan admin-only)

---

## Bagian D — Everpro Shipping Integration

### Environment Variables (tambahan)
```
EVERPRO_API_KEY=<from Everpro dashboard>
EVERPRO_BASE_URL=https://api.everpro.id
```

### Library: `lib/shipping/everpro.ts`

Wrapper untuk Everpro API:
```typescript
// Cek ongkir
getRates(origin: string, destination: string, weight: number, courier?: string)
// → [{courier, service, cost, etd}]

// Generate AWB (resi)
createShipment(orderId: string, details: ShipmentDetails)
// → {waybill, courier, service, etd}

// Tracking
trackShipment(waybill: string, courier: string)
// → {status, events: [{date, description, location}]}
```

### Checkout: Cek Ongkir Otomatis
1. Customer pilih/kota asal = default (alamat toko: Lembang, Bandung Barat)
2. Customer input kota tujuan + berat (computed dari cart)
3. Frontend hit `POST /api/shipping/rates` (proxy ke Everpro)
4. Tampilkan list ongkir: JNE REG (Rp15.000, 2-3 hari), JNE YES (Rp25.000, 1 hari), dll
5. Customer pilih salah satu → ongkir masuk ke total

### Admin: Generate Resi
1. Order status = "paid" atau "processed"
2. Admin klik "Buat Resi" → pilih kurir (default dari pilihan customer di checkout) + layanan
3. Sistem panggil Everpro `createShipment`
4. Simpan waybill ke `orders.shipping.waybill` + update status jadi "shipped"

### Tracking: Live dari Everpro
1. Customer/admin klik "Lacak" di order detail
2. Sistem panggil `trackShipment(waybill, courier)`
3. Cache hasil 5 menit (Next.js unstable_cache)
4. Tampilkan timeline events

### Cache Strategy
- Rates: cache 1 jam (ongkir bisa berubah, tapi jarang)
- Tracking: cache 5 menit (refresh lebih sering)

---

## Storefront Integration (Hybrid ISR)

Storefront baca dari Supabase via server component dengan revalidate:

```typescript
// lib/storefront/products.ts
export async function getProducts() {
  const supabase = createServerClient();
  const { data } = await supabase.from("products").select(`
    *, category:categories(*), images:product_images(*)
  `).eq("in_stock", true);
  return data ?? [];
}
```

Di setiap page yang butuh data:
```typescript
export const revalidate = 300; // 5 menit
```

### File yang Berubah (Storefront)
- `app/page.tsx` — pakai helper getProducts
- `app/products/[slug]/page.tsx` — sama
- `app/promo/page.tsx` — sama
- `components/FlashSaleSection.tsx` — sama
- `components/VoucherCard.tsx` — sama
- `components/Navbar.tsx` — tampilkan user menu saat login
- `app/checkout/page.tsx` — tambah customer info (jika login) + ongkir dari Everpro
- `app/lacak/page.tsx` (baru) — guest tracking
- `app/masuk/page.tsx` (baru) — login
- `app/akun/page.tsx` (baru) — profil customer
- `app/akun/pesanan/page.tsx` (baru) — history
- `app/akun/alamat/page.tsx` (baru) — manage addresses

---

## Setup Steps (User Action Required)

### 1. Supabase
- Project sudah aktif
- Copy env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Enable Email Auth (Settings → Authentication → Providers → Email)
- Set Site URL ke production domain (untuk magic link)

### 2. Supabase Storage
- Buat bucket `product-images` (public)

### 3. Everpro
- Daftar di everpro.id
- Akses Developer Dashboard → https://developer.everpro.id/
- Buat API key (sandbox dulu untuk testing)
- Copy `EVERPRO_API_KEY`

### 4. Environment Variables Final
```
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Admin Auth
ADMIN_PASSWORD=<password-pilihan>
ADMIN_JWT_SECRET=<random-string-32+-char>

# Everpro Shipping
EVERPRO_API_KEY=<from-everpro-dashboard>
EVERPRO_BASE_URL=https://api.everpro.id
```

### 5. Database Migration
- Run `scripts/migrate-data.ts` (idempotent) untuk import JSON existing
- Tables baru (orders, customer_*, shipping) akan dibuat otomatis via SQL di Phase 1

---

## Migration Plan

`scripts/migrate-data.ts`:
1. Extract unique categories dari products.json → upsert ke `categories`
2. Insert products + images ke Supabase
3. Insert promotions
4. Build `categoryIdMap` dan `productIdMap` untuk reference

---

## Acceptance Criteria

### Admin Panel
- ✅ Setup Supabase + env vars
- ✅ Migration sukses (35 produk, 13 kategori, 8 promo)
- ✅ Login admin berfungsi
- ✅ CRUD Kategori bekerja
- ✅ CRUD Produk + multiple images upload bekerja
- ✅ CRUD Promo bekerja dengan field kondisional
- ✅ Orders list read-only bekerja
- ✅ Generate AWB via Everpro (admin)
- ✅ Middleware protect `/admin/*`

### Customer & Shipping
- ✅ Customer login dengan email OTP/magic link
- ✅ Customer bisa save multiple addresses
- ✅ Checkout auto-compute ongkir dari Everpro
- ✅ Customer bisa lihat history order
- ✅ Guest tracking dengan Order ID + email
- ✅ Live tracking timeline dari Everpro

### General
- ✅ Storefront masih berfungsi seperti sedia kala
- ✅ Perubahan admin terlihat di storefront max 5 menit
- ✅ Build & TypeScript clean
- ✅ Style brutalist NXTY konsisten

---

## Fase Implementasi (high-level)

1. **Setup & Migration** — Supabase client, schema migration script, import data
2. **Auth Admin & Middleware** — Login admin, JWT cookie, middleware
3. **Admin Layout & Dashboard** — Sidebar/mobile nav, top bar, dashboard stats
4. **CRUD Kategori**
5. **CRUD Produk + Images**
6. **CRUD Promo**
7. **Orders + Everpro Integration (admin side)** — List orders, generate AWB
8. **Customer Auth (Storefront)** — Login page, Supabase Auth, session
9. **Customer Profile & Addresses** — Manage akun, multiple alamat
10. **Checkout Ongkir** — Integrate Everpro rates di checkout
11. **Order Tracking (Guest + Auth)** — /lacak page + /akun/pesanan
12. **Live Tracking UI** — Timeline dari Everpro
13. **Storefront Migration** — Update fetch dari JSON ke Supabase (ISR)
14. **Final Verification** — Build, smoke test, end-to-end

---

## Out of Scope (Future)

- Multi-user admin dengan role
- Email marketing
- Print invoice / PDF
- Advanced analytics
- Refund/return management
- Bulk import/export CSV
- Image cropping tools
- Inventory tracking per variant
- Customer support chat
- Review & rating produk
- Wishlist
