"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  RotateCcw,
  Palette,
  Type,
  Image as ImageIcon,
  AlertCircle,
  Check,
  Upload,
  Search,
  ShoppingCart,
} from "lucide-react";
import {
  DEFAULT_THEME,
  FONT_OPTIONS,
  THEME_PRESETS,
  darken,
  validateTheme,
  type ThemeSettings,
} from "@/lib/theme";

interface ThemeEditorProps {
  initialTheme: ThemeSettings;
}

/**
 * ThemeEditor — editor tema white-label ala Shopify (versi sederhana).
 * Kiri: preset + kontrol (warna, font, brand, logo).
 * Kanan: live preview mini-storefront yang mengikuti pilihan secara langsung.
 */
export default function ThemeEditor({ initialTheme }: ThemeEditorProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const warnings = useMemo(() => validateTheme(theme), [theme]);
  const activePreset = THEME_PRESETS.find(
    (p) =>
      p.primary === theme.primary &&
      p.accent === theme.accent &&
      p.canvas === theme.canvas,
  );

  const set = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) =>
    setTheme((t) => ({ ...t, [key]: value }));

  const applyPreset = (id: string) => {
    const p = THEME_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setTheme((t) => ({ ...t, primary: p.primary, accent: p.accent, canvas: p.canvas }));
  };

  const handleSave = async (next?: ThemeSettings) => {
    const payload = next ?? theme;
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: payload }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Gagal menyimpan tema");
      }
      setSuccess(true);
      startTransition(() => router.refresh());
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan tema");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Kembalikan tema ke default? Perubahan tersimpan akan ditimpa.")) return;
    setTheme(DEFAULT_THEME);
    void handleSave(DEFAULT_THEME);
  };

  const handleLogoUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload gagal");
      set("logoUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* ==================== KONTROL ==================== */}
      <div className="space-y-6">
        {/* Preset */}
        <section className="bg-white border-2 border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-black" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">
              Preset Tema
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEME_PRESETS.map((p) => {
              const active = activePreset?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`text-left border-2 p-3 transition-colors ${
                    active
                      ? "border-black bg-neutral-50"
                      : "border-neutral-300 hover:border-neutral-800"
                  }`}
                >
                  <span className="flex gap-1 mb-2">
                    <span
                      className="w-6 h-6 border border-neutral-200"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span
                      className="w-6 h-6 border border-neutral-200"
                      style={{ backgroundColor: p.accent }}
                    />
                    <span
                      className="w-6 h-6 border border-neutral-200"
                      style={{ backgroundColor: p.canvas }}
                    />
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                    {active && <Check size={12} />}
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Warna custom */}
        <section className="bg-white border-2 border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-black" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">
              Warna Kustom
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <ColorField
              label="Warna Utama"
              hint="Header, tombol, footer"
              value={theme.primary}
              onChange={(v) => set("primary", v)}
            />
            <ColorField
              label="Warna Aksen"
              hint="Diskon, badge, highlight"
              value={theme.accent}
              onChange={(v) => set("accent", v)}
            />
            <ColorField
              label="Background"
              hint="Latar halaman"
              value={theme.canvas}
              onChange={(v) => set("canvas", v)}
            />
          </div>
          {warnings.length > 0 && (
            <div className="mt-4 border-2 border-amber-600 bg-amber-50 p-3 space-y-1">
              {warnings.map((w) => (
                <p key={w} className="flex gap-2 text-[11px] text-amber-800">
                  <AlertCircle size={14} className="shrink-0" />
                  {w}
                </p>
              ))}
            </div>
          )}
        </section>

        {/* Font */}
        <section className="bg-white border-2 border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Type size={16} className="text-black" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">
              Font
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {FONT_OPTIONS.map((f) => (
              <label
                key={f.id}
                className={`flex items-start gap-3 border-2 p-3 cursor-pointer transition-colors ${
                  theme.font === f.id
                    ? "border-black bg-neutral-50"
                    : "border-neutral-300 hover:border-neutral-800"
                }`}
              >
                <input
                  type="radio"
                  name="theme_font"
                  checked={theme.font === f.id}
                  onChange={() => set("font", f.id)}
                  className="mt-0.5 accent-black"
                />
                <span>
                  <span className="block text-sm font-bold">{f.label}</span>
                  <span className="block text-[11px] text-neutral-500">{f.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Brand & logo */}
        <section className="bg-white border-2 border-neutral-800 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-black" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">
              Identitas Brand
            </h2>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">
              Nama Brand
            </label>
            <input
              type="text"
              value={theme.brandName}
              maxLength={60}
              onChange={(e) => set("brandName", e.target.value)}
              className="w-full max-w-sm bg-white text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-sm font-semibold"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Dipakai di judul halaman, footer, dan newsletter.
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">
              Logo (PNG/WebP, latar transparan)
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="inline-flex items-center justify-center h-14 px-4 border border-neutral-200"
                style={{ backgroundColor: theme.primary }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={theme.logoUrl}
                  alt="Preview logo"
                  className="h-9 w-auto object-contain brightness-0 invert"
                />
              </span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-neutral-800 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Upload Logo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/webp,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleLogoUpload(f);
                }}
              />
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              Logo ditampilkan putih di atas warna utama (otomatis di-invert).
              Ideal: PNG transparan, lebar ≥ 400px.
            </p>
          </div>
        </section>

        {/* Actions */}
        {error && (
          <div className="border-2 border-red-600 bg-red-50 p-3 flex gap-2 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || warnings.length > 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Simpan Tema
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-3 border-2 border-neutral-800 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            <RotateCcw size={14} />
            Reset Default
          </button>
          {success && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
              <Check size={14} /> Tersimpan
            </span>
          )}
        </div>
      </div>

      {/* ==================== LIVE PREVIEW ==================== */}
      <aside className="lg:sticky lg:top-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">
          Live Preview
        </p>
        <div className="border-2 border-neutral-800 overflow-hidden">
          {/* Header mini */}
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{ backgroundColor: theme.primary }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.logoUrl}
              alt=""
              className="h-5 w-auto object-contain brightness-0 invert"
            />
            <span className="flex-1" />
            <Search size={14} color="#ffffff" />
            <ShoppingCart size={14} color="#ffffff" />
          </div>
          {/* Canvas */}
          <div className="p-3 space-y-3" style={{ backgroundColor: theme.canvas }}>
            <div className="bg-white p-3 shadow-sm">
              <div className="aspect-[4/3] bg-neutral-200 mb-2 flex items-center justify-center text-[10px] text-neutral-400">
                Foto Produk
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                Boxing Gloves Pro
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-bold text-neutral-900">Rp 350.000</p>
                <span
                  className="text-[9px] font-bold text-white px-1.5 py-0.5"
                  style={{ backgroundColor: theme.accent }}
                >
                  -20%
                </span>
              </div>
              <button
                type="button"
                className="mt-2 w-full py-1.5 text-[11px] font-bold text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Beli
              </button>
            </div>
            <div className="bg-white p-3 shadow-sm">
              <p className="text-[11px] font-bold text-neutral-800 mb-1">
                {theme.brandName}
              </p>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                Contoh teks konten di atas background pilihan Anda. Pastikan
                tetap nyaman dibaca.
              </p>
            </div>
          </div>
          {/* Footer mini */}
          <div
            className="px-3 py-2 text-[9px] text-white/70"
            style={{ backgroundColor: darken(theme.primary, 0.1) }}
          >
            © {new Date().getFullYear()} {theme.brandName}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-neutral-500 leading-relaxed">
          Preview perkiraan. Font hanya berubah di storefront setelah disimpan.
        </p>
      </aside>
    </div>
  );
}

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color picker`}
          className="w-10 h-10 border-2 border-neutral-800 cursor-pointer p-0.5 bg-white"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-24 bg-white text-black px-2 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-xs font-mono"
        />
      </div>
      <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>
    </div>
  );
}
