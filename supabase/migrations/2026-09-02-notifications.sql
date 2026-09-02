-- Notifikasi internal aplikasi (persisted — bisa dilihat kembali, bukan toast).
--
-- CARA RUN: Supabase Dashboard > SQL Editor > paste > Run. Idempotent.
--
-- audience 'admin'    -> stream global (admin panel single-user, recipient_id null)
-- audience 'customer' -> recipient_id = auth.users.id (null utk guest checkout;
--                        guest lihat update via halaman order/lacak)

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('admin', 'customer')),
  recipient_id uuid references auth.users(id) on delete cascade,
  order_id text references public.orders(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_admin
  on public.notifications (created_at desc)
  where audience = 'admin';

create index if not exists idx_notifications_customer
  on public.notifications (recipient_id, created_at desc)
  where audience = 'customer';

-- Semua akses lewat API route (service-role key). Tidak ada policy publik =
-- default deny untuk anon/authenticated client langsung.
alter table public.notifications enable row level security;
