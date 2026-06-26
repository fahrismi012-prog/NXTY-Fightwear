"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useUI } from "@/contexts/UIContext";
import { cn } from "@/lib/utils";

const ICON_SIZE = 22;

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { openCart, openFilter, openSearch } = useUI();

  const items = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      type: "link" as const,
      href: "/",
      active: pathname === "/",
    },
    {
      key: "kategori",
      label: "Kategori",
      icon: LayoutGrid,
      type: "action" as const,
      onClick: openFilter,
    },
    {
      key: "cari",
      label: "Cari",
      icon: Search,
      type: "action" as const,
      onClick: openSearch,
    },
    {
      key: "cart",
      label: "Cart",
      icon: ShoppingBag,
      type: "action" as const,
      onClick: openCart,
      badge: totalItems,
    },
    {
      key: "akun",
      label: "Akun",
      icon: User,
      type: "link" as const,
      href: "/tentang-kami",
      active: pathname === "/tentang-kami",
    },
  ];

  return (
    <nav
      aria-label="Navigasi utama"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0a] border-t-2 border-[#dc2626] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          const content = (
            <>
              {/* Active indicator (top bar) */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 transition-colors",
                  isActive ? "bg-[#dc2626]" : "bg-transparent"
                )}
              />
              {/* Icon with badge */}
              <span className="relative">
                <Icon
                  size={ICON_SIZE}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-[#dc2626]" : "text-neutral-400"
                  )}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    aria-label={`${item.badge} item di keranjang`}
                    className="absolute -top-1.5 -right-2 bg-[#dc2626] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center border border-[#0a0a0a]"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-wide mt-1 transition-colors",
                  isActive ? "text-[#dc2626]" : "text-neutral-400"
                )}
              >
                {item.label}
              </span>
            </>
          );

          const className = cn(
            "relative flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
          );

          if (item.type === "link") {
            return (
              <li key={item.key} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className={className}
                >
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.key} className="flex-1">
              <button
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                className={className}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
