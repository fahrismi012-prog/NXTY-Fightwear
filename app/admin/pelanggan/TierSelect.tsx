"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import type { PriceTier } from "@/types/database";

interface Props {
  id: string;
  initialTier: PriceTier;
}

export default function TierSelect({ id, initialTier }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [tier, setTier] = useState<PriceTier>(initialTier);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: PriceTier) {
    const prev = tier;
    setTier(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_tier: next }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setTier(prev);
        showToast("info", json.error ?? "Gagal mengubah tier");
        return;
      }
      showToast("success", `Tier diubah ke "${next}"`);
      router.refresh();
    } catch {
      setTier(prev);
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={tier}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as PriceTier)}
      className="w-full border-2 border-neutral-800 px-2 py-2 text-[10px] font-black uppercase tracking-wider bg-white disabled:opacity-50"
    >
      <option value="standard">Standard</option>
      <option value="legacy">Legacy</option>
    </select>
  );
}
