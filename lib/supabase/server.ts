import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client dengan service role key.
 * HANYA dipakai di server (API routes, server components, scripts).
 * Bypass RLS — jangan expose ke browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/**
 * Server-side Supabase client dengan anon key (RLS aktif).
 * Untuk storefront yang baca data publik (products, categories, dll).
 */
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
