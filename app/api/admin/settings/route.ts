import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";
import { getIntegrationCredential } from "@/lib/integrations/credentials";
import { normalizeTheme, validateTheme } from "@/lib/theme";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_KEYS = new Set([
  "payment_mode",
  "shipping_mode",
  "shipping_manual_fee",
  "shipping_manual_zones",
  "payment_manual_expire_hours",
  "theme",
]);

const VALUE_VALIDATORS: Record<string, (v: unknown) => unknown> = {
  payment_mode: (v) => {
    const s = String(v);
    if (s !== "gateway" && s !== "manual") {
      throw new Error("payment_mode harus 'gateway' atau 'manual'");
    }
    return s;
  },
  shipping_mode: (v) => {
    const s = String(v);
    if (s !== "auto" && s !== "manual") {
      throw new Error("shipping_mode harus 'auto' atau 'manual'");
    }
    return s;
  },
  shipping_manual_fee: (v) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error("shipping_manual_fee harus angka >= 0");
    }
    return String(Math.round(n));
  },
  shipping_manual_zones: (v) => {
    if (!Array.isArray(v)) {
      throw new Error("shipping_manual_zones harus array");
    }
    return v.map((zone, idx) => {
      if (!zone || typeof zone !== "object") {
        throw new Error(`Zona ongkir #${idx + 1} tidak valid`);
      }
      const z = zone as Record<string, unknown>;
      const label = typeof z.label === "string" ? z.label.trim() : "";
      if (!label) {
        throw new Error(`Zona ongkir #${idx + 1} butuh nama`);
      }
      const provinces = Array.isArray(z.provinces)
        ? z.provinces
            .filter((p): p is string => typeof p === "string" && p.trim() !== "")
            .map((p) => p.trim())
        : [];
      const fee = Number(z.fee);
      if (!Number.isFinite(fee) || fee < 0) {
        throw new Error(`Ongkir zona "${label}" harus angka >= 0`);
      }
      return { label, provinces, fee: Math.round(fee) };
    });
  },
  payment_manual_expire_hours: (v) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 1) {
      throw new Error("payment_manual_expire_hours harus angka >= 1");
    }
    return String(Math.round(n));
  },
  theme: (v) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) {
      throw new Error("theme harus berupa object");
    }
    const errors = validateTheme(v as Record<string, unknown>);
    if (errors.length > 0) {
      throw new Error(errors.join(" · "));
    }
    // Return raw (sudah tervalidasi); merge dengan theme tersimpan terjadi
    // di PUT setelah nilai lama di-fetch, supaya update parsial tidak
    // me-reset field lain ke default.
    return v;
  },
};

/**
 * GET /api/admin/settings
 * Return semua settings (untuk admin UI).
 * Note: settings lain juga di-expose ke public via RLS — tapi ini endpoint
 * untuk admin panel (no filter). Kalau perlu expose ke frontend, tambahkan
 * endpoint terpisah /api/public/settings.
 */
export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }
  const { data, error } = await supabase
    .from("settings")
    .select("key, value, description, updated_at");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data ?? [] });
}

/**
 * PUT /api/admin/settings
 * Update satu atau beberapa settings sekaligus.
 * Body: { payment_mode?, shipping_mode?, shipping_manual_fee?, payment_manual_expire_hours? }
 * Auth: admin session cookie required.
 */
export async function PUT(request: NextRequest) {
  // Verify admin session
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  // Validate keys & values
  const updates: Array<{ key: string; value: unknown; oldValue: unknown }> = [];
  for (const [key, rawValue] of Object.entries(body)) {
    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json(
        { error: `Setting '${key}' tidak dikenal atau tidak boleh diubah` },
        { status: 400 },
      );
    }
    let validated: unknown;
    try {
      validated = VALUE_VALIDATORS[key](rawValue);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Validasi gagal" },
        { status: 400 },
      );
    }
    updates.push({ key, value: validated, oldValue: null });
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Body kosong" }, { status: 400 });
  }

  if (updates.some((item) => item.key === "payment_mode" && item.value === "gateway")) {
    const credential = await getIntegrationCredential("midtrans");
    if (!credential.secrets.serverKey || !credential.publicConfig.clientKey) {
      return NextResponse.json(
        { error: "Simpan Client Key dan Server Key Midtrans sebelum mengaktifkan mode otomatis" },
        { status: 409 },
      );
    }
  }
  if (updates.some((item) => item.key === "shipping_mode" && item.value === "auto")) {
    const credential = await getIntegrationCredential("everpro");
    if (!credential.secrets.clientKey || !credential.secrets.clientSecret) {
      return NextResponse.json(
        { error: "Simpan Client Key dan Client Secret Everpro sebelum mengaktifkan shipping otomatis" },
        { status: 409 },
      );
    }
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // Fetch old values for audit log
  const { data: oldRows } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", updates.map((u) => u.key));
  const oldMap = new Map<string, unknown>(
    (oldRows ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]),
  );

  // Theme: merge input parsial di atas theme tersimpan sebelum normalisasi,
  // supaya field yang tidak dikirim tidak ter-reset ke default.
  for (const u of updates) {
    if (u.key !== "theme") continue;
    let stored: unknown = oldMap.get("theme") ?? null;
    if (typeof stored === "string") {
      try {
        stored = JSON.parse(stored);
      } catch {
        stored = null;
      }
    }
    const base = normalizeTheme(stored);
    u.value = normalizeTheme({ ...base, ...(u.value as object) }, base);
  }

  // Upsert each setting
  for (const u of updates) {
    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: u.key,
          value: u.value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    if (error) {
      return NextResponse.json(
        { error: `Gagal update '${u.key}': ${error.message}` },
        { status: 500 },
      );
    }
  }

  // Insert audit log entries
  const auditRows = updates.map((u) => ({
    setting_key: u.key,
    old_value: oldMap.get(u.key) ?? null,
    new_value: u.value,
    // changed_by: ambil dari admin session (skip dulu — JWT tidak expose user id)
  }));
  const { error: auditError } = await supabase
    .from("settings_audit_log")
    .insert(auditRows);
  if (auditError) {
    // Audit log failure tidak boleh block update — log warning
    console.warn("[api/admin/settings] audit log error:", auditError.message);
  }

  // Settings (theme, payment/shipping mode) dipakai layout & halaman ISR —
  // invalidate supaya perubahan langsung tampil tanpa menunggu revalidate window.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, updated: updates.map((u) => u.key) });
}
