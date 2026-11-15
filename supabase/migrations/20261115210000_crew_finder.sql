-- Crew finder. Events say who they are for (skill, bike size, riding); 'any' fits everyone. Riders can opt in to show they are
-- riding at a track today: visible to signed-in riders (not to anyone blocked either way) for that day only.
alter table public.events add column if not exists skill_level text not null default 'any';
alter table public.events add column if not exists bike_size text not null default 'any';
alter table public.events add column if not exists discipline text not null default 'any';
do $$ begin
 if not exists(select 1 from pg_constraint where conname='events_crew_fields_known' and conrelid='public.events'::regclass) then
  alter table public.events add constraint events_crew_fields_known check (
   skill_level in ('any','beginner','intermediate','advanced','expert') and bike_size in ('any','peewee','mini','full')
   and discipline in ('any','mx','offroad'));
 end if;
end $$;
grant update(skill_level,bike_size,discipline) on public.events to authenticated;
create index if not exists events_crew on public.events(skill_level,bike_size,discipline);

create table if not exists public.track_presence (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 track_id text not null references public.tracks(id) on delete cascade,
 day date not null,
 created_at timestamptz not null default now(),
 primary key(user_id,track_id,day)
);
create index if not exists track_presence_track_day on public.track_presence(track_id,day);
alter table public.track_presence enable row level security;
revoke all on public.track_presence from anon,authenticated;
grant select,delete on public.track_presence to authenticated;
grant insert(user_id,track_id,day) on public.track_presence to authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_presence' and policyname='track_presence_read') then
  create policy track_presence_read on public.track_presence for select to authenticated using (
   user_id=(select auth.uid()) or (day>=current_date-1 and not public.blocked_with(user_id)));
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_presence' and policyname='track_presence_own_insert') then
  create policy track_presence_own_insert on public.track_presence for insert to authenticated with check (
   user_id=(select auth.uid()) and day between current_date-1 and current_date+1
   and exists(select 1 from public.profiles p where p.user_id=(select auth.uid()))
   and exists(select 1 from public.tracks t where t.id=track_id and t.listed and t.review_status='APPROVED'));
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='track_presence' and policyname='track_presence_own_delete') then
  create policy track_presence_own_delete on public.track_presence for delete to authenticated using (user_id=(select auth.uid()));
 end if;
end $$;
