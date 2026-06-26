"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: string;
  size?: "sm" | "md" | "lg";
}

function calcTimeLeft(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

export default function CountdownTimer({ endTime, size = "md" }: CountdownTimerProps) {
  // Initialize with placeholder values to avoid SSR/CSR hydration mismatch.
  // Real values are computed in useEffect (client-only).
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ended: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(calcTimeLeft(endTime));
    const interval = setInterval(() => {
      setTime(calcTimeLeft(endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (time.ended) {
    return (
      <div className="inline-flex items-center gap-2 bg-[#262626] px-3 py-1.5 border border-[#262626]">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">
          PROMO ENDED
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

  // Avoid hydration mismatch: render placeholder until mounted on client.
  // The placeholder mirrors the structure (same number of boxes) so layout
  // doesn't shift when real values arrive.
  if (!mounted) {
    return (
      <div
        className="inline-flex items-center gap-1.5"
        aria-hidden
        suppressHydrationWarning
      >
        <div className={`${s.box} bg-[#0a0a0a] border-2 border-[#262626] flex items-center justify-center`}>
          <span className={`${s.text} font-black text-neutral-700 font-mono leading-none`}>
            --
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {time.days > 0 && (
        <div className={`${s.box} bg-[#dc2626] flex flex-col items-center justify-center`}>
          <span className={`${s.text} font-black text-white font-mono leading-none`}>
            {String(time.days).padStart(2, "0")}
          </span>
          <span className={`${s.label} font-black uppercase text-white/80 tracking-wider`}>
            DAYS
          </span>
        </div>
      )}
      <div className={`${s.box} bg-[#0a0a0a] border-2 border-[#dc2626] flex flex-col items-center justify-center`}>
        <span className={`${s.text} font-black text-white font-mono leading-none`}>
          {String(time.hours).padStart(2, "0")}
        </span>
        <span className={`${s.label} font-black uppercase text-[#dc2626] tracking-wider`}>
          HRS
        </span>
      </div>
      <span className="text-[#dc2626] font-black text-2xl">:</span>
      <div className={`${s.box} bg-[#0a0a0a] border-2 border-[#dc2626] flex flex-col items-center justify-center`}>
        <span className={`${s.text} font-black text-white font-mono leading-none`}>
          {String(time.minutes).padStart(2, "0")}
        </span>
        <span className={`${s.label} font-black uppercase text-[#dc2626] tracking-wider`}>
          MIN
        </span>
      </div>
      <span className="text-[#dc2626] font-black text-2xl">:</span>
      <div className={`${s.box} bg-[#0a0a0a] border-2 border-[#dc2626] flex flex-col items-center justify-center`}>
        <span className={`${s.text} font-black text-white font-mono leading-none`}>
          {String(time.seconds).padStart(2, "0")}
        </span>
        <span className={`${s.label} font-black uppercase text-[#dc2626] tracking-wider`}>
          SEC
        </span>
      </div>
    </div>
  );
}
