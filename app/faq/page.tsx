"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Berapa lama pengiriman ke luar Jawa?",
    a: "Pengiriman ke Sumatera dan Bali biasanya 2–4 hari kerja, Kalimantan dan Sulawesi 3–5 hari kerja, Papua dan Maluku 5–7 hari kerja. Estimasi bisa berbeda tergantung kurir dan kondisi.",
  },
  {
    q: "Apakah ada garansi produk?",
    a: "Ya, semua produk Anxiety Fightwear bergaransi cacat produksi selama 7 hari setelah diterima. Jika ada cacat, segera hubungi kami dengan foto produk dan nomor pesanan.",
  },
  {
    q: "Bagaimana cara memilih ukuran yang tepat?",
    a: "Setiap produk memiliki panduan ukuran di halaman detailnya. Jika ragu, hubungi kami via WhatsApp dan kami akan membantu menentukan ukuran yang paling sesuai.",
  },
  {
    q: "Apakah bisa melakukan penukaran ukuran?",
    a: "Bisa, selama produk belum dipakai dan masih dalam kemasan asli dalam 7 hari setelah diterima. Ongkos kirim penukaran ditanggung pembeli.",
  },
  {
    q: "Apakah ada program reseller atau grosir?",
    a: "Tentu! Kami memiliki program B2B untuk gym, perguruan bela diri, dan reseller. Kunjungi halaman B2B atau hubungi kami langsung untuk info lebih lanjut.",
  },
  {
    q: "Produk ini buatan Indonesia?",
    a: "Ya, semua produk Anxiety Fightwear diproduksi di pabrik kami sendiri di Bandung, Jawa Barat, sejak tahun 2014.",
  },
  {
    q: "Bagaimana cara melacak pesanan saya?",
    a: "Setelah pesanan dikirim, Anda akan mendapat nomor resi melalui email/WhatsApp. Gunakan fitur Lacak Pesanan di website kami atau langsung cek di website kurir.",
  },
  {
    q: "Apakah bisa COD (bayar di tempat)?",
    a: "COD tersedia untuk area Bandung dan sekitarnya. Untuk wilayah lain, kami menggunakan layanan COD dari kurir seperti JNE dan J&T yang mendukung layanan tersebut.",
  },
  {
    q: "Bagaimana cara menghubungi customer service?",
    a: "Anda bisa menghubungi kami melalui email anxietyfightwear@gmail.com atau WhatsApp +62 812-3456-7890 pada hari Senin–Jumat pukul 09.00–17.00 WIB.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-body-sm font-semibold text-text-primary">{q}</span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 text-text-muted transition-transform duration-fast", open && "rotate-180")}
        />
      </button>
      {open && (
        <p className="pb-4 text-body-sm text-text-secondary leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-caption font-semibold uppercase tracking-widest text-brand-green mb-2">Bantuan</p>
        <h1 className="text-heading-1 font-bold text-text-primary mb-3">FAQ</h1>
        <p className="text-body text-text-secondary leading-relaxed mb-8">
          Pertanyaan yang sering ditanyakan. Tidak menemukan jawaban? Hubungi kami langsung.
        </p>

        <div className="mb-10">
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <div className="bg-surface-1 border border-border-subtle rounded-card p-5 text-center mb-8">
          <p className="text-body-sm text-text-secondary mb-3">Masih ada pertanyaan?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:anxietyfightwear@gmail.com"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-green text-text-primary text-body-sm font-semibold rounded-subtle hover:bg-brand-green-hover transition-colors"
            >
              Email Kami
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-border-default text-text-secondary text-body-sm font-semibold rounded-subtle hover:border-brand-green hover:text-brand-green transition-colors"
            >
              WhatsApp
            </a>
          </div>
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
