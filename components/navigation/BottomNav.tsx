"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, LayoutGrid, Tag, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useUI } from "@/contexts/UIContext";
import { getCurrentUser, onAuthStateChange } from "@/lib/supabase/customer";
import { cn } from "@/lib/utils";

/**
 * BottomNav baru — 5 tab dengan tap target 44×44, label mixed case.
 *
 * Bug fix: tab Akun sekarang routing dinamis berdasarkan auth state
 * (sebelumnya hardcoded ke /tentang-kami).
 *
 * Hide pada route: /admin/*, /checkout, /payment/*.
 */

const ICON_SIZE = 22;

interface BaseTab {
  key: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}

interface LinkTab extends BaseTab {
  type: "link";
  href: string;
}

interface ActionTab extends BaseTab {
  type: "action";
  onClick: () => void;
}

type Tab = LinkTab | ActionTab;

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems: cartCount } = useCart();
  const { openCart, openFilter } = useUI();
  const [accountHref, setAccountHref] = useState("/masuk");

  // Resolve account href based on auth state
  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((user) => {
      if (mounted) {
        setAccountHref(user ? "/akun" : "/masuk");
      }
    });
    const subscription = onAuthStateChange((user) => {
      if (mounted) setAccountHref(user ? "/akun" : "/masuk");
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Hide pada route transactional & admin
  const shouldHide =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/payment");
  if (shouldHide) return null;

  const tabs: Tab[] = [
    {
      key: "beranda",
      label: "Beranda",
      icon: Home,
      type: "link",
      href: "/",
    },
    {
      key: "belanja",
      label: "Belanja",
      icon: LayoutGrid,
      type: "action",
      // Sementara pakai openFilter (existing). Akan diganti openMegaMenu di task M3.5.
      onClick: openFilter,
    },
    {
      key: "kategori",
      label: "Kategori",
      icon: Tag,
      type: "link",
      href: "/#categories",
    },
    {
      key: "keranjang",
      label: "Keranjang",
      icon: ShoppingBag,
      type: "action",
      onClick: openCart,
      badge: cartCount,
    },
    {
      key: "akun",
      label: "Akun",
      icon: User,
      type: "link",
      href: accountHref,
    },
  ];

  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-30",
        "bg-canvas border-t border-border-subtle",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <ul className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.type === "link" &&
            (tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href));
          const showBadge =
            typeof tab.badge === "number" && tab.badge > 0;

          const inner = (
            <span
              className={cn(
                "relative flex flex-col items-center justify-center",
                "h-full w-full",
                "active:scale-95 transition-transform duration-fast"
              )}
            >
              <span className="relative inline-flex">
                <Icon
                  size={ICON_SIZE}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={cn(
                    "transition-colors duration-fast",
                    isActive ? "text-brand-green" : "text-text-secondary"
                  )}
                  aria-hidden
                />
                {showBadge && (
                  <span
                    aria-label={`${tab.badge} item`}
                    className={cn(
                      "absolute -top-1 -right-2",
                      "min-w-[16px] h-4 px-1",
                      "bg-brand-green text-white",
                      "rounded-full ring-2 ring-canvas",
                      "text-[10px] font-bold leading-none",
                      "inline-flex items-center justify-center"
                    )}
                  >
                    {tab.badge && tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "mt-1 text-[11px] font-medium",
                  "transition-colors duration-fast",
                  isActive ? "text-brand-green" : "text-text-secondary"
                )}
              >
                {tab.label}
              </span>
              {/* Active dot indicator */}
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-1 left-1/2 -translate-x-1/2",
                  "w-1 h-1 rounded-full",
                  "transition-opacity duration-fast",
                  isActive
                    ? "bg-brand-green opacity-100"
                    : "bg-transparent opacity-0"
                )}
              />
            </span>
          );

          return (
            <li key={tab.key} className="flex-1">
              {tab.type === "link" ? (
                <Link
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={tab.label}
                  className={cn(
                    "flex items-center justify-center h-full w-full",
                    "min-h-[44px] min-w-[44px]",
                    "focus-visible:outline-none focus-visible:bg-surface-1"
                  )}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={tab.onClick}
                  aria-label={tab.label}
                  className={cn(
                    "flex items-center justify-center h-full w-full",
                    "min-h-[44px] min-w-[44px]",
                    "focus-visible:outline-none focus-visible:bg-surface-1"
                  )}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
