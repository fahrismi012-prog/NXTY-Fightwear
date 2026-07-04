import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { requireCustomerUser } from "@/lib/supabase/server-auth";
import { createAdminClient } from "@/lib/supabase/server";
import ProfileHeader from "@/components/customer/ProfileHeader";
import AccountInfoCard from "@/components/customer/AccountInfoCard";
import ValidatedProfileForm from "@/components/customer/ValidatedProfileForm";

export default async function AkunProfilePage() {
  const user = await requireCustomerUser();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Fetch profile + total orders paralel
  const adminSupabase = createAdminClient();
  const [profileRes, ordersCountRes] = await Promise.all([
    supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(),
    adminSupabase
      ? adminSupabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", user.id)
      : Promise.resolve({ count: 0 }),
  ]);

  const profile = profileRes.data;
  const totalOrders = ordersCountRes.count ?? 0;
  const memberSince = user.email
    ? null // Supabase Auth tidak expose created_at di getUser() — pakai null untuk placeholder
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header card: avatar + nama + email + member sejak */}
      <ProfileHeader
        email={user.email || ""}
        fullName={profile?.full_name ?? null}
        memberSince={memberSince}
      />

      {/* Card kecil informasi akun */}
      <section aria-labelledby="account-info-title">
        <h2
          id="account-info-title"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 px-1"
        >
          Informasi Akun
        </h2>
        <AccountInfoCard
          memberSince={memberSince}
          totalOrders={totalOrders}
          status="Aktif"
        />
      </section>

      {/* Form edit profil */}
      <section aria-labelledby="profile-form-title">
        <h2
          id="profile-form-title"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 px-1"
        >
          Edit Profil
        </h2>
        <div className="bg-surface-1 border border-border-subtle rounded-subtle p-5 md:p-6">
          <ValidatedProfileForm
            userId={user.id}
            email={user.email || ""}
            initialName={profile?.full_name || ""}
            initialPhone={profile?.phone || ""}
          />
        </div>
      </section>
    </div>
  );
}
