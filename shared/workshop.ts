import type {Bike} from './types.ts';
import {buildIdentity} from './bike-identity.ts';

export type JobKind='frame'|'engine'|'fork'|'shock'|'clickers';
export type JobPhase={id:string;title:string;focus:string;record:string;procedureNeeded:boolean};
export type JobDefinition={kind:JobKind;title:string;description:string;phases:JobPhase[]};
const phase=(id:string,title:string,focus:string,record:string,procedureNeeded=true):JobPhase=>({id,title,focus,record,procedureNeeded});
export const workshopJobs:JobDefinition[]=[
 {kind:'frame',title:'Frame strip & rebuild',description:'Keep removal, inspection and reassembly records together.',phases:[
  phase('identify','Plan the job','Confirm what’s fitted to your bike before you pull it apart, and have the right removal and refit steps to hand.','Goal, installed components, service references and available tools.',false),
  phase('baseline','Capture the assembled bike','While it’s still together: note how cables and hoses run, which way spacers go, and anything already broken.','Photo references, cable/hose routing and existing damage.',false),
  phase('isolate','Prepare and isolate','Get the bike on a stand the way your model wants it; deal with fuel, the battery and fluids before anything comes off.','Isolation performed, fluids handled and support arrangement.'),
  phase('body','Bodywork and external systems','Plastics, tank, airbox and pipe off in your bike’s order. Keep each bolt with the part it came off.','Labeled parts, seals to replace and connections.'),
  phase('rolling','Wheels, controls and suspension','Wheels, controls and suspension off one assembly at a time, with the bike steady on the stand throughout.','Spacers, bearing condition, brake/controls routing and removed assemblies.'),
  phase('powerunit','Power unit and frame','Engine out in your model’s order, with the lift or support it calls for.','Mount order, brackets, ground connections and bare-frame findings.'),
  phase('inspect','Inspection and repair decisions','Measure first, decide second. Put each number next to its limit before you call a part good or done.','Measurements, sources, damaged parts and unresolved findings.'),
  phase('assemble','Reassemble by procedure','Back together in the refit order, noting what you cleaned or greased, what’s new, and each torque stage as you go.','Installed parts and completed joint checks; do not reuse a value by bolt size.'),
  phase('static','Static checks','Before it runs: controls, routing, fluids and fasteners checked the way your model lists them.','Free movement, leaks, brakes, throttle return and procedure checks.'),
  phase('return','Return to service','First start and the after-service checks, with anything still to do written down.','Completed verification and outstanding work.') ]},
 {kind:'engine',title:'Engine rebuild',description:'Track the engine from initial checks to measured assembly.',phases:[
  phase('identify','Identify engine and scope','Which engine exactly, what’s been done to it, and why it’s coming apart.','Engine identity, symptoms, hours and service reference.',false),
  phase('prepare','Prepare tools and parts','Line up the tools, holding fixtures and new parts the job calls for before you start.','Tools, parts list, measurement equipment and missing items.',false),
  phase('remove','Remove and secure engine','Drain it, disconnect it and lift it out the way your model says.','Connections, mount hardware, drained-fluid observations.'),
  phase('top','Top-end disassembly','Top end off in order: timing marks, tensioner, then the rest, with photos as you go.','Timing references, component order, photos and initial wear.'),
  phase('bottom','Bottom-end disassembly','Clutch, primary drive, cases and gearbox apart in order, with every shim and shaft kept where it came from.','Shaft/shim locations, press/heat requirements and replacement items.'),
  phase('measure','Measure and decide','Measure each part the specified way, in the specified spot, against its limit.','Actual measurements, source limits, reuse/replace decisions and conflicts.'),
  phase('lowerassembly','Assemble lower engine','Bottom end back together in order: lube, sealant, bearings and torque stages as the procedure gives them.','Clearances, end play, shaft movement, joint preparation and tightening stages.'),
  phase('upperassembly','Assemble top end','Piston, rings, valves and timing by the book for this engine.','Orientation, ring checks, timing verification and valve measurements.'),
  phase('install','Install and pre-start checks','Engine back in, everything connected, and the pre-start checks done.','Mounts, connections, fluids and verification findings.'),
  phase('verify','Startup and service record','First start, leak checks and the break-in notes for a fresh rebuild.','Startup observations, follow-up inspection and service hours.') ]},
 {kind:'fork',title:'Fork service',description:'Keep each leg, component and setting identified.',phases:[
  phase('identify','Identify the installed fork','Which fork exactly: maker, model, part numbers and any aftermarket work. The bike’s year alone may not say what’s inside.','Exact fork/cartridge, current settings and service reference.',false),
  phase('prepare','Prepare service equipment','Seals, fluid, tools and anything needed to release pressure, matched to this exact fork.','Tools, consumables, fluid specification and missing equipment.',false),
  phase('remove','Remove and release stored pressure','Legs out and any stored pressure released the way this fork calls for, before anything opens.','Leg identity, baseline settings and completed pressure-release steps.'),
  phase('strip','Disassemble and inspect','Left and right kept apart. Cartridge and seals out in the order this fork uses.','Stack/order references, wear, damage and measurements.'),
  phase('assemble','Assemble, fill and bleed','Back together, filled, bled and closed in this fork’s order.','Replacement parts, fluid measurement method and completed bleed checks.'),
  phase('install','Install and align','Legs back in the clamps, axle fitted and aligned, each bolt to its own figure.','Alignment, free movement, leaks and initial settings.'),
  phase('verify','Verify and record','The after-service checks first, then judge how it feels.','Checks, final settings and ride observations.') ]},
 {kind:'shock',title:'Shock service',description:'Track the shock’s identity, service and setup.',phases:[
  phase('identify','Identify shock and scope','Which shock exactly, which spring, and any work already done to it.','Shock part number, spring, baseline and service reference.',false),
  phase('prepare','Prepare equipment','What this shock needs for the spring, releasing gas pressure, bleeding and recharging.','Required fixtures, charging/bleed equipment and missing items.',false),
  phase('remove','Remove and release stored energy','Spring off and gas pressure released the way this shock calls for, before it opens.','Completed pressure/spring procedure and component identification.'),
  phase('strip','Disassemble and inspect','Shaft, seal head, piston and reservoir apart and checked in this shock’s order.','Shim stack/order references, wear, measurements and replacement decisions.'),
  phase('assemble','Assemble, bleed and charge','The right fluid, a proper bleed, and gas back to this shock’s figure.','Assembly checks, bleed result and charging record.'),
  phase('install','Install and set baseline','Shock back in, and the setup back to what you recorded or checked.','Mount checks, free movement, baseline and measured sag.'),
  phase('verify','Verify service','Leak, movement and mounting checks before you ride it.','Verification and ride results.') ]},
 {kind:'clickers',title:'Dial in clickers',description:'Baseline → one change → repeat the test → keep or revert.',phases:[
  phase('baseline','Save the baseline','What’s on the bike and where every clicker sits now, before you touch anything.','Adjuster names, current values/units, component identity and source.',false),
  phase('symptom','Choose one problem','What the bike does, where in the stroke or on the track, and in what conditions.','Surface, pace, rider/load, tire setup, sag and repeatable symptom.',false),
  phase('condition','Check mechanical condition','Fix leaks, damage or binding first. Don’t tune around a fault.','Observed condition, inspections performed and unresolved faults.',false),
  phase('change','Make one documented change','One adjuster, one change, in the direction you’ve checked for it. Leave everything else alone.','Which adjuster, before/after setting, units and verified direction.'),
  phase('test','Repeat the same comparison','Same section, same conditions, back to back. Stop if it gets worse to control.','Better, worse or unchanged; what changed in the bike’s behavior.',false),
  phase('decision','Keep, revert or test again','Keep it if it helped, or go back to your baseline. Write the result down before the next change.','Final setting, result and the next question.',false) ]}
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
