"use client";

import { useSyncExternalStore } from "react";

interface CountdownTimerProps {
  endTime: string;
  size?: "sm" | "md" | "lg";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
}

const ZERO_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  ended: false,
};

function calcTimeLeft(endTime: string): TimeLeft {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return { ...ZERO_TIME, ended: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

// Subscribe interval dengan TTL cache agar semua subscriber dalam
// tick yang sama menerima snapshot yang identik (React requirement
// untuk useSyncExternalStore: getSnapshot harus return reference stabil).
let intervalId: ReturnType<typeof setInterval> | null = null;
const tickSubscribers = new Set<() => void>();

function startTicker() {
  if (intervalId !== null) return;
  intervalId = setInterval(() => {
    tickSubscribers.forEach((cb) => cb());
  }, 1000);
}

function stopTickerIfIdle() {
  if (intervalId !== null && tickSubscribers.size === 0) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export default function CountdownTimer({ endTime, size = "md" }: CountdownTimerProps) {
  // useSyncExternalStore dengan interval ticker — SSR-safe (server snapshot
  // = ZERO_TIME) dan re-evaluate setiap detik di client. Tidak ada setState
  // di effect, sehingga ESLint react-hooks/set-state-in-effect compliant.
  const time = useSyncExternalStore(
    (callback) => {
      tickSubscribers.add(callback);
      startTicker();
      return () => {
        tickSubscribers.delete(callback);
        stopTickerIfIdle();
      };
    },
    () => calcTimeLeft(endTime),
    () => ZERO_TIME,
  );

  if (time.ended) {
    return (
      <div className="inline-flex items-center gap-2 bg-surface-2 px-3 py-1.5 border border-border-subtle">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">
          PROMO BERAKHIR
        </span>
      </div>
    );
  }

  const sizeMap = {
    sm: { box: "w-8 h-8", text: "text-sm", label: "text-[8px]" },
    md: { box: "w-11 h-11 sm:w-14 sm:h-14", text: "text-lg sm:text-2xl", label: "text-[9px] sm:text-[10px]" },
    lg: { box: "w-16 h-16 sm:w-20 sm:h-20", text: "text-3xl sm:text-4xl", label: "text-[10px] sm:text-xs" },
  };
  const s = sizeMap[size];

  return (
    <div className="inline-flex items-center gap-1.5" suppressHydrationWarning>
      {time.days > 0 && (
        <div className={`${s.box} bg-brand-black flex flex-col items-center justify-center`}>
          <span className={`${s.text} font-black text-text-primary font-mono leading-none`}>
            {String(time.days).padStart(2, "0")}
          </span>
          <span className={`${s.label} font-black uppercase text-text-primary/80 tracking-wider`}>
            HARI
          </span>
        </div>
      )}
      <div className={`${s.box} bg-canvas border-2 border-brand-black flex flex-col items-center justify-center`}>
        <span className={`${s.text} font-black text-text-primary font-mono leading-none`}>
          {String(time.hours).padStart(2, "0")}
        </span>
        <span className={`${s.label} font-black uppercase text-brand-black tracking-wider`}>
          JAM
        </span>
      </div>
      <span className="text-brand-black font-black text-2xl">:</span>
      <div className={`${s.box} bg-canvas border-2 border-brand-black flex flex-col items-center justify-center`}>
        <span className={`${s.text} font-black text-text-primary font-mono leading-none`}>
          {String(time.minutes).padStart(2, "0")}
        </span>
        <span className={`${s.label} font-black uppercase text-brand-black tracking-wider`}>
          MENIT
        </span>
      </div>
      <span className="text-brand-black font-black text-2xl">:</span>
      <div className={`${s.box} bg-canvas border-2 border-brand-black flex flex-col items-center justify-center`}>
        <span className={`${s.text} font-black text-text-primary font-mono leading-none`}>
          {String(time.seconds).padStart(2, "0")}
        </span>
        <span className={`${s.label} font-black uppercase text-brand-black tracking-wider`}>
          DETIK
        </span>
      </div>
    </div>
  );
}
