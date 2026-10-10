import type {Bike} from './types.ts';
import {canonicalJson} from './create-retry.ts';
import {validateJournal,journalMatches,type WorkshopJournal} from './workshop.ts';
import {reviewedProcedures,validateProcedureRun,type ProcedureRun} from './procedures.ts';

export type ProcedureBackup={run:ProcedureRun;drafts:Record<string,string>;draft?:string};
export type ArchivedWork={kind:'journal'|'procedure';reason:string;data:WorkshopJournal|ProcedureBackup};
export type WorkshopBackup={format:'bakmx-workshop';version:1;owner_id:string;bike_id:string;exported_at:string;journals:WorkshopJournal[];procedures:ProcedureBackup[];archived:ArchivedWork[]};
export const emptyWorkshopWork=()=>({journals:[] as WorkshopJournal[],procedures:[] as ProcedureBackup[],archived:[] as ArchivedWork[]});
type Work=ReturnType<typeof emptyWorkshopWork>;
export function workshopBackup(bike:Bike,work:Work):WorkshopBackup{return {format:'bakmx-workshop',version:1,owner_id:bike.user_id,bike_id:bike.id,exported_at:new Date().toISOString(),...work};}
function record(value:unknown):value is Record<string,any>{return Boolean(value)&&typeof value==='object'&&!Array.isArray(value);}
function historicalIdentity(value:unknown,bike:Bike){try{const id=JSON.parse(String(value));return Array.isArray(id)&&id.length===4&&id[0]===bike.user_id&&id[1]===bike.id&&record(id[2])&&['manufacturer','model','variant','region'].every(k=>typeof id[2][k]==='string')&&Number.isInteger(id[2].model_year)&&record(id[3]);}catch{return false;}}
function validProcedureEntry(value:unknown,bike:Bike):value is ProcedureBackup{
 if(!record(value)||!record(value.run)||!record(value.drafts))return false;
 const r=value.run;
 if(r.bypassed!==undefined&&(!record(r.bypassed)||!Object.entries(r.bypassed).every(([key,item])=>key.length<200&&record(item)&&typeof item.branch_id==='string'&&typeof item.from_step==='string'&&typeof item.notes==='string'&&item.notes.length<=8000&&typeof item.at==='string'&&Number.isFinite(Date.parse(item.at)))))return false;
 return r.version===1&&r.owner_id===bike.user_id&&r.bike_id===bike.id&&historicalIdentity(r.build_identity,bike)&&typeof r.procedure_id==='string'&&typeof r.source_hash==='string'&&typeof r.started_at==='string'&&Number.isFinite(Date.parse(r.started_at))&&Number.isInteger(r.step_index)&&r.step_index>=0&&r.step_index<1000&&record(r.completed)&&Object.entries(r.completed).every(([key,item])=>key.length<200&&record(item)&&typeof item.notes==='string'&&item.notes.length<=8000&&typeof item.at==='string')&&Object.entries(value.drafts).every(([key,text])=>key.length<200&&typeof text==='string'&&text.length<=8000)&&(value.draft===undefined||typeof value.draft==='string'&&value.draft.length<=8000);
}
function legacyNativeBackup(value:Record<string,any>,bike:Bike):WorkshopBackup{
 if(value.account?.user?.id!==bike.user_id)throw Error('This backup belongs to a different account.');
 const entries=new Map<string,{revision:number;value:any}>();
 for(const [encoded,raw] of Object.entries(value.device_local_progress)){let key:string;try{key=decodeURIComponent(encoded).replace(/--snapshot[01]$/,'');}catch{continue;}const item=record(raw)&&Number.isFinite(raw.revision)&&'value' in raw?{revision:raw.revision,value:raw.value}:{revision:0,value:raw};if(!entries.has(key)||entries.get(key)!.revision<item.revision)entries.set(key,item);}
 const work=emptyWorkshopWork();
 const journals=entries.get(`workshop-${bike.id}`)?.value;if(Array.isArray(journals))work.journals=journals;
 const archived=entries.get(`workshop-archive-${bike.id}`)?.value;if(Array.isArray(archived))work.archived=archived;
 for(const [key,item] of entries)if(key.startsWith(`procedure-${bike.id}-`)&&Array.isArray(item.value))for(const run of item.value){const drafts=entries.get(`procedure-draft-${bike.id}-${run?.procedure_id}-${run?.started_at}`)?.value;work.procedures.push({run,drafts:record(drafts)?drafts:{}});}
 return workshopBackup(bike,work);
}
export function parseWorkshopBackup(text:string,bike:Bike):WorkshopBackup{
 if(text.length>5_000_000)throw Error('Choose a workshop backup smaller than 5 MB.');
 let value:any;try{value=JSON.parse(text);}catch{throw Error('Choose a BAK MX JSON backup. Older plain-text recaps can be read as notes but cannot restore checked steps.');}
 if(record(value)&&record(value.device_local_progress))value=legacyNativeBackup(value,bike);
 else if(record(value)&&record(value.run))value={...workshopBackup(bike,emptyWorkshopWork()),owner_id:value.run.owner_id,bike_id:value.run.bike_id,procedures:[{run:value.run,drafts:{},draft:typeof value.draft==='string'?value.draft:''}]};
 if(!record(value)||value.format!=='bakmx-workshop'||value.version!==1||value.owner_id!==bike.user_id||value.bike_id!==bike.id)throw Error('Use a backup for this original bike and signed-in account. Bike records are not reassigned during recovery.');
 if(!Array.isArray(value.journals)||!Array.isArray(value.procedures)||!Array.isArray(value.archived)||value.journals.length+value.procedures.length+value.archived.length>500)throw Error('This workshop backup has an invalid record list.');
 for(const journal of value.journals)if(!validateJournal(journal,bike)||!historicalIdentity(journal.build_identity,bike))throw Error('A journal failed account, bike or structure validation. Nothing was imported.');
 for(const entry of value.procedures){if(!validProcedureEntry(entry,bike))throw Error('A procedure record failed account, bike or structure validation. Nothing was imported.');const p=reviewedProcedures.find(p=>p.id===entry.run.procedure_id&&p.content_sha256===entry.run.procedure_hash&&p.source.document_sha256===entry.run.source_hash),step=p?.steps[entry.run.step_index];if(entry.draft!==undefined&&step){if(entry.draft)entry.drafts[step.id]=entry.draft;delete entry.draft;}entry.drafts=Object.fromEntries(Object.entries(entry.drafts).filter(([,text])=>text!==''));}
 for(const item of value.archived)if(!record(item)||!['journal','procedure'].includes(item.kind)||typeof item.reason!=='string'||(item.kind==='journal'? !validateJournal(item.data,bike)||!historicalIdentity(item.data.build_identity,bike):!validProcedureEntry(item.data,bike)))throw Error('A historical record could not be validated. Nothing was imported.');
 return value as WorkshopBackup;
}
const procedureKey=(entry:ProcedureBackup)=>canonicalJson([entry.run.procedure_id,entry.run.source_hash,entry.run.procedure_hash,entry.run.build_identity,entry.run.started_at]);
export function mergeWorkshopBackup(current:Work,incoming:WorkshopBackup,bike:Bike,options:{singleProcedureSlot?:boolean}={}):Work{
 const result:Work={journals:[...current.journals],procedures:[...current.procedures],archived:[...current.archived]};
 function archive(kind:ArchivedWork['kind'],data:ArchivedWork['data'],reason:string){if(!result.archived.some(old=>old.kind===kind&&canonicalJson(old.data)===canonicalJson(data)))result.archived.push({kind,data,reason});}
 for(const item of incoming.archived)archive(item.kind,item.data,item.reason);
 for(const journal of incoming.journals){if(!journalMatches(journal,bike)){archive('journal',journal,'Historical build configuration. These original notes remain read-only.');continue;}const existing=result.journals.find(j=>j.id===journal.id);if(!existing)result.journals.push(journal);else if(canonicalJson(existing)!==canonicalJson(journal))archive('journal',journal,'A different version of this journal already exists. Both versions are preserved.');}
 for(const entry of incoming.procedures){const procedure=reviewedProcedures.find(p=>p.id===entry.run.procedure_id);if(!procedure||!validateProcedureRun(entry.run,bike,procedure)){archive('procedure',entry,'Historical build or guide revision. Read the notes; start a current guide to perform new work.');continue;}const existing=result.procedures.find(p=>procedureKey(p)===procedureKey(entry)||(options.singleProcedureSlot&&p.run.procedure_id===entry.run.procedure_id&&p.run.build_identity===entry.run.build_identity&&p.run.procedure_hash===entry.run.procedure_hash));if(!existing)result.procedures.push(entry);else if(canonicalJson(existing)!==canonicalJson(entry))archive('procedure',entry,'A different version of this guide run already exists. Both versions are preserved.');}
 return result;
}
export function archivedWorkText(item:ArchivedWork){const data=item.data;if(item.kind==='journal'){const j=data as WorkshopJournal;return `${item.reason}\n${j.kind}\n${j.reference}\n${Object.entries(j.records).map(([phase,r])=>`${phase}: ${r.notes}`).join('\n')}\n${j.measurements}\n${j.parts}`;}const p=data as ProcedureBackup;return `${item.reason}\n${reviewedProcedures.find(x=>x.id===p.run.procedure_id)?.title??'Archived guide'}\n${Object.entries(p.run.completed).map(([step,r])=>`${step}: ${r.notes}`).join('\n')}\n${Object.entries(p.run.bypassed??{}).map(([step,r])=>`${step}: Not performed: ${r.notes.replace(/^Not performed: /,'')}`).join('\n')}\n${Object.values(p.drafts).join('\n')}\n${p.draft??''}`;}
