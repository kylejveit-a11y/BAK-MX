import test from 'node:test';
import assert from 'node:assert/strict';
import {createJournal,saveTrial,validateJournal,type SettingTrial} from '../shared/workshop.ts';
import {createProcedureRun,reviewedProcedures,validateProcedureRun,recordProcedureStep} from '../shared/procedures.ts';
const bike:any={id:'bike',user_id:'rider',manufacturer:'Yamaha',model:'YZ450F',model_year:2026,variant:'standard',region:'US',configuration:{fork:'stock'}};
const trial=(id:string,decision:SettingTrial['decision']='pending',result:SettingTrial['result']='untested'):SettingTrial=>({id,adjuster:'compression',before:'12',after:'13',unit:'clicks out',conditions:'same corner',result,notes:'',decision,created_at:new Date().toISOString()});

test('reopening an earlier trial cannot create a second unresolved comparison',()=>{
 let journal=createJournal(bike,'clickers','job');
 journal=saveTrial(journal,trial('first','keep','better'));
 journal=saveTrial(journal,trial('second'));
 assert.throws(()=>saveTrial(journal,trial('first')),/comparison|pending|Finish/i);
 assert.equal(validateJournal({...journal,trials:[trial('first'),trial('second')]},bike),null);
 assert.equal(saveTrial(journal,{...trial('second'),notes:'Still evaluating'}).trials.filter(t=>t.decision==='pending').length,1);
});

test('restored procedure requires a valid run timestamp and exact reviewed content revision',()=>{
 const procedure=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-stock-fork-clicker-baseline-v1')!,run=createProcedureRun(bike,procedure,true);
 assert.equal(validateProcedureRun({...run,started_at:undefined},bike,procedure),null);
 assert.equal(validateProcedureRun({...run,started_at:'invalid'},bike,procedure),null);
 const revised={...procedure,content_sha256:'different-reviewed-revision'};
 assert.equal(validateProcedureRun(run,bike,revised),null);
 assert.throws(()=>recordProcedureStep(run,revised,'Confirmed'),/changed/i);
 assert.ok(validateProcedureRun(run,bike,procedure));
});

test('guide cannot restore or advance past missing dependency records',()=>{
 const procedure=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-stock-fork-clicker-baseline-v1')!,run=createProcedureRun(bike,procedure,true);
 const skipped={...run,step_index:2};
 assert.equal(validateProcedureRun(skipped,bike,procedure),null);
 assert.throws(()=>recordProcedureStep(skipped,procedure,'Checked'),/preceding/i);
 const first=recordProcedureStep(run,procedure,'Bike supported and stock configuration checked');
 assert.equal(first.step_index,1);
 assert.ok(validateProcedureRun(first,bike,procedure));
});
