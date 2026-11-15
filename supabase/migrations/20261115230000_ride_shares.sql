-- Safety share link. A rider starts a share; anyone with the link (a spouse at the truck) sees the rider's last known position
-- and when it was taken, with no app or account. Only the latest position is kept (no trail). The link stops on its own at
-- expires_at or when the rider ends it, and ending clears the position. Only the hash of the link's secret is stored.
create table if not exists public.ride_shares (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 token_sha256 text not null unique check (token_sha256 ~ '^[0-9a-f]{64}$'),
 rider_name text not null default '' check (char_length(rider_name)<=60),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 ended_at timestamptz,
 last_lat double precision check (last_lat between -90 and 90),
 last_lng double precision check (last_lng between -180 and 180),
 last_accuracy_m real check (last_accuracy_m>=0),
 last_at timestamptz,
 check (expires_at>created_at and expires_at<=created_at+interval '13 hours')
);
create index if not exists ride_shares_user on public.ride_shares(user_id,created_at desc);
alter table public.ride_shares enable row level security;
revoke all on public.ride_shares from anon,authenticated;
-- Riders read their own rows (never the hash); every write goes through the server with the service role.
grant select(id,user_id,rider_name,created_at,expires_at,ended_at,last_lat,last_lng,last_accuracy_m,last_at) on public.ride_shares to authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='ride_shares' and policyname='ride_shares_own_select') then
  create policy ride_shares_own_select on public.ride_shares for select to authenticated using (user_id=(select auth.uid()));
 end if;
end $$;
