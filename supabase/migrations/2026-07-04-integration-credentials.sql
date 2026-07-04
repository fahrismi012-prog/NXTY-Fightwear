-- Runtime integration configuration. Secrets are encrypted by the application
-- before insert and this table intentionally has no public/authenticated policy.
create table if not exists public.integration_credentials (
  provider text primary key check (provider in ('midtrans', 'everpro')),
  environment text not null default 'sandbox' check (environment in ('sandbox', 'production')),
  public_config jsonb not null default '{}'::jsonb,
  encrypted_secrets text,
  updated_at timestamptz not null default now()
);

alter table public.integration_credentials enable row level security;
revoke all on public.integration_credentials from anon, authenticated;

insert into public.integration_credentials (provider, environment)
values ('midtrans', 'sandbox'), ('everpro', 'sandbox')
on conflict (provider) do nothing;

-- Admin website uses the service-role client after validating its own signed
-- admin cookie. Supabase customer sessions must never mutate store settings.
drop policy if exists "Admin update settings" on public.settings;
revoke insert, update, delete on public.settings from anon, authenticated;

drop policy if exists "Admin manage bank accounts" on public.bank_accounts;
revoke insert, update, delete on public.bank_accounts from anon, authenticated;

drop policy if exists "Authenticated insert audit log" on public.settings_audit_log;
revoke insert, update, delete on public.settings_audit_log from anon, authenticated;

-- Payment proofs are served through ownership-checking server endpoints.
drop policy if exists "Customer read own payment proof" on storage.objects;
drop policy if exists "Customer upload payment proof" on storage.objects;
