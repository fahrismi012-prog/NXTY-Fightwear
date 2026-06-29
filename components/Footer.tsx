"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Footer — multi-kolom desktop, accordion mobile.
 *
 * Kolom: Belanja · Bantuan · Perusahaan · Newsletter.
 * Strip bawah: sosial media · payment logos · legal links.
 */

interface FooterLink {
  href: string;
  label: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "Belanja",
    links: [
      { href: "/", label: "Semua Produk" },
      { href: "/promo", label: "Promo" },
      { href: "/?sort=best", label: "Best Sellers" },
      { href: "/?sort=new", label: "Produk Baru" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { href: "/cara-order", label: "Cara Order" },
      { href: "/kontak", label: "Pengiriman" },
      { href: "/kontak", label: "Pengembalian" },
      { href: "/kontak", label: "Size Guide" },
      { href: "/kontak", label: "FAQ" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { href: "/tentang-kami", label: "Tentang Kami" },
      { href: "/kontak", label: "Kontak" },
      { href: "/lacak", label: "Lacak Pesanan" },
    ],
  },
];

const PAYMENT_METHODS = [
  "BCA",
  "BNI",
  "Mandiri",
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "QRIS",
  "COD",
];

const SOCIAL_LINKS = [
  {
    href: "https://instagram.com/anxietyfightwear",
    label: "Instagram",
    icon: InstagramIcon,
  },
  {
    href: "https://tiktok.com/@anxietyfightwear",
    label: "TikTok",
    icon: TikTokIcon,
  },
  {
    href: "https://youtube.com/@anxietyfightwear",
    label: "YouTube",
    icon: YouTubeIcon,
  },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M23 7.5s-.2-1.5-.8-2.2c-.7-.8-1.6-.8-2-.9C17.4 4.2 12 4.2 12 4.2s-5.4 0-8.2.2c-.4 0-1.2 0-2 .9C1.2 6 1 7.5 1 7.5S.7 9.3.7 11.2v1.6c0 1.9.3 3.7.3 3.7s.2 1.5.8 2.2c.7.8 1.7.8 2.1.9 1.6.2 6.8.2 8.1.2 0 0 5.4 0 8.2-.2.4 0 1.3 0 2-.9.6-.7.8-2.2.8-2.2s.3-1.8.3-3.7v-1.6c0-1.9-.3-3.7-.3-3.7zM9.7 14.6V8.4l5.5 3.1-5.5 3.1z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  // Inline simplified TikTok glyph (note mark) — vector path simple.
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-canvas border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-6">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {/* Brand block — always visible */}
          <div className="md:col-span-4">
            <Link
              href="/"
              aria-label="NXTY Fightwear"
              className="inline-flex items-center gap-2 mb-4"
            >
              <Image
                src="/brand/logo-mark.png"
                alt="NXTY Fightwear"
                width={395}
                height={129}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-body-sm text-text-secondary leading-relaxed max-w-xs">
              Dibuat untuk atlet combat sports dan pencak silat. Diproduksi di
              Bandung sejak 2014.
            </p>
          </div>

          {/* Link columns — desktop grid, mobile accordion */}
          <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {COLUMNS.map((col) => (
              <FooterColumnBlock key={col.title} column={col} />
            ))}
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3">
            <NewsletterSignup layout="stacked" />
          </div>
        </div>

        {/* Trust strip — payment logos */}
        <div className="mt-10 pt-6 border-t border-border-subtle">
          <Eyebrow className="mb-3">Pembayaran diterima</Eyebrow>
          <div className="overflow-x-auto scrollbar-hide -mx-1">
            <div className="inline-flex items-center gap-2 px-1 min-w-max">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "px-3 h-9 shrink-0",
                    "bg-surface-1 border border-border-subtle",
                    "rounded-subtle",
                    "text-caption font-semibold text-text-secondary tracking-wide"
                  )}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip — social + legal */}
        <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(
                  "inline-flex items-center justify-center w-11 h-11",
                  "text-text-secondary hover:text-brand-red",
                  "rounded-subtle",
                  "transition-colors duration-fast",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                )}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-text-muted">
            <Link
              href="/kontak"
              className="hover:text-text-primary transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/kontak"
              className="hover:text-text-primary transition-colors"
            >
              Syarat & Ketentuan
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/kontak"
              className="hover:text-text-primary transition-colors"
            >
              Kebijakan Pengembalian
            </Link>
            <span className="ml-0 md:ml-2">
              © {new Date().getFullYear()} NXTY Fightwear
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnBlockProps {
  column: FooterColumn;
}

function FooterColumnBlock({ column }: FooterColumnBlockProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-border-subtle md:border-b-0 pb-3 md:pb-0">
      {/* Mobile: accordion header */}
      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        aria-expanded={expanded}
        className="md:hidden w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-body-sm font-semibold text-text-primary">
          {column.title}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-text-muted transition-transform duration-fast",
            expanded && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {/* Desktop: static heading */}
      <h3 className="hidden md:block text-body-sm font-semibold text-text-primary mb-4">
        {column.title}
      </h3>

      <ul
        className={cn(
          "flex flex-col gap-2.5 md:flex pb-2",
          !expanded && "hidden md:flex"
        )}
      >
        {column.links.map((link) => (
          <li key={link.label + link.href}>
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

// Internal TikTokIcon is co-located above and used only within this file.
