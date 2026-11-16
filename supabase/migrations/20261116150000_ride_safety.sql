-- Ride safety: up to two contacts per rider, and a "back by" time on a share. If the rider has not checked in 30 minutes after
-- back_by (alert_at), the server emails their contacts once (alerted_at); checking in afterwards sends an all-clear. Writes go
-- through the server only.
create table if not exists public.safety_contacts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 60),
 phone text not null default '' check (phone ~ '^[0-9+() .-]{0,24}$'),
 email text not null default '' check (email='' or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email)<=200),
 introduced_at timestamptz,
 created_at timestamptz not null default now(),
 check (phone<>'' or email<>'')
);
create index if not exists safety_contacts_user on public.safety_contacts(user_id);
alter table public.safety_contacts enable row level security;
revoke all on public.safety_contacts from anon,authenticated;
grant select(id,user_id,name,phone,email,introduced_at,created_at) on public.safety_contacts to authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='safety_contacts' and policyname='safety_contacts_own_select') then
  create policy safety_contacts_own_select on public.safety_contacts for select to authenticated using (user_id=(select auth.uid()));
 end if;
end $$;

alter table public.ride_shares add column if not exists back_by timestamptz;
alter table public.ride_shares add column if not exists alert_at timestamptz;
alter table public.ride_shares add column if not exists alerted_at timestamptz;
alter table public.ride_shares add column if not exists alert_claimed_at timestamptz;
alter table public.ride_shares add column if not exists all_clear_at timestamptz;
alter table public.ride_shares add column if not exists track_name text not null default '' check (char_length(track_name)<=120);
alter table public.ride_shares add column if not exists tz text not null default '' check (char_length(tz)<=60);
create index if not exists ride_shares_due on public.ride_shares(alert_at) where alerted_at is null and ended_at is null;
grant select(back_by,alert_at,alerted_at,all_clear_at,track_name) on public.ride_shares to authenticated;
-- The link's secret, so the overdue alert can carry the same link the contacts already have. Server only: no app grant.
alter table public.ride_shares add column if not exists link_secret text check (link_secret is null or link_secret ~ '^[A-Za-z0-9_-]{32}$');
