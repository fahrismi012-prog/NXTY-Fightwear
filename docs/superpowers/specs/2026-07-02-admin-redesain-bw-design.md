# Admin Redesain — Brutalism Hitam-Putih

**Tanggal**: 2026-07-02
**Branch**: `feature/client-branding-v2`
**Scope**: `/admin/**` (login + layout + dashboard + 4 modul CRUD + 6 komponen bersama)

## Tujuan

Mengganti palette admin dari "dark + merah aksen brutalist" menjadi **putih + hitam brutalism monokromatik** dengan merah `#dc2626` terbatas hanya untuk aksi destruktif. Style bahasa brutalist dipertahankan karena sesuai brand voice fightwear yang tegas.

## Keputusan desain (sudah disetujui user)

| Aspek | Keputusan |
|---|---|
| Scope | Login + layout + dashboard + semua sub-halaman (kategori, produk, promo, pesanan) + semua komponen |
| Style bahasa | **Brutalism** — border-2 tebal, font-black, uppercase, tracking-widest, shadow offset [4px_4px_0] |
| Palette dasar | Background putih (`#ffffff`), teks hitam (`#0a0a0a`), border abu (`#262626` / `neutral-800`), muted abu (`#a3a3a3` / `neutral-400`) |
| Aksen warna | Merah `#dc2626` **HANYA** untuk danger/cancel. Tidak dipakai untuk CTA utama, highlight aktif, badge promo, atau dekoratif |
| Hijau brand | **Tidak dipakai** di area admin (sebelumnya `#2d6a4f` di sidebar/bottom-nav diganti hitam) |

## Aturan pemakaian warna

### Hitam (`#0a0a0a`) — primary action & teks utama

- Tombol primer (Simpan, Buat, Submit)
- Teks heading
- Border kartu aktif / selected
- Background ikon kotak
- Shadow brutalism `[4px_4px_0_#0a0a0a]`

### Putih (`#ffffff`) — canvas & surface

- Background halaman
- Background kartu
- Teks di dalam tombol hitam
- Background form input

### Abu netral — secondary

- `neutral-800` (`#262626`): border default kartu, separator
- `neutral-600` (`#525252`): border tabel, border input default
- `neutral-400` (`#a3a3a3`): border subtle, muted text, icon non-aktif
- `neutral-200` (`#e5e5e5`): hover background, disabled background

### Merah (`#dc2626`) — destructive only

Diizinkan di:
- Tombol hapus / batalkan pesanan / hapus kategori
- Border + background konfirmasi destructive
- Error state (input error, alert validation)
- Border kiri aktif untuk item menu yang destructive (jika ada)
- Hover state tombol "Tutup sesi" / logout jika destructive

DILARANG di:
- Tombol CTA utama (Simpan, Buat, Kirim)
- Highlight kartu aktif / selected
- Badge promo aktif
- Link hover (kecuali menuju aksi destruktif)
- Eyebrow label / dekoratif

## Pola komponen

### Tombol

| Variant | Style | Contoh kasus |
|---|---|---|
| Primary | `bg-black text-white border-2 border-black hover:bg-white hover:text-black` + `hover:shadow-[4px_4px_0_black]` | Simpan, Buat, Submit |
| Secondary | `bg-white text-black border-2 border-black hover:bg-black hover:text-white` | Batal, Kembali |
| Destructive | `bg-white text-[#dc2626] border-2 border-[#dc2626] hover:bg-[#dc2626] hover:text-white` + `hover:shadow-[4px_4px_0_#dc2626]` | Hapus, Batalkan Pesanan |
| Ghost | `bg-transparent text-neutral-600 border-2 border-transparent hover:border-black hover:text-black` | Link aksi minor |

### Kartu / Panel

```
bg-white border-2 border-neutral-800 p-5
hover (klikable): hover:border-black hover:shadow-[4px_4px_0_black] transition-all
```

### Input / Textarea / Select

```
bg-white border-2 border-neutral-600 text-black placeholder:text-neutral-400
focus:border-black focus:outline-none
error: border-[#dc2626] focus:border-[#dc2626]
```

### Badge status pesanan (StatusBadge)

Tanpa warna — dibedakan via label + shape/icon:

| Status | Style |
|---|---|
| Menunggu | `bg-white border-2 border-neutral-800 text-black` |
| Dibayar | `bg-black text-white border-2 border-black` |
| Diproses | `bg-neutral-800 text-white border-2 border-neutral-800` |
| Dikirim | `bg-neutral-200 text-black border-2 border-neutral-800` |
| Sampai | `bg-black text-white border-2 border-black` + ikon ✓ |
| Batal | `bg-white text-[#dc2626] border-2 border-[#dc2626]` |

Atau alternatif: tetap pakai shade abu berbeda. **Final diputuskan saat implementasi** — default pakai daftar di atas, tawarkan iterasi setelah lihat hasil.

## Pola layout

### Sidebar (`/admin` — desktop md+)

- Background: `bg-white`
- Border kanan: `border-r-2 border-black`
- Logo: teks hitam `NXTY` + eyebrow `Admin Panel` (tanpa warna brand)
- Item nav aktif: `bg-black text-white border-l-4 border-white`
- Item nav non-aktif: `text-neutral-600 border-l-4 border-transparent hover:bg-neutral-100 hover:text-black`
- Tombol logout di bawah: variant ghost (non-destructive, jadi tidak merah)

### Bottom nav (`/admin` — mobile <md)

- Background: `bg-white`
- Border atas: `border-t-2 border-black`
- Item aktif: ikon `text-black`, label `text-black`, top-bar `bg-black`
- Item non-aktif: `text-neutral-400 hover:text-black`

### Login page (`/admin/login`)

- Background: `bg-white` (canvas penuh)
- Logo `NXTY` besar, hitam
- Eyebrow `Admin Panel` hitam (tidak merah seperti sekarang)
- Form: `bg-white border-2 border-black`
- Input password: `border-2 border-neutral-600 focus:border-black`
- Tombol submit: `bg-black text-white hover:bg-white hover:text-black border-2 border-black`
- Error message: `border-2 border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626]`
- Footer text: `text-neutral-400`

### Dashboard (`/admin`)

- Background halaman: `bg-white`
- Stats card: `bg-white border-2 border-neutral-800 hover:border-black hover:shadow-[4px_4px_0_black]`
- Icon box di stats: `border-2 border-black bg-white` (sebelumnya merah)
- Angka besar: `text-black`
- Label uppercase: `text-neutral-400`
- Quick links: pola kartu yang sama
- Eyebrow `Dashboard`: `text-black` (sebelumnya merah)

## File yang akan diubah

Total **28 file**:

```
app/admin/layout.tsx                          — chrome layout (sidebar + bottom-nav)
app/admin/login/page.tsx                      — halaman login
app/admin/page.tsx                            — dashboard
app/admin/kategori/page.tsx                   — list
app/admin/kategori/baru/page.tsx              — create
app/admin/kategori/[id]/page.tsx              — edit
app/admin/kategori/CategoryForm.tsx           — form
app/admin/kategori/CategoryActions.tsx        — row actions
app/admin/produk/page.tsx                     — list
app/admin/produk/baru/page.tsx                — create
app/admin/produk/[id]/page.tsx                — edit
app/admin/produk/ProductForm.tsx              — form
app/admin/produk/ProductListClient.tsx        — list client
app/admin/promo/page.tsx                      — list
app/admin/promo/baru/page.tsx                 — create
app/admin/promo/[id]/page.tsx                 — edit
app/admin/promo/PromoForm.tsx                 — form
app/admin/promo/PromoActions.tsx              — row actions
app/admin/promo/TypeFilter.tsx                — filter
app/admin/pesanan/page.tsx                    — list
app/admin/pesanan/OrderListClient.tsx         — list client
components/admin/Sidebar.tsx                  — sidebar navigasi
components/admin/BottomNav.tsx                — bottom nav mobile
components/admin/ImageUploader.tsx            — upload widget
components/admin/OrderDetailModal.tsx         — modal detail pesanan
components/admin/StatusBadge.tsx              — badge status pesanan
components/admin/TrackingTimeline.tsx         — timeline tracking
```

**File TIDAK diubah**: `proxy.ts`, API routes, `lib/`, `app/error.tsx`, `app/not-found.tsx`.

## Yang TIDAK berubah

- Fungsi / logika bisnis (CRUD, validasi, fetch data)
- API routes
- `proxy.ts` (auth guard)
- Design tokens di `globals.css` (semua sudah ada: `--color-brand-black`, `--color-brand-white`, `--color-neutral-*`)
- Copywriting bahasa Indonesia
- Ikon `lucide-react`

## Verifikasi

1. Dev server jalan di `http://localhost:3000/admin/login`
2. Cek setiap halaman di browser — visual kontras hitam-putih, merah hanya muncul di tempat destructive
3. Test interaksi: hover kartu, hover tombol, focus input, error state
4. Test mobile: bottom nav, sidebar collapse, padding responsive
5. Cek tidak ada `bg-[#0a0a0a]` atau `text-[#dc2626]` di tempat yang bukan destructive

## Risiko & catatan

- **Status badge tanpa warna**: mungkin kurang jelas di glance. Solusi: tambahkan ikon (✓ untuk delivered, ↻ untuk processed, dst) sebagai pembeda sekunder. Bisa iterasi setelah lihat hasil.
- **Brutalism + putih**: shadow `[4px_4px_0_black]` di putih bisa terasa "berat" karena offset tinggi. Iterasi: kurangi ke `[3px_3px_0]` atau `[2px_2px_0]` jika terasa terlalu tegas.
- **Kontras teks**: putih-di-hitam sudah AAA. Abu `neutral-400` di putih mungkin perlu dicek kontrasnya (saat ini `neutral-400` = `#a3a3a3` di putih = rasio ~2.85:1, di bawah WCAG AA untuk body text). Jika jadi masalah, naikkan ke `neutral-500` (`#737373`) untuk muted text.
