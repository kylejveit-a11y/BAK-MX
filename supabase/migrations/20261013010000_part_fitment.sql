-- Cross-compatibility groundwork: which catalogs list the same manufacturer part number.
-- Reads only complete catalogs. It reports where a number is printed; it does not claim two assemblies are interchangeable.
create or replace function public.part_fitment(p_part_number text)
returns table(manufacturer text, model text, years integer[], regions text[], assemblies text[])
language sql stable set search_path to '' as $f$
 select c.manufacturer, c.model,
  array_agg(distinct c.model_year order by c.model_year),
  array_agg(distinct c.region order by c.region),
  (array_agg(distinct a.name order by a.name))[1:4]
 from public.parts p
 join public.part_assemblies a on a.id=p.assembly_id
 join public.part_catalogs c on c.id=a.catalog_id
 where p.part_number=p_part_number and c.complete and length(p_part_number) between 4 and 40
 group by c.manufacturer, c.model
 order by c.manufacturer, c.model
$f$;
revoke all on function public.part_fitment(text) from public,anon;
grant execute on function public.part_fitment(text) to authenticated,service_role;
