# Admin Panel — Design Spec

**Tanggal:** 2026-06-26
**Project:** NXTY Fightwear Store (`/home/administrator/projects/nxty-fightwear`)
**Status:** Spec approved (Sections 1-3)

---

## Tujuan

Membangun halaman admin di `/admin/*` dengan kemampuan:
- Login sederhana (single password env var)
- CRUD Kategori
- CRUD Produk (termasuk **multiple images** per produk)
- CRUD Promo (banner, flash sale, voucher, bundle, add_on)
- Read-only daftar Pesanan
- Sinkron dengan toko online (storefront) — perubahan admin terlihat dalam max 5 menit

## Non-Tujuan

- Multi-user dengan role/hak akses berbeda
- Email notification ke customer
- Payment processing (sudah ada di payment flow existing)
- Refund/return management
- Analytics dashboard yang kompleks (cukup statistik dasar)

## Constraints & Asumsi

- **Single password auth**: 1 owner/operator toko, tidak butuh multi-user
- **Supabase Postgres** sebagai database
- **Supabase Storage** untuk file gambar produk
- **Tidak merubah total struktur existing**: storefront tetap berfungsi, JSON data existing diimpor sebagai initial data
- Storefront menggunakan **Next.js ISR dengan revalidate 300 detik (5 menit)** untuk sinkronisasi dengan Supabase
- File gambar existing di Unsplash (URL eksternal) tetap dipakai; upload baru ke Supabase Storage

---

## Arsitektur

### Struktur Folder

```
app/
├── admin/                              ← Admin panel (protected)
│   ├── login/page.tsx
│   ├── layout.tsx                      ← Sidebar + top bar
│   ├── page.tsx                        ← Dashboard
│   ├── categories/
│   │   ├── page.tsx                    ← List
│   │   ├── new/page.tsx                ← Create
│   │   └── [id]/page.tsx               ← Edit + delete
│   ├── products/
│   │   ├── page.tsx                    ← List (filter, search)
│   │   ├── new/page.tsx                ← Create + image upload
│   │   └── [id]/page.tsx               ← Edit
│   ├── promotions/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   └── orders/
│       └── page.tsx                    ← Read-only
├── api/admin/
│   ├── auth/
│   │   ├── login/route.ts              ← POST password, set cookie
│   │   └── logout/route.ts             ← POST clear cookie
│   ├── categories/route.ts             ← GET (list), POST (create)
│   ├── categories/[id]/route.ts        ← GET, PUT, DELETE
│   ├── products/route.ts
│   ├── products/[id]/route.ts
│   ├── promotions/route.ts
│   ├── promotions/[id]/route.ts
│   ├── upload/route.ts                 ← POST file to Supabase Storage
│   └── orders/route.ts                 ← GET only
├── middleware.ts                       ← Protect /admin/* (except /admin/login)
lib/
├── supabase/
│   ├── client.ts                       ← Browser client (anon key)
│   ├── server.ts                       ← Server-side admin client (service role)
│   └── auth.ts                         ← Session helpers (sign/verify JWT)
├── admin/
│   └── helpers.ts                      ← Formatters, validators
└── types/database.ts                   ← TypeScript types untuk DB
scripts/
└── migrate-data.ts                     ← Import JSON ke Supabase (run once)
```

### Database Schema (Supabase Postgres)

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);

-- ===== Product Images (multiple per product) =====
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

-- ===== Orders (read-only di admin) =====
CREATE TABLE orders (
  id text PRIMARY KEY,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  customer_city text,
  notes text,
  total integer,
  status text CHECK (status IN ('pending','success','failed')),
  items jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ===== Storage Bucket =====
-- product-images: public bucket untuk foto produk
```

---

## Auth Flow

### Environment Variables
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...   # Untuk admin operations, JANGAN expose ke client
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
ADMIN_PASSWORD=<password-pilihan>
ADMIN_JWT_SECRET=<random-string-32+-char>
```

### Login
- User ke `/admin/login`
- Input password → POST `/api/admin/auth/login`
- Server compare dengan `ADMIN_PASSWORD` env var
- Jika cocok: sign JWT `{role: "admin", exp: now + 7d}` dengan `ADMIN_JWT_SECRET`
- Set HttpOnly cookie `admin_session` + `SameSite=Strict`
- Redirect ke `/admin`

### Middleware (`middleware.ts`)
- Cek semua `/admin/*` KECUALI `/admin/login`
- Verify JWT signature & expiration
- Jika invalid: redirect ke `/admin/login`
- Set header `Cache-Control: no-store` agar tidak di-cache browser/CDN

### Logout
- POST `/api/admin/auth/logout`
- Clear cookie `admin_session`

---

## Admin UI Pages

### Layout (`app/admin/layout.tsx`)
- **Sidebar (desktop ≥md)**: tetap, 240px width, dengan logo NXTY + nav links
- **Bottom tab (mobile <md)**: 5 tab (Dashboard, Kategori, Produk, Promo, Logout)
- **Top bar**: search box (kontekstual per halaman), tombol "+ Tambah" (primary action per resource)
- Style: brutalist NXTY (hitam, merah, hard borders), tapi layout lebih dense & table-based untuk produktivitas

### Dashboard (`/admin`)
- Statistik cards: Total Produk, Total Kategori, Promo Aktif, Pesanan Hari Ini
- Quick links ke halaman lain
- Pesanan terbaru (5 terakhir)

### Kategori

**List (`/admin/categories`):**
- Tabel: # | Nama | Slug | Jumlah Produk | Aksi
- Search bar
- Tombol "+ Tambah Kategori"

**Form Create/Edit:**
- Inputs: Nama, Slug (auto-generate dari nama, editable), Deskripsi
- Tombol: Simpan, Batal, Hapus (edit only)

### Produk

**List (`/admin/products`):**
- Tabel: # | Gambar (thumbnail 40×40) | Nama | Kategori | Harga | Stok | Featured | Aksi
- Filter: by kategori, featured, in stock
- Search: by nama/deskripsi
- Pagination 20/halaman

**Form Create/Edit:**
- Inputs teks: Nama, Slug (auto-generate), Deskripsi (textarea)
- Dropdown: Kategori (dari `categories`)
- Number: Harga, Harga Coret (optional)
- Multi-input: Ukuran (tambah list), Warna (tambah list)
- Number: Rating (0-5), Reviews Count
- Toggle: Featured, In Stock
- **Multiple Images**:
  - Drag & drop area + file picker
  - Upload ke Supabase Storage `product-images/{uuid}.{ext}`
  - Sortable list (drag to reorder, sort_order)
  - Image pertama = primary (tampil di product card)
  - Tombol hapus per image
  - Loading state saat upload
- Tombol: Simpan, Batal, Hapus Produk (edit only)

### Promo

**List (`/admin/promotions`):**
- Tabel: # | Tipe | Judul | Diskon | Prioritas | Status | Aksi
- Filter: by tipe
- Tombol "+ Tambah Promo"

**Form Create/Edit (type-specific fields):**
- Dropdown: Tipe (banner / flash_sale / voucher / bundle / add_on)
- Common fields: Judul, Subtitle, Deskripsi, Badge, CTA Label, CTA Href, Prioritas, End Time
- **Kondisional fields per tipe**:
  - `banner`: Image upload
  - `flash_sale`: Flash Price, Flash Stock, Product IDs (multi-select dari products)
  - `voucher`: Discount Type (percentage/fixed), Discount Value, Min Purchase
  - `bundle` / `add_on`: (tidak ada field khusus)

### Pesanan

**List (`/admin/orders`):**
- Read-only tabel: Order ID | Tanggal | Customer | Total | Status | Aksi
- Filter: by status (pending/success/failed)
- Search: by customer name/email/order ID
- Klik row → modal detail (items JSON, alamat, status)

---

## Storefront Integration

### Strategy: Hybrid Server Fetch + ISR

**Sebelum (sekarang):**
- Storefront import langsung dari `data/products.json`
- Tidak ada revalidasi otomatis

**Sesudah:**
- Storefront fetch dari Supabase via Supabase server client
- Pakai Next.js ISR dengan `export const revalidate = 300` (5 menit)
- Atau fetch di Server Component dengan `cache: 'no-store'` + tag-based revalidation (lebih akurat)

### Perubahan Storefront
- Ganti `import productsData from "@/data/products.json"` dengan helper `lib/storefront/products.ts`
- Helper ini fetch dari Supabase (server-side)
- Untuk development (no Supabase setup): fallback ke JSON existing
- API `app/api/midtrans/create-transaction` tetap write order ke Supabase (existing)

### File yang Berubah (Storefront)
- `app/page.tsx` — ganti productsData dengan helper
- `app/products/[slug]/page.tsx` — sama
- `app/promo/page.tsx` — sama
- `components/FlashSaleSection.tsx` — sama
- `components/VoucherCard.tsx` — sama
- `app/api/midtrans/create-transaction/route.ts` — update INSERT ke Supabase

> **PENTING**: API Midtrans INSERT order harus jalan agar tabel `orders` terisi (untuk read-only di admin).

---

## Migration Plan

### Script: `scripts/migrate-data.ts`

```typescript
// Run: npx tsx scripts/migrate-data.ts
// Reads: data/products.json, data/promotions.json
// Writes: Supabase tables
// Behavior: idempotent (safe to re-run, skips existing slugs)

import { createClient } from "@supabase/supabase-js";
import productsData from "../data/products.json";
import promotionsData from "../data/promotions.json";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role untuk admin operations
);

async function migrate() {
  // 1. Extract unique categories dari products
  const categories = unique(productsData.products.map(p => p.category));
  
  // 2. Insert categories (skip if slug exists)
  const categoryIdMap = new Map<string, string>();  // name → uuid
  for (const name of categories) {
    const slug = slugify(name);
    const { data } = await supabase.from("categories")
      .upsert({ name, slug }, { onConflict: "slug" })
      .select().single();
    categoryIdMap.set(name, data.id);
  }
  
  // 3. Build productIdMap untuk promotions reference
  const productIdMap = new Map<string, string>();  // old "prod_001" → new uuid
  
  // 4. Insert products + images
  for (const p of productsData.products) {
    const { data: product } = await supabase.from("products")
      .upsert({ ...p, category_id: categoryIdMap.get(p.category) }, { onConflict: "slug" })
      .select().single();
    productIdMap.set(p.id, product.id);
    
    // Insert images
    for (let i = 0; i < p.images.length; i++) {
      await supabase.from("product_images").insert({
        product_id: product.id,
        url: p.images[i],
        sort_order: i,
      });
    }
  }
  
  // 5. Insert promotions
  for (const promo of promotionsData.promotions) {
    await supabase.from("promotions").upsert({
      type: promo.type,
      title: promo.title,
      // ... other fields
      product_ids: promo.productIds?.map(id => productIdMap.get(id)) ?? [],
    }, { onConflict: "title" });  // pakai title sebagai dedup key
  }
  
  console.log("Migration done!");
}

migrate().catch(console.error);
```

> **Idempotent**: pakai `upsert` dengan unique constraints (slug, name), sehingga bisa di-run berkali-kali tanpa duplikat.

---

## Verification & Acceptance

### Build
- `npm run build` exit 0
- `npx tsc --noEmit` exit 0

### Functional Tests
1. **Setup**: User buat Supabase project, copy env vars, run migration
2. **Login**: `/admin/login` → input password → redirect ke `/admin`
3. **Middleware**: Logout → coba akses `/admin` → redirect ke login
4. **CRUD Kategori**: Tambah kategori baru → muncul di list → edit → hapus (cascade atau block kalau ada produk terkait)
5. **CRUD Produk + Multiple Images**: Tambah produk dengan 3 gambar → upload semua → sort dengan drag-drop → cek di storefront (max 5 menit) muncul
6. **CRUD Promo**: Buat voucher dengan discount percentage → buat flash sale dengan productIds → cek di storefront
7. **Read-only Orders**: Selesaikan 1 transaksi di storefront → cek di admin muncul
8. **Storefront Tidak Terganggu**: Homepage, product detail, cart, checkout tetap berfungsi

### Style
- Style brutalist NXTY tetap konsisten di admin panel
- Tap targets ≥44px
- Responsive (mobile + desktop)

### Acceptance Checklist
- ✅ Setup Supabase + env vars documented
- ✅ Migration sukses (35 produk, 13 kategori, 8 promo)
- ✅ Login admin berfungsi dengan ADMIN_PASSWORD
- ✅ Logout berfungsi
- ✅ Middleware protect `/admin/*`
- ✅ CRUD Kategori bekerja
- ✅ CRUD Produk + multiple images upload bekerja
- ✅ CRUD Promo bekerja dengan field kondisional per tipe
- ✅ Orders list read-only bekerja
- ✅ Storefront masih berfungsi seperti sedia kala
- ✅ Perubahan admin terlihat di storefront max 5 menit
- ✅ Build & TypeScript clean
- ✅ Style brutalist konsisten

---

## Fase Implementasi (high-level)

1. **Setup & Migration** — Supabase client, schema migration script, import data
2. **Auth & Middleware** — Login page, API, JWT cookie, middleware
3. **Admin Layout & Dashboard** — Sidebar/mobile nav, top bar, dashboard stats
4. **CRUD Kategori** — List, create, edit, delete
5. **CRUD Produk + Images** — List dengan filter, form dengan multiple image upload
6. **CRUD Promo** — List, form dengan type-specific fields
7. **Orders Read-only** — List + detail modal
8. **Storefront Migration** — Update fetch dari JSON ke Supabase (ISR)
9. **Final Verification** — Build, smoke test, end-to-end

Detail setiap fase akan diuraikan di implementation plan.

---

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Supabase project belum disetup | User sudah punya akun; spec dokumentasikan setup steps |
| Quota Supabase habis | Gratis tier cukup untuk skala UMKM; monitor di Supabase dashboard |
| Image upload lambat | Kompres client-side sebelum upload; tampilkan loading state |
| Storefront jadi lambat karena fetch Supabase | Pakai ISR revalidate 300s; cache di Next.js |
| Data corrupt saat migration | Migration idempotent (upsert); backup JSON sebelum migrate |
| Auth bypass via cookie manipulation | JWT signature dengan ADMIN_JWT_SECRET; HttpOnly + SameSite |
| File upload malicious | Validasi MIME type & size di server; batasi max 5MB per file |

---

## Out of Scope (Future)

- Multi-user dengan role (admin, editor, viewer)
- Email notification
- Print invoice / PDF
- Advanced analytics
- Refund/return management
- Bulk import/export CSV
- Image cropping/resizing tools
- Inventory tracking (stok real-time per varian)
- Customer management (CRUD customer)
