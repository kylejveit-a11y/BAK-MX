-- Exact-bike specification search so Ask BAK retrieves only the evidence a question needs.
-- Additive only: no claim content, status, policy or existing function is changed.
alter table public.claims add column if not exists search tsvector
 generated always as (to_tsvector('english'::regconfig, coalesce(domain,'')||' '||coalesce(statement,'')||' '||coalesce(source_locator,''))) stored;
create index if not exists claims_search on public.claims using gin(search);

create or replace function public.search_bike_claims(
 p_manufacturer text,p_model text,p_model_year integer,p_variant text,p_region text,p_query text,p_limit integer default 12)
returns table(id uuid,manufacturer text,model text,model_year integer,variant text,region text,domain text,statement text,source_url text,source_locator text,status text,has_conflict boolean)
language sql stable security invoker set search_path='' as $$
 with q as (
  select plainto_tsquery('english'::regconfig,left(coalesce(p_query,''),200)) as all_terms,
         nullif(replace(plainto_tsquery('english'::regconfig,left(coalesce(p_query,''),200))::text,' & ',' | '),'')::tsquery as any_term)
 select c.id,c.manufacturer,c.model,c.model_year,c.variant,c.region,c.domain,c.statement,c.source_url,c.source_locator,c.status,c.has_conflict
 from public.claims c, q
 where c.manufacturer=p_manufacturer and c.model=p_model and c.model_year=p_model_year and c.variant=p_variant and c.region=p_region
  and c.status='VERIFIED' and not c.has_conflict and q.any_term is not null and c.search @@ q.any_term
 order by (c.search @@ q.all_terms) desc, ts_rank_cd(c.search,q.any_term,1|32) desc, c.id
 limit least(greatest(coalesce(p_limit,12),1),40);
$$;
revoke all on function public.search_bike_claims(text,text,integer,text,text,text,integer) from public,anon;
grant execute on function public.search_bike_claims(text,text,integer,text,text,text,integer) to authenticated,service_role;
