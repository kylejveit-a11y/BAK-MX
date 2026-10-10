import {promotionBlockers} from './evidence.ts';
import type {PartOccurrence} from './parts-inventory.ts';
import type {Claim} from './types.ts';
export function applyTorqueMappings(parts:PartOccurrence[], bundle:{claims:any[];mappings:any[]}) {
 const claims:Claim[]=[];
 for(const c of bundle.claims){
  if(c.status!=='VERIFIED'||promotionBlockers(c.evidence_record).length)throw Error('Torque evidence has not passed review');
  for(const k of ['manufacturer','model','model_year','variant','region'] as const)if(c[k]!==c.evidence_record.applicability[k])throw Error('Claim scope differs from reviewed evidence');
  if(c.statement!==c.evidence_record.statement||c.source_url!==c.evidence_record.source.url||c.source_locator!==c.evidence_record.source.locator)throw Error('Torque claim content differs from review');
  claims.push(c);
 }
 const seen=new Set<string>();
 for(const m of bundle.mappings){
  const matches=parts.filter(p=>p.assembly_id===m.assembly_id&&p.callout===m.callout&&p.part_number===m.part_number);
  if(matches.length!==1)throw Error('Torque mapping must resolve exactly one occurrence');
  const p=matches[0];if(p.scope_status!=='CONFIRMED'||p.identity_status!=='REVIEWED')throw Error('Part identity and market scope are not confirmed');
  if(!m.reviewed_catalog_description||m.reviewed_catalog_description!==p.description)throw Error('Torque mapping full catalog label is missing or stale');
  if(seen.has(p.id))throw Error('Duplicate torque mapping');seen.add(p.id);
  const c=bundle.claims.find(c=>c.id===m.claim_id);if(!c)throw Error('Missing mapping claim');
  for(const k of ['manufacturer','model','model_year','variant','region'] as const)if(c[k]!==p.target[k])throw Error('Torque mapping crosses model scope');
  const fact=JSON.parse(c.evidence_record.source.reviewed_content);
  if(JSON.stringify(m.value)!==JSON.stringify(fact.value)||JSON.stringify(m.conditions)!==JSON.stringify(fact.conditions))throw Error('Torque value or conditions differ from reviewed evidence');
  const slot=p.specifications.find(s=>s.property==='torque');if(!slot)throw Error('Missing torque requirement');
  if(slot.status==='NOT_APPLICABLE')throw Error('Cannot torque a reviewed non-threaded component');
  Object.assign(slot,{status:'VERIFIED',value:typeof m.value==='string'?m.value:JSON.stringify(m.value),unit:fact.unit===undefined?'Nm':fact.unit,conditions:m.conditions,claim_id:c.id,evidence:{url:c.source_url,locator:c.source_locator},review_note:m.review_note});
 }
 return claims;
}
