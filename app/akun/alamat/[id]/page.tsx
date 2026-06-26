import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AddressForm } from "../AddressForm";

export default async function AlamatEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");

  const { data: address } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .single();

  if (!address) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
        Edit Alamat
      </h1>
      <p className="text-sm text-neutral-400 mb-6">
        Perbarui alamat pengiriman
      </p>
      <AddressForm
        mode="edit"
        addressId={address.id}
        initialData={address}
      />
    </div>
  );
}
