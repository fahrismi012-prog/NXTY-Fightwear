import { createAdminClient } from "@/lib/supabase/server";
import type { PriceTier } from "@/types/database";
import TierSelect from "./TierSelect";

export const dynamic = "force-dynamic";

interface CustomerRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  price_tier: PriceTier;
  created_at: string;
  email: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

async function loadCustomers(): Promise<CustomerRow[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const [{ data: profiles, error: profilesError }, { data: usersPage, error: usersError }] =
    await Promise.all([
      supabase
        .from("customer_profiles")
        .select("id, full_name, phone, price_tier, created_at")
        .order("created_at", { ascending: false }),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  if (profilesError || usersError) {
    console.warn("[admin/pelanggan] load error:", profilesError?.message, usersError?.message);
    return [];
  }

  const emailById = new Map(usersPage.users.map((u) => [u.id, u.email ?? "—"]));
  return (profiles ?? []).map((p) => ({ ...p, email: emailById.get(p.id) ?? "—" }));
}

export default async function PelangganPage() {
  const customers = await loadCustomers();

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">
          Manajemen
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Pelanggan
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Kelola tier harga pelanggan. Tier &quot;legacy&quot; mendapat harga
          khusus (legacy_price) kalau produk mengatur harga tersebut.
        </p>
      </div>

      <div className="bg-white border-2 border-neutral-800 overflow-x-auto">
        {customers.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
              Belum ada pelanggan
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800">
                  Email
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800">
                  Nama
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-36">
                  Bergabung
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-44">
                  Tier Harga
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-t-2 border-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-black text-black border-r-2 border-neutral-800">
                    {c.email}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-700 border-r-2 border-neutral-800">
                    {c.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-neutral-600 border-r-2 border-neutral-800">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <TierSelect id={c.id} initialTier={c.price_tier} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
