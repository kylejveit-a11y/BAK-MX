"""Compose immutable reviewed cutpoints; never rerun parent research generators."""
import copy,hashlib,json
from pathlib import Path
R=Path(__file__).parent
ENGINE=R.parent
REPO=R.parents[3]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write_new(name,d):
 p=R/name;raw=(json.dumps(d,ensure_ascii=True,indent=2)+'\n').encode()
 if p.exists():
  if p.read_bytes()==raw:return
  raise RuntimeError('Frozen artifact differs; create a new version: '+name)
 p.write_bytes(raw)
indexpath=ENGINE/'engine-chain-index-v1.json'
index=read(indexpath)
route=next(r for r in index['routes'] if r['id']=='top-end-stock-reuse')
steps=[];dependencies={};sources=[];phases=[];adaptations=[]
def dependency(p,kind='source_reviewed_cutpoint_composition'):
 key=p.resolve().relative_to(REPO.resolve()).as_posix()
 dependencies[key]={'artifact':key,'sha256':sha(p),'kind':kind}
 return key
dependency(indexpath,'source_reviewed_phase_index')
def append_steps(path,source_ids,prefix):
 d=read(path);sources.append(d);key=dependency(path)
 by={s['id']:s for s in d['steps']}
 for sid in source_ids:
  s=copy.deepcopy(by[sid]);s['id']=prefix+'--'+sid
  s['depends_on']=[]
  if isinstance(s.get('verification'),str):s['verification']=[s['verification']]
  s['source_operation']={'artifact':key,'sha256':sha(path),'procedure_id':d['id'],'step_id':sid}
  # The only branch in this composite is authored and reviewed below.
  s.pop('branches',None)
  steps.append(s)
 return [prefix+'--'+i for i in source_ids]

for phase in route['phases']:
 pids=[]
 for n,rr in enumerate(phase['references']):
  path=(ENGINE/rr['path']).resolve();assert sha(path)==rr['sha256'],path
  prefix=phase['id'] if len(phase['references'])==1 else phase['id']+'-'+str(n+1)
  if phase['id']=='cams-in':
   # First installation/measurement, then optional supported adjustment, then closure.
   ids=rr['step_ids'];split=ids.index('remeasure')
   pids+=append_steps(path,ids[:split+1],prefix)
   original=REPO/'docs/research/expansion/yamaha/workshop-pass2/valve-adjustment-v3.procedure.json'
   adjustment=read(original);aids=[s['id'] for s in adjustment['steps']]
   selected=aids[aids.index('adjustment-scope'):aids.index('remeasure')+1]
   pids+=append_steps(original,selected,'clearance-adjust')
   pids+=append_steps(path,ids[split+1:],prefix)
  else:pids+=append_steps(path,rr['step_ids'],prefix)
 phases.append({'id':phase['id'],'title':phase['title'],'step_ids':pids,'entry_state':[phase['entry_state']],'exit_state':[phase['exit_state']]})

by={s['id']:s for s in steps}
def adapt(i,instruction,reason):
 adaptations.append({'step_id':i,'reason':reason,'original_instruction':by[i]['instruction']})
 by[i]['instruction']=instruction
adapt('engine-out--initial-record',
 'Record the exact stock engine identity, running condition and reason for this top-end work. Photograph hose, electrical and bracket routing before access. Prepare an independently supported engine bench and a controlled lift with a helper. This route retains serviceable original head, caps, cams, valves, guides and seats; it includes cylinder/piston checks, stem-seal renewal and supported pad adjustment. Review its repair exclusions before opening the engine.',
 'Context changed from engine-assembly removal to source-composed top-end operation; no mechanical values changed.')
adapt('cams-in--entry',by['cams-in--entry']['instruction']+' Support the removed engine independently throughout the bench work.',
 'Connects the installation cutpoint to the existing removed-engine state.')
adapt('cams-in--remeasure',
 'At the verifiedTDC position with the engine still at room temperature, measure between each cam lobe and its lifter. Record all four results. Intake range is0.10–0.17mm; exhaust0.15–0.22mm. Keep these actual readings for the following adjustment decision. An unresolved measurement must be resolved before selecting a path; an out-of-range value requires adjustment before closure.',
 'First measurement now feeds the source-reviewed adjustment contingency instead of an unconditional closure.')
decision=by['clearance-adjust--adjustment-scope']
decision['instruction']='Compare the four just-recorded cold clearances with intake0.10–0.17mm and exhaust0.15–0.22mm. If all four meet their range, choose “All four readings are in range — close up.” Otherwise continue only for definite out-of-range readings with serviceable original stock valve-train parts and readable, supported OEM pad-chart inputs. Uncertain readings, unsupported pad numbers or a failed mechanical inspection are unresolved repair conditions; do not continue into assembly on a guess.'
decision['record_required']=True
decision['branches']=[{'id':'within-range','label':'All four readings are in range — close up','next_step':'cams-in--cover-install','condition':'All four just-recorded cold readings are within intake0.10–0.17mm and exhaust0.15–0.22mm; no additional cam/tensioner/pad work is needed.'}]
adaptations.append({'step_id':decision['id'],'reason':'Reuses the reviewed v3 all-in-range branch after the composite initial timing/measurement; explicit destination is the shared cover closure.','original_instruction':next(s['instruction'] for s in adjustment['steps'] if s['id']=='adjustment-scope')})
adapt('clearance-adjust--remeasure',by['clearance-adjust--remeasure']['instruction']+' If any result is still outside range, stop this run at the open-head measurement state and resolve the adjustment; do not advance to cover closure or engine startup.',
 'Makes the final adjustment failure state explicit; no backward loop or false completion is implied.')
adapt('engine-in--bench-record',
 'Save this top-end job record before reinstalling the engine: head fastener stages, piston/cylinder fit, ring/pin checks, original-valve/cam inspection decisions, all four accepted final cold clearances and hand-rotation timing verification. Inspect mounting brackets, bolts and contact surfaces. Continue only when every required result is accepted and the cover, plug and service-access closures are complete. The crankcases, clutch basket and gearbox remained assembled during this route.',
 'Replaces the standalone interface guide’s separate-job placeholder with this composite’s actual internal inspection record.')
adapt('engine-in--final-checks',by['engine-in--final-checks']['instruction'].replace('Engine installation completion does not substitute for an internal rebuild record.','Save the accepted top-end measurements with these installation checks. This records only the work actually performed; bottom-end or head-machining work is not included.'),
 'Final completion names the actual composite scope.')

adapt('head-in--repair','Confirm the original head, matching caps, cams, valves, guides and seats passed every included inspection, and that the installed cylinder/piston pair has an accepted recorded actual fit. Continue to head installation only with those results complete. If machining, resurfacing, valve/guide replacement, seat repair or head/cap/cam replacement is required, stop this operation with the engine open for a separately reviewed repair; those operations are excluded here. Saving a note does not turn a failed inspection into a pass.',
 'Independent composition review removed inherited head-machining/valve-guide replacement directions because the composite explicitly retains the original serviceable head and valve train.')

for n,s in enumerate(steps):s['depends_on']=[] if n==0 else [steps[n-1]['id']]
skipids=[s['id'] for s in steps[steps.index(decision)+1:steps.index(by['cams-in--cover-install'])]]
assert skipids and all(i.startswith('clearance-adjust--') for i in skipids)

def unique_objs(key):
 result=[];seen=set()
 for d in sources:
  for x in d.get(key,[]):
   x=copy.deepcopy(x) if isinstance(x,dict) else {'name':x}
   k=json.dumps(x,sort_keys=True)
   if k not in seen:result.append(x);seen.add(k)
 return result
parts=unique_objs('required_parts')
# No instruction to purchase replacements that this retained-head route cannot fit.
parts=[p for p in parts if p.get('name') not in ['Exact stock replacement cams/head-cap set/chain if inspection requires']]
pages=sorted({p for s in steps for p in s['source_pdf_pages']}|{7,56})
printed=[]
for src in sources:
 for p in src['source']['printed_pages']:
  if p not in printed:printed.append(p)
target=index['target']
out={'schema_version':1,'id':'yamaha-2026-yz450f-top-end-stock-reuse-v1','target':target,'scope_confirmed':True,
 'title':'Rebuild the stock top end',
 'status':'SOURCE_REVIEWED_BOUNDED_PROCEDURE','publication_status':'LOCAL_REVIEWED_NOT_IMPORTED',
 'completeness':'Complete assembled-bike engine removal, stock top-end disassembly/inspection, stem-seal and cylinder/piston work, supported pad adjustment when needed, timing verification, engine refit and commissioning. Original head/caps/cams/valves/guides/seats must remain serviceable. Failed repair branches remain unresolved rather than being marked complete.',
 'source':{'source_url':sources[0]['source']['source_url'],'document_sha256':sources[0]['source']['document_sha256'],'document_revision':sources[0]['source']['document_revision'],'pdf_pages':pages,'printed_pages':printed,'review_status':'APPROVED','review_note':'Composed from immutable visually reviewed operation cutpoints and the v3 supported shim-adjustment branch. Context-only adaptations are separately recorded. No inferred mechanical values or model-year inheritance.'},
 'applicability':{'included':'Exact standard-US2026 YZ450F stock configuration; original serviceable head/caps/cams/valves/guides/seats; exact stock piston/cylinder/ring replacement with measured fit when needed.','excluded':['Other years or variants; aftermarket engine/valve-train parts.','Head/cap/cam replacement, guide pressing/reaming, seat cutting, lapping or head resurfacing.','Rebore/replate or aftermarket ring filing.','Unsupported OEM pad-chart inputs, unreadable pad numbers, blank cells, interpolation, last-digit3/7 rounding.','Crankcase splitting, crankshaft/gearbox/clutch-basket rebuild; conflicted clutch boss nut remains untouched.'],'year_inheritance':'NONE'},
 'affected_components':['engine','cylinder_head','cams','valves','piston','cylinder'],
 'entry_state':['Assembled exact stock bike, engine stopped; all tools/parts and repair exclusions reviewed before teardown.','Original head/caps/cams/valves/guides/seats must prove serviceable by the included inspection. A failed item requires a separate repair route before this operation can complete.'],
 'exit_state':['Engine refitted with actual top-end work recorded; required measurements and four final cold clearances accepted; timing verified by hand.','Source-prescribed oil/coolant checks, routing, throttle return/freeplay, chain slack, mounts and startup/idle checks recorded.','Crankcases, clutch basket and gearbox remain assembled throughout this top-end operation.'],
 'preflight':['Read the operation scope and identify exact stock parts before draining or opening the bike.','Have all replacement gaskets/seals/clips, specified lubricants/sealants and calibrated tools available.','Prepare an engine support and helper for controlled removal/refit.','Configured correct YDT plus its supplied instructions and required support equipment must be available for the final source-prescribed temperature/idle check.','If inspection finds worn head/guide/seat/cam parts, this run pauses for a separately reviewed repair; saving a note does not bypass a failed inspection.','Pad adjustment uses only readable supported OEM chart entries. Chart gaps are unresolved, not extrapolated.'],
 'required_tools':unique_objs('required_tools'),'required_parts':parts,
 'critical_stop_conditions':['Any failed valve/guide/seat/head/cam inspection or unaccepted piston/cylinder fit.','Unsupported pad selection or any unresolved/out-of-range final cold clearance.','Abnormal hand-rotation resistance, incorrect timing, lost chain engagement or foreign material in engine.','Fuel/fluid leak, missing hardware, trapped routing, unsupported engine/swingarm or failed throttle return.','Required temperature/idle equipment unavailable before planned commissioning.'],
 'operation_dependencies':list(dependencies.values()),'phases':phases,
 'branch_completion_policy':{'within-range':{'skipped_step_ids':skipids,'skipped_status':'NOT_PERFORMED','operation_result':'TOP_END_REBUILT_CLEARANCE_ADJUSTMENT_NOT_NEEDED','required_observations':['intake1','intake2','exhaust1','exhaust2'],'rule':'Branch skips only the additional adjustment work. Earlier removal/rebuild/timing work remains performed. Never fabricate completion of skipped steps.'}},
 'steps':steps,'reviewed_at':'2026-09-13','runtime_integration_requirement':'Enforce the declared forward branch and required observations. A failed inspection or final clearance cannot become complete by ordinary advancement. The all-in-range branch marks additional adjustment steps NOT_PERFORMED.'}
write_new('top-end-stock-reuse-v1.procedure.json',out)
write_new('composition-review-v1.json',{'schema_version':1,'status':'SOURCE_REVIEWED_COMPOSITION','procedure_id':out['id'],'source_index_sha256':sha(indexpath),'step_count':len(steps),'phase_count':len(phases),'adaptations':adaptations,'branch':decision['branches'][0],'additional_adjustment_steps_skipped_when_in_range':skipids,'frozen_source_artifacts_unchanged':True,'review_checks':['Engine-out before cams/head; refit only after accepted internal timing/measurements.','Rotor/left cover retained throughout top-end route for timing marks.','Head and cylinder removal/refit cutpoints separated around bench inspections.','Extra cam/tensioner/pad work bypassed explicitly only for four accepted initial cold readings.','Second clearance measurement must pass before shared closure.','Clutch-basket nut untouched; full bottom-end conflict does not authorize changing that nut.']})
manifest={'schema_version':1,'id':'engine-pass3-continuation-reviewed-procedures','reviewed_at':'2026-09-13','database_writes':False,'sources':[{'id':'yamaha26','url':out['source']['source_url'],'local_pdf_path':'C:/Users/kylej/AppData/Local/Temp/D03-2819U-10_02.pdf','sha256':out['source']['document_sha256']}],'artifacts':[{'path':'top-end-stock-reuse-v1.procedure.json','kind':'procedure','sha256':sha(R/'top-end-stock-reuse-v1.procedure.json'),'source_id':'yamaha26','target':target}]}
write_new('source-review-manifest.json',manifest)
print(json.dumps({'procedure':out['id'],'steps':len(steps),'phases':len(phases),'skip_steps':len(skipids),'sha256':manifest['artifacts'][0]['sha256']}))
