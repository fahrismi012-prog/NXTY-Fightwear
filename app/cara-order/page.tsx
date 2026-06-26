"use client";

import Link from "next/link";
import { ChevronLeft, Search, ShoppingCart, CreditCard, Truck, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Cari Produk",
    description: "Jelajahi katalog kami. Gunakan fitur pencarian atau filter kategori untuk menemukan gear yang kamu butuhkan.",
  },
  {
    icon: ShoppingCart,
    title: "Tambah ke Keranjang",
    description: "Pilih varian ukuran dan warna, tentukan jumlah, lalu klik 'Tambah ke Keranjang'. Cart akan otomatis persist.",
  },
  {
    icon: CreditCard,
    title: "Checkout & Bayar",
    description: "Isi data pengiriman di halaman checkout, pilih metode pembayaran, dan klik 'Bayar Sekarang'.",
  },
  {
    icon: Truck,
    title: "Pengiriman",
    description: "Setelah pembayaran terkonfirmasi, kami akan memproses dan mengirim pesanan ke alamat kamu.",
  },
  {
    icon: CheckCircle,
    title: "Terima & Review",
    description: "Terima paket, cek kondisi produk, dan berikan ulasan untuk membantu komunitas fighter lainnya.",
  },
];

export default function caraOrderPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-[#262626]">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
          <Link href="/" className="p-3 -ml-2">
            <ChevronLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <h1 className="text-sm font-bold text-white">cara order</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-neutral-400 mb-8 text-center leading-relaxed">
          Berikut panduan sederhana untuk berbelanja di NXTY Fightwear.
        </p>

        <div className="flex flex-col gap-4">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-[#161616] border border-[#262626] rounded-xl p-4 flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-600/10 rounded-full flex items-center justify-center">
                <step.icon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">{idx + 1}</span>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
