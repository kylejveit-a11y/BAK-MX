import test from 'node:test';
import assert from 'node:assert/strict';
import {createJournal,recordPhase} from '../shared/workshop.ts';
import {createProcedureRun,recordProcedureStep,followProcedureBranch,reviewedProcedures} from '../shared/procedures.ts';
import {emptyWorkshopWork,workshopBackup,parseWorkshopBackup,mergeWorkshopBackup,archivedWorkText} from '../shared/workshop-backup.ts';
import {restoreBrowserWorkshop,browserWorkshopBackup} from '../src/workshopRecoveryStorage.ts';
const bike:any={id:'bike',user_id:'owner',manufacturer:'Yamaha',model:'YZ450F',model_year:2026,variant:'standard',region:'US',configuration:{fork:'stock'}};
function fixture(){const p=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-stock-fork-clicker-baseline-v1')!,run=recordProcedureStep(createProcedureRun(bike,p,true),p,'Bike supported'),journal=recordPhase(createJournal(bike,'engine','journal'),'Photos and references recorded');return {p,work:{journals:[journal],procedures:[{run,drafts:{[p.steps[run.step_index].id]:'Original settings recorded here'}}],archived:[]}};}
test('workshop backup roundtrip restores exact scoped records and is idempotent',()=>{
 const {work}=fixture(),backup=parseWorkshopBackup(JSON.stringify(workshopBackup(bike,work)),bike),merged=mergeWorkshopBackup(emptyWorkshopWork(),backup,bike);
 assert.deepEqual(merged,work);assert.deepEqual(mergeWorkshopBackup(merged,backup,bike),work);
});
test('wrong account/bike and corrupted nested identity are rejected before recovery',()=>{
 const {work}=fixture(),backup=workshopBackup(bike,work);
 assert.throws(()=>parseWorkshopBackup(JSON.stringify(backup),{...bike,user_id:'other'}),/original bike|account/);
 assert.throws(()=>parseWorkshopBackup(JSON.stringify(backup),{...bike,id:'other-bike'}),/original bike|account/);
 assert.throws(()=>parseWorkshopBackup(JSON.stringify({...backup,journals:[{...work.journals[0],owner_id:'other'}]}),bike),/validation/);
});
test('older builds, source revisions and skipped prerequisites stay read-only',()=>{
 const {work}=fixture(),changedBike={...bike,configuration:{fork:'replacement'}},oldBuild=parseWorkshopBackup(JSON.stringify(workshopBackup(bike,work)),changedBike);
 const result=mergeWorkshopBackup(emptyWorkshopWork(),oldBuild,changedBike);assert.equal(result.journals.length,0);assert.equal(result.procedures.length,0);assert.equal(result.archived.length,2);
 for(const patch of [{procedure_hash:'old-source-revision'},{step_index:2,completed:{}}]){const invalid={...work,procedures:[{...work.procedures[0],run:{...work.procedures[0].run,...patch}}]};const imported=mergeWorkshopBackup(emptyWorkshopWork(),parseWorkshopBackup(JSON.stringify(workshopBackup(bike,invalid)),bike),bike);assert.equal(imported.procedures.length,0);assert.equal(imported.archived.length,1);}
});
test('conflicting versions never overwrite existing notes and repeated imports do not multiply history',()=>{
 const {work}=fixture(),incoming={...work,journals:[{...work.journals[0],reference:'different version'}]};
 const first=mergeWorkshopBackup(work,workshopBackup(bike,incoming),bike);assert.deepEqual(first.journals,work.journals);assert.equal(first.archived.length,1);
 assert.equal(mergeWorkshopBackup(first,workshopBackup(bike,incoming),bike).archived.length,1);
});
test('existing web guide export and native account snapshots can be recovered',()=>{
 const {p,work}=fixture(),entry=work.procedures[0];
 const legacy=parseWorkshopBackup(JSON.stringify({run:entry.run,draft:'Pending measurement'}),bike);assert.equal(legacy.procedures[0].drafts[p.steps[entry.run.step_index].id],'Pending measurement');
 const local={account:{user:{id:bike.user_id}},device_local_progress:{[encodeURIComponent(`workshop-${bike.id}--snapshot0`)]:{revision:1,value:[]},[encodeURIComponent(`workshop-${bike.id}--snapshot1`)]:{revision:2,value:work.journals},[encodeURIComponent(`procedure-${bike.id}-${p.id}--snapshot0`)]:{revision:1,value:[entry.run]}}};
 const recovered=parseWorkshopBackup(JSON.stringify(local),bike);assert.deepEqual(recovered.journals,work.journals);assert.equal(recovered.procedures.length,1);
});
test('browser restore populates actual journal and guide keys, retains conflicts and roundtrips',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map<string,string>();
 const storage={get length(){return values.size;},key:(i:number)=>Array.from(values.keys())[i]??null,getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);},clear:()=>values.clear()};
 Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
 try{const {work}=fixture(),text=JSON.stringify(workshopBackup(bike,work));restoreBrowserWorkshop(text,bike);assert.deepEqual(browserWorkshopBackup(bike).journals,work.journals);assert.deepEqual(browserWorkshopBackup(bike).procedures,work.procedures);const before=Array.from(values.entries()).filter(([key])=>key.startsWith('bakmx:procedure:'));
 const other={...work,procedures:[{...work.procedures[0],run:{...work.procedures[0].run,started_at:'2026-01-01T00:00:00.000Z'}}]};const result=restoreBrowserWorkshop(JSON.stringify(workshopBackup(bike,other)),bike);assert.equal(result.archived.length,1);assert.deepEqual(Array.from(values.entries()).filter(([key])=>key.startsWith('bakmx:procedure:')),before);assert.equal(browserWorkshopBackup(bike).archived.length,1);
 }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else Reflect.deleteProperty(globalThis,'localStorage');}
});

test('reviewed branch survives backup with skipped work separate from completed checks',()=>{
 const p=reviewedProcedures.find(p=>p.target.manufacturer===bike.manufacturer&&p.target.model===bike.model&&p.target.model_year===bike.model_year&&p.target.region===bike.region&&p.target.variant===bike.variant&&p.steps.some(s=>s.branches?.length));assert.ok(p,'reviewed branch is present');
 let run=createProcedureRun(bike,p,true);while(!p.steps[run.step_index].branches?.length)run=recordProcedureStep(run,p,'Synthetic verification');
 const branch=p.steps[run.step_index].branches![0];run=followProcedureBranch(run,p,branch.id,'Synthetic QA record: all four measurements in range.');
 assert.ok(Object.keys(run.bypassed??{}).length>0);for(const id of Object.keys(run.bypassed!))assert.equal(run.completed[id],undefined);
 const work={journals:[],procedures:[{run,drafts:{}}],archived:[]},backup=parseWorkshopBackup(JSON.stringify(workshopBackup(bike,work)),bike);
 assert.deepEqual(mergeWorkshopBackup(emptyWorkshopWork(),backup,bike),work);
 const historical=mergeWorkshopBackup(emptyWorkshopWork(),backup,{...bike,configuration:{fork:'changed'}});assert.equal(historical.procedures.length,0);
 assert.match(archivedWorkText(historical.archived[0]),/Not performed:/);assert.match(archivedWorkText(historical.archived[0]),/all four measurements/);
 const corrupt=structuredClone(backup);Object.values(corrupt.procedures[0].run.bypassed!)[0].at='invalid';assert.throws(()=>parseWorkshopBackup(JSON.stringify(corrupt),bike),/validation/);
});


test('2025 sag branch restores without recording skipped spring adjustment as performed',()=>{
 const target={...bike,model_year:2025};
 const p=reviewedProcedures.find(p=>p.id==='yamaha-2025-yz450f-rider-sag-preload-v1')!;
 let run=createProcedureRun(target,p,true);
 while(!p.steps[run.step_index].branches?.length)run=recordProcedureStep(run,p,'Synthetic measurement record');
 run=followProcedureBranch(run,p,p.steps[run.step_index].branches![0].id,'Synthetic QA: measured sag and original spring lengths meet the specified range.');
 assert.equal(Object.keys(run.bypassed??{}).length,3);
 for(const id of Object.keys(run.bypassed!))assert.equal(run.completed[id],undefined);
 const work={journals:[],procedures:[{run,drafts:{}}],archived:[]};
 assert.deepEqual(mergeWorkshopBackup(emptyWorkshopWork(),parseWorkshopBackup(JSON.stringify(workshopBackup(target,work)),target),target),work);
 assert.throws(()=>createProcedureRun(bike,p,true));
});
