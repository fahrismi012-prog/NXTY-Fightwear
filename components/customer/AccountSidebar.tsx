"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  User,
  Package,
  MapPin,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useUnreadCount";

interface AccountSidebarProps {
  email: string | null;
  fullName: string | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  match: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Profil",
    href: "/akun",
    icon: User,
    match: (p) => p === "/akun",
  },
  {
    label: "Pesanan Saya",
    href: "/akun/pesanan",
    icon: Package,
    match: (p) => p.startsWith("/akun/pesanan"),
  },
  {
    label: "Notifikasi",
    href: "/akun/notifikasi",
    icon: Bell,
    match: (p) => p.startsWith("/akun/notifikasi"),
  },
  {
    label: "Alamat Saya",
    href: "/akun/alamat",
    icon: MapPin,
    match: (p) => p.startsWith("/akun/alamat"),
  },
];

/**
 * Sidebar navigasi untuk halaman customer (/akun).
 * - Desktop: sidebar sticky vertikal dengan active indicator (border accent)
 * - Mobile: collapsible sheet/overlay via hamburger button di header
 */
export default function AccountSidebar({ email, fullName }: AccountSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const unread = useUnreadCount("/api/customer/notifications");

  const initials = (fullName?.trim() || email || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeLabel =
    NAV_ITEMS.find((i) => i.match(pathname))?.label ?? "Akun";

  function handleLogout() {
    // Submit POST ke /api/customer/logout (form action standard)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/customer/logout";
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <>
      {/* Mobile: hamburger button di header */}
      <div className="md:hidden mb-4 flex items-center justify-between gap-3 bg-surface-1 border border-border-subtle rounded-subtle px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center text-sm font-black shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">
              {fullName || email || "Akun Saya"}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              {activeLabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          className="w-10 h-10 flex items-center justify-center border border-border-subtle hover:border-brand-black hover:bg-black hover:text-white transition-colors shrink-0"
        >
          <Menu size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-surface-1 shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <p className="text-xs font-black uppercase tracking-widest text-text-primary">
                Menu Akun
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="w-9 h-9 flex items-center justify-center hover:bg-surface-2"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  active={item.match(pathname)}
                  badge={item.href === "/akun/notifikasi" ? unread : 0}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <div className="p-3 border-t border-border-subtle">
              {!showLogoutConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-700 bg-white border border-border-subtle hover:border-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LogOut size={16} strokeWidth={2.5} />
                    Logout
                  </span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-text-muted">Yakin ingin logout?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 px-3 py-2 text-xs font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Ya, Logout
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 px-3 py-2 text-xs font-black uppercase tracking-wider border border-border-subtle hover:border-black"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop: sidebar sticky vertikal */}
      <aside className="hidden md:block md:w-64 shrink-0">
        <nav className="sticky top-20 bg-surface-1 border border-border-subtle rounded-subtle p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            Akun Saya
          </p>
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              active={item.match(pathname)}
              badge={item.href === "/akun/notifikasi" ? unread : 0}
            />
          ))}

          <div className="pt-3 mt-3 border-t border-border-subtle">
            {!showLogoutConfirm ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-red-700 bg-transparent hover:bg-red-50 transition-colors rounded-subtle"
              >
                <span className="flex items-center gap-2.5">
                  <LogOut size={16} strokeWidth={2.5} />
                  Logout
                </span>
              </button>
            ) : (
              <div className="p-2 bg-red-50 border border-red-200 rounded-subtle space-y-2">
                <p className="text-[11px] text-text-secondary px-1">Yakin logout?</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 px-2 py-2 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Ya
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-2 py-2 text-[10px] font-black uppercase tracking-wider border border-border-subtle hover:border-black transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({
  item,
  active,
  badge = 0,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-subtle transition-all duration-150 group",
        active
          ? "bg-brand-black text-white"
          : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
      )}
    >
      <span className="flex items-center gap-2.5">
        <Icon
          size={16}
          strokeWidth={2.5}
          className={active ? "text-white" : "text-text-muted group-hover:text-text-primary"}
        />
        <span className="text-xs font-black uppercase tracking-wider">
          {item.label}
        </span>
      </span>
      {badge > 0 ? (
        <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#dc2626] text-white text-[10px] font-black rounded-full shrink-0">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : active ? (
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
      ) : null}
    </Link>
  );
}
