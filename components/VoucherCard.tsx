"use client";

import { useState, useEffect } from "react";
import { Ticket, Copy, Check, Zap } from "lucide-react";
import type { Promotion } from "@/types";
import { useToast } from "@/contexts/ToastContext";

interface VoucherCardProps {
  voucher: Promotion;
}

export default function VoucherCard({ voucher }: VoucherCardProps) {
  const { showToast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!voucher.code) return;
    try {
      const stored = JSON.parse(localStorage.getItem("nxty_claimed_vouchers") || "[]");
      const found = stored.find((v: { code: string }) => v.code === voucher.code);
      if (found) setClaimed(true);
    } catch {}
  }, [voucher.code]);

  const handleClaim = () => {
    if (!voucher.code || claimed) return;
    try {
      const stored = JSON.parse(localStorage.getItem("nxty_claimed_vouchers") || "[]");
      stored.push({
        code: voucher.code,
        promotionId: voucher.id,
        claimedAt: new Date().toISOString(),
      });
      localStorage.setItem("nxty_claimed_vouchers", JSON.stringify(stored));
      setClaimed(true);
      showToast("success", "Voucher claimed", `${voucher.code} tersimpan`);
    } catch {}
  };

  const handleCopy = async () => {
    if (!voucher.code) return;
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const discountLabel =
    voucher.discountType === "percentage"
      ? `${voucher.discountValue}%`
      : `Rp ${(voucher.discountValue ?? 0).toLocaleString("id-ID")}`;

  return (
    <div className="relative bg-[#0a0a0a] border-2 border-[#262626] hover:border-[#dc2626] transition-colors group">
      {/* Left perforated decoration */}
      <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-between py-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-[#dc2626]" />
        ))}
      </div>

      <div className="pl-6 pr-3 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <div className="flex items-center gap-1.5 mb-2">
            <Ticket className="w-3 h-3 text-[#dc2626]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#dc2626]">
              {voucher.discountType === "percentage" ? "DISCOUNT" : "CASHBACK"}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic mb-1">
            {discountLabel}
            <span className="text-[#dc2626]"> OFF</span>
          </h3>

          {/* Subtitle */}
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 font-mono">
            {voucher.subtitle}
          </p>

          {/* Description */}
          <p className="text-xs text-neutral-500 leading-relaxed mb-3">
            {voucher.description}
          </p>

          {/* Code */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 border border-dashed border-[#262626] px-3 py-1.5 bg-[#161616]">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mr-2">
                CODE:
              </span>
              <span className="text-xs font-black text-white font-mono tracking-wider">
                {voucher.code}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="w-8 h-8 border border-[#262626] flex items-center justify-center hover:bg-[#dc2626] hover:border-[#dc2626] transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-3 h-3 text-[#dc2626]" />
              ) : (
                <Copy className="w-3 h-3 text-neutral-400" />
              )}
            </button>
          </div>

          {/* Min purchase */}
          {voucher.minPurchase && (
            <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
              Min. Rp {voucher.minPurchase.toLocaleString("id-ID")} · Limit {voucher.usageLimit}x
            </p>
          )}
        </div>

        {/* Claim button */}
        <button
          onClick={handleClaim}
          disabled={claimed}
          className={`shrink-0 px-3 py-2 border-2 flex flex-col items-center justify-center min-w-[68px] transition-all ${
            claimed
              ? "bg-[#262626] border-[#262626] text-neutral-500 cursor-default"
              : "bg-[#dc2626] border-[#dc2626] text-white hover:bg-white hover:text-[#dc2626]"
          }`}
        >
          {claimed ? (
            <>
              <Check className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">DONE</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mb-0.5 fill-current" />
              <span className="text-[9px] font-black uppercase tracking-widest">KLAIM</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
