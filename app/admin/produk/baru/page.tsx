import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import ProductForm, { type CategoryOption } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const categories: CategoryOption[] = (data ?? []) as CategoryOption[];

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <Link
        href="/admin/produk"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft size={12} strokeWidth={2.5} />
        Kembali ke daftar produk
      </Link>

      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">
          Produk Baru
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Tambah Produk
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Buat produk baru untuk toko Anxiety Fightwear.
        </p>
      </div>

      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
