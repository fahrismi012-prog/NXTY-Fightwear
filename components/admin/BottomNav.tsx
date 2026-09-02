"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const ICON_SIZE = 22;

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: Package },
  { label: "Promo", href: "/admin/promo", icon: Tag },
  { label: "Pesanan", href: "/admin/pesanan", icon: ShoppingBag },
  { label: "Notif", href: "/admin/notifikasi", icon: Bell },
];

export default function AdminBottomNav() {
  const pathname = usePathname();
  const unread = useUnreadCount("/api/admin/notifications");

  return (
    <nav
      aria-label="Navigasi admin"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-black pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className="relative flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 transition-colors",
                    active ? "bg-black" : "bg-transparent",
                  )}
                />
                <span className="relative">
                  <Icon
                    size={ICON_SIZE}
                    strokeWidth={active ? 2.5 : 2}
                    className={cn(
                      "transition-colors",
                      active ? "text-black" : "text-neutral-400",
                    )}
                  />
                  {item.href === "/admin/notifikasi" && unread > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-[#dc2626] text-white text-[9px] font-black rounded-full">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wide mt-1 transition-colors",
                    active ? "text-black" : "text-neutral-400",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
