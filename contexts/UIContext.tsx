"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface UIContextValue {
  cartOpen: boolean;
  filterOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openFilter: () => void;
  closeFilter: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openFilter = useCallback(() => setFilterOpen(true), []);
  const closeFilter = useCallback(() => setFilterOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <UIContext.Provider
      value={{
        cartOpen,
        filterOpen,
        searchOpen,
        openCart,
        closeCart,
        openFilter,
        closeFilter,
        openSearch,
        closeSearch,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useUI must be used within UIProvider");
  }
  return ctx;
}
