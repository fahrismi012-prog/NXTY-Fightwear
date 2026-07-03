"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, CreditCard, Loader2, AlertCircle, Shield, RotateCcw, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { TrustStrip } from "@/components/TrustStrip";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
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

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Trust items untuk checkout
const CHECKOUT_TRUST_ITEMS = [
  { icon: <Shield className="w-5 h-5" />, label: "Pembayaran Aman" },
  { icon: <RotateCcw className="w-5 h-5" />, label: "Garansi 30 Hari" },
  { icon: <MessageCircle className="w-5 h-5" />, label: "Support WhatsApp" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  // Payment mode dari admin settings. Default 'gateway' sampai load selesai
  // (supaya flow lama tetap jalan kalau API /payment-mode error).
  const [paymentMode, setPaymentMode] = useState<"gateway" | "manual">("gateway");
  const [modeLoaded, setModeLoaded] = useState(false);

  // Fetch payment mode dari admin settings saat mount.
  // Default 'gateway' sampai load selesai (graceful fallback).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/storefront/payment-mode")
      .then((r) => (r.ok ? r.json() : { mode: "gateway" }))
      .then((data: { mode?: string }) => {
        if (cancelled) return;
        if (data.mode === "manual" || data.mode === "gateway") {
          setPaymentMode(data.mode);
        }
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
    if (!MIDTRANS_CLIENT_KEY) return;
    if (document.getElementById("midtrans-snap")) return;
    const script = document.createElement("script");
    script.id = "midtrans-snap";
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // cleanup not removing script to avoid snap removal issues
    };
  }, [paymentMode]);

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
    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Nomor HP wajib diisi";
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = "Nomor HP minimal 10 digit";
    }
    if (!form.address.trim()) newErrors.address = "Alamat wajib diisi";
    if (!form.city.trim()) newErrors.city = "Kota wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Branching: mode manual -> POST ke /api/orders/create-manual,
      // mode gateway -> flow Midtrans Snap yang sudah ada.
      if (paymentMode === "manual") {
        const res = await fetch("/api/orders/create-manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer: form, items }),
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
                {items.length} item · <PriceTag price={totalPrice} size="md" />
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
              <PriceTag price={totalPrice} size="lg" />
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
                label="Email"
                type="email"
                inputMode="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@contoh.com"
                error={errors.email}
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
            <PriceTag price={totalPrice} size="md" />
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
