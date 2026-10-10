-- Research tooling only: stages (never verifies) Yamaha specification-table rows read from an OEM manual.
-- A row set is accepted only when the reconstructed table hashes to the value computed where the PDF was read,
-- so a transcription slip between the reader and the database cannot be stored.
-- Nothing here is reachable from the public API. See docs/research/expansion/yamaha/TEXT_LAYER_REVIEW_2026-10-09.md.

create or replace function private.yamaha_spec_conditions(path text, unit text) returns text[]
language sql immutable set search_path to '' as $f$
 select array_remove(array[
 'Exact US standard-model OEM configuration; measurement/assembly procedure and its prerequisites remain required.',
 case when path ~* 'limit' then 'Service or wear limit, not a nominal manufacturing target; measure using the OEM procedure.' end,
 case when path ~ '^(Front|Rear) (suspension|fork|shock)' then 'Stock OEM suspension only; do not apply to aftermarket/revalved components or tune around an unresolved fault.' end,
 case when path ~ 'start position' then 'Counted in '||coalesce(unit,'step')||'s toward softer from the start position, which the adjustment section of the same manual defines as the adjuster fully turned in the harder direction; do not force the adjuster past its range.' end,
 case when path ~ 'start position' and path ~ '^Front' then 'Factory click and turn counts can vary between units; check the actual range on the bike. Adjust both fork legs equally.' end,
 case when path ~ 'start position' and path !~ '^Front' then 'Factory click and turn counts can vary between units; check the actual range on the bike.' end,
 case when path ~ 'Spring preload / Adjustment value' then 'Preload is spring compression from measured free length, not rider sag.' end,
 case when path ~ 'sunken length' then 'Yamaha calls this the sunken length: rear axle to rear fender mark measured with the rear wheel off the ground, minus the same measurement with the rider seated. Set it before changing damping.' end,
 case when path ~ 'STD spring rate' then 'Spring fitted as standard; optional softer and stiffer rates are listed in the same table.' end,
 case when path ~ 'Engine oil quantity' then 'Retain the stated oil-change/filter-removal/disassembled fill condition; verify level by OEM procedure.' end,
 case when path ~ 'Valve clearance' then 'Measure valve clearance with engine cold.' end,
 case when path ~ 'Tire air pressure' then 'Measure cold tire pressure on the specified stock tires.' end,
 case when path ~ 'Drive chain slack' then 'Drive chain slack is specified with motorcycle on maintenance stand; preserve OEM measurement location.' end,
 case when path ~ 'Front suspension / Quantity' then 'This is the specification-table quantity for the named fork leg; do not confuse total leg oil with outer-chamber adjustment volume. Consult fill/bleed procedure.' end,
 case when path ~ '^Carburetor' and path !~ 'free play' then 'Factory standard carburetor setting for the stock engine, exhaust and fuel named in this manual.' end,
 case when path ~ 'Premix ratio' then 'Printed as a single number in the specification table; the fuel section of the same manual says to mix the named oil with the gasoline at this ratio. Confirm against the manual before mixing.' end,
 case when path ~ '^Transmission oil / Quantity' then 'Retain the stated periodic-change or disassembled fill condition; verify level by OEM procedure.' end
 ],null) $f$;

create or replace function private.yamaha_spec_rows(p_model text, p_yr int) returns table(path text, val text, unit text, pdf int, printed text)
language sql stable set search_path to '' as $f$
 select rc->>'joint', rc->>'value', rc->>'unit', (regexp_match(source_locator,'^PDF page (\d+);'))[1]::int, (regexp_match(source_locator,'; printed ([^;]+);'))[1]
 from (select (evidence_record#>>'{source,reviewed_content}')::jsonb rc, source_locator from public.claims
  where manufacturer='Yamaha' and model=p_model and model_year=p_yr and evidence_record#>>'{review,reviewer_id}' like '%text-layer%') s $f$;

create or replace function private.yamaha_spec_hash(p_model text, p_yr int) returns text
language sql stable set search_path to '' as $f$
 select encode(sha256(convert_to(string_agg(pdf||'|'||printed||'|'||path||'|'||val||'|'||coalesce(unit,''), E'\n' order by encode(sha256(convert_to(path,'UTF8')),'hex')),'UTF8')),'hex') from private.yamaha_spec_rows(p_model,p_yr) $f$;

-- p_delta lines, relative to an already-loaded base bike whose rows are numbered by sha256(path) order:
--   -N                      base row N is absent from this manual
--   N|value|unit            base row N, same mapped page, different value
--   N@pdf@printed|value|unit  base row N on a different page
--   +|pdf|printed|path|value|unit   row not in the base
-- p_pmap maps base PDF pages to this manual's pages: basePdf:newPdf:printed, comma separated.
-- One call per statement: the working table is transaction-scoped.
create or replace function private.stage_yamaha_specs(p_model text, p_yr int, p_code text, p_sha text, p_rev text, p_bmodel text, p_byr int, p_want text, p_pmap text, p_delta text)
returns jsonb language plpgsql set search_path to '' as $f$
declare v_got text; v_n int; v_np int; v_ins int := 0;
begin
 create temp table _r on commit drop as
 with base as (select b.*, (row_number() over (order by encode(sha256(convert_to(b.path,'UTF8')),'hex'))-1)::text idx from private.yamaha_spec_rows(p_bmodel,p_byr) b),
 pm as (select split_part(x,':',1)::int bpdf, split_part(x,':',2)::int npdf, split_part(x,':',3) nprinted from regexp_split_to_table(nullif(p_pmap,''),',') x),
 d as (select l from regexp_split_to_table(p_delta, E'\n') l where l<>''),
 minus as (select substr(l,2) idx from d where l ~ '^-'),
 plus as (select string_to_array(l,'|') a from d where l ~ '^\+'),
 ov as (select split_part(split_part(l,'|',1),'@',1) idx, nullif(split_part(split_part(l,'|',1),'@',2),'') pdf, nullif(split_part(split_part(l,'|',1),'@',3),'') printed, split_part(l,'|',2) val, split_part(l,'|',3) unit from d where l ~ '^[0-9]')
 select coalesce(ov.pdf::int, pm.npdf) pdf, coalesce(ov.printed, pm.nprinted) printed, b.path, coalesce(ov.val,b.val) val, nullif(case when ov.idx is not null then ov.unit else coalesce(b.unit,'') end,'') unit
 from base b left join ov on ov.idx=b.idx left join pm on pm.bpdf=b.pdf where b.idx not in (select idx from minus)
 union all select a[2]::int, a[3], a[4], a[5], nullif(a[6],'') from plus;
 select encode(sha256(convert_to(string_agg(pdf||'|'||printed||'|'||path||'|'||val||'|'||coalesce(unit,''), E'\n' order by encode(sha256(convert_to(path,'UTF8')),'hex')),'UTF8')),'hex'), count(*), count(pdf) into v_got, v_n, v_np from _r;
 if v_got = p_want and v_n = v_np then
  with e as (select r.*, private.yamaha_spec_conditions(r.path,r.unit) conds, md5('yamaha|'||p_model||'|'||p_yr||'|textlayer|'||r.path)::uuid id,
    'https://library.ymcapps.net/library/om/contents/pdf/10/'||p_code||'_02.pdf' url, 'PDF page '||r.pdf||'; printed '||r.printed||'; '||r.path loc,
    jsonb_build_object('manufacturer','Yamaha','model',p_model,'model_year',p_yr,'variant','standard','region','US') scope from _r r),
  f as (select e.*, path||': '||val||coalesce(' '||unit,'')||'. '||array_to_string(conds,' ') stmt from e),
  ins as (insert into public.claims(id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record)
   select id,'Yamaha',p_model,p_yr,'standard','US','service',stmt,url,loc,'STAGED',false,
    jsonb_build_object('id',id,'domain','service','status','STAGED','statement',stmt,'has_conflict',false,'applicability',scope,'conflict_references','[]'::jsonb,
     'source',jsonb_build_object('url',url,'kind','document','locator',loc,'retrieved_at','2026-10-09T00:00:00Z','document_sha256',p_sha,'document_revision',p_rev,
      'reviewed_content',jsonb_build_object('property','specification','joint',path,'value',case when val ~ '^[0-9]+(\.[0-9]+)?$' then to_jsonb(val::numeric) else to_jsonb(val) end,'unit',unit,'conditions',to_jsonb(conds))::text),
     'rights',jsonb_build_object('basis','factual_extraction','reference','Existing BAK MX US factual-extraction policy; docs/research/expansion/yamaha/REVIEW.md','usage_scope','facts_only_no_source_distribution','commercial_use_approved',true),
     'review',jsonb_build_object('decision','approved','reviewed_at','2026-10-09T00:00:00Z','reviewer_id','BAK MX manufacturer source review (document text-layer extraction)','scope_checked',true,'content_checked',true,'conflicts_checked',true,
      'approval_reference','docs/research/expansion/yamaha/TEXT_LAYER_REVIEW_2026-10-09.md; '||p_code||'; OEM PDF fetched from the manufacturer library and hashed; specification table read from the document text layer; extraction method checked row-for-row against the visually reviewed 2026 YZ450F table; damping values cross-checked against the adjustment section of the same document; no same-scope value on file to conflict.',
      'approved_applicability',scope,'approved_document_sha256',p_sha))
   from f on conflict (id) do nothing returning 1) select count(*) into v_ins from ins;
 end if;
 return jsonb_build_object('inserted',v_ins,'match',v_got=p_want,'n',v_n,'np',v_np,'got',v_got);
end $f$;

revoke all on function private.stage_yamaha_specs(text,int,text,text,text,text,int,text,text,text) from public, anon, authenticated;
revoke all on function private.yamaha_spec_rows(text,int) from public, anon, authenticated;
revoke all on function private.yamaha_spec_hash(text,int) from public, anon, authenticated;
revoke all on function private.yamaha_spec_conditions(text,text) from public, anon, authenticated;
