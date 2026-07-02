"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface Props {
  id: string;
  title: string;
}

export default function PromoActions({ id, title }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Hapus promo "${title}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        showToast("info", json.error ?? "Gagal menghapus promo");
        return;
      }

      showToast("success", `Promo "${title}" berhasil dihapus`);
      router.refresh();
    } catch {
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/promo/${id}`}
        className={[
          "inline-flex items-center gap-1.5",
          "bg-white text-black",
          "border-2 border-neutral-800",
          "px-3 py-2 text-[10px] font-black uppercase tracking-wider",
          "hover:bg-black hover:text-white",
          "transition-colors",
        ].join(" ")}
      >
        <Pencil size={12} strokeWidth={2.5} />
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={[
          "inline-flex items-center gap-1.5",
          "bg-white text-[#dc2626]",
          "border-2 border-[#dc2626]",
          "px-3 py-2 text-[10px] font-black uppercase tracking-wider",
          "hover:bg-[#dc2626] hover:text-white",
          "transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        {deleting ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Trash2 size={12} strokeWidth={2.5} />
        )}
        Hapus
      </button>
    </div>
  );
}
