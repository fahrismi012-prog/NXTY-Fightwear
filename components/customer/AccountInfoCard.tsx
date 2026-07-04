import { Calendar, ShoppingBag, ShieldCheck } from "lucide-react";

interface AccountInfoCardProps {
  memberSince: string | null;
  totalOrders: number;
  status: "Aktif" | "Tidak Aktif";
}

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatMemberSince(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

interface MetricProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
}

function Metric({ icon: Icon, label, value }: MetricProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-canvas border border-border-subtle rounded-subtle">
      <div className="w-9 h-9 bg-brand-black text-white flex items-center justify-center shrink-0 rounded-subtle">
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted truncate">
          {label}
        </p>
        <p className="text-sm md:text-base font-bold text-text-primary truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Card kecil berisi 3 metric: member sejak, total pesanan, status akun.
 * Placeholder "—" untuk data yang belum tersedia.
 */
export default function AccountInfoCard({
  memberSince,
  totalOrders,
  status,
}: AccountInfoCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
      <Metric
        icon={Calendar}
        label="Member Sejak"
        value={formatMemberSince(memberSince)}
      />
      <Metric
        icon={ShoppingBag}
        label="Pesanan"
        value={totalOrders > 0 ? String(totalOrders) : "—"}
      />
      <Metric icon={ShieldCheck} label="Status" value={status} />
    </div>
  );
}
