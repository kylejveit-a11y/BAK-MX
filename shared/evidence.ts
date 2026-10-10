import { z } from 'zod';
import type { Claim } from './types.ts';

const text = z.string().trim().min(1).max(4000);
const exact = z.string().trim().min(1).max(100).refine(v => !/^(unknown|all|any|\*|n\/a)$/i.test(v), 'Exact applicability is required');
const sha256 = z.string().regex(/^[a-f0-9]{64}$/, 'Expected lowercase SHA-256');
const date = z.string().datetime({ offset: true });
const models: Record<string,string[]> = { Yamaha:['YZ250F','YZ450F'], Honda:['CRF250R','CRF450R'], Kawasaki:['KX250','KX450'], KTM:['250 SX-F','450 SX-F'], Husqvarna:['FC 250','FC 450'], GasGas:['MC 250F','MC 450F'] };
export const applicabilitySchema = z.object({manufacturer:exact,model:exact,model_year:z.number().int().min(2022).max(2026),variant:exact,region:exact}).strict().refine(v=>models[v.manufacturer]?.includes(v.model), 'Unsupported or mismatched model family');
export const engineeringRelationSchema = z.object({system:text,component:text,physical_state:text,failure_mechanism:text,observable_symptom:text,measurement:text,verification_test:text,corrective_action:text}).strict();
export type EngineeringRelation = z.infer<typeof engineeringRelationSchema>;
const sourceUrl = z.string().url().max(2000).refine(v=>{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;},'Use an HTTPS source without credentials');
export const candidateSchema = z.object({
 id:z.string().uuid(), applicability:applicabilitySchema, domain:exact, statement:text,
 source:z.object({url:sourceUrl,locator:text,document_sha256:sha256,retrieved_at:date,document_revision:text,kind:z.enum(['document','measurement','landing_page']),reviewed_content:text}).strict(),
 rights:z.object({basis:z.enum(['permission','license','public_domain','internal_measurement','factual_extraction','unresolved']),reference:text,commercial_use_approved:z.boolean(),usage_scope:z.literal('facts_only_no_source_distribution').optional()}).strict(),
 review:z.object({reviewer_id:text,reviewed_at:date,decision:z.enum(['pending','approved','rejected']),content_checked:z.boolean(),scope_checked:z.boolean(),conflicts_checked:z.boolean(),approval_reference:text,approved_document_sha256:sha256,approved_applicability:applicabilitySchema}).strict(),
 has_conflict:z.boolean(), conflict_references:z.array(text).max(100), relation:engineeringRelationSchema.optional(),
 status:z.literal('STAGED').default('STAGED')
}).strict().superRefine((v,ctx)=>{
 if(v.rights.basis==='factual_extraction'&&(v.rights.usage_scope!=='facts_only_no_source_distribution'||v.applicability.region!=='US'||v.source.kind!=='document'))ctx.addIssue({code:'custom',path:['rights'],message:'Factual extraction requires reviewed US document facts and explicit no-source-distribution scope'});
 if(v.has_conflict !== (v.conflict_references.length>0))ctx.addIssue({code:'custom',path:['has_conflict'],message:'Conflict flag and references must agree'});
 if(Date.parse(v.review.reviewed_at)<Date.parse(v.source.retrieved_at))ctx.addIssue({code:'custom',path:['review','reviewed_at'],message:'Review cannot predate retrieval'});
});
export type EvidenceCandidate = z.infer<typeof candidateSchema>;
export function promotionBlockers(input: unknown): string[] {
 const c=candidateSchema.parse(input);const blockers:string[]=[];
 if(c.has_conflict)blockers.push('Unresolved source conflict');
 if(c.source.kind==='landing_page')blockers.push('Landing page cannot substantiate a technical claim');
 if(c.rights.basis==='unresolved'||!c.rights.commercial_use_approved)blockers.push('Commercial-use rights unresolved');
 if(c.review.decision!=='approved'||!c.review.content_checked||!c.review.scope_checked||!c.review.conflicts_checked)blockers.push('Explicit content, applicability and conflict review required');
 if(c.review.approved_document_sha256!==c.source.document_sha256)blockers.push('Review is for a different document hash');
 for(const key of ['manufacturer','model','model_year','variant','region'] as const){if(c.applicability[key]!==c.review.approved_applicability[key])blockers.push(`Review scope mismatch: ${key}`);}
 return blockers;
}
export function stagedClaim(input: unknown): Claim & {evidence_record:EvidenceCandidate} {
 const c=candidateSchema.parse(input);
 return {id:c.id,...c.applicability,domain:c.domain,statement:c.statement,source_url:c.source.url,source_locator:c.source.locator,status:'STAGED',has_conflict:c.has_conflict,evidence_record:c};
}
// Only a BAK MX hosted project can be targeted. Custom/local URLs intentionally unsupported.
export function validateImportTarget(rawUrl:string|undefined, expectedRef:string|undefined):string {
 if(!rawUrl||!expectedRef||!/^[a-z]{20}$/.test(expectedRef))throw new Error('Set SUPABASE_URL and BAK_MX_SUPABASE_PROJECT_REF');
 if(expectedRef==='yxvwepgbahkdlkpedndj')throw new Error('EMOTO project is prohibited');
 const u=new URL(rawUrl);
 if(u.origin!==`https://${expectedRef}.supabase.co`||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw new Error('BAK MX Supabase target mismatch');
 return u.origin;
}
