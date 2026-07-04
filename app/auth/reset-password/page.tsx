"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { updatePassword } from "@/lib/supabase/customer";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Validasi session — user harus sudah login (Supabase set session
  // otomatis saat callback exchange code dari link reset password)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(Boolean(session));
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      // Redirect ke /akun setelah 2 detik (biar user lihat pesan sukses)
      setTimeout(() => {
        router.replace("/akun");
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal update password";
      const lower = msg.toLowerCase();
      if (lower.includes("session") || lower.includes("auth")) {
        setError(
          "Session tidak valid. Coba minta link reset password lagi dari /masuk",
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // Loading state saat cek session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-muted">Memvalidasi sesi...</p>
        </div>
      </div>
    );
  }

  // Session tidak ada — link reset password sudah expired atau salah
  if (!hasSession) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link
            href="/masuk"
            className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary mb-6 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Masuk
          </Link>
          <div className="bg-surface-1 border-2 border-neutral-800 p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 border-2 border-red-600 flex items-center justify-center mb-4">
              <AlertCircle
                size={28}
                strokeWidth={2.5}
                className="text-red-600"
              />
            </div>
            <h1 className="text-xl font-black text-text-primary mb-2">
              Link Tidak Valid atau Sudah Kadaluarsa
            </h1>
            <p className="text-sm text-text-muted mb-6">
              Sesi reset password sudah tidak berlaku. Silakan minta link
              baru dari halaman Masuk.
            </p>
            <Link
              href="/masuk"
              className="inline-block w-full py-3 bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-colors"
            >
              Kembali ke Masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-surface-1 border-2 border-black p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 border-2 border-black flex items-center justify-center mb-4">
              <CheckCircle2
                size={28}
                strokeWidth={2.5}
                className="text-black"
              />
            </div>
            <h1 className="text-xl font-black text-text-primary mb-2">
              Password Berhasil Diubah
            </h1>
            <p className="text-sm text-text-muted mb-4">
              Mengarahkan ke halaman akun...
            </p>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-text-muted" />
          </div>
        </div>
      </div>
    );
  }

  // Form utama
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link
          href="/akun"
          className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="bg-surface-1 border-2 border-black p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-black bg-black mb-3">
              <Lock size={20} strokeWidth={2.5} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">
              Buat Password Baru
            </h1>
            <p className="text-xs text-text-muted mt-2">
              Password minimal 8 karakter
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2"
              >
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-black" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  required
                  autoComplete="new-password"
                  autoFocus
                  className="w-full bg-canvas text-text-primary pl-10 pr-10 py-3 border-2 border-neutral-800 focus:border-brand-black focus:outline-none placeholder:text-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-black" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  autoComplete="new-password"
                  className="w-full bg-canvas text-text-primary pl-10 pr-10 py-3 border-2 border-neutral-800 focus:border-brand-black focus:outline-none placeholder:text-neutral-600"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-600 text-red-700 text-xs p-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full py-3 bg-black text-white font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed min-h-[48px] inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Simpan Password Baru
                </>
              )}
            </button>

            <p className="text-[10px] text-text-muted text-center">
              Setelah disimpan, Anda akan otomatis login dengan password baru.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
