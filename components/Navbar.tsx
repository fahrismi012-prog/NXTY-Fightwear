"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useUI } from "@/contexts/UIContext";

interface NavbarProps {
  onSearch: (query: string) => void;
}

const MARQUEE_ITEMS = [
  "READY TO FIGHT",
  "GEAR UP",
  "TRAIN HARD",
  "NO MERCY",
  "BORN TO FIGHT",
  "BUILT TO LAST",
];

export default function Navbar({ onSearch }: NavbarProps) {
  const { totalItems } = useCart();
  const { openCart } = useUI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/promo", label: "PROMO" },
    { href: "/cara-order", label: "HOW TO ORDER" },
    { href: "/tentang-kami", label: "ABOUT" },
    { href: "/kontak", label: "CONTACT" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]">
      {/* Top marquee strip */}
      <div className="bg-[#dc2626] text-white overflow-hidden border-b border-[#0a0a0a]">
        <div className="flex animate-marquee whitespace-nowrap py-1.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {MARQUEE_ITEMS.map((item, j) => (
                <span
                  key={j}
                  className="px-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] flex items-center gap-5"
                >
                  {item}
                  <span className="text-[#0a0a0a] text-base leading-none">★</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main nav row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between border-b-2 border-[#dc2626]">
        {/* Mobile menu button */}
        <button
          className="md:hidden w-10 h-10 border-2 border-[#262626] flex items-center justify-center hover:bg-[#dc2626] hover:border-[#dc2626] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Brand */}
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="text-[#dc2626] font-black text-2xl tracking-tighter italic">
            NXTY
          </span>
          <span className="hidden sm:inline font-black text-sm uppercase tracking-[0.25em] text-white border-l-2 border-[#dc2626] pl-2">
            FIGHTWEAR
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-stretch h-16">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 h-full flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:bg-[#dc2626] hover:text-white border-r border-[#262626] transition-colors"
            >
              <span className="text-[#dc2626] group-hover:text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-stretch h-10">
          <button
            className="w-10 h-10 border-2 border-[#262626] flex items-center justify-center hover:bg-[#dc2626] hover:border-[#dc2626] transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Cari"
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
          <button
            className="w-10 h-10 border-2 border-[#262626] border-l-0 flex items-center justify-center relative hover:bg-[#dc2626] hover:border-[#dc2626] transition-colors"
            onClick={openCart}
            aria-label="Keranjang"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#dc2626] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center border-2 border-[#0a0a0a]">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-b-2 border-[#dc2626] px-3 sm:px-4 py-3 bg-[#0a0a0a]">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-[#dc2626] border-r-2 border-[#262626] pr-2">
              FIND
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value.trim());
              }}
              placeholder="CARI PRODUK..."
              autoFocus
              className="w-full bg-[#0a0a0a] text-white text-sm font-bold uppercase tracking-wider pl-20 pr-4 py-3 border-2 border-[#262626] focus:border-[#dc2626] focus:outline-none placeholder:text-neutral-700"
            />
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b-2 border-[#dc2626] bg-[#0a0a0a]">
          <nav className="flex flex-col">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-4 text-sm font-black uppercase tracking-[0.2em] text-white border-b border-[#262626] hover:bg-[#dc2626] transition-colors flex items-center justify-between"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <span className="text-[#dc2626] text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </span>
                <span className="text-[#dc2626] text-lg leading-none">→</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
