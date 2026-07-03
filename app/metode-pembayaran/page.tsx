import Link from "next/link";

export const metadata = {
  title: "Metode Pembayaran — Anxiety Fightwear",
  description: "Informasi metode pembayaran yang tersedia di Anxiety Fightwear.",
};

const PAYMENT_GROUPS = [
  {
    title: "Transfer Bank",
    methods: ["BCA", "BNI", "Mandiri", "BRI"],
  },
  {
    title: "Dompet Digital",
    methods: ["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja"],
  },
  {
    title: "QRIS",
    methods: ["Semua aplikasi yang mendukung QRIS"],
  },
  {
    title: "Bayar di Tempat (COD)",
    methods: ["Tersedia untuk area Bandung dan sekitarnya"],
  },
];

export default function MetodePembayaranPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-caption font-semibold uppercase tracking-widest text-brand-black mb-2">Informasi</p>
        <h1 className="text-heading-1 font-bold text-text-primary mb-3">Metode Pembayaran</h1>
        <p className="text-body text-text-secondary leading-relaxed mb-8">
          Anxiety Fightwear menerima berbagai metode pembayaran untuk kemudahan transaksi Anda.
        </p>

        <div className="space-y-4 mb-10">
          {PAYMENT_GROUPS.map((group) => (
            <div key={group.title} className="bg-surface-1 border border-border-subtle rounded-card p-5">
              <h2 className="text-body font-bold text-text-primary mb-3">{group.title}</h2>
              <div className="flex flex-wrap gap-2">
                {group.methods.map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 bg-surface-2 border border-border-subtle rounded-subtle text-body-sm text-text-secondary"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface-1 border border-border-subtle rounded-card p-5 mb-8">
          <h2 className="text-body font-bold text-text-primary mb-2">Konfirmasi Pembayaran</h2>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            Setelah melakukan transfer bank, harap konfirmasi pembayaran melalui WhatsApp atau email kami dengan menyertakan bukti transfer dan nomor pesanan.
          </p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-body-sm text-text-muted hover:text-text-primary transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
