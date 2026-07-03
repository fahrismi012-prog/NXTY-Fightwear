import { createAdminClient } from "@/lib/supabase/server";

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
    // value adalah jsonb — bisa string ("gateway") atau number (15000)
    return String(data.value);
  } catch {
    return fallback;
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

/** Return fixed shipping fee untuk mode manual (Rupiah) */
export async function getShippingManualFee(): Promise<number> {
  const v = await readSetting("shipping_manual_fee");
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 15000;
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
