"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";

/**
 * Wishlist state — saved products untuk capture intent.
 *
 * Persistence: localStorage key `nxty:wishlist`.
 * SSR safety: items start empty, sync dari localStorage di useEffect,
 * set `hydrated = true` setelah selesai untuk hindari hydration mismatch.
 */

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  addedAt: number; // unix timestamp ms
}

type WishlistInput = Omit<WishlistItem, "addedAt">;

export interface WishlistContextValue {
  items: WishlistItem[];
  totalItems: number;
  hydrated: boolean;
  add: (item: WishlistInput) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  toggle: (item: WishlistInput) => void;
  clear: () => void;
}

type WishlistState = {
  items: WishlistItem[];
};

type WishlistAction =
  | { type: "SET"; items: WishlistItem[] }
  | { type: "ADD"; item: WishlistItem }
  | { type: "REMOVE"; productId: string }
  | { type: "CLEAR" };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "SET":
      return { items: action.items };
    case "ADD": {
      if (state.items.some((i) => i.productId === action.item.productId)) {
        return state;
      }
      return { items: [action.item, ...state.items] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

const STORAGE_KEY = "nxty:wishlist";

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate dari localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          // Validate basic shape
          const valid = parsed.filter(
            (i): i is WishlistItem =>
              typeof i === "object" &&
              i !== null &&
              typeof (i as WishlistItem).productId === "string"
          );
          dispatch({ type: "SET", items: valid });
        }
      }
    } catch (err) {
      console.warn("[wishlist] localStorage parse error:", err);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist setiap kali items berubah (skip first mount sebelum hydrated)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (err) {
      console.warn("[wishlist] localStorage set error:", err);
    }
  }, [state.items, hydrated]);

  const value: WishlistContextValue = {
    items: state.items,
    totalItems: state.items.length,
    hydrated,
    add: (item) =>
      dispatch({
        type: "ADD",
        item: { ...item, addedAt: Date.now() },
      }),
    remove: (productId) => dispatch({ type: "REMOVE", productId }),
    has: (productId) => state.items.some((i) => i.productId === productId),
    toggle: (item) => {
      if (state.items.some((i) => i.productId === item.productId)) {
        dispatch({ type: "REMOVE", productId: item.productId });
      } else {
        dispatch({
          type: "ADD",
          item: { ...item, addedAt: Date.now() },
        });
      }
    },
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
