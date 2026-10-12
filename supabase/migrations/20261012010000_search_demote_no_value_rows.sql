-- Catalog rows that record only that a part has no published torque matched every torque question and crowded real values
-- out of the first results (a rider asking for the front axle or swingarm pivot torque was told it was not on file).
-- They stay searchable but rank after rows that carry a value.
CREATE OR REPLACE FUNCTION public.search_bike_evidence(p_manufacturer text, p_model text, p_model_year integer, p_variant text, p_region text, p_query text, p_limit integer DEFAULT 12)
 RETURNS TABLE(id uuid, manufacturer text, model text, model_year integer, variant text, region text, domain text, property text, statement text, source_url text, source_locator text, status text, has_conflict boolean)
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
 with q as (
  select plainto_tsquery('english'::regconfig,left(coalesce(p_query,''),200)) as all_terms,
         nullif(replace(plainto_tsquery('english'::regconfig,left(coalesce(p_query,''),200))::text,' & ',' | '),'')::tsquery as any_term)
 select c.id,c.manufacturer,c.model,c.model_year,c.variant,c.region,c.domain,c.property,c.statement,c.source_url,c.source_locator,c.status,c.has_conflict
 from public.claims c, q
 where c.manufacturer=p_manufacturer and c.model=p_model and c.model_year=p_model_year and c.variant=p_variant and c.region=p_region
  and c.status='VERIFIED' and not c.has_conflict and q.any_term is not null and c.search_labeled @@ q.any_term
 order by (c.search_labeled @@ q.all_terms) desc, (c.statement like 'Engineering applicability review%') asc, ts_rank_cd(c.search_labeled,q.any_term,1|32) desc, c.id
 limit least(greatest(coalesce(p_limit,12),1),40);
$function$;
