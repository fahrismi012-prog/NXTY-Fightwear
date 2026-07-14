import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import type { Product, ProductImage, Category } from "@/types/database";
import ProductForm, {
  type CategoryOption,
  type ProductInitial,
} from "../ProductForm";
import type { ImageItem } from "@/components/admin/ImageUploader";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

interface ProductRow extends Product {
  category: Category | Category[] | null;
  images: ProductImage[] | null;
}

function normalizeCategory(c: Category | Category[] | null): Category | null {
  if (!c) return null;
  return Array.isArray(c) ? (c[0] ?? null) : c;
}

interface AuditLogRow {
  id: string;
  field: "price" | "original_price" | "in_stock";
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

const FIELD_LABELS: Record<AuditLogRow["field"], string> = {
  price: "Harga",
  original_price: "Harga Coret",
  in_stock: "In Stock",
};

function formatFieldValue(field: AuditLogRow["field"], value: string | null): string {
  if (value === null || value === "") return "—";
  if (field === "in_stock") return value === "true" ? "Ya" : "Tidak";
  const num = Number(value);
  return Number.isFinite(num) ? `Rp${num.toLocaleString("id-ID")}` : value;
}

function formatFieldDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toImageItems(images: ProductImage[] | null): ImageItem[] {
  if (!images) return [];
  return [...images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      url: img.url,
      sort_order: img.sort_order,
    }));
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const [productRes, categoriesRes, historyRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "*, category:categories(id, name, slug, description, created_at), images:product_images(id, url, sort_order, product_id, created_at)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase
      .from("product_audit_log")
      .select("id, field, old_value, new_value, changed_at")
      .eq("product_id", id)
      .order("changed_at", { ascending: false })
      .limit(20),
  ]);

  if (productRes.error) {
    return (
      <div className="p-4 md:p-8 max-w-4xl">
        <p className="text-sm text-[#dc2626] font-black uppercase tracking-wider">
          Error: {productRes.error.message}
        </p>
      </div>
    );
  }
  if (!productRes.data) {
    notFound();
  }

  const row = productRes.data as ProductRow;
  const category = normalizeCategory(row.category);

  const initial: ProductInitial = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category_id: category?.id ?? null,
    description: row.description,
    price: row.price,
    original_price: row.original_price,
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    rating: row.rating,
    reviews_count: row.reviews_count,
    featured: row.featured,
    in_stock: row.in_stock,
    weight_grams: row.weight_grams,
    variant_prices: row.variant_prices ?? {},
    legacy_price: row.legacy_price,
    is_preorder: row.is_preorder,
    preorder_days: row.preorder_days,
    images: toImageItems(row.images),
  };

  const categories: CategoryOption[] = (categoriesRes.data ??
    []) as CategoryOption[];

  const history = (historyRes.data ?? []) as AuditLogRow[];

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
          Edit Produk
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          {row.name}
        </h1>
        <p className="text-sm text-neutral-500 mt-2 font-mono">{row.slug}</p>
      </div>

      <ProductForm mode="edit" categories={categories} initial={initial} />

      <div className="mt-8 bg-white border-2 border-neutral-800 p-5 md:p-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-4">
          Riwayat Perubahan Harga &amp; Stok
        </h2>
        {history.length === 0 ? (
          <p className="text-xs text-neutral-500">
            Belum ada perubahan harga/stok yang tercatat.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="py-2.5 flex items-center justify-between gap-3 flex-wrap text-xs"
              >
                <span className="font-black uppercase tracking-wide text-black">
                  {FIELD_LABELS[entry.field]}
                </span>
                <span className="text-neutral-600 font-mono">
                  {formatFieldValue(entry.field, entry.old_value)}
                  {" → "}
                  {formatFieldValue(entry.field, entry.new_value)}
                </span>
                <span className="text-neutral-400">
                  {formatFieldDate(entry.changed_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
