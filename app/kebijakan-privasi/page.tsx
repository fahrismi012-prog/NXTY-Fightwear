import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi — Anxiety Fightwear",
  description: "Kebijakan privasi dan perlindungan data pengguna Anxiety Fightwear.",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-caption font-semibold uppercase tracking-widest text-brand-green mb-2">Legal</p>
        <h1 className="text-heading-1 font-bold text-text-primary mb-1">Kebijakan Privasi</h1>
        <p className="text-caption text-text-muted mb-8">Terakhir diperbarui: Juni 2026</p>

        <div className="space-y-6 text-body-sm text-text-secondary leading-relaxed">
          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi yang Anda berikan secara langsung, seperti nama, alamat email, nomor telepon, dan alamat pengiriman saat melakukan pembelian atau mendaftar akun.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">2. Penggunaan Informasi</h2>
            <p>Informasi Anda kami gunakan untuk memproses pesanan, mengirimkan produk, menghubungi Anda terkait pesanan, dan mengirimkan informasi promosi (jika Anda menyetujuinya).</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">3. Keamanan Data</h2>
            <p>Kami menggunakan langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">4. Berbagi Data dengan Pihak Ketiga</h2>
            <p>Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Data hanya dibagikan kepada mitra pengiriman yang diperlukan untuk memproses pesanan Anda.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">5. Cookie</h2>
            <p>Website kami menggunakan cookie untuk meningkatkan pengalaman pengguna. Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fungsi website mungkin tidak berjalan optimal.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">6. Hak Anda</h2>
            <p>Anda berhak mengakses, memperbarui, atau meminta penghapusan data pribadi Anda. Hubungi kami di <a href="mailto:anxietyfightwear@gmail.com" className="text-brand-green hover:underline">anxietyfightwear@gmail.com</a> untuk permintaan terkait data.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">7. Perubahan Kebijakan</h2>
            <p>Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui email atau notifikasi di website.</p>
          </div>

          <div>
            <h2 className="text-body font-bold text-text-primary mb-2">8. Hubungi Kami</h2>
            <p>Jika ada pertanyaan tentang kebijakan privasi ini, hubungi kami di <a href="mailto:anxietyfightwear@gmail.com" className="text-brand-green hover:underline">anxietyfightwear@gmail.com</a>.</p>
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
