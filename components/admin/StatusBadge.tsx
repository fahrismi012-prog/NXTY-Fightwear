import { cn } from "@/lib/utils";

const STATUS_MAP: Record<
  string,
  { label: string; classes: string }
> = {
  pending: { label: "Menunggu", classes: "bg-yellow-600 text-text-primary" },
  paid: { label: "Dibayar", classes: "bg-blue-600 text-text-primary" },
  processed: { label: "Diproses", classes: "bg-blue-700 text-text-primary" },
  shipped: { label: "Dikirim", classes: "bg-brand-green text-text-primary" },
  delivered: { label: "Sampai", classes: "bg-green-600 text-text-primary" },
  cancelled: { label: "Batal", classes: "bg-neutral-700 text-text-primary" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const info = STATUS_MAP[status] || {
    label: status,
    classes: "bg-neutral-700 text-text-primary",
  };
  return (
    <span
      className={cn(
        "inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5",
        info.classes,
        className
      )}
    >
      {info.label}
    </span>
  );
}
