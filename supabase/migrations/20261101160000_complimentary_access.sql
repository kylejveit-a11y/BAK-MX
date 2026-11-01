-- Complimentary plans: accounts Kyle gives a plan to permanently (family, team), without a store or card subscription.
-- Read only by the server (service role); riders cannot see or change it. Removed with the account.
create table if not exists public.complimentary_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null check (tier in ('premium','pro')),
  reason text not null default '',
  granted_at timestamptz not null default now()
);
alter table public.complimentary_access enable row level security;
revoke all on public.complimentary_access from anon, authenticated;
