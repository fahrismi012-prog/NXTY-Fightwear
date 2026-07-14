import { createAdminClient } from "@/lib/supabase/server";
import { normalizeTheme, type ThemeSettings } from "@/lib/theme";
import { resolveManualShippingFee, type ShippingZone } from "@/lib/shipping/manual";

/**
 * Helper untuk baca settings di server-side.
 * Fallback ke default value kalau setting belum ada (misal env Supabase
 * belum diset, atau row di settings belum ada).
 */

const DEFAULTS: Record<string, string> = {
  payment_mode: "gateway",
  shipping_mode: "auto",
  shipping_manual_fee: "15000",
  payment_manual_expire_hours: "24",
};

/**
 * Unwrap value dari jsonb ke string biasa.
 * Handle multiple format: JSON string literal ("manual"), plain string (manual),
 * number, atau boolean. Tolerant terhadap format lama dari SQL seed yang mungkin
 * menyimpan dengan kutip literal.
 */
function unwrapValue(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    // Kalau string terlihat seperti JSON-encoded ("..." atau '...'), parse
    if (trimmed.length >= 2) {
      const first = trimmed[0];
      const last = trimmed[trimmed.length - 1];
      if (
        (first === '"' && last === '"') ||
        (first === "'" && last === "'")
      ) {
        try {
          // Normalize single quote ke double quote untuk JSON.parse
          const normalized = trimmed.replace(/^'|'$/g, '"');
          const parsed = JSON.parse(normalized);
          if (parsed !== null && parsed !== undefined) return String(parsed);
        } catch {
          // Fallback ke raw trimmed
        }
      }
    }
    return trimmed;
  }
  // number, boolean, dll
  return String(raw);
}

async function readSetting(key: string): Promise<string> {
  const fallback = DEFAULTS[key] ?? "";

  const supabase = createAdminClient();
  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return fallback;
    return unwrapValue(data.value);
  } catch {
    return fallback;
  }
}

/**
 * Return theme settings storefront (white-label).
 * Value di DB berupa jsonb object; field invalid/hilang di-fallback ke
 * DEFAULT_THEME oleh normalizeTheme, jadi selalu aman dipakai.
 */
export async function getTheme(): Promise<ThemeSettings> {
  const supabase = createAdminClient();
  if (!supabase) return normalizeTheme(null);
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "theme")
      .maybeSingle();
    if (error || !data) return normalizeTheme(null);
    let value: unknown = data.value;
    // Tolerate jsonb yang tersimpan sebagai string JSON
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        value = null;
      }
    }
    return normalizeTheme(value);
  } catch {
    return normalizeTheme(null);
  }
}

/** Return current payment mode: "gateway" | "manual" */
export async function getPaymentMode(): Promise<"gateway" | "manual"> {
  const v = await readSetting("payment_mode");
  return v === "manual" ? "manual" : "gateway";
}

/** Return current shipping mode: "auto" | "manual" */
export async function getShippingMode(): Promise<"auto" | "manual"> {
  const v = await readSetting("shipping_mode");
  return v === "manual" ? "manual" : "auto";
}

/** Return fixed shipping fee (default nasional) untuk mode manual (Rupiah) */
export async function getShippingManualFee(): Promise<number> {
  const v = await readSetting("shipping_manual_fee");
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 15000;
}

/** Return daftar zona ongkir manual (per provinsi). Kosong = belum diset admin. */
export async function getShippingManualZones(): Promise<ShippingZone[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "shipping_manual_zones")
      .maybeSingle();
    if (error || !data) return [];
    let value: unknown = data.value;
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? (value as ShippingZone[]) : [];
  } catch {
    return [];
  }
}

/**
 * Ongkir manual final untuk sebuah provinsi: pakai fee zona kalau
 * provinsi cocok, fallback ke fee nasional (shipping_manual_fee).
 */
export async function getManualShippingFee(
  province?: string | null,
): Promise<number> {
  const [defaultFee, zones] = await Promise.all([
    getShippingManualFee(),
    getShippingManualZones(),
  ]);
  return resolveManualShippingFee(zones, defaultFee, province);
}

/** Return bank accounts yang aktif (untuk display di checkout manual) */
export async function getActiveBankAccounts() {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(
      "id, bank_name, account_number, account_holder, instructions, is_active, display_order",
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("[storefront/settings] bank_accounts error:", error.message);
    return [];
  }
  return data ?? [];
}
