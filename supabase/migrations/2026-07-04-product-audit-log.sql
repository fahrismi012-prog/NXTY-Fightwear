-- ============================================================
-- Migration: 2026-07-04-product-audit-log.sql
--
-- Riwayat perubahan harga/stok produk. Admin saat ini single-user
-- (satu password bersama), jadi log ini mencatat APA yang berubah
-- dan KAPAN — tanpa kolom "siapa" karena sistem auth admin belum
-- membedakan identitas per-user.
--
-- CARA RUN:
--   1. Buka Supabase Dashboard > SQL Editor
--   2. Copy-paste isi file ini
--   3. Jalankan. Semua statement idempotent (aman di-run ulang).
-- ============================================================

create table if not exists public.product_audit_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  field text not null,
  old_value text,
  new_value text,
  changed_at timestamptz not null default now()
);

create index if not exists idx_product_audit_log_product_time
  on public.product_audit_log (product_id, changed_at desc);

alter table public.product_audit_log enable row level security;

-- Pola sama dengan settings_audit_log: MVP menganggap semua
-- authenticated user sebagai admin (belum ada role check).
drop policy if exists "Admin read product audit log" on public.product_audit_log;
create policy "Admin read product audit log"
  on public.product_audit_log for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin insert product audit log" on public.product_audit_log;
create policy "Admin insert product audit log"
  on public.product_audit_log for insert
  with check (auth.role() = 'authenticated');

comment on table public.product_audit_log is 'Riwayat perubahan harga/stok produk. Insert otomatis dari PUT /api/admin/products/[id].';
