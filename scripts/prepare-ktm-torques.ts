import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {candidateSchema,promotionBlockers,stagedClaim} from '../shared/evidence.ts';
const scope={manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US'};
const sourceUrl='https://powaypowersports.com/cdn/shop/files/2025-ktm-450sx-f-factory-owners-manual.pdf?v=679135179847397228';
const hash='a24efdc2f908cc4c3764ee133bcdf6957b6caaebfee4587e847f3b2fe2456a33';
const when='2026-09-13T10:17:00Z';
const claims:any[]=[],mappings:any[]=[];
for(const file of ['ktm-450-2025-chassis-torques.json','ktm-450-2025-engine-torque-facts.json']){
 const data=JSON.parse(readFileSync(`docs/research/parts/${file}`,'utf8'));
 for(const f of data.facts){
  const digest=createHash('sha256').update(`${hash}:${f.id}`).digest('hex');
  const id=`${digest.slice(0,8)}-${digest.slice(8,12)}-4${digest.slice(13,16)}-a${digest.slice(17,20)}-${digest.slice(20,32)}`;
  const conditions=[...f.conditions,'Torque-table fact only; complete installation procedure, tightening order and replacement rules must be checked separately.'];
  const reviewed_content=JSON.stringify({joint:f.joint,thread:f.thread,value:String(f.value),unit:'Nm',conditions});
  const c=candidateSchema.parse({id,applicability:scope,domain:f.domain??'engine',statement:`${f.joint} (${f.thread}): ${f.value}${String(f.value).endsWith('Nm')?'':' Nm'}. ${conditions.join('; ')}`,
   source:{url:sourceUrl,locator:`3240045en, printed p. ${f.printed_page}, ${f.joint} (${f.thread}); scope p. 1 F8475Y5`,document_sha256:hash,retrieved_at:when,document_revision:'3240045en / 2025-01-22',kind:'document',reviewed_content},
   rights:{basis:'factual_extraction',reference:'docs/research/parts/KTM_TORQUE_REVIEW.md; bounded US factual data extraction; no manual redistribution',commercial_use_approved:true,usage_scope:'facts_only_no_source_distribution'},
   review:{reviewer_id:'BAK-MX engineering evidence review',reviewed_at:when,decision:'approved',content_checked:true,scope_checked:true,conflicts_checked:true,approval_reference:'docs/research/parts/KTM_TORQUE_REVIEW.md',approved_document_sha256:hash,approved_applicability:scope},has_conflict:false,conflict_references:[],status:'STAGED'});
  if(promotionBlockers(c).length)throw Error('Review blocked');
  claims.push({...stagedClaim(c),status:'VERIFIED'});
  for(const m of (data.mappings??data.exact_mappings).filter((m:any)=>m.fact_id===f.id))mappings.push({...m,assembly_id:`ktm-450-2025:${m.assembly_id}`,claim_id:id,value:String(f.value),conditions});
 }
}
if(new Set(claims.map(c=>c.id)).size!==claims.length)throw Error('Duplicate fact IDs');
writeFileSync('docs/research/parts/ktm-approved-torques.json',JSON.stringify({schema_version:1,scope,claims,mappings},null,2)+'\n');
const json=JSON.stringify(claims.map(c=>({...c,status:'STAGED'})));
// Exact reviewed IDs only; idempotent insert. Conflicting existing content stops the transaction.
const query=`begin;\ncreate temporary table torque_batch on commit drop as select * from jsonb_populate_recordset(null::public.claims, $facts$${json}$facts$::jsonb);\ninsert into public.claims (id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record) select id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record from torque_batch on conflict (id) do nothing;\ndo $$ begin if exists(select 1 from torque_batch b join public.claims c using(id) where c.statement<>b.statement or c.evidence_record<>b.evidence_record) then raise exception 'Existing fact content mismatch'; end if; end $$;\nupdate public.claims c set status='VERIFIED' from torque_batch b where c.id=b.id;\nselect count(*) as promoted from public.claims c join torque_batch b using(id) where c.status='VERIFIED';\ncommit;`;
writeFileSync('/tmp/ktm-torque-promotion.sql',query);
console.log(JSON.stringify({approved_facts:claims.length,mapped_occurrences:mappings.length}));
