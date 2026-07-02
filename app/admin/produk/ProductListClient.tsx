"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

interface CategoryLite {
  id: string;
  name: string;
  slug: string;
}

interface ImageLite {
  id: string;
  url: string;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  featured: boolean;
  in_stock: boolean;
  category: CategoryLite | null;
  images: ImageLite[];
}

interface Props {
  products: ProductRow[];
  categories: CategoryLite[];
}

const PAGE_SIZE = 20;

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function primaryImage(images: ImageLite[]): string | null {
  if (!images || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0]?.url ?? null;
}

export default function ProductListClient({ products, categories }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter && p.category?.id !== categoryFilter) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  async function handleDelete(product: ProductRow) {
    const confirmed = window.confirm(
      `Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;
    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast("info", json.error ?? "Gagal menghapus produk");
        return;
      }
      showToast("success", `Produk "${product.name}" berhasil dihapus`);
      router.refresh();
    } catch {
      showToast("info", "Terjadi kesalahan jaringan");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start md:items-center justify-between gap-4 mb-6 flex-col md:flex-row">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">
            Manajemen
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
            Produk
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Kelola produk Anxiety Fightwear. Total {products.length} produk.
          </p>
        </div>
        <Link
          href="/admin/produk/baru"
          className="inline-flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Tambah Produk
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-2 border-neutral-800 p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label
            htmlFor="search"
            className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2"
          >
            Cari Nama
          </label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              strokeWidth={2.5}
            />
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Ketik nama produk…"
              className="w-full bg-white border-2 border-neutral-600 pl-10 pr-4 py-3 text-sm text-black placeholder-neutral-500 focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2"
          >
            Kategori
          </label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              resetPage();
            }}
            className="w-full bg-white border-2 border-neutral-600 px-3 py-3 text-sm text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-neutral-800 overflow-x-auto">
        {products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">
              Belum ada produk
            </p>
            <p className="text-[11px] text-neutral-600 mb-4">
              Tambahkan produk pertama untuk mulai mengisi toko.
            </p>
            <Link
              href="/admin/produk/baru"
              className="inline-flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} />
              Tambah Produk
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">
              Tidak ada hasil
            </p>
            <p className="text-[11px] text-neutral-600">
              Coba ubah filter atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-12">
                  #
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-16">
                  Gambar
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800">
                  Nama
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-40">
                  Kategori
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-36">
                  Harga
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-24 text-center">
                  Featured
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-r-2 border-neutral-800 w-24 text-center">
                  Stok
                </th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest w-44">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p, idx) => {
                const thumb = primaryImage(p.images);
                const isDeleting = deletingId === p.id;
                return (
                  <tr
                    key={p.id}
                    className="border-t-2 border-neutral-800 hover:bg-black/5 transition-colors"
                  >
                    <td className="px-3 py-3 text-xs font-black text-neutral-500 border-r-2 border-neutral-800">
                      {start + idx + 1}
                    </td>
                    <td className="px-3 py-3 border-r-2 border-neutral-800">
                      <div className="w-10 h-10 border-2 border-neutral-800 bg-white flex items-center justify-center overflow-hidden">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-neutral-600 font-black uppercase">
                            N/A
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm font-black text-black border-r-2 border-neutral-800">
                      {p.name}
                      <p className="mt-1 text-[10px] font-normal text-neutral-500 font-mono">
                        {p.slug}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-xs text-neutral-600 border-r-2 border-neutral-800">
                      {p.category ? (
                        <span className="inline-block bg-white border border-neutral-800 px-2 py-1 text-[10px] font-black uppercase tracking-wide">
                          {p.category.name}
                        </span>
                      ) : (
                        <span className="text-neutral-600 italic">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs border-r-2 border-neutral-800">
                      <div className="font-black text-black">
                        {formatRupiah(p.price)}
                      </div>
                      {p.original_price && p.original_price > p.price ? (
                        <div className="text-[10px] text-neutral-500 line-through mt-0.5">
                          {formatRupiah(p.original_price)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-center border-r-2 border-neutral-800">
                      {p.featured ? (
                        <span className="inline-block bg-black text-white px-2 py-1 text-[9px] font-black uppercase tracking-widest">
                          Ya
                        </span>
                      ) : (
                        <span className="text-neutral-600 text-[10px] font-black uppercase">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center border-r-2 border-neutral-800">
                      {p.in_stock ? (
                        <span className="inline-block bg-black text-white px-2 py-1 text-[9px] font-black uppercase tracking-widest">
                          Ready
                        </span>
                      ) : (
                        <span className="inline-block bg-white text-neutral-500 border border-neutral-800 px-2 py-1 text-[9px] font-black uppercase tracking-widest">
                          Habis
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/produk/${p.id}`}
                          className="inline-flex items-center gap-1.5 bg-white text-black border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                        >
                          <Pencil size={12} strokeWidth={2.5} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 bg-white text-[#dc2626] border-2 border-[#dc2626] px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-[#dc2626] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} strokeWidth={2.5} />
                          )}
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Halaman {safePage} dari {totalPages} — Menampilkan {start + 1}–
            {Math.min(start + PAGE_SIZE, filtered.length)} dari {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 bg-white text-black border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={12} strokeWidth={2.5} />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 bg-white text-black border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
