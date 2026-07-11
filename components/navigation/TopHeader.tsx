"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Heart } from "lucide-react";
import { IconButton } from "@/components/ui";
import { UserMenu } from "./UserMenu";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useUI } from "@/contexts/UIContext";
import { useBrand } from "@/contexts/BrandContext";
import { cn } from "@/lib/utils";

/**
 * TopHeader — header utama menggantikan Navbar lama.
 *
 * Mobile (56px): logo + search field persisten + cart icon
 * Desktop (72px): logo full + nav links + search/wishlist/user/cart icons
 *
 * Behavior:
 * - Sticky top dengan backdrop-blur saat scroll > 8px
 * - Auto-hide on scroll down > 80px, show on scroll up (skip jika halaman pendek)
 * - Search field mobile langsung tap-able → membuka MobileSearchSheet
 */

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/tentang-kami", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
];

export function TopHeader() {
  const pathname = usePathname();
  const { brandName, logoUrl, logoInvert } = useBrand();
  const logoClass = logoInvert ? "brightness-0 invert" : "";
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount, hydrated: wishlistHydrated } =
    useWishlist();
  const { openCart, openSearch } = useUI();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Don't render header pada admin
  const isAdmin = pathname?.startsWith("/admin");

  // Scroll behavior
  useEffect(() => {
    if (isAdmin) return;
    let lastScrollY = 0;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      const shouldHide =
        currentY > 80 &&
        currentY > lastScrollY &&
        // skip hide pada halaman pendek
        document.documentElement.scrollHeight > window.innerHeight * 2;
      setScrolled(currentY > 8);
      setHidden(shouldHide);
      lastScrollY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAdmin]);

  if (isAdmin) return null;

  const handleMobileSearchTap = () => {
    openSearch();
  };

  const handleDesktopSearchClick = () => {
    // Untuk fase 1, pakai mobile sheet sebagai placeholder.
    // SearchModal desktop dedicated akan dibuat di task M3.6.
    openSearch();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "transition-transform duration-slow",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div
        className={cn(
          "border-b transition-colors duration-fast",
          scrolled
            ? "bg-brand-black backdrop-blur-md border-brand-black-hover shadow-md"
            : "bg-brand-black border-brand-black"
        )}
      >
        {/* Mobile (56px) */}
        <div className="md:hidden h-14 px-4 flex items-center gap-3">
          <Link
            href="/"
            aria-label={`${brandName}, beranda`}
            className="shrink-0 flex items-center"
          >
            <Image
              src={logoUrl}
              alt={brandName}
              width={395}
              height={129}
              priority
              className={`h-8 w-auto object-contain ${logoClass}`}
            />
          </Link>

          {/* Search field persisten (mobile) */}
          <button
            type="button"
            onClick={handleMobileSearchTap}
            aria-label="Cari produk"
            className={cn(
              "flex-1 h-10 inline-flex items-center gap-2 px-3",
              "bg-white/20 border border-white/30",
              "rounded-subtle",
              "text-white/80 text-body-sm",
              "hover:bg-white/30",
              "transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            )}
          >
            <Search size={16} className="shrink-0 text-white/70" aria-hidden />
            <span className="truncate text-white/70">Cari produk...</span>
          </button>

          <IconButton
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="ghost"
            size="lg"
            aria-label="Keranjang"
            badge={cartCount}
            onClick={openCart}
            className="text-white hover:bg-white/20"
          />
        </div>

        {/* Desktop (72px) */}
        <div className="hidden md:flex h-[4.5rem] px-8 max-w-7xl mx-auto items-center">
          <Link
            href="/"
            aria-label={`${brandName}, beranda`}
            className="shrink-0 flex items-center"
          >
            <Image
              src={logoUrl}
              alt={brandName}
              width={395}
              height={129}
              priority
              className={`h-10 w-auto object-contain ${logoClass}`}
            />
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="flex-1 flex items-center gap-2 ml-6"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center h-10 px-3",
                    "text-body-sm font-medium",
                    "rounded-subtle",
                    "transition-colors duration-fast",
                    isActive
                      ? "text-white font-semibold bg-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/20"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <IconButton
              icon={<Search className="w-5 h-5" />}
              variant="ghost"
              size="lg"
              aria-label="Cari produk"
              onClick={handleDesktopSearchClick}
              className="text-white hover:bg-white/20"
            />
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={cn(
                "relative inline-flex items-center justify-center w-11 h-11",
                "text-white/80 hover:text-white hover:bg-white/20",
                "rounded-subtle",
                "transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              )}
            >
              <Heart className="w-5 h-5" aria-hidden />
              {wishlistHydrated && wishlistCount > 0 && (
                <span
                  aria-label={`${wishlistCount} item`}
                  className={cn(
                    "absolute -top-1 -right-1",
                    "min-w-[18px] h-[18px] px-1",
                    "bg-brand-red text-white",
                    "rounded-full ring-2 ring-canvas",
                    "text-[10px] font-bold leading-none",
                    "inline-flex items-center justify-center"
                  )}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
            <UserMenu />
            <IconButton
              icon={<ShoppingCart className="w-5 h-5" />}
              variant="ghost"
              size="lg"
              aria-label="Keranjang"
              badge={cartCount}
              onClick={openCart}
              className="text-white hover:bg-white/20"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
