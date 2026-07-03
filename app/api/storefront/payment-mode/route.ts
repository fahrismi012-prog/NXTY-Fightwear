import { NextResponse } from "next/server";
import { getPaymentMode } from "@/lib/storefront/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/storefront/payment-mode
 *
 * Returns current payment mode untuk frontend checkout branching.
 * Public endpoint (no auth) — value diset via /admin/settings.
 *
 * Cache: revalidate setiap 60 detik (sinkron dengan homepage ISR).
 */
export const revalidate = 60;

export async function GET() {
  try {
    const mode = await getPaymentMode();
    return NextResponse.json({ mode });
  } catch (err) {
    console.warn("[storefront/payment-mode] error:", err);
    // Fallback aman ke gateway kalau ada error (existing behavior)
    return NextResponse.json({ mode: "gateway" });
  }
}
