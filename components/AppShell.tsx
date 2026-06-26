"use client";

import { useUI } from "@/contexts/UIContext";
import BottomNav from "./BottomNav";
import CartDrawer from "./CartDrawer";
import MobileFilterSheet from "./MobileFilterSheet";
import MobileSearchSheet from "./MobileSearchSheet";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Wrapper yang mount BottomNav (mobile), CartDrawer, dan mobile sheets.
 * State modal dikelola oleh UIContext (global).
 * BottomNav disembunyikan saat modal terbuka.
 */
export default function AppShell({ children }: AppShellProps) {
  const {
    cartOpen,
    filterOpen,
    searchOpen,
    closeCart,
    closeFilter,
    closeSearch,
  } = useUI();
  const anyModalOpen = cartOpen || filterOpen || searchOpen;

  return (
    <>
      {children}

      <MobileFilterSheet isOpen={filterOpen} onClose={closeFilter} />
      <MobileSearchSheet isOpen={searchOpen} onClose={closeSearch} />
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />

      {!anyModalOpen && <BottomNav />}
    </>
  );
}
