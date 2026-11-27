-- Suggest a place (Kyle 2026-11-27): a rider proposes a track or riding area for Where to Ride.
-- A suggestion is private to the rider who sent it and to review. Nothing shows to other riders until the place is
-- added to tracks as an approved, listed row by review. Riders never write to tracks.
create table if not exists public.place_suggestions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 2 and 120),
 kind text not null check (kind in ('track','riding_area')),
 city text not null default '' check (char_length(city)<=80),
 state text not null check (char_length(state) between 2 and 40),
 lat double precision check (lat between -90 and 90),
 lng double precision check (lng between -180 and 180),
 note text not null default '' check (char_length(note)<=600),
 status text not null default 'pending' check (status in ('pending','approved','rejected','duplicate')),
 track_id text references public.tracks(id) on delete set null,
 created_at timestamptz not null default now(),
 reviewed_at timestamptz
);
create index if not exists place_suggestions_owner on public.place_suggestions(user_id,created_at desc);
create index if not exists place_suggestions_queue on public.place_suggestions(status,created_at);
alter table public.place_suggestions enable row level security;
revoke all on public.place_suggestions from anon,authenticated;
grant all on public.place_suggestions to service_role;
grant select on public.place_suggestions to authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='place_suggestions' and policyname='owner_select') then
  create policy owner_select on public.place_suggestions for select to authenticated using ((select auth.uid())=user_id);
 end if;
end $$;
