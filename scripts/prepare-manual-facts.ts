// Explicit reviewed batch preparation. Never imported by runtime; does not write a database.
import {readFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {candidateSchema,promotionBlockers,stagedClaim} from '../shared/evidence.ts';

const names=['yamaha-service-pass','japan-service-pass','honda-latest-handbook-extracts'];
const now=new Date().toISOString();
const result=[];
for(const name of names){
 const d=JSON.parse(readFileSync(`docs/research/${name}.json`,'utf8'));
 for(const c of d.candidates){
  const s=d.sources.find((s:any)=>s.id===c.source_id);
  const path=s.local_inspection_copy??`../manual-inspection/${s.id}-handbook.pdf`;
  const hash=createHash('sha256').update(readFileSync(path)).digest('hex');
  if(hash!==s.sha256)throw Error(`Source hash changed: ${s.id}`);
  const a={manufacturer:c.applicability.make,model:c.applicability.model,model_year:c.applicability.model_year,variant:c.applicability.variant,region:c.applicability.region};
  const conditions=Array.isArray(c.conditions)?c.conditions.join(' '):c.conditions;
  const statement=[c.statement,conditions,c.scope_notes].filter(Boolean).join(' ');
  const reviewFile=name==='yamaha-service-pass'?'yamaha-service-review.md':name==='japan-service-pass'?'honda-older-review.md':'honda-latest-review.md';
  if(!readFileSync(`docs/research/${reviewFile}`,'utf8').includes('APPROVED'))throw Error(`Review not finalized: ${reviewFile}`);
  const candidate=candidateSchema.parse({id:randomUUID(),applicability:a,domain:/oil|viscosit/i.test(c.id)?'lubrication':/coolant|radiator/i.test(c.id)?'cooling':/spark/i.test(c.id)?'ignition':/valve/i.test(c.id)?'engine_mechanical':'service',statement,
   source:{url:s.url,locator:c.locator,document_sha256:hash,retrieved_at:now,document_revision:s.publication??s.title,kind:'document',reviewed_content:c.statement},
   rights:{basis:'factual_extraction',reference:'docs/research/HONDA_APPROVAL.md; individual US technical facts only, no source distribution',commercial_use_approved:true,usage_scope:'facts_only_no_source_distribution'},
   review:{reviewer_id:'BAK MX assistant technical review; independent acquisition/review workstreams',reviewed_at:now,decision:'approved',content_checked:true,scope_checked:true,conflicts_checked:true,approval_reference:`docs/research/${reviewFile}; original candidate ${c.id}`,approved_document_sha256:hash,approved_applicability:a},
   has_conflict:false,conflict_references:[],status:'STAGED'});
  if(promotionBlockers(candidate).length)throw Error('Promotion gate failed');
  result.push(stagedClaim(candidate));
 }
}
if(result.length!==100)throw Error('Expected exactly 100 reviewed facts');
process.stdout.write(JSON.stringify(result,null,2)+'\n');
