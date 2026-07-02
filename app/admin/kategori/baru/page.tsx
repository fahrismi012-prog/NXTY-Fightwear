import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryForm from "../CategoryForm";

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <Link
        href="/admin/kategori"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft size={12} strokeWidth={2.5} />
        Kembali ke daftar kategori
      </Link>

      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">
          Kategori Baru
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Tambah Kategori
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Buat kategori baru untuk mengelompokkan produk Anxiety Fightwear.
        </p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
