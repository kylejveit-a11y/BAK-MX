-- Build sheet visibility is one choice per bike, made once by the owner: public (anyone who can see the bike on the profile
-- can read its parts list) or private. Replaces asking and approving rider by rider; the request table is no longer used.
alter table public.bikes add column if not exists build_sheet_public boolean not null default false;
grant update(build_sheet_public) on public.bikes to authenticated;

-- What a profile shows: shown bikes, their chosen photos, and whether the parts list is public. Hidden both ways by a block.
create or replace function public.profile_garage(p_user uuid) returns table(id uuid,manufacturer text,model text,model_year int,variant text,nickname text,public_photo_ids uuid[],build_sheet_public boolean)
language sql stable security definer set search_path='' as $$
 select b.id,b.manufacturer,b.model,b.model_year,b.variant,b.nickname,b.public_photo_ids,b.build_sheet_public from public.bikes b
 where b.user_id=p_user and b.show_on_profile and ((select auth.uid())=p_user or not private.blocked_with(p_user))
 order by b.created_at;
$$;
revoke all on function public.profile_garage(uuid) from public,anon;
grant execute on function public.profile_garage(uuid) to authenticated;

-- The parts list: for the owner, or anyone when the bike is shown and its build sheet is public (and no block either way).
-- Only the bike's name and the fitted-parts lists: never rider details, notes, VIN, hours or settings.
create or replace function public.shared_build_sheet(p_bike uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',b.id,'manufacturer',b.manufacturer,'model',b.model,'model_year',b.model_year,'variant',b.variant,'nickname',b.nickname,
  'configuration',jsonb_build_object('installed_parts',coalesce(b.configuration->'installed_parts','[]'::jsonb),'stock_systems',coalesce(b.configuration->'stock_systems','[]'::jsonb)))
 from public.bikes b
 where b.id=p_bike and (b.user_id=(select auth.uid()) or (b.show_on_profile and b.build_sheet_public and not private.blocked_with(b.user_id)));
$$;
