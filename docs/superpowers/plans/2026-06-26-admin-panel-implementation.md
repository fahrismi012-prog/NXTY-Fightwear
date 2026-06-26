# Admin Panel, Customer & Shipping — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun admin panel, customer auth, dan Everpro shipping integration di NXTY Fightwear. Hasil akhir: admin bisa CRUD konten dari dashboard, customer bisa login & track order, toko online sync real-time via Supabase.

**Architecture:** Next.js 16 App Router + TypeScript + Tailwind. Supabase sebagai database + auth + file storage. Single password admin auth + JWT cookie. Supabase Auth OTP untuk customer. Everpro API untuk cek ongkir + AWB + tracking. Storefront pakai ISR 5 menit (hybrid cache).

**Tech Stack:**
- Next.js 16.2.9, TypeScript, Tailwind CSS
- Supabase (Postgres + Auth + Storage)
- Everpro Shipping API
- jsonwebtoken untuk admin JWT
- @dnd-kit untuk drag-drop sort images

**Spec:** `docs/superpowers/specs/2026-06-26-admin-panel-design.md`

**Verification strategy:** Project ini tidak punya test framework. Setiap task verifikasi dengan:
- `npx tsc --noEmit` (TypeScript check)
- `npm run build` (setelah fase besar selesai)
- Manual smoke test (login → CRUD → cek storefront)

**Delegasi:** Plan ini dipecah menjadi 14 fase. Saat eksekusi, delegasikan 1-3 fase per subagent supaya context tetap terkontrol. Setiap subagent membaca plan, extract fase-nya, dan kerjakan task per task.

---

## Task Map (14 Fase)

| Fase | Tasks | Output | Estimasi |
|---|---|---|---|
| 1 | Setup & Migration | Schema, supabase clients, migration script | 3 tasks |
| 2 | Auth Admin & Middleware | Login, JWT, middleware | 3 tasks |
| 3 | Admin Layout & Dashboard | Sidebar, dashboard | 2 tasks |
| 4 | CRUD Kategori | List, create, edit | 3 tasks |
| 5 | CRUD Produk + Images | List, create, edit dengan multi-image | 4 tasks |
| 6 | CRUD Promo | List, create, edit dengan type-specific fields | 3 tasks |
| 7 | Orders Admin + Everpro | List orders, generate AWB | 3 tasks |
| 8 | Customer Auth (Storefront) | /masuk page, session | 2 tasks |
| 9 | Customer Profile & Addresses | /akun, /akun/alamat | 3 tasks |
| 10 | Checkout Ongkir | Integrate Everpro rates | 3 tasks |
| 11 | Order Tracking | /lacak guest + /akun/pesanan | 2 tasks |
| 12 | Live Tracking UI | Timeline dari Everpro | 1 task |
| 13 | Storefront Migration | JSON → Supabase ISR | 2 tasks |
| 14 | Final Verification | Build, smoke test | 1 task |

**Total: ~35 tasks** across 14 fase.

---

## Fase 1 — Setup & Migration

### Task 1.1: Install dependencies & env setup

**Files:**
- Modify: `package.json`
- Create: `.env.example`

- [ ] Install: `npm install @supabase/supabase-js @supabase/ssr jsonwebtoken bcryptjs @dnd-kit/core @dnd-kit/sortable`

- [ ] Update `.env.example`:
```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=

# Admin Auth
ADMIN_PASSWORD=
ADMIN_JWT_SECRET=

# Everpro
EVERPRO_API_KEY=
EVERPRO_BASE_URL=https://api.everpro.id
```

- [ ] Verify: `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit` exit 0

- [ ] Commit: `chore(deps): add supabase, jsonwebtoken, dnd-kit for admin panel`

### Task 1.2: Supabase clients & schema

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/auth.ts`
- Create: `types/database.ts`
- Create: `supabase/schema.sql`

- [ ] `lib/supabase/client.ts` (browser client):
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
}
```

- [ ] `lib/supabase/server.ts` (server client dengan service role):
```typescript
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

- [ ] `lib/supabase/auth.ts` (admin JWT helpers):
```typescript
import jwt from "jsonwebtoken";

const COOKIE_NAME = "admin_session";
const SECRET = process.env.ADMIN_JWT_SECRET!;

export function signSession(): string {
  return jwt.sign({ role: "admin" }, SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): boolean {
  try {
    const decoded = jwt.verify(token, SECRET) as { role: string };
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE_NAME;
```

- [ ] `types/database.ts` — Type definitions untuk tables (id, name, slug, dll)

- [ ] `supabase/schema.sql` — Schema lengkap (categories, products, product_images, promotions, orders, customer_profiles, customer_addresses) + indexes + storage bucket setup

- [ ] Verify: `npx tsc --noEmit` exit 0

- [ ] Commit: `feat(supabase): setup clients, schema, dan type definitions`

### Task 1.3: Migration script (idempotent)

**Files:**
- Create: `scripts/migrate-data.ts`
- Create: `lib/storefront/products.ts` (fallback helper)
- Modify: `lib/storefront/products.ts` (juga fetch dari Supabase)

- [ ] `scripts/migrate-data.ts` — Baca `data/products.json` & `data/promotions.json`, insert ke Supabase dengan `upsert` (idempotent)

- [ ] `lib/storefront/products.ts` — Helper untuk storefront baca dari Supabase (server component) dengan fallback ke JSON untuk development tanpa Supabase

- [ ] Verify: Migration bisa di-run (output "Migration done!")

- [ ] Commit: `feat(migration): idempotent script untuk import JSON existing ke Supabase`

---

## Fase 2 — Admin Auth & Middleware

### Task 2.1: Login API

**Files:**
- Create: `app/api/admin/auth/login/route.ts`
- Create: `app/api/admin/auth/logout/route.ts`

- [ ] Login route — POST password, compare dengan `ADMIN_PASSWORD` env var, sign JWT, set cookie
- [ ] Logout route — clear cookie

- [ ] Verify: `npx tsc --noEmit` exit 0

- [ ] Commit: `feat(admin-auth): login & logout API dengan JWT cookie`

### Task 2.2: Login page UI

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] Login form — input password, submit, redirect ke `/admin`
- [ ] Style brutalist NXTY

- [ ] Verify: Halaman bisa dibuka

- [ ] Commit: `feat(admin): login page UI`

### Task 2.3: Middleware

**Files:**
- Create: `middleware.ts` (di root project)

- [ ] Middleware — Cek `/admin/*` routes (kecuali `/admin/login`), verify JWT, redirect ke login jika invalid

- [ ] Verify: Akses `/admin` tanpa login → redirect ke login

- [ ] Commit: `feat(admin): middleware untuk protect /admin routes`

---

## Fase 3 — Admin Layout & Dashboard

### Task 3.1: Admin layout (sidebar + bottom nav)

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `components/admin/Sidebar.tsx` (desktop)
- Create: `components/admin/BottomNav.tsx` (mobile admin)

- [ ] Layout dengan sidebar (desktop ≥md) + bottom nav (mobile <md)
- [ ] Style brutalist NXTY (hitam, merah, hard borders)
- [ ] Nav links: Dashboard, Kategori, Produk, Promo, Pesanan, Logout

- [ ] Verify: Layout render correctly

- [ ] Commit: `feat(admin): layout dengan sidebar dan bottom nav`

### Task 3.2: Dashboard

**Files:**
- Create: `app/admin/page.tsx`

- [ ] Statistik: total produk, kategori, promo aktif, pesanan hari ini
- [ ] Quick links
- [ ] Pesanan terbaru (5 terakhir)

- [ ] Verify: Dashboard menampilkan data real

- [ ] Commit: `feat(admin): dashboard dengan statistik`

---

## Fase 4 — CRUD Kategori

### Task 4.1: API routes

**Files:**
- Create: `app/api/admin/categories/route.ts`
- Create: `app/api/admin/categories/[id]/route.ts`

- [ ] GET (list), POST (create)
- [ ] GET, PUT, DELETE (single)

- [ ] Verify: API responses correct

- [ ] Commit: `feat(admin): API CRUD kategori`

### Task 4.2: List page

**Files:**
- Create: `app/admin/categories/page.tsx`

- [ ] Tabel dengan nama, slug, jumlah produk, aksi
- [ ] Tombol "+ Tambah Kategori"
- [ ] Search

- [ ] Verify: Halaman render dengan data

- [ ] Commit: `feat(admin): halaman list kategori`

### Task 4.3: Form create/edit

**Files:**
- Create: `app/admin/categories/new/page.tsx`
- Create: `app/admin/categories/[id]/page.tsx`

- [ ] Form dengan nama, slug (auto-generate), deskripsi
- [ ] Tombol simpan, batal, hapus (edit only)

- [ ] Verify: Bisa create, edit, delete kategori

- [ ] Commit: `feat(admin): form create/edit kategori`

---

## Fase 5 — CRUD Produk + Images

### Task 5.1: API routes

**Files:**
- Create: `app/api/admin/products/route.ts`
- Create: `app/api/admin/products/[id]/route.ts`
- Create: `app/api/admin/upload/route.ts`

- [ ] CRUD products + images
- [ ] Upload route — POST file ke Supabase Storage, return public URL

- [ ] Verify: API works

- [ ] Commit: `feat(admin): API CRUD produk + upload`

### Task 5.2: List page

**Files:**
- Create: `app/admin/products/page.tsx`

- [ ] Tabel dengan thumbnail, nama, kategori, harga, stok, featured
- [ ] Filter by kategori, search, pagination

- [ ] Verify: Halaman render

- [ ] Commit: `feat(admin): list produk dengan filter`

### Task 5.3: Form create

**Files:**
- Create: `app/admin/products/new/page.tsx`

- [ ] Form fields: nama, slug, kategori, deskripsi, harga, harga coret, **berat (gram)**, ukuran (multi-input), warna (multi-input), rating, featured, in_stock

- [ ] Verify: Bisa create produk

- [ ] Commit: `feat(admin): form create produk`

### Task 5.4: Multiple images upload + sortable + edit form

**Files:**
- Create: `components/admin/ImageUploader.tsx`
- Create: `app/admin/products/[id]/page.tsx`

- [ ] Drag-drop upload area + file picker
- [ ] Sortable list (drag to reorder)
- [ ] Tombol hapus per image
- [ ] Edit form dengan semua fields + images management

- [ ] Verify: Upload, sort, delete images; edit produk

- [ ] Commit: `feat(admin): multiple images upload + edit produk`

---

## Fase 6 — CRUD Promo

### Task 6.1: API routes

**Files:**
- Create: `app/api/admin/promotions/route.ts`
- Create: `app/api/admin/promotions/[id]/route.ts`

- [ ] CRUD promotions

- [ ] Verify: API works

- [ ] Commit: `feat(admin): API CRUD promo`

### Task 6.2: List page

**Files:**
- Create: `app/admin/promotions/page.tsx`

- [ ] Tabel dengan tipe, judul, diskon, prioritas, status
- [ ] Filter by tipe

- [ ] Verify: Render dengan data

- [ ] Commit: `feat(admin): list promo`

### Task 6.3: Form create/edit (type-specific)

**Files:**
- Create: `app/admin/promotions/new/page.tsx`
- Create: `app/admin/promotions/[id]/page.tsx`

- [ ] Common fields + conditional fields per tipe (banner/flash_sale/voucher/bundle/add_on)
- [ ] Multi-select untuk productIds (flash_sale)

- [ ] Verify: Create, edit, delete promo semua tipe

- [ ] Commit: `feat(admin): form promo dengan field kondisional`

---

## Fase 7 — Orders Admin + Everpro

### Task 7.1: API list orders

**Files:**
- Create: `app/api/admin/orders/route.ts`

- [ ] GET orders dengan filter status, search

- [ ] Verify: API returns orders

- [ ] Commit: `feat(admin): API list orders`

### Task 7.2: Orders list & detail page

**Files:**
- Create: `app/admin/orders/page.tsx`
- Create: `components/admin/OrderDetailModal.tsx`

- [ ] Tabel dengan order ID, tanggal, customer, total, status
- [ ] Modal detail (items JSON, alamat, shipping info)

- [ ] Verify: Bisa lihat detail order

- [ ] Commit: `feat(admin): halaman orders dengan detail modal`

### Task 7.3: Everpro integration (admin side)

**Files:**
- Create: `lib/shipping/everpro.ts`
- Create: `app/api/admin/shipping/generate-awb/route.ts`
- Create: `app/api/admin/shipping/track/route.ts`
- Modify: `components/admin/OrderDetailModal.tsx`

- [ ] Everpro client library (getRates, createShipment, trackShipment)
- [ ] Generate AWB API — panggil Everpro, simpan waybill ke order, update status ke "shipped"
- [ ] Track API — proxy ke Everpro
- [ ] Tombol "Buat Resi" di modal detail, tracking timeline display

- [ ] Verify: Generate AWB (perlu real API key), track works

- [ ] Commit: `feat(admin): Everpro integration untuk generate AWB & track`

---

## Fase 8 — Customer Auth (Storefront)

### Task 8.1: Customer Supabase client + login API helper

**Files:**
- Create: `lib/supabase/customer.ts`
- Create: `app/api/auth/customer-login/route.ts`

- [ ] Customer Supabase client (browser-side, server-side)
- [ ] Login helper (kirim OTP / magic link via Supabase Auth)

- [ ] Verify: Setup works

- [ ] Commit: `feat(customer-auth): Supabase client & login API helper`

### Task 8.2: Login page UI + header integration

**Files:**
- Create: `app/masuk/page.tsx`
- Modify: `components/Navbar.tsx`

- [ ] Halaman `/masuk` — input email, toggle link/OTP mode, submit
- [ ] Update Navbar: tampilkan user menu saat login (dropdown: Akun, Pesanan, Alamat, Logout)

- [ ] Verify: Bisa login, header menampilkan user info

- [ ] Commit: `feat(customer): login page & header user menu`

---

## Fase 9 — Customer Profile & Addresses

### Task 9.1: Customer profile pages

**Files:**
- Create: `app/akun/page.tsx`

- [ ] Profile (nama, email, phone) + form edit

- [ ] Verify: Bisa lihat & edit profil

- [ ] Commit: `feat(customer): halaman profil`

### Task 9.2: Address management pages

**Files:**
- Create: `app/akun/alamat/page.tsx`
- Create: `app/akun/alamat/baru/page.tsx`
- Create: `app/akun/alamat/[id]/page.tsx`
- Create: `app/api/customer/addresses/route.ts`
- Create: `app/api/customer/addresses/[id]/route.ts`

- [ ] List alamat, tambah, edit, hapus
- [ ] Set default address
- [ ] API CRUD addresses

- [ ] Verify: Bisa manage multiple alamat

- [ ] Commit: `feat(customer): address management`

### Task 9.3: Customer layout dengan proteksi

**Files:**
- Create: `app/akun/layout.tsx`

- [ ] Layout dengan sidebar/nav untuk halaman customer
- [ ] Middleware-style guard (redirect ke /masuk jika tidak login)

- [ ] Verify: Akses /akun tanpa login → redirect ke /masuk

- [ ] Commit: `feat(customer): layout & auth guard`

---

## Fase 10 — Checkout Ongkir

### Task 10.1: Everpro API route (proxy)

**Files:**
- Create: `app/api/shipping/rates/route.ts`

- [ ] POST {origin, destination, weight, courier?} → proxy ke Everpro `getRates`, return list ongkir

- [ ] Verify: API returns rates

- [ ] Commit: `feat(shipping): API proxy untuk cek ongkir Everpro`

### Task 10.2: Update checkout form dengan ongkir

**Files:**
- Modify: `app/checkout/page.tsx`

- [ ] Tambah field kota tujuan (dropdown kota dari API atau input manual)
- [ ] Berat computed dari cart (sum berat per item × qty)
- [ ] Auto-fetch ongkir saat kota + cart berubah
- [ ] Tampilkan list ongkir per kurir, customer pilih
- [ ] Ongkir masuk ke total

- [ ] Verify: Ongkir otomatis muncul saat checkout

- [ ] Commit: `feat(checkout): auto-compute ongkir dari Everpro`

### Task 10.3: Simpan shipping info ke order

**Files:**
- Modify: `app/api/midtrans/create-transaction/route.ts`

- [ ] Saat create order, simpan shipping cost, courier, service, waybill (jika sudah ada), etd ke tabel orders
- [ ] Total = subtotal + shipping_cost

- [ ] Verify: Order di DB punya shipping info lengkap

- [ ] Commit: `feat(checkout): simpan shipping info ke order`

---

## Fase 11 — Order Tracking

### Task 11.1: Guest tracking page + API

**Files:**
- Create: `app/lacak/page.tsx`
- Create: `app/api/track/order/route.ts`

- [ ] Halaman `/lacak` dengan form Order ID + email
- [ ] API lookup order by id + email verification
- [ ] Tampilkan status + items + (opsional) tracking info

- [ ] Verify: Guest bisa track order

- [ ] Commit: `feat(tracking): guest tracking page`

### Task 11.2: Customer order history

**Files:**
- Create: `app/akun/pesanan/page.tsx`
- Create: `app/akun/pesanan/[id]/page.tsx`

- [ ] List order customer (by customer_id)
- [ ] Detail order page dengan status, items, tracking info

- [ ] Verify: Customer bisa lihat history order

- [ ] Commit: `feat(customer): order history pages`

---

## Fase 12 — Live Tracking UI

### Task 12.1: Tracking timeline component

**Files:**
- Create: `components/TrackingTimeline.tsx`
- Modify: `app/lacak/page.tsx`, `app/akun/pesanan/[id]/page.tsx`, `components/admin/OrderDetailModal.tsx`

- [ ] Component yang fetch Everpro tracking events & render timeline
- [ ] Cache 5 menit
- [ ] Integrate ke guest tracking, customer order detail, admin order detail

- [ ] Verify: Timeline muncul dengan data real

- [ ] Commit: `feat(tracking): live timeline component dari Everpro`

---

## Fase 13 — Storefront Migration (JSON → Supabase)

### Task 13.1: Update storefront pages pakai helper

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/products/[slug]/page.tsx`
- Modify: `app/promo/page.tsx`
- Modify: `components/FlashSaleSection.tsx`
- Modify: `components/VoucherCard.tsx`

- [ ] Ganti `import productsData from "@/data/products.json"` dengan `getProducts()` helper dari Supabase
- [ ] Tambah `export const revalidate = 300` di setiap page
- [ ] Fallback ke JSON jika Supabase tidak configured (dev mode)

- [ ] Verify: Storefront masih render, data dari Supabase

- [ ] Commit: `refactor(storefront): migrate dari JSON ke Supabase dengan ISR 5 menit`

### Task 13.2: Customer info di checkout

**Files:**
- Modify: `app/checkout/page.tsx`
- Modify: `app/api/midtrans/create-transaction/route.ts`

- [ ] Jika customer login, auto-fill nama, email, phone dari profile
- [ ] Tampilkan opsi pilih alamat dari `customer_addresses`
- [ ] Kirim customer_id saat create order

- [ ] Verify: Checkout dengan login auto-fill data

- [ ] Commit: `feat(checkout): pre-fill data untuk customer yang login`

---

## Fase 14 — Final Verification

### Task 14.1: Build & smoke test

- [ ] `cd /home/administrator/projects/nxty-fightwear && npx tsc --noEmit` → exit 0
- [ ] `npm run build` → exit 0, semua routes generated
- [ ] Manual smoke test end-to-end:
  - [ ] Setup env vars
  - [ ] Run migration
  - [ ] Login admin → CRUD kategori/produk/promo
  - [ ] Upload produk image
  - [ ] Checkout sebagai guest → verifikasi ongkir Everpro
  - [ ] Customer login → save alamat → checkout pakai alamat
  - [ ] Admin generate AWB → customer track order
  - [ ] Guest tracking via `/lacak`

- [ ] Update `docs/superpowers/2026-06-26-admin-panel-changelog.md` dengan summary
- [ ] Commit: `docs: admin panel & customer features changelog`

---

## Definition of Done

- [ ] Semua 14 fase selesai, 35 tasks ter-commit
- [ ] TypeScript clean, build sukses
- [ ] Admin dapat login & CRUD konten
- [ ] Customer dapat login & checkout
- [ ] Ongkir otomatis dari Everpro
- [ ] Tracking order berfungsi (guest + customer)
- [ ] Live tracking timeline dari Everpro
- [ ] Storefront tetap berfungsi dengan data Supabase
- [ ] Changelog ditulis
- [ ] Semua perubahan ter-commit di branch `feat/admin-panel` (branch baru)

---

## Delegasi Strategy

Untuk eksekusi, delegasikan per fase atau grup fase:
- **Delegasi 1 (Subagent)**: Fase 1-3 (Setup, auth admin, layout) — fondasi
- **Delegasi 2 (Subagent)**: Fase 4-6 (CRUD kategori, produk, promo)
- **Delegasi 3 (Subagent)**: Fase 7 (Orders admin + Everpro)
- **Delegasi 4 (Subagent)**: Fase 8-9 (Customer auth, profile, addresses)
- **Delegasi 5 (Subagent)**: Fase 10-12 (Checkout ongkir, tracking, live tracking UI)
- **Delegasi 6 (Subagent)**: Fase 13-14 (Storefront migration, verifikasi)

Setiap subagent dapat plan lengkap sebagai context dan extract fase yang relevan. Lebih ringan karena context per subagent terbatas pada fase-nya saja.
