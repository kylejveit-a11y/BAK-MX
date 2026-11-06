-- Fixes from the 2026-11-06 review of today's features. Additive.
-- 1. A post Ask BAK drafted carries the photos the rider sent in chat: posts accept the rider's own post or chat photos.
-- 2. A post's clip must be the poster's own clip, even when a post is written directly through the database API.
create or replace function public.check_photo_owner() returns trigger language plpgsql security definer set search_path='' as $$
declare ids uuid[]; want text[];
begin
 if tg_table_name='posts' then ids:=coalesce(new.photo_ids,'{}'); want:=array['post','chat'];
 else ids:=case when new.avatar_photo_id is null then '{}'::uuid[] else array[new.avatar_photo_id] end; want:=array['avatar'];
 end if;
 if cardinality(ids)>4 then raise exception 'Too many photos';end if;
 if exists(select 1 from unnest(ids) x where not exists(select 1 from public.rider_photos p where p.id=x and p.user_id=new.user_id and p.kind=any(want))) then raise exception 'Photo not found';end if;
 return new;
end $$;
revoke all on function public.check_photo_owner() from public,anon,authenticated;

create or replace function public.check_post_video_owner() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.video_id is not null and not exists(select 1 from public.rider_videos v where v.id=new.video_id and v.user_id=new.user_id) then raise exception 'Clip not found';end if;
 return new;
end $$;
revoke all on function public.check_post_video_owner() from public,anon,authenticated;
do $$ begin
 if not exists(select 1 from pg_trigger where tgname='posts_video_owner') then create trigger posts_video_owner before insert or update of video_id on public.posts for each row execute function public.check_post_video_owner(); end if;
end $$;
