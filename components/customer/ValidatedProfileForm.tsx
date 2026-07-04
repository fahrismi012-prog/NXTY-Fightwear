"use client";

import { useEffect, useRef, useState } from "react";
import {
  Save,
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ValidatedProfileFormProps {
  userId: string;
  email: string;
  initialName: string;
  initialPhone: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
}

/**
 * Validasi nama: minimal 2 kata ATAU minimal 3 karakter (single name ok).
 */
function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return "Nama wajib diisi";
  if (trimmed.length < 3) return "Nama minimal 3 karakter";
  return undefined;
}

/**
 * Validasi nomor HP Indonesia.
 * - Hanya angka, spasi, +, -
 * - Prefix Indonesia: 08xxx (HP), +62xxx (internasional)
 * - Minimal 10 digit angka
 */
function validatePhone(phone: string): string | undefined {
  const trimmed = phone.trim();
  if (!trimmed) return "Nomor HP wajib diisi";
  // Hanya angka, spasi, +, -
  if (!/^[\d\s+\-]+$/.test(trimmed)) {
    return "Nomor HP hanya boleh berisi angka";
  }
  // Extract digit saja
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10) return "Nomor HP minimal 10 digit";
  if (digits.length > 15) return "Nomor HP terlalu panjang";
  // Kalau pakai prefix 08, harus Indonesia (08xx atau +628xx)
  if (trimmed.startsWith("08") && digits.length < 11) {
    return "Nomor HP 08xx minimal 11 digit (contoh: 081234567890)";
  }
  return undefined;
}

function formatPhoneForDisplay(raw: string): string {
  // Normalisasi ke format Indonesia: 08xxx
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    return "0" + digits.slice(2);
  }
  return raw;
}

export default function ValidatedProfileForm({
  userId,
  email,
  initialName,
  initialPhone,
}: ValidatedProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ name: boolean; phone: boolean }>({
    name: false,
    phone: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const nameError = touched.name ? validateName(name) : undefined;
  const phoneError = touched.phone ? validatePhone(phone) : undefined;
  const hasErrors = Boolean(nameError || phoneError);

  // Cek perubahan untuk disabled button
  const isDirty =
    name.trim() !== initialName.trim() ||
    phone.trim() !== initialPhone.trim();

  // Auto-focus field nama saat mount
  useEffect(() => {
    if (!initialName && nameRef.current) {
      nameRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-clear success message setelah 3 detik
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Touch all fields untuk show errors
    setTouched({ name: true, phone: true });
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    if (nameErr || phoneErr) {
      setErrors({ name: nameErr, phone: phoneErr });
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const supabase = createClient();
      const { error: dbErr } = await supabase
        .from("customer_profiles")
        .upsert(
          { id: userId, full_name: name.trim(), phone: formatPhoneForDisplay(phone).trim() },
          { onConflict: "id" },
        );
      if (dbErr) throw dbErr;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Toast notifikasi (fixed di atas form pada mobile) */}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 flex items-center gap-2 p-3 bg-brand-black text-white text-xs font-bold uppercase tracking-wider rounded-subtle"
        >
          <CheckCircle2 size={16} strokeWidth={2.5} />
          Profil berhasil disimpan
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-subtle"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Email — readonly dengan icon lock */}
        <div>
          <label
            htmlFor="profile-email"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-text-muted mb-1.5"
          >
            Email
            <span title="Email tidak dapat diubah">
              <Lock size={11} strokeWidth={2.5} className="text-text-muted" />
            </span>
          </label>
          <div className="relative">
            <input
              id="profile-email"
              type="email"
              value={email}
              disabled
              aria-describedby="email-helper"
              className="w-full bg-canvas text-text-secondary px-3 py-3 pr-10 border border-border-subtle rounded-subtle text-sm cursor-not-allowed"
            />
            <Lock
              size={14}
              strokeWidth={2.5}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
          </div>
          <p id="email-helper" className="mt-1.5 text-[11px] text-text-muted">
            Email tidak dapat diubah. Hubungi customer service untuk ganti email.
          </p>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label
            htmlFor="profile-name"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-text-muted mb-1.5"
          >
            Nama Lengkap <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <UserIcon
              size={14}
              strokeWidth={2.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              ref={nameRef}
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="Nama lengkap Anda"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "name-error" : undefined}
              autoComplete="name"
              className={`w-full bg-surface-1 text-text-primary pl-10 pr-3 py-3 border rounded-subtle text-sm focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-brand-black transition-colors ${
                nameError
                  ? "border-red-500"
                  : "border-border-subtle"
              }`}
            />
          </div>
          {nameError && (
            <p
              id="name-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-[11px] text-red-600 font-bold"
            >
              <AlertCircle size={11} strokeWidth={2.5} />
              {nameError}
            </p>
          )}
        </div>

        {/* Nomor HP */}
        <div>
          <label
            htmlFor="profile-phone"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-text-muted mb-1.5"
          >
            Nomor HP <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <Phone
              size={14}
              strokeWidth={2.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              id="profile-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^\d\s+\-]/g, ""))
              }
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              placeholder="08xxxxxxxxxx"
              aria-invalid={Boolean(phoneError)}
              aria-describedby="phone-helper phone-error"
              autoComplete="tel"
              className={`w-full bg-surface-1 text-text-primary pl-10 pr-3 py-3 border rounded-subtle text-sm focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-brand-black transition-colors ${
                phoneError
                  ? "border-red-500"
                  : "border-border-subtle"
              }`}
            />
          </div>
          {phoneError ? (
            <p
              id="phone-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-[11px] text-red-600 font-bold"
            >
              <AlertCircle size={11} strokeWidth={2.5} />
              {phoneError}
            </p>
          ) : (
            <p id="phone-helper" className="mt-1.5 text-[11px] text-text-muted">
              Format Indonesia. Contoh: 081234567890
            </p>
          )}
        </div>

        {/* Submit button — primary, lebar penuh, disabled saat tidak ada perubahan */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || hasErrors || !isDirty}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-black text-white text-sm font-black uppercase tracking-wider rounded-subtle hover:bg-neutral-800 transition-colors disabled:bg-surface-2 disabled:text-text-muted disabled:cursor-not-allowed min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={16} strokeWidth={2.5} />
                Tersimpan
              </>
            ) : (
              <>
                <Save size={16} strokeWidth={2.5} />
                Simpan Perubahan
              </>
            )}
          </button>
          {!isDirty && !success && (
            <p className="mt-2 text-[11px] text-text-muted text-center">
              Tidak ada perubahan untuk disimpan
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
