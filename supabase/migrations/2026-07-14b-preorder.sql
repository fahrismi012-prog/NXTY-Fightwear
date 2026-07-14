-- Mode Pre-Order per produk (mirip Shopee seller center): saat upload,
-- pilih "Live" (langsung jual) atau "Pre-Order" (estimasi lama proses).

alter table public.products
  add column if not exists is_preorder boolean not null default false;

-- Lama proses PO dalam hari. Diisi hanya kalau is_preorder = true.
alter table public.products
  add column if not exists preorder_days integer;
