-- 1. Videos in Community posts (Kyle, 2026-11-06): one clip of up to 60 seconds per post, with a poster photo.
-- 2. Action-sports photo edits (Kyle, 2026-11-06): 3 free to try, 15 a month on Pro, then edits bought in packs at about
--    25 cents each so the rider covers the generation cost. Same ledger rules as Ask BAK credits: every purchase and use is
--    a row with a unique reference, so a repeated store or Stripe notice never grants twice.
-- Additive only.

do $$ begin
 if to_regclass('storage.buckets') is not null then
  insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('rider-videos','rider-videos',false,104857600,array['video/mp4','video/quicktime','video/webm'])
  on conflict (id) do nothing;
 end if;
end $$;

create table if not exists public.rider_videos(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 storage_path text not null,
 content_type text not null default 'video/mp4',
 poster_photo_id uuid references public.rider_photos(id) on delete set null,
 duration_s numeric(6,2) check (duration_s is null or (duration_s>0 and duration_s<=60.5)),
 width int,
 height int,
 created_at timestamptz not null default now()
);
create index if not exists rider_videos_owner on public.rider_videos(user_id,created_at desc);
alter table public.rider_videos enable row level security;
revoke all on public.rider_videos from anon,authenticated;
grant select on public.rider_videos to authenticated;
grant all on public.rider_videos to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='rider_videos' and policyname='owner_select') then
  create policy owner_select on public.rider_videos for select to authenticated using((select auth.uid())=user_id);
 end if;
end $$;

alter table public.posts add column if not exists video_id uuid references public.rider_videos(id) on delete set null;

create table if not exists public.photo_edits(
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique,
 user_id uuid not null references auth.users(id) on delete cascade,
 source_photo_id uuid references public.rider_photos(id) on delete set null,
 result_photo_id uuid references public.rider_photos(id) on delete set null,
 style text not null,
 funded_by text not null check (funded_by in ('included','credit')),
 status text not null default 'pending' check (status in ('pending','done','failed')),
 created_at timestamptz not null default now()
);
create index if not exists photo_edits_owner on public.photo_edits(user_id,created_at desc);
alter table public.photo_edits enable row level security;
revoke all on public.photo_edits from anon,authenticated;
grant select on public.photo_edits to authenticated;
grant all on public.photo_edits to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='photo_edits' and policyname='owner_select') then
  create policy owner_select on public.photo_edits for select to authenticated using((select auth.uid())=user_id);
 end if;
end $$;

create table if not exists public.photo_edit_ledger(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users on delete cascade,
 delta integer not null check (delta<>0),
 reason text not null check (reason in ('purchase','use','refund','grant')),
 reference text not null unique,
 product text,
 created_at timestamptz not null default now()
);
create index if not exists photo_edit_ledger_user on public.photo_edit_ledger(user_id,created_at);
alter table public.photo_edit_ledger enable row level security;
revoke all on public.photo_edit_ledger from anon,authenticated;
grant select on public.photo_edit_ledger to authenticated;
grant all on public.photo_edit_ledger to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='photo_edit_ledger' and policyname='owner_select') then
  create policy owner_select on public.photo_edit_ledger for select to authenticated using((select auth.uid())=user_id);
 end if;
end $$;

create or replace function public.photo_edit_credit_balance(p_user_id uuid) returns integer language sql stable security invoker set search_path='' as $$
 select coalesce(sum(delta),0)::integer from public.photo_edit_ledger where user_id=p_user_id;
$$;

-- 'included' (inside the allowance counted from p_since), 'credit' (one credit spent), 'limit', 'duplicate' (a retry).
-- Failed edits do not count against the allowance; a failed credit edit is refunded by refund_photo_edit.
create or replace function public.reserve_photo_edit(p_user_id uuid,p_request_id uuid,p_limit integer,p_since timestamptz,p_source uuid,p_style text) returns text language plpgsql security invoker set search_path='' as $$
declare used integer; bal integer;
begin
 perform pg_advisory_xact_lock(hashtextextended('photo-edit:'||p_user_id::text,0));
 if exists(select 1 from public.photo_edits where request_id=p_request_id) then return 'duplicate'; end if;
 select count(*) into used from public.photo_edits where user_id=p_user_id and funded_by='included' and status<>'failed' and created_at>=p_since;
 if p_limit>0 and used<p_limit then
  insert into public.photo_edits(request_id,user_id,source_photo_id,style,funded_by) values(p_request_id,p_user_id,p_source,p_style,'included');return 'included';
 end if;
 select coalesce(sum(delta),0) into bal from public.photo_edit_ledger where user_id=p_user_id;
 if bal>0 then
  insert into public.photo_edits(request_id,user_id,source_photo_id,style,funded_by) values(p_request_id,p_user_id,p_source,p_style,'credit');
  insert into public.photo_edit_ledger(user_id,delta,reason,reference) values(p_user_id,-1,'use','use:'||p_request_id::text);
  return 'credit';
 end if;
 return 'limit';
end $$;

create or replace function public.finish_photo_edit(p_request_id uuid,p_result uuid) returns void language sql security invoker set search_path='' as $$
 update public.photo_edits set status='done',result_photo_id=p_result where request_id=p_request_id and status='pending';
$$;

create or replace function public.refund_photo_edit(p_request_id uuid) returns void language plpgsql security invoker set search_path='' as $$
declare r public.photo_edits;
begin
 update public.photo_edits set status='failed' where request_id=p_request_id and status='pending' returning * into r;
 if found and r.funded_by='credit' then
  insert into public.photo_edit_ledger(user_id,delta,reason,reference) values(r.user_id,1,'refund','refund:'||p_request_id::text) on conflict (reference) do nothing;
 end if;
end $$;

create or replace function public.grant_photo_edit_credits(p_user_id uuid,p_credits integer,p_reference text,p_reason text,p_product text) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if p_credits<=0 or p_credits>10000 then raise exception 'invalid credit amount'; end if;
 insert into public.photo_edit_ledger(user_id,delta,reason,reference,product) values(p_user_id,p_credits,p_reason,p_reference,p_product)
 on conflict (reference) do nothing;
 return found;
end $$;

revoke all on function public.photo_edit_credit_balance(uuid) from public,anon,authenticated;
revoke all on function public.reserve_photo_edit(uuid,uuid,integer,timestamptz,uuid,text) from public,anon,authenticated;
revoke all on function public.finish_photo_edit(uuid,uuid) from public,anon,authenticated;
revoke all on function public.refund_photo_edit(uuid) from public,anon,authenticated;
revoke all on function public.grant_photo_edit_credits(uuid,integer,text,text,text) from public,anon,authenticated;
grant execute on function public.photo_edit_credit_balance(uuid) to service_role;
grant execute on function public.reserve_photo_edit(uuid,uuid,integer,timestamptz,uuid,text) to service_role;
grant execute on function public.finish_photo_edit(uuid,uuid) to service_role;
grant execute on function public.refund_photo_edit(uuid) to service_role;
grant execute on function public.grant_photo_edit_credits(uuid,integer,text,text,text) to service_role;
