import Link from "next/link";

export const metadata = {
  title: "Syarat & Ketentuan — Anxiety Fightwear",
  description: "Syarat dan ketentuan penggunaan layanan Anxiety Fightwear.",
};

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-caption font-semibold uppercase tracking-widest text-brand-green mb-2">Legal</p>
        <h1 className="text-heading-1 font-bold text-text-primary mb-1">Syarat & Ketentuan</h1>
        <p className="text-caption text-text-muted mb-8">Terakhir diperbarui: Juni 2026</p>

        <div className="space-y-6 text-body-sm text-text-secondary leading-relaxed">
          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">1. Penerimaan Syarat</h2>
            <p>Dengan mengakses dan menggunakan website Anxiety Fightwear, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak menyetujui, harap tidak menggunakan layanan kami.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">2. Produk dan Harga</h2>
            <p>Kami berhak mengubah harga produk sewaktu-waktu tanpa pemberitahuan sebelumnya. Harga yang berlaku adalah harga pada saat pemesanan dikonfirmasi.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">3. Pemesanan</h2>
            <p>Pesanan dianggap sah setelah pembayaran dikonfirmasi. Kami berhak membatalkan pesanan jika stok habis atau terdapat kesalahan harga, dan akan menginformasikan kepada pembeli.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">4. Pembayaran</h2>
            <p>Pembayaran harus diselesaikan dalam 24 jam setelah pemesanan. Pesanan yang tidak dibayar dalam waktu tersebut akan otomatis dibatalkan.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">5. Pengiriman</h2>
            <p>Kami tidak bertanggung jawab atas keterlambatan pengiriman yang disebabkan oleh faktor di luar kendali kami, termasuk bencana alam, kondisi cuaca ekstrem, atau keterlambatan dari jasa kurir.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">6. Kekayaan Intelektual</h2>
            <p>Seluruh konten di website ini, termasuk logo, gambar, dan teks, adalah milik Anxiety Fightwear dan dilindungi oleh hak cipta. Dilarang menggunakan tanpa izin tertulis.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">7. Batasan Tanggung Jawab</h2>
            <p>Anxiety Fightwear tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan produk kami. Tanggung jawab kami dibatasi pada nilai pembelian produk yang bersangkutan.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">8. Hukum yang Berlaku</h2>
            <p>Syarat dan ketentuan ini diatur oleh hukum yang berlaku di Republik Indonesia. Sengketa yang timbul akan diselesaikan melalui musyawarah, atau jika diperlukan, melalui pengadilan yang berwenang di Bandung.</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-body-sm text-text-muted hover:text-text-primary transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
