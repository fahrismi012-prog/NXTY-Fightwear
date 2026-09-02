"use client";

import { useEffect, useState } from "react";

/**
 * Poll jumlah notifikasi belum dibaca dari endpoint (yang return `{ unread }`).
 * Dipakai untuk badge di nav admin & customer.
 */
export function useUnreadCount(endpoint: string, intervalMs = 30_000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(endpoint, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (alive && d) setCount(Number(d.unread) || 0);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, intervalMs);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [endpoint, intervalMs]);

  return count;
}
