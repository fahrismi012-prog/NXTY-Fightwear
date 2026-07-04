"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, Save } from "lucide-react";

type Environment = "sandbox" | "production";
type Provider = "midtrans" | "everpro";

interface IntegrationSummary {
  provider: Provider;
  environment: Environment;
  publicConfig: Record<string, unknown>;
  configured: boolean;
  secretMasks: Record<string, string | null>;
  source: "database" | "environment";
}

interface FormState {
  environment: Environment;
  clientKey: string;
  serverKey: string;
  clientSecret: string;
  callbackSecret: string;
  baseUrl: string;
  shipperName: string;
  shipperPhone: string;
  shipperAddress: string;
  shipperPostalCode: string;
}

const EMPTY: Record<Provider, FormState> = {
  midtrans: { environment: "sandbox", clientKey: "", serverKey: "", clientSecret: "", callbackSecret: "", baseUrl: "", shipperName: "", shipperPhone: "", shipperAddress: "", shipperPostalCode: "" },
  everpro: { environment: "sandbox", clientKey: "", serverKey: "", clientSecret: "", callbackSecret: "", baseUrl: "https://client-api-sandbox.everpro.id", shipperName: "NXTY Fightwear", shipperPhone: "", shipperAddress: "", shipperPostalCode: "" },
};

export default function IntegrationSettings() {
  const [forms, setForms] = useState(EMPTY);
  const [summaries, setSummaries] = useState<IntegrationSummary[]>([]);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [busy, setBusy] = useState<Provider | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/admin/integrations", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Gagal memuat integrasi");
    setSummaries(data.integrations ?? []);
    setEncryptionReady(Boolean(data.encryptionReady));
    setForms((current) => {
      const next = { ...current };
      for (const item of data.integrations as IntegrationSummary[]) {
        next[item.provider] = {
          ...current[item.provider],
          environment: item.environment,
          clientKey: String(item.publicConfig.clientKey ?? ""),
          baseUrl: String(item.publicConfig.baseUrl ?? current[item.provider].baseUrl),
          shipperName: String(item.publicConfig.shipperName ?? current[item.provider].shipperName),
          shipperPhone: String(item.publicConfig.shipperPhone ?? current[item.provider].shipperPhone),
          shipperAddress: String(item.publicConfig.shipperAddress ?? current[item.provider].shipperAddress),
          shipperPostalCode: String(item.publicConfig.shipperPostalCode ?? current[item.provider].shipperPostalCode),
        };
      }
      return next;
    });
  };

  useEffect(() => {
    // Data berasal dari endpoint admin dan hanya dimuat sekali saat panel dibuka.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((error) => setMessage(error.message));
  }, []);

  const update = (provider: Provider, patch: Partial<FormState>) => {
    setForms((current) => ({ ...current, [provider]: { ...current[provider], ...patch } }));
  };

  const save = async (provider: Provider) => {
    setBusy(provider);
    setMessage(null);
    const form = forms[provider];
    const payload = provider === "midtrans"
      ? {
          provider,
          environment: form.environment,
          publicConfig: { clientKey: form.clientKey.trim() },
          secrets: { serverKey: form.serverKey.trim() },
        }
      : {
          provider,
          environment: form.environment,
          publicConfig: {
            baseUrl: form.baseUrl.trim(),
            shipperName: form.shipperName.trim(),
            shipperPhone: form.shipperPhone.trim(),
            shipperAddress: form.shipperAddress.trim(),
            shipperPostalCode: form.shipperPostalCode.trim(),
          },
          secrets: { clientKey: form.clientKey.trim(), clientSecret: form.clientSecret.trim(), callbackSecret: form.callbackSecret.trim() },
        };
    try {
      const response = await fetch("/api/admin/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan");
      setMessage(`${provider === "midtrans" ? "Midtrans" : "Everpro"} tersimpan`);
      update(provider, { serverKey: "", clientSecret: "", callbackSecret: "" });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound size={16} />
        <h2 className="text-xs font-black uppercase tracking-[0.25em]">Credential Integrasi</h2>
      </div>
      {!encryptionReady && (
        <div className="mb-4 border-2 border-red-600 bg-red-50 p-3 text-xs font-bold text-red-800">
          Set `CREDENTIALS_ENCRYPTION_KEY` di environment deployment sebelum menyimpan API key.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <IntegrationCard
          title="Midtrans"
          provider="midtrans"
          form={forms.midtrans}
          summary={summaries.find((item) => item.provider === "midtrans")}
          busy={busy === "midtrans"}
          disabled={!encryptionReady}
          onUpdate={(patch) => update("midtrans", patch)}
          onSave={() => save("midtrans")}
        />
        <IntegrationCard
          title="Everpro Shipping"
          provider="everpro"
          form={forms.everpro}
          summary={summaries.find((item) => item.provider === "everpro")}
          busy={busy === "everpro"}
          disabled={!encryptionReady}
          onUpdate={(patch) => update("everpro", patch)}
          onSave={() => save("everpro")}
        />
      </div>
      {message && <p className="mt-3 text-xs font-bold">{message}</p>}
    </section>
  );
}

function IntegrationCard({ title, provider, form, summary, busy, disabled, onUpdate, onSave }: {
  title: string;
  provider: Provider;
  form: FormState;
  summary?: IntegrationSummary;
  busy: boolean;
  disabled: boolean;
  onUpdate: (patch: Partial<FormState>) => void;
  onSave: () => void;
}) {
  const mask = provider === "midtrans" ? summary?.secretMasks.serverKey : summary?.secretMasks.clientKey;
  return (
    <div className="border-2 border-neutral-800 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black uppercase">{title}</h3>
        <span className={`text-[10px] font-black uppercase ${summary?.configured ? "text-green-700" : "text-red-700"}`}>
          {summary?.configured ? "Configured" : "Belum lengkap"}
        </span>
      </div>
      <Field label="Environment">
        <select value={form.environment} onChange={(e) => onUpdate({ environment: e.target.value as Environment })} className="field">
          <option value="sandbox">Sandbox</option>
          <option value="production">Production</option>
        </select>
      </Field>
      {provider === "everpro" && (
        <>
          <Field label="Base URL"><input value={form.baseUrl} onChange={(e) => onUpdate({ baseUrl: e.target.value })} className="field" /></Field>
          <Field label="Client Secret"><input type="password" value={form.clientSecret} onChange={(e) => onUpdate({ clientSecret: e.target.value })} className="field" placeholder={summary?.secretMasks.clientSecret ?? "Masukkan client secret"} /></Field>
          <Field label="Nama Pengirim"><input value={form.shipperName} onChange={(e) => onUpdate({ shipperName: e.target.value })} className="field" /></Field>
          <Field label="Telepon Pengirim"><input value={form.shipperPhone} onChange={(e) => onUpdate({ shipperPhone: e.target.value })} className="field" /></Field>
          <Field label="Alamat Gudang"><input value={form.shipperAddress} onChange={(e) => onUpdate({ shipperAddress: e.target.value })} className="field" /></Field>
          <Field label="Kode Pos Gudang"><input value={form.shipperPostalCode} onChange={(e) => onUpdate({ shipperPostalCode: e.target.value })} className="field" /></Field>
        </>
      )}
      <Field label={provider === "midtrans" ? "Client Key" : "Client Key Everpro"}>
        <input value={form.clientKey} onChange={(e) => onUpdate({ clientKey: e.target.value })} className="field" placeholder={mask ?? "Masukkan key"} />
      </Field>
      {provider === "midtrans" ? (
        <Field label="Server Key"><input type="password" value={form.serverKey} onChange={(e) => onUpdate({ serverKey: e.target.value })} className="field" placeholder={summary?.secretMasks.serverKey ?? "Masukkan server key"} /></Field>
      ) : (
        <Field label="Callback Secret"><input type="password" value={form.callbackSecret} onChange={(e) => onUpdate({ callbackSecret: e.target.value })} className="field" placeholder={summary?.secretMasks.callbackSecret ?? "x-everpro-key"} /></Field>
      )}
      <button type="button" disabled={disabled || busy} onClick={onSave} className="inline-flex min-h-11 items-center gap-2 bg-black px-4 py-2 text-xs font-black uppercase text-white disabled:opacity-40">
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[11px] font-bold uppercase">{label}<span className="mt-1 block [&_.field]:w-full [&_.field]:border-2 [&_.field]:border-neutral-700 [&_.field]:px-3 [&_.field]:py-2.5 [&_.field]:text-sm [&_.field]:normal-case">{children}</span></label>;
}
