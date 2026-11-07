-- "How did it ride?" (shared/track-reports.ts): the rider's two-tap report on how a track rode on a day.
-- Additive and re-runnable: new columns, checks added NOT VALID (rows written before this are not re-checked), a unique
-- index only when no duplicates exist, and extra restrictive policies on top of track_reports_own. Nothing is dropped,
-- deleted or rewritten.
--
-- Who sees what: a rider reads and writes only their own rows (track_reports_own, unchanged). Other riders' reports are
-- never readable with a rider's token; the server adds them up with the service role and hands Ask BAK and the track
-- screen counts and anonymous notes only. removed_at is set by moderation and cannot be written by riders.

alter table public.track_reports add column if not exists tire text not null default '';
alter table public.track_reports add column if not exists front_psi numeric(4,1);
alter table public.track_reports add column if not exists rear_psi numeric(4,1);
alter table public.track_reports add column if not exists setup_log_id uuid references public.setup_logs(id) on delete set null;
alter table public.track_reports add column if not exists setup_text text not null default '';
alter table public.track_reports add column if not exists removed_at timestamptz;

do $$ begin
 if not exists(select 1 from pg_constraint where conname='track_reports_tags_known' and conrelid='public.track_reports'::regclass) then
  alter table public.track_reports add constraint track_reports_tags_known check (
   cardinality(tags) between 1 and 16 and tags <@ array['sand','loam','clay','hard_pack','mixed','watered','wet_muddy','tacky','dry','dusty',
    'ruts_deep','ruts_light','braking_bumps','square_edge','whoops_rough','rocks','fresh_prep','ripped','rolled']::text[]) not valid;
 end if;
 if not exists(select 1 from pg_constraint where conname='track_reports_fields_bounded' and conrelid='public.track_reports'::regclass) then
  alter table public.track_reports add constraint track_reports_fields_bounded check (
   char_length(tire)<=80 and char_length(setup_text)<=200 and char_length(note)<=500
   and (front_psi is null or front_psi between 4 and 30) and (rear_psi is null or rear_psi between 4 and 30)) not valid;
 end if;
end $$;

-- One report per rider, track and day: a second save replaces the first. Skipped (not forced) if duplicates already exist.
do $$ begin
 if not exists(select 1 from pg_indexes where schemaname='public' and indexname='track_reports_one_per_day')
  and not exists(select 1 from public.track_reports group by user_id,track_id,ridden_on having count(*)>1) then
  create unique index track_reports_one_per_day on public.track_reports(user_id,track_id,ridden_on);
 end if;
end $$;
create index if not exists track_reports_user_created on public.track_reports(user_id,created_at desc);
create index if not exists track_reports_setup_log on public.track_reports(setup_log_id) where setup_log_id is not null;

-- Riders write every column except moderation's removed_at (and created_at). Updates are what a re-save (upsert) does.
revoke insert,update on public.track_reports from authenticated;
grant insert(user_id,track_id,race_id,ridden_on,tags,note,tire,front_psi,rear_psi,setup_log_id,setup_text) on public.track_reports to authenticated;
grant update(user_id,track_id,race_id,ridden_on,tags,note,tire,front_psi,rear_psi,setup_log_id,setup_text) on public.track_reports to authenticated;
grant select,delete on public.track_reports to authenticated;

-- On top of track_reports_own: only a track riders can pick (listed, approved), and only the rider's own setup entry and race.
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_reports' and policyname='track_reports_listed_own_links_insert') then
  create policy track_reports_listed_own_links_insert on public.track_reports as restrictive for insert to authenticated with check (
   exists(select 1 from public.tracks t where t.id=track_id and t.listed and t.review_status='APPROVED')
   and (setup_log_id is null or exists(select 1 from public.setup_logs s where s.id=setup_log_id and s.user_id=(select auth.uid())))
   and (race_id is null or exists(select 1 from public.races r where r.id=race_id and r.user_id=(select auth.uid()))));
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_reports' and policyname='track_reports_listed_own_links_update') then
  create policy track_reports_listed_own_links_update on public.track_reports as restrictive for update to authenticated using (true) with check (
   exists(select 1 from public.tracks t where t.id=track_id and t.listed and t.review_status='APPROVED')
   and (setup_log_id is null or exists(select 1 from public.setup_logs s where s.id=setup_log_id and s.user_id=(select auth.uid())))
   and (race_id is null or exists(select 1 from public.races r where r.id=race_id and r.user_id=(select auth.uid()))));
 end if;
end $$;
