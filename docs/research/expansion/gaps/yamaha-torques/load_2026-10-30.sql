-- How the 57 payloads were loaded and promoted on 2026-10-30 (MX project only). Pinned commit dd9432ca.
-- 1. Stage (run in two halves, 1..29 and 30..57): each payload is rebuilt in the database and stored only when its
--    SHA-256 equals the hash computed where the PDF was read; existing paths are skipped (ON CONFLICT DO NOTHING).
do $$ declare j jsonb; r jsonb; i int; begin
 for i in 1..57 loop
  j := (extensions.http_get('https://raw.githubusercontent.com/kylejveit-a11y/BAK-MX/dd9432ca096c189013c1be6694a4184ffd0b103b/docs/research/expansion/gaps/yamaha-torques/'||i||'.json')).content::jsonb;
  if j->>'want' is null then raise exception 'bad fetch %', i; end if;
  r := private.stage_manual_rows(j->>'make', j->>'model', (j->>'yr')::int, j->>'url', j->>'sha', j->>'rev', j->>'ref', 'none', 0, j->>'want', '', j->>'delta');
  raise notice '% %', i, r;
 end loop; end $$;
-- Result: 57/57 hash matches, 9,014 rows inserted (8,591 torque rows; 914 of the 1,125 spec rows for YZ250F 2019 and
-- YZ450F 2018-2019, the rest already on file).
-- 2. Promote: evidence gate, statement/url/locator equality, no same-statement VERIFIED row for the bike-year.
--    14 rows independently re-checked on re-downloaded PDFs (BCR-2819U-12, DP1-2819U-10, BR9-28199-10) before this ran.
with cand as (
 select c.id from public.claims c
 where c.status='STAGED' and c.manufacturer='Yamaha' and c.evidence_record#>>'{review,approval_reference}' like '%yamaha-torques%'
  and public.evidence_approved(c.evidence_record, jsonb_build_object('manufacturer',c.manufacturer,'model',c.model,'model_year',c.model_year,'variant',c.variant,'region',c.region))
  and c.statement=c.evidence_record->>'statement' and c.source_url=c.evidence_record#>>'{source,url}' and c.source_locator=c.evidence_record#>>'{source,locator}'
  and not exists (select 1 from public.claims o where o.status='VERIFIED' and o.manufacturer=c.manufacturer and o.model=c.model and o.model_year=c.model_year and o.statement=c.statement))
update public.claims c set status='VERIFIED',
 evidence_record=jsonb_set(c.evidence_record,'{review,approval_reference}', to_jsonb((c.evidence_record#>>'{review,approval_reference}')||' Loaded and promoted 2026-10-30: 171 rows spot-checked on the PDF page by the extraction crew and 14 more independently on re-downloaded manuals.'))
from cand where c.id=cand.id;
-- Result: 9,014 promoted.
