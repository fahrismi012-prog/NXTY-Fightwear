-- Harga berbeda per variasi (size/color) + harga khusus pelanggan lama.

-- Harga per kombinasi size/color. Key format: "size|color" (kosong kalau
-- produk tidak punya sisi itu, mis. "M|" atau "|Merah"). Kombinasi yang
-- tidak ada di sini pakai products.price sebagai fallback.
alter table public.products
  add column if not exists variant_prices jsonb not null default '{}'::jsonb;

-- Harga khusus untuk pelanggan tier "legacy". Null = tidak ada harga
-- khusus, pakai harga normal (variant_prices / price).
alter table public.products
  add column if not exists legacy_price integer;

-- Tier pelanggan. Semua akun yang sudah ada SEBELUM migration ini jalan
-- otomatis ditandai "legacy" (mereka pelanggan sebelum sistem harga baru
-- ada). Akun baru setelah ini default "standard".
alter table public.customer_profiles
  add column if not exists price_tier text not null default 'standard'
    check (price_tier in ('standard', 'legacy'));

update public.customer_profiles set price_tier = 'legacy';
