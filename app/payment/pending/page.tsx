"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  Home,
  HelpCircle,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Copy,
  Building2,
  Hourglass,
} from "lucide-react";

interface OrderData {
  id: string;
  status: string;
  total: number | null;
  subtotal: number | null;
  shipping_cost: number | null;
  payment_method: "gateway" | "manual" | null;
  payment_expires_at: string | null;
  payment_proof_url: string | null;
  payment_rejection_reason: string | null;
  bank_account: {
    id: string;
    bank_name: string;
    account_number: string;
    account_holder: string;
    instructions: string | null;
  } | null;
  items: Array<{ name: string; quantity: number; price: number }>;
}

function PendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "-";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch order detail
  useEffect(() => {
    if (!orderId || orderId === "-") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- error fallback sebelum fetch
      setError("Order ID tidak ditemukan di URL");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- error fallback sebelum fetch
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/orders/${orderId}`)
      .then((r) =>
        r
          .json()
          .then((data: { order?: OrderData; error?: string }) => ({ ok: r.ok, data })),
      )
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok || !data.order) {
          setError(data.error ?? "Gagal memuat pesanan");
        } else {
          setOrder(data.order);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Gagal terhubung ke server");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handleUpload(file: File) {
    setUploadError(null);
    if (!order) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/orders/${order.id}/upload-proof`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setUploadError(data.error ?? "Upload gagal");
        return;
      }
      // Refresh order detail
      const refresh = await fetch(`/api/orders/${order.id}`);
      const refreshData = (await refresh.json()) as { order?: OrderData };
      if (refreshData.order) setOrder(refreshData.order);
    } catch {
      setUploadError("Terjadi kesalahan jaringan");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleUpload(file);
  }

  function copyAccountNumber() {
    if (!order?.bank_account) return;
    void navigator.clipboard.writeText(order.bank_account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Loading & error states ──────────────────────────────
  if (loading) {
    return (
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-text-muted" />
        <p className="text-sm text-text-muted">Memuat pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center max-w-sm w-full">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-black text-text-primary mb-2">
          Pesanan Tidak Ditemukan
        </h1>
        <p className="text-sm text-text-muted mb-6">
          {error ?? "Tidak bisa memuat detail pesanan."}
        </p>
        <Link
          href="/"
          className="inline-block w-full py-3 bg-text-primary text-white font-bold text-sm hover:bg-black transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // ─── Mode Manual (transfer bank) ──────────────────────────
  if (order.payment_method === "manual") {
    const hasProof = Boolean(order.payment_proof_url);
    const isAwaitingConfirmation = order.status === "awaiting_confirmation";
    const isRejected = order.status === "cancelled" && Boolean(order.payment_rejection_reason);
    const bank = order.bank_account;

    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          {isRejected ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 border-2 border-red-600 mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-black text-text-primary mb-2">
                Pembayaran Ditolak
              </h1>
              <p className="text-xs text-text-muted">
                Order ID: <span className="font-mono">{order.id}</span>
              </p>
            </>
          ) : isAwaitingConfirmation ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 border-2 border-yellow-600 mb-4">
                <Hourglass className="w-8 h-8 text-yellow-600" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-black text-text-primary mb-2">
                Bukti Transfer Diterima
              </h1>
              <p className="text-sm text-text-muted">
                Sedang dicek admin (1-2 jam kerja). Kami kabari via email
                setelah dikonfirmasi.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 border-2 border-yellow-600 mb-4">
                <Clock className="w-8 h-8 text-yellow-600" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-black text-text-primary mb-2">
                Selesaikan Pembayaran
              </h1>
              <p className="text-sm text-text-muted">
                Order ID: <span className="font-mono">{order.id}</span>
              </p>
            </>
          )}
        </div>

        {/* Rejection reason */}
        {isRejected && order.payment_rejection_reason && (
          <div className="border-2 border-red-600 bg-red-50 p-3 mb-4 text-xs">
            <p className="font-black uppercase tracking-wider text-red-600 mb-1">
              Alasan Penolakan
            </p>
            <p className="text-red-900">{order.payment_rejection_reason}</p>
          </div>
        )}

        {/* Bank account info */}
        {bank && !isRejected && (
          <div className="border-2 border-black bg-white p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-black" strokeWidth={2.5} />
              <p className="text-[10px] font-black uppercase tracking-widest text-black">
                Transfer ke Rekening
              </p>
            </div>
            <p className="text-2xl font-black text-black tracking-tight">
              {bank.bank_name}
            </p>
            <button
              type="button"
              onClick={copyAccountNumber}
              className="mt-2 flex items-center gap-2 group"
            >
              <span className="text-lg font-mono font-bold text-black">
                {bank.account_number}
              </span>
              {copied ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy
                  size={14}
                  className="text-text-muted group-hover:text-black transition-colors"
                />
              )}
            </button>
            <p className="text-xs text-text-muted mt-1">a.n. {bank.account_holder}</p>
            {bank.instructions && (
              <p className="text-[11px] text-text-muted mt-2 italic border-t border-border-subtle pt-2">
                {bank.instructions}
              </p>
            )}

            {/* Total amount to transfer */}
            <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Total Transfer
              </p>
              <p className="text-lg font-black text-black">
                {formatRupiah(order.total)}
              </p>
            </div>
          </div>
        )}

        {/* Upload proof section */}
        {!hasProof && !isRejected && (
          <div className="border-2 border-dashed border-black bg-white p-4 mb-4 text-center">
            <Upload size={24} className="text-text-muted mx-auto mb-2" strokeWidth={2} />
            <p className="text-xs font-bold text-text-primary mb-1">
              Sudah transfer? Upload bukti pembayaran
            </p>
            <p className="text-[10px] text-text-muted mb-3">
              Format: JPEG, PNG, WebP. Maks 5MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              disabled={uploading}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !bank}
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 min-h-[40px]"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Pilih Foto Bukti
                </>
              )}
            </button>
            {uploadError && (
              <p className="text-[11px] text-red-600 font-bold mt-2">
                {uploadError}
              </p>
            )}
          </div>
        )}

        {/* Status info after upload */}
        {isAwaitingConfirmation && (
          <div className="bg-yellow-50 border-2 border-yellow-600 p-4 mb-4 text-center">
            <Check size={20} className="text-yellow-600 mx-auto mb-2" />
            <p className="text-xs text-yellow-900 font-bold">
              Bukti sudah diterima. Admin akan cek dalam 1-2 jam kerja.
            </p>
          </div>
        )}

        {/* Help */}
        <div className="flex items-start gap-3 p-3 bg-surface-1 border border-border-subtle mb-4 text-left">
          <HelpCircle className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-text-muted leading-relaxed">
            Sudah transfer tapi tidak ada konfirmasi? Cek folder spam email
            atau hubungi kami via WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="w-full py-3 bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/kontak"
            className="w-full py-3 border-2 border-black text-text-primary font-bold text-sm hover:bg-black hover:text-white transition-colors text-center"
          >
            Hubungi Kami
          </Link>
        </div>
      </div>
    );
  }

  // ─── Mode Gateway (Midtrans existing flow) ─────────────────
  return (
    <div className="text-center max-w-sm w-full">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 border-2 border-yellow-600 mb-4">
        <Clock className="w-8 h-8 text-yellow-600" strokeWidth={2.5} />
      </div>
      <h1 className="text-xl font-black text-text-primary mb-2">Menunggu Pembayaran</h1>
      <p className="text-sm text-text-muted mb-1">
        Pembayaran kamu sedang diproses via payment gateway.
      </p>
      <p className="text-xs text-text-muted mb-6">
        Order ID: <span className="font-mono">{orderId}</span>
      </p>

      <div className="bg-surface-1 border border-border-subtle p-4 text-left mb-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-primary">
              Apa yang harus dilakukan?
            </p>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              Silakan selesaikan pembayaran sesuai instruksi di popup Midtrans.
              Status akan diupdate otomatis.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="w-full py-3 bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
        <Link
          href="/kontak"
          className="w-full py-3 border-2 border-black text-text-primary font-bold text-sm hover:bg-black hover:text-white transition-colors text-center"
        >
          Hubungi Kami
        </Link>
      </div>
    </div>
  );
}

function formatRupiah(value: number | null): string {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-8">
      <Suspense
        fallback={
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-text-muted" />
            <p className="text-sm text-text-muted">Memuat...</p>
          </div>
        }
      >
        <PendingContent />
      </Suspense>
    </div>
  );
}
