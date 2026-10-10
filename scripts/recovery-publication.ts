import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {promotionBlockers} from '../shared/evidence.ts';
const [bundlePath,outDir]=process.argv.slice(2);
if(!bundlePath||!outDir)throw Error('Explicit bundle and output directory required');
const {claims}=JSON.parse(readFileSync(bundlePath,'utf8'));
if(!claims.length||new Set(claims.map((c:any)=>c.id)).size!==claims.length)throw Error('Empty or duplicate IDs');
for(const c of claims)if(c.status!=='VERIFIED'||promotionBlockers(c.evidence_record).length)throw Error('Unapproved evidence');
mkdirSync(outDir,{recursive:true});
const columns='id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record';
const equal=columns.split(',').filter(k=>k!=='status').map(k=>`c.${k} is distinct from b.${k}`).join(' or ');
for(let n=0;n<claims.length;n+=100){
 const json=JSON.stringify(claims.slice(n,n+100).map((c:any)=>({...c,status:'STAGED'})));
 if(json.includes('$facts$'))throw Error('Unsafe delimiter');
 writeFileSync(join(outDir,`${n/100}.sql`),`begin; create temporary table field_batch on commit drop as select * from jsonb_populate_recordset(null::public.claims,$facts$${json}$facts$::jsonb); insert into public.claims (${columns}) select ${columns} from field_batch on conflict(id) do nothing; do $$ begin if exists(select 1 from field_batch b join public.claims c using(id) where ${equal}) then raise exception 'Existing evidence mismatch'; end if; end $$; select count(*) as staged_batch_rows from field_batch; commit;`);
}
const ids=JSON.stringify(claims.map((c:any)=>c.id));
const expected=`select value::uuid as id from jsonb_array_elements_text($ids$${ids}$ids$::jsonb)`;
writeFileSync(join(outDir,'verify.sql'),`begin; set local role authenticated; with expected as (${expected}) select count(*) as expected_ids,count(c.id) as visible_ids,count(*) filter(where c.status='VERIFIED' and not c.has_conflict) as verified_ids,count(*) filter(where c.id is null) as missing_ids from expected e left join public.claims c using(id); rollback;`);
writeFileSync(join(outDir,'promote.sql'),`begin; create temporary table field_ids on commit drop as ${expected}; do $$ begin if (select count(*) from public.claims c join field_ids i using(id))<>${claims.length} then raise exception 'Incomplete exact-ID batch'; end if; end $$; update public.claims c set status='VERIFIED' from field_ids i where c.id=i.id; select count(*) as verified_fields from public.claims c join field_ids i using(id) where c.status='VERIFIED'; commit;`);
console.log(JSON.stringify({project_ref:'yzvrujffiktfserrgkcb',claims:claims.length,batches:Math.ceil(claims.length/100),outDir}));
