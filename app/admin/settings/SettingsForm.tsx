"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CreditCard, Truck, AlertCircle, Plus, X } from "lucide-react";
import { PROVINCES } from "@/lib/shipping/regions";
import type { ShippingZone } from "@/lib/shipping/manual";

interface SettingsFormProps {
  initialPaymentMode: string;
  initialShippingMode: string;
  initialShippingManualFee: number;
  initialShippingManualZones: ShippingZone[];
  initialPaymentManualExpireHours: number;
}

export default function SettingsForm({
  initialPaymentMode,
  initialShippingMode,
  initialShippingManualFee,
  initialShippingManualZones,
  initialPaymentManualExpireHours,
}: SettingsFormProps) {
  const router = useRouter();
  const [paymentMode, setPaymentMode] = useState(initialPaymentMode);
  const [shippingMode, setShippingMode] = useState(initialShippingMode);
  const [shippingFee, setShippingFee] = useState(initialShippingManualFee);
  const [zones, setZones] = useState<ShippingZone[]>(initialShippingManualZones);
  const [expireHours, setExpireHours] = useState(
    initialPaymentManualExpireHours,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addZone() {
    setZones([...zones, { label: "", provinces: [], fee: 0 }]);
  }

  function removeZone(index: number) {
    setZones(zones.filter((_, i) => i !== index));
  }

  function updateZone(index: number, patch: Partial<ShippingZone>) {
    setZones(zones.map((z, i) => (i === index ? { ...z, ...patch } : z)));
  }

  function toggleZoneProvince(index: number, province: string) {
    const zone = zones[index];
    const has = zone.provinces.includes(province);
    updateZone(index, {
      provinces: has
        ? zone.provinces.filter((p) => p !== province)
        : [...zone.provinces, province],
    });
  }

  // Provinsi yang sudah dipakai zona lain — dicoret di zona ini biar admin
  // tidak assign satu provinsi ke dua zona sekaligus.
  const provinceUsedByOtherZone = (province: string, currentIndex: number) =>
    zones.some((z, i) => i !== currentIndex && z.provinces.includes(province));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_mode: paymentMode,
          shipping_mode: shippingMode,
          shipping_manual_fee: shippingFee,
          shipping_manual_zones: zones,
          payment_manual_expire_hours: expireHours,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Gagal menyimpan");
      }
      setSuccess(true);
      startTransition(() => router.refresh());
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-2 border-neutral-800 p-5 md:p-6 space-y-8"
    >
      {/* PAYMENT MODE */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={16} className="text-black" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">
            Mode Pembayaran
          </h2>
        </div>
        <div className="space-y-2">
          <ModeRadio
            name="payment_mode"
            value="gateway"
            checked={paymentMode === "gateway"}
            onChange={setPaymentMode}
            title="Otomatis (Midtrans)"
            description="Customer bayar via Midtrans (kartu, e-wallet, virtual account). Konfirmasi otomatis real-time."
          />
          <ModeRadio
            name="payment_mode"
            value="manual"
            checked={paymentMode === "manual"}
            onChange={setPaymentMode}
            title="Manual (Transfer Bank)"
            description="Customer transfer ke rekening Anda, upload bukti, admin konfirmasi manual di panel."
          />
        </div>

        {/* Conditional field: expire hours (only relevant for manual) */}
        {paymentMode === "manual" && (
          <div className="mt-4 ml-6 border-l-2 border-black pl-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">
              Batas Waktu Bayar (jam)
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={expireHours}
              onChange={(e) =>
                setExpireHours(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-32 bg-white text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-sm font-semibold"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Order auto-cancelled lewat dari waktu ini jika belum upload bukti.
            </p>
          </div>
        )}
      </section>

      {/* SHIPPING MODE */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Truck size={16} className="text-black" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-black">
            Mode Pengiriman
          </h2>
        </div>
        <div className="space-y-2">
          <ModeRadio
            name="shipping_mode"
            value="auto"
            checked={shippingMode === "auto"}
            onChange={setShippingMode}
            title="Otomatis (Everpro API)"
            description="Cek ongkir otomatis dari kurir di checkout, resi auto-generate saat admin proses."
          />
          <ModeRadio
            name="shipping_mode"
            value="manual"
            checked={shippingMode === "manual"}
            onChange={setShippingMode}
            title="Manual (Admin Input)"
            description="Ongkos fixed, admin input kurir + resi manual di halaman pesanan."
          />
        </div>

        {/* Conditional field: shipping fee (only relevant for manual) */}
        {shippingMode === "manual" && (
          <div className="mt-4 ml-6 border-l-2 border-black pl-4 space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">
                Ongkir Default (Rupiah)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={shippingFee}
                onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value) || 0))}
                className="w-40 bg-white text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-sm font-semibold"
              />
              <p className="mt-1 text-[11px] text-neutral-500">
                Dipakai kalau provinsi customer tidak masuk zona manapun di bawah. Admin bisa adjust per order di halaman detail.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600">
                  Zona Ongkir per Provinsi (opsional)
                </label>
                <button
                  type="button"
                  onClick={addZone}
                  className="inline-flex items-center gap-1 bg-black text-white border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                >
                  <Plus size={12} strokeWidth={2.5} />
                  Tambah Zona
                </button>
              </div>
              <p className="mb-3 text-[11px] text-neutral-500">
                Buat zona (mis. &quot;Jabodetabek&quot;, &quot;Luar Jawa&quot;) dengan ongkir sendiri. Provinsi yang tidak dicentang di zona manapun pakai ongkir default di atas.
              </p>

              {zones.length === 0 ? (
                <p className="text-[11px] text-neutral-400 italic">Belum ada zona. Semua provinsi pakai ongkir default.</p>
              ) : (
                <div className="space-y-4">
                  {zones.map((zone, idx) => (
                    <div key={idx} className="bg-neutral-50 border-2 border-neutral-800 p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={zone.label}
                          onChange={(e) => updateZone(idx, { label: e.target.value })}
                          placeholder="Nama zona, mis. Jabodetabek"
                          className="flex-1 bg-white text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={zone.fee}
                          onChange={(e) => updateZone(idx, { fee: Math.max(0, Number(e.target.value) || 0) })}
                          placeholder="Ongkir"
                          className="w-32 bg-white text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => removeZone(idx)}
                          aria-label="Hapus zona"
                          className="shrink-0 w-9 h-9 flex items-center justify-center border-2 border-neutral-800 text-neutral-600 hover:bg-black hover:text-white transition-colors"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PROVINCES.map((p) => {
                          const checked = zone.provinces.includes(p);
                          const disabled = !checked && provinceUsedByOtherZone(p, idx);
                          return (
                            <button
                              key={p}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleZoneProvince(idx, p)}
                              title={disabled ? "Sudah dipakai zona lain" : undefined}
                              className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide border transition-colors ${
                                checked
                                  ? "bg-black border-black text-white"
                                  : disabled
                                    ? "bg-neutral-100 border-neutral-300 text-neutral-300 cursor-not-allowed"
                                    : "bg-white border-neutral-400 text-neutral-700 hover:border-black"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Feedback */}
      {error && (
        <div className="border-2 border-black bg-neutral-100 p-3 flex items-start gap-2 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="border-2 border-black bg-black text-white p-3 text-xs font-bold uppercase tracking-wider">
          ✓ Tersimpan
        </div>
      )}

      {/* Submit */}
      <div className="pt-2 border-t-2 border-neutral-200">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 min-h-[44px]"
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Save size={14} /> Simpan Pengaturan
            </>
          )}
        </button>
      </div>
    </form>
  );
}

interface ModeRadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description: string;
}

function ModeRadio({
  name,
  value,
  checked,
  onChange,
  title,
  description,
}: ModeRadioProps) {
  return (
    <label
      className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-all ${
        checked
          ? "border-black bg-black text-white shadow-[4px_4px_0_black]"
          : "border-neutral-800 bg-white hover:border-black"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-4 h-4 accent-black"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-black uppercase tracking-wider ${checked ? "text-white" : "text-black"}`}
        >
          {title}
        </p>
        <p
          className={`mt-1 text-[11px] leading-relaxed ${checked ? "text-neutral-200" : "text-neutral-600"}`}
        >
          {description}
        </p>
      </div>
    </label>
  );
}
