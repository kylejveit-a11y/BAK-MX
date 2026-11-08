-- Fuel profiles (shared/fuel-plan.ts): the rider's weight, height and age, and what the race-day fuel plan needs from
-- them (nervous stomach, caffeine opt-in, the sweat-test result, the doctor/dietitian screening answers). One profile for
-- the rider ("self") and up to a dozen riders without an account of their own ("rider", e.g. a parent's child), all stored
-- on the account holder's own rows.
--
-- Additive and re-runnable: a new table, indexes, constraints, grants and policies, each only when missing. Nothing is
-- dropped, deleted or rewritten. NOT applied by this change; apply it to the MX project only (never EMOTO).
--
-- Who sees what: an account reads and writes only its own rows. Weight is used only to scale portions and for the sweat
-- test; height is stored and never used to judge. Riders can delete their own profiles (it is personal data).

create table if not exists public.fuel_profiles(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users on delete cascade,
 kind text not null default 'rider',
 name text not null default '',
 weight_kg numeric(5,1) not null,
 weight_unit text not null default 'lb',
 height_cm numeric(4,1),
 age smallint not null,
 sex text,
 nervous_stomach boolean not null default false,
 caffeine boolean not null default false,
 moto_minutes smallint,
 sweat_rate_lph numeric(4,2),
 sweat_test_at timestamptz,
 sweat_test_hot boolean,
 screen jsonb not null default '[]'::jsonb,
 cleared boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

do $$ begin
 if not exists(select 1 from pg_constraint where conname='fuel_profiles_fields_bounded' and conrelid='public.fuel_profiles'::regclass) then
  alter table public.fuel_profiles add constraint fuel_profiles_fields_bounded check (
   kind in ('self','rider') and char_length(name)<=40 and weight_unit in ('kg','lb')
   and weight_kg between 15 and 200 and (height_cm is null or height_cm between 90 and 230) and age between 5 and 99
   and (sex is null or sex in ('female','male'))
   and (moto_minutes is null or moto_minutes between 5 and 60)
   and (sweat_rate_lph is null or sweat_rate_lph between 0.1 and 4));
 end if;
 -- Caffeine is for adults only: an under-18 profile can never opt in (AAP 2011).
 if not exists(select 1 from pg_constraint where conname='fuel_profiles_caffeine_adults' and conrelid='public.fuel_profiles'::regclass) then
  alter table public.fuel_profiles add constraint fuel_profiles_caffeine_adults check (not caffeine or age>=18);
 end if;
 if not exists(select 1 from pg_constraint where conname='fuel_profiles_screen_shape' and conrelid='public.fuel_profiles'::regclass) then
  alter table public.fuel_profiles add constraint fuel_profiles_screen_shape check (
   jsonb_typeof(screen)='array' and jsonb_array_length(screen)<=12 and pg_column_size(screen)<=1000);
 end if;
end $$;

create index if not exists fuel_profiles_owner on public.fuel_profiles(user_id,created_at);
-- One profile for the account holder themself.
create unique index if not exists fuel_profiles_one_self on public.fuel_profiles(user_id) where kind='self';

alter table public.fuel_profiles enable row level security;
revoke all on public.fuel_profiles from anon;
revoke all on public.fuel_profiles from authenticated;
grant select,delete on public.fuel_profiles to authenticated;
grant insert(id,user_id,kind,name,weight_kg,weight_unit,height_cm,age,sex,nervous_stomach,caffeine,moto_minutes,sweat_rate_lph,sweat_test_at,sweat_test_hot,screen,cleared) on public.fuel_profiles to authenticated;
grant update(kind,name,weight_kg,weight_unit,height_cm,age,sex,nervous_stomach,caffeine,moto_minutes,sweat_rate_lph,sweat_test_at,sweat_test_hot,screen,cleared,updated_at) on public.fuel_profiles to authenticated;

do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='fuel_profiles' and policyname='fuel_profiles_read_own') then
  create policy fuel_profiles_read_own on public.fuel_profiles for select to authenticated using ((select auth.uid())=user_id);
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='fuel_profiles' and policyname='fuel_profiles_insert_own') then
  create policy fuel_profiles_insert_own on public.fuel_profiles for insert to authenticated with check ((select auth.uid())=user_id);
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='fuel_profiles' and policyname='fuel_profiles_update_own') then
  create policy fuel_profiles_update_own on public.fuel_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='fuel_profiles' and policyname='fuel_profiles_delete_own') then
  create policy fuel_profiles_delete_own on public.fuel_profiles for delete to authenticated using ((select auth.uid())=user_id);
 end if;
end $$;
