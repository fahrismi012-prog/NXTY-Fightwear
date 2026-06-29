"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { User, LogOut, Package, MapPin } from "lucide-react";
import { IconButton } from "@/components/ui";
import {
  getCurrentUser,
  onAuthStateChange,
  signOut,
} from "@/lib/supabase/customer";
import { cn } from "@/lib/utils";

/**
 * UserMenu — dropdown panel untuk user actions di TopHeader desktop.
 *
 * - Guest: hanya link "Masuk"
 * - Logged in: email + Akun + Pesanan + Alamat + Logout
 *
 * Mobile pakai BottomNav tab Akun untuk routing langsung (tanpa dropdown).
 */

interface CurrentUser {
  email?: string;
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync auth state
  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => {
      if (mounted) setUser(u ?? null);
    });
    const subscription = onAuthStateChange((u) => {
      if (mounted) setUser(u ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={containerRef} className="relative">
      <IconButton
        icon={<User className="w-5 h-5" />}
        variant="ghost"
        size="lg"
        aria-label={user ? "Menu akun" : "Masuk"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      />

      {open && (
        <div
          role="menu"
          aria-label="Menu akun"
          className={cn(
            "absolute right-0 top-full mt-2 w-56 z-50",
            "bg-canvas border border-border-default",
            "rounded-card shadow-lg",
            "overflow-hidden"
          )}
        >
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-border-subtle">
                <p className="text-caption text-text-muted">Login sebagai</p>
                <p className="text-body-sm font-semibold text-text-primary truncate">
                  {user.email}
                </p>
              </div>
              <MenuLink
                href="/akun"
                icon={<User className="w-4 h-4" />}
                onClick={() => setOpen(false)}
              >
                Akun Saya
              </MenuLink>
              <MenuLink
                href="/akun/pesanan"
                icon={<Package className="w-4 h-4" />}
                onClick={() => setOpen(false)}
              >
                Pesanan Saya
              </MenuLink>
              <MenuLink
                href="/akun/alamat"
                icon={<MapPin className="w-4 h-4" />}
                onClick={() => setOpen(false)}
              >
                Alamat Saya
              </MenuLink>
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left",
                  "text-body-sm font-medium text-error-500",
                  "border-t border-border-subtle",
                  "hover:bg-surface-1 transition-colors duration-fast"
                )}
              >
                <LogOut className="w-4 h-4" aria-hidden />
                Logout
              </button>
            </>
          ) : (
            <MenuLink
              href="/masuk"
              icon={<User className="w-4 h-4" />}
              onClick={() => setOpen(false)}
            >
              Masuk
            </MenuLink>
          )}
        </div>
      )}
    </div>
  );
}

interface MenuLinkProps {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}

function MenuLink({ href, icon, onClick, children }: MenuLinkProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "text-body-sm font-medium text-text-primary",
        "hover:bg-surface-1 transition-colors duration-fast"
      )}
    >
      <span aria-hidden className="text-text-muted">
        {icon}
      </span>
      {children}
    </Link>
  );
}
