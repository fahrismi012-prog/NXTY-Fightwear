"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, CreditCard, AlertCircle, Shield, RotateCcw, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { TrustStrip } from "@/components/TrustStrip";
import { PROVINCES } from "@/lib/shipping/regions";
import { resolveManualShippingFee, type ShippingZone } from "@/lib/shipping/manual";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface ShippingRate {
  courier: string;
  service: string;
  cost: number;
  etd: string;
  rateCode?: string;
  weight?: number;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[0-9]{10,15}$/.test(phone.replace(/[^0-9]/g, ""));
}

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const GUEST_ADDRESS_KEY = "nxty_checkout_address";

// Trust items untuk checkout
const CHECKOUT_TRUST_ITEMS = [
  { icon: <Shield className="w-5 h-5" />, label: "Pembayaran Aman" },
  { icon: <RotateCcw className="w-5 h-5" />, label: "Garansi 30 Hari" },
  { icon: <MessageCircle className="w-5 h-5" />, label: "Support WhatsApp" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState<FormData>(() => {
    const base: FormData = {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
    };
    if (typeof window === "undefined") return base;
    try {
      const saved = localStorage.getItem(GUEST_ADDRESS_KEY);
      if (!saved) return base;
      return { ...base, ...(JSON.parse(saved) as Partial<FormData>), notes: "" };
    } catch {
      return base;
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  // Payment mode dari admin settings. Default 'gateway' sampai load selesai
  // (supaya flow lama tetap jalan kalau API /payment-mode error).
  const [paymentMode, setPaymentMode] = useState<"gateway" | "manual">("gateway");
  const [modeLoaded, setModeLoaded] = useState(false);
  const [midtransConfig, setMidtransConfig] = useState({ clientKey: "", environment: "sandbox" });
  const [shippingMode, setShippingMode] = useState<"auto" | "manual">("manual");
  const [manualShippingFee, setManualShippingFee] = useState(0);
  const [manualShippingZones, setManualShippingZones] = useState<ShippingZone[]>([]);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const shippingCost =
    shippingMode === "auto"
      ? (selectedRate?.cost ?? 0)
      : resolveManualShippingFee(manualShippingZones, manualShippingFee, form.province);
  const checkoutTotal = totalPrice + shippingCost;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/customer/checkout-profile", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !data?.authenticated) return;
        const address = data.address;
        setForm((current) => ({
          ...current,
          name: address?.recipient_name || data.profile?.fullName || current.name,
          email: data.profile?.email || current.email,
          phone: address?.phone || data.profile?.phone || current.phone,
          address: address?.street || current.address,
          city: address?.city || current.city,
          province: address?.province || current.province,
          postalCode: address?.postal_code || current.postalCode,
        }));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  // Fetch payment mode dari admin settings saat mount.
  // Default 'gateway' sampai load selesai (graceful fallback).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/storefront/payment-mode")
      .then((r) => (r.ok ? r.json() : { mode: "gateway" }))
      .then((data: { mode?: string; shippingMode?: string; shippingManualFee?: number; shippingManualZones?: ShippingZone[]; midtrans?: { clientKey?: string; environment?: string } }) => {
        if (cancelled) return;
        if (data.mode === "manual" || data.mode === "gateway") {
          setPaymentMode(data.mode);
        }
        setMidtransConfig({
          clientKey: data.midtrans?.clientKey ?? "",
          environment: data.midtrans?.environment ?? "sandbox",
        });
        setShippingMode(data.shippingMode === "auto" ? "auto" : "manual");
        setManualShippingFee(Number(data.shippingManualFee) || 0);
        setManualShippingZones(Array.isArray(data.shippingManualZones) ? data.shippingManualZones : []);
      })
      .catch(() => {
        if (!cancelled) setPaymentMode("gateway");
      })
      .finally(() => {
        if (!cancelled) setModeLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load Midtrans Snap script (hanya kalau mode = gateway)
  useEffect(() => {
    if (paymentMode !== "gateway") return;
    if (!midtransConfig.clientKey) return;
    if (document.getElementById("midtrans-snap")) return;
    const script = document.createElement("script");
    script.id = "midtrans-snap";
    script.src = midtransConfig.environment === "production"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", midtransConfig.clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // cleanup not removing script to avoid snap removal issues
    };
  }, [paymentMode, midtransConfig]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-surface-1 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error-500" />
          </div>
          <h1 className="text-heading-3 font-bold text-text-primary mb-2">Keranjang Kosong</h1>
          <p className="text-body text-text-muted mb-6">
            Kamu belum menambahkan produk. Yuk lihat katalog kami.
          </p>
          <Link href="/">
            <Button variant="primary" size="lg">
              Lihat Produk
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
    if (form.email.trim() && !validateEmail(form.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Nomor HP wajib diisi";
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = "Nomor HP minimal 10 digit";
    }
    if (!form.address.trim()) newErrors.address = "Alamat wajib diisi";
    if (!form.city.trim()) newErrors.city = "Kota wajib diisi";
    if (!form.province.trim()) newErrors.province = "Provinsi wajib diisi";
    if (!form.postalCode.trim()) newErrors.postalCode = "Kode pos wajib diisi";
    if (shippingMode === "auto" && !selectedRate) {
      setErrorMsg("Pilih layanan pengiriman terlebih dahulu.");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && (shippingMode !== "auto" || Boolean(selectedRate));
  };

  const loadShippingRates = async () => {
    if (!form.postalCode.trim()) {
      setErrors((current) => ({ ...current, postalCode: "Kode pos wajib diisi" }));
      return;
    }
    setRatesLoading(true);
    setErrorMsg("");
    setSelectedRate(null);
    try {
      const response = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: form.postalCode.trim(), items }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghitung ongkir");
      const rates = (data.rates ?? []).map((rate: ShippingRate) => ({ ...rate, weight: data.weight }));
      setShippingRates(rates);
      if (rates.length === 0) setErrorMsg("Layanan pengiriman tidak tersedia untuk alamat ini.");
    } catch (error) {
      setShippingRates([]);
      setErrorMsg(error instanceof Error ? error.message : "Gagal menghitung ongkir");
    } finally {
      setRatesLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!validate()) return;
    setLoading(true);

    try {
      localStorage.setItem(
        GUEST_ADDRESS_KEY,
        JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
        }),
      );
    } catch {
      // localStorage unavailable (private mode dsb) — abaikan
    }

    try {
      if (!modeLoaded) {
        setErrorMsg("Konfigurasi pembayaran masih dimuat. Coba lagi.");
        return;
      }
      // Branching: mode manual -> POST ke /api/orders/create-manual,
      // mode gateway -> flow Midtrans Snap yang sudah ada.
      if (paymentMode === "manual") {
        const res = await fetch("/api/orders/create-manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer: form, items, shipping: selectedRate }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Terjadi kesalahan saat membuat pesanan.");
          setLoading(false);
          return;
        }
        clearCart();
        router.push(`/payment/pending?order_id=${data.orderId}`);
        return;
      }

      // Mode gateway -> Midtrans Snap (existing flow)
      const res = await fetch("/api/midtrans/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items,
          shipping: selectedRate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Terjadi kesalahan saat membuat transaksi.");
        setLoading(false);
        return;
      }

      if (data.token) {
        if (window.snap && window.snap.pay) {
          window.snap.pay(data.token, {
            onSuccess: (result: unknown) => {
              clearCart();
              const res = result as { order_id?: string };
              router.push(`${APP_URL}/payment/success?order_id=${res?.order_id || data.orderId || ""}`);
            },
            onPending: (result: unknown) => {
              clearCart();
              const res = result as { order_id?: string };
              router.push(`${APP_URL}/payment/pending?order_id=${res?.order_id || data.orderId || ""}`);
            },
            onError: (result: unknown) => {
              const res = result as { order_id?: string };
              router.push(`${APP_URL}/payment/failed?order_id=${res?.order_id || data.orderId || ""}`);
            },
            onClose: () => {
              // User closed popup before finishing
              // Stay on checkout page
            },
          });
        } else {
          // Fallback: redirect to Midtrans redirect_url
          window.location.href = data.redirect_url || "/";
        }
      } else {
        setErrorMsg("Token pembayaran tidak ditemukan.");
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server. Coba lagi." + (err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas pb-28 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-canvas border-b border-border-subtle">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-heading-3 font-semibold text-text-primary">Checkout</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Order summary - collapsible on mobile */}
        <Card variant="default" padding="md" className="mb-6">
          <button
            onClick={() => setSummaryExpanded(!summaryExpanded)}
            className="w-full flex items-center justify-between md:pointer-events-none"
          >
            <h2 className="text-body font-semibold text-text-primary">Ringkasan Pesanan</h2>
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-text-muted">
                {items.length} item · <PriceTag price={checkoutTotal} size="md" />
              </span>
              <span className="md:hidden text-text-muted">
                {summaryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </div>
          </button>
          
          <div className={`mt-4 ${summaryExpanded ? 'block' : 'hidden md:block'}`}>
            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex gap-3">
                  <div className="relative w-14 h-14 bg-surface-2 rounded-subtle overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-body-sm text-text-muted">
                      {item.size} · {item.color} · {item.quantity}x
                    </p>
                  </div>
                  <div className="text-body font-semibold text-text-primary tabular-nums">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border-subtle mt-4 pt-4 flex items-center justify-between">
              <span className="text-body font-medium text-text-secondary">Total</span>
              <PriceTag price={checkoutTotal} size="lg" />
            </div>
          </div>
        </Card>

        {/* Form */}
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Informasi Kontak */}
          <div>
            <p className="text-heading-3 font-semibold text-text-primary mb-4">Informasi Kontak</p>
            <div className="space-y-4">
              <Input
                label="Nama Lengkap"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap kamu"
                error={errors.name}
              />
              <Input
                label="Nomor HP"
                type="tel"
                inputMode="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="08123456789"
                error={errors.phone}
              />
            </div>
          </div>

          <div>
            <p className="text-heading-3 font-semibold text-text-primary mb-4">Pengiriman</p>
            {shippingMode === "manual" ? (
              <div className="rounded-subtle border border-border-subtle bg-surface-1 p-4 text-sm">
                Ongkir: <strong>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(shippingCost)}</strong>
                {!form.province && (
                  <span className="block text-text-muted mt-1">Pilih provinsi di bawah untuk ongkir sesuai zona.</span>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Button type="button" variant="secondary" onClick={loadShippingRates} loading={ratesLoading}>
                  Cek Ongkos Kirim
                </Button>
                {shippingRates.map((rate) => (
                  <label key={`${rate.courier}-${rate.service}`} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-subtle border p-3 ${selectedRate?.courier === rate.courier && selectedRate?.service === rate.service ? "border-brand-black bg-surface-2" : "border-border-subtle bg-surface-1"}`}>
                    <input type="radio" name="shipping-rate" checked={selectedRate?.courier === rate.courier && selectedRate?.service === rate.service} onChange={() => setSelectedRate(rate)} />
                    <span className="flex-1 text-sm font-bold">{rate.courier} {rate.service}<span className="block text-xs font-normal text-text-muted">Estimasi {rate.etd || "-"} hari</span></span>
                    <strong className="text-sm">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(rate.cost)}</strong>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Section: Alamat Pengiriman */}
          <div>
            <p className="text-heading-3 font-semibold text-text-primary mb-4">Alamat Pengiriman</p>
            <div className="space-y-4">
              <Textarea
                label="Alamat Lengkap"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Jl. Contoh No. 123, RT 001/RW 002"
                rows={3}
                error={errors.address}
              />
              <Input
                label="Kota / Kabupaten"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Jakarta Selatan"
                error={errors.city}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="province" className="text-caption font-medium text-text-secondary">
                    Provinsi
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={`w-full h-11 rounded-subtle border bg-surface-1 text-text-primary pl-4 pr-4 text-body focus:outline-none transition-colors duration-fast ${
                      errors.province ? "border-error-500 focus:border-error-500" : "border-border-default focus:border-brand-black"
                    }`}
                  >
                    <option value="">Pilih provinsi</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="text-body-sm text-error-500" role="alert">
                      {errors.province}
                    </p>
                  )}
                </div>
                <Input
                  label="Kode Pos"
                  name="postalCode"
                  inputMode="numeric"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="40123"
                  error={errors.postalCode}
                />
              </div>
            </div>
          </div>

          {/* Section: Catatan */}
          <div>
            <Textarea
              label="Catatan (opsional)"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Catatan untuk pengiriman..."
              rows={2}
            />
          </div>

          {/* Trust Strip */}
          <TrustStrip variant="compact" items={CHECKOUT_TRUST_ITEMS} />

          {/* Error message */}
          {errorMsg && (
            <div className="bg-error-500/10 border border-error-500/30 rounded-subtle px-4 py-3 text-body text-error-500">
              {errorMsg}
            </div>
          )}

          {/* Desktop submit button */}
          <div className="hidden md:block">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Bayar Sekarang
            </Button>
            <p className="text-caption text-text-muted text-center mt-3">
              Pembayaran aman via Midtrans
            </p>
          </div>
        </form>
      </div>

      {/* Mobile sticky bottom action bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-canvas border-t border-border-subtle p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-caption text-text-muted">Total</p>
            <PriceTag price={checkoutTotal} size="md" />
          </div>
          <Button
            type="submit"
            form="checkout-form"
            variant="primary"
            size="lg"
            loading={loading}
            className="min-w-[140px]"
          >
            Bayar Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
