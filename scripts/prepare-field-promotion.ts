import {readFileSync,writeFileSync} from 'node:fs';
import {promotionBlockers} from '../shared/evidence.ts';
const {claims}=JSON.parse(readFileSync('docs/research/parts/ktm-approved-fields.json','utf8'));
for(const c of claims)if(c.status!=='VERIFIED'||promotionBlockers(c.evidence_record).length)throw Error('Field promotion not approved');
const columns='id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record';
let batches=0;
for(let start=0;start<claims.length;start+=100){
 const rows=claims.slice(start,start+100).map((c:any)=>({...c,status:'STAGED'}));
 const query=`begin; create temporary table field_batch on commit drop as select * from jsonb_populate_recordset(null::public.claims,$facts$${JSON.stringify(rows)}$facts$::jsonb); insert into public.claims (${columns}) select ${columns} from field_batch on conflict(id) do nothing; do $$ begin if exists(select 1 from field_batch b join public.claims c using(id) where c.statement<>b.statement or c.evidence_record<>b.evidence_record) then raise exception 'Existing field evidence mismatch'; end if; end $$; select count(*) as staged_batch_rows from field_batch; commit;`;
 writeFileSync(`/tmp/ktm-fields-${batches++}.sql`,query);
}
const ids=JSON.stringify(claims.map((c:any)=>c.id));
writeFileSync('/tmp/ktm-fields-promote.sql',`begin; create temporary table field_ids on commit drop as select value::uuid as id from jsonb_array_elements_text($ids$${ids}$ids$::jsonb); do $$ begin if (select count(*) from public.claims c join field_ids i using(id))<>${claims.length} then raise exception 'Incomplete staged field batch'; end if; end $$; update public.claims c set status='VERIFIED' from field_ids i where c.id=i.id; select count(*) as verified_fields from public.claims c join field_ids i using(id) where c.status='VERIFIED'; commit;`);
console.log(JSON.stringify({claims:claims.length,batches}));
