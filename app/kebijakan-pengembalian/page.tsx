import Link from "next/link";

export const metadata = {
  title: "Kebijakan Pengembalian — Anxiety Fightwear",
  description: "Syarat dan prosedur pengembalian produk Anxiety Fightwear.",
};

export default function KebijakanPengembalianPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-caption font-semibold uppercase tracking-widest text-brand-black mb-2">Informasi</p>
        <h1 className="text-heading-1 font-bold text-text-primary mb-3">Kebijakan Pengembalian</h1>
        <p className="text-body text-text-secondary leading-relaxed mb-8">
          Kepuasan pelanggan adalah prioritas kami. Jika produk yang Anda terima tidak sesuai, kami siap membantu proses pengembalian atau penukaran.
        </p>

        <div className="space-y-4">
          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Syarat Pengembalian</h2>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>• Pengembalian dapat dilakukan dalam <strong className="text-text-primary">7 hari</strong> setelah produk diterima</li>
              <li>• Produk belum dipakai, dicuci, atau dimodifikasi</li>
              <li>• Produk masih dalam kondisi dan kemasan asli</li>
              <li>• Disertai bukti pembelian (nomor pesanan)</li>
            </ul>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Alasan yang Dapat Diterima</h2>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>• Produk cacat pabrik atau rusak saat diterima</li>
              <li>• Produk tidak sesuai deskripsi (warna, ukuran, tipe)</li>
              <li>• Produk salah kirim</li>
            </ul>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Prosedur Pengembalian</h2>
            <ol className="space-y-2 text-body-sm text-text-secondary">
              <li>1. Hubungi kami via email atau WhatsApp dengan nomor pesanan dan foto produk</li>
              <li>2. Tim kami akan mengkonfirmasi persetujuan pengembalian dalam 1×24 jam</li>
              <li>3. Kirim produk ke alamat gudang kami di Bandung (ongkir pengembalian ditanggung pembeli kecuali kesalahan kami)</li>
              <li>4. Setelah produk diterima dan dicek, penukaran atau pengembalian dana diproses dalam 3 hari kerja</li>
            </ol>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Pengembalian Dana</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Pengembalian dana dilakukan melalui transfer bank ke rekening yang Anda daftarkan. Proses refund membutuhkan waktu 3–5 hari kerja setelah produk diterima.
            </p>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Pengecualian</h2>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>• Produk yang sudah dipakai atau dicuci</li>
              <li>• Produk sale / clearance</li>
              <li>• Ketidakcocokan ukuran karena salah pilih (pastikan cek size guide sebelum beli)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-surface-1 border border-border-subtle rounded-card p-5 text-center">
          <p className="text-body-sm text-text-secondary mb-3">Ada pertanyaan tentang pengembalian?</p>
          <a
            href="mailto:anxietyfightwear@gmail.com"
            className="text-body-sm font-semibold text-brand-black hover:underline"
          >
            anxietyfightwear@gmail.com
          </a>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-body-sm text-text-muted hover:text-text-primary transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
