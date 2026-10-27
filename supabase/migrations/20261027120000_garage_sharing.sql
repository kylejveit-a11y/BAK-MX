-- Garage sharing: a rider can show a bike on their profile with the photos they pick. The build sheet (fitted parts) stays
-- private; another rider can ask to see it, and the owner approves, declines or later stops sharing. Off by default.
alter table public.bikes add column if not exists show_on_profile boolean not null default false;
alter table public.bikes add column if not exists public_photo_ids uuid[] not null default '{}';
grant update(show_on_profile,public_photo_ids) on public.bikes to authenticated;

-- Only this bike's own photos, at most 8, even when written directly.
create or replace function public.check_bike_public_photos() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if cardinality(new.public_photo_ids)>8 then raise exception 'Choose up to 8 photos';end if;
 if exists(select 1 from unnest(new.public_photo_ids) x where not exists(select 1 from public.rider_photos p where p.id=x and p.user_id=new.user_id and p.kind='bike' and p.bike_id=new.id)) then raise exception 'Photo not found';end if;
 return new;
end $$;
revoke all on function public.check_bike_public_photos() from public,anon,authenticated;
create or replace trigger bikes_public_photos before insert or update of public_photo_ids on public.bikes for each row execute function public.check_bike_public_photos();

-- A deleted photo leaves the profile with it.
create or replace function public.unlist_public_bike_photo() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.bike_id is not null then update public.bikes set public_photo_ids=array_remove(public_photo_ids,old.id) where id=old.bike_id and old.id=any(public_photo_ids);end if;
 return old;
end $$;
revoke all on function public.unlist_public_bike_photo() from public,anon,authenticated;
create or replace trigger rider_photos_unlist_public after delete on public.rider_photos for each row when (old.kind='bike') execute function public.unlist_public_bike_photo();

-- The bikes a rider shows on their profile: the bike's name and chosen photos only, never hours, settings or parts.
-- Hidden in both directions by a block.
create or replace function public.public_garage(p_user uuid) returns table(id uuid,manufacturer text,model text,model_year int,variant text,nickname text,public_photo_ids uuid[])
language sql stable security definer set search_path='' as $$
 select b.id,b.manufacturer,b.model,b.model_year,b.variant,b.nickname,b.public_photo_ids from public.bikes b
 where b.user_id=p_user and b.show_on_profile and ((select auth.uid())=p_user or not private.blocked_with(p_user))
 order by b.created_at;
$$;
revoke all on function public.public_garage(uuid) from public,anon;
grant execute on function public.public_garage(uuid) to authenticated;

create or replace function public.bike_on_profile(p_bike uuid,p_owner uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.bikes b where b.id=p_bike and b.user_id=p_owner and b.show_on_profile);
$$;
revoke all on function public.bike_on_profile(uuid,uuid) from public,anon;
grant execute on function public.bike_on_profile(uuid,uuid) to authenticated;

create table if not exists public.build_sheet_requests(
 id uuid primary key default gen_random_uuid(),
 bike_id uuid not null references public.bikes(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 requester_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','approved','declined','revoked')),
 created_at timestamptz not null default now(),
 decided_at timestamptz,
 unique(bike_id,requester_id),
 check(owner_id<>requester_id)
);
create index if not exists build_sheet_requests_owner on public.build_sheet_requests(owner_id,status,created_at desc);
create index if not exists build_sheet_requests_requester on public.build_sheet_requests(requester_id);
alter table public.build_sheet_requests enable row level security;
revoke all on public.build_sheet_requests from anon,authenticated;
grant select,insert,delete on public.build_sheet_requests to authenticated;
grant update(status,decided_at,created_at) on public.build_sheet_requests to authenticated;
grant all on public.build_sheet_requests to service_role;
do $$ begin
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='build_sheet_requests' and policyname='bsr_read') then
  create policy bsr_read on public.build_sheet_requests for select to authenticated using(
   (select auth.uid()) in (owner_id,requester_id) and not private.blocked_with(case when (select auth.uid())=owner_id then requester_id else owner_id end));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='build_sheet_requests' and policyname='bsr_ask') then
  create policy bsr_ask on public.build_sheet_requests for insert to authenticated with check(
   requester_id=(select auth.uid()) and status='pending' and decided_at is null and public.bike_on_profile(bike_id,owner_id)
   and not private.blocked_with(owner_id) and exists(select 1 from public.profiles p where p.user_id=(select auth.uid())));
 end if;
 -- The owner answers; the asker may ask again a week after a no or after sharing stopped.
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='build_sheet_requests' and policyname='bsr_answer') then
  create policy bsr_answer on public.build_sheet_requests for update to authenticated using(owner_id=(select auth.uid()))
   with check(owner_id=(select auth.uid()) and status in ('approved','declined','revoked'));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='build_sheet_requests' and policyname='bsr_ask_again') then
  create policy bsr_ask_again on public.build_sheet_requests for update to authenticated
   using(requester_id=(select auth.uid()) and status in ('declined','revoked') and decided_at<now()-interval '7 days')
   with check(requester_id=(select auth.uid()) and status='pending' and decided_at is null and public.bike_on_profile(bike_id,owner_id) and not private.blocked_with(owner_id));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='build_sheet_requests' and policyname='bsr_withdraw') then
  create policy bsr_withdraw on public.build_sheet_requests for delete to authenticated using(requester_id=(select auth.uid()));
 end if;
end $$;

-- The build sheet itself, for the owner or a rider with an approved request, while the bike is still on the profile and
-- neither has blocked the other. Returns only the bike's name and the fitted-parts lists: never rider details, notes, VIN,
-- hours or settings.
create or replace function public.shared_build_sheet(p_bike uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',b.id,'manufacturer',b.manufacturer,'model',b.model,'model_year',b.model_year,'variant',b.variant,'nickname',b.nickname,
  'configuration',jsonb_build_object('installed_parts',coalesce(b.configuration->'installed_parts','[]'::jsonb),'stock_systems',coalesce(b.configuration->'stock_systems','[]'::jsonb)))
 from public.bikes b
 where b.id=p_bike and (b.user_id=(select auth.uid()) or (b.show_on_profile and not private.blocked_with(b.user_id) and exists(
  select 1 from public.build_sheet_requests r where r.bike_id=b.id and r.requester_id=(select auth.uid()) and r.status='approved')));
$$;
revoke all on function public.shared_build_sheet(uuid) from public,anon;
grant execute on function public.shared_build_sheet(uuid) to authenticated;
