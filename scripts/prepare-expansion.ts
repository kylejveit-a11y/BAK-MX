// Explicit reviewed source manifest. This script cannot discover or approve new sources.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {candidateSchema,promotionBlockers,stagedClaim} from '../shared/evidence.ts';
import {expansionNamespace} from '../shared/expansion-inventory.ts';
const root='docs/research/expansion/';
// Explicit paths allow a recovery wave to be prepared without replacing a frozen bundle.
const manifestPath=process.argv[2]??root+'import-manifest.json';
const outputPath=process.argv[3]??root+'approved-bundle.json';
if(process.argv[2]&&!process.argv[3])throw Error('A custom manifest requires an explicit output path');
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const hashes=new Map<string,string>();
const claims:any[]=[];const catalogs:any[]=[];const excluded:any[]=[];const mappings:any[]=[];
const factClaims=new Map<string,any>();
for(const entry of manifest.sources){
 const d=JSON.parse(readFileSync(root+entry.file,'utf8'));
 const reviewedAt=entry.reviewed_at??manifest.reviewed_at;
 if(d.target?.manufacturer==='KTM')throw Error('Expansion cannot replace KTM');
 if(entry.catalog)catalogs.push({file:entry.file,data:d});
 if(!entry.facts)continue;
 const approval=readFileSync(root+entry.review_file,'utf8');if(!approval.trim())throw Error('Missing source review');
 for(const f of d.facts??[]){
  if(f.review_status!=='APPROVED'){excluded.push({file:entry.file,id:f.id,status:f.review_status});continue;}
  if(d.scope_confirmed!==true||!f.review_note||!Array.isArray(f.conditions))throw Error(`Incomplete review: ${f.id}`);
  if(!(typeof f.value==='number'&&Number.isFinite(f.value))&&!(typeof f.value==='string'&&f.value.trim())&&!(Array.isArray(f.value)&&f.value.length>1&&f.value.every((v:unknown)=>typeof v==='number'&&Number.isFinite(v))&&f.conditions.some((c:string)=>/stage|range/i.test(c))))throw Error(`Missing reviewed value: ${f.id}`);
  const local=entry.documents[f.document_sha256];if(!local)throw Error(`Unbound document: ${f.id}`);
  if(!hashes.has(local))hashes.set(local,createHash('sha256').update(readFileSync(local)).digest('hex'));
  if(hashes.get(local)!==f.document_sha256)throw Error(`Document changed: ${f.id}`);
  const field=entry.fields?{property:f.property,field_key:'catalog_explicit_notation',coverage:'PARTIAL',status:'VERIFIED',value:String(f.value),unit:f.unit,conditions:f.conditions}:null;
  const content=JSON.stringify(field??{property:f.property,joint:f.joint,value:f.value,unit:f.unit,conditions:f.conditions});
  const digest=createHash('sha256').update(JSON.stringify([d.target,f.id,f.document_sha256,content])).digest('hex');
  const id=`${digest.slice(0,8)}-${digest.slice(8,12)}-5${digest.slice(13,16)}-a${digest.slice(17,20)}-${digest.slice(20,32)}`;
  const candidate=candidateSchema.parse({id,applicability:d.target,domain:'service',statement:`${f.joint}: ${typeof f.value==='string'?f.value:JSON.stringify(f.value)}${f.unit?' '+f.unit:''}. ${f.conditions.join(' ')}`,
   source:{url:f.source_url,locator:f.locator,document_sha256:f.document_sha256,retrieved_at:reviewedAt,document_revision:f.document_revision,kind:'document',reviewed_content:content},
   rights:{basis:'factual_extraction',reference:'Existing BAK MX US factual-extraction policy; '+root+entry.review_file,commercial_use_approved:true,usage_scope:'facts_only_no_source_distribution'},
   review:{reviewer_id:f.reviewer_id??'BAK MX manufacturer source review',reviewed_at:reviewedAt,decision:'approved',content_checked:true,scope_checked:true,conflicts_checked:true,approval_reference:root+entry.review_file+'; '+f.id+'; '+f.review_note,approved_document_sha256:f.document_sha256,approved_applicability:d.target},has_conflict:false,conflict_references:[],status:'STAGED'});
  if(promotionBlockers(candidate).length)throw Error(`Blocked claim ${f.id}`);
  const claim={...stagedClaim(candidate),status:'VERIFIED'};claims.push(claim);factClaims.set(expansionNamespace(d.target)+':'+f.id,claim);
  if(field)for(const m of d.mappings.filter((m:any)=>m.fact_id===f.id&&m.review_status==='APPROVED')){
   const rows=d.parts.filter((p:any)=>p.assembly_id===m.assembly_id&&String(p.callout)===String(m.callout)&&p.part_number===m.part_number);
   if(rows.length!==1||rows[0].source_url!==m.catalog_source_url)throw Error('Unbound catalog field');
   mappings.push({...field,assembly_id:expansionNamespace(d.target)+':'+m.assembly_id,callout:String(m.callout),part_number:m.part_number,claim_id:id,review_note:m.review_note});
  }
 }
}
if(new Set(claims.map(c=>c.id)).size!==claims.length)throw Error('Duplicate expansion claim');
const torque_mappings:any[]=[];
for(const file of manifest.torque_mapping_files??[]){
 const d=JSON.parse(readFileSync(root+file,'utf8'));
 for(const m of d.mappings){
  if(m.review_status!=='APPROVED')continue;
  const c=factClaims.get(expansionNamespace(d.target)+':'+m.fact_id);if(!c)throw Error('Missing reviewed torque mapping fact');
  const f=JSON.parse(c.evidence_record.source.reviewed_content);if(f.property!=='torque')throw Error('Torque mapping requires a torque fact');
  torque_mappings.push({...m,assembly_id:expansionNamespace(d.target)+':'+m.assembly_id,callout:String(m.callout),claim_id:c.id,value:f.value,conditions:f.conditions});
 }
}
writeFileSync(outputPath,JSON.stringify({claims,catalogs,excluded,mappings,torque_mappings},null,2)+'\n');
console.log(JSON.stringify({approved_facts:claims.length,catalogs:catalogs.length,excluded:excluded.length}));
