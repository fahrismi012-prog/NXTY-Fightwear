# Requirements Document

## Introduction

Fase 2 dari redesign NXTY Fightwear. Fokus pada **conversion flow**: Product Detail → Cart → Checkout. Ketiga halaman ini adalah jantung pendapatan — setiap friction di sini langsung menurunkan konversi.

Fase ini menggunakan design tokens dan UI primitives dari `design-foundation` (fase 1). Tidak membuat komponen baru dari nol kecuali yang spesifik untuk flow ini.

## Posisi di Roadmap

| Fase | Spec | Status |
|------|------|--------|
| 1 | design-foundation | ✅ Selesai |
| 2 | **checkout-flow-redesign** (spec ini) | 🔄 In Progress |
| 3 | discovery-redesign | Belum dimulai |
| 4 | editorial-pages-redesign | Belum dimulai |

## Glossary

- **CartDrawer**: Panel slide-in yang muncul saat user tap ikon keranjang di TopHeader / BottomNav
- **CartPage**: Halaman `/cart` untuk review dan edit keranjang sebelum checkout
- **CheckoutPage**: Halaman `/checkout` untuk isi data pengiriman dan bayar
- **ProductDetail**: Halaman `/products/[slug]` untuk lihat detail produk, pilih varian, tambah ke cart
- **Sticky CTA bar**: Action bar yang menempel di bawah layar mobile
- **TrustStrip**: Komponen trust signals (sudah dibuat di fase 1)

## Requirements

### Requirement 1: Product Detail Page Redesign

**User Story:** Sebagai pembeli, saya ingin halaman produk yang bersih dan informatif, agar saya bisa memutuskan beli dengan yakin tanpa friction.

#### Acceptance Criteria

1. THE Product Detail Page SHALL menampilkan gambar produk edge-to-edge di mobile (tanpa padding samping)
2. THE Product Image SHALL tidak menggunakan grayscale filter
3. THE Product Detail Page SHALL menampilkan nama produk dalam mixed case (bukan full uppercase)
4. THE Product Detail Page SHALL menampilkan harga dengan `PriceTag` component dari `components/ui`
5. THE Product Detail Page SHALL menampilkan kategori sebagai Eyebrow component
6. THE Variant Selector (ukuran) SHALL pakai pill button 44px minimum height
7. THE Variant Selector (warna) SHALL pakai pill button 44px minimum height
8. THE Product Detail Page SHALL menampilkan TrustStrip (Kirim Cepat, 100% Original, Bisa Retur) dengan desain baru
9. THE Sticky Bottom Bar mobile SHALL berisi: quantity stepper, tombol "Tambah ke Keranjang" (primer), tombol "Beli Langsung" (sekunder)
10. THE Sticky Bottom Bar SHALL berada di atas BottomNav (`bottom-16`) dengan tinggi minimum 64px
11. THE Sticky Bottom Bar CTA SHALL menggunakan `Button` component dari `components/ui`
12. WHEN ukuran/warna belum dipilih, THE CTA buttons SHALL disabled dengan pesan helper yang jelas (bukan kode-style `// PILIH UKURAN`)
13. THE Product Detail Page SHALL menampilkan breadcrumb atau back button yang menggunakan `useRouter().back()` untuk kembali ke halaman sebelumnya
14. THE Desktop layout SHALL 2 kolom (gambar kiri, info kanan) tanpa border merah dekoratif
15. THE Page SHALL pakai `text-heading-1` untuk nama produk, bukan uppercase

**Prioritas:** Critical

---

### Requirement 2: Cart Page Redesign

**User Story:** Sebagai pembeli, saya ingin halaman keranjang yang mudah diedit dan langsung terlihat totalnya, agar saya tidak perlu scroll panjang untuk checkout.

#### Acceptance Criteria

1. THE Cart Page SHALL pakai design tokens baru (bukan hardcoded `#dc2626`, `#262626`, dll)
2. THE Cart Item row SHALL menampilkan gambar 80×80, nama, varian (size + warna), harga satuan, dan total per item
3. THE Quantity Stepper SHALL memakai tombol minimal 44×44px
4. THE Delete Button SHALL minimal 44×44px tap area (pakai padding)
5. THE Cart Page desktop SHALL menampilkan layout 2 kolom: items (kiri, 60%) + ringkasan (kanan, 40%)
6. THE Order Summary SHALL menampilkan: Subtotal, Ongkir (dengan catatan estimasi), Total
7. THE Cart Page SHALL menampilkan tombol "Checkout Sekarang" menggunakan `Button variant="primary" size="lg"`
8. THE Empty State SHALL menampilkan ikon yang bersih, teks mixed case, dan tombol "Mulai Belanja" menggunakan `Button`
9. THE Mobile Sticky Bottom Bar SHALL berada di `bottom-16` (di atas BottomNav) dengan total + tombol Checkout
10. THE Cart Item row SHALL TIDAK menampilkan index number (01, 02, 03)
11. THE Cart Page SHALL pakai `Card` component untuk ringkasan desktop

**Prioritas:** Critical

---

### Requirement 3: CartDrawer Redesign

**User Story:** Sebagai pembeli, saya ingin drawer keranjang yang konsisten dengan desain baru, agar pengalaman preview dan checkout terasa premium.

#### Acceptance Criteria

1. THE CartDrawer SHALL pakai design tokens baru (bukan hardcoded colors)
2. THE CartDrawer Header SHALL menggunakan `text-heading-3 font-semibold` bukan font-black uppercase
3. THE CartDrawer Items SHALL TIDAK menampilkan index number
4. THE Quantity Stepper di drawer SHALL minimal 44×44px
5. THE CartDrawer Footer SHALL menampilkan total dengan `PriceTag size="lg"`
6. THE CartDrawer SHALL hanya punya 1 CTA utama: "Checkout Sekarang" (`Button variant="primary"`)
7. THE CartDrawer SHALL tidak ada tombol "LIHAT CART PAGE" sebagai button terpisah — cukup link kecil "Lihat keranjang"
8. THE CartDrawer Empty State SHALL bersih, mixed case, dengan tombol "Mulai Belanja"

**Prioritas:** High

---

### Requirement 4: Checkout Page Redesign

**User Story:** Sebagai pembeli, saya ingin halaman checkout yang terasa bagian dari situs ini, agar saya yakin sedang di halaman yang benar dan tidak ragu untuk bayar.

#### Acceptance Criteria

1. THE Checkout Page visual SHALL konsisten dengan rest of site (bukan rounded-xl generik, bukan warna merah `red-600/700` — pakai `brand-red`)
2. THE Checkout Form labels SHALL konsisten mixed case ("Nama Lengkap", "Nomor HP", "Kota") — tidak ada kapitalisasi random
3. THE Checkout Form inputs SHALL menggunakan `Input` component dari `components/ui`
4. THE Checkout Page SHALL menampilkan section grouping dengan heading jelas: "Informasi Kontak", "Alamat Pengiriman", "Catatan"
5. THE Form input untuk HP SHALL menggunakan `inputMode="tel"`
6. THE Form input untuk email SHALL menggunakan `inputMode="email"`
7. THE Checkout Page SHALL menampilkan `TrustStrip` di atas tombol Bayar (Pembayaran aman · Garansi 30 hari · WhatsApp support)
8. THE Mobile Sticky Bottom Bar SHALL pakai `Button variant="primary" size="lg"` dengan label "Bayar Sekarang"
9. THE Checkout Page SHALL memiliki sticky header minimal (bukan double header) yang hanya tampil di halaman ini — sesuai dengan AppShell yang sudah hide BottomNav dan Footer di /checkout
10. THE Order Summary collapsible HARUS ada di atas form di mobile (collapsed by default, show total + item count)
11. THE Error messages SHALL menggunakan design tokens (`text-error-500`) bukan `text-red-500`
12. THE Checkout Page SHALL tidak ada tombol Submit yang `hidden md:flex` — tombol submit selalu ada (entah sticky bottom atau inline)

**Prioritas:** Critical

---

### Requirement 5: Backward Compatibility

**User Story:** Sebagai developer, saya ingin redesign fase 2 tidak merusak integrasi yang sudah ada.

#### Acceptance Criteria

1. THE Midtrans Snap integration SHALL tetap berfungsi setelah checkout redesign
2. THE Cart state dari CartContext SHALL tetap berfungsi (add/remove/update quantity)
3. THE Build dan typecheck SHALL pass tanpa error baru
4. THE Existing routes SHALL tetap accessible
5. THE CartDrawer SHALL tetap bisa dibuka dari TopHeader dan BottomNav

**Prioritas:** Critical

## Out of Scope

- Integrasi ongkir real-time (tetap placeholder — akan dikerjakan di sprint terpisah)
- Pre-fill alamat dari `/akun/alamat` untuk user logged in (kompleksitas tambahan, iterasi berikut)
- Metode pembayaran pilihan sebelum Midtrans (iterasi berikut)
- Review/rating produk (fase 3)
- Produk terkait / "sering dibeli bersama" (fase 3)
