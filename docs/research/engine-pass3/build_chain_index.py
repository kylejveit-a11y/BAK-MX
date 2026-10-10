import json,hashlib
from pathlib import Path
R=Path(__file__).parent
def read(p):return json.loads(p.read_text())
def ref(slug,start=None,end=None,external=False):
 p=R.parent/'frame-pass3/engine-remove-refit-v1.procedure.json' if external else R/(slug+'.procedure.json')
 d=read(p);ids=[s['id'] for s in d['steps']]
 a=ids.index(start) if start else 0;b=ids.index(end) if end else len(ids)-1
 assert a<=b
 return dict(path=('../frame-pass3/'+p.name if external else p.name),procedure_id=d['id'],sha256=hashlib.sha256(p.read_bytes()).hexdigest(),step_ids=ids[a:b+1],source_entry_state=d.get('entry_state',d.get('preflight',[])),source_exit_state=d.get('exit_state',[]))
def phase(i,title,refs,entry,exit):return dict(id=i,title=title,depends_on=[],references=refs,entry_state=entry,exit_state=exit)
def link(phases):
 for n,p in enumerate(phases):p['depends_on']=[] if n==0 else [phases[n-1]['id']]
 return phases
common_out=phase('engine-out','Remove the engine',[ref('', 'initial-record','engine-out',True)],'Assembled stock cold bike; planned repair scope and parts/tools reviewed.','Engine removed and supported, fluids drained, external interfaces disconnected.')
cams_out=phase('cams-out','Record cold clearances and remove cams',[ref('cams-remove-bench-v1')],'Removed engine with left cover/rotor intact.','Cams/tensioner out, original positions retained, chain secured.')
head_out=phase('head-out','Remove and inspect head',[ref('head-remove-refit-bench-v1','entry','inspect')],'Cams out and head interfaces already detached.','Head removed, guide/dowels retained, head warpage/condition recorded.')
piston_out=phase('piston-out','Remove and inspect cylinder/piston',[ref('cylinder-piston-bench-v1','entry','parts')],'Head removed; crank supported.','Cylinder/piston removed; dimensions and part-replacement decision recorded.')
head_service=phase('head-service','Inspect and reseal serviceable original valves',[ref('head-valve-inspect-reseal-bench-v1'),ref('camshaft-inspection-bench-v2')],'Head on bench; original valves/guides expected reusable pending measurement.','Valve/cam inspection results recorded; serviceable original valves resealed. Any machining/replacement fault remains unresolved until separately completed.')
piston_in=phase('piston-in','Install measured piston/rings/cylinder',[ref('cylinder-piston-bench-v1','rings-install','cylinder-install')],'Closed serviceable lower engine; chosen piston/cylinder pair measured and accepted.','Piston/rings/cylinder installed; both new clips and new base gasket present.')
head_in=phase('head-in','Install and tighten cylinder head',[ref('head-remove-refit-bench-v1','repair','small')],'Cylinder installed; required head repair/inspection complete.','Head sealed with recorded staged torque/angles; cams remain out.')
cams_in=phase('cams-in','Time the top end and verify clearances',[ref('cams-install-bench-v1')],'Head ready; rotor/left cover installed; inspected stock cams/tensioner.','Timing and four cold clearances accepted; cover/plug/service access closed.')
engine_in=phase('engine-in','Refit and commission the engine',[ref('','bench-record','final-checks',True)],'Bench work actually complete with accepted inspection, timing and clearance records.','Engine installed; source-prescribed oil/coolant/routing/throttle/idle checks recorded.')
top=link([common_out,cams_out,head_out,piston_out,head_service,piston_in,head_in,cams_in,engine_in])
bottom=link([
phase('engine-out','Remove engine',[ref('','initial-record','engine-out',True)],'All full-overhaul preflight dependencies resolved including clutch preparation.','Engine on bench.'),
phase('cams-out','Remove cams',[ref('cams-remove-bench-v1')],'Left rotor/cover intact.','Cams out.'),
phase('head-out','Remove head',[ref('head-remove-refit-bench-v1','entry','inspect')],'Cams out.','Head on bench.'),
phase('piston-out','Remove and inspect cylinder/piston',[ref('cylinder-piston-bench-v1','entry','parts')],'Head out.','Piston/cylinder removed.'),
phase('pack-out','Open clutch and remove plate stack',[ref('clutch-pack-bench-v1','cover','pack-out')],'Oil drained.','Clutch pack removed; center nut still installed.'),
phase('basket-out','Remove clutch basket — source conflict must already be resolved',[],'Exact nut preparation conflict resolved before teardown.','Basket/idle gear removed under the future resolved basket operation.'),
phase('right-cover-out','Open right cover',[ref('right-cover-bench-v1','entry','remove')],'Clutch cover off; fluids drained.','Right cover off.'),
phase('primary-out','Remove primary/balancer gears',[ref('primary-balancer-bench-v1','entry','oneway')],'Right cover/idle gear off.','Primary/balancer stacks removed and inspected.'),
phase('pump-out','Remove oil pump',[ref('oil-pump-bench-v1','entry','inspect')],'Pump drive gear off.','Oil pump removed and assessed.'),
phase('selector-out','Remove selector',[ref('shift-mechanism-bench-v1','entry','inspect')],'Idle gear off.','Shift segment/shaft removed.'),
phase('generator-out','Remove generator',[ref('generator-bench-v1','entry','inspect')],'Cams already out.','Left cover/stator/rotor removed.'),
phase('cases-open','Split crankcases',[ref('crankcase-bench-v2','entry','split')],'All named opening dependencies complete.','Right case separated; shafts remain left.'),
phase('transmission-out','Remove and inspect transmission',[ref('transmission-bench-v1','entry','gear-check')],'Right case off.','Transmission removed and assessed.'),
phase('crank-out','Remove and measure crank assembly',[ref('crankshaft-assembly-bench-v1','entry','width')],'Transmission out.','Crank/balancer removed and inspected.'),
phase('case-service','Service empty cases',[ref('crankcase-bench-v2','internals-out','retainers')],'Both shafts and crank removed.','Cases clean, bearings/seal/retainers serviced.'),
phase('crank-in','Install complete crank assembly',[ref('crankshaft-assembly-bench-v1','install','balancer-in')],'Case bearings ready.','Crank/balancer seated in left case.'),
phase('transmission-in','Assemble and install transmission',[ref('transmission-bench-v1','main-stack','function')],'Accepted parts, left case ready.','Transmission assembled and selection checked.'),
phase('cases-close','Close cases and restore lower chain',[ref('crankcase-bench-v2','internals-in','lower-chain')],'Crank and transmission installations verified.','Cases sealed; nozzles/strainer/chain/guide restored.'),
phase('pump-in','Assemble and install oil pump',[ref('oil-pump-bench-v1','inner','mount')],'Cases closed; assessed pump ready.','Pump mounted and turning smoothly.'),
phase('primary-in','Install and time primary/balancer',[ref('primary-balancer-bench-v1','driven','lock')],'Pump installed.','Gears timed/torqued/locked.'),
phase('selector-in','Install selector',[ref('shift-mechanism-bench-v1','stopper','pedal')],'Transmission and case closed.','Selector installed and movement checked.'),
phase('water-pump','Service removed-cover water pump',[ref('water-pump-bench-v1')],'Right cover on bench.','Pump bearings/seals renewed; cover ready.'),
phase('right-cover-in','Install right cover',[ref('right-cover-bench-v1','service','filter')],'All enclosed right-side work complete.','Right cover/filter/filler sealed.'),
phase('basket-in','Install clutch basket — held until source conflict resolves',[],'Resolved exact nut preparation and approved basket operation available.','Basket installed, washer freedom/75Nm/staking recorded.'),
phase('pack-in','Inspect and install clutch pack',[ref('clutch-pack-bench-v1','friction','close')],'Basket operation actually complete.','Plate stack and cover installed.'),
phase('generator-in','Install generator and left cover',[ref('generator-bench-v1','stator-install','cover-install')],'Crank/cases assembled.','Rotor/cover timing reference restored.'),
phase('head-service','Service head/cams',[ref('head-valve-inspect-reseal-bench-v1'),ref('camshaft-inspection-bench-v2')],'Removed head with original positions retained.','Head/cam reuse path accepted or separate replacement/machining completed.'),
phase('piston-in','Install cylinder/piston',[ref('cylinder-piston-bench-v1','rings-install','cylinder-install')],'Lower engine closed and chain restored.','Cylinder installed.'),
phase('head-in','Install head',[ref('head-remove-refit-bench-v1','repair','small')],'Head repairs complete.','Head torqued.'),
phase('cams-in','Time and close top end',[ref('cams-install-bench-v1')],'Left timing marks available.','Timing/clearances pass.'),
phase('engine-in','Install and commission engine',[ref('','bench-record','final-checks',True)],'All bench operations actually completed.','Installed engine with required startup checks recorded.')])
d=dict(schema_version=1,id='yamaha-2026-yz450f-engine-chain-index-v1',target=read(R/'cams-remove-bench-v1.procedure.json')['target'],status='SOURCE_REVIEWED_PHASE_INDEX_NOT_A_RUNTIME_EXECUTOR',automatic_execution_allowed=False,composition_rules=['Resolve preflight blockers before any teardown.','Expand exact referenced step ranges in phase order; never execute a whole remove/refit guide before interior work.','Do not mark omitted source steps complete; mark them outside this phase or NOT_PERFORMED.','Re-evaluate physical entry/exit states at every phase boundary; matching part names alone do not close a dependency.','A failed inspection requires the documented replacement/repair route and cannot be bypassed by saving a note.','Preserve required observation/timing/torque records; routine checks remain Checked.','This index cannot by itself certify a complete engine rebuild.'],routes=[dict(id='top-end-stock-reuse',status='REVIEWED_PHASE_COMPOSITION_REQUIRES_RUNTIME_INTEGRATION',scope='Exact stock top-end removal/inspection/reseal/rebuild where original valves/guides/seats remain serviceable; cylinder/piston set replacement supported with actual-fit checks.',preflight=['Review head-service replacement/machining contingency before opening.','Obtain correct new seals/gaskets/clips and measuring tools.','Configured exact YDT with its supplied operation instructions is an equipment prerequisite for final temperature/idle check.'],phases=top),dict(id='full-engine',status='HELD_BEFORE_TEARDOWN',scope='Planned full engine assembly overhaul, including OEM complete-crank replacement rather than rod-pin pressing.',preflight_blockers=['Clutch boss preparation: oil inPDF58/258 versusLT arrow inPDF259. Must resolve before engine disassembly requiring basket removal.','Head repair branch: seat cutting/guide finishing must have an approved component-specific method if inspection requires it.','Unspecified oil-relief-valve internal overhaul beyond retaining the installed assembly is not represented as completed.'],phases=bottom)],held_artifact='clutch-basket-overhaul-held-v1.json')
(R/'engine-chain-index-v1.json').write_text(json.dumps(d,indent=2)+'\n',encoding='utf-8')
for route in d['routes']:
 for ph in route['phases']:
  for rr in ph['references']:
   p=(R/rr['path']).resolve();assert hashlib.sha256(p.read_bytes()).hexdigest()==rr['sha256']
print('PASS: two engine phase routes; source step ranges/hash bindings validated; full-engine route held before teardown')
