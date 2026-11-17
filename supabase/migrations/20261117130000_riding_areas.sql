-- Where to Ride (docs/plans/riding-areas-plan.md, Kyle 2026-11-17).
-- Riding areas are rows in tracks, so check-ins, race and ride days, What I ran here and events work for them unchanged.
--   kind: 'track' (a motocross facility, with or without woods trails) or 'riding_area' (trail riding is the point).
--   area: the riding-area record from docs/research/riding-areas (vehicles, width, pass, season, rules, sources).
-- trail_lines: published trail lines for an area (Forest Service Motor Vehicle Use Map), loaded by a script, read by riders.
alter table public.tracks add column if not exists kind text not null default 'track';
do $$ begin
 if not exists(select 1 from pg_constraint where conname='tracks_kind_check') then
  alter table public.tracks add constraint tracks_kind_check check (kind in ('track','riding_area'));
 end if;
end $$;
alter table public.tracks add column if not exists area jsonb;

create table if not exists public.trail_lines(
 id text primary key,
 track_id text not null references public.tracks(id) on delete cascade,
 source text not null default 'usfs_mvum' check (source in ('usfs_mvum')),
 source_id text not null default '',
 name text not null default '', number text not null default '',
 vehicles jsonb not null default '{}'::jsonb,
 width text not null default 'unknown' check (width in ('single_track','atv','full_width','unknown')),
 dates_open text not null default '',
 miles numeric,
 line jsonb not null,
 map_date date,
 loaded_at timestamptz not null default now()
);
create index if not exists trail_lines_track on public.trail_lines(track_id);
alter table public.trail_lines enable row level security;
revoke all on public.trail_lines from anon,authenticated;
grant select on public.trail_lines to authenticated;
grant all on public.trail_lines to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='trail_lines' and policyname='trail_lines_read') then
  create policy trail_lines_read on public.trail_lines for select to authenticated
   using (exists(select 1 from public.tracks t where t.id=track_id and t.review_status='APPROVED' and t.listed));
 end if;
end $$;
