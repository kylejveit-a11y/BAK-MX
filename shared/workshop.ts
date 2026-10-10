import type {Bike} from './types.ts';
import {buildIdentity} from './bike-identity.ts';

export type JobKind='frame'|'engine'|'fork'|'shock'|'clickers';
export type JobPhase={id:string;title:string;focus:string;record:string;procedureNeeded:boolean};
export type JobDefinition={kind:JobKind;title:string;description:string;phases:JobPhase[]};
const phase=(id:string,title:string,focus:string,record:string,procedureNeeded=true):JobPhase=>({id,title,focus,record,procedureNeeded});
export const workshopJobs:JobDefinition[]=[
 {kind:'frame',title:'Frame strip & rebuild',description:'Keep removal, inspection and reassembly records together.',phases:[
  phase('identify','Plan the job','Identify the bike and installed parts. Gather the matching removal and installation procedures before dismantling.','Goal, installed components, service references and available tools.',false),
  phase('baseline','Capture the assembled bike','Record routing, spacers, orientation and existing faults while the bike is complete.','Photo references, cable/hose routing and existing damage.',false),
  phase('isolate','Prepare and isolate','Use the exact-model procedure for support, fuel, electrical and fluid preparation.','Isolation performed, fluids handled and support arrangement.'),
  phase('body','Bodywork and external systems','Follow the applicable sequence for bodywork, tank, intake and exhaust. Keep hardware with its assembly.','Labeled parts, seals to replace and connections.'),
  phase('rolling','Wheels, controls and suspension','Follow the component procedures while maintaining stable support.','Spacers, bearing condition, brake/controls routing and removed assemblies.'),
  phase('powerunit','Power unit and frame','Use the engine-removal sequence and lifting/support requirements for this model.','Mount order, brackets, ground connections and bare-frame findings.'),
  phase('inspect','Inspection and repair decisions','Separate measured condition from replacement decisions. Compare measurements with applicable limits.','Measurements, sources, damaged parts and unresolved findings.'),
  phase('assemble','Reassemble by procedure','Work through the exact installation sequence, recording joint preparation, replacement hardware and tightening stages.','Installed parts and completed joint checks; do not reuse a value by bolt size.'),
  phase('static','Static checks','Complete the model-specific controls, routing, fluid and fastener checks before operation.','Free movement, leaks, brakes, throttle return and procedure checks.'),
  phase('return','Return to service','Use the applicable startup and post-service inspection instructions. Record findings and follow-up work.','Completed verification and outstanding work.') ]},
 {kind:'engine',title:'Engine rebuild',description:'Track the engine from initial checks to measured assembly.',phases:[
  phase('identify','Identify engine and scope','Record the exact engine, modifications and reason for rebuilding.','Engine identity, symptoms, hours and service reference.',false),
  phase('prepare','Prepare tools and parts','Match the required tools, holding fixtures and replacement parts to the selected procedure.','Tools, parts list, measurement equipment and missing items.',false),
  phase('remove','Remove and secure engine','Follow the exact engine-removal, draining and support procedure.','Connections, mount hardware, drained-fluid observations.'),
  phase('top','Top-end disassembly','Follow the timing, tensioner and top-end disassembly sequence for the installed engine.','Timing references, component order, photos and initial wear.'),
  phase('bottom','Bottom-end disassembly','Follow the applicable clutch, primary drive, crankcase and transmission sequence.','Shaft/shim locations, press/heat requirements and replacement items.'),
  phase('measure','Measure and decide','Use the specified measurement method, location and limits for each component.','Actual measurements, source limits, reuse/replace decisions and conflicts.'),
  phase('lowerassembly','Assemble lower engine','Use the exact assembly order, lubrication, sealant, bearing and tightening requirements.','Clearances, end play, shaft movement, joint preparation and tightening stages.'),
  phase('upperassembly','Assemble top end','Use the exact piston, rings, valve train and timing instructions.','Orientation, ring checks, timing verification and valve measurements.'),
  phase('install','Install and pre-start checks','Use the matching engine-installation and pre-start inspection procedure.','Mounts, connections, fluids and verification findings.'),
  phase('verify','Startup and service record','Use the specified first-start, leak checks and post-rebuild instructions.','Startup observations, follow-up inspection and service hours.') ]},
 {kind:'fork',title:'Fork service',description:'Keep each leg, component and setting identified.',phases:[
  phase('identify','Identify the installed fork','Record maker, model, part numbers and aftermarket changes; the bike year alone may not identify the internals.','Exact fork/cartridge, current settings and service reference.',false),
  phase('prepare','Prepare service equipment','Match tools, seals, fluids and pressure-handling requirements to the exact fork.','Tools, consumables, fluid specification and missing equipment.',false),
  phase('remove','Remove and release stored pressure','Follow the component-specific removal and pressure-release procedure.','Leg identity, baseline settings and completed pressure-release steps.'),
  phase('strip','Disassemble and inspect','Keep left/right assemblies separate and follow the exact cartridge and seal procedure.','Stack/order references, wear, damage and measurements.'),
  phase('assemble','Assemble, fill and bleed','Use the component-specific assembly, fill, bleed and closure sequence.','Replacement parts, fluid measurement method and completed bleed checks.'),
  phase('install','Install and align','Follow the exact clamp, axle and alignment procedure; use joint-specific values.','Alignment, free movement, leaks and initial settings.'),
  phase('verify','Verify and record','Complete the component post-service checks before evaluating damping.','Checks, final settings and ride observations.') ]},
 {kind:'shock',title:'Shock service',description:'Track the shock’s identity, service and setup.',phases:[
  phase('identify','Identify shock and scope','Record exact shock identity, spring and modifications.','Shock part number, spring, baseline and service reference.',false),
  phase('prepare','Prepare equipment','Check the component procedure for spring handling, pressure release, charging and bleed equipment.','Required fixtures, charging/bleed equipment and missing items.',false),
  phase('remove','Remove and release stored energy','Follow the exact shock procedure for spring and gas pressure handling before opening.','Completed pressure/spring procedure and component identification.'),
  phase('strip','Disassemble and inspect','Follow the shaft, seal head, piston and reservoir instructions for this component.','Shim stack/order references, wear, measurements and replacement decisions.'),
  phase('assemble','Assemble, bleed and charge','Use the exact fluid, bleed, gas specification and charging procedure.','Assembly checks, bleed result and charging record.'),
  phase('install','Install and set baseline','Use the exact mounting procedure and the recorded or verified setup.','Mount checks, free movement, baseline and measured sag.'),
  phase('verify','Verify service','Complete applicable leak, function and installation checks.','Verification and ride results.') ]},
 {kind:'clickers',title:'Dial in clickers',description:'Baseline → one change → repeat the test → keep or revert.',phases:[
  phase('baseline','Save the baseline','Record installed suspension and the current settings before changing anything.','Adjuster names, current values/units, component identity and source.',false),
  phase('symptom','Choose one problem','Describe what happens, where in the travel or track, and under which conditions.','Surface, pace, rider/load, tire setup, sag and repeatable symptom.',false),
  phase('condition','Check mechanical condition','Resolve leaks, damage, binding or other mechanical faults before tuning around them.','Observed condition, inspections performed and unresolved faults.',false),
  phase('change','Make one documented change','Use the exact adjuster’s verified reference/direction. Record one changed setting and keep the rest fixed.','Which adjuster, before/after setting, units and verified direction.'),
  phase('test','Repeat the same comparison','Compare the same section and conditions, stopping if control deteriorates.','Better, worse or unchanged; what changed in the bike’s behavior.',false),
  phase('decision','Keep, revert or test again','Keep a helpful setting or return to the recorded baseline. Record the result before the next experiment.','Final setting, result and the next question.',false) ]}
];
export type PhaseRecord={notes:string;completed_at:string|null};
export type SettingTrial={id:string;adjuster:string;before:string;after:string;unit:string;conditions:string;result:'untested'|'better'|'worse'|'unchanged';notes:string;decision:'pending'|'keep'|'revert';created_at:string};
export type WorkshopJournal={version:1;id:string;owner_id:string;bike_id:string;build_identity:string;kind:JobKind;phase_index:number;records:Record<string,PhaseRecord>;reference:string;measurements:string;parts:string;trials:SettingTrial[];created_at:string;updated_at:string};
export function definition(kind:JobKind){const job=workshopJobs.find(j=>j.kind===kind);if(!job)throw Error('Unknown workshop job');return job;}
export function createJournal(bike:Bike,kind:JobKind,id:string,now=new Date().toISOString()):WorkshopJournal{definition(kind);return {version:1,id,owner_id:bike.user_id,bike_id:bike.id,build_identity:buildIdentity(bike),kind,phase_index:0,records:{},reference:'',measurements:'',parts:'',trials:[],created_at:now,updated_at:now};}
export function journalMatches(j:WorkshopJournal,bike:Bike){return j.owner_id===bike.user_id&&j.bike_id===bike.id&&j.build_identity===buildIdentity(bike);}
export function validateJournal(value:unknown,bike:Bike):WorkshopJournal|null{
 if(!value||typeof value!=='object')return null;const j=value as WorkshopJournal;
 if(j.version!==1||j.owner_id!==bike.user_id||j.bike_id!==bike.id||!workshopJobs.some(x=>x.kind===j.kind)||!Number.isInteger(j.phase_index)||j.phase_index<0||j.phase_index>=definition(j.kind).phases.length||typeof j.build_identity!=='string'||typeof j.id!=='string'||!j.records||typeof j.records!=='object'||Array.isArray(j.records)||!Array.isArray(j.trials)||j.trials.length>250)return null;
 if(['reference','measurements','parts','created_at','updated_at'].some(k=>typeof (j as any)[k]!=='string'))return null;
 if(Object.entries(j.records).some(([id,r])=>!definition(j.kind).phases.some(p=>p.id===id)||!r||typeof r.notes!=='string'||(r.completed_at!==null&&typeof r.completed_at!=='string')))return null;
 if(j.trials.some(t=>!t||['id','adjuster','before','after','unit','conditions','notes','created_at'].some(k=>typeof (t as any)[k]!=='string')||!['untested','better','worse','unchanged'].includes(t.result)||!['pending','keep','revert'].includes(t.decision))||j.trials.filter(t=>t.decision==='pending').length>1)return null;
 return j;
}
export function recordPhase(j:WorkshopJournal,notes:string,complete=false,now=new Date().toISOString()):WorkshopJournal{if(complete&&!notes.trim())throw Error('Record what you did before completing this phase.');const p=definition(j.kind).phases[j.phase_index];return {...j,records:{...j.records,[p.id]:{notes:notes.slice(0,8000),completed_at:complete?now:null}},updated_at:now};}
export function movePhase(j:WorkshopJournal,index:number):WorkshopJournal{if(!Number.isInteger(index)||index<0||index>=definition(j.kind).phases.length)throw Error('Invalid phase');return {...j,phase_index:index,updated_at:new Date().toISOString()};}
export function saveTrial(j:WorkshopJournal,trial:SettingTrial):WorkshopJournal{
 if(!trial.adjuster.trim()||!trial.before.trim()||!trial.after.trim()||!trial.unit.trim())throw Error('Record the adjuster, before/after settings and units.');
 if(trial.result==='untested'&&trial.decision!=='pending')throw Error('Record the test result before choosing keep or revert.');
 if(trial.decision==='pending'&&j.trials.some(t=>t.id!==trial.id&&t.decision==='pending'))throw Error('Finish the current comparison before starting another setting change.');
 if(j.trials.some(t=>t.id===trial.id))return {...j,trials:j.trials.map(t=>t.id===trial.id?trial:t),updated_at:new Date().toISOString()};
 if(j.trials.length>=250)throw Error('Start a new tuning journal to keep this session manageable.');
 return {...j,trials:[...j.trials,trial],updated_at:new Date().toISOString()};
}
export function journalSummary(j:WorkshopJournal){const d=definition(j.kind);return [d.title,`Current phase: ${d.phases[j.phase_index].title}`,`Reference: ${j.reference||'Not recorded'}`, ...d.phases.flatMap(p=>j.records[p.id]?[`${p.title} (${j.records[p.id].completed_at?'rider recorded complete':'in progress'}): ${j.records[p.id].notes}`]:[]),`Measurements: ${j.measurements||'None recorded'}`,`Parts / hardware: ${j.parts||'None recorded'}`,...j.trials.map(t=>`${t.adjuster}: ${t.before} → ${t.after} ${t.unit}; ${t.conditions}; result ${t.result}; decision ${t.decision}; ${t.notes}`)].join('\n');}
