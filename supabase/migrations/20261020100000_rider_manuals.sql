-- Riders' own manuals: private to the rider who uploads them, used only in that rider's own chats for that bike.
-- Never shared, never shown to other riders, never used to build BAK content. Rider can delete at any time.
create table if not exists public.rider_manuals(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 bike_id uuid not null references public.bikes(id) on delete cascade,
 file_name text not null default '',
 storage_path text not null,
 bytes bigint,
 pages int,
 status text not null default 'UPLOADING' check (status in ('UPLOADING','READING','READY','FAILED')),
 reason text,
 created_at timestamptz not null default now(),
 ready_at timestamptz
);
create index if not exists rider_manuals_owner on public.rider_manuals(user_id,bike_id);
alter table public.rider_manuals enable row level security;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='rider_manuals' and policyname='rider_manuals_own') then create policy rider_manuals_own on public.rider_manuals for select to authenticated using (user_id=auth.uid()); end if; end $$;

create table if not exists public.rider_manual_pages(
 manual_id uuid not null references public.rider_manuals(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 page int not null,
 body text not null,
 search tsvector generated always as (to_tsvector('english',body)) stored,
 primary key(manual_id,page)
);
create index if not exists rider_manual_pages_search on public.rider_manual_pages using gin(search);
alter table public.rider_manual_pages enable row level security;
-- No client policies: pages are read only by the server for the owner's own chats.

-- Top pages of the rider's own manual for this bike that match the question.
create or replace function public.search_rider_manual(p_user uuid,p_bike uuid,p_query text,p_limit int default 4)
returns table(page int,body text,rank real) language sql stable security definer set search_path=public as $$
 select p.page,p.body,ts_rank(p.search,q) rank
 from rider_manual_pages p join rider_manuals m on m.id=p.manual_id,
      websearch_to_tsquery('english',p_query) q
 where m.user_id=p_user and m.bike_id=p_bike and m.status='READY' and p.user_id=p_user and p.search @@ q
 order by rank desc limit greatest(1,least(p_limit,8));
$$;
revoke all on function public.search_rider_manual(uuid,uuid,text,int) from public,anon,authenticated;

do $$ begin
 if to_regclass('storage.buckets') is not null then
  insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('rider-manuals','rider-manuals',false,209715200,array['application/pdf'])
  on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
 end if;
end $$;
