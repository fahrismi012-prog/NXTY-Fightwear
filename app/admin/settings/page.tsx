import { Settings as SettingsIcon, Info } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import type { ShippingZone } from "@/lib/shipping/manual";
import SettingsForm from "./SettingsForm";
import BankAccountsManager from "./BankAccountsManager";
import IntegrationSettings from "./IntegrationSettings";

export const dynamic = "force-dynamic";

interface SettingsRow {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
}

async function fetchSettings(): Promise<Record<string, SettingsRow>> {
  const supabase = createAdminClient();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("settings")
    .select("key, value, description, updated_at")
    .order("key");
  if (error) {
    console.warn("[admin/settings] fetch error:", error.message);
    return {};
  }
  const rows = (data ?? []) as SettingsRow[];
  return Object.fromEntries(rows.map((r) => [r.key, r]));
}

async function fetchBankAccounts(): Promise<BankAccount[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(
      "id, bank_name, account_number, account_holder, instructions, is_active, display_order",
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("[admin/settings] fetch bank_accounts error:", error.message);
    return [];
  }
  return (data ?? []) as BankAccount[];
}

export default async function AdminSettingsPage() {
  const [settings, bankAccounts] = await Promise.all([
    fetchSettings(),
    fetchBankAccounts(),
  ]);

  const paymentMode =
    typeof settings["payment_mode"]?.value === "string"
      ? settings["payment_mode"].value
      : "gateway";
  const shippingMode =
    typeof settings["shipping_mode"]?.value === "string"
      ? settings["shipping_mode"].value
      : "auto";
  const shippingManualFee =
    typeof settings["shipping_manual_fee"]?.value === "string"
      ? Number(settings["shipping_manual_fee"].value)
      : 15000;
  const shippingManualZones = Array.isArray(settings["shipping_manual_zones"]?.value)
    ? (settings["shipping_manual_zones"]!.value as ShippingZone[])
    : [];
  const paymentManualExpireHours =
    typeof settings["payment_manual_expire_hours"]?.value === "string"
      ? Number(settings["payment_manual_expire_hours"].value)
      : 24;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">
          Pengaturan
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Konfigurasi Toko
        </h1>
        <p className="text-sm text-neutral-600 mt-2">
          Mode pembayaran, mode pengiriman, dan rekening bank. Perubahan
          langsung berlaku untuk order baru.
        </p>
      </div>

      {/* Info banner kalau Supabase belum configured / migration belum run */}
      {Object.keys(settings).length === 0 && (
        <div className="bg-white border-2 border-black p-4 mb-6 flex gap-3">
          <Info size={20} className="shrink-0 text-black" />
          <div className="text-xs">
            <p className="font-black uppercase tracking-wider mb-1">
              Tabel settings belum tersedia
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Jalankan migration{" "}
              <code className="bg-neutral-100 px-1 py-0.5 text-[11px]">
                supabase/migrations/2026-07-03-payment-shipping-mode.sql
              </code>{" "}
              di Supabase SQL Editor. Default mode: payment = gateway,
              shipping = auto.
            </p>
          </div>
        </div>
      )}

      {/* Mode switch */}
      <SettingsForm
        initialPaymentMode={paymentMode}
        initialShippingMode={shippingMode}
        initialShippingManualFee={shippingManualFee}
        initialShippingManualZones={shippingManualZones}
        initialPaymentManualExpireHours={paymentManualExpireHours}
      />

      <IntegrationSettings />

      {/* Bank accounts manager */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon size={16} className="text-black" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">
            Rekening Bank (mode manual)
          </h2>
        </div>
        <BankAccountsManager initialAccounts={bankAccounts} />
      </div>
    </div>
  );
}
