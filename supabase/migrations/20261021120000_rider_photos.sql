-- Rider photos: bike pictures, post photos, photos sent to BAK in chat, and profile pictures.
-- Files live in a private bucket; the server hands out short-lived signed links. Riders only see their own rows directly.
create table if not exists public.rider_photos(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('post','chat','bike','avatar')),
 bike_id uuid references public.bikes(id) on delete cascade,
 storage_path text not null,
 content_type text not null default 'image/jpeg',
 width int,
 height int,
 created_at timestamptz not null default now()
);
create index if not exists rider_photos_owner on public.rider_photos(user_id,kind,bike_id,created_at desc);
alter table public.rider_photos enable row level security;
revoke all on public.rider_photos from anon,authenticated;
grant select on public.rider_photos to authenticated;
grant all on public.rider_photos to service_role;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='rider_photos' and policyname='rider_photos_own') then create policy rider_photos_own on public.rider_photos for select to authenticated using (user_id=auth.uid()); end if; end $$;

alter table public.posts add column if not exists photo_ids uuid[] not null default '{}';
alter table public.messages add column if not exists photo_ids uuid[] not null default '{}';
alter table public.ai_requests add column if not exists photo_ids uuid[] not null default '{}';
alter table public.profiles add column if not exists avatar_photo_id uuid references public.rider_photos(id) on delete set null;

grant update(avatar_photo_id) on public.profiles to authenticated;

-- A post or profile can only point at its own rider's photos of the right kind, even when written directly.
create or replace function public.check_photo_owner() returns trigger language plpgsql security definer set search_path='' as $$
declare ids uuid[]; want text;
begin
 if tg_table_name='posts' then ids:=coalesce(new.photo_ids,'{}'); want:='post';
 else ids:=case when new.avatar_photo_id is null then '{}'::uuid[] else array[new.avatar_photo_id] end; want:='avatar';
 end if;
 if cardinality(ids)>4 then raise exception 'Too many photos';end if;
 if exists(select 1 from unnest(ids) x where not exists(select 1 from public.rider_photos p where p.id=x and p.user_id=new.user_id and p.kind=want)) then raise exception 'Photo not found';end if;
 return new;
end $$;
revoke all on function public.check_photo_owner() from public,anon,authenticated;
do $$ begin
 if not exists(select 1 from pg_trigger where tgname='posts_photo_owner') then create trigger posts_photo_owner before insert or update of photo_ids on public.posts for each row execute function public.check_photo_owner(); end if;
 if not exists(select 1 from pg_trigger where tgname='profiles_photo_owner') then create trigger profiles_photo_owner before insert or update of avatar_photo_id on public.profiles for each row execute function public.check_photo_owner(); end if;
end $$;

-- Same as before, plus the photos the rider sent with the question are kept on their message.
create or replace function public.complete_ai_request(p_user_id uuid,p_request_id uuid,p_response jsonb,p_raw_output jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare r public.ai_requests; b public.bikes; c public.conversations; assistant_id uuid := gen_random_uuid(); expected_context jsonb;
begin
 select * into r from public.ai_requests where request_id=p_request_id and user_id=p_user_id;
 if not found or r.state<>'processing' then raise exception 'Request not processing';end if;
 select * into c from public.conversations where id=r.conversation_id and user_id=p_user_id;
 if not found then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 if c.bike_id is not null then
  select bikes.* into b from public.bikes bikes where bikes.id=c.bike_id and bikes.user_id=p_user_id for share of bikes;
  if not found then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 end if;
 perform 1 from public.conversations where id=r.conversation_id and user_id=p_user_id and bike_id is not distinct from c.bike_id for update;
 if not found then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 select * into r from public.ai_requests where request_id=p_request_id and user_id=p_user_id for update;
 if not found or r.state<>'processing' then raise exception 'Request not processing';end if;
 if c.bike_id is null then
  if r.bike_snapshot is not null and r.bike_snapshot<>'null'::jsonb then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 else
  expected_context:=jsonb_build_object('id',b.id,'user_id',b.user_id,'manufacturer',b.manufacturer,'model',b.model,'model_year',b.model_year,'variant',b.variant,'region',b.region,'engine_hours',b.engine_hours,'configuration',b.configuration);
  if r.bike_snapshot is null or not (r.bike_snapshot @> expected_context) then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 end if;
 insert into public.messages(id,conversation_id,user_id,role,content,response,photo_ids) values
 (gen_random_uuid(),r.conversation_id,p_user_id,'user',r.input,null,coalesce(r.photo_ids,'{}')),
 (assistant_id,r.conversation_id,p_user_id,'assistant',p_response->>'summary',p_response,'{}');
 update public.conversations set updated_at=now() where id=r.conversation_id;
 update public.ai_requests set assistant_message_id=assistant_id,state='complete',response=p_response,raw_output=p_raw_output,completed_at=now() where request_id=p_request_id;
end $$;
revoke all on function public.complete_ai_request(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.complete_ai_request(uuid,uuid,jsonb,jsonb) to service_role;

do $$ begin
 if to_regclass('storage.buckets') is not null then
  insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('rider-photos','rider-photos',false,15728640,array['image/jpeg','image/png','image/heic','image/webp'])
  on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
 end if;
end $$;
