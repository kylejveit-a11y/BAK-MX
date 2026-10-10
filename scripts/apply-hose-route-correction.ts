import {createHash} from 'node:crypto';

export const hoseCorrectionSha256='766d4432afc8dd62448b0268df2262307873a4d4afb44e9ee260ae3f7d385f6b';
const hash=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');

// This narrowly reviewed removal preserves the frozen original and its saved-run identity.
export function applyHoseRouteCorrection(p:any,originalBytes:Buffer,correctionBytes:Buffer){
 if(hash(correctionBytes)!==hoseCorrectionSha256)throw Error('Hose routing correction review changed');
 const c=JSON.parse(correctionBytes.toString('utf8'));
 if(p.id!==c.procedure_id)return;
 const step=p.steps.find((s:any)=>s.id===c.step_id);
 if(c.status!=='APPROVED'||c.correction_kind!=='UNSUPPORTED_HOSE_MARK_QUALIFIER_ONLY'||hash(originalBytes)!==c.artifact_sha256||p.source.document_sha256!==c.document_sha256||p.source.source_url!==c.source_url||!step||step.instruction!==c.old_instruction||!step.source_pdf_pages.includes(75)||c.new_instruction!==c.old_instruction.replace('with paint mark UP','following the illustrated route'))throw Error('Hose routing correction does not match reviewed original');
 step.instruction=c.new_instruction;
 p.source.hose_route_correction_sha256=hoseCorrectionSha256;
}
