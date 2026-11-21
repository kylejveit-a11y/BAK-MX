-- Find a part: search one bike's factory parts list by the rider's words, and the rider's saved parts list.
create or replace function public.part_search(p_catalog uuid, p_patterns text[])
returns table(part_number text, description text, assembly text, quantity_raw text)
language sql stable set search_path to '' as $f$
 select p.part_number, p.description, a.name, p.quantity_raw
 from public.parts p join public.part_assemblies a on a.id=p.assembly_id
 where a.catalog_id=p_catalog and coalesce(p.part_number,'')<>'' and cardinality(p_patterns) between 1 and 6
  and not exists (select 1 from unnest(p_patterns) t(pat) where (p.description||' '||a.name) !~* ('(^|[^a-z0-9])'||t.pat||'($|[^a-z0-9])'))
 order by (select count(*) from unnest(p_patterns) t(pat) where p.description ~* ('(^|[^a-z0-9])'||t.pat||'($|[^a-z0-9])')) desc, a.position, p.position
 limit 40
$f$;
revoke all on function public.part_search(uuid,text[]) from public,anon;
grant execute on function public.part_search(uuid,text[]) to authenticated,service_role;

create table if not exists public.saved_parts(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 bike_id uuid not null references public.bikes(id) on delete cascade,
 kind text not null check (kind in ('factory','aftermarket')),
 brand text not null default '' check (length(brand)<=80),
 name text not null check (length(name) between 1 and 200),
 part_number text not null default '' check (length(part_number)<=60),
 created_at timestamptz not null default now(),
 unique (user_id,bike_id,kind,brand,name,part_number));
alter table public.saved_parts enable row level security;
revoke all on public.saved_parts from anon;
create policy saved_parts_read on public.saved_parts for select to authenticated using((select auth.uid())=user_id);
create policy saved_parts_insert on public.saved_parts for insert to authenticated with check((select auth.uid())=user_id);
create policy saved_parts_delete on public.saved_parts for delete to authenticated using((select auth.uid())=user_id);
