-- Live track check-ins: "right now" taps from riders at a track (open, closed, busy, watering, muddy...). Several per day are
-- allowed (conditions change), unlike the one-per-day "How did it ride?" report. A rider writes and reads only their own rows;
-- other riders' check-ins are only ever read by the server with the service role, as counts and times, never a name.
create table if not exists public.track_checkins (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 track_id text not null references public.tracks(id) on delete cascade,
 statuses text[] not null,
 created_at timestamptz not null default now(),
 constraint track_checkins_statuses_known check (cardinality(statuses) between 1 and 4 and statuses <@ array['open','closed','busy','quiet','watering','muddy','dusty','rough','fresh_prep']::text[])
);
create index if not exists track_checkins_track_time on public.track_checkins(track_id,created_at desc);
create index if not exists track_checkins_user_time on public.track_checkins(user_id,created_at desc);
alter table public.track_checkins enable row level security;
revoke all on public.track_checkins from anon,authenticated;
grant select,delete on public.track_checkins to authenticated;
grant insert(user_id,track_id,statuses) on public.track_checkins to authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_checkins' and policyname='track_checkins_own_select') then
  create policy track_checkins_own_select on public.track_checkins for select to authenticated using (user_id=(select auth.uid()));
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_checkins' and policyname='track_checkins_own_delete') then
  create policy track_checkins_own_delete on public.track_checkins for delete to authenticated using (user_id=(select auth.uid()));
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_checkins' and policyname='track_checkins_own_listed_insert') then
  create policy track_checkins_own_listed_insert on public.track_checkins for insert to authenticated with check (
   user_id=(select auth.uid()) and exists(select 1 from public.tracks t where t.id=track_id and t.listed and t.review_status='APPROVED'));
 end if;
end $$;
