"use client";

import { useState } from "react";
import BottomNav from "./BottomNav";
import CartDrawer from "./CartDrawer";
import MobileFilterSheet from "./MobileFilterSheet";
import MobileSearchSheet from "./MobileSearchSheet";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Wrapper yang mengelola state global untuk:
 * - BottomNav (mobile only)
 * - CartDrawer
 * - MobileFilterSheet (kategori)
 * - MobileSearchSheet (pencarian)
 *
 * Dipasang di layout.tsx sehingga tersedia di semua halaman.
 */
export default function AppShell({ children }: AppShellProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {children}

      <MobileFilterSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
      <MobileSearchSheet
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* BottomNav disembunyikan saat overlay/sheet/drawer terbuka */}
      {!cartOpen && !filterOpen && !searchOpen && (
        <BottomNav
          onCartClick={() => setCartOpen(true)}
          onFilterClick={() => setFilterOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
        />
      )}
    </>
  );
}
