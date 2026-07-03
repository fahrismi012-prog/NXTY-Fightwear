"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import {
  signInWithPassword,
  signUpWithPassword,
  resetPassword,
  signInWithEmail,
  verifyOtp,
} from "@/lib/supabase/customer";

type AuthMode = "password" | "otp";
type PasswordSubMode = "login" | "signup" | "forgot";
type OtpMode = "link" | "code";
type Step = "input" | "verify" | "sent";

export default function MasukPage() {
  // Mode utama: Password (default) atau OTP/magic link
  const [authMode, setAuthMode] = useState<AuthMode>("password");
  // Sub-mode untuk password: login, signup, forgot
  const [pwdSub, setPwdSub] = useState<PasswordSubMode>("login");
  // OTP variant: kirim link (magic link) atau 6-digit code
  const [otpMode, setOtpMode] = useState<OtpMode>("link");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function resetFeedback() {
    setError(null);
    setInfo(null);
  }

  function switchAuthMode(next: AuthMode) {
    setAuthMode(next);
    setStep("input");
    setOtp("");
    resetFeedback();
  }

  function switchPwdSub(next: PasswordSubMode) {
    setPwdSub(next);
    setPassword("");
    setConfirmPassword("");
    resetFeedback();
  }

  // ─── Password handlers ─────────────────────────────────────
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      // Login berhasil, redirect ke /akun
      window.location.href = "/akun";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk";
      // Friendly error untuk user not found / wrong password
      const lower = msg.toLowerCase();
      if (lower.includes("invalid") || lower.includes("credentials")) {
        setError("Email atau password salah");
      } else if (lower.includes("email not confirmed")) {
        setError(
          "Email belum dikonfirmasi. Cek inbox Anda atau gunakan mode OTP.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSignup(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
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
      const { needsEmailConfirmation } = await signUpWithPassword(
        email,
        password,
      );
      if (needsEmailConfirmation) {
        setInfo(
          "Akun berhasil dibuat! Cek email Anda untuk konfirmasi sebelum login. (Konfirmasi email bisa di-disable di Dashboard untuk testing.)",
        );
        setStep("sent");
      } else {
        // Auto-login (kalau email confirmation disabled)
        window.location.href = "/akun";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal daftar";
      const lower = msg.toLowerCase();
      if (lower.includes("already") || lower.includes("registered")) {
        setError(
          "Email sudah terdaftar. Silakan masuk atau gunakan Lupa Password.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
    if (!email) {
      setError("Email wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setInfo(
        "Link reset password sudah dikirim ke email Anda. Cek inbox (termasuk folder spam).",
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim link reset");
    } finally {
      setLoading(false);
    }
  }

  // ─── OTP handlers ──────────────────────────────────────────
  async function handleOtpRequest(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
    if (!email) {
      setError("Email wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, otpMode === "code");
      setStep("sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim OTP/link");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
    if (otp.length !== 6) {
      setError("Kode harus 6 digit");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      window.location.href = "/akun";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kode salah atau kadaluarsa");
    } finally {
      setLoading(false);
    }
  }

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
              <span className="text-brand-black">NXTY</span>{" "}
              <span className="text-text-primary text-xl tracking-[0.2em]">
                FIGHTWEAR
              </span>
            </h1>
            <p className="text-sm text-text-muted mt-2">
              {authMode === "password"
                ? pwdSub === "forgot"
                  ? "Reset password Anda"
                  : pwdSub === "signup"
                    ? "Daftar akun baru"
                    : "Masuk atau daftar"
                : "Masuk via email"}
            </p>
          </div>

          {/* Tab utama: Password / OTP */}
          <div className="flex gap-2 mb-5 border-b-2 border-border-subtle">
            <button
              type="button"
              onClick={() => switchAuthMode("password")}
              className={`flex-1 pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-colors -mb-0.5 ${
                authMode === "password"
                  ? "border-brand-black text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              <Lock className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => switchAuthMode("otp")}
              className={`flex-1 pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-colors -mb-0.5 ${
                authMode === "otp"
                  ? "border-brand-black text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              <Mail className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              OTP / Link
            </button>
          </div>

          {/* ─── MODE PASSWORD ─── */}
          {authMode === "password" && step === "input" && (
            <>
              {/* Sub-tabs: Masuk / Daftar / Lupa */}
              {pwdSub !== "forgot" && (
                <div className="flex gap-2 mb-4 text-[11px]">
                  <button
                    type="button"
                    onClick={() => switchPwdSub("login")}
                    className={`font-bold uppercase tracking-wider ${
                      pwdSub === "login"
                        ? "text-brand-black underline underline-offset-4"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Masuk
                  </button>
                  <span className="text-text-muted">·</span>
                  <button
                    type="button"
                    onClick={() => switchPwdSub("signup")}
                    className={`font-bold uppercase tracking-wider ${
                      pwdSub === "signup"
                        ? "text-brand-black underline underline-offset-4"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Daftar
                  </button>
                </div>
              )}

              {/* FORM: Login */}
              {pwdSub === "login" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <EmailField value={email} onChange={setEmail} />
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    onToggleShow={() => setShowPassword((v) => !v)}
                  />
                  {error && <ErrorBox message={error} />}
                  <SubmitButton loading={loading} disabled={!email || !password}>
                    Masuk
                  </SubmitButton>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchPwdSub("forgot")}
                      className="text-[11px] text-text-muted hover:text-brand-black underline"
                    >
                      Lupa password?
                    </button>
                  </div>
                </form>
              )}

              {/* FORM: Signup */}
              {pwdSub === "signup" && (
                <form onSubmit={handlePasswordSignup} className="space-y-4">
                  <EmailField value={email} onChange={setEmail} />
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    onToggleShow={() => setShowPassword((v) => !v)}
                    placeholder="Min. 8 karakter"
                  />
                  <PasswordField
                    label="Konfirmasi Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showPassword}
                    onToggleShow={() => setShowPassword((v) => !v)}
                  />
                  {error && <ErrorBox message={error} />}
                  <SubmitButton loading={loading} disabled={!email || !password || !confirmPassword}>
                    Daftar Akun
                  </SubmitButton>
                </form>
              )}

              {/* FORM: Forgot */}
              {pwdSub === "forgot" && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-text-muted text-center">
                    Masukkan email Anda. Kami akan kirim link untuk reset
                    password.
                  </p>
                  <EmailField value={email} onChange={setEmail} />
                  {error && <ErrorBox message={error} />}
                  {info && <InfoBox message={info} />}
                  <SubmitButton loading={loading} disabled={!email}>
                    Kirim Link Reset
                  </SubmitButton>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchPwdSub("login")}
                      className="text-[11px] text-text-muted hover:text-brand-black underline"
                    >
                      Kembali ke Masuk
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ─── MODE OTP ─── */}
          {authMode === "otp" && (
            <>
              {step === "input" && (
                <form onSubmit={handleOtpRequest} className="space-y-4">
                  <EmailField value={email} onChange={setEmail} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpMode("link")}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-2 transition-colors ${
                        otpMode === "link"
                          ? "bg-brand-black border-brand-black text-text-primary"
                          : "bg-transparent border-border-subtle text-text-muted hover:border-brand-black hover:text-brand-black"
                      }`}
                    >
                      Kirim Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpMode("code")}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-2 transition-colors ${
                        otpMode === "code"
                          ? "bg-brand-black border-brand-black text-text-primary"
                          : "bg-transparent border-border-subtle text-text-muted hover:border-brand-black hover:text-brand-black"
                      }`}
                    >
                      Kirim OTP
                    </button>
                  </div>
                  {error && <ErrorBox message={error} />}
                  <SubmitButton loading={loading} disabled={!email}>
                    Kirim
                  </SubmitButton>
                </form>
              )}

              {step === "verify" && (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <p className="text-sm text-text-muted text-center">
                    Masukkan 6 digit kode yang dikirim ke{" "}
                    <strong>{email}</strong>
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    className="w-full bg-canvas text-text-primary text-center text-2xl tracking-[0.5em] py-3 border-2 border-border-subtle focus:border-brand-black focus:outline-none font-mono"
                  />
                  {error && <ErrorBox message={error} />}
                  <SubmitButton
                    loading={loading}
                    disabled={otp.length !== 6}
                  >
                    Verifikasi
                  </SubmitButton>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("input");
                        setOtp("");
                        resetFeedback();
                      }}
                      className="text-[11px] text-text-muted hover:text-brand-black underline"
                    >
                      Kembali
                    </button>
                  </div>
                </form>
              )}

              {step === "sent" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto border-2 border-brand-black flex items-center justify-center">
                    <Mail className="w-7 h-7 text-brand-black" />
                  </div>
                  <p className="text-sm text-text-primary font-bold">
                    Cek email Anda
                  </p>
                  <p className="text-xs text-text-muted">
                    Kami sudah mengirim {otpMode === "code" ? "kode OTP" : "link login"} ke{" "}
                    <strong>{email}</strong>. Cek juga folder spam.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("input");
                      setOtp("");
                      resetFeedback();
                    }}
                    className="text-xs text-brand-black hover:text-text-primary underline"
                  >
                    Kirim ulang
                  </button>
                </div>
              )}
            </>
          )}

          {/* Step 'sent' dari password signup (konfirmasi email) */}
          {authMode === "password" && step === "sent" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-2 border-brand-black flex items-center justify-center">
                <Mail className="w-7 h-7 text-brand-black" />
              </div>
              <p className="text-sm text-text-primary font-bold">
                Konfirmasi Email
              </p>
              <p className="text-xs text-text-muted">
                {info ?? "Cek email Anda untuk konfirmasi akun."}
              </p>
              <Link
                href="/"
                className="inline-block text-xs text-brand-black hover:text-text-primary underline"
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

// ─── Shared sub-components ──────────────────────────────────────

function EmailField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor="email"
        className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2"
      >
        Email
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-black" />
        <input
          id="email"
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="nama@email.com"
          required
          autoComplete="email"
          className="w-full bg-canvas text-text-primary pl-10 pr-3 py-3 border-2 border-border-subtle focus:border-brand-black focus:outline-none placeholder:text-neutral-600"
        />
      </div>
    </div>
  );
}

function PasswordField({
  label = "Password",
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={label.toLowerCase().replace(/\s+/g, "-")}
        className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-black" />
        <input
          id={label.toLowerCase().replace(/\s+/g, "-")}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          required
          autoComplete={
            label.toLowerCase().includes("konfirmasi")
              ? "new-password"
              : "current-password"
          }
          className="w-full bg-canvas text-text-primary pl-10 pr-10 py-3 border-2 border-border-subtle focus:border-brand-black focus:outline-none placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
        >
          {show ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-brand-black/10 border border-brand-black text-brand-black text-xs p-2">
      {message}
    </div>
  );
}

function InfoBox({ message }: { message: string }) {
  return (
    <div className="bg-brand-black text-white text-xs p-2 font-semibold">
      {message}
    </div>
  );
}

function SubmitButton({
  loading,
  disabled,
  children,
}: {
  loading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full py-3 bg-brand-black text-text-primary font-black uppercase tracking-wider hover:bg-white hover:text-brand-black transition-colors disabled:bg-surface-2 disabled:text-neutral-600 disabled:cursor-not-allowed min-h-[48px] inline-flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Memproses...
        </>
      ) : (
        children
      )}
    </button>
  );
}
