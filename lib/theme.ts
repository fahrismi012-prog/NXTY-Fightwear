/**
 * Theme engine untuk white-label storefront.
 *
 * Konsep: komponen hanya memakai token semantik (bg-brand-black, bg-canvas,
 * dst. — lihat globals.css). Nilai token dipetakan ke CSS variables runtime
 * (--brand-primary, --page-canvas, ...) yang di-inject dari database di
 * app/layout.tsx. Ganti nilai di settings → seluruh toko berubah tanpa deploy.
 *
 * Klien hanya memilih 3 warna (primary, accent, canvas); turunan seperti
 * hover shade & surface dihitung otomatis supaya hasil tetap konsisten.
 */

export interface ThemeSettings {
  /** Warna utama brand — header, tombol, footer. Harus cukup gelap. */
  primary: string;
  /** Warna aksen — badge diskon, notifikasi, highlight. */
  accent: string;
  /** Warna background halaman. Harus terang. */
  canvas: string;
  /** Font storefront. Harus salah satu dari FONT_OPTIONS. */
  font: ThemeFont;
  /** Nama brand — dipakai di title, header aria-label, footer. */
  brandName: string;
  /** URL logo (path lokal /brand/... atau URL Supabase Storage). */
  logoUrl: string;
  /**
   * Render logo sebagai siluet putih (brightness-0 invert) di atas warna
   * primary. Matikan untuk logo berwarna yang sudah kontras di latar gelap.
   */
  logoInvert: boolean;
  /** Copy hero home page — white-label, editable per klien. */
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  /** Teks bar promo tipis di atas header. Kosong = bar disembunyikan. */
  promoBarText: string;
  /** Nomor WhatsApp CS format internasional (628...). Kosong = tombol float disembunyikan. */
  whatsappNumber: string;
}

export type ThemeFont = "inter" | "poppins" | "manrope" | "jakarta";

export const FONT_OPTIONS: Array<{ id: ThemeFont; label: string; hint: string }> = [
  { id: "inter", label: "Inter", hint: "Netral & modern (default)" },
  { id: "poppins", label: "Poppins", hint: "Geometris, ramah, bold" },
  { id: "manrope", label: "Manrope", hint: "Tegas & clean, cocok sporty" },
  { id: "jakarta", label: "Plus Jakarta Sans", hint: "Profesional, sentuhan lokal" },
];

export const DEFAULT_THEME: ThemeSettings = {
  primary: "#0a0a0a",
  accent: "#dc2626",
  canvas: "#f5f4f0",
  font: "inter",
  brandName: "Anxiety Fightwear",
  logoUrl: "/brand/logo-mark.png",
  logoInvert: true,
  heroEyebrow: "Sejak 2014 · Bandung, Indonesia",
  heroTitle: "Peralatan Beladiri\nLangsung dari Pabrik",
  heroSubtitle:
    "{brand} memproduksi peralatan olahraga beladiri di pabrik kami sendiri — kualitas terjamin dengan harga yang bersaing, dari matras hingga body protector.",
  promoBarText: "",
  whatsappNumber: "",
};

export interface ThemePreset {
  id: string;
  label: string;
  primary: string;
  accent: string;
  canvas: string;
}

/** Preset terkurasi — 90% klien cukup pilih salah satu dari sini. */
export const THEME_PRESETS: ThemePreset[] = [
  { id: "mono", label: "Mono Hitam", primary: "#0a0a0a", accent: "#dc2626", canvas: "#f5f4f0" },
  { id: "forest", label: "Hijau Forest", primary: "#1b4332", accent: "#d97706", canvas: "#f4f6f2" },
  { id: "sport", label: "Merah Sport", primary: "#7f1d1d", accent: "#f59e0b", canvas: "#faf5f2" },
  { id: "navy", label: "Biru Navy", primary: "#1e3a5f", accent: "#e11d48", canvas: "#f2f5f8" },
  { id: "earth", label: "Coklat Earth", primary: "#44342a", accent: "#ca8a04", canvas: "#f7f4ef" },
  { id: "royal", label: "Ungu Royal", primary: "#3b2a63", accent: "#db2777", canvas: "#f5f3f8" },
];

/* ============================================================
   COLOR UTILS
   ============================================================ */

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function isHexColor(v: unknown): v is string {
  return typeof v === "string" && HEX_RE.test(v.trim());
}

function hexToRgb(hex: string): [number, number, number] {
  const m = HEX_RE.exec(hex.trim());
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** amount 0..1 — campur warna ke arah hitam (darken) */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** amount 0..1 — campur warna ke arah putih (lighten) */
export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

/** WCAG relative luminance 0..1 */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio 1..21 */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* ============================================================
   VALIDATION / NORMALIZATION
   ============================================================ */

/**
 * Guardrail supaya klien tidak merusak tampilannya sendiri:
 * - primary harus cukup gelap (teks putih di atasnya minimal AA large ≈ 3:1;
 *   kita pakai 4.5 supaya aman untuk teks kecil di header/tombol)
 * - canvas harus cukup terang (teks gelap #212121 tetap terbaca)
 */
export const PRIMARY_MIN_CONTRAST = 4.5;
export const CANVAS_MIN_CONTRAST = 7;
/** Badge diskon: teks putih bold ukuran kecil → minimal AA large (3:1). */
export const ACCENT_MIN_CONTRAST = 3;

export function validateTheme(input: Partial<ThemeSettings>): string[] {
  const errors: string[] = [];
  if (input.primary !== undefined) {
    if (!isHexColor(input.primary)) errors.push("Warna utama harus format hex #rrggbb");
    else if (contrastRatio(input.primary, "#ffffff") < PRIMARY_MIN_CONTRAST)
      errors.push(
        "Warna utama terlalu terang — teks putih di header/tombol tidak akan terbaca. Pilih warna yang lebih gelap.",
      );
  }
  if (input.accent !== undefined) {
    if (!isHexColor(input.accent)) errors.push("Warna aksen harus format hex #rrggbb");
    else if (contrastRatio(input.accent, "#ffffff") < ACCENT_MIN_CONTRAST)
      errors.push(
        "Warna aksen terlalu terang — teks putih di badge diskon tidak akan terbaca. Pilih warna yang lebih pekat.",
      );
  }
  if (input.canvas !== undefined) {
    if (!isHexColor(input.canvas)) errors.push("Warna background harus format hex #rrggbb");
    else if (contrastRatio(input.canvas, "#212121") < CANVAS_MIN_CONTRAST)
      errors.push(
        "Warna background terlalu gelap — teks konten tidak akan terbaca. Pilih warna yang lebih terang.",
      );
  }
  if (
    input.font !== undefined &&
    !FONT_OPTIONS.some((f) => f.id === input.font)
  ) {
    errors.push("Font tidak dikenal");
  }
  if (input.brandName !== undefined) {
    const s = String(input.brandName).trim();
    if (!s || s.length > 60) errors.push("Nama brand wajib diisi, maksimal 60 karakter");
  }
  if (input.logoUrl !== undefined) {
    const s = String(input.logoUrl).trim();
    const ok = s === "" || s.startsWith("/") || s.startsWith("https://");
    if (!ok || s.length > 500) errors.push("URL logo harus path lokal (/...) atau https://");
  }
  return errors;
}

/** Merge input (jsonb dari DB / body request) dengan default, buang field invalid. */
export function normalizeTheme(raw: unknown): ThemeSettings {
  const t: ThemeSettings = { ...DEFAULT_THEME };
  if (!raw || typeof raw !== "object") return t;
  const input = raw as Record<string, unknown>;

  if (isHexColor(input.primary) && contrastRatio(String(input.primary), "#ffffff") >= 3)
    t.primary = String(input.primary).toLowerCase();
  if (isHexColor(input.accent)) t.accent = String(input.accent).toLowerCase();
  if (isHexColor(input.canvas) && contrastRatio(String(input.canvas), "#212121") >= 4.5)
    t.canvas = String(input.canvas).toLowerCase();
  if (FONT_OPTIONS.some((f) => f.id === input.font)) t.font = input.font as ThemeFont;
  if (typeof input.brandName === "string" && input.brandName.trim())
    t.brandName = input.brandName.trim().slice(0, 60);
  if (
    typeof input.logoUrl === "string" &&
    (input.logoUrl.startsWith("/") || input.logoUrl.startsWith("https://"))
  )
    t.logoUrl = input.logoUrl.trim().slice(0, 500);
  if (typeof input.logoInvert === "boolean") t.logoInvert = input.logoInvert;
  if (typeof input.heroEyebrow === "string")
    t.heroEyebrow = input.heroEyebrow.trim().slice(0, 80);
  if (typeof input.heroTitle === "string" && input.heroTitle.trim())
    t.heroTitle = input.heroTitle.trim().slice(0, 120);
  if (typeof input.heroSubtitle === "string" && input.heroSubtitle.trim())
    t.heroSubtitle = input.heroSubtitle.trim().slice(0, 300);
  if (typeof input.promoBarText === "string")
    t.promoBarText = input.promoBarText.trim().slice(0, 120);
  if (typeof input.whatsappNumber === "string")
    t.whatsappNumber = input.whatsappNumber.replace(/\D/g, "").slice(0, 20);

  return t;
}

/* ============================================================
   CSS VARIABLES
   ============================================================ */

/**
 * Map theme → CSS custom properties runtime.
 * Nama var di sini harus sinkron dengan :root di globals.css.
 */
export function themeToCssVars(theme: ThemeSettings): Record<string, string> {
  return {
    "--brand-primary": theme.primary,
    "--brand-primary-hover": darken(theme.primary, 0.25),
    "--brand-accent": theme.accent,
    "--brand-accent-hover": darken(theme.accent, 0.15),
    "--page-canvas": theme.canvas,
    "--page-surface-2": darken(theme.canvas, 0.03),
    "--theme-font": `var(--font-${theme.font})`,
  };
}
