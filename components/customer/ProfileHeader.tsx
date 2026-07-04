import { Mail, Calendar } from "lucide-react";

interface ProfileHeaderProps {
  email: string;
  fullName: string | null;
  memberSince: string | null; // ISO date string
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

/**
 * Card header profile customer: avatar (inisial), nama, email, member sejak.
 * Avatar otomatis pakai inisial nama (1-2 huruf besar), fallback ke huruf pertama email.
 */
export default function ProfileHeader({
  email,
  fullName,
  memberSince,
}: ProfileHeaderProps) {
  const displayName = fullName?.trim() || email.split("@")[0] || "Pelanggan";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-surface-1 border border-border-subtle rounded-subtle p-5 md:p-6 mb-4 md:mb-6">
      <div className="flex items-center gap-4 md:gap-5">
        {/* Avatar bulat — inisial, monokromatik, konsisten dengan brand */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-black text-white flex items-center justify-center text-xl md:text-2xl font-black shrink-0">
          {initials}
        </div>

        {/* Info utama */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight truncate">
            {displayName}
          </h1>
          <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <span className="flex items-center gap-1.5 min-w-0">
              <Mail size={12} className="shrink-0" strokeWidth={2.5} />
              <span className="truncate">{email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="shrink-0" strokeWidth={2.5} />
              <span>Member sejak {formatMemberSince(memberSince)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
