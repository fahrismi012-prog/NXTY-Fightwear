import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<
  string,
  { label: string; classes: string; icon?: "check" }
> = {
  awaiting_shipping_cost: { label: "Perlu Ongkir", classes: "bg-white text-[#b45309] border-2 border-[#b45309]" },
  awaiting_payment: { label: "Menunggu Bayar", classes: "bg-white text-black border-2 border-black" },
  awaiting_confirmation: { label: "Cek Bukti", classes: "bg-white text-black border-2 border-black" },
  pending: { label: "Menunggu", classes: "bg-white text-black border-2 border-black" },
  paid: { label: "Dibayar", classes: "bg-black text-white border-2 border-black" },
  processed: { label: "Diproses", classes: "bg-neutral-200 text-black border-2 border-neutral-800" },
  shipped: { label: "Dikirim", classes: "bg-neutral-800 text-white border-2 border-neutral-800" },
  delivered: { label: "Sampai", classes: "bg-black text-white border-2 border-black", icon: "check" },
  cancelled: { label: "Batal", classes: "bg-white text-[#dc2626] border-2 border-[#dc2626]" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const info = STATUS_MAP[status] || {
    label: status,
    classes: "bg-white text-neutral-600 border-2 border-neutral-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5",
        info.classes,
        className
      )}
    >
      {info.icon === "check" ? <Check size={10} strokeWidth={3} /> : null}
      {info.label}
    </span>
  );
}
