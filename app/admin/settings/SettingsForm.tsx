"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CreditCard, Truck, AlertCircle } from "lucide-react";

interface SettingsFormProps {
  initialPaymentMode: string;
  initialShippingMode: string;
  initialShippingManualFee: number;
  initialPaymentManualExpireHours: number;
}

export default function SettingsForm({
  initialPaymentMode,
  initialShippingMode,
  initialShippingManualFee,
  initialPaymentManualExpireHours,
}: SettingsFormProps) {
  const router = useRouter();
  const [paymentMode, setPaymentMode] = useState(initialPaymentMode);
  const [shippingMode, setShippingMode] = useState(initialShippingMode);
  const [shippingFee, setShippingFee] = useState(initialShippingManualFee);
  const [expireHours, setExpireHours] = useState(
    initialPaymentManualExpireHours,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
          <div className="mt-4 ml-6 border-l-2 border-black pl-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">
              Ongkos Kirim Fixed (Rupiah)
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
              Berlaku nasional. Admin bisa adjust per order di halaman detail.
            </p>
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
