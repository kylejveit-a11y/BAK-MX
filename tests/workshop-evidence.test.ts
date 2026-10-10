import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {reviewedProcedures,proceduresForBike,createProcedureRun,validateProcedureRun,recordProcedureStep,followProcedureBranch} from '../shared/procedures.ts';
import {relatedReferences} from '../server/references.ts';
import {bikeSchema} from '../server/validation.ts';
import {applicableClaims} from '../server/engineering.ts';
import {isMxProjectUrl} from '../shared/mx-project.ts';
const bike:any={id:'one',user_id:'owner',manufacturer:'Yamaha',model:'YZ450F',model_year:2026,variant:'Standard',region:'US',configuration:{suspension:'stock'}};
test('source index correction preserves unchanged mechanical progress and binds corrected metadata',()=>{
 const raw=JSON.parse(readFileSync('docs/research/expansion/yamaha/workshop-2026/valve-inspection-v1.procedure.json','utf8'));
 const p=reviewedProcedures.find(p=>p.id===raw.id)!;
 assert.equal(p.content_sha256,createHash('sha256').update(JSON.stringify(raw)).digest('hex'));
 assert.ok(p.source.pdf_pages.includes(58));
 assert.equal((p.source as any).page_index_correction_sha256,createHash('sha256').update(readFileSync('docs/research/expansion/yamaha/workshop-pass2/page-index-correction.json')).digest('hex'));
});

test('legacy torque typography is readable without changing the frozen operation hash',()=>{
 const raw=JSON.parse(readFileSync('docs/research/frame-pass3/continuation/frame-strip-reassemble-v1.procedure.json','utf8'));
 const p=reviewedProcedures.find(p=>p.id===raw.id)!;
 assert.equal(p.content_sha256,createHash('sha256').update(JSON.stringify(raw)).digest('hex'));
 assert.match(p.steps.find(s=>s.id==='front-preload')!.instruction,/38 N\u00b7m/);
 assert.ok(!JSON.stringify(p).includes('\u00c2\u00b7'));
 const chain=JSON.parse(readFileSync('docs/research/workshop-pass7/yamaha-drive/stock-chain-renewal-v1.procedure.json','utf8'));
 const published=reviewedProcedures.find(p=>p.id===chain.id)!;
 assert.equal(published.content_sha256,createHash('sha256').update(JSON.stringify(chain)).digest('hex'));
 assert.ok(published.source.printed_pages.includes('2-7'));
 assert.ok(!published.source.printed_pages.includes('2-10'));
});

test('paired drive renewal keeps the chain reaction available only with a secured rear wheel',()=>{
 const p=reviewedProcedures.find(g=>g.id==='yamaha-yz450f-2026-stock-chain-sprocket-pair-renewal-v1')!;
 const index=(id:string)=>{const n=p.steps.findIndex(s=>s.id===id);assert.ok(n>=0,id);return n;};
 assert.ok(index('front-release')<index('chain-remove'));
 assert.ok(index('chain-install')<index('axle-secure'));
 assert.ok(index('axle-secure')<index('front-secure'));
 assert.match(p.steps[index('front-release')].instruction,/neutral/);
 assert.match(p.steps[index('front-secure')].instruction,/90Nm/);
 assert.ok(p.supplemental_sources!.some(s=>s.attribution.includes('Nick Dole')));
});
test('every released guide completes and restores without losing required records',()=>{
 for(const p of reviewedProcedures){const targetBike={...bike,...p.target};let run=createProcedureRun(targetBike,p,true);for(const step of p.steps){assert.ok(step.source_pdf_pages.length);if(step.diagram_reference_required)assert.ok(step.source_links.length);run=recordProcedureStep(run,p,`Test record for ${step.id}`);assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),targetBike,p));}assert.equal(Object.keys(run.completed).length,p.steps.length);}
 const fork=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-fork-remove-refit-v1')!;
 assert.ok(fork.completeness.includes('no oil change'));
 assert.ok(fork.steps.find(s=>s.id==='height-clamps')?.record_required);
 assert.ok(fork.steps.find(s=>s.id==='plate-settings')?.record_required);
 assert.equal(proceduresForBike({...bike,configuration:{triple_clamps:'aftermarket conversion'}}).some(p=>p.id===fork.id),false);
});
test('internal fork preparation retains precision tools and rejects modified access components',()=>{
 const p=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-fork-oil-seals-bushings-v1')!;
 assert.ok(p);
 assert.ok(p.required_tools.some(t=>(t.name+' '+t.size).includes('0.6')));
 assert.ok(p.required_tools.some(t=>(t.name+' '+t.size).includes('90890-01911')));
 for(const key of ['front_brake','triple_clamps','front_wheel'])assert.equal(proceduresForBike({...bike,configuration:{[key]:'aftermarket conversion'}}).some(guide=>guide.id===p.id),false,key);
 assert.ok(proceduresForBike({...bike,configuration:{front_wheel:'stock'}}).some(guide=>guide.id===p.id));
});
test('later Beta pressure and fluid conflict excludes the historical bench companion from execution',()=>{
 const id='beta-2023-300-rr-race-kyb-c46-bench-rebuild-v1';
 assert.equal(reviewedProcedures.some(p=>p.id===id),false);
 const beta={...bike,manufacturer:'Beta',model:'300 RR',model_year:2023,variant:'Race Edition',configuration:{shock:'stock'}};
 assert.equal(proceduresForBike(beta).some(p=>p.id===id),false);
});
test('frame composite secures both wheels and closes fluid systems before startup',()=>{
 const p=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-frame-strip-reassemble-v1')!;
 assert.ok(p);
 const position=(id:string)=>{const index=p.steps.findIndex(s=>s.id===id);assert.ok(index>=0,id);return index;};
 for(const [before,after] of [['engine-engine-out','swingarm-off'],['engine-engine-in','rear-link-refit'],['rear-hardware','engine-torque'],['engine-torque','front-seat-torque'],['front-seat-torque','engine-oil-flow'],['engine-fuel-ready','engine-oil-flow'],['pressure-test','engine-oil-flow']])assert.ok(position(before)<position(after),`${before} before ${after}`);
 assert.ok(p.exit_state?.length);
 assert.equal(proceduresForBike({...bike,configuration:{engine:'aftermarket conversion'}}).some(guide=>guide.id===p.id),false);
});

test('frame bearing renewal finishes bench work before refit and warm checks before cooldown',()=>{
 const p=reviewedProcedures.find(g=>g.id==='yamaha-yz450f-2026-frame-bearing-renewal-reassembly-v1')!;
 const index=(id:string)=>{const n=p.steps.findIndex(s=>s.id===id);assert.ok(n>=0,id);return n;};
 for(const [before,after] of [
  ['control-renew-ends-release','engine-engine-out'],
  ['steering-renew-old-races-out','frame-inspection'],
  ['frame-inspection','steering-renew-head-races-in'],
  ['linkage-renew-swingarm-bearings-in','engine-engine-in'],
  ['eyes-renew-upper-eye-in','shock-upper-refit'],
  ['rear-renew-new-circlip','rear-refit'],
  ['front-renew-spacer-right','front-wheel-refit'],
  ['engine-torque','rear-renew-close'],
  ['front-seat-torque','engine-oil-flow'],
  ['control-renew-steering-check','engine-complete-cooling'],
  ['engine-complete-cooling','engine-cooling-recheck'],
 ])assert.ok(index(before)<index(after),`${before} before ${after}`);
 for(const id of ['engine-engine-out','engine-engine-in','rear-refit','front-wheel-refit'])assert.equal(p.steps.filter(s=>s.id===id).length,1);
});
test('continuous top-end route preserves completed teardown when only additional pad adjustment is skipped',()=>{
 const p=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-top-end-stock-reuse-v1')!;
 assert.ok(p);
 let run=createProcedureRun(bike,p,true);
 while(p.steps[run.step_index].id!=='clearance-adjust--adjustment-scope')run=recordProcedureStep(run,p,'Synthetic test record, not physical work');
 run=followProcedureBranch(run,p,'within-range','Synthetic test: all four definite cold measurements within range');
 assert.equal(p.steps[run.step_index].id,'cams-in--cover-install');
 assert.equal(Object.keys(run.bypassed??{}).length,13);
 assert.ok(run.completed['head-in--final-angle']);
 assert.ok(run.completed['cams-in--timing-verify']);
 assert.ok(run.completed['cams-in--remeasure']);
 assert.ok(!run.completed['clearance-adjust--remeasure']);
 assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),bike,p));
 for(const step of p.steps.slice(run.step_index)){assert.equal(p.steps[run.step_index].id,step.id);run=recordProcedureStep(run,p,'Synthetic closure test record');}
 assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),bike,p));
 assert.equal(Object.keys(run.completed).length,119);
 assert.equal(proceduresForBike({...bike,configuration:{cams:'aftermarket'}}).some(g=>g.id===p.id),false);
});

test('guide-renewal route keeps machining and distinct running valves before assembly when adjustment is skipped',()=>{
 const p=reviewedProcedures.find(g=>g.id==='yamaha-2026-yz450f-top-end-guide-valve-renew-v1')!;
 const index=(id:string)=>{const n=p.steps.findIndex(s=>s.id===id);assert.ok(n>=0,id);return n;};
 assert.ok(index('head-renew--seat-service')<index('head-renew--lap-coarse'));
 assert.ok(index('head-renew--running-valves')<index('head-renew--assemble'));
 assert.ok(index('head-renew--seal-final')<index('head-in--final-angle'));
 let run=createProcedureRun(bike,p,true);
 while(p.steps[run.step_index].id!=='clearance-adjust--adjustment-scope')run=recordProcedureStep(run,p,'Synthetic QA record; no physical work.');
 run=followProcedureBranch(run,p,'within-range','Synthetic QA: four final clearances in range.');
 assert.ok(run.completed['head-renew--running-valves']);
 assert.ok(run.completed['head-renew--seat-service']);
 assert.equal(Object.keys(run.bypassed??{}).length,13);
 for(const s of p.steps.slice(run.step_index))run=recordProcedureStep(run,p,'Synthetic QA closure.');
 assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),bike,p));
 assert.equal(Object.keys(run.completed).length,129);
 assert.match(p.exit_state!.join(' '),/break-in.*remains required/);
});
test('procedure guide stays exact-year and requires installed-component confirmation',()=>{const p=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-stock-fork-clicker-baseline-v1')!;assert.equal(proceduresForBike(bike).length,reviewedProcedures.filter(p=>p.target.manufacturer===bike.manufacturer&&p.target.model===bike.model&&p.target.model_year===bike.model_year).length);assert.ok(proceduresForBike({...bike,model_year:2025}).length>0);assert.ok(proceduresForBike({...bike,model_year:2025}).every(item=>item.target.model_year===2025&&item.id!==p.id));assert.throws(()=>createProcedureRun({...bike,model_year:2025},p,true));assert.ok(proceduresForBike({...bike,model:'YZ450FX'}).every(item=>item.target.model==='YZ450FX'&&item.id!==p.id));assert.equal(proceduresForBike({...bike,configuration:{suspension:'revalved'}}).length,reviewedProcedures.filter(p=>p.target.manufacturer===bike.manufacturer&&p.target.model===bike.model&&p.target.model_year===bike.model_year&&!['fork','shock'].includes(p.component)&&!p.affected_components?.includes('suspension')).length);assert.throws(()=>createProcedureRun({...bike,configuration:{fork:'aftermarket test fork'}},p,true));assert.throws(()=>createProcedureRun(bike,p,false));const run=createProcedureRun(bike,p,true);assert.ok(validateProcedureRun(run,bike,p));assert.equal(validateProcedureRun(run,{...bike,user_id:'other'},p),null);assert.equal(validateProcedureRun(run,{...bike,configuration:{suspension:'revalved'}},p),null);assert.equal(validateProcedureRun({...run,source_hash:'changed'},bike,p),null);});
test('procedure cannot jump past dependencies and final completion survives restart',()=>{const p=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-stock-fork-clicker-baseline-v1')!;let run=createProcedureRun(bike,p,true);assert.equal(validateProcedureRun({...run,step_index:3},bike,p),null);assert.throws(()=>recordProcedureStep({...run,step_index:3},p,'done'));assert.throws(()=>recordProcedureStep(run,p,''));for(const step of p.steps)run=recordProcedureStep(run,p,`Recorded: ${step.verification.join('; ')}`);assert.equal(Object.keys(run.completed).length,p.steps.length);assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),bike,p));});
test('other off-road identity is explicit and never produces neighboring-bike evidence',()=>{const input={manufacturer:'Yamaha',model:'YZ250',model_year:2005,variant:'standard',region:'US',configuration:{identity_source:'rider_declared',vehicle_use:'cross-country'}};assert.equal(bikeSchema.safeParse(input).success,true);assert.equal(bikeSchema.safeParse({...input,configuration:{}}).success,false);assert.equal(bikeSchema.safeParse({...input,configuration:{identity_source:'rider_declared',vehicle_use:'road'}}).success,false);const c:any={...bike,status:'VERIFIED',has_conflict:false,source_url:'https://example.com',source_locator:'p1'};assert.equal(applicableClaims([c],input as any).length,0);assert.equal(applicableClaims([{...c,variant:'standard'}],bike).length,1);});
test('attributed links never include numerical settings or grant general component applicability',()=>{const refs=relatedReferences({...bike,model_year:2025},'fork feels harsh');assert.ok(refs.some(r=>r.attribution==='Kris Keefer'));assert.ok(refs.every(r=>!('value' in r)&&!('specifications' in r)));assert.equal(relatedReferences({...bike,model_year:2026},'fork feels harsh').some(r=>r.attribution==='Kris Keefer'),false);assert.equal(relatedReferences(bike,'hard starting').length,0);assert.equal(relatedReferences(bike,'fork feels harsh').some(r=>r.attribution==='MX-Tech'),false);});
test('runtime project boundary rejects EMOTO, redirects and URL tricks',()=>{assert.equal(isMxProjectUrl('https://yzvrujffiktfserrgkcb.supabase.co'),true);for(const url of ['https://yxvwepgbahkdlkpedndj.supabase.co','https://yzvrujffiktfserrgkcb.supabase.co.evil.test','https://user@yzvrujffiktfserrgkcb.supabase.co','https://yzvrujffiktfserrgkcb.supabase.co/?target=other'])assert.equal(isMxProjectUrl(url),false);});
