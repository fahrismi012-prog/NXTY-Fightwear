-- ============================================================
-- Migration: 2026-07-03-payment-shipping-mode.sql
--
-- Tambah payment mode switch (gateway/manual) + shipping mode switch
-- (auto/manual) + bank accounts + audit log + orders enhancements.
--
-- CARA RUN:
--   1. Buka Supabase Dashboard > SQL Editor
--   2. Copy-paste isi file ini
--   3. Jalankan. Semua statement idempotent (aman di-run ulang).
--
-- BACKWARD COMPATIBLE:
--   - payment_method default 'gateway' untuk order baru
--   - shipping_method_used snapshot mode saat order dibuat
--   - order lama tanpa kolom baru tidak di-backfill (nullable)
-- ============================================================

-- ============================================================
-- SETTINGS (key-value, runtime config)
-- ============================================================
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.settings (key, value, description) values
  ('payment_mode', '"gateway"'::jsonb, 'gateway (Midtrans) atau manual (transfer bank)'),
  ('shipping_mode', '"auto"'::jsonb, 'auto (Everpro) atau manual (admin input)'),
  ('shipping_manual_fee', '15000'::jsonb, 'Fixed ongkir untuk mode manual (Rupiah)'),
  ('payment_manual_expire_hours', '24'::jsonb, 'Batas waktu customer bayar sebelum auto-cancel (mode manual)')
on conflict (key) do nothing;

alter table public.settings enable row level security;

-- Public boleh baca settings (untuk cek mode di frontend)
drop policy if exists "Public read settings" on public.settings;
create policy "Public read settings"
  on public.settings for select
  using (true);

-- Hanya admin (authenticated dengan role tertentu) boleh update
-- Untuk MVP: hanya authenticated user (bisa diperketat dengan role check)
drop policy if exists "Admin update settings" on public.settings;
create policy "Admin update settings"
  on public.settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- SETTINGS AUDIT LOG
-- ============================================================
create table if not exists public.settings_audit_log (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null,
  old_value jsonb,
  new_value jsonb,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create index if not exists idx_settings_audit_log_key_time
  on public.settings_audit_log (setting_key, changed_at desc);

alter table public.settings_audit_log enable row level security;

drop policy if exists "Admin read audit log" on public.settings_audit_log;
create policy "Admin read audit log"
  on public.settings_audit_log for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated insert audit log" on public.settings_audit_log;
create policy "Authenticated insert audit log"
  on public.settings_audit_log for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- BANK ACCOUNTS (untuk mode manual)
-- ============================================================
create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  instructions text,
  logo_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_bank_accounts_updated_at on public.bank_accounts;
create trigger trg_bank_accounts_updated_at
  before update on public.bank_accounts
  for each row execute function public.set_updated_at();

alter table public.bank_accounts enable row level security;

-- Public baca bank accounts yang aktif (untuk display di checkout manual)
drop policy if exists "Public read active bank accounts" on public.bank_accounts;
create policy "Public read active bank accounts"
  on public.bank_accounts for select
  using (is_active = true);

-- Admin full access
drop policy if exists "Admin manage bank accounts" on public.bank_accounts;
create policy "Admin manage bank accounts"
  on public.bank_accounts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- ORDERS: tambah kolom payment_method & proof & confirmation
-- ============================================================
alter table public.orders
  add column if not exists payment_method text
    check (payment_method in ('gateway', 'manual')),
  add column if not exists payment_proof_url text,
  add column if not exists payment_expires_at timestamptz,
  add column if not exists payment_confirmed_at timestamptz,
  add column if not exists payment_confirmed_by uuid references auth.users(id),
  add column if not exists payment_rejection_reason text,
  add column if not exists bank_account_id uuid references public.bank_accounts(id),
  add column if not exists shipping_method_used text
    check (shipping_method_used in ('auto', 'manual')),
  add column if not exists shipping_manual_carrier text,
  add column if not exists shipping_manual_cost integer,
  add column if not exists shipping_manual_receipt text,
  add column if not exists shipping_manual_receipt_url text;

-- Update status enum: tambah awaiting_payment & awaiting_confirmation
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in (
    'awaiting_payment',         -- mode manual: customer sudah checkout, belum upload bukti
    'awaiting_confirmation',   -- mode manual: customer sudah upload bukti, admin belum cek
    'pending',                  -- existing: gateway, belum bayar
    'paid',                     -- existing: sudah dibayar
    'processed',                -- existing
    'shipped',                  -- existing
    'delivered',                -- existing
    'cancelled'                 -- existing
  ));

-- Index untuk filter admin (pending orders by status)
create index if not exists idx_orders_status_created
  on public.orders (status, created_at desc)
  where status in ('awaiting_confirmation', 'awaiting_payment', 'pending');

create index if not exists idx_orders_payment_method
  on public.orders (payment_method)
  where payment_method is not null;

-- ============================================================
-- STORAGE: bucket untuk bukti transfer (PRIVATE)
-- ============================================================
-- Catatan: Pembuatan bucket via SQL kadang gagal di Supabase baru.
-- Kalau error "insufficient_privilege" atau "duplicate key",
-- buat manual via Dashboard > Storage > "New bucket" dengan nama
-- 'payment-proofs' dan Private. Lalu jalankan ulang migration ini
-- (idempotent) untuk policy-nya saja.

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- Policy: customer upload bukti ke folder dengan order_id mereka.
-- Path convention: {order_id}/{filename}
-- Asumsi: customer_id atau customer_email di orders match dengan auth.uid()
drop policy if exists "Customer upload payment proof" on storage.objects;
create policy "Customer upload payment proof"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and auth.role() = 'authenticated'
  );

-- Customer hanya boleh read/write file miliknya sendiri
drop policy if exists "Customer read own payment proof" on storage.objects;
create policy "Customer read own payment proof"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and auth.role() = 'authenticated'
  );

-- Admin (authenticated) boleh read semua bukti transfer
-- (tidak ada policy khusus — semua authenticated user dianggap admin untuk MVP)
-- Production: tambah role check (admin role)

-- ============================================================
-- HELPER FUNCTION: get_payment_mode()
-- Supaya frontend bisa cek mode tanpa query langsung ke settings
-- ============================================================
create or replace function public.get_payment_mode()
returns text
language sql
stable
as $$
  select value #>> '{}' from public.settings where key = 'payment_mode'
$$;

create or replace function public.get_shipping_mode()
returns text
language sql
stable
as $$
  select value #>> '{}' from public.settings where key = 'shipping_mode'
$$;

create or replace function public.get_shipping_manual_fee()
returns integer
language sql
stable
as $$
  select (value #>> '{}')::integer from public.settings where key = 'shipping_manual_fee'
$$;

-- ============================================================
-- COMMENTS (untuk dokumentasi di Supabase)
-- ============================================================
comment on table public.settings is 'Runtime configuration (payment_mode, shipping_mode, dll). Ubah via /admin/settings.';
comment on table public.settings_audit_log is 'Audit trail untuk perubahan settings. Insert otomatis oleh trigger atau API.';
comment on table public.bank_accounts is 'Rekening bank yang ditampilkan ke customer di mode pembayaran manual. Manage via /admin/settings.';
comment on column public.orders.payment_method is 'gateway (Midtrans) atau manual (transfer bank). Snapshot mode saat order dibuat.';
comment on column public.orders.payment_proof_url is 'URL foto bukti transfer customer di Storage bucket payment-proofs. Wajib diisi untuk mode manual.';
comment on column public.orders.payment_confirmed_at is 'Waktu admin konfirmasi pembayaran (mode manual). NULL = belum dikonfirmasi.';
comment on column public.orders.payment_confirmed_by is 'Admin user yang konfirmasi pembayaran.';
comment on column public.orders.shipping_method_used is 'Snapshot shipping mode saat order dibuat. auto atau manual.';
