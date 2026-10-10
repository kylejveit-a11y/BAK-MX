import {promotionBlockers} from './evidence.ts';
import {specificationSlotSchema,type PartOccurrence} from './parts-inventory.ts';
import type {Claim} from './types.ts';
type FieldBundle={claims:any[];mappings:any[];labels?:any[]};
/** Apply reviewed component fields only at their exact catalog occurrence. */
export function applyPartFieldMappings(parts:PartOccurrence[],bundle:FieldBundle):Claim[]{
 const claims:Claim[]=[];const claimMap=new Map<string,any>();
 for(const c of bundle.claims){
  if(claimMap.has(c.id))throw Error('Duplicate reviewed field claim');
  if(c.status!=='VERIFIED'||c.has_conflict||promotionBlockers(c.evidence_record).length)throw Error('Unapproved field claim');
  for(const k of ['manufacturer','model','model_year','variant','region'] as const)if(c[k]!==c.evidence_record.applicability[k])throw Error('Field claim scope differs from review');
  if(c.statement!==c.evidence_record.statement||c.source_url!==c.evidence_record.source.url||c.source_locator!==c.evidence_record.source.locator)throw Error('Field claim content differs from review');
  claimMap.set(c.id,c);claims.push(c);
 }
 const key=(p:any)=>JSON.stringify([p.assembly_id,p.callout,p.part_number]);
 const index=new Map<string,PartOccurrence[]>();for(const p of parts)index.set(key(p),[...(index.get(key(p))??[]),p]);
 const resolve=(m:any)=>{const rows=index.get(key(m));if(rows?.length!==1)throw Error('Field mapping must identify one catalog occurrence');return rows[0];};
 for(const l of bundle.labels??[]){
  const p=resolve(l);
  if(l.reviewed!==true||!l.description?.trim()||l.source_url!==p.catalog_evidence.url||p.scope_status!=='CONFIRMED')throw Error('Unreviewed full part label');
  p.description=l.description;
 }
 const seen=new Set<string>();
 for(const m of bundle.mappings){
  const p=resolve(m);if(p.scope_status!=='CONFIRMED'||p.identity_status!=='REVIEWED')throw Error('Part identity and market scope are not confirmed');const c=claimMap.get(m.claim_id);if(!c)throw Error('Missing reviewed field claim');
  for(const k of ['manufacturer','model','model_year','variant','region'] as const)if(c[k]!==p.target[k])throw Error('Field mapping crosses bike scope');
  const identity=key(m)+m.property+':'+(m.field_key??'');if(seen.has(identity))throw Error('Duplicate field mapping');seen.add(identity);
  const f=JSON.parse(c.evidence_record.source.reviewed_content);
  if(f.field_key!==m.field_key||f.coverage!==m.coverage||f.status!==(m.status??'VERIFIED')||f.property!==m.property||f.value!==m.value||f.unit!==m.unit||JSON.stringify(f.conditions)!==JSON.stringify(m.conditions))throw Error('Mapped field differs from reviewed value');
  let slot=p.specifications.find(s=>s.property===m.property&&s.field_key===m.field_key);
  if(!slot&&m.field_key){slot=specificationSlotSchema.parse({property:m.property,field_key:m.field_key,status:'UNKNOWN',value:null,unit:null,conditions:[],claim_id:null,evidence:null,review_note:null});p.specifications.push(slot);}
  if(!slot)throw Error('Missing field requirement');
  if(slot.status!=='UNKNOWN')throw Error('Cannot replace an already reviewed field silently');
  const result=specificationSlotSchema.parse({property:m.property,field_key:m.field_key,coverage:m.coverage,status:m.status??'VERIFIED',value:m.value,unit:m.unit,conditions:m.conditions,claim_id:c.id,evidence:{url:c.source_url,locator:c.source_locator},review_note:m.review_note});
  Object.assign(slot,result);
 }
 return claims;
}
