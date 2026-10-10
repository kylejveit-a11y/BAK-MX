import type {Bike} from './types.ts';
import {buildIdentity,sameBikeScope} from './bike-identity.ts';
import {procedureLibrary} from './procedure-library.ts';
export type ProcedureBranch={id:string;label:string;next_step:string;condition:string};
export type ReviewedProcedure={id:string;content_sha256:string;component:string;affected_components?:string[];entry_state?:string[];exit_state?:string[];supplemental_sources?:{url:string;sha256:string;attribution:string;scope:string}[];target:{manufacturer:string;model:string;model_year:number;variant:string;region:string};title:string;completeness:string;source:{source_url:string;document_sha256:string;document_revision:string;pdf_pages:number[];printed_pages:string[];review_status:string};excluded:string[];required_tools:{name:string;size:string|null}[];required_parts:{name:string;purpose:string}[];prerequisites:string[];critical_stop_conditions:string[];steps:{id:string;title:string;instruction:string;depends_on:string[];verification:string[];source_pdf_pages:number[];record_required:boolean;diagram_reference_required:boolean;source_links:string[];branches?:ProcedureBranch[]}[]};
export const reviewedProcedures:ReviewedProcedure[]=procedureLibrary;
/** Lists candidate exact-bike procedures; stock component confirmation is recorded at start. */
export function proceduresForBike(bike:Bike){return reviewedProcedures.filter(p=>{
 if(!sameBikeScope(p.target,bike))return false;
 const component=p.component;
 const installation=p.id==='yamaha-2026-yz450f-fork-remove-refit-v1'?[bike.configuration?.clamps,bike.configuration?.triple_clamps,bike.configuration?.front_wheel,bike.configuration?.wheels,bike.configuration?.front_brake,bike.configuration?.brakes]:[];
 const affected=(p.affected_components??[]).flatMap(key=>[bike.configuration?.[key],...(['engine','engine_modifications'].includes(key)?[bike.configuration?.engine,bike.configuration?.engine_modifications,bike.configuration?.valve_train,bike.configuration?.cams,bike.configuration?.piston]:[])]);
 const related=component==='engine'?[bike.configuration?.valve_train,bike.configuration?.engine_modifications,bike.configuration?.cams,bike.configuration?.piston]:['fork','shock'].includes(component)?[bike.configuration?.suspension,...(component==='shock'?[bike.configuration?.linkage,bike.configuration?.swingarm]:[])]:[];
 const saved=JSON.stringify([bike.configuration?.[component],...related,...installation,...affected]).toLowerCase();
 // An explicitly modified component cannot be overridden by a generic stock-confirmation button.
 return !/\b(aftermarket|revalved|revalve|replacement|modified|ported|stroker|conversion|converted|big bore|raven|blackjack|ohlins|öhlins|xact\s*pro|cone[\s-]*valve|fscs)\b/.test(saved);
});}
export type BypassedStep={branch_id:string;from_step:string;at:string;notes:string};
export type ProcedureRun={version:1;procedure_id:string;source_hash:string;procedure_hash:string;owner_id:string;bike_id:string;build_identity:string;step_index:number;completed:Record<string,{notes:string;at:string}>;bypassed?:Record<string,BypassedStep>;started_at:string;stock_confirmed:true};
export function procedureStepRecorded(run:ProcedureRun,id:string){return Boolean(run.completed[id]||run.bypassed?.[id]);}
export function createProcedureRun(bike:Bike,p:ReviewedProcedure,stockConfirmed:boolean):ProcedureRun{if(!stockConfirmed||!proceduresForBike(bike).some(x=>x.id===p.id))throw Error('Confirm this exact procedure and installed stock component before starting.');return {version:1,procedure_id:p.id,source_hash:p.source.document_sha256,procedure_hash:p.content_sha256,owner_id:bike.user_id,bike_id:bike.id,build_identity:buildIdentity(bike),step_index:0,completed:{},started_at:new Date().toISOString(),stock_confirmed:true};}
export function procedureRunMatches(run:ProcedureRun,bike:Bike,p:ReviewedProcedure){return run.version===1&&run.owner_id===bike.user_id&&run.bike_id===bike.id&&run.build_identity===buildIdentity(bike)&&run.procedure_id===p.id&&run.source_hash===p.source.document_sha256&&run.procedure_hash===p.content_sha256&&run.stock_confirmed===true;}
export function validateProcedureRun(value:unknown,bike:Bike,p:ReviewedProcedure):ProcedureRun|null{
 if(!value||typeof value!=='object')return null;const r=value as ProcedureRun;
 if(typeof r.started_at!=='string'||!Number.isFinite(Date.parse(r.started_at))||!procedureRunMatches(r,bike,p)||!Number.isInteger(r.step_index)||r.step_index<0||r.step_index>=p.steps.length||!r.completed||typeof r.completed!=='object'||Array.isArray(r.completed))return null;
 if(r.bypassed!==undefined&&(!r.bypassed||typeof r.bypassed!=='object'||Array.isArray(r.bypassed)))return null;
 for(const [id,v] of Object.entries(r.bypassed??{})){
  if(!v||typeof v.notes!=='string'||!v.notes.trim()||typeof v.at!=='string'||!Number.isFinite(Date.parse(v.at))||r.completed[id])return null;
  const from=p.steps.findIndex(s=>s.id===v.from_step),branch=p.steps[from]?.branches?.find(b=>b.id===v.branch_id),target=p.steps.findIndex(s=>s.id===branch?.next_step),index=p.steps.findIndex(s=>s.id===id);
  if(!branch||!r.completed[v.from_step]||index<=from||index>=target||r.step_index<target)return null;
  if(p.steps.slice(from+1,target).some(s=>r.bypassed?.[s.id]?.branch_id!==v.branch_id||r.bypassed?.[s.id]?.from_step!==v.from_step))return null;
 }
 for(const [id,v] of Object.entries(r.completed)){const step=p.steps.find(s=>s.id===id);if(!step||!v||typeof v.notes!=='string'||!v.notes.trim()||typeof v.at!=='string'||step.depends_on.some(dep=>!procedureStepRecorded(r,dep)))return null;}
 if(p.steps[r.step_index].depends_on.some(dep=>!procedureStepRecorded(r,dep)))return null;
 return r;
}
export function recordProcedureStep(run:ProcedureRun,p:ReviewedProcedure,notes:string):ProcedureRun{
 if(run.procedure_id!==p.id||run.source_hash!==p.source.document_sha256||run.procedure_hash!==p.content_sha256)throw Error('Procedure changed. Start a new run with the current source.');
 const step=p.steps[run.step_index];if(!step)throw Error('Unknown procedure step');
 if(run.bypassed?.[step.id]||step.depends_on.some(id=>!procedureStepRecorded(run,id)))throw Error('Complete the preceding checks first.');
 if(!notes.trim())throw Error('Record the step verification before continuing.');
 return {...run,completed:{...run.completed,[step.id]:{notes:notes.slice(0,8000),at:new Date().toISOString()}},step_index:Math.min(run.step_index+1,p.steps.length-1)};
}
export function followProcedureBranch(run:ProcedureRun,p:ReviewedProcedure,branchId:string,notes:string):ProcedureRun{
 const step=p.steps[run.step_index],branch=step?.branches?.find(b=>b.id===branchId),target=p.steps.findIndex(s=>s.id===branch?.next_step);
 if(!branch||target<=run.step_index)throw Error('This guide does not allow that route.');
 if(!notes.trim())throw Error('Record the measurements or findings that support this route.');
 const omitted=p.steps.slice(run.step_index+1,target);
 if(omitted.some(s=>procedureStepRecorded(run,s.id)))throw Error('This route cannot replace work already recorded.');
 const next=recordProcedureStep(run,p,`${notes}\nSelected route: ${branch.label}\nCondition confirmed: ${branch.condition}`),at=new Date().toISOString();
 return {...next,step_index:target,bypassed:{...run.bypassed,...Object.fromEntries(omitted.map(s=>[s.id,{branch_id:branch.id,from_step:step.id,at,notes:`Not performed: ${branch.condition}\nRider record: ${notes.slice(0,7000)}`}]))}};
}
