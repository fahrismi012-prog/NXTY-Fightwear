"use client";

import { usePathname } from "next/navigation";
import { TopHeader } from "./navigation/TopHeader";
import { BottomNav } from "./navigation/BottomNav";
import { MegaMenuSheet } from "./navigation/MegaMenuSheet";
import { MobileSearchSheet } from "./navigation/MobileSearchSheet";
import { SearchModal } from "./navigation/SearchModal";
import { Footer } from "./Footer";
import PromoTopBar from "./PromoTopBar";
import WhatsAppFloat from "./WhatsAppFloat";
import CartDrawer from "./CartDrawer";
import MobileFilterSheet from "./MobileFilterSheet";
import { useUI } from "@/contexts/UIContext";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — wrapper untuk semua route storefront.
 *
 * Route-based visibility:
 * - /admin/*                       → no header/footer/nav (admin punya layout sendiri)
 * - /checkout, /payment/*          → TopHeader only (no Footer, no BottomNav untuk fokus konversi)
 * - public lainnya                 → TopHeader + Footer + BottomNav + overlay layer
 */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isCheckoutFlow =
    (pathname?.startsWith("/checkout") ?? false) ||
    (pathname?.startsWith("/payment") ?? false);

  const { cartOpen, closeCart, filterOpen, closeFilter } = useUI();

  // Admin layout entirely separate
  if (isAdminRoute) {
    return <>{children}</>;
  }

  const showShell = !isCheckoutFlow;

  return (
    <>
      {showShell && <PromoTopBar />}
      <TopHeader />

      <main className={showShell ? "min-h-screen pb-16 md:pb-0" : "min-h-screen"}>
        {children}
      </main>

      {showShell && <Footer />}
      {showShell && <BottomNav />}
      {showShell && <WhatsAppFloat />}

      {/* Overlay layer */}
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
      <MegaMenuSheet />
      <MobileSearchSheet />
      <SearchModal />
      <MobileFilterSheet isOpen={filterOpen} onClose={closeFilter} />
    </>
  );
}
