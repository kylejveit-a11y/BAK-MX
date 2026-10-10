import copy,hashlib,json,re
from pathlib import Path
import fitz
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OUT=HERE/'major-engine-bike-journey-v1.procedure.json'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def rd(p):return json.loads(p.read_text(encoding='utf8'))
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
if OUT.exists() and rd(OUT)['source']['review_status']=='APPROVED':raise SystemExit('Frozen: create a new revision.')
paths={'journey':'docs/research/workshop-pass9/yamaha-2025-engine-journey/top-end-bike-journey-v1.procedure.json','lower':'docs/research/workshop-pass9/yamaha-2025-engine/lower-engine-bench-v1.procedure.json'}
hashes={'journey':'fe700644eff579401c300404fce7628fc4f63883e6fa645067285f7bf6901407','lower':'47a147277f552cf86353a2277bfa5205b5d7719966c3e957cda86df0deb70e35'}
for k,p in paths.items():assert sha(ROOT/p)==hashes[k] and rd(ROOT/p)['source']['review_status']=='APPROVED'
d=copy.deepcopy(rd(ROOT/paths['journey']));lower=rd(ROOT/paths['lower'])
d.update(id='yamaha-yz450f-2025-major-engine-bike-journey-v1',title='Major engine rebuild and bike reassembly',status='SOURCE_REVIEWED_COMPONENTS_PENDING_COMPOSITION_REVIEW',publication_status='NOT_IMPORTED',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['source']['review_status']='PENDING_INDEPENDENT_REVIEW'
d['source']['review_note']='Approved exact-year assembled top-end route plus lower-engine bench operation; new crank/gear break-in mapping from OEM PDF40. Independent composition review pending.'
d['operation_dependencies']=[{'artifact':p,'sha256':hashes[k],'kind':'approved_source_operation'} for k,p in paths.items()]
d['completeness']='Assembled-bike major engine walkthrough with measured top end, retained sound cases, case bearings, complete crank assembly, gearbox, oil pump and clutch drives, refit and crank/gear/top-end break-in. Retained water pump, pressure-relief, starter and electrical internals and pressed connecting-rod rebuilding remain excluded. External actual-work checks and physical validation gaps remain visible.'
d['applicability']['excluded']=[x for x in d['applicability']['excluded'] if 'Lower timing-chain' not in x and 'Bottom-end' not in x]
d['applicability']['excluded'] += [x for x in lower['applicability']['excluded'] if not x.startswith('Top-end teardown')]
d['affected_components']=sorted(set(d['affected_components']+lower.get('affected_components',[])))
d['prerequisites'] += [x for x in lower['preflight'] if not x.startswith('Arrange exact top-end')]
d['prerequisites'].append('Plan actual stock crank/chain/cam replacement as the matched set required by lower-chain inspection; lower-drive work must not leave incompatible retained cams for the later top-end checks.')
for f in ['required_tools','required_parts','critical_stop_conditions']:d[f]+=lower.get(f,[])
d['remaining_gaps']=['Pressed connecting-rod/crank internal rebuilding, damaged case replacement/machining, and retained water-pump, pressure-relief, starter, stator and clutch-release internal faults are outside this route.','Specialist valve-seat refacing, actual tank-interior cleaning and inaccessible repaired-part checks remain real-work dependencies.','No physical bike validation has been performed; source-reviewed coverage is not full specification or launch qualification.']
steps=[]
for s in d['steps']:
 steps.append(s)
 if s['id']=='topend-piston-out':
  for original in lower['steps']:
   r=copy.deepcopy(original);r['id']='lower-'+r['id'];r['origin']={'artifact':paths['lower'],'sha256':hashes['lower'],'step_id':original['id']}
   for b in r.get('branches',[]):b['id']='lower-'+b['id'];b['next_step']='lower-'+b['next_step']
   steps.append(r)
d['steps']=steps;rows={s['id']:s for s in steps}
rows['topend-entry']['instruction']=rows['topend-entry']['instruction'].replace('Retain assembled crankcases, clutch, gearbox, starter, generator and oil-pump systems.','Keep the lower engine assembled until the head, cylinder and piston have been removed in the following steps. The lower-engine sequence then opens and closes the supported stock systems before top-end assembly resumes.')
rows['topend-cam-disposition']['instruction']=rows['topend-cam-disposition']['instruction'].replace('This route does not remove the lower chain drive or replace the head/cap set; such failures require that repair before continuing.','Cross-check the recorded lower-chain inspection and installed crank/chain against the cams selected here. Any required matched crank-sprocket/chain/cam set must now be complete and individually accepted; do not reuse the old cams merely because the prior standalone top-end source retained a sound lower drive. The head/cap-set replacement remains outside this route.')
rows['access-engine-bench-record']['instruction']=rows['access-engine-bench-record']['instruction'].replace('actual completed top-end work:','actual completed lower-engine and top-end work:').replace('installed parts, piston/cylinder/ring','installed crank/chain/cam matched-set disposition, gear/shaft and case-bearing measurements, lower-drive/clutch torques and free movement, piston/cylinder/ring')
rows['access-engine-bench-record']['verification']=['Actual lower/top-end parts, measurements, matched timing components and cold timing accepted; all covers/filter sealed; original swingarm side stacks supported.']
r=rows['access-engine-oil-fill'];r['instruction']=r['instruction'].replace('Record the applicable oil quantity: 0.94 L for oil change with unchanged filter, 0.96 L with filter removal, or 1.20 L for a disassembled engine.','This route split the crankcases and reassembled the engine: measure the OEM disassembled-engine quantity of 1.20 L for this initial fill. The later post-break-in filter/oil change uses its own 0.96 L service quantity.')
r['verification']=['Disassembled-engine initial 1.20 L fill, oil grade and new greased filler O-ring recorded; subsequent flow and settled-level verification still required.']
rows['commission-entry']['instruction']=rows['commission-entry']['instruction'].replace('top-end parts','lower-engine and top-end parts')
rows['commission-plan']['instruction']='Record all replaced parts. A new cylinder or complete crankshaft requires about one hour: 20 minutes at no more than half throttle, inspect, then 40 minutes at no more than three-quarter throttle and inspect again. New valves, piston, rings, camshaft or gears require about 30 minutes at no more than half throttle. With both groups renewed, retain half throttle for the first 30 minutes; this overlap is an explicit conservative workflow adaptation. No riding proceeds with unresolved lower or top-end faults.'
rows['commission-remaining-ride']['instruction']='For valves/piston/rings/camshaft/gears without cylinder or crankshaft replacement, ride about 10 further minutes at no more than half throttle. For a new cylinder or crankshaft, ride about 40 further minutes; with any 30-minute-group parts renewed too, retain half throttle for the first 10 minutes of this second session, then never exceed three-quarter throttle. Stop for abnormal behavior and record actual time, throttle ceiling and symptoms.'
for id in ['topend-entry','topend-cam-disposition','access-engine-bench-record','access-engine-oil-fill','commission-entry','commission-plan','commission-remaining-ride']:rows[id]['composition_adaptation']='Explicit combined lower/top-end component state and exact OEM break-in groups; source mechanics retained.'
for id in ['commission-plan','commission-remaining-ride']:
 rows[id]['source_pdf_pages']=sorted(set(rows[id]['source_pdf_pages']+[40]));rows[id]['source_links'].append(d['source']['source_url']+'#page=40')
rows['access-engine-bench-record']['instruction']=rows['access-engine-bench-record']['instruction'].replace('retained oil-filter closure','renewed oil-filter closure')
rows['topend-cam-disposition']['instruction']=rows['topend-cam-disposition']['instruction'].replace('do not reuse the old cams merely because the prior standalone top-end source retained a sound lower drive','do not retain old cams when matched-set renewal is required')
rows['lower-entry']['instruction']+=' Account for and remove the protective cloth placed below the piston before opening the cases. Restore clean opening protection as needed between operations; account for every cloth before closure.'
d['prerequisites']=[x.replace('The completed top-end bench work','The completed lower-engine and top-end bench work') for x in d['prerequisites']]
d['entry_state']=['Exact stock assembled US2025 YZ450F with serviceable retained cases and excluded systems; required measuring equipment, stock renewal parts and actual specialist work arranged.']
d['exit_state']=['Recorded lower/top-end rebuild, sealed engine refit, cooling/flow/level checks, actual replacement-part break-in and required post-break-in maintenance completed without unresolved findings.','Excluded internal systems and physical validation are not qualified by this route; external required work must actually be completed.']
for i,s in enumerate(steps):s['depends_on']=[steps[i-1]['id']] if i else []
pdf=fitz.open('C:/Users/kylej/AppData/Local/Temp/D02-2819U-10_02.pdf');d['source']['pdf_pages']=sorted(set(p for s in steps for p in s['source_pdf_pages']))
d['source']['printed_pages']=list(dict.fromkeys(x for p in d['source']['pdf_pages'] for x in re.findall(r'^\d{1,2}-\d{1,3}$',pdf[p-1].get_text(),re.M)[-1:]))+['Symbols (unnumbered)']
wr(OUT,d)
m=rd(ROOT/'docs/research/workshop-pass9/yamaha-2025-engine-journey/source-review-manifest.json');m.pop('independent_review',None);m.update(id='yamaha-2025-major-engine-journey-pass9',status='PENDING_ROOT_COMPOSITION_REVIEW');m['artifacts']=[{'path':OUT.name,'kind':'procedure','sha256':sha(OUT),'source_id':'yamaha-2025-d02','target':d['target'],'step_count':len(steps)}];wr(HERE/'source-review-manifest.json',m)
wr(HERE/'RECOVERY.json',{'status':m['status'],'artifacts':m['artifacts'],'dependencies':d['operation_dependencies'],'next':'Independent root source/cutpoint review before freeze or runtime integration.','database_writes':False})
print(len(steps),sha(OUT))
