import type {Bike} from '../../../shared/types';
import {parseWorkshopBackup,workshopBackup,mergeWorkshopBackup,emptyWorkshopWork,type ProcedureBackup} from '../../../shared/workshop-backup';
import {reviewedProcedures} from '../../../shared/procedures';
import {exportProgress,writeProgress} from './localProgress';

export function nativeWorkshopBackup(bike:Bike){
 const local=Object.fromEntries(Object.entries(exportProgress(bike.user_id)).filter(([key])=>{const decoded=decodeURIComponent(key);return decoded.startsWith(`workshop-${bike.id}`)||decoded.startsWith(`workshop-archive-${bike.id}`)||decoded.startsWith(`procedure-${bike.id}-`)||decoded.startsWith(`procedure-draft-${bike.id}-`);}));
 const parsed=parseWorkshopBackup(JSON.stringify({account:{user:{id:bike.user_id}},device_local_progress:local}),bike);return workshopBackup(bike,mergeWorkshopBackup(emptyWorkshopWork(),parsed,bike));
}
export function restoreNativeWorkshop(text:string,bike:Bike){
 const incoming=parseWorkshopBackup(text,bike),current=nativeWorkshopBackup(bike),merged=mergeWorkshopBackup(current,incoming,bike);
 // Retain the full checked import before updating individual local records.
 writeProgress(bike.user_id,`workshop-import-${bike.id}`,incoming);
 writeProgress(bike.user_id,`workshop-${bike.id}`,merged.journals);
 const groups=new Map<string,ProcedureBackup[]>();for(const entry of merged.procedures)groups.set(entry.run.procedure_id,[...(groups.get(entry.run.procedure_id)??[]),entry]);
 for(const [id,entries] of groups){writeProgress(bike.user_id,`procedure-${bike.id}-${id}`,entries.map(entry=>entry.run));for(const entry of entries){const p=reviewedProcedures.find(p=>p.id===id),drafts={...entry.drafts};if(entry.draft&&p?.steps[entry.run.step_index])drafts[p.steps[entry.run.step_index].id]=entry.draft;writeProgress(bike.user_id,`procedure-draft-${bike.id}-${id}-${entry.run.started_at}`,drafts);}}
 writeProgress(bike.user_id,`workshop-archive-${bike.id}`,merged.archived);
 return workshopBackup(bike,merged);
}
