import { NextResponse } from "next/server";
import {
  getPaymentMode,
  getShippingMode,
  getShippingManualFee,
  getShippingManualZones,
} from "@/lib/storefront/settings";
import { getIntegrationCredential } from "@/lib/integrations/credentials";

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
    const [mode, shippingMode, shippingManualFee, shippingManualZones, midtrans] = await Promise.all([
      getPaymentMode(),
      getShippingMode(),
      getShippingManualFee(),
      getShippingManualZones(),
      getIntegrationCredential("midtrans"),
    ]);
    return NextResponse.json({
      mode,
      shippingMode,
      shippingManualFee,
      shippingManualZones,
      midtrans: {
        clientKey: String(midtrans.publicConfig.clientKey ?? ""),
        environment: midtrans.environment,
        configured: Boolean(midtrans.secrets.serverKey && midtrans.publicConfig.clientKey),
      },
    });
  } catch (err) {
    console.warn("[storefront/payment-mode] error:", err);
    // Fallback aman ke gateway kalau ada error (existing behavior)
    return NextResponse.json({ mode: "gateway" });
  }
}
