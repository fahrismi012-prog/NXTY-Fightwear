import { NextResponse } from "next/server";

/**
 * Newsletter subscribe endpoint stub.
 *
 * Untuk fase 1 ini, endpoint hanya validate format email dan return ok.
 * Integrasi ke email service (Resend, Mailchimp, dll) ditunda ke fase
 * production-readiness.
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email wajib diisi" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // TODO: integrate dengan email service di fase production.
    // Untuk sekarang, log saja agar dev tahu submission masuk.
    console.info("[newsletter] subscribe (stub):", email);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
