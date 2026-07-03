import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";

/**
 * Kirim magic link atau OTP ke email customer.
 * Jika useOtp = true, kirim 6-digit code.
 * Jika useOtp = false, kirim magic link ke email.
 */
export async function signInWithEmail(
  email: string,
  useOtp: boolean = false
): Promise<void> {
  const supabase = createClient();
  const options = useOtp
    ? { shouldCreateUser: true }
    : {
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        shouldCreateUser: true,
      };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options,
  });
  if (error) throw error;
}

/**
 * Verifikasi OTP code (kalau user pakai mode OTP).
 */
export async function verifyOtp(
  email: string,
  token: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw error;
}

/**
 * Daftar akun baru dengan email + password.
 * Rate limit Supabase signUp: 30/jam per IP (vs OTP hanya 4/jam).
 */
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<{ needsEmailConfirmation: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
    },
  });
  if (error) throw error;
  // Kalau session langsung ada (email confirmation disabled di Dashboard),
  // user auto-login. Kalau tidak, perlu konfirmasi email dulu.
  const needsEmailConfirmation = !data.session;
  return { needsEmailConfirmation };
}

/**
 * Login dengan email + password.
 * Lebih reliable dari OTP, tidak ada rate limit issue (lebih tinggi).
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
}

/**
 * Request reset password via email.
 * User akan terima email dengan link untuk set password baru.
 */
export async function resetPassword(email: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?type=recovery`,
  });
  if (error) throw error;
}

/**
 * Logout customer.
 */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Ambil current user (client-side).
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe ke perubahan auth state (login/logout).
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = createClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null);
    }
  );
  return subscription;
}
