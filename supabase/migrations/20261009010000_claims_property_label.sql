-- Some reviewed statements name the component but not the quantity ("Front fork: 12 clicks").
-- The reviewed record itself carries the quantity as `property`. Expose it for display, search and
-- AI context without altering any statement or evidence record. Additive only.
create or replace function public.claim_property(e jsonb) returns text language plpgsql immutable set search_path='' as $$
declare raw text := e #>> '{source,reviewed_content}'; value text;
begin
 if raw is null or left(ltrim(raw),1) <> '{' then return null; end if;
 begin value := (raw::jsonb) ->> 'property'; exception when others then return null; end;
 if value is null or value !~ '^[a-z][a-z0-9_]{1,60}$' then return null; end if;
 return value;
end $$;
revoke all on function public.claim_property(jsonb) from public,anon;
grant execute on function public.claim_property(jsonb) to authenticated,service_role;

alter table public.claims add column if not exists property text generated always as (public.claim_property(evidence_record)) stored;
alter table public.claims add column if not exists search_labeled tsvector
 generated always as (to_tsvector('english'::regconfig,
  coalesce(domain,'')||' '||coalesce(replace(public.claim_property(evidence_record),'_',' '),'')||' '||coalesce(statement,'')||' '||coalesce(source_locator,''))) stored;
create index if not exists claims_search_labeled on public.claims using gin(search_labeled);

create or replace function public.search_bike_evidence(
 p_manufacturer text,p_model text,p_model_year integer,p_variant text,p_region text,p_query text,p_limit integer default 12)
returns table(id uuid,manufacturer text,model text,model_year integer,variant text,region text,domain text,property text,statement text,source_url text,source_locator text,status text,has_conflict boolean)
language sql stable security invoker set search_path='' as $$
 with q as (
  select plainto_tsquery('english'::regconfig,left(coalesce(p_query,''),200)) as all_terms,
         nullif(replace(plainto_tsquery('english'::regconfig,left(coalesce(p_query,''),200))::text,' & ',' | '),'')::tsquery as any_term)
 select c.id,c.manufacturer,c.model,c.model_year,c.variant,c.region,c.domain,c.property,c.statement,c.source_url,c.source_locator,c.status,c.has_conflict
 from public.claims c, q
 where c.manufacturer=p_manufacturer and c.model=p_model and c.model_year=p_model_year and c.variant=p_variant and c.region=p_region
  and c.status='VERIFIED' and not c.has_conflict and q.any_term is not null and c.search_labeled @@ q.any_term
 order by (c.search_labeled @@ q.all_terms) desc, ts_rank_cd(c.search_labeled,q.any_term,1|32) desc, c.id
 limit least(greatest(coalesce(p_limit,12),1),40);
$$;
revoke all on function public.search_bike_evidence(text,text,integer,text,text,text,integer) from public,anon;
grant execute on function public.search_bike_evidence(text,text,integer,text,text,text,integer) to authenticated,service_role;
