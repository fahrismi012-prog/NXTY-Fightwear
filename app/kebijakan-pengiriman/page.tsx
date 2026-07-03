import Link from "next/link";

export const metadata = {
  title: "Kebijakan Pengiriman — Anxiety Fightwear",
  description: "Informasi lengkap kebijakan pengiriman produk Anxiety Fightwear.",
};

export default function KebijakanPengirimanPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-caption font-semibold uppercase tracking-widest text-brand-black mb-2">Informasi</p>
        <h1 className="text-heading-1 font-bold text-text-primary mb-3">Kebijakan Pengiriman</h1>
        <p className="text-body text-text-secondary leading-relaxed mb-8">
          Kami berkomitmen untuk mengirimkan setiap pesanan dengan cepat, aman, dan terpercaya ke seluruh wilayah Indonesia.
        </p>

        <div className="space-y-4">
          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Waktu Pemrosesan</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Pesanan yang masuk sebelum pukul 14.00 WIB pada hari kerja akan diproses dan dikirim pada hari yang sama. Pesanan setelah jam 14.00 WIB akan diproses keesokan harinya.
            </p>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Kurir Pengiriman</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed mb-3">
              Kami bekerja sama dengan berbagai jasa kurir terpercaya:
            </p>
            <div className="flex flex-wrap gap-2">
              {["JNE", "J&T Express", "SiCepat", "Anteraja", "Ninja Express", "GoSend (Bandung)"].map((k) => (
                <span key={k} className="px-3 py-1.5 bg-surface-2 border border-border-subtle rounded-subtle text-body-sm text-text-secondary">
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Estimasi Waktu Pengiriman</h2>
            <div className="space-y-2 text-body-sm text-text-secondary">
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <span>Pulau Jawa</span>
                <span className="font-medium text-text-primary">1–2 hari kerja</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <span>Sumatera, Bali, NTB</span>
                <span className="font-medium text-text-primary">2–4 hari kerja</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <span>Kalimantan, Sulawesi</span>
                <span className="font-medium text-text-primary">3–5 hari kerja</span>
              </div>
              <div className="flex justify-between">
                <span>Papua, Maluku, NTT</span>
                <span className="font-medium text-text-primary">5–7 hari kerja</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Ongkos Kirim</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Ongkos kirim dihitung berdasarkan berat paket dan lokasi pengiriman. Gratis ongkir untuk pembelian di atas Rp 500.000 ke seluruh Pulau Jawa (berlaku promo tertentu).
            </p>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-card p-5">
            <h2 className="text-body font-bold text-text-primary mb-2">Lacak Pesanan</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed mb-3">
              Nomor resi pengiriman akan dikirimkan melalui email atau WhatsApp setelah pesanan dikirim.
            </p>
            <Link
              href="/lacak"
              className="inline-flex items-center px-4 py-2 bg-brand-black text-text-primary text-body-sm font-semibold rounded-subtle hover:bg-brand-black-hover transition-colors"
            >
              Lacak Pesanan Saya
            </Link>
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
