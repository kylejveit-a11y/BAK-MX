"""Composition only: all mechanics originate in hash-bound approved 2022 operations."""
import copy,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rd(p):return json.loads(p.read_text(encoding='utf-8'))
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
out=HERE/'top-end-bike-journey-v1.procedure.json'
assert not out.exists() or rd(out)['source']['review_status']!='APPROVED','Frozen artifact'
locks=rd(HERE/'approved-dependencies.json');assert locks['commission'],'Commissioning must be independently approved and bound first'
keys=['access','topend','commission'];docs={}
for k in keys:
 lock=locks[k];p=ROOT/lock['artifact'];assert sha(p)==lock['sha256'],k
 docs[k]=rd(p);assert docs[k]['source']['review_status']=='APPROVED' and docs[k]['target']['model_year']==2022
assert len({d['source']['document_sha256'] for d in docs.values()})==1
d=copy.deepcopy(docs['access']);d.pop('editorial_template',None)
d.update(id='yamaha-yz450f-2022-top-end-bike-journey-v1',title='Rebuild the top end and reassemble the bike',status='SOURCE_REVIEWED_COMPONENTS_PENDING_COMPOSITION_REVIEW',publication_status='NOT_IMPORTED',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['source']['review_status']='PENDING_INDEPENDENT_REVIEW'
d['source']['review_note']='Approved exact 2022 engine access, top-end bench and commissioning operations composed with explicit handoffs and cold pressure-tester attachment before first oil-flow start. Independent composition review pending.'
d['operation_dependencies']=[dict(artifact=locks[k]['artifact'],sha256=locks[k]['sha256'],kind='approved_source_operation') for k in keys]
d['entry_state']=['Exact stock assembled US 2022 YZ450F; measuring tools, engine supports, planned parts and actual required specialist work available.','Documented exact oil-level check-bolt closure specification obtained before teardown; ECU/coil mounts remain intact.']
d['exit_state']=copy.deepcopy(docs['commission']['exit_state'])
d['completeness']='Assembled-bike access, measured piston/cylinder and retained-head top-end service, refit, head-gasket pressure test and replacement-part break-in/post-maintenance. Documented oil-check-bolt closure and actual specialist/post-maintenance work remain explicit dependencies. Lower-engine and suspension internals are outside this route.'
d['applicability']['included']='Exact stock US 2022 YZ450F with accepted retained cases, lower drives, head/caps and ECU/coil mountings; optional source-reviewed guide/valve and piston/cylinder renewal.'
excluded=docs['access']['applicability']['excluded']+docs['topend']['applicability']['excluded']
d['applicability']['excluded']=[x for x in excluded if not x.startswith('Internal engine repairs') and x!='Engine removal/refitting, running, break-in and post-maintenance checks']
d['applicability']['excluded']+=['Lower-engine crankcase, gearbox, oil-pump and clutch internal repair']
for f in ['required_tools','required_parts','critical_stop_conditions']:
 d[f]=sum((copy.deepcopy(docs[k].get(f,[])) for k in keys),[])
d['prerequisites']=copy.deepcopy(docs['access']['prerequisites'])+copy.deepcopy(docs['topend'].get('preflight',[]))+copy.deepcopy(docs['commission'].get('preflight',[]))
d['prerequisites']=[x for x in d['prerequisites'] if not x.startswith('A replaced cylinder-head gasket needs')]
d['prerequisites']+=['This route performs the replacement-head-gasket pressure test with the approved cold-attachment method before the first oil-flow start; actual adapter fit must be confirmed.','Plan required specialist seat work, tank-interior cleaning and inaccessible post-maintenance inspections before teardown; only actually completed work satisfies these records.']
d['affected_components']=sorted({x for k in keys for x in docs[k].get('affected_components',[])})
d['branch_completion_policy']=docs['topend'].get('branch_completion_policy')
steps=[];adaptations=[]
def take(k,s):
 r=copy.deepcopy(s);r['id']=k+'-'+s['id'];r['origin']=dict(artifact=locks[k]['artifact'],sha256=locks[k]['sha256'],step_id=s['id'])
 for b in r.get('branches',[]):b['id']=k+'-'+b['id'];b['next_step']=k+'-'+b['next_step']
 return r
def add(k,id):
 s=next(s for s in docs[k]['steps'] if s['id']==id);steps.append(take(k,s));return steps[-1]
def adapt(s,instruction,verification,reason):
 adaptations.append(dict(step_id=s['id'],original_instruction_sha256=hashlib.sha256(s['instruction'].encode()).hexdigest(),reason=reason))
 s['instruction']=instruction;s['verification']=[verification];s['composition_adaptation']=reason
for s in docs['access']['steps']:
 if s['id']=='engine-fuel-ready':break
 if s['id']=='pressure-test':continue
 steps.append(take('access',s))
 if s['id']=='engine-engine-out':steps.extend(take('topend',x) for x in docs['topend']['steps'] if x['id']!='exit')
for id in ['entry','plan','filter-open','filter-clean','filter-close','preflight']:add('commission',id)
row=next(s for s in steps if s['id']=='commission-entry')
adapt(row,'Record the actual top-end parts installed and the accepted cold timing, clearance, fit and refit records from the preceding steps. The bike remains fully cool and has not yet been started after repair. Perform the following filter/static checks and cold pressure-tester attachment before its first oil-flow start. Record verified exact oil-check-bolt fastening and seal closure before any engine start; unresolved closure prevents starting. Unresolved mechanical or lubrication-preparation faults remain open.','Actual repair records and oil-check-bolt closure accepted; engine fully cool; first startup not yet performed.','Replace standalone prior-start entry with the actual continuous-route cold pre-start state, preserving exact check-bolt closure.')
add('access','engine-fuel-ready');add('commission','test-attach')
row=add('access','engine-oil-flow')
adapt(row,'With fuel, intake, electrical and mounting closure complete and the correctly fitting pressure tester already attached cold, start at idle only. Observe the oil-check window for oil flow and decreasing level while monitoring the pressure gauge. If the oil level does not decrease, pressure rises rapidly toward the stated ceiling, or a leak/abnormal condition appears, stop immediately; do not rev to force oil flow. The following three-minute warm-up continues from this initial start.','Initial idle oil flow and gauge behavior accepted; warm-up continues without a separate earlier start.','Combine exact oil-flow startup with approved cold-attached tester monitoring; preserve both fault conditions.')
for id in ['test-warm','test-hold','test-cool-close']:add('commission',id)
row=add('access','engine-cooling-warm-cool')
adapt(row,'After the test equipment has been removed with the engine fully cold, coolant restored and radiator cap secured, restart and warm the engine for the following measured operating checks. Keep the cap closed; stop for abnormal oil flow, leakage or noise.','Pressure-test equipment removed cold; cap restored before measured operating checks.','Prevent access warm-up from preceding cold pressure-test closure.')
for id in ['control-renew-idle-check','control-renew-final-adjust','control-renew-steering-check','engine-complete-cooling','engine-cooling-recheck','engine-final-checks']:add('access',id)
tail=False
for s in docs['commission']['steps']:
 if s['id']=='first-ride':tail=True
 if tail:steps.append(take('commission',s))
rows={s['id']:s for s in steps}
row=rows['topend-entry'];adapt(row,row['instruction'].replace('after the separate engine-removal operation','after the preceding engine-removal steps'),row['verification'][0],'Continuous-route bench entry after its own engine removal.')
adapt(rows['access-engine-bench-record'],'Record the actual completed top-end work: installed parts, piston/cylinder/ring and valve/guide measurements, completed specialist seat work if used, accepted cold valve clearances, timing, lubrication and free rotation. Confirm top-end covers and access plugs are sealed and retained oil-filter closure accepted before refit. No unresolved bench fault may pass this handoff. Preserve the supported swingarm side stacks for the single pivot replacement.','Actual top-end parts, measurements and timing accepted; covers/access plugs/filter closed; original swingarm side stacks supported.','Replace standalone intact-engine handoff with the actual completed top-end repair records.')
d['remaining_gaps']=['Lower-engine and suspension internal repairs are outside this top-end route.','Oil-level check-bolt closure requires the documented exact-interface specification obtained before work; no generic torque is supplied.','ECU mounting torque conflict remains; its mountings are retained.','Actual specialist seat work, tank-interior cleaning and inaccessible repaired-part checks remain required where applicable.','No physical bike validation has been performed.']
# Preserve each source operation's external requirements with its own prefix.
for field in ['external_operations','unresolved_knowledge','open_knowledge_dependencies']:
 combined=[]
 for k in keys:
  for x in docs[k].get(field,[]):
   x=copy.deepcopy(x)
   if isinstance(x,dict) and x.get('step_id'):x['step_id']=k+'-'+x['step_id']
   if x not in combined:combined.append(x)
 if combined:d[field]=combined
supp={}
for k in keys:
 for x in docs[k].get('supplemental_sources',[]):
  if x['id'] in supp:assert supp[x['id']]['sha256']==x['sha256']
  supp[x['id']]=copy.deepcopy(x)
d['supplemental_sources']=list(supp.values())
for i,s in enumerate(steps):s['depends_on']=[steps[i-1]['id']] if i else []
d['steps']=steps
page_labels={}
for k in keys:
 src=docs[k]['source'];assert len(src['pdf_pages'])==len(src['printed_pages']),k
 for p,label in zip(src['pdf_pages'],src['printed_pages']):
  if label.startswith(str(p)+': '):label=label.split(': ',1)[1]
  if p in page_labels:assert page_labels[p]==label,(p,page_labels[p],label)
  page_labels[p]=label
d['source']['pdf_pages']=sorted({p for s in steps for p in s['source_pdf_pages']})
d['source']['printed_pages']=[page_labels[p] for p in d['source']['pdf_pages']]
wr(out,d)
wr(HERE/'author-composition-review.json',dict(status='AUTHOR_COMPOSITION_REVIEW',dependencies=d['operation_dependencies'],adaptations=adaptations,omitted=['Standalone top-end exit handoff; actual bench acceptance follows.','Access retained-gasket cold pressure test replaced by approved head-gasket commissioning.'],preserved=['2022 stock chain is opened; new clip retained.','Exact2022 oil quantities and check-bolt external closure preserved.','ECU/coil remain mounted; no filler grease or later-year numerical inheritance.']))
sources=[dict(id='yamaha-2022-b2w',url=d['source']['source_url'],sha256=d['source']['document_sha256'],local_pdf_path='C:/Users/kylej/AppData/Local/Temp/B2W-2819U-12_02.pdf')]
sources += [dict(id=x['id'],url=x['url'],sha256=x['sha256'],local_pdf_path=x.get('local_pdf_path',x.get('local_path'))) for x in d['supplemental_sources']]
wr(HERE/'source-review-manifest.json',dict(schema_version=1,status='PENDING_ROOT_COMPOSITION_REVIEW',sources=sources,artifacts=[dict(path=out.name,kind='procedure',sha256=sha(out),source_id='yamaha-2022-b2w',target=d['target'],step_count=len(steps))],author_review=dict(path='author-composition-review.json',sha256=sha(HERE/'author-composition-review.json'))))
wr(HERE/'RECOVERY.json',dict(status='PENDING_ROOT_COMPOSITION_REVIEW',artifact=out.name,sha256=sha(out),steps=len(steps),dependencies=d['operation_dependencies'],runtime_ready=False,database_writes=False))
print(len(steps),sha(out))
