"use client";

import Link from "next/link";
import { ChevronLeft, Search, ShoppingCart, CreditCard, Truck, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Cari Produk",
    description: "Jelajahi katalog kami. Gunakan fitur pencarian atau filter kategori untuk menemukan produk yang kamu butuhkan.",
  },
  {
    icon: ShoppingCart,
    title: "Tambah ke Keranjang",
    description: "Pilih varian ukuran dan warna, tentukan jumlah, lalu klik 'Masukkan Keranjang'. Keranjang akan tersimpan otomatis.",
  },
  {
    icon: CreditCard,
    title: "Checkout & Bayar",
    description: "Isi data pengiriman di halaman checkout, pilih metode pembayaran, lalu klik 'Bayar Sekarang'.",
  },
  {
    icon: Truck,
    title: "Pengiriman",
    description: "Setelah pembayaran terkonfirmasi, kami akan memproses dan mengirim pesanan ke alamat kamu.",
  },
  {
    icon: CheckCircle,
    title: "Terima & Ulas",
    description: "Terima paket, cek kondisi produk, dan berikan ulasan untuk membantu komunitas petarung lainnya.",
  },
];

export default function caraOrderPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="sticky top-0 z-30 bg-canvas border-b border-border-subtle">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
          <Link href="/" className="p-3 -ml-2">
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <h1 className="text-sm font-bold text-text-primary">cara order</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-text-muted mb-8 text-center leading-relaxed">
          Berikut panduan sederhana untuk berbelanja di Anxiety Fightwear.
        </p>

        <div className="flex flex-col gap-4">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-surface-1 border border-border-subtle rounded-xl p-4 flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-600/10 rounded-full flex items-center justify-center">
                <step.icon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-red-600 text-text-primary px-1.5 py-0.5 rounded">{idx + 1}</span>
                  <h3 className="text-sm font-bold text-text-primary">{step.title}</h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-text-primary text-sm font-bold rounded-xl transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
