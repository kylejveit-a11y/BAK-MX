-- Rider preferences: how BAK answers (units, length, tone). Private to the rider; read by the server for each question.
-- Haptics and reduced motion are kept on the phone itself. The race number is public identity, so it lives on the profile.
create table if not exists public.rider_preferences(
 user_id uuid primary key references auth.users(id) on delete cascade,
 units text not null default 'us' check (units in ('us','metric')),
 answer_length text not null default 'full' check (answer_length in ('quick','full')),
 tone text not null default 'straight' check (tone in ('straight','encouraging')),
 updated_at timestamptz not null default now()
);
alter table public.rider_preferences enable row level security;
revoke all on public.rider_preferences from anon,authenticated;
grant select,insert,update on public.rider_preferences to authenticated;
grant all on public.rider_preferences to service_role;
do $$ begin
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='rider_preferences' and policyname='rider_preferences_own') then
  create policy rider_preferences_own on public.rider_preferences for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
 end if;
end $$;

-- Race number: 1 to 3 digits, or empty. Shown on the profile and bike cards.
alter table public.profiles add column if not exists race_number text not null default '' check (race_number ~ '^([0-9]{1,3})?$');
grant update(race_number) on public.profiles to authenticated;
