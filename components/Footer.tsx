"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Footer — mengikuti pola Venum:
 * 1. Newsletter strip
 * 2. Hubungi Kami
 * 3. 3 kolom link: Akun Saya · Tentang Kami · Bantuan
 * 4. Bottom bar: legal + copyright
 */

const COLUMNS = [
  {
    title: "Akun Saya",
    links: [
      { href: "/akun", label: "Profil Saya" },
      { href: "/akun/pesanan", label: "Pesanan Saya" },
      { href: "/akun/alamat", label: "Alamat Pengiriman" },
      { href: "/#categories", label: "Kategori" },
      { href: "/lacak", label: "Lacak Pesanan" },
    ],
  },
  {
    title: "Tentang Kami",
    links: [
      { href: "/tentang-kami", label: "Tentang Anxiety Fightwear" },
      { href: "/b2b", label: "B2B / Grosir" },
      { href: "/kontak", label: "Kontak" },
      { href: "/cara-order", label: "Cara Berbelanja" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { href: "/cara-order", label: "Cara Order" },
      { href: "/metode-pembayaran", label: "Metode Pembayaran" },
      { href: "/kebijakan-pengiriman", label: "Kebijakan Pengiriman" },
      { href: "/kebijakan-pengembalian", label: "Kebijakan Pengembalian" },
      { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
      { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <footer className="bg-canvas border-t border-border-subtle">

      {/* 1. Newsletter */}
      <div className="border-b border-border-subtle">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h3 className="text-body-lg font-bold text-text-primary mb-2">
            Newsletter Anxiety Fightwear
          </h3>
          <p className="text-body-sm text-text-secondary mb-6 leading-relaxed">
            Daftar newsletter kami untuk mendapatkan info produk terbaru, drop koleksi, dan penawaran eksklusif.
          </p>
          {submitted ? (
            <p className="text-body-sm text-brand-green font-semibold">
              Terima kasih! Anda telah berlangganan newsletter kami.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat Email"
                required
                className={cn(
                  "w-full bg-transparent border-b border-border-default",
                  "text-body-sm text-text-primary placeholder:text-text-muted",
                  "py-2.5 outline-none",
                  "focus:border-text-primary transition-colors duration-fast"
                )}
              />
              <button
                type="submit"
                className={cn(
                  "relative w-full sm:max-w-xs py-3.5",
                  "border border-text-primary text-text-primary",
                  "text-body-sm font-semibold text-center",
                  "hover:bg-white hover:text-canvas",
                  "transition-colors duration-fast",
                  "[clip-path:polygon(0_0,calc(100%-12px)_0,100%_100%,12px_100%)]",
                  "focus-visible:outline-none"
                )}
              >
                Berlangganan
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 2. Hubungi Kami */}
      <div className="border-b border-border-subtle">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h3 className="text-body-lg font-bold text-text-primary mb-2">
            Hubungi Kami
          </h3>
          <p className="text-body-sm text-text-secondary mb-5">
            Butuh saran atau informasi? Hubungi kami.
          </p>
          <div className="flex flex-col gap-3 pl-2">
            <a
              href="mailto:anxietyfightwear@gmail.com"
              className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              anxietyfightwear@gmail.com
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              +62 812-3456-7890
            </a>
            <p className="text-body-sm text-text-secondary">
              Senin – Jumat: 09.00 – 17.00 WIB
            </p>
            <p className="text-body-sm text-text-secondary">
              Sabtu: 09.00 – 14.00 WIB
            </p>
          </div>
        </div>
      </div>

      {/* 3. Kolom link */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-6 md:gap-x-16">
          {COLUMNS.map((col) => (
            <FooterColumn key={col.title} column={col} />
          ))}
        </div>
      </div>

      {/* 4. Bottom bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-caption text-text-muted">
            © {new Date().getFullYear()} Anxiety Fightwear. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-caption text-text-muted">
            <Link href="/kebijakan-privasi" className="hover:text-text-primary transition-colors">
              Kebijakan Privasi
            </Link>
            <span aria-hidden>·</span>
            <Link href="/syarat-ketentuan" className="hover:text-text-primary transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}

interface FooterColumnProps {
  column: { title: string; links: { href: string; label: string }[] };
}

function FooterColumn({ column }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-body-sm font-bold text-text-primary mb-4">
        {column.title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {column.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-body-sm text-text-secondary hover:text-text-primary transition-colors duration-fast"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
