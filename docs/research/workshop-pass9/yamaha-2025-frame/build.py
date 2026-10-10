"""2025 authoring candidate. Never treats the 2026 template as year authority."""
import copy, hashlib, json, re
from pathlib import Path
import fitz
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
TEMP=Path('C:/Users/kylej/AppData/Local/Temp')
PDF=TEMP/'D02-2819U-10_02.pdf'
SHA='5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/D02-2819U-10_02.pdf'
OUT=HERE/'frame-bearing-renewal-reassembly-v1.procedure.json'
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
if OUT.exists() and json.loads(OUT.read_text(encoding='utf8'))['source']['review_status']=='APPROVED':raise SystemExit('Frozen approved source; create a new revision.')
assert digest(PDF)==SHA
template=ROOT/'docs/research/workshop-pass7/yamaha-frame-renewal/frame-bearing-renewal-reassembly-v1.procedure.json'
d=json.loads(template.read_text(encoding='utf8'))
mapping={int(k):v for k,v in json.loads((HERE/'editorial-page-map.json').read_text(encoding='utf8'))['mapping'].items()}
mapping.update({38:37,61:60,62:62,63:63,101:98,106:104,107:105,128:62,254:244,257:244,262:97,263:98})
def transform(v):
 if isinstance(v,list):return [transform(x) for x in v]
 if isinstance(v,dict):return {k:transform(x) for k,x in v.items() if k not in ['origin','operation_dependencies','independent_review','review_history']}
 if isinstance(v,str):
  v=v.replace('2026','2025').replace('D03-2819U-10','D02-2819U-10')
  v=re.sub(r'PDF\s*(\d{2,3})(?:/(\d{2,3}))?',lambda m:'PDF'+str(mapping.get(int(m[1]),int(m[1])))+('/'+str(mapping.get(int(m[2]),int(m[2]))) if m[2] else ''),v)
  return v
 return v
d=transform(d)
d['target']['model_year']=2025
d['status']='AUTHORING_CANDIDATE_PENDING_INDEPENDENT_REVIEW'
d['publication_status']='NOT_IMPORTED'
d['integration_status']='CANDIDATE_PENDING_ROOT_REVIEW'
d['source'].update(source_url=URL,document_sha256=SHA,document_revision='D02-2819U-10 / LIT-11626-38-16; First edition March 2024',review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact 2025 source review; 2026 is an editorial sequence template only. Cable clutch, control routing, rear-frame roller, fork position and fluid source rechecked against D02. Independent whole-route review pending.')
d['editorial_template']={'path':str(template.relative_to(ROOT)).replace('\\','/'),'sha256':digest(template),'authority':'sequence template only; not applicability or numeric evidence'}
for s in d['steps']:
 s['source_pdf_pages']=sorted(set(mapping[p] for p in s['source_pdf_pages']))
 s['source_links']=[x for x in s.get('source_links',[]) if 'ymcapps' not in (x if isinstance(x,str) else x['url'])]
def step(id,text,pages=None,title=None,record=None):
 s=next(x for x in d['steps'] if x['id']==id);s['instruction']=text
 if pages is not None:s['source_pdf_pages']=pages
 if title:s['title']=title
 if record is not None:s['record_required']=record
 return s
step('engine-access-body','Remove the main-seat bolts and slide the seat rearward. Remove left/right side covers, keeping bolts and collars labeled. Slide the right cover projection out of its single locating slot as illustrated; do not pull the tab apart.',[121,122,124,125])
step('engine-access-tank-disconnect','Unplug the fuel-pump connector. Put cloths below and around the fuel-hose joint for residual pressure. Remove the connector holder, slide the cover back, press its two release buttons and separate the joint by hand. Fit the supplied joint covers to both openings immediately.',[296,297])
step('engine-release-cylinder','Record clutch lever free play and the cable-end/adjuster positions. Release cable tension with the handlebar adjuster as necessary. Disconnect the engine-end cable nipple from the push lever and release the cable outer from its bracket as shown in the inset; keep the push lever, shaft and clutch cover installed. Retain the cable with its handlebar lever and support it clear of the engine lifting path. This bike has a cable clutch.',[97,98,244],title='Disconnect and record the cable clutch',record=True)['verification']=['Engine-end nipple and outer detached and identified; push lever and clutch internals remain installed; cable supported.']
step('rear-frame-off','Support the rear frame with rear fender and electronics holders attached. Remove its four mounting bolts and lift the assembly clear, checking no wire, silencer or hose remains attached. Keep bolts mapped by position. The upper chain roller is separately bolted on this 2025 frame; remove that bolt and retain the complete roller/collar stack separately.',[62,66,67,121,122])
step('rear-frame-refit','Align the supported rear frame without trapping wires. Return all four mounting bolts to their mapped positions and tighten to 38 Nm. Refit the separately mounted upper chain roller with its original collar stack and tighten its bolt to 16 Nm. Confirm it turns freely.',[62,66,67])
step('front-control-route','Route throttle cables to the right of the number-plate bracket. Route the start-switch lead, left handlebar-switch lead and clutch cable to the LEFT of that bracket between the number-plate upper guide and upper bracket. Brake hose passes through the plate upper guide. Secure switch leads to the bar with tie locks UP and ends forward, uncut. The protector retaining tie has its lock DOWN. Match the exact diagram and plate markings.',[70,71])
step('engine-release-refit','Restore the identified clutch cable outer to its engine bracket and nipple to the push lever as illustrated; tighten the engine-end cable locknut to 7 Nm if loosened. Verify full seating. Set lever free play to 7-12 mm using the handlebar adjuster first. If its range is insufficient, slide the cable cover, loosen the cable-side adjuster locknut, adjust and tighten that locknut to 4.3 Nm, then restore the cover. Check smooth clutch operation through both steering locks and record actual free play.',[58,97,98,244],title='Reconnect and adjust the cable clutch',record=True)['verification']=['Engine cable-end and outer fully seated; disturbed engine locknut 7 Nm; cable-side adjuster locknut 4.3 Nm if used; actual lever free play 7-12 mm recorded.']
step('engine-harness-refit','Reconnect stator, crankshaft-position, gear-position and coolant-temperature connectors and their covers. Route stator lead behind the radiator, clear of the tension arm and gear-position connector. The clutch CABLE protector contacts the radiator hose and passes outside the stator and gear leads. Restore the lower tie between the illustrated left-cover bolts with lock OUTWARD, and upper tie over the grommet with lock FORWARD. Clamp the clutch cable ahead of the lead and seat the frame clip with lock forward. Keep regulator leads inside the tension arm. Fully seat the plug cap and route temperature, engine-ground and high-tension leads outside the head breather. Check the starter lead stays clear of the push lever shaft.',[64,65,68,69,72,73,204])
step('rear-harness-route','Restore white-tape rear-frame and green-tape clip ties with locks DOWN and trimmed ends OUTWARD. Starter lead lies below the harness at the green clip, and routes between relay and rear frame. Route the negative lead OUTSIDE the starter relay and starter lead; positive lead outside the rear-fender projection. Reseat ECU/CCU/relay connectors and covers, ECU connector pointing left. Fit battery and band but leave terminals isolated until final preparation.',[66,67,74,75,121,122])
step('engine-pedal-refit','Restore the brake-pedal pivot and spring, lubricating illustrated pivot/seal contacts with lithium-soap grease; tighten its bolt to 26 Nm. Refit the engine guard at 7 Nm. Restore the head breather to its recorded case/engine connections and exact top-view route. Keep ignition, ground and temperature leads outside the breather and avoid pinching under case brackets.',[61,62,72,73,205,206,299])
for s in d['steps']:
 s['instruction']=s['instruction'].replace('standard2 mm','standard5 mm').replace('projection to 2 mm','projection to 5 mm').replace('page 4-39 diagram','page 4-38 diagram').replace('page 4-8 cross-section','page 4-7 cross-section').replace('closed front-brake/clutch assemblies','closed front-brake assembly and cable clutch').replace('clutch hose','clutch cable')
 # Remove page literals inherited in ancillary records; per-step links carry exact locators.
 for k in ['verification']:
  if k in s:s[k]=[re.sub(r'(?<!\d)2 mm','5 mm',x) if s['id'] in ['front-setup','front-height-clamps'] else x for x in s[k]]
step('rear-brake-refit','Refit the rear master cylinder with both mounting bolts at 10 Nm, retaining its pushrod/clevis adjustment. Restore the hose to all swingarm holders with paint mark UP, no excessive twist and no interference with the spring. Verify the undisturbed hose metal ends remain against their master/caliper stops. Keep the caliper/bracket supported for wheel insertion; the engine closure step restores pedal pivot and spring.',[61,76,77,149,150])
step('engine-access-case-refit','Remove temporary inlet protection and seat the complete case fully on its original intake connection. Restore mounting collars, dampers and washers; tighten the three case bolts to 7 Nm and the air-filter-case joint clamp screw to 3 Nm. Restore the cylinder-head breather connection to the case if released and its original spring clamp. Check the lip is evenly seated, reconnect the intake-temperature coupler and restore its cover.',[57,299,300])
d['required_parts']=[x for x in d['required_parts'] if 'clutch-release' not in x['name'] and 'upper-chain-tensioner retaining pin' not in x['name']]
d['required_tools']=[x for x in d['required_tools'] if 'silicone' not in x['name']]
d['remaining_gaps']=['Internal engine and suspension rebuilds are separate exact-year operations.','Structural frame repair, bonded-pad removal, wheel truing and damaged hub/seat repair are excluded.','No model-specific fit of universal bearing tools is asserted; actual adapter/contact fit must be checked before removal.','No physical bike validation is claimed.']
# Exact-year closure corrections and an attributed standard holding method.
drive=json.loads((ROOT/'docs/research/workshop-pass8/yamaha-drive-renewal/stock-chain-sprocket-pair-renewal-v1.procedure.json').read_text(encoding='utf8'))
nick=copy.deepcopy(next(x for x in drive['supplemental_sources'] if 'Transmoto' in x['url']))
nick['scope']='Nick Dole manual rear-brake holding technique with an intact serviceable chain and secured rear wheel; universal technique only. Yamaha D02 controls all exact fasteners, thread preparation and locking. No impact/heat suggestions adopted.'
d['supplemental_sources'].append(nick)
d['prerequisites']+=['Serviceable intact stock chain, sprockets and working rear brake required for the attributed manual sprocket-nut holding method. Arrange a helper and stable support. A broken chain, failed brake or nut that will not release by this method requires a separately verified holding/repair route before teardown.','This route retains the cylinder head gasket. A separate head-gasket replacement must also complete the OEM PDF289 post-replacement pressure-test requirement; the cold intact-engine pressure check here is not that verification.']
step('engine-sprocket','With the rear wheel still secured, chain intact and rear brake still fully mounted, select neutral. Remove the cover and flatten the old lock-washer tabs. Have a helper hold the rear brake firmly while using a correctly fitting socket and manual breaker bar to loosen the sprocket nut, following the attributed Nick Dole technique. Do not use impact, heat or jam the chain against the case. Once loose, release the stock chain joint and remove the chain, retaining its matched link/plate and preparing a new clip. Remove the nut, old lock washer and sprocket. Mark and remove the shift pedal, preserving punch-mark alignment.',[58,193,195,258,259],record=True)['source_links']=[nick['url']+'#page=5']
step('engine-sprocket-refit','Fit the original serviceable drive sprocket and new correct lock washer. Leave the nut hand-threaded temporarily; its final LOCTITE preparation, torque and tab locking are a later explicit step after rear-wheel, brake and chain closure. Align shift-shaft/pedal punch marks and tighten the pedal bolt to 12 Nm. Fit the retained stock chain with matched link/plate and new clip, closed end leading chain travel as illustrated; lubricate the chain. Leave the sprocket cover off for the final nut check.',[54,58,193,195,258,259])['verification']=['Original sprocket and new lock washer seated; nut temporary only; new chain clip correctly oriented; shift pedal 12 Nm.']
idx=next(i for i,s in enumerate(d['steps']) if s['id']=='engine-torque')+1
d['steps'].insert(idx,{'id':'engine-sprocket-final','title':'Lock the drive sprocket after rear-wheel closure','instruction':'With the rear axle and adjusters torqued, chain fitted and rear brake refitted and firm, keep the transmission in neutral and have a helper apply the rear brake to hold the drive. Remove the temporarily fitted nut, apply Yamaha-specified LOCTITE to its threads and tighten to 90 Nm with a torque wrench. Record the actual locking product and follow its instructions; Yamaha does not name a grade here. Bend the new washer tabs against the nut flats, inspect locking and fit the sprocket cover at 7 Nm. No impact or heat is part of this method.','source_pdf_pages':[58,193,195],'source_links':[nick['url']+'#page=5'],'verification':['Rear wheel, chain and working brake restored before holding load; nut 90 Nm with specified locking agent; new tab washer locked; cover 7 Nm.'],'record_required':True,'diagram_reference_required':True})
for id in ['loom-control-off','loom-control-refit']:
 s=next(x for x in d['steps'] if x['id']==id)
 s['instruction']+=(' Identify and disconnect the frame ground terminal so it does not tether the loom; retain its bolt and photograph its position.' if id.endswith('off') else ' Restore the frame ground terminal at its recorded original position and tighten its bolt to 7 Nm.')
 s['source_pdf_pages']=sorted(set(s['source_pdf_pages']+[63,74,75]))
s=next(x for x in d['steps'] if x['id']=='rear-brake-refit');s['instruction']+=' Restore any removed hose-holder mounting screws to 3.5 Nm.';s['source_pdf_pages'].append(62)
s=next(x for x in d['steps'] if x['id']=='engine-access-case-release');s['instruction']+=' Identify and release the cylinder-head breather connection to the air-filter case if it prevents free removal; retain its spring clamp and protect the opening.'
step('engine-oil-fill','Record the applicable oil quantity: 0.94 L for oil change with unchanged filter, 0.96 L with filter removal, or 1.20 L for a disassembled engine. Use the OEM-listed Yamalube/API SG-or-higher JASO MA oil from the listed SAE grades 10W-40, 10W-50, 15W-40, 20W-40 or 20W-50. Do not add chemical additives or use source-excluded energy-conserving oils. Record chosen product and quantity; no temperature-to-grade chart is asserted by these pages. Fit the filler cap with a new O-ring. Final level and flow checks remain required.',[49,96,97],record=True)
step('engine-final-checks','Follow the oil-level procedure with the bike upright: warm the engine for ten minutes to the stated normal oil temperature of 60 C, stop, stand upright on level ground, then restart for 10 seconds, stop and allow a few minutes to settle. Level must be between the window lower edge and maximum mark. Correct level with the recommended oil; warm for several minutes and recheck after settling as directed. Check leaks, cable-clutch free play 7-12 mm and brake operation, throttle free play 3-6 mm/full return, and the recorded warm-idle steering test. Record mount torques, fluid quantities, chain slack and unresolved symptoms. Engine installation completion does not substitute for an internal rebuild record.',[88,94,95,96,97,98,109,110,207,208],record=True)
for s in d['steps']:
 # New artifact source locators must reference the exact year, including metadata fields.
 if s['id']=='front-guards-brake':s['source_pdf_pages']=[60,61,136,143,165,176]
 if s['id']=='eyes-renew-upper-eye-in':s['instruction']+=' Lubricate the upper dust-seal lips with molybdenum-disulfide grease at the PDF183 M arrows; keep lithium-soap grease on the O-rings as specified.'
 if s['id']=='engine-exhaust-header-remove':s['instruction']=s['instruction'].replace('old head gasket','old exhaust-port gasket at the cylinder head')
 if s['id']=='engine-exhaust-header-install':
  s['instruction']=s['instruction'].replace('new gasket at the head','new exhaust-port gasket at the cylinder head')
  s['verification']=['New exhaust-port gasket; all header nuts 7 then 10 Nm.']
 if s['id']=='engine-cooling-drain':s['source_pdf_pages']=[104]
 if s['id']=='engine-cooling-drain':s['instruction']+=' Thoroughly flush the cooling system with clean tap water as Yamaha directs, then drain the flush water completely before fitting the new drain washer. Account for residual water when establishing the final coolant mixture.'
 if s['id']=='engine-pedal-refit':s['instruction']=s['instruction'].replace('Restore the brake-pedal pivot and spring','Install new matching pedal-pivot O-rings at the two illustrated positions, lubricated with lithium-soap grease. Restore the brake-pedal pivot and spring')
 if s['id']=='engine-intake-clear':s['instruction']+=' The injector and sensor leads may remain connected while this group is supported next to the frame with slack; they must not carry its weight. Do not try to move it beyond their free reach.'
 if s['id']=='loom-control-off':s['instruction']+=' Before independently lifting the throttle-body group clear of the loom, label and disconnect the intake-pressure sensor dark-blue 3-pin, injector gray 2-pin and throttle-position sensor black 3-pin couplers by their latches. Keep the sensors installed and protect connector halves; never pull on the wires.'
 if s['id']=='loom-control-refit':s['instruction']+=' Restore the identified intake-pressure dark-blue 3-pin, injector gray 2-pin and throttle-position black 3-pin couplers, fully latched and covered. Route the TPS lead inside along the ignition coil as drawn. Sensors and their calibration fasteners remain undisturbed.'
 if s['id']=='remaining-brackets':s['source_pdf_pages']=[61,62,63,122]
 if s['id']=='rear-brake-free':s['source_pdf_pages']=[61,76,77,131,147,149,150,206]
 if s['id']=='front-caliper':s['source_pdf_pages']=[136,165]
 if s['id']=='frame-small-refit':s['source_pdf_pages']=[61,62]
 if s['id']=='engine-access-body-install':s['source_pdf_pages']=[37,38,98,99,121,122,123,124,125]
 if s['id']=='engine-access-subseat':s['source_pdf_pages']=[37,38,124,297]
 if s['id']=='engine-fuel-ready':s['source_pdf_pages']=[37,38,39,40,297,298]
 if s['id']=='rear-renew-close':s['source_pdf_pages']=[88,128,132,133,134,135]
 if s['id']=='front-steering-close':
  s['instruction']+=' With the refitted front wheel supported clear on its final-torqued axle, verify smooth rotation without bearing play. Use a stable dial gauge at the PDF128 rim locations; record radial and lateral runout, each no more than 2.0 mm. Correct any binding or out-of-limit wheel before use.'
  s['source_pdf_pages']=sorted(set(s['source_pdf_pages']+[128,130]));s['record_required']=True
 for key in ['instruction','title']:
  s[key]=s[key].replace('N\u00c2\u00b7m','Nm')
for part in d['required_parts']:
 if 'source_pdf_page' in part:part['source_pdf_page']=mapping.get(part['source_pdf_page'],part['source_pdf_page'])
 part['purpose']=part.get('purpose','').replace('perOEM194','per OEM191').replace('OEM187/189','OEM184/186').replace('OEM190','OEM187')
d['required_parts'].append({'name':'New rear-brake pedal pivot O-rings','purpose':'Renew the two illustrated pedal-pivot seals when the pivot is removed; lithium-soap grease per PDF205/206.'})
next(s for s in d['steps'] if s['id']=='rear-frame-refit')['verification']=['Four rear-frame bolts 38 Nm; separate upper roller bolt 16 Nm; roller turns freely.']
next(s for s in d['steps'] if s['id']=='rear-frame-off')['verification']=['Four mapped frame bolts removed; separate upper roller/collar/bolt retained; no pinned-roller hardware on this 2025 route.']
pdf=fitz.open(PDF)
for i,s in enumerate(d['steps']):
 s['depends_on']=[d['steps'][i-1]['id']] if i else []
 s['source_links']+=[{'title':f'Yamaha 2025 owner/service manual, PDF {p}', 'url':URL+f'#page={p}'} for p in s['source_pdf_pages']]
d['source']['pdf_pages']=sorted(set(p for s in d['steps'] for p in s['source_pdf_pages']))
d['source']['printed_pages']=list(dict.fromkeys(x for p in d['source']['pdf_pages'] for x in re.findall(r'^\d{1,2}-\d{1,3}$',pdf[p-1].get_text(),re.M)[-1:]))
write(OUT,d)
write(HERE/'RECOVERY.json',{'status':'AUTHORING_SOURCE_REVIEW_IN_PROGRESS','target':d['target'],'candidate':OUT.name,'candidate_sha256':digest(OUT),'steps':len(d['steps']),'next':'Finish source-page visual review, audit every 2025 routing/closure and holding-method step, then submit candidate to root independent review. Never integrate this authoring snapshot.','database_writes':False})
print(OUT.name,len(d['steps']),digest(OUT))
