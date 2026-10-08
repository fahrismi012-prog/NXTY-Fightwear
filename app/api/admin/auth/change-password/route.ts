import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";
import {
  verifyAdminPassword,
  hashAdminPassword,
} from "@/lib/admin/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/auth/change-password
 * Admin ganti password sendiri. Butuh sesi admin valid + password saat ini.
 * Password baru di-hash scrypt lalu disimpan di settings (key admin_password_hash);
 * verifyAdminPassword jadi cek hash DB dulu, fallback ke env ADMIN_PASSWORD.
 */
export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json(
      { error: "Sesi admin tidak valid. Login ulang." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  const { currentPassword, newPassword } = (body ?? {}) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Password saat ini dan password baru wajib diisi" },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password baru minimal 8 karakter" },
      { status: 400 },
    );
  }

  const result = await verifyAdminPassword(currentPassword);
  if (result === "unconfigured") {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD belum di-set di server" },
      { status: 500 },
    );
  }
  if (result !== "valid") {
    return NextResponse.json(
      { error: "Password saat ini salah" },
      { status: 401 },
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase belum dikonfigurasi" },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("settings").upsert(
    {
      key: "admin_password_hash",
      value: hashAdminPassword(newPassword),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) {
    console.error("[admin/change-password] upsert error:", error.message);
    return NextResponse.json(
      { error: "Gagal menyimpan password baru" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
