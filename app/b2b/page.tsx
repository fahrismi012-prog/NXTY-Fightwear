import Link from "next/link";

export const metadata = {
  title: "B2B / Grosir — Anxiety Fightwear",
  description: "Program kemitraan dan pembelian grosir Anxiety Fightwear untuk gym, sekolah bela diri, dan reseller.",
};

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-caption font-semibold uppercase tracking-widest text-brand-black mb-2">Kemitraan</p>
        <h1 className="text-heading-1 font-bold text-text-primary mb-3">B2B / Grosir</h1>
        <p className="text-body text-text-secondary leading-relaxed mb-8">
          Anxiety Fightwear membuka peluang kemitraan untuk gym, perguruan bela diri, sekolah olahraga, dan reseller yang ingin menyediakan perlengkapan beladiri berkualitas dengan harga kompetitif.
        </p>

        <div className="space-y-6 mb-10">
          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body-lg font-bold text-text-primary mb-2">Keuntungan Program B2B</h2>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>• Harga grosir khusus untuk pembelian dalam jumlah besar</li>
              <li>• Dukungan customisasi logo/nama gym pada produk tertentu</li>
              <li>• Prioritas pengiriman dan ketersediaan stok</li>
              <li>• Account manager khusus untuk setiap mitra</li>
              <li>• Minimum order fleksibel sesuai kebutuhan</li>
            </ul>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body-lg font-bold text-text-primary mb-2">Siapa yang Bisa Bergabung?</h2>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>• Gym / pusat kebugaran</li>
              <li>• Perguruan pencak silat, taekwondo, karate, dan bela diri lainnya</li>
              <li>• Sekolah olahraga dan institusi pendidikan</li>
              <li>• Reseller online maupun offline</li>
              <li>• Event organizer turnamen bela diri</li>
            </ul>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body-lg font-bold text-text-primary mb-2">Cara Mendaftar</h2>
            <p className="text-body-sm text-text-secondary mb-3">
              Hubungi kami melalui email atau WhatsApp dengan menyertakan:
            </p>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>1. Nama dan jenis usaha / perguruan</li>
              <li>2. Estimasi kebutuhan produk per bulan</li>
              <li>3. Produk yang diminati</li>
            </ul>
          </div>
        </div>

        <div className="bg-brand-black rounded-card p-6 text-center">
          <h2 className="text-body-lg font-bold text-text-primary mb-2">Hubungi Kami Sekarang</h2>
          <p className="text-body-sm text-text-primary/80 mb-4">Tim kami siap membantu kebutuhan grosir Anda</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:anxietyfightwear@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-brand-black text-body-sm font-bold rounded-subtle hover:bg-neutral-100 transition-colors"
            >
              anxietyfightwear@gmail.com
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-text-primary text-body-sm font-bold rounded-subtle hover:bg-white hover:text-brand-black transition-colors"
            >
              WhatsApp
            </a>
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
