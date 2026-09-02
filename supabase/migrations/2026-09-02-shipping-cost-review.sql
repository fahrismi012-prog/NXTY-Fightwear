-- Ongkir cek manual: barang dimensi besar, admin hitung ongkir per pesanan.
-- Status baru `awaiting_shipping_cost` = customer sudah buat pesanan, admin
-- belum isi ongkir. Setelah admin isi -> pindah ke `awaiting_payment`.

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in (
    'awaiting_shipping_cost',   -- mode manual: nunggu admin isi ongkir
    'awaiting_payment',         -- mode manual: customer sudah checkout, belum upload bukti
    'awaiting_confirmation',    -- mode manual: customer sudah upload bukti, admin belum cek
    'pending',                  -- gateway, belum bayar
    'paid',
    'processed',
    'shipped',
    'delivered',
    'cancelled'
  ));

-- Index filter admin (pending orders by status)
drop index if exists idx_orders_status_created;
create index idx_orders_status_created
  on public.orders (status, created_at desc)
  where status in ('awaiting_shipping_cost', 'awaiting_confirmation', 'awaiting_payment', 'pending');
