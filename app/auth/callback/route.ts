import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Handle auth callback dari Supabase (magic link / OAuth).
 * Tukar code dengan session, simpan cookies, redirect ke /akun.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  // Untuk recovery (reset password flow), redirect ke halaman reset-password.
  // Supabase sudah set session cookie via exchangeCodeForSession, jadi user
  // sudah ter-authenticate dan bisa update password di /auth/reset-password.
  // Untuk type lain (magiclink/signup/oauth), default ke /akun.
  const requestedNext = searchParams.get("next");
  const safeNext =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/akun";
  const next =
    type === "recovery"
      ? "/auth/reset-password"
      : safeNext;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Fallback: error, redirect ke login
  return NextResponse.redirect(new URL("/masuk?error=auth", origin));
}
