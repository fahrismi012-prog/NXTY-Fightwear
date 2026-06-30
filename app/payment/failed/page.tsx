"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, Home, RefreshCw } from "lucide-react";

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "-";

  return (
    <div className="text-center max-w-sm w-full">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 rounded-full mb-4">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-xl font-black text-text-primary mb-2">Pembayaran Gagal</h1>
      <p className="text-sm text-text-muted mb-1">
        Maaf, pembayaran tidak berhasil diproses.
      </p>
      <p className="text-xs text-neutral-600 mb-6">Order ID: {orderId}</p>

      <div className="bg-surface-1 border border-border-subtle rounded-xl p-4 text-left mb-6">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-primary">Coba checkout ulang</p>
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
              Kamu bisa mencoba checkout lagi. Pastikan data pembayaran benar dan saldo mencukupi.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/checkout"
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-text-primary font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </Link>
        <Link
          href="/"
          className="w-full py-3 border border-border-subtle text-text-muted font-semibold text-sm rounded-xl hover:bg-surface-1 flex items-center justify-center transition-colors"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Memuat...</p>
        </div>
      }>
        <FailedContent />
      </Suspense>
    </div>
  );
}
