import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireCustomerUser } from "@/lib/supabase/server-auth";
import AccountSidebar from "@/components/customer/AccountSidebar";

export default async function AkunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCustomerUser();
  const userId = user.id;

  // Fetch profile untuk sidebar (avatar inisial dari nama)
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
  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-4 md:gap-6">
        <AccountSidebar
          email={user.email}
          fullName={profile?.full_name ?? null}
        />
        <main className="flex-1 min-w-0 pb-12">{children}</main>
      </div>
    </div>
  );
}
