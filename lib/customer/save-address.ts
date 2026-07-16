import type { SupabaseClient } from "@supabase/supabase-js";
import type { Customer } from "@/types";

/**
 * Simpan alamat checkout customer yang login sebagai alamat default,
 * supaya checkout berikutnya auto-fill tanpa perlu ke halaman akun dulu.
 * Dipanggil best-effort setelah order berhasil dibuat — kegagalan di sini
 * tidak boleh menggagalkan order.
 */
export async function saveCheckoutAddress(
  supabase: SupabaseClient,
  customerId: string,
  customer: Customer,
) {
  try {
    await supabase.from("customer_profiles").upsert(
      { id: customerId, full_name: customer.name, phone: customer.phone },
      { onConflict: "id" },
    );

    const { data: existing } = await supabase
      .from("customer_addresses")
      .select("id")
      .eq("customer_id", customerId)
      .eq("is_default", true)
      .maybeSingle();

    const addressFields = {
      recipient_name: customer.name,
      phone: customer.phone,
      street: customer.address,
      city: customer.city,
      province: customer.province ?? "",
      postal_code: customer.postalCode ?? "",
    };

    if (existing?.id) {
      await supabase.from("customer_addresses").update(addressFields).eq("id", existing.id);
    } else {
      await supabase
        .from("customer_addresses")
        .insert({ customer_id: customerId, label: "Alamat Checkout", is_default: true, ...addressFields });
    }
  } catch (error) {
    console.error("[saveCheckoutAddress] gagal menyimpan alamat:", error);
  }
}
