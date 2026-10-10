import {reviewedProcedures} from '../shared/procedures.ts';
import type {Bike} from '../shared/types';
import {emptyWorkshopWork,workshopBackup,parseWorkshopBackup,mergeWorkshopBackup} from '../shared/workshop-backup.ts';

const journalKey=(bike:Bike)=>`bakmx:workshop:v1:${bike.user_id}:${bike.id}`;
const historyKey=(bike:Bike)=>`bakmx:workshop-history:v1:${bike.user_id}:${bike.id}`;
export function browserWorkshopBackup(bike:Bike){
 const work=emptyWorkshopWork(),journals=localStorage.getItem(journalKey(bike)),history=localStorage.getItem(historyKey(bike));
 if(journals)work.journals=JSON.parse(journals);if(history)work.archived=JSON.parse(history);
 const prefix=`bakmx:procedure:v1:${bike.user_id}:${bike.id}:`;
 for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(prefix)){const value=JSON.parse(localStorage.getItem(key)!);work.procedures.push({run:value.run,drafts:{},draft:value.notes??''});}}
 const parsed=parseWorkshopBackup(JSON.stringify(workshopBackup(bike,work)),bike);return workshopBackup(bike,mergeWorkshopBackup(emptyWorkshopWork(),parsed,bike,{singleProcedureSlot:true}));
}
export function restoreBrowserWorkshop(text:string,bike:Bike){
 const incoming=parseWorkshopBackup(text,bike),current=browserWorkshopBackup(bike),merged=mergeWorkshopBackup(current,incoming,bike,{singleProcedureSlot:true});
 localStorage.setItem(`bakmx:workshop-import:v1:${bike.user_id}:${bike.id}`,JSON.stringify(incoming));
 localStorage.setItem(journalKey(bike),JSON.stringify(merged.journals));
 for(const entry of merged.procedures){const run=entry.run,key=`bakmx:procedure:v1:${bike.user_id}:${bike.id}:${run.build_identity}:${run.procedure_id}:${run.source_hash}:${run.procedure_hash}`;
  // Preserve historical records under their original scope; current guide validation controls resumption.
  const procedure=reviewedProcedures.find(p=>p.id===run.procedure_id),step=procedure?.steps[run.step_index];const notes=entry.draft??(step?entry.drafts[step.id]??'':'');
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({run,notes}));
 }
 localStorage.setItem(historyKey(bike),JSON.stringify(merged.archived));
 return workshopBackup(bike,merged);
}
