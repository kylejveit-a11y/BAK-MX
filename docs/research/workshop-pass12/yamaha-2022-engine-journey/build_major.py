"""Compose approved 2022 top-end journey and narrowly corrected approved lower engine."""
import copy,hashlib,json,runpy
from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rd=lambda p:json.loads(p.read_text(encoding='utf-8'))
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
out=H/'major-engine-bike-journey-v1.procedure.json'
assert not out.exists() or rd(out)['source']['review_status']!='APPROVED'
runpy.run_path(str(H/'validate_lower_correction.py'))
locks=rd(H/'approved-dependencies.json')
for k in ['journey','corrected_lower','lower']:
 assert sha(R/locks[k]['artifact'])==locks[k]['sha256']
 assert rd(R/locks[k]['artifact'])['source']['review_status']=='APPROVED'
d=copy.deepcopy(rd(R/locks['journey']['artifact']));lower=rd(R/locks['corrected_lower']['artifact'])
d.update(id='yamaha-yz450f-2022-major-engine-bike-journey-v1',title='Major engine rebuild and bike reassembly',status='SOURCE_REVIEWED_COMPONENTS_PENDING_COMPOSITION_REVIEW',publication_status='NOT_IMPORTED',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['source']['review_status']='PENDING_INDEPENDENT_REVIEW'
d['source']['review_note']='Approved exact 2022 top-end journey plus corrected lower-engine snapshot. Original lower bytes and the two-field O-ring correction remain independently bound. New composition review pending.'
d['operation_dependencies']=[dict(artifact=locks[k]['artifact'],sha256=locks[k]['sha256'],kind='approved_source_operation') for k in ['journey','corrected_lower','lower']]
d['correction_dependencies']=[dict(artifact='docs/research/workshop-pass12/yamaha-2022-engine-journey/'+name,sha256=sha(H/name),kind='approved_narrow_correction') for name in ['lower-filter-oring-correction-v1.json','lower-correction-review-manifest.json']]
d['completeness']='Assembled-bike major engine route covering measured top end, sound retained cases, case bearings/seals, complete crank renewal, gearbox, oil pump, primary/balance drives, coil-spring clutch and starter-drive service, engine refit and required commissioning. Pressed crank internals and selected retained peripheral internals remain excluded; actual external closure and specialist work remain required.'
d['applicability']['included']='Exact stock US 2022 YZ450F with sound retained cases/head-caps and retained water-pump, starter-motor, stator and push-lever-bearing systems; measured stock renewal parts as required.'
d['applicability']['excluded']=[x for x in d['applicability']['excluded'] if not x.startswith('Lower timing-chain') and not x.startswith('Lower-engine crankcase')]
d['applicability']['excluded'] += [x for x in lower['applicability']['excluded'] if not x.startswith('Top-end removal/refit')]
d['affected_components']=sorted(set(d['affected_components']+lower['affected_components']))
d['prerequisites'] += [x for x in lower['preflight'] if not x.startswith('Arrange exact')]
d['prerequisites'] += ['Resolve the required matched cam-sprocket, chain and complete-crank replacement set before top-end closure if lower timing-drive inspection fails.','The initial fill after this crankcase disassembly is 0.90 L; the later post-break-in oil/filter service is 0.65 L, each followed by its own actual oil-flow and level checks.']
for f in ['required_tools','required_parts','critical_stop_conditions']:d[f]+=copy.deepcopy(lower[f])
d['remaining_gaps']=['Pressed connecting-rod/crank internals, damaged case-set replacement/machining, water-pump/starter-motor/stator internals and failed retained push-lever bearings remain outside this route.','Oil-check-bolt closure needs the actual documented exact-interface specification; ECU mounting conflict remains outside the retained-mount route.','Actual specialist seat work, tank-interior cleaning and inaccessible repaired-part checks remain required where applicable.','No physical bike validation has been performed.']
steps=[]
for s in d['steps']:
 steps.append(s)
 if s['id']=='topend-piston-out':
  for original in lower['steps']:
   r=copy.deepcopy(original);r['id']='lower-'+r['id'];r['origin']=dict(artifact=locks['corrected_lower']['artifact'],sha256=locks['corrected_lower']['sha256'],step_id=original['id'])
   for b in r.get('branches',[]):b['id']='lower-'+b['id'];b['next_step']='lower-'+b['next_step']
   steps.append(r)
rows={s['id']:s for s in steps};adaptations=[]
def change(id,instruction,verification,reason):
 s=rows[id];adaptations.append(dict(step_id=id,before=s['instruction'],after=instruction,reason=reason))
 s['instruction']=instruction;s['verification']=[verification];s['composition_adaptation']=reason
s=rows['topend-entry'];old='Retain assembled crankcases, clutch, gearbox, starter, generator and oil-pump systems.';assert old in s['instruction']
change(s['id'],s['instruction'].replace(old,'Keep the lower engine assembled until head, cylinder and piston removal. The lower-engine sequence then opens and closes its supported systems before top-end assembly resumes.'),s['verification'][0],'Replace retained-lower standalone scope with the ordered combined-engine boundary.')
s=rows['lower-entry'];change(s['id'],s['instruction'].replace('Arrange exact top-end closure, engine refitting and commissioning separately.','Continue with the top-end closure, engine refitting and commissioning steps in this journey after the lower-engine work.')+' Account for and remove the protective cloth placed below the piston before opening the crankcases. Keep openings clean between operations and account for every replacement cloth before closure.',s['verification'][0],'Close the piston-removal protective-cloth dependency before crankcase opening and retain the continuous later closure.')
s=rows['topend-cam-disposition'];old='This route does not remove the lower chain drive or replace the head/cap set; such failures require that repair before continuing.';assert old in s['instruction']
change(s['id'],s['instruction'].replace(old,'Cross-check the recorded lower-chain inspection and installed crank/chain against the cams selected here. Any required matched crank-sprocket, chain and cam set must now be complete and individually accepted; do not retain old cams when matched renewal is required. Head/cap-set replacement remains outside this route.'),s['verification'][0],'Carry lower timing-drive matched replacement decisions into cam selection.')
s=rows['access-engine-bench-record'];change(s['id'],s['instruction'].replace('actual completed top-end work:','actual completed lower-engine and top-end work:').replace('installed parts, piston/cylinder/ring','installed crank/chain/cam matched-set disposition, gear/shaft and case-bearing measurements, lower-drive/clutch torques and free movement, piston/cylinder/ring').replace('retained oil-filter closure','renewed oil-filter closure'),'Actual lower/top-end measurements, parts, matched timing components and cold timing accepted; covers/access plugs/filter closed; original swingarm side stacks supported.','Record actual combined repair results before installing the engine.')
s=rows['access-engine-oil-fill'];old='Record applicable oil quantity:.63L unchanged filter,.65L filter removal,.90L disassembled engine.';assert old in s['instruction']
change(s['id'],s['instruction'].replace(old,'This route split the crankcases and reassembled the engine: measure 0.90 L for the initial disassembled-engine fill. The later post-break-in oil/filter change uses its separate 0.65 L service quantity.'),'Initial disassembled-engine 0.90 L, oil product and actual quantity recorded; cap secured; subsequent oil-flow/level verification required.','Choose exact disassembled-engine capacity for the actual performed lower-engine operation; preserve later service refill.')
s=rows['commission-entry'];change(s['id'],s['instruction'].replace('actual top-end parts','actual lower-engine and top-end parts'),s['verification'][0],'Accept combined repair parts for the already-approved crank/gear/top-end break-in groups.')
d['prerequisites']=[x.replace('Any separate internal bench work must return','The completed lower-engine and top-end work must return').replace('The completed top-end bench work must return','The completed lower-engine and top-end work must return').replace(' No internals are serviced here.','') for x in d['prerequisites']]
d['entry_state']=['Exact stock assembled US 2022 YZ450F with serviceable retained cases and excluded systems; measuring equipment, renewal parts and required actual specialist work arranged.','Documented oil-check-bolt closure specification obtained before work; ECU/coil mounts remain untouched.']
d['exit_state']=['Recorded lower/top-end rebuild, engine refit, pressure/flow/level checks, actual replacement-part break-in and required post-maintenance completed without unresolved findings.','Documented oil-check-bolt closure and required external work completed; excluded internal systems remain outside this operation.']
for i,s in enumerate(steps):s['depends_on']=[steps[i-1]['id']] if i else []
d['steps']=steps
labels={}
for src in [d['source'],lower['source']]:
 assert len(src['pdf_pages'])==len(src['printed_pages'])
 for p,label in zip(src['pdf_pages'],src['printed_pages']):
  if p in labels:assert labels[p]==label
  labels[p]=label
d['source']['pdf_pages']=sorted({p for s in steps for p in s['source_pdf_pages']});d['source']['printed_pages']=[labels[p] for p in d['source']['pdf_pages']]
wr(out,d)
wr(H/'major-author-composition-review.json',dict(status='AUTHOR_COMPOSITION_REVIEW',adaptations=adaptations,dependencies=d['operation_dependencies'],correction_dependencies=d['correction_dependencies'],retained_commissioning='Approved exact 2022 plan and remaining-ride already cover new crankshaft and gears; no break-in numeric edits.'))
m=rd(H/'source-review-manifest.json');m.pop('independent_review',None);m['status']='PENDING_ROOT_COMPOSITION_REVIEW';m['artifacts']=[dict(path=out.name,kind='procedure',sha256=sha(out),source_id='yamaha-2022-b2w',target=d['target'],step_count=len(steps))];m['author_review']=dict(path='major-author-composition-review.json',sha256=sha(H/'major-author-composition-review.json'));wr(H/'major-source-review-manifest.json',m)
wr(H/'MAJOR_RECOVERY.json',dict(status=m['status'],artifact=out.name,sha256=sha(out),steps=len(steps),dependencies=d['operation_dependencies'],correction_dependencies=d['correction_dependencies'],next='Independent root composition review before freeze or runtime.',database_writes=False))
print(len(steps),sha(out))
