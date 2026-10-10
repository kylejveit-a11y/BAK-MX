"""Compose approved exact-year operations; commissioning must be source-bound before review."""
import copy,hashlib,json,re
from pathlib import Path
import fitz
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OUT=HERE/'top-end-bike-journey-v1.procedure.json'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
if OUT.exists() and json.loads(OUT.read_text(encoding='utf8'))['source']['review_status']=='APPROVED':raise SystemExit('Frozen approved journey; create a new revision.')
paths={'access':'docs/research/workshop-pass9/yamaha-2025-frame/engine-removal-refit-v1.procedure.json','topend':'docs/research/workshop-pass9/yamaha-2025-engine/top-end-bench-v1.procedure.json'}
expected={'access':'ac4ff7e9f086bd069a4c1008c8e09076a64c93afdbef204501ecbc048975157d','topend':'168f728aa9c092015bac846833b06502964ed223fa58dc58295219240ccf8eb6'}
docs={k:json.loads((ROOT/v).read_text(encoding='utf8')) for k,v in paths.items()}
for k,p in paths.items():
 assert sha(ROOT/p)==expected[k],k
 assert docs[k]['source']['review_status']=='APPROVED'
d=copy.deepcopy(docs['access'])
d.update(id='yamaha-yz450f-2025-top-end-bike-journey-v1',title='Rebuild the top end and reassemble the bike',status='AUTHORING_COMPOSITION_PENDING_COMMISSIONING',publication_status='NOT_IMPORTED',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['source']['review_status']='PENDING_INDEPENDENT_REVIEW'
d['source']['review_note']='Approved exact 2025 engine-access and bench top-end source operations composed once; final head-gasket commissioning is being integrated separately. This authoring snapshot must not enter runtime.'
d.pop('editorial_template',None)
d['operation_dependencies']=[{'artifact':p,'sha256':expected[k],'kind':'approved_source_operation'} for k,p in paths.items()]
d['completeness']='Authoring snapshot: assembled-bike access, measured retained-head/piston/cylinder service and engine refit; source-reviewed post-head-gasket commissioning pending. Not a finished operation.'
d['entry_state']=['Exact stock assembled US2025 YZ450F; suitable engine bench, measuring tools and planned parts/head repair available.']
d['exit_state']=['PENDING: commissioning and post-maintenance checks must be added before source approval or rider use.']
d['applicability']['excluded']=docs['topend']['applicability']['excluded']+['Other models/years and modified interfaces','Bottom-end, gearbox and oil-pump rebuild','Frame/suspension/brake internals and structural repair']
d['affected_components']=sorted(set(docs['access']['affected_components']+docs['topend']['affected_components']))
d['prerequisites']=docs['access']['prerequisites']+docs['topend'].get('preflight',[])
d['required_tools']=docs['access']['required_tools']+docs['topend']['required_tools']
d['required_parts']=docs['access']['required_parts']+docs['topend']['required_parts']
d['critical_stop_conditions']=docs['access']['critical_stop_conditions']+docs['topend']['critical_stop_conditions']
d['branch_completion_policy']=docs['topend'].get('branch_completion_policy')
def take(k,s):
 r=copy.deepcopy(s);r['id']=k+'-'+s['id'];r['origin']={'artifact':paths[k],'sha256':expected[k],'step_id':s['id']}
 for b in r.get('branches',[]):b['id']=k+'-'+b['id'];b['next_step']=k+'-'+b['next_step']
 return r
steps=[]
for s in docs['access']['steps']:
 if s['id']=='engine-fuel-ready':break
 if s['id']=='pressure-test':continue
 steps.append(take('access',s))
 if s['id']=='engine-engine-out':
  # Keep cold-bench preparation; omit duplicate exit handoff, since access bench-record follows.
  steps.extend(take('topend',x) for x in docs['topend']['steps'] if x['id']!='exit')
d['steps']=steps
# A reviewed commissioning companion may be composed once. Pending companions
# are never accepted as runtime authority by this builder.
cp='docs/research/workshop-pass9/yamaha-2025-commissioning/post-rebuild-commissioning-v1.procedure.json'
if (ROOT/cp).exists():
 c=json.loads((ROOT/cp).read_text(encoding='utf8'))
 if c['source']['review_status']=='APPROVED':
  assert sha(ROOT/cp)=='e992baef16dcb9b875c14b407606aaf1b03b20945f0a9f94ebadf1f058664f1a','Commissioning approved source changed; independently review the new revision.'
  paths['commission']=cp;expected['commission']=sha(ROOT/cp);docs['commission']=c
  d['operation_dependencies'].append({'artifact':cp,'sha256':expected['commission'],'kind':'approved_source_operation'})
  crows={s['id']:s for s in c['steps']}
  def add(k,id):steps.append(take(k,next(s for s in docs[k]['steps'] if s['id']==id)))
  for id in ['entry','plan','filter-open','filter-clean','filter-close','preflight']:add('commission',id)
  steps[-6]['instruction']='Record the actual top-end parts installed and all accepted cold timing, clearance, fit and refit records from this route. The bike remains fully cool and has not yet been started after repair. Complete the following filter/static checks and pressure-tester attachment before its first oil-flow start. Any unresolved mechanical or lubrication-preparation fault remains open.'
  steps[-6]['verification']=['Actual repair records accepted; engine fully cool; first startup has not occurred.']
  add('access','engine-fuel-ready')
  add('commission','test-attach')
  add('access','engine-oil-flow')
  steps[-1]['instruction']='With fuel, intake, electrical and mounting closure complete and the correctly fitting cold-installed pressure tester connected as just checked, start the engine at idle only. Observe the oil window for flow and decreasing level while monitoring the pressure gauge. If oil level does not decrease, or pressure rises rapidly toward the stated ceiling, stop immediately; do not rev to force oil flow. The following three-minute warm-up is continuous with this initial idle start.'
  for id in ['test-warm','test-hold','test-cool-close']:add('commission',id)
  add('access','engine-cooling-warm-cool')
  steps[-1]['instruction']='After the pressure-test equipment has been removed cold, coolant restored and the radiator cap secured, restart the engine and warm it for the following measured operating checks. Keep the cap closed and watch for oil flow, leaks or abnormal noise; stop immediately for a fault.'
  for id in ['control-renew-idle-check','control-renew-final-adjust','control-renew-steering-check','engine-complete-cooling','engine-cooling-recheck','engine-final-checks']:add('access',id)
  for s in c['steps'][10:]:steps.append(take('commission',s))
  for field in ['required_tools','required_parts','critical_stop_conditions']:d[field]+=c.get(field,[])
  d['prerequisites']+=c.get('preflight',[])
  d['supplemental_sources']+=c.get('supplemental_sources',[])
  for field in ['external_operations','unresolved_knowledge','open_knowledge_dependencies']:
   if field in c:d[field]=copy.deepcopy(c[field])
  d['source']['review_note']='Three approved exact-year operations composed once: assembled-bike access, measured top-end bench work, engine refit and required head-gasket commissioning. Initial idle oil-flow start occurs only after cold tester attachment. Independent composition review pending.'
  d['status']='SOURCE_REVIEWED_COMPONENTS_PENDING_COMPOSITION_REVIEW'
  d['completeness']='Assembled exact stock bike through measured piston/cylinder and retained-head top-end service, engine refit, head-gasket pressure test and replacement-part break-in/post-maintenance. Required specialist seat work, tank cleaning and inaccessible checks remain explicit actual-work dependencies; this is not bottom-end or whole-bike rebuild qualification.'
  d['exit_state']=copy.deepcopy(c['exit_state'])
  d['prerequisites']=[x for x in d['prerequisites'] if not x.startswith('A separate head-gasket replacement requires')]
  d['prerequisites']+=['The head-gasket pressure test is performed within this route using the reviewed Mityvac method and verified actual adapter fit. First oil-flow startup follows cold tester attachment; no prior post-repair startup is assumed.','Plan actual qualified tank cleaning, seat refacing if chosen and inaccessible repaired-part/joint checks before teardown; these cannot be completed by a booking or a passed app check.']
# Remove standalone-source claims and shopping items unrelated to this composition.
d['applicability']['excluded']=[x for x in d['applicability']['excluded'] if x!='Engine removal/refitting, running, break-in and post-maintenance checks']
d['prerequisites']=[x.replace('Internal bench work, if performed, must return','The completed top-end bench work must return') for x in d['prerequisites']]
d['required_parts']=[x for x in d['required_parts'] if x.get('purpose') not in ['Upper/lower mounting-bolt circumference and threads','Upper eye O-rings per OEM187; separate from lower bearing molybdenum-disulfide grease','Seal lips and rear axle.','Disc bolt threads; actual product recorded, grade unspecified by source.','OEM marks the removed joint clip for replacement; verify chain identity first.']]
d['remaining_gaps']=['Bottom-end, gearbox, oil-pump and lower timing-chain drive repairs are outside this top-end route.','Required external seat refacing, tank-interior cleaning and inaccessible repaired-part checks require actual completed work; app records do not perform these operations.','Physical bike validation has not been performed.']
for x in d.get('external_operations',[]):
 if x.get('step_id'):x['step_id']='commission-'+x['step_id']
rows={x['id']:x for x in steps}
rows['topend-entry']['instruction']=rows['topend-entry']['instruction'].replace('after the separate engine-removal operation','after the preceding engine-removal steps')
r=rows['access-engine-bench-record']
r['title']='Accept the completed top-end work before engine refit'
r['instruction']='Record the actual completed top-end work: installed parts, piston/cylinder/ring and valve/guide measurements, any completed specialist seat work, accepted cold valve clearances, timing, lubrication and free rotation. Confirm the top-end covers, access plugs and retained oil-filter closure are sealed before refit; no unresolved bench fault may pass this handoff. Keep the original swingarm and side stacks located on their temporary support for the single pivot replacement.'
r['verification']=['Actual completed top-end measurements, parts and timing accepted; covers/access plugs/filter sealed; original swingarm side stacks supported.']
r['composition_adaptation']='Replaces standalone no-internal-work handoff with the actual completed top-end record.'
for i,s in enumerate(steps):s['depends_on']=[steps[i-1]['id']] if i else []
initial_fill=next(s for s in steps if s['id']=='access-engine-oil-fill')
initial_fill['instruction']=initial_fill['instruction'].replace('Fit the filler cap with a new O-ring.','Lubricate the new filler-cap O-ring with lithium-soap grease as shown in exact OEM PDF246, then fit the cap.')
initial_fill['source_pdf_pages']=sorted(set(initial_fill['source_pdf_pages']+[246]))
initial_fill['source_links'].append({'title':'Yamaha 2025 right-cover/filler O-ring diagram, PDF246','url':d['source']['source_url']+'#page=246'})
initial_fill['composition_adaptation']='Adds independently rendered exact-year filler O-ring grease specification to access-source summary; no frozen dependency modified.'
pdf=fitz.open('C:/Users/kylej/AppData/Local/Temp/D02-2819U-10_02.pdf')
d['source']['pdf_pages']=sorted(set(p for s in steps for p in s['source_pdf_pages']))
d['source']['printed_pages']=list(dict.fromkeys(x for p in d['source']['pdf_pages'] for x in re.findall(r'^\d{1,2}-\d{1,3}$',pdf[p-1].get_text(),re.M)[-1:]))
d['source']['printed_pages']+=['Symbols (unnumbered)'] if 7 in d['source']['pdf_pages'] else []
write(OUT,d)
write(HERE/'RECOVERY.json',{'status':d['status'],'target':d['target'],'artifacts':[{'path':OUT.name,'sha256':sha(OUT),'steps':len(steps)}],'dependencies':d['operation_dependencies'],'next':'Root independent composition review required before metadata freeze/runtime. Preserve actual external-work dependencies and physical-validation limit.','database_writes':False})
print(OUT.name,len(steps),'DRAFT ONLY',sha(OUT))
