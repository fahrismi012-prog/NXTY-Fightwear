"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error untuk debugging
    console.warn("[NXTY ErrorBoundary] Error detected:", error);
    console.warn("[NXTY ErrorBoundary] Message:", error.message);
    console.warn("[NXTY ErrorBoundary] Stack:", error.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col">
      {/* Top marquee strip - red */}
      <div className="bg-brand-black text-text-primary overflow-hidden border-b-2 border-[#0a0a0a]">
        <div className="flex animate-marquee whitespace-nowrap py-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {["TERJADI ERROR", "SIAP TEMPUR", "LAHIR UNTUK BERTEMPUR"].map(
                (t, j) => (
                  <span
                    key={j}
                    className="px-6 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] flex items-center gap-5"
                  >
                    {t}
                    <span className="text-[#0a0a0a] text-base leading-none">★</span>
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #dc2626 10px, #dc2626 12px)",
            }}
          />
        </div>

        <div className="max-w-md w-full text-center relative z-10 space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <img
              src="/brand/logo-full.png"
              alt="Anxiety Fightwear"
              className="h-12 object-contain"
              width={200}
              height={48}
            />
          </div>

          {/* Error Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#ef4444] blur-xl opacity-30 rounded-full"></div>
            <div className="relative w-24 h-24 mx-auto bg-[#ef4444] rounded-full flex items-center justify-center border-4 border-[#0a0a0a]">
              <AlertTriangle className="w-12 h-12 text-text-primary" />
            </div>
          </div>

          {/* Error Title */}
          <div>
            <p className="text-[10px] font-black text-[#ef4444] uppercase tracking-[0.3em] mb-2 font-mono">
              SYSTEM ERROR
            </p>
            <h1 className="text-6xl sm:text-8xl font-black text-text-primary uppercase tracking-tighter italic">
              ERROR
            </h1>
          </div>

          {/* Error Message */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary uppercase tracking-tight mb-2">
              Maaf, Ada Masalah
            </h2>
            <p className="text-sm sm:text-base text-text-muted font-mono uppercase tracking-widest">
              Terjadi kesalahan pada sistem. Silakan coba lagi nanti.
            </p>
            {/* Show error detail only in development */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-surface-2 border-2 border-brand-black rounded-none text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black mb-1">
                  Development Error:
                </p>
                <p className="text-[9px] text-text-primary font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => reset()}
              className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-brand-black text-text-primary text-sm font-black uppercase tracking-[0.2em] border-4 border-[#0a0a0a] hover:bg-[#ef4444] hover:border-brand-black active:translate-x-1 active:translate-y-1 active:border-[#0a0a0a] transition-all min-h-[60px]"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Halaman</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-surface-2 text-text-primary text-sm font-black uppercase tracking-[0.2em] border-4 border-[#0a0a0a] hover:bg-[#333333] active:translate-x-1 active:translate-y-1 active:border-[#0a0a0a] transition-all min-h-[60px]"
            >
              <Home className="w-5 h-5" />
              <span>Kembali ke Homepage</span>
            </Link>
          </div>

          {/* Extra Info */}
          <div className="pt-8 border-t-4 border-brand-black">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 font-mono">
              Jika masalah berlanjut, silakan hubungi kami di hello@anxietyfightwear.com
            </p>
          </div>
        </div>
      </main>

      {/* Brutalist footer */}
      <footer className="border-t-4 border-brand-black bg-canvas">
        <div className="bg-stripes-red">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/brand/logo-full.png"
                alt="Anxiety Fightwear"
                className="h-8 object-contain"
                width={200}
                height={32}
              />
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 font-mono">
                LAHIR UNTUK BERTEMPUR · DIBUAT TAHAN LAMA
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-800 mt-1">
                © 2024 ANXIETY FIGHTWEAR · ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
