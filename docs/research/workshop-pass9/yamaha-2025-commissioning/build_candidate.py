"""Explicit 2025 source mapping; prior structure only. Never overwrite approval."""
import copy, hashlib, json, re
from pathlib import Path
import fitz
B=Path(__file__).parent; ROOT=B.parents[3]
OUT=B/'post-rebuild-commissioning-v1.procedure.json'
if OUT.exists(): assert json.loads(OUT.read_text(encoding='utf8'))['publication_status']!='APPROVED'
PDF=Path('C:/Users/kylej/AppData/Local/Temp/D02-2819U-10_02.pdf')
M=Path('C:/Users/kylej/AppData/Local/Temp/mityvac-MV4560-801625.pdf')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(PDF)=='5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac'
assert sha(M)=='508a744728dc28c37911bdc206f3e8ec6fe5eb8f11febe74a385bbf1299493cf'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/D02-2819U-10_02.pdf'
MU='https://cdn.skfmediahub.skf.com/api/public/0901d1968096854e/pdf_preview_medium/0901d1968096854e_pdf_preview_medium.pdf'
T=ROOT/'docs/research/workshop-pass7/yamaha-commissioning/top-end-break-in-maintenance-v1.procedure.json'
d=json.loads(T.read_text(encoding='utf8'))
d['id']='yamaha-2025-yz450f-post-rebuild-commissioning-v1'; d['target']['model_year']=2025
d['title']='Commission the repaired engine and complete break-in follow-up'
d['publication_status']='PENDING_INDEPENDENT_REVIEW'
d['entry_state']=['Exact standard US 2025 stock YZ450F engine repaired, refitted and assembled with accepted timing, cold clearances, oil supply/levels, coolant fill, controls and stationary checks; engine completely cool.','Correctly fitting Mityvac MV4560 cooling-system adapter and secure hose connections confirmed before this illustrated tester-method route. This is not a claim that MV4560 is identical to the Yamaha-listed kit.']
d['exit_state']=['Actual post-head-gasket cooling test, selected replacement-part break-in and all required follow-up work recorded; no unresolved inspection findings.','Fuel-tank internal cleaning, inaccessible repaired-part fit assessment and all-joint checks require actual qualified work where this companion does not provide the method.']
d['applicability']={'included':'Exact US 2025 standard stock YZ450F after completed top-end repair with new head gasket and new valves/piston/rings/camshaft or cylinder.','excluded':['Aftermarket build specifications','Bottom-end repair and crankshaft/gear-specific commissioning','Diagnosis/repair of failed tests','Use of other pressure testers without their reviewed operating method'],'year_inheritance':'NONE'}
d['operation_dependencies']=[]
d['source']['source_url']=URL;d['source']['document_sha256']=sha(PDF);d['source']['review_status']=d['publication_status']
for k in ['title','document_title']: 
 if k in d['source']: d['source'][k]='2025 YZ450F Owner Service Manual D02-2819U-10 / LIT-11626-38-16'
d['source']['document_id']='D02-2819U-10 / LIT-11626-38-16'
d['source']['document_revision']='D02-2819U-10 / LIT-11626-38-16; March 2024'
d['source']['review_note']='Exact 2025 author source review complete; independent review pending. Prior 2026 approval does not transfer.'
d['supplemental_sources']=[{'id':'mityvac-mv4560-method','url':MU,'sha256':sha(M),'local_path':str(M),'attribution':'Mityvac / SKF, MV4560 user manual Form 801625, pages 8–9','scope':'Cold attachment and engine-on pressure monitoring; cool completely before relief/disconnection. Does not establish bike-specific adapter interchangeability or Yamaha pressure.'}]
maps={'entry':[39,40,88,89], 'plan':[40], 'filter-open':[38,98,99], 'filter-clean':[99], 'filter-close':[38,100], 'preflight':[88,94,106,107,109,115], 'first-ride':[39,40], 'first-pit':[40], 'remaining-ride':[40], 'final-pit':[40,41], 'oil-drain':[41,96], 'filter-renew':[96,97], 'generator-access':[38,121,123,124,235,236,237], 'generator-open':[235,236,237,239], 'generator-check':[41,238,239], 'generator-close':[236,237,239,64,65,66,67,68,69,70,71,72,73,74,75], 'oil-fill':[95,96,97], 'engine-inspect':[41,103,104], 'chassis-inspect':[41,88,110,115,116], 'spokes':[116], 'chain':[41,109,110,194,195], 'controls':[41,88,97,98,106,107,116,117], 'tank-cleaning-record':[41,296,297,298], 'body-close':[38,100,121,123,124], 'torques':[41,42,43,56,57,58,59,60,61,62,63], 'oil-flow':[97], 'oil-level':[40,95,96], 'final':[41,88,103,104]}
for s in d['steps']:
 s['source_pdf_pages']=maps[s['id']]
 s['instruction']=re.sub(r'PDF\d+(?:[–-]\d+)?','the linked source',s['instruction'])
 s['instruction']=s['instruction'].replace('about30','about 30').replace('sequence is20','sequence is 20').replace('then40','then 40').replace('first30','first 30')
 s['origin']='Original companion wording checked against exact 2025 D02 pages; prior 2026 structure is not applicability evidence.'
overrides={
'entry':'Record the exact repaired parts and completed engine-refit record. Accept cold clearances, timing, oil flow/levels, coolant fill, idle and controls before riding. The engine must now be fully cool. Any unresolved noise, leak or lubrication fault requires repair first. This companion does not itself perform engine removal/refit.',
'plan':'New valves, piston, rings or camshaft require about 30 minutes at no more than half throttle. A new cylinder requires about one hour: 20 minutes at no more than half throttle, inspect, then 40 minutes at no more than three-quarter throttle and inspect again. With both groups renewed, keep at or below half throttle for the first 30 minutes; this overlap is an explicit conservative workflow adaptation. Record the actual parts route.',
'generator-check':'Check generator rotor and stator mounted areas for looseness and visible contact damage, and inspect connectors. Keep sound mounted assemblies intact. Record the actual inspection. Loose or damaged assemblies require separate generator repair with correct taper/key, sealing and fastening steps; a blind torque check does not replace that repair.',
'controls':'Check both brakes for effective action without drag and the front-lever end for no free play. With reservoirs horizontal, fluid must be above the minimum marks in the diagram. Leaks or spongy action require separate brake service. Check cable-clutch free play at 7.0–12.0 mm: turn the handlebar adjuster; if insufficient, slide the cable cover, loosen its locknut, adjust at the cable, tighten that locknut to 4.3 N·m and restore the cover. Check smooth clutch action and unrestricted cable travel through full steering. Replace damaged cables; lubricate rough sound cables with engine oil or suitable cable lubricant at the upright cable end. Use silicone grease at brake-lever moving contacts and lithium-soap grease at clutch-lever and pedal pivots.',
'tank-cleaning-record':'The post-break-in list requires cleaning inside the fuel tank and checking for leaks. Record actual qualified cleaning, not merely an appointment or fuel-color inspection. The cleaning method remains an external dependency. Follow exact tank access/refit: extract fuel with a pump; remove seat, side covers and shrouds; cover residual-pressure fittings with cloth, release holder/cover and both connector buttons by hand, protect disconnected joints and support the tank off its pump face. If pump removed, renew gasket lip upward, align pump projection with bracket slot and tighten the five bolts in the numbered order to 7 N·m. Restore tank front bolts 8 N·m and retaining screw 4 N·m, reconnect fuel hose until it clicks, restore connector cover and correctly oriented holder, and connect pump coupler. Record restored sealing and leak checks.',
'oil-fill':'Fit new drain gaskets: oil-tank bolt 10 N·m, crankcase bolt 20 N·m. Fill 0.96 L for this filter-removal service and install filler cap with a new O-ring. Use Yamalube or an oil meeting API SG or higher and JASO MA; the listed SAE grades are 10W-40, 10W-50, 15W-40, 20W-40 or 20W-50. Do not add additives or use the source-prohibited CD-or-higher or ENERGY CONSERVING II oils. The settled window level is the final check. The 1.20 L disassembled capacity is not this service refill.',
'chain':'With the rear wheel raised and transmission neutral, pull up the chain about 50 N above the guide mounting bolt and measure the illustrated guide-to-chain gap: 50–60 mm. To adjust, loosen axle nut and both locknuts; adjust sides equally and push wheel forward to seat both end plates. Tighten axle 135 N·m and locknuts 21 N·m, then recheck alignment/slack. Lubricate the chain. A stiff, damaged or worn chain requires separate cleaning/removal or replacement and clip closure; do not hide that work behind this inspection.',
'body-close':'Seat the radiator-guard projections in the left shroud and tighten shroud fasteners to 7 N·m. Restore filter-cover projections/ribs and breather routing. Refit seat bolts to 13 N·m and secure the sub-seat with untwisted tether. Restore any other bodywork removed for tank cleaning using its exact diagram. Confirm all connectors, wire clearance, fuel connections and oil closures before restart.',
'final':'After the engine is fully cool, check coolant at the illustrated maximum and confirm no continuing loss. Open a radiator cap only cold, using a thick cloth and slow release to the detent; wait for hissing to stop before pressing/turning it off, and secure it after checking. Repeat the pre-operation checklist. Complete only with actual pressure-test, riding, oil/debris, generator, repaired-part fit, tank-cleaning, chassis and all-joint records accepted. Missing required work remains pending. This is a bounded maintenance companion, not proof of unrelated rebuild work.'}
for s in d['steps']:
 if s['id'] in overrides:s['instruction']=overrides[s['id']]
 if s['id']=='generator-close':s['instruction']=s['instruction'].replace('tighten pedal bolt12Nm','tighten the pedal bolt to 12 N·m')
 if s['id']=='filter-renew':
  s['instruction']+=' Apply lithium-soap-based grease to the new filter-cover O-ring as shown in the engine-cover diagram.'
  s['source_pdf_pages'].append(246)
 if s['id']=='oil-fill':
  s['instruction']+=' Apply lithium-soap-based grease to the new filler-cap O-ring as shown in the engine-cover diagram.'
  s['source_pdf_pages'].append(246)
 if s['id']=='final':s['instruction']=s['instruction'].replace(' This is a bounded maintenance companion, not proof of unrelated rebuild work.','')
 if s['id']=='remaining-ride':s['instruction']=s['instruction'].replace('valves/piston/rings','valves/piston/rings/camshaft')
extra=[]
def add(id,title,instruction,pages,record=True):
 extra.append({'id':id,'title':title,'instruction':instruction,'source_pdf_pages':pages,'source_links':[],'verification':['Record the actual equipment, condition and test result; unresolved faults remain pending.'],'record_required':record,'diagram_reference_required':True,'origin':'Combined original companion: Yamaha D02 exact pressure/time; Mityvac Form801625 pages8–9 tool operation, not OEM adapter equivalence.'})
add('test-attach','Attach the pressure tester while cold','Use the Mityvac MV4560 method only with confirmed correct radiator adapter fit. With the engine fully cool, remove the cap under a thick cloth, slowly vent at the detent, then remove after hissing stops. Fill coolant to the source upper level and inspect hoses. Wet the adapter seal with water or coolant, seat it in the filler neck and secure both hose compression connections. Keep the original cap off until testing and full cooling are finished.',[103,104,288])
add('test-warm','Warm with the gauge connected','Monitor the connected gauge while warming for Yamaha’s three minutes. Stop for rapid pressure rise, abnormal gauge behavior, leaks or pressure approaching the 137.3 kPa ceiling. Do not pump above that ceiling. If stopped for a fault, let the system cool fully before releasing pressure or disconnecting; investigate before repeating. This sequence combines Mityvac cold attachment/engine-on monitoring with Yamaha’s head-gasket warm-up requirement.',[39,288,289])
add('test-hold','Check cooling-system pressure','After the three-minute warm-up, stop the engine and apply only enough pressure to reach 137.3 kPa (19.9 psi), never exceed it. Confirm it holds for 5–10 seconds. Check radiator/hose joints for leakage and hoses for bulging. A loss of pressure or visible defect requires correction and repeat testing; record actual pressure and hold time.',[289])
add('test-cool-close','Cool fully before removing the tester','Leave the connected equipment undisturbed until the engine is completely cool. Then use the MV4560 relief lever to release remaining pressure before disconnecting under a cloth. Refill to the source level and refit the radiator cap. This cold-release restriction comes from Mityvac page9; never remove a hot cap or hot pressurized adapter.',[103,104,289])
ix=next(i for i,s in enumerate(d['steps']) if s['id']=='first-ride');d['steps'][ix:ix]=extra
for i,s in enumerate(d['steps']):
 s['depends_on']=[d['steps'][i-1]['id']] if i else []
 s['source_links']=[URL+'#page='+str(p) for p in s['source_pdf_pages']]
 if s['id'].startswith('test-'):s['source_links'] += [MU+'#page=8',MU+'#page=9']
d['source']['pdf_pages']=sorted({p for s in d['steps'] for p in s['source_pdf_pages']})
doc=fitz.open(PDF)
d['source']['printed_pages']=[str(p)+': '+doc[p-1].get_text().strip().splitlines()[-1] for p in d['source']['pdf_pages']]
d['required_tools']=[{'name':x} for x in ['Mityvac MV4560 and verified correct cooling-system adapter; readable pressure gauge; thick cloth and eye protection','Secure stand; torque tools spanning 2.5–135 N·m; timer; oil temperature measurement for the source level check','Clean drain container, filter tools, spoke wrench, cable lubricant applicator and chain measurement tool','Exact D02 diagrams and actual qualified tank-cleaning, repaired-part fit and all-joint inspection support']]
d['required_parts']=[{'name':x,'purpose':y} for x,y in [('Stock oil filter and new cover O-ring','Deliberate filter renewal with post-break-in oil change'),('New oil drain gaskets and filler O-ring','Oil closure'),('New left generator-cover gasket','Inspection access closure'),('Specified engine oil and coolant','Refill/check'),('Foam filter oil, approved filter cleaner, lithium-soap and silicone greases','Source maintenance points'),('New exact pump gasket if pump removed','Fuel-tank cleaning closure')]]
d['open_knowledge_dependencies']=['Exact plastic-tank internal-cleaning method remains external; no solvent invented.','Inaccessible repaired-part fit/contact and all-joint access are qualified actual-work dependencies.','MV4560 adapter fit must be verified; no adapter part-number interchangeability asserted.']
def save(p,o):p.write_text(json.dumps(o,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
save(OUT,d)
save(B/'source-review-manifest.json',{'schema_version':1,'status':d['publication_status'],'sources':[{'source_id':'yamaha-us-2025-yz450f-oem','url':URL,'sha256':sha(PDF),'local_path':str(PDF)},{'source_id':'mityvac-mv4560-method','url':MU,'sha256':sha(M),'local_path':str(M)}],'artifacts':[{'path':str(OUT.relative_to(ROOT)).replace('\\','/'),'sha256':sha(OUT),'target':d['target'],'review_status':d['publication_status']}],'structure_reference':{'path':str(T.relative_to(ROOT)).replace('\\','/'),'sha256':sha(T),'scope':'Sequence structure only. Every2025 mechanical page independently checked.'}})
print(str(len(d['steps']))+' steps '+sha(OUT))
