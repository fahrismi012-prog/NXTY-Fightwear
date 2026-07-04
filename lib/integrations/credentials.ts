import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";

export type IntegrationProvider = "midtrans" | "everpro";
export type IntegrationEnvironment = "sandbox" | "production";

interface CredentialRow {
  provider: IntegrationProvider;
  environment: IntegrationEnvironment;
  public_config: Record<string, unknown> | null;
  encrypted_secrets: string | null;
}

export interface IntegrationCredential {
  provider: IntegrationProvider;
  environment: IntegrationEnvironment;
  publicConfig: Record<string, unknown>;
  secrets: Record<string, string>;
  source: "database" | "environment";
}

function encryptionKey(): Buffer | null {
  const secret = process.env.CREDENTIALS_ENCRYPTION_KEY;
  return secret ? createHash("sha256").update(secret).digest() : null;
}

export function encryptSecrets(value: Record<string, string>): string {
  const key = encryptionKey();
  if (!key) throw new Error("CREDENTIALS_ENCRYPTION_KEY belum dikonfigurasi");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

function decryptSecrets(payload: string | null): Record<string, string> {
  if (!payload) return {};
  const key = encryptionKey();
  if (!key) throw new Error("CREDENTIALS_ENCRYPTION_KEY belum dikonfigurasi");
  const [ivRaw, tagRaw, ciphertextRaw] = payload.split(".");
  if (!ivRaw || !tagRaw || !ciphertextRaw) throw new Error("Format credential tidak valid");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(plaintext) as Record<string, string>;
}

function environmentFallback(provider: IntegrationProvider): IntegrationCredential {
  if (provider === "midtrans") {
    return {
      provider,
      environment: process.env.MIDTRANS_IS_PRODUCTION === "true" ? "production" : "sandbox",
      publicConfig: { clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "" },
      secrets: { serverKey: process.env.MIDTRANS_SERVER_KEY ?? "" },
      source: "environment",
    };
  }
  return {
    provider,
    environment: process.env.EVERPRO_ENVIRONMENT === "production" ? "production" : "sandbox",
    publicConfig: {
      baseUrl: process.env.EVERPRO_BASE_URL ?? "https://client-api-sandbox.everpro.id",
    },
    secrets: {
      clientKey: process.env.EVERPRO_API_KEY ?? "",
      clientSecret: process.env.EVERPRO_API_SECRET ?? "",
      callbackSecret: process.env.EVERPRO_CALLBACK_SECRET ?? "",
    },
    source: "environment",
  };
}

export async function getIntegrationCredential(provider: IntegrationProvider): Promise<IntegrationCredential> {
  const fallback = environmentFallback(provider);
  const supabase = createAdminClient();
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from("integration_credentials")
    .select("provider, environment, public_config, encrypted_secrets")
    .eq("provider", provider)
    .maybeSingle();
  if (error || !data) return fallback;
  const row = data as CredentialRow;
  let secrets: Record<string, string> = {};
  try {
    secrets = decryptSecrets(row.encrypted_secrets);
  } catch (error) {
    console.error(`[credentials] gagal membuka credential ${provider}:`, error);
  }
  return {
    provider,
    environment: row.environment,
    publicConfig: row.public_config ?? {},
    secrets,
    source: "database",
  };
}

export function maskSecret(value: string | undefined): string | null {
  if (!value) return null;
  return `••••${value.slice(-4)}`;
}
