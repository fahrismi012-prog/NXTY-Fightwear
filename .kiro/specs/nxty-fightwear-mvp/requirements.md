# Requirements Document

## Introduction

NXTY Fightwear adalah toko online mobile-first yang terinspirasi dari pengalaman belanja Shopee, namun disederhanakan untuk kebutuhan UMKM. Project ini bertujuan untuk membuat platform e-commerce yang cepat, mudah digunakan, modern, dan siap production.

Cakupan MVP mencakup:

1. **Sprint A - Stabilitas Project**: Custom error pages, skeleton loading, build process
2. **Sprint B - Homepage Experience**: Header, hero banner, search, kategori, flash sale, product grid, footer
3. **Sprint C - Shopping Experience**: Cart page, search result dengan filtering, sorting, related product, wishlist
4. **Sprint D - Checkout**: Order review, address selection, shipping options, payment methods
5. **Sprint E - Admin Panel**: Order management, product management, dashboard, export CSV

## Glossary

- **NXTY Fightwear**: Toko online e-commerce untuk produk fightwear
- **Produk**: Item yang dijual di platform NXTY Fightwear
- **Kategori**: Kelompok produk berdasarkan jenis atau tipe
- **Promo**: Program diskon atau penawaran khusus
- **Keranjang**: Daftar produk yang dipilih oleh pelanggan untuk dibeli
- **Wishlist**: Daftar produk yang disukai oleh pelanggan untuk dibeli di masa depan
- **Alamat Pengiriman**: Lokasi pengiriman produk yang disimpan oleh pelanggan
- **Pesanan**: Transaksi pembelian produk oleh pelanggan
- **Shipping**: Layanan pengiriman produk ke pelanggan
- **Payment**: Metode pembayaran untuk pesanan
- **Admin**: Pengguna yang mengelola toko dan konten
- **User**: Pengguna yang mendaftar dan berbelanja di platform
- **Skeleton Loading**: UI placeholder yang ditampilkan saat loading konten
- **Flash Sale**: Penawaran diskon dengan waktu terbatas

## Requirements

### Requirement 1: Custom 404 Page

**User Story:** Sebagai pengguna, saya ingin melihat halaman 404 yang custom, agar pengalaman browsing tetap konsisten dengan brand NXTY Fightwear.

#### Acceptance Criteria

1. WHEN pengguna mengakses URL yang tidak ada, THE System SHALL menampilkan halaman 404 custom
2. THE 404 Page SHALL menampilkan logo NXTY Fightwear
3. THE 404 Page SHALL menyediakan tombol kembali ke homepage
4. THE 404 Page SHALL mobile-friendly dan accessible

**Prioritas:** High

### Requirement 2: Global Error Page

**User Story:** Sebagai pengguna, saya ingin melihat halaman error yang jelas jika terjadi error, agar saya tahu apa yang terjadi dan bisa kembali menggunakan aplikasi.

#### Acceptance Criteria

1. WHEN terjadi error sistem, THE System SHALL menampilkan global error page
2. THE Error Page SHALL menampilkan pesan error yang jelas dan tidak teknis
3. THE Error Page SHALL menyediakan tombol kembali atau refresh
4. THE Error Page SHALL mobile-friendly dan accessible

**Prioritas:** High

### Requirement 3: Skeleton Loading

**User Story:** Sebagai pengguna, saya ingin melihat loading indicator yang elegan, agar saya tahu konten sedang dimuat dan tidak merasa aplikasi lambat.

#### Acceptance Criteria

1. WHEN konten sedang dimuat, THE System SHALL menampilkan skeleton loading
2. THE Skeleton Loading SHALL menampilkan placeholder bentuk konten yang sedang dimuat
3. THE Skeleton Loading SHALL mobile-friendly dengan spacing yang tepat
4. THE Skeleton Loading SHALL menghilang saat konten selesai dimuat

**Prioritas:** High

### Requirement 4: Build Process

**User Story:** Sebagai developer, saya ingin build process yang stabil dan reliable, agar saya dapat mendeploy aplikasi dengan confidence.

#### Acceptance Criteria

1. THE Build Process SHALL menghasilkan aplikasi yang dapat di-deploy ke Vercel
2. THE Build Process SHALL lulus type checking tanpa error
3. WHEN terjadi error build, THE System SHALL menampilkan pesan error yang jelas
4. THE Build Process SHALL optimized untuk production

**Prioritas:** High

### Requirement 5: Header

**User Story:** Sebagai pengguna, saya ingin melihat header yang jelas dengan search, cart icon, dan user menu, agar saya bisa dengan mudah mencari produk, melihat keranjang, dan mengakses akun saya.

#### Acceptance Criteria

1. THE Header SHALL menampilkan logo NXTY Fightwear
2. THE Header SHALL menampilkan search bar untuk mencari produk
3. THE Header SHALL menampilkan cart icon dengan jumlah item di keranjang
4. THE Header SHALL menampilkan user menu dengan opsi login/akun
5. THE Header SHALL sticky saat scroll
6. THE Header SHALL mobile-friendly dengan touch-friendly tap area (min 44px)
7. WHEN search bar di-focus, THE System SHALL menampilkan keyboard yang optimal untuk mobile

**Prioritas:** High

### Requirement 6: Hero Banner

**User Story:** Sebagai pengguna, saya ingin melihat hero banner yang menarik, agar saya termotivasi untuk menjelajahi produk.

#### Acceptance Criteria

1. THE Hero Banner SHALL menampilkan gambar utama yang menarik
2. THE Hero Banner SHALL menampilkan call-to-action button
3. WHEN user swipe pada hero banner di mobile, THE System SHALL switch slide

**Prioritas:** Medium

### Requirement 7: Search Functionality

**User Story:** Sebagai pengguna, saya ingin mencari produk dengan mudah, agar saya bisa menemukan apa yang saya cari dengan cepat.

#### Acceptance Criteria

1. WHEN user mengetik kata kunci di search bar, THE System SHALL menampilkan hasil pencarian yang relevan
2. WHEN user menekan enter di search bar, THE System SHALL navigate ke halaman search result
3. THE Search Functionality SHALL autocomplete kata kunci saat user mengetik
4. THE Search Functionality SHALL mobile-friendly dengan keyboard yang optimal

**Prioritas:** High

### Requirement 8: Category List

**User Story:** Sebagai pengguna, saya ingin melihat kategori produk yang jelas, agar saya bisa menjelajahi produk berdasarkan kategori yang saya minati.

#### Acceptance Criteria

1. THE Category List SHALL menampilkan daftar kategori produk
2. WHEN user mengetuk kategori, THE System SHALL navigate ke halaman produk kategori tersebut
3. THE Category List SHALL menampilkan icon kategori yang jelas
4. THE Category List SHALL mobile-friendly dengan spacing yang tepat
5. THE Category List SHALL scroll horizontal untuk kategori yang banyak

**Prioritas:** High

### Requirement 9: Flash Sale Section

**User Story:** Sebagai pengguna, saya ingin melihat produk flash sale, agar saya bisa mendapatkan penawaran terbaik dengan harga diskon.

#### Acceptance Criteria

1. THE Flash Sale Section SHALL menampilkan produk dengan harga diskon
2. THE Flash Sale Section SHALL menampilkan countdown timer ke akhir flash sale
3. WHEN flash sale berakhir, THE System SHALL menandai produk sebagai tidak tersedia
4. THE Flash Sale Section SHALL mobile-friendly dengan layout yang menarik
5. WHEN user mengetuk produk flash sale, THE System SHALL navigate ke detail produk

**Prioritas:** Medium

### Requirement 10: Product Grid

**User Story:** Sebagai pengguna, saya ingin melihat produk dalam grid yang rapi, agar saya bisa menjelajahi banyak produk dengan mudah.

#### Acceptance Criteria

1. THE Product Grid SHALL menampilkan produk dalam grid responsif
2. WHEN user mengetuk produk, THE System SHALL navigate ke detail produk
3. THE Product Grid SHALL menampilkan image, nama, harga, dan rating produk
4. THE Product Grid SHALL optimized untuk mobile dengan touch-friendly tap area
5. THE Product Grid SHALL lazy load image untuk performa yang baik

**Prioritas:** High

### Requirement 11: Footer

**User Story:** Sebagai pengguna, saya ingin melihat footer dengan informasi kontak dan link penting, agar saya bisa menghubungi kami atau menjelajahi halaman tambahan.

#### Acceptance Criteria

1. THE Footer SHALL menampilkan informasi kontak (email, no telepon)
2. THE Footer SHALL menampilkan link ke halaman about, terms, dan privacy policy
3. THE Footer SHALL menampilkan sosial media icons
4. THE Footer SHALL mobile-friendly dengan spacing yang tepat

**Prioritas:** Low

### Requirement 12: Cart Page

**User Story:** Sebagai pengguna, saya ingin melihat keranjang belanja saya, agar saya bisa melihat produk yang akan dibeli dan mengelola jumlahnya.

#### Acceptance Criteria

1. THE Cart Page SHALL menampilkan daftar produk di keranjang
2. WHEN jumlah produk diubah, THE System SHALL update total harga
3. WHEN produk dihapus dari keranjang, THE System SHALL update total harga dan jumlah item
4. THE Cart Page SHALL menampilkan subtotal, ongkos kirim, dan total harga
5. THE Cart Page SHALL menyediakan tombol checkout
6. THE Cart Page SHALL mobile-friendly dengan touch-friendly controls
7. WHEN keranjang kosong, THE System SHALL menampilkan pesan kosong dengan tombol lanjut belanja

**Prioritas:** High

### Requirement 13: Search Result Page

**User Story:** Sebagai pengguna, saya ingin melihat hasil pencarian dengan filtering dan sorting, agar saya bisa menemukan produk yang tepat dengan mudah.

#### Acceptance Criteria

1. THE Search Result Page SHALL menampilkan daftar produk yang sesuai dengan kata kunci
2. THE Search Result Page SHALL menyediakan filtering berdasarkan kategori, harga, dan rating
3. THE Search Result Page SHALL menyediakan sorting berdasarkan harga (termurah-termahal, termahal-termurah), rating, dan terbaru
4. WHEN filter diubah, THE System SHALL update hasil pencarian
5. WHEN sorting diubah, THE System SHALL update urutan hasil pencarian
6. THE Search Result Page SHALL mobile-friendly dengan filter yang accessible
7. WHEN tidak ada hasil, THE System SHALL menampilkan pesan tidak ada produk

**Prioritas:** High

### Requirement 14: Related Product

**User Story:** Sebagai pengguna, saya ingin melihat produk terkait, agar saya bisa menemukan produk lain yang mungkin saya minati.

#### Acceptance Criteria

1. THE Related Product Section SHALL menampilkan produk yang terkait dengan produk yang dilihat
2. WHEN user mengetuk produk terkait, THE System SHALL navigate ke detail produk tersebut
3. THE Related Product Section SHALL mobile-friendly dengan layout yang menarik
4. THE Related Product Section SHALL dynamic berdasarkan kategori produk yang dilihat

**Prioritas:** Medium

### Requirement 15: Wishlist

**User Story:** Sebagai pengguna, saya ingin menyimpan produk ke wishlist, agar saya bisa membelinya di masa depan.

#### Acceptance Criteria

1. WHEN user menekan tombol wishlist, THE System SHALL menambahkan produk ke wishlist
2. THE Wishlist Page SHALL menampilkan daftar produk di wishlist
3. WHEN produk dihapus dari wishlist, THE System SHALL update daftar wishlist
4. THE Wishlist Page SHALL mobile-friendly dengan spacing yang tepat
5. WHEN user login, THE System SHALL sync wishlist dengan akun

**Prioritas:** Low

### Requirement 16: Order Review

**User Story:** Sebagai pengguna, saya ingin mereview pesanan saya sebelum checkout, agar saya bisa memastikan semua produk dan alamat pengiriman benar.

#### Acceptance Criteria

1. THE Order Review Page SHALL menampilkan ringkasan produk yang dibeli
2. THE Order Review Page SHALL menampilkan alamat pengiriman yang dipilih
3. THE Order Review Page SHALL menampilkan metode pembayaran yang dipilih
4. THE Order Review Page SHALL menampilkan total harga yang harus dibayar
5. WHEN alamat pengiriman diubah, THE System SHALL update ongkos kirim
6. THE Order Review Page SHALL mobile-friendly dengan layout yang jelas

**Prioritas:** High

### Requirement 17: Address Selection/Add

**User Story:** Sebagai pengguna, saya ingin memilih atau menambah alamat pengiriman, agar saya bisa mengirimkan produk ke lokasi yang saya inginkan.

#### Acceptance Criteria

1. THE Address Page SHALL menampilkan daftar alamat pengiriman yang tersimpan
2. WHEN user menekan tombol tambah alamat, THE System SHALL navigasi ke form tambah alamat
3. WHEN alamat dipilih, THE System SHALL set alamat tersebut sebagai alamat pengiriman utama
4. WHEN alamat dihapus, THE System SHALL menghapus alamat tersebut
5. THE Address Page SHALL mobile-friendly dengan form yang accessible
6. THE Address Form SHALL validasi input dengan pesan error yang jelas

**Prioritas:** High

### Requirement 18: Shipping Options

**User Story:** Sebagai pengguna, saya ingin memilih opsi pengiriman yang tersedia, agar saya bisa memilih yang paling sesuai dengan kebutuhan saya.

#### Acceptance Criteria

1. THE Shipping Options Section SHALL menampilkan daftar jasa pengiriman yang tersedia
2. WHEN jasa pengiriman dipilih, THE System SHALL update ongkos kirim
3. THE Shipping Options Section SHALL menampilkan estimasi waktu pengiriman
4. THE Shipping Options Section SHALL mobile-friendly dengan spacing yang tepat
5. THE Shipping Options Section SHALL dynamic berdasarkan alamat pengiriman

**Prioritas:** High

### Requirement 19: Payment Methods

**User Story:** Sebagai pengguna, saya ingin memilih metode pembayaran yang tersedia, agar saya bisa membayar dengan cara yang paling nyaman.

#### Acceptance Criteria

1. THE Payment Methods Section SHALL menampilkan daftar metode pembayaran yang tersedia
2. WHEN metode pembayaran dipilih, THE System SHALL update detail pembayaran
3. THE Payment Methods Section SHALL mobile-friendly dengan spacing yang tepat
4. WHEN metode pembayaran adalah Transfer Bank, THE System SHALL menampilkan nomor rekening dan nama bank
5. WHEN metode pembayaran adalah E-Wallet, THE System SHALL menampilkan QR code atau link pembayaran

**Prioritas:** High

### Requirement 20: Order Management

**User Story:** Sebagai admin, saya ingin mengelola pesanan pelanggan, agar saya bisa memproses pesanan dengan efisien.

#### Acceptance Criteria

1. THE Order List Page SHALL menampilkan daftar semua pesanan
2. WHEN pesanan diperbarui, THE System SHALL update status pesanan
3. THE Order List Page SHALL menyediakan filtering berdasarkan status pesanan
4. THE Order List Page SHALL menyediakan sorting berdasarkan waktu pemesanan
5. WHEN detail pesanan dilihat, THE System SHALL menampilkan informasi lengkap pesanan
6. THE Order Management Page SHALL mobile-friendly dengan list yang accessible
7. WHEN pesanan dicetak, THE System SHALL generate invoice PDF

**Prioritas:** High

### Requirement 21: Product Management

**User Story:** Sebagai admin, saya ingin mengelola produk, agar saya bisa menambah, mengedit, atau menghapus produk yang dijual.

#### Acceptance Criteria

1. THE Product List Page SHALL menampilkan daftar semua produk
2. WHEN produk ditambahkan, THE System SHALL menyimpan produk ke database
3. WHEN produk diedit, THE System SHALL update produk di database
4. WHEN produk dihapus, THE System SHALL menghapus produk dari database
5. THE Product Form SHALL validasi input dengan pesan error yang jelas
6. THE Product Management Page SHALL mobile-friendly dengan form yang accessible
7. WHEN produk diupload, THE System SHALL resize dan optimize gambar

**Prioritas:** High

### Requirement 22: Dashboard

**User Story:** Sebagai admin, saya ingin melihat dashboard dengan statistik toko, agar saya bisa memantau performa toko dengan cepat.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan jumlah total pesanan
2. THE Dashboard SHALL menampilkan total pendapatan
3. THE Dashboard SHALL menampilkan jumlah produk
4. THE Dashboard SHALL menampilkan jumlah pengguna aktif
5. THE Dashboard SHALL menampilkan grafik penjualan harian/mingguan/bulanan
6. THE Dashboard SHALL mobile-friendly dengan chart yang accessible
7. WHEN filter waktu diubah, THE System SHALL update statistik

**Prioritas:** Medium

### Requirement 23: Export CSV

**User Story:** Sebagai admin, saya ingin mengekspor data ke CSV, agar saya bisa menganalisis data di spreadsheet.

#### Acceptance Criteria

1. WHEN user menekan tombol export, THE System SHALL generate file CSV
2. THE CSV File SHALL berisi data yang dipilih (pesanan, produk, pengguna)
3. THE CSV File SHALL dengan header kolom yang jelas
4. THE CSV File SHALL encoding UTF-8
5. WHEN export gagal, THE System SHALL menampilkan pesan error yang jelas

**Prioritas:** Medium

## Non-Functional Requirements

### Performance

| Requirement | Deskripsi | Target |
|-------------|-----------|--------|
| Page Load Time | Waktu loading halaman | < 3 detik untuk halaman pertama, < 2 detik untuk halaman berikutnya |
| API Response Time | Waktu respons API | < 500ms untuk 95% permintaan |
| Image Load Time | Waktu loading gambar | < 1 detik untuk gambar utama, < 500ms untuk gambar kecil |
| Search Response Time | Waktu respons pencarian | < 300ms untuk 95% pencarian |

### Mobile-First Design

| Requirement | Deskripsi |
|-------------|-----------|
| Responsive Layout | Semua UI harus responsif untuk berbagai ukuran layar mobile |
| Touch-Friendly | Semua elemen interaktif harus memiliki minimal 44px tap area |
| Mobile Keyboard | Form harus menggunakan keyboard yang optimal untuk input mobile |
| Mobile Navigation | Navigation harus mudah digunakan dengan jari di layar kecil |

### Accessibility

| Requirement | Deskripsi |
|-------------|-----------|
| Keyboard Navigation | Semua fungsi harus dapat diakses dengan keyboard |
| Screen Reader Support | Semua elemen visual harus memiliki deskripsi untuk screen reader |
| Color Contrast | Warna harus memiliki kontras yang cukup untuk aksesibilitas |
| Focus Management | Fokus harus dikelola dengan benar untuk navigasi keyboard |

### Security

| Requirement | Deskripsi |
|-------------|-----------|
| Authentication | Semua endpoint admin harus di-protect dengan autentikasi |
| Authorization | Setiap user harus memiliki hak akses yang sesuai dengan peran mereka |
| Input Validation | Semua input user harus divalidasi untuk mencegah XSS dan SQL injection |
| Data Encryption | Data sensitif harus dienkripsi saat disimpan dan ditransmisikan |

### Maintainability

| Requirement | Deskripsi |
|-------------|-----------|
| Code Reusability | Komponen harus reusable dan tidak duplicate |
| Modular Code | Kode harus modular dengan separation of concerns |
| Documentation | Semua API dan komponen harus didokumentasikan |
| Testing | Semua fitur harus memiliki unit test dan integration test |

### SEO

| Requirement | Deskripsi |
|-------------|-----------|
| Meta Tags | Semua halaman harus memiliki meta tags yang optimal |
| Sitemap | Sitemap.xml harus tersedia untuk search engine |
| Structured Data | Structured data harus digunakan untuk produk dan breadcrumbs |
| Fast Load Time | Halaman harus dimuat dengan cepat untuk SEO yang baik |

## Dependencies antar Module

### Sprint A - Stabilitas Project

- Sprint A adalah base layer, tidak ada dependencies dengan module lain

### Sprint B - Homepage Experience

- **Homepage Experience** tidak memiliki dependencies dengan module lain
- **Search Functionality** digunakan oleh **Search Result Page** (Sprint C)

### Sprint C - Shopping Experience

- **Cart Page** menggunakan **Product Data** dari Sprint B
- **Search Result Page** menggunakan **Search Functionality** dari Sprint B
- **Wishlist** menggunakan **User Authentication** dari Sprint D

### Sprint D - Checkout

- **Checkout** menggunakan **Cart Data** dari Sprint C
- **Address Management** menggunakan **User Authentication**
- **Shipping Options** menggunakan **Address Data**
- **Payment Methods** menggunakan **Order Data**

### Sprint E - Admin Panel

- **Order Management** menggunakan **Order Data** dari Sprint D
- **Product Management** menggunakan **Product Data** dari Sprint B
- **Dashboard** menggunakan **Analytics Data** dari semua module
- **Export CSV** menggunakan **Data dari semua module**

## Prioritas

### Sprint A - Stabilitas Project (High Priority)

- Custom 404 Page
- Global Error Page
- Skeleton Loading
- Build Process

### Sprint B - Homepage Experience (High Priority)

- Header (Critical untuk navigation)
- Search Functionality (Critical untuk user experience)
- Category List (Critical untuk browsing)
- Product Grid (Critical untuk display produk)
- Hero Banner (Medium)
- Flash Sale Section (Medium)
- Footer (Low)

### Sprint C - Shopping Experience (High Priority)

- Cart Page (Critical untuk checkout flow)
- Search Result Page (Critical untuk find products)
- Sorting options (Critical untuk find products)
- Related Product (Medium)
- Wishlist (Low)

### Sprint D - Checkout (High Priority)

- Order Review (Critical untuk checkout flow)
- Address selection/add (Critical untuk shipping)
- Shipping options (Critical untuk shipping)
- Payment methods (Critical untuk payment)

### Sprint E - Admin Panel (High Priority)

- Order management (Critical untuk business)
- Product management (Critical untuk business)
- Dashboard (Medium)
- Export CSV (Medium)