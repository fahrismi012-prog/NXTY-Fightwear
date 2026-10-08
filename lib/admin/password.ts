import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";

export type AdminPasswordResult = "valid" | "invalid" | "unconfigured";

const ADMIN_PASSWORD_HASH_KEY = "admin_password_hash";

/**
 * Hash password admin dengan scrypt (tanpa dependency eksternal).
 * Format tersimpan: "scrypt$<saltHex>$<hashHex>".
 */
export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyScryptHash(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    const supplied = scryptSync(
      password,
      Buffer.from(saltHex, "hex"),
      expected.length,
    );
    return timingSafeEqual(supplied, expected);
  } catch {
    return false;
  }
}

/** Baca hash dari tabel settings. Null = belum pernah diganti via UI. */
async function readStoredHash(): Promise<string | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", ADMIN_PASSWORD_HASH_KEY)
      .maybeSingle();
    if (!data) return null;
    const raw = data.value;
    if (typeof raw !== "string") return null;
    // Toleransi format lama: jsonb yang tersimpan sebagai string JSON terkutip
    const trimmed = raw.trim();
    if (
      trimmed.length >= 2 &&
      ((trimmed[0] === '"' && trimmed.at(-1) === '"') ||
        (trimmed[0] === "'" && trimmed.at(-1) === "'"))
    ) {
      try {
        return JSON.parse(trimmed) as string;
      } catch {
        return null;
      }
    }
    return trimmed || null;
  } catch {
    return null;
  }
}

/**
 * Verifikasi password admin.
 * Prioritas: hash di tabel settings (diganti via UI) → fallback env ADMIN_PASSWORD.
 */
export async function verifyAdminPassword(
  password: unknown,
): Promise<AdminPasswordResult> {
  if (typeof password !== "string" || password.length === 0) return "invalid";

  const stored = await readStoredHash();
  if (stored) {
    return verifyScryptHash(password, stored) ? "valid" : "invalid";
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return "unconfigured";

  const suppliedBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);

  if (suppliedBuffer.length !== expectedBuffer.length) return "invalid";
  return timingSafeEqual(suppliedBuffer, expectedBuffer) ? "valid" : "invalid";
}
