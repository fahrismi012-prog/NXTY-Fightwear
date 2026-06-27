import { createClient } from "@supabase/supabase-js";

/**
 * Cek apakah Supabase admin credentials sudah diset.
 */
export function isSupabaseAdminConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Create Supabase admin server client dengan service role key.
 * Return null jika env vars belum diset (gracefully).
 *
 * Caller HARUS handle null dengan response 503 atau fallback.
 */
export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    console.warn(
      "[Supabase] SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diset. Admin operations disabled."
    );
    return null;
  }
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
