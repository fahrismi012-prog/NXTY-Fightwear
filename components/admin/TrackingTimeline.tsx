"use client";

import { CheckCircle2, Circle, MapPin } from "lucide-react";

export interface TrackingEventLite {
  date: string;
  description: string;
  location?: string;
}

interface Props {
  events: TrackingEventLite[];
  /** Status summary (mis. "delivered", "in_transit") — opsional, ditampilkan di header */
  status?: string;
}

function formatEventDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusLabel(status: string | undefined): string {
  if (!status) return "";
  const map: Record<string, string> = {
    delivered: "Terkirim",
    in_transit: "Dalam Perjalanan",
    pending: "Pending",
    picked_up: "Dijemput Kurir",
    out_for_delivery: "Sedang Diantar",
    returned: "Dikembalikan",
    failed: "Gagal Kirim",
    unknown: "Status Tidak Diketahui",
  };
  return map[status] ?? status;
}

export default function TrackingTimeline({ events, status }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-surface-1 border-2 border-border-subtle p-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          Belum Ada Tracking
        </p>
        <p className="text-[11px] text-neutral-600 mt-1">
          Riwayat perjalanan paket akan muncul di sini setelah tersedia.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border-2 border-border-subtle">
      {status ? (
        <div className="border-b-2 border-border-subtle px-4 py-3 flex items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Status
          </p>
          <span className="inline-block bg-white text-[#0a0a0a] border-2 border-white px-2 py-1 text-[10px] font-black uppercase tracking-wider">
            {statusLabel(status)}
          </span>
        </div>
      ) : null}

      <ol className="relative">
        {events.map((ev, idx) => {
          const isLatest = idx === 0;
          return (
            <li
              key={`${ev.date}-${idx}`}
              className="relative flex gap-3 px-4 py-4 border-b-2 border-border-subtle last:border-b-0"
            >
              {/* Icon column */}
              <div className="flex flex-col items-center pt-0.5">
                <div
                  className={`w-7 h-7 border-2 flex items-center justify-center ${
                    isLatest
                      ? "bg-brand-green border-brand-green text-text-primary"
                      : "bg-canvas border-border-subtle text-text-muted"
                  }`}
                >
                  {isLatest ? (
                    <CheckCircle2 size={14} strokeWidth={2.5} />
                  ) : (
                    <Circle size={10} strokeWidth={2.5} />
                  )}
                </div>
                {idx < events.length - 1 ? (
                  <div className="w-0.5 flex-1 bg-surface-2 mt-1" />
                ) : null}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <p
                  className={`text-xs leading-snug ${
                    isLatest
                      ? "font-black text-text-primary"
                      : "font-bold text-neutral-300"
                  }`}
                >
                  {ev.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                    {formatEventDate(ev.date)}
                  </span>
                  {ev.location ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                      <MapPin size={10} strokeWidth={2.5} />
                      {ev.location}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
