"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ChevronLeft } from "lucide-react";
import { signInWithEmail, verifyOtp } from "@/lib/supabase/customer";

export default function MasukPage() {
  const [mode, setMode] = useState<"link" | "otp">("link");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "verify" | "sent">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, mode === "otp");
      if (mode === "otp") {
        setStep("verify");
      } else {
        setStep("sent");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim link";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      // Will redirect via auth state listener
      window.location.href = "/akun";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Kode OTP salah";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="bg-surface-1 border-2 border-border-subtle p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-text-primary tracking-tighter">
              <span className="text-brand-green">NXTY</span>{" "}
              <span className="text-text-primary text-xl tracking-[0.2em]">FIGHTWEAR</span>
            </h1>
            <p className="text-sm text-text-muted mt-2">
              Masuk untuk melanjutkan belanja
            </p>
          </div>

          {step === "input" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-green" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full bg-canvas text-text-primary pl-10 pr-3 py-3 border-2 border-border-subtle focus:border-brand-green focus:outline-none placeholder:text-neutral-600"
                  />
                </div>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("link")}
                  className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-2 transition-colors ${
                    mode === "link"
                      ? "bg-brand-green border-brand-green text-text-primary"
                      : "bg-transparent border-border-subtle text-text-muted hover:border-brand-green hover:text-brand-green"
                  }`}
                >
                  Kirim Link
                </button>
                <button
                  type="button"
                  onClick={() => setMode("otp")}
                  className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-2 transition-colors ${
                    mode === "otp"
                      ? "bg-brand-green border-brand-green text-text-primary"
                      : "bg-transparent border-border-subtle text-text-muted hover:border-brand-green hover:text-brand-green"
                  }`}
                >
                  Kirim OTP
                </button>
              </div>

              {error && (
                <div className="bg-brand-green/10 border border-brand-green text-brand-green text-xs p-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-brand-green text-text-primary font-black uppercase tracking-wider hover:bg-white hover:text-brand-green transition-colors disabled:bg-surface-2 disabled:text-neutral-600 disabled:cursor-not-allowed min-h-[48px]"
              >
                {loading ? "Mengirim..." : "Kirim"}
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-text-muted text-center">
                Masukkan 6 digit kode yang dikirim ke <strong>{email}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                className="w-full bg-canvas text-text-primary text-center text-2xl tracking-[0.5em] py-3 border-2 border-border-subtle focus:border-brand-green focus:outline-none font-mono"
              />
              {error && (
                <div className="bg-brand-green/10 border border-brand-green text-brand-green text-xs p-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-brand-green text-text-primary font-black uppercase tracking-wider hover:bg-white hover:text-brand-green transition-colors disabled:bg-surface-2 disabled:text-neutral-600 disabled:cursor-not-allowed min-h-[48px]"
              >
                {loading ? "Memverifikasi..." : "Verifikasi"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setOtp("");
                  setError(null);
                }}
                className="w-full text-xs text-text-muted hover:text-text-primary"
              >
                Kembali
              </button>
            </form>
          )}

          {step === "sent" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-2 border-brand-green flex items-center justify-center">
                <Mail className="w-7 h-7 text-brand-green" />
              </div>
              <p className="text-sm text-text-primary font-bold">
                Cek email Anda
              </p>
              <p className="text-xs text-text-muted">
                Kami sudah mengirim link login ke <strong>{email}</strong>.
                Klik link tersebut untuk masuk.
              </p>
              <Link
                href="/"
                className="inline-block text-xs text-brand-green hover:text-text-primary underline"
              >
                Kembali ke beranda
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
