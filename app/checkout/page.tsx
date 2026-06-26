"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

interface FormErrors {
  name?: string; // nama
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
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

  // Load Midtrans Snap script
  useEffect(() => {
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
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-white mb-2">Keranjang Kosong</h1>
          <p className="text-sm text-neutral-400 mb-4">
            Kamu belum menambahkan produk. Yuk lihat katalog kami.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl"
          >
            Lihat Produk
          </Link>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "nama wajib diisi";
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
    if (!form.address.trim()) newErrors.address = "alamat wajib diisi";
    if (!form.city.trim()) newErrors.city = "kota wajib diisi";
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
    <div className="min-h-screen bg-[#0a0a0a] pb-24 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-[#262626]">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
          <Link href="/" className="p-1 -ml-1">
            <ChevronLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <h1 className="text-sm font-bold text-white">Checkout</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Order summary */}
        <div className="bg-[#161616] border border-[#262626] rounded-xl p-4 mb-6">
          <h2 className="text-sm font-bold text-white mb-3">Ringkasan Pesanan</h2>
          <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="flex gap-3">
                <div className="relative w-14 h-14 bg-[#121212] rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.size} · {item.color} · {item.quantity}x
                  </p>
                </div>
                <div className="text-sm font-bold text-white">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#262626] mt-3 pt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-400">Total</span>
            <span className="text-lg font-black text-white">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Form */}
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-sm font-bold text-white mb-1">Data Pembeli</h2>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="nama lengkap kamu"
              className="w-full bg-[#161616] text-white text-sm rounded-lg px-4 py-2.5 border border-[#262626] focus:border-red-500 focus:outline-none placeholder:text-neutral-600"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@contoh.com"
              className="w-full bg-[#161616] text-white text-sm rounded-lg px-4 py-2.5 border border-[#262626] focus:border-red-500 focus:outline-none placeholder:text-neutral-600"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">Nomor HP</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="08123456789"
              className="w-full bg-[#161616] text-white text-sm rounded-lg px-4 py-2.5 border border-[#262626] focus:border-red-500 focus:outline-none placeholder:text-neutral-600"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">alamat Lengkap</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Jl. Contoh No. 123, RT 001/RW 002"
              rows={3}
              className="w-full bg-[#161616] text-white text-sm rounded-lg px-4 py-2.5 border border-[#262626] focus:border-red-500 focus:outline-none placeholder:text-neutral-600 resize-none"
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">kota</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Jakarta Selatan"
              className="w-full bg-[#161616] text-white text-sm rounded-lg px-4 py-2.5 border border-[#262626] focus:border-red-500 focus:outline-none placeholder:text-neutral-600"
            />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              Catatan <span className="text-neutral-600">(opsional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Catatan untuk pengiriman..."
              rows={2}
              className="w-full bg-[#161616] text-white text-sm rounded-lg px-4 py-2.5 border border-[#262626] focus:border-red-500 focus:outline-none placeholder:text-neutral-600 resize-none"
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg px-4 py-3 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="hidden md:flex w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800/50 text-white font-bold text-sm rounded-xl items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Bayar Sekarang
              </>
            )}
          </button>

          <p className="text-xs text-neutral-600 text-center">
            Pembayaran akan diproses melalui midtrans checkout sandbox.
          </p>
        </form>
      </div>

      {/* Mobile sticky bottom action bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t-2 border-[#dc2626] p-3 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Total</p>
            <p className="text-base font-black text-white truncate">{formatPrice(totalPrice)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="px-5 py-3.5 bg-[#dc2626] text-white text-sm font-black uppercase tracking-wider hover:bg-white hover:text-[#dc2626] transition-colors min-h-[48px] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                BAYAR
              </>
            ) : (
              "Bayar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
