import { requireCustomerUser } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, MapPin, Edit, Trash2, Star } from "lucide-react";
import DeleteAddressButton from "./DeleteAddressButton";
import SetDefaultAddressButton from "@/components/customer/SetDefaultAddressButton";

export default async function AlamatPage() {
  const user = await requireCustomerUser();
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const { data: addresses } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">
            Alamat Saya
          </h1>
          <p className="text-sm text-text-muted">
            Kelola alamat pengiriman Anda
          </p>
        </div>
        <Link
          href="/akun/alamat/baru"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-black text-text-primary text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors rounded-subtle min-h-[44px]"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Tambah</span>
          <span className="sm:hidden">Baru</span>
        </Link>
      </div>

      {addresses && addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <article
              key={addr.id}
              className={`bg-surface-1 border rounded-subtle p-4 transition-colors ${
                addr.is_default
                  ? "border-brand-black ring-1 ring-brand-black/20"
                  : "border-border-subtle"
              }`}
            >
              {/* Header: label + badge default + actions */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-text-primary">
                    <MapPin size={12} strokeWidth={2.5} className="text-brand-black" />
                    {addr.label}
                  </span>
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-brand-black text-text-primary px-2 py-0.5 rounded-subtle">
                      <Star size={9} strokeWidth={2.5} className="fill-current" />
                      Utama
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!addr.is_default && (
                    <SetDefaultAddressButton addressId={addr.id} />
                  )}
                  <Link
                    href={`/akun/alamat/${addr.id}`}
                    aria-label="Edit alamat"
                    className="w-9 h-9 flex items-center justify-center border border-border-subtle hover:border-brand-black hover:bg-brand-black hover:text-white transition-colors rounded-subtle"
                  >
                    <Edit size={14} strokeWidth={2.5} />
                  </Link>
                  <DeleteAddressButton addressId={addr.id} />
                </div>
              </div>

              {/* Recipient + phone */}
              <p className="text-sm font-bold text-text-primary">
                {addr.recipient_name}
              </p>
              <p className="text-xs text-text-muted">{addr.phone}</p>

              {/* Address */}
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {addr.street}, {addr.city}
                {addr.province ? `, ${addr.province}` : ""} {addr.postal_code}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-surface-1 border border-dashed border-border-subtle rounded-subtle p-10 text-center">
          <MapPin className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-sm font-bold text-text-primary uppercase tracking-tight mb-1">
            Belum Ada Alamat
          </p>
          <p className="text-xs text-text-muted mb-4">
            Tambahkan alamat untuk mempercepat checkout
          </p>
          <Link
            href="/akun/alamat/baru"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-black text-text-primary text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors rounded-subtle min-h-[44px]"
          >
            <Plus size={14} strokeWidth={2.5} />
            Tambah Alamat Pertama
          </Link>
        </div>
      )}
    </div>
  );
}
