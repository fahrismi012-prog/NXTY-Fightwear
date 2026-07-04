"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";

interface SetDefaultAddressButtonProps {
  addressId: string;
}

/**
 * Tombol "Jadikan Utama" untuk set alamat sebagai default customer.
 * Disabled kalau alamat sudah default.
 */
export default function SetDefaultAddressButton({
  addressId,
}: SetDefaultAddressButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleClick() {
    if (!confirm("Jadikan alamat ini sebagai alamat utama?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/customer/addresses/${addressId}/set-default`,
        { method: "PUT" },
      );
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Gagal set default");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={error ?? "Jadikan alamat utama"}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider border border-border-subtle rounded-subtle hover:border-brand-black hover:bg-brand-black hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={11} strokeWidth={2.5} className="animate-spin" />
      ) : (
        <Star size={11} strokeWidth={2.5} />
      )}
      Utama
    </button>
  );
}
