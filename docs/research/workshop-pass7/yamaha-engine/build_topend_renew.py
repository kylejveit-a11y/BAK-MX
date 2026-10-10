import json,copy,hashlib
from pathlib import Path
P=Path(__file__).parent;R=P.parents[3]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
base=R/'docs/research/engine-pass3/continuation/top-end-stock-reuse-v1.procedure.json';head=P/'guides-valves-renew-bench-v1.procedure.json'
d=read(base);h=read(head);original=copy.deepcopy(d);URL=d['source']['source_url'];adapt=[]
steps=[]
for s in d['steps']:
 if s['id']=='head-service-1--entry':
  for hs in h['steps']:
   t=copy.deepcopy(hs);t['id']='head-renew--'+t['id'];t['source_operation']=dict(artifact=head.relative_to(R).as_posix(),sha256=sha(head),procedure_id=h['id'],step_id=hs['id']);steps.append(t)
 if not s['id'].startswith('head-service-1--'):steps.append(s)
by={s['id']:s for s in steps}
def change(i,text,reason):
 adapt.append(dict(step_id=i,original_instruction=by[i]['instruction'],reason=reason));by[i]['instruction']=text
change('engine-out--initial-record','Record the exact stock engine identity, running condition and reason for this top-end work. Photograph hose, electrical and bracket routing. Prepare an independently supported engine bench and controlled lift with a helper. This route retains the serviceable original head, caps, cams and lifters, renews all four guides and valves with arranged specialist seat refacing, and includes measured piston/cylinder work and supported pad adjustment. Arrange the new-valve run-in and post-run-in maintenance before opening the engine.','New supported repair scope; mandatory specialist stage and downstream run-in identified before teardown.')
change('head-renew--entry','Keep the removed original head and four valve positions identified. The engine is already supported on the bench and cams are out. Confirm the arranged specialist seat-refacing service and exact four new guides, four sacrificial new lapping valves, four separate new running valves and four new stem seals. This phase retains an undamaged original head and serviceable lifters.','Closes bench access using already completed composite phases; no repeated engine removal.')
change('head-in--repair','Confirm the original head, matching caps, cams and lifters passed their included inspections. Confirm the new guides, separate new running valves, refaced seats and stem seals have passed all recorded fit, contact and sealing checks. The installed cylinder/piston pair must have an accepted actual fit. If head/cap/cam/lifter replacement, head resurfacing or further uncompleted seat repair is needed, keep the engine open until that separate repair is resolved.','Replaces prior reuse-only restriction with the completed source-reviewed new-guide/new-valve phase; excluded replacement heads remain excluded.')
change('engine-in--final-checks',by['engine-in--final-checks']['instruction'].replace('bottom-end or head-machining work is not included.','bottom-end work is not included. Seat refacing is recorded as the external operation actually completed. The bike is assembled and stationary checks are complete; new-valve run-in and its follow-up maintenance remain required.'),'Accurate assembled-bike exit without false return-to-racing completion.')
change('clearance-adjust--adjustment-scope',by['clearance-adjust--adjustment-scope']['instruction'].replace('serviceable original stock valve-train parts','accepted new stock guides and running valves with serviceable retained original cams, caps and lifters'),'Aligns clearance contingency with reviewed replacement-valve scope.')
change('engine-in--bench-record',by['engine-in--bench-record']['instruction'].replace('original-valve/cam inspection decisions','new guide fit, separate new running-valve identities, specialist seat-refacing/contact/sealing results and retained cam inspection decisions'),'Refit acceptance reflects actual replacement work.')
by['cams-in--remeasure']['verification']=['All four actual cold readings recorded for the following path decision.']
by['clearance-adjust--adjustment-scope']['verification']=['Record actual readings and selected path: all in range proceeds to cover closure; an out-of-range reading requires the supported adjustment sequence.']
change('engine-in--final-checks',by['engine-in--final-checks']['instruction']+' With correctly configured YDT 90890-03275 (US USB) or 90890-03273, verify coolant at 70–80 °C. Use tachometer 90890-06760 or YU-39951-B connected as shown to the ignition-coil high-tension lead to verify 1900–2100 r/min with starter knob fully returned and serviceable filter/compression/free play. Adjust idle if necessary; clockwise raises speed. Record actual temperature and idle, then repeat the steering/return check.','Closes explicit exact-source temperature and idle commissioning prerequisite from PDF96.')
by['engine-in--final-checks']['source_pdf_pages']=sorted(set(by['engine-in--final-checks']['source_pdf_pages']+[96]))
for i,s in enumerate(steps):s['depends_on']=[steps[i-1]['id']] if i else []
for ph in d['phases']:
 if ph['id']=='head-service':
  ph['title']='Renew guides and valves; inspect retained cams'
  ph['step_ids']=['head-renew--'+s['id'] for s in h['steps']]+[i for i in ph['step_ids'] if i.startswith('head-service-2--')]
  ph['entry_state']=['Original head removed; exact replacement parts and specialist refacing arranged.']
  ph['exit_state']=['New guides and separate new running valves accepted and assembled after specialist refacing; retained cams/caps inspected.']
d.update(id='yamaha-2026-yz450f-top-end-guide-valve-renew-v1',title='Rebuild the top end with new guides and valves',publication_status='APPROVED',steps=steps,completeness='Continuous assembled-bike access, supported head guide/valve renewal with outsourced seat refacing, measured piston/cylinder work, cam timing/clearance contingency, refit and stationary commissioning. Ends before required running break-in and post-break-in maintenance; not return-to-racing clearance.')
d['applicability']['included']='Exact standard US2026 stock YZ450F; serviceable original head/caps/cams/lifters, all four guides and valves renewed with specialist seat refacing. Exact piston/cylinder/ring replacement only with measured fit.'
d['applicability']['excluded'][1]='Whole-head/cap/cam/lifter replacement, head resurfacing, seat-cutter geometry or welding.'
d['applicability']['excluded'].append('Running break-in and post-break-in maintenance are separate downstream work, not completed by this guide.')
d['preflight'][4]='Serviceable original head/caps/cams/lifters required. Arrange specialist seat refacing and exact separate sacrificial/running valves before teardown.'
d['preflight'].append('Plan source-prescribed running break-in and post-break-in maintenance; this guide ends after stationary commissioning.')
d['critical_stop_conditions'][0]='Failed retained head/cap/cam/lifter inspection, unresolved renewed-guide/valve/seat fit or unaccepted piston/cylinder fit.'
d['entry_state']=['Assembled exact stock bike; cold engine; required parts, specialist head service and downstream run-in plan available.']
d['exit_state']=['Top end rebuilt and engine refitted; cold timing/clearances and stationary oil/coolant/throttle checks accepted.','Bike ready for the separately planned controlled break-in; post-break-in maintenance remains required before return to practice or racing.','Crankcases, clutch basket and gearbox remain assembled throughout this operation.']
d['required_tools']+=h['required_tools'];d['required_parts']+=h['required_parts'];d['consumables']=h['consumables']
d['operation_dependencies']+= [dict(artifact=base.relative_to(R).as_posix(),sha256=sha(base),kind='reviewed_continuous_access_refit_source'),dict(artifact=head.relative_to(R).as_posix(),sha256=sha(head),kind='reviewed_replacement_head_service_phase')]
d['source']['pdf_pages']=sorted(set(d['source']['pdf_pages']+h['source']['pdf_pages']+[40,41,42,43]))
d['source']['printed_pages']=list(dict.fromkeys(d['source']['printed_pages']+h['source']['printed_pages']+['1-28','1-29','1-30','1-31']))
d['source']['printed_pages']=[x for x in d['source']['printed_pages'] if 'See exact PDF' not in x]
d['source']['review_status']='APPROVED';d['source']['review_note']='Immutable approved composite access/refit and approved guide/valve renewal phase composed with explicit specialist stage. Independent year_groups_research approved all phase cutpoints and final scope/idle/branch observation corrections. PDF40–43 downstream obligation text checked; not claimed executed.'
d['external_operations']=[dict(x,step='head-renew--'+x['step']) for x in h['external_operations']]
d['downstream_required_operations']=[dict(id='new-valve-break-in',source_pdf_pages=[40],instruction='After warm-up, replacement valves require about 30 minutes at throttle opening of one-half or less. If the cylinder was also replaced, the source requires about one hour of break-in; select the applicable source-prescribed plan instead of treating 30 minutes as sufficient for a new cylinder.'),dict(id='maintenance-after-break-in',source_pdf_pages=[41,42,43],instruction='Complete the source post-break-in maintenance, including drained-oil inspection and change, engine-fit/leak checks and chassis/torque-check points. Metal contamination requires investigation; a completed stationary check is not completion of these later operations.')]
(P/'top-end-guide-valve-renew-v1.procedure.json').write_text(json.dumps(d,indent=2)+'\n',encoding='utf-8')
(P/'top-end-guide-valve-composition-review-v1.json').write_text(json.dumps(dict(schema_version=1,status='APPROVED',base_sha256=sha(base),head_sha256=sha(head),adaptations=adapt,steps=len(steps),branch_policy=d['branch_completion_policy'],downstream_scope='Run-in and post-run-in maintenance explicitly not executed by this candidate.'),indent=2)+'\n',encoding='utf-8')
print(len(steps),sha(P/'top-end-guide-valve-renew-v1.procedure.json'))
