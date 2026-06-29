"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Zap, Ticket, Package, Gift, Image as ImageIcon, Percent } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import BannerCarousel from "@/components/BannerCarousel";
import VoucherCard from "@/components/VoucherCard";
import FlashSaleSection from "@/components/FlashSaleSection";
import CountdownTimer from "@/components/CountdownTimer";
import promotionsData from "@/data/promotions.json";
import type { Promotion, PromotionType } from "@/types";

const TABS: { id: PromotionType | "all"; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "ALL", icon: <Package className="w-3 h-3" /> },
  { id: "flash_sale", label: "FLASH SALE", icon: <Zap className="w-3 h-3" /> },
  { id: "voucher", label: "VOUCHER", icon: <Ticket className="w-3 h-3" /> },
  { id: "bundle", label: "BUNDLE", icon: <Gift className="w-3 h-3" /> },
  { id: "add_on", label: "ADD-ON", icon: <Percent className="w-3 h-3" /> },
];

export default function PromoPage() {
  const [activeTab, setActiveTab] = useState<PromotionType | "all">("all");

  const banners = useMemo(
    () =>
      (promotionsData.promotions as Promotion[]).filter((p) => p.type === "banner"),
    []
  );

  const filteredPromos = useMemo(() => {
    let result = (promotionsData.promotions as Promotion[]).filter(
      (p) => p.type !== "banner"
    );
    if (activeTab !== "all") {
      result = result.filter((p) => p.type === activeTab);
    }
    return result.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  }, [activeTab]);

  const flashSales = useMemo(
    () =>
      (promotionsData.promotions as Promotion[]).filter(
        (p) => p.type === "flash_sale"
      ),
    []
  );

  const vouchers = useMemo(
    () =>
      (promotionsData.promotions as Promotion[]).filter((p) => p.type === "voucher"),
    []
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollToTop />

      <main className="pb-20 md:pb-12">
        {/* Page title */}
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-3">
          <h1 className="text-heading-1 font-bold text-text-primary">
            Promo
          </h1>
        </div>

        {/* Banner carousel */}
        <div className="max-w-7xl mx-auto px-4 pt-2">
          <BannerCarousel banners={banners} />
        </div>

        {/* Featured Flash Sales */}
        {flashSales.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mt-8">
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#dc2626]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#dc2626] fill-current" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tighter text-white">
                  FLASH SALE
                </h2>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  ({flashSales.length})
                </span>
              </div>
            </div>
            <div className="space-y-6">
              {flashSales.map((fs) => (
                <FlashSaleSection key={fs.id} promotion={fs} />
              ))}
            </div>
          </div>
        )}

        {/* Featured Vouchers */}
        {vouchers.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mt-10">
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#dc2626]">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#dc2626]" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tighter text-white">
                  KLAIM VOUCHER
                </h2>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  ({vouchers.length})
                </span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.map((v) => (
                <VoucherCard key={v.id} voucher={v} />
              ))}
            </div>
          </div>
        )}

        {/* Tabs section */}
        <div className="max-w-7xl mx-auto px-4 mt-10">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#262626]">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tighter text-white">
              SEMUA PROMO
            </h2>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              {filteredPromos.length} DITEMUKAN
            </span>
          </div>

          {/* Tab filter */}
          <div className="overflow-x-auto scrollbar-hide mb-5">
            <div className="flex gap-0 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] border-2 flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#dc2626] border-[#dc2626] text-white"
                      : "bg-transparent border-[#262626] text-neutral-400 hover:border-[#dc2626] hover:text-[#dc2626]"
                  } ${
                    tab.id !== TABS[0].id ? "border-l-0" : ""
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Promo list */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPromos.map((promo) => (
              <PromoItem key={promo.id} promo={promo} />
            ))}
          </div>

          {filteredPromos.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-[#262626]">
              <p className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                NO PROMO
              </p>
              <p className="text-xs text-neutral-500 uppercase tracking-[0.25em] font-mono">
                // belum ada promo untuk kategori ini
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PromoItem({ promo }: { promo: Promotion }) {
  const isFlash = promo.type === "flash_sale";
  const isVoucher = promo.type === "voucher";
  const isBundle = promo.type === "bundle";
  const isAddOn = promo.type === "add_on";

  const typeColor = {
    flash_sale: "#dc2626",
    voucher: "#dc2626",
    bundle: "#dc2626",
    add_on: "#dc2626",
    discount: "#dc2626",
    banner: "#dc2626",
  }[promo.type];

  return (
    <div className="bg-[#0a0a0a] border-2 border-[#262626] hover:border-[#dc2626] transition-colors group">
      {/* Image or voucher cover */}
      {promo.image && !isVoucher ? (
        <div className="relative aspect-video bg-[#161616] overflow-hidden border-b-2 border-[#262626]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promo.image}
            alt={promo.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
          {promo.badge && (
            <div className="absolute top-0 left-0 bg-[#dc2626] text-white text-[10px] font-black tracking-[0.2em] px-2.5 py-1">
              {promo.badge}
            </div>
          )}
        </div>
      ) : null}

      <div className="p-4">
        {/* Type label */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[9px] font-black uppercase tracking-[0.3em]"
            style={{ color: typeColor }}
          >
            {promo.type.replace("_", " ")}
          </span>
          {promo.endTime && isFlash && (
            <CountdownTimer endTime={promo.endTime} size="sm" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-white uppercase tracking-tighter italic mb-1">
          {promo.title}
        </h3>

        {/* Subtitle */}
        {promo.subtitle && (
          <p className="text-[10px] font-black uppercase tracking-widest text-[#dc2626] mb-2">
            {promo.subtitle}
          </p>
        )}

        {/* Description */}
        {promo.description && (
          <p className="text-xs text-neutral-400 leading-relaxed mb-3 line-clamp-3">
            {promo.description}
          </p>
        )}

        {/* Discount info */}
        {isVoucher && promo.discountValue && (
          <div className="border-t border-[#262626] pt-3 mb-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
              {promo.discountType === "percentage"
                ? `DISKON ${promo.discountValue}%`
                : `POTONGAN Rp ${promo.discountValue.toLocaleString("id-ID")}`}
            </p>
            {promo.minPurchase && (
              <p className="text-[10px] font-mono text-neutral-600">
                Min. Rp {promo.minPurchase.toLocaleString("id-ID")}
              </p>
            )}
          </div>
        )}

        {/* Flash sale info */}
        {isFlash && promo.flashPrice && (
          <div className="border-t border-[#262626] pt-3 mb-3">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-black text-[#dc2626] font-mono">
                Rp {promo.flashPrice.toLocaleString("id-ID")}
              </span>
              {promo.productIds && (
                <span className="text-[10px] font-mono text-neutral-500">
                  · {promo.productIds.length} PRODUK
                </span>
              )}
            </div>
            {promo.flashStock && (
              <p className="text-[10px] font-mono text-neutral-600 uppercase">
                Stok terbatas · {promo.flashStock} unit
              </p>
            )}
          </div>
        )}

        {/* Action */}
        {isVoucher ? (
          <VoucherCard voucher={promo} />
        ) : promo.ctaHref ? (
          <Link
            href={promo.ctaHref}
            className="block w-full py-2.5 bg-[#dc2626] hover:bg-white text-white hover:text-[#dc2626] text-[10px] font-black uppercase tracking-[0.25em] text-center transition-colors"
          >
            {promo.ctaLabel || "AMBIL PROMO"}
          </Link>
        ) : (
          <Link
            href="/"
            className="block w-full py-2.5 border-2 border-[#262626] hover:border-[#dc2626] hover:bg-[#dc2626] text-neutral-400 hover:text-white text-[10px] font-black uppercase tracking-[0.25em] text-center transition-colors"
          >
            LIHAT DETAIL
          </Link>
        )}
      </div>
    </div>
  );
}
