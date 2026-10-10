import copy,hashlib,json,re,fitz
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
existing=HERE/'frame-bearing-renewal-reassembly-v1.procedure.json'
if existing.exists() and json.loads(existing.read_text(encoding='utf8'))['source']['review_status']=='APPROVED':
 raise SystemExit('Frozen approved artifact: create a new revision for changes; do not overwrite this source/hash.')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n',encoding='utf8',newline='\n')
paths={
 'frame':'docs/research/frame-pass3/continuation/frame-strip-reassemble-v1.procedure.json',
 'steering':'docs/research/workshop-pass7/yamaha-chassis/steering-bearings-races-renewal-v1.procedure.json',
 'linkage':'docs/research/workshop-pass7/yamaha-chassis/swingarm-linkage-bearings-renewal-v1.procedure.json',
 'eyes':'docs/research/workshop-pass7/yamaha-chassis/shock-eye-bearings-renewal-v1.procedure.json',
 'front':'docs/research/workshop-pass6/yamaha-completion-audit/front-wheel-bearing-renewal-v1.procedure.json',
 'rear':'docs/research/workshop-pass6/yamaha-rear-wheel/rear-wheel-bearings-seals-v1.procedure.json',
 'control':'docs/research/workshop-pass7/yamaha-engine/throttle-grip-cable-access-v1.procedure.json'
}
docs={k:json.loads((ROOT/p).read_text(encoding='utf8')) for k,p in paths.items()}
for k,d in docs.items():assert d['source']['review_status']=='APPROVED',k
d=copy.deepcopy(docs['frame'])
d.update(id='yamaha-yz450f-2026-frame-bearing-renewal-reassembly-v1',title='Strip to the frame, renew chassis bearings and reassemble the bike',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['source']['review_status']='PENDING_INDEPENDENT_REVIEW'
d['source']['review_note']='Composition of seven exact approved hash-bound procedures. Frame access/closure retained once; approved bench renewal sections inserted at the exposed-frame cutpoint. Throttle grip cable-end access separates throttle body from bar group while hydraulics stay closed. Independent composition-order review pending.'
d['source']['pdf_pages']=sorted(set(p for v in docs.values() for p in v['source'].get('pdf_pages',[])))
pdf=fitz.open('C:/Users/kylej/AppData/Local/Temp/D03-2819U-10_02.pdf')
d['source']['printed_pages']=list(dict.fromkeys(label for n in d['source']['pdf_pages'] for label in re.findall(r'^\d{1,2}-\d{1,3}$',pdf[n-1].get_text(),re.MULTILINE)[-1:]))
d['completeness']='Assembled exact stock bike to serviceable exposed main frame with steering races removed, then renewal of steering, both wheel, swingarm/linkage and sealed shock-eye bearings and bike reassembly. Throttle grip cable ends detached/refitted; closed hydraulic assemblies remain supported together. Engine internals, fork/shock internals, structural repair and bonded frame pads are separate.'
d['applicability']['included']='Exact stockUS2026YZ450F; serviceable original frame, engine, wheel hubs, swingarm/linkage and sealed suspension assemblies; new exact bearing/seal parts listed. No automatic other-year inheritance.'
d['applicability']['excluded']=['Other years/models or aftermarket assemblies','Structural frame repair, welding, straightening, alignment correction or bonded-pad removal','Internal engine/fork/shock rebuild','Hydraulic joint opening or master/caliper overhaul','Complete throttle cable replacement or throttle-body end detachment','Modified harness/routing preventing supported closed hydraulic assembly removal','Spring/preload changes']
d['entry_state']=['Assembled exact stock bike; all renewal parts and fitting tools verified; original control setup recorded.']
d['exit_state']=['Serviceable main frame reassembled after both steering race sets, both wheel bearing stacks, swingarm/linkage and shock-eye bearings renewed. One coordinated engine/pivot refit and one closure per wheel. Throttle ends restored; fluids, routing, torque, wheel runout and operating checks recorded.']
d['operation_dependencies']=[{'artifact':p,'sha256':sha(ROOT/p),'kind':'approved_source_operation'} for p in paths.values()]
for field in ['required_tools','required_parts','prerequisites']:
 values=[]
 for doc in docs.values():
  for v in doc.get(field,[]):
   if v not in values:values.append(copy.deepcopy(v))
 d[field]=values
d['prerequisites']=[x.replace('Engine separately supported while pivot removed; shock remains supported by unchanged upper mount.','Engine separately supported while pivot removed; shock upper mount is removed later and restored once after eye renewal.').replace('Puller and driver setup must clear the retained original disc. This route leaves its bolts untouched; stop if the available tooling cannot do that.','Front-wheel puller/driver must clear its retained disc; front disc bolts remain untouched. Rear disc is separately removed/refitted in this route.') for x in d['prerequisites']]
d['prerequisites']+=['All bearing renewal parts and actual fitting tool/adapter checks must be complete before first disassembly. This single route renews the listed bearings; it does not merely inspect them.','Use independent supports for engine, frame, wheels, bar and every closed hydraulic assembly. No hose, cable or engine rear mount carries unsupported component weight.','Engine stays internally assembled; any independently performed internal job requires its own documented pre-start checks before refit.']
d['supplemental_sources']=[]
for doc in docs.values():
 for s in doc.get('supplemental_sources',[]):
  if not any(x['url']==s['url'] for x in d['supplemental_sources']):d['supplemental_sources'].append(copy.deepcopy(s))
d['affected_components']=sorted(set(k for doc in docs.values() for k in doc.get('affected_components',[])))
def take(key,ids):
 out=[]
 for id in ids:
  s=copy.deepcopy(next(s for s in docs[key]['steps'] if s['id']==id));s['id']=key+'-renew-'+id
  s['origin']={'artifact':paths[key],'sha256':sha(ROOT/paths[key]),'step_id':id};out.append(s)
 return out
rows=[]
for original in docs['frame']['steps']:
 s=copy.deepcopy(original);id=s['id'];s['origin']={'artifact':paths['frame'],'sha256':sha(ROOT/paths['frame']),'step_id':id}
 s['instruction']=s['instruction'].replace('3â€“6','3–6')
 if id=='rear-shock-lower':s['instruction']=s['instruction'].replace('Keep the linkage bearings and seals assembled in this inspection-only operation.','Keep the detached linkage joints identified for the renewal stage.')
 if id=='swingarm-off':s['instruction']=s['instruction'].replace('The intact linkage is already free; do not extract its bearings or seals.','The linkage is already free; bearing/seal renewal follows the bare-frame inspection.')
 if id=='arm-inspect':s['instruction']=next(x for x in docs['linkage']['steps'] if x['id']=='arm-inspect')['instruction']
 if id=='front-stem-out':s['instruction']=next(x for x in docs['steering']['steps'] if x['id']=='stem-out')['instruction'];s['record_required']=True
 if id=='front-steering-inspect':
  s['instruction']=next(x for x in docs['steering']['steps'] if x['id']=='steering-inspect')['instruction']
  s['verification']=['Retained brackets/stem and seats inspected; both old bearing/race sets are scheduled for renewal, not reuse.']
 if id=='front-steering-grease':s['instruction']=s['instruction'].replace('Return the lower bracket, upper bearing and race cover','Return the lower bracket with its newly fitted lower bearing, install the NEW matching upper bearing and race cover')
 if id=='front-bar-off':
  s['instruction']=s['instruction'].replace('Keep controls and grips attached; do not loosen the lower-holder nuts or disconnect hoses/cables for this bounded operation.','The throttle grip/tube and its cable ends are already detached and identified. Keep the remaining controls and closed hydraulic hoses attached; do not loosen the lower-holder nuts.')
 if id=='engine-intake-clear':s['instruction']='Clean the lower intake joint, loosen its clamp and lift the intact throttle body clear. The grip-end cables were detached earlier; support the body and both identified cables separately outside the engine lifting path without tension. Keep body-end cable seats, sensors, adjustment screws and pulley intact; protect the engine intake and housing against dirt.'
 if id=='remaining-brackets':s['instruction']=s['instruction'].replace('Pressed steering races and bonded frame pads may remain;','The steering races have been removed; bonded frame pads remain;')
 if id=='shock-upper-off':s['instruction']=s['instruction'].replace('Keep original eyelet collars/seals intact;','Keep the eyelet stacks identified until their bench renewal;')
 if id=='loom-control-off':s['instruction']='The throttle grip is off the bar and its cable ends are detached; keep the identified cables attached to the intact throttle body and independently supported. Release remaining frame/cable holders and ties using the exact routing diagrams. Unbolt rectifier/regulator, ignition-coil bracket and air-filter-case brackets, retaining connectors where possible. Lift the harness and supported bar with its closed front-brake/clutch assemblies clear; lift the separate throttle-body/cable group clear without kinking. No hose or cable bears another component\'s weight. Closed hydraulic lines remain attached to their supported controls; modified routing preventing this removal is outside this route.'
 if id=='frame-inspection':s['instruction']='Clean and inspect the exposed main frame with both steering head races removed; retain bonded pads and identification markings. Record cracks, bends, thread/seat damage, corrosion or fretting. Structural repair, race-seat machining and alignment correction are outside this route. Confirm the frame is serviceable before installing races or continuing the following bench renewal stages.'
 if id=='loom-control-refit':s['instruction']=s['instruction'].replace('Place the intact supported bar/control and hydraulic assemblies','Place the separately supported throttle-body/cable group and bar/control/hydraulic assemblies')
 if id=='engine-bench-record':s['instruction']='Confirm any independently performed internal engine work has documented pre-start clearance, timing and free-rotation checks; this route leaves engine internals assembled. Verify all renewed swingarm bearing/bush/thrust/seal depths and stack records. Grease their specified contact surfaces with molybdenum-disulfide grease and position the supported swingarm with its correct renewed side stacks. The single shared pivot next locates both arm and engine; do not install a second pivot or repeat engine removal.'
 if id=='rear-link-refit':s['instruction']=s['instruction'].replace('Restore every retained collar and washer in its original joint.','Restore the correct renewed matched collars and inspected washers in their identified joints.')
 if id=='shock-upper-refit':
  s['instruction']=s['instruction'].replace('Inspect the retained upper eyelet/collars','Verify the completed new upper bushing/stopper/seals and correctly seated collars')
  s['verification']=['Upper bolt from right; nut56 N·m; new bushing/stopper/O-rings/seals and correct collars verified.']
 if id=='engine-cooling-warm-cool':
  s['title']='Warm for the operating checks';s['instruction']='After initial idle oil-flow verification and with all fuel, cooling, intake and control closure complete, warm the engine for several minutes. Leave the radiator cap secured. Proceed to the following measured operating checks before stopping and cooling completely.'
  s['verification']=['Initial oil flow verified; engine warmed for the next measured operating checks; cap remains closed.']
 if id=='engine-final-checks':s['instruction']=s['instruction'].replace('turn the bars both ways and verify idle does not change.','confirm the preceding recorded warm-idle steering test was completed without idle change.')
 rows.append(s)
 if id=='engine-initial-record':rows+=take('control',['record'])
 if id=='engine-access-case-remove':rows+=take('control',['housing-open','ends-release','inspect'])
 if id=='front-steering-inspect':rows+=take('steering',['old-races-out'])
 if id=='frame-inspection':
  rows+=take('rear',['disc-sprocket-off','seals-clip-out','bearings-out','hub-inspection','right-bearing','new-circlip','spacer-left-bearings','new-seals','sprocket-refit','disc-refit'])
  rows+=take('front',['inspect','seals-out','bearings-out','hub-check','left-bearing','spacer-right','seals-in','bearing-check'])
  rows+=take('linkage',['stack-record','bearings-out','swingarm-bearings-in','swingarm-seals','relay-renew','connecting-renew'])
  rows+=take('eyes',['eye-stack','eye-extract','upper-eye-in','lower-eye-in'])
  rows+=take('steering',['head-races-in','lower-bearing-in'])
 if id=='front-bar-refit':rows+=take('control',['lubricate','ends-fit','housing-close'])
 if id=='front-control-route':rows+=take('control',['static-check'])
 if id=='engine-torque':rows+=take('rear',['close'])
 if id=='engine-cooling-warm-cool':
  rows+=take('control',['idle-check','final-adjust','steering-check'])
  cool=copy.deepcopy(s);cool.update(id='engine-complete-cooling',title='Allow complete cooling',instruction='After the operating check has stopped the engine, let it cool completely before opening the radiator cap for the next cold-level check.',record_required=False,verification=['Engine stopped and fully cooled before the cap is opened.']);rows.append(cool)
 if id=='frame-final':
  rows[-1]['instruction']+=' Record both renewed wheel bearing stacks, front flush/rear approximate1mm seal depths, steering race seating, swingarm/linkage depths and sealed shock-eye retention. No listed renewal is completed by merely refitting its housing.'
for i,s in enumerate(rows):s['depends_on']=[rows[i-1]['id']] if i else []
d['steps']=rows
d=json.loads(json.dumps(d,ensure_ascii=False).replace('â€“','–').replace('â€”','—').replace('Â·','·'))
write(HERE/'frame-bearing-renewal-reassembly-v1.procedure.json',d)
manifest={'schema_version':1,'id':'yamaha-frame-renewal-pass7','database_writes':False,'sources':[{'id':'yamaha-yz450f-2026-oem','url':d['source']['source_url'],'local_pdf_path':'C:/Users/kylej/AppData/Local/Temp/D03-2819U-10_02.pdf','sha256':d['source']['document_sha256']}]+d['supplemental_sources'],'artifacts':[{'path':'frame-bearing-renewal-reassembly-v1.procedure.json','kind':'procedure','sha256':sha(HERE/'frame-bearing-renewal-reassembly-v1.procedure.json'),'source_id':'yamaha-yz450f-2026-oem','target':d['target'],'step_count':len(rows)}]}
write(HERE/'source-review-manifest.json',manifest)
