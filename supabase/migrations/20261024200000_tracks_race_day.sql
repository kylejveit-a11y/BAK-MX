-- Track knowledge bank (docs/research/tracks/README.md) and Race Day.
-- tracks: one row per facility, researched from track sites, race reports and rider forums. Read by every signed-in
--   rider; written only by the research loader (service role). Rider opinion lives in rider_reports with dates.
-- races: a rider's upcoming race or ride day at a track (countdown, weather, mud prep). Private to the rider.
-- track_reports: the rider's quick "how was it?" after riding. Private to the rider; used in aggregate later.
create table if not exists public.tracks(
 id text primary key,
 name text not null, aliases text[] not null default '{}',
 state text not null, city text, county text, address text,
 lat double precision, lng double precision, elevation_ft integer,
 types text[] not null default '{}',
 access text not null default 'unknown' check (access in ('public','members','private','appointment','unknown')),
 status text not null default 'unknown' check (status in ('open','closed','seasonal','unknown')),
 website text, phone text, facebook text, instagram text,
 tracks_on_site text[] not null default '{}',
 soil jsonb not null default '{}'::jsonb, layout jsonb not null default '{}'::jsonb, conditions jsonb not null default '{}'::jsonb,
 rider_reports jsonb not null default '[]'::jsonb, sources jsonb not null default '[]'::jsonb,
 confidence text not null default 'low' check (confidence in ('high','medium','low')),
 gaps text[] not null default '{}',
 review_status text not null default 'APPROVED' check (review_status in ('APPROVED','HELD')),
 research_file text not null default '', updated_at timestamptz not null default now()
);
create index if not exists tracks_state on public.tracks(state);
alter table public.tracks enable row level security;
revoke all on public.tracks from anon,authenticated;
grant select on public.tracks to authenticated;
grant all on public.tracks to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='tracks' and policyname='approved_tracks') then
  create policy approved_tracks on public.tracks for select to authenticated using (review_status='APPROVED');
 end if;
end $$;

create table if not exists public.races(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 bike_id uuid references public.bikes(id) on delete set null,
 track_id text references public.tracks(id) on delete set null,
 track_name text not null default '',
 name text not null default '',
 race_date date not null,
 kind text not null default 'race' check (kind in ('race','practice','ride_day','clinic')),
 notes text not null default '' check (char_length(notes)<=2000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists races_user_date on public.races(user_id,race_date);
alter table public.races enable row level security;
revoke all on public.races from anon;
grant select,insert,update,delete on public.races to authenticated;
grant all on public.races to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='races' and policyname='races_own') then
  create policy races_own on public.races for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
 end if;
end $$;

create table if not exists public.track_reports(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 track_id text not null references public.tracks(id) on delete cascade,
 race_id uuid references public.races(id) on delete set null,
 ridden_on date not null,
 tags text[] not null default '{}',
 note text not null default '' check (char_length(note)<=1000),
 created_at timestamptz not null default now()
);
create index if not exists track_reports_track on public.track_reports(track_id,ridden_on desc);
alter table public.track_reports enable row level security;
revoke all on public.track_reports from anon;
grant select,insert,delete on public.track_reports to authenticated;
grant all on public.track_reports to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_reports' and policyname='track_reports_own') then
  create policy track_reports_own on public.track_reports for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
 end if;
end $$;
