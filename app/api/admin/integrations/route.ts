import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/supabase/auth";
import {
  encryptSecrets,
  getIntegrationCredential,
  maskSecret,
  type IntegrationEnvironment,
  type IntegrationProvider,
} from "@/lib/integrations/credentials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized() {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [midtrans, everpro] = await Promise.all([
    getIntegrationCredential("midtrans"),
    getIntegrationCredential("everpro"),
  ]);
  return NextResponse.json({
    integrations: [midtrans, everpro].map((item) => ({
      provider: item.provider,
      environment: item.environment,
      publicConfig: item.publicConfig,
      configured: Object.values(item.secrets).some(Boolean),
      secretMasks: Object.fromEntries(
        Object.entries(item.secrets).map(([key, value]) => [key, maskSecret(value)]),
      ),
      source: item.source,
    })),
    encryptionReady: Boolean(process.env.CREDENTIALS_ENCRYPTION_KEY),
  });
}

export async function PUT(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const provider = body?.provider as IntegrationProvider;
  const environment = body?.environment as IntegrationEnvironment;
  if (!(["midtrans", "everpro"] as string[]).includes(provider)) {
    return NextResponse.json({ error: "Provider tidak valid" }, { status: 400 });
  }
  if (!(["sandbox", "production"] as string[]).includes(environment)) {
    return NextResponse.json({ error: "Environment tidak valid" }, { status: 400 });
  }

  const existing = await getIntegrationCredential(provider);
  const submittedSecrets = (body?.secrets ?? {}) as Record<string, unknown>;
  const allowedSecretKeys = provider === "midtrans"
    ? ["serverKey"]
    : ["clientKey", "clientSecret", "callbackSecret"];
  const secrets = { ...existing.secrets };
  for (const key of allowedSecretKeys) {
    const value = submittedSecrets[key];
    if (typeof value === "string" && value.trim()) secrets[key] = value.trim();
  }
  const publicConfig = (body?.publicConfig ?? {}) as Record<string, unknown>;
  if (provider === "midtrans" && typeof publicConfig.clientKey !== "string") {
    return NextResponse.json({ error: "Client Key Midtrans wajib diisi" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  let encrypted: string;
  try {
    encrypted = encryptSecrets(secrets);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengenkripsi" }, { status: 503 });
  }
  const { error } = await supabase.from("integration_credentials").upsert({
    provider,
    environment,
    public_config: publicConfig,
    encrypted_secrets: encrypted,
    updated_at: new Date().toISOString(),
  }, { onConflict: "provider" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
