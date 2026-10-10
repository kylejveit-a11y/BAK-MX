import {z} from 'zod';
import {applicabilitySchema} from './evidence.ts';
import type {Claim} from './types.ts';

const text=z.string().trim().min(1);
const source=z.object({url:z.string().url().refine(v=>v.startsWith('https://')),locator:text}).strict();
export const specificationSlotSchema=z.object({
 field_key:text.optional(),coverage:z.enum(['PARTIAL','COMPLETE']).optional(),
 property:z.enum(['torque','dimensions','material_grade','clearance_wear_limit','installation','replacement_rule','service_interval','other']),
 status:z.enum(['UNKNOWN','VERIFIED','NOT_APPLICABLE','CONFLICTED']),
 value:text.nullable(),unit:text.nullable(),conditions:z.array(text),claim_id:z.string().uuid().nullable(),
 evidence:source.nullable(),review_note:text.nullable()
}).strict().superRefine((v,ctx)=>{
 if(v.status==='VERIFIED'&&(!v.value||!v.claim_id||!v.evidence||!v.review_note))ctx.addIssue({code:'custom',message:'Verified part specifications require an approved claim, source and installation-mapping review'});
 if(v.status==='UNKNOWN'&&(v.value!==null||v.claim_id!==null))ctx.addIssue({code:'custom',message:'Unknown specifications cannot contain guessed values'});
 if(v.status==='NOT_APPLICABLE'&&(!v.review_note||!v.evidence||!v.claim_id))ctx.addIssue({code:'custom',message:'Not applicable requires a documented review, not a missing-data shortcut'});
});
export const partOccurrenceSchema=z.object({
 id:text,target:applicabilitySchema,scope_status:z.enum(['PENDING','CONFIRMED']),assembly_id:text,callout:text,alternative_key:text,
 part_number:text.nullable(),description:text,quantity:z.number().int().positive().nullable(),
 catalog_quantity:z.number().int().nonnegative().nullable().optional(),non_orderable_reference:text.nullable().optional(),
 quantity_evidence:source.nullable(),catalog_evidence:source,
 identity_status:z.enum(['CAPTURED','REVIEWED','CONFLICTED']),
 kind:z.enum(['FASTENER','COMPONENT','ASSEMBLY','CONSUMABLE','UNKNOWN']),
 supersedes_part_number:text.nullable(),supersession_evidence:source.nullable(),
 specifications:z.array(specificationSlotSchema).min(1)
}).strict().superRefine((v,ctx)=>{
 if(v.quantity!==null&&!v.quantity_evidence)ctx.addIssue({code:'custom',message:'Catalog quantity needs evidence; cart defaults are not quantities'});
 if(v.supersedes_part_number&&!v.supersession_evidence)ctx.addIssue({code:'custom',message:'Supersession needs explicit evidence'});
 const keys=v.specifications.map(s=>`${s.property}:${s.field_key??''}`);
 if(new Set(keys).size!==keys.length)ctx.addIssue({code:'custom',message:'Duplicate specification requirement'});
});
export type PartOccurrence=z.infer<typeof partOccurrenceSchema>;
export const assemblySchema=z.object({id:text,target:applicabilitySchema,scope_status:z.enum(['PENDING','CONFIRMED']),name:text,catalog_evidence:source,
 expected_occurrences:z.number().int().nonnegative().nullable(),enumeration_checked:z.boolean(),
 enumeration_review:source.nullable()
}).strict();
export type PartsAssembly=z.infer<typeof assemblySchema>;
export function validatePartInventory(assemblies:PartsAssembly[],parts:PartOccurrence[],claims:Claim[]=[]){
 const seen=new Set<string>();
 const assemblyMap=new Map<string,PartsAssembly>();
 for(const raw of assemblies){const a=assemblySchema.parse(raw);if(assemblyMap.has(a.id))throw Error('Duplicate assembly');assemblyMap.set(a.id,a);}
 for(const raw of parts){const p=partOccurrenceSchema.parse(raw);const a=assemblyMap.get(p.assembly_id);if(!a)throw Error('Part has no inventoried assembly');
  for(const k of ['manufacturer','model','model_year','variant','region'] as const)if(a.target[k]!==p.target[k])throw Error('Cross-target part mapping');
  const key=JSON.stringify([p.assembly_id,p.callout,p.alternative_key]);if(seen.has(key))throw Error('Duplicate diagram occurrence');seen.add(key);
  for(const s of p.specifications.filter(s=>(s.status==='VERIFIED'||s.status==='NOT_APPLICABLE')&&s.coverage!=='PARTIAL')){
   const claim=claims.find(c=>c.id===s.claim_id);
   if(!claim||claim.status!=='VERIFIED'||claim.has_conflict)throw Error('Part specification lacks an approved claim');
   for(const k of ['manufacturer','model','model_year','variant','region'] as const)if(claim[k]!==p.target[k])throw Error('Part specification claim scope mismatch');
   if(claim.source_url!==s.evidence?.url||claim.source_locator!==s.evidence?.locator)throw Error('Part specification provenance mismatch');
  }
 }
 return assemblies.map(a=>{const rows=parts.filter(p=>p.assembly_id===a.id);const complete=a.enumeration_checked&&a.enumeration_review!==null&&a.expected_occurrences!==null&&rows.length===a.expected_occurrences;
  return {assembly_id:a.id,captured_occurrences:rows.length,expected_occurrences:a.expected_occurrences,enumeration_complete:complete,
   open_specifications:rows.reduce((n,p)=>n+p.specifications.filter(s=>s.status==='UNKNOWN'||s.status==='CONFLICTED'||s.coverage==='PARTIAL').length,0),
   specification_coverage_complete:complete&&a.scope_status==='CONFIRMED'&&rows.every(p=>p.scope_status==='CONFIRMED'&&p.identity_status==='REVIEWED'&&p.specifications.every(s=>(s.status==='VERIFIED'||s.status==='NOT_APPLICABLE')&&s.coverage!=='PARTIAL'))};
 });
}
