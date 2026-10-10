-- Research tooling only: stages (never verifies) rows read from an OEM owner's manual for any make.
-- Same guard as 20261009050000: the row set is rebuilt in the database from a difference against a bike already
-- on file and is stored only when its SHA-256 equals the hash computed where the PDF was read.
-- Adds service-schedule rows (domain maintenance, property service_interval).
-- Nothing here is reachable from the public API. See docs/research/expansion/ktm-group/TEXT_LAYER_REVIEW_2026-10-10.md.

create or replace function private.manual_conditions(p_make text, path text, unit text) returns text[]
language sql immutable set search_path to '' as $f$
 select case when p_make='Yamaha' then private.yamaha_spec_conditions(path,unit) else array_remove(array[
 case when path ~ '^Service schedule' then 'From the manufacturer service schedule for the US standard model. "once" marks a one-time interval; the other entries repeat. The same manual says harsh conditions can call for shorter intervals.'
      else 'Applies to the US standard model named; other regions and special editions covered by the same manual can differ. Stock OEM parts only.' end,
 case when path ~ '(damping) / (Comfort|Standard|Sport)$' then 'Counted counterclockwise (softer) from the adjuster turned clockwise to its stop or last click, as the adjustment section of the same manual describes.' end,
 case when path ~ 'Static sag|Riding sag' then 'Static sag is the unloaded-to-standing difference with no rider; riding sag is measured with the rider aboard in full gear, per the procedure in the same manual.' end,
 case when path ~ 'wear limit' then 'Service or wear limit, not a nominal target.' end,
 case when path ~ '^(Carburetor|Carburetor tuning)' then 'Factory carburetor setting for the stock engine and exhaust named in this manual.' end
 ],null) end $f$;

create or replace function private.manual_rows(p_make text, p_model text, p_yr int) returns table(path text, val text, unit text, pdf int, printed text)
language sql stable set search_path to '' as $f$
 select rc->>'joint', rc->>'value', rc->>'unit', (regexp_match(source_locator,'^PDF page (\d+);'))[1]::int, (regexp_match(source_locator,'; printed ([^;]+);'))[1]
 from (select (evidence_record#>>'{source,reviewed_content}')::jsonb rc, source_locator from public.claims
  where manufacturer=p_make and model=p_model and model_year=p_yr and evidence_record#>>'{review,reviewer_id}' like '%text-layer%'
    and (evidence_record#>>'{source,reviewed_content}') like '{%' and source_locator ~ '^PDF page \d+; printed [^;]+; ') s $f$;

-- p_delta lines are those of private.stage_yamaha_specs, plus:
--   @H|a=after one operating hour|b=every 15 operating hours|...   legend for interval values
--   a value of the form @oa,b,c   expands to "once after one operating hour; every 15 operating hours; ..."
-- p_bmodel may be written Make:Model to difference against a bike of another make on the same platform.
create or replace function private.stage_manual_rows(p_make text, p_model text, p_yr int, p_url text, p_sha text, p_rev text, p_ref text, p_bmodel text, p_byr int, p_want text, p_pmap text, p_delta text)
returns jsonb language plpgsql set search_path to '' as $f$
declare v_got text; v_n int; v_np int; v_ins int := 0; v_legend text;
begin
 drop table if exists pg_temp._mr;
 create temp table _mr on commit drop as
 with base as (select b.*, (row_number() over (order by encode(sha256(convert_to(b.path,'UTF8')),'hex'))-1)::text idx from private.manual_rows(case when p_bmodel like '%:%' then split_part(p_bmodel,':',1) else p_make end, case when p_bmodel like '%:%' then split_part(p_bmodel,':',2) else p_bmodel end, p_byr) b),
 pm as (select split_part(x,':',1)::int bpdf, split_part(x,':',2)::int npdf, split_part(x,':',3) nprinted from regexp_split_to_table(nullif(p_pmap,''),',') x),
 d as (select l from regexp_split_to_table(p_delta, E'\n') l where l<>''),
 minus as (select substr(l,2) idx from d where l ~ '^-'),
 plus as (select string_to_array(l,'|') a from d where l ~ '^\+'),
 ov as (select split_part(split_part(l,'|',1),'@',1) idx, nullif(split_part(split_part(l,'|',1),'@',2),'') pdf, nullif(split_part(split_part(l,'|',1),'@',3),'') printed, split_part(l,'|',2) val, split_part(l,'|',3) unit from d where l ~ '^[0-9]')
 select coalesce(ov.pdf::int, pm.npdf) pdf, coalesce(ov.printed, pm.nprinted) printed, b.path, coalesce(ov.val,b.val) val, nullif(case when ov.idx is not null then ov.unit else coalesce(b.unit,'') end,'') unit
 from base b left join ov on ov.idx=b.idx left join pm on pm.bpdf=b.pdf where b.idx not in (select idx from minus)
 union all select a[2]::int, a[3], a[4], a[5], nullif(a[6],'') from plus;
 select l into v_legend from regexp_split_to_table(p_delta, E'\n') l where l ~ '^@H\|' limit 1;
 if v_legend is not null then
  update _mr m set val = (select string_agg(case when length(s.t)=2 then 'once ' else '' end || lg.txt, '; ' order by s.ord)
     from regexp_split_to_table(substr(m.val,2),',') with ordinality as s(t,ord)
     join (select split_part(x,'=',1) k, substr(x, position('=' in x)+1) txt from regexp_split_to_table(substr(v_legend,4),'\|') x) lg on lg.k = right(s.t,1))
  where m.val ~ '^@[a-z,o]+$';
 end if;
 select encode(sha256(convert_to(string_agg(pdf||'|'||printed||'|'||path||'|'||val||'|'||coalesce(unit,''), E'\n' order by encode(sha256(convert_to(path,'UTF8')),'hex')),'UTF8')),'hex'), count(*), count(pdf) into v_got, v_n, v_np from _mr;
 if v_got = p_want and v_n = v_np then
  with e as (select r.*, private.manual_conditions(p_make,r.path,r.unit) conds, md5(lower(p_make)||'|'||p_model||'|'||p_yr||'|textlayer|'||r.path)::uuid id,
    'PDF page '||r.pdf||'; printed '||r.printed||'; '||r.path loc,
    case when r.path ~ '^Service schedule' then 'service_interval' else 'specification' end prop,
    case when r.path ~ '^Service schedule' then 'maintenance' when r.path ~ '^(Fork|Shock absorber)' then 'suspension' else 'service' end dom,
    jsonb_build_object('manufacturer',p_make,'model',p_model,'model_year',p_yr,'variant','standard','region','US') scope from _mr r),
  f as (select e.*, path||': '||val||coalesce(' '||unit,'')||'. '||array_to_string(conds,' ') stmt from e),
  ins as (insert into public.claims(id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record)
   select id,p_make,p_model,p_yr,'standard','US',dom,stmt,p_url,loc,'STAGED',false,
    jsonb_build_object('id',id,'domain',dom,'status','STAGED','statement',stmt,'has_conflict',false,'applicability',scope,'conflict_references','[]'::jsonb,
     'source',jsonb_build_object('url',p_url,'kind','document','locator',loc,'retrieved_at','2026-10-10T00:00:00Z','document_sha256',p_sha,'document_revision',p_rev,
      'reviewed_content',jsonb_build_object('property',prop,'joint',path,'value',val,'unit',unit,'conditions',to_jsonb(conds))::text),
     'rights',jsonb_build_object('basis','factual_extraction','reference','Existing BAK MX US factual-extraction policy; '||split_part(p_ref,';',1),'usage_scope','facts_only_no_source_distribution','commercial_use_approved',true),
     'review',jsonb_build_object('decision','approved','reviewed_at','2026-10-10T00:00:00Z','reviewer_id','BAK MX manufacturer source review (document text-layer extraction)','scope_checked',true,'content_checked',true,'conflicts_checked',true,
      'approval_reference',p_ref,'approved_applicability',scope,'approved_document_sha256',p_sha))
   from f on conflict (id) do nothing returning 1) select count(*) into v_ins from ins;
 end if;
 return jsonb_build_object('inserted',v_ins,'match',v_got=p_want,'n',v_n,'np',v_np,'got',v_got);
end $f$;

-- Shorthand for KTM, Husqvarna and GasGas owner's manuals, which share one document host.
create or replace function private.kg(p_make text, p_model text, p_yr int, p_doc text, p_sha text, p_bmodel text, p_byr int, p_want text, p_pmap text, p_delta text)
returns jsonb language sql set search_path to '' as $f$
 select private.stage_manual_rows(p_make,p_model,p_yr,'https://azwecdnepstoragewebsiteuploads.azureedge.net/'||p_doc||'.pdf',p_sha,
  p_make||' Owner''s Manual '||p_yr||'; Art. no. '||split_part(p_doc,'_',2)||split_part(p_doc,'_',3),
  'docs/research/expansion/ktm-group/TEXT_LAYER_REVIEW_2026-10-10.md; '||p_doc||'; text-layer extraction with glyph positions, hash-guarded; US standard-model rows selected by printed validity; dampers cross-checked against the adjustment section.',
  p_bmodel,p_byr,p_want,p_pmap,
  (select string_agg(case when l ~ '^MINUS=' then replace(substr(l,7),',',E'\n') else regexp_replace(l,'^(\+\|\d+\|[^|]+\|)S/','\1Service schedule / ') end, E'\n') from regexp_split_to_table(p_delta,E'\n') l)) $f$;

revoke all on function private.stage_manual_rows(text,text,int,text,text,text,text,text,int,text,text,text) from public, anon, authenticated;
revoke all on function private.kg(text,text,int,text,text,text,int,text,text,text) from public, anon, authenticated;
revoke all on function private.manual_rows(text,text,int) from public, anon, authenticated;
revoke all on function private.manual_conditions(text,text,text) from public, anon, authenticated;
