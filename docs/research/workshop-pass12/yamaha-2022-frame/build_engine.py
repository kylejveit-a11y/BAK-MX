"""Exact2022 candidate authoring. No approval or runtime publication is implied."""
import json,hashlib,re
from pathlib import Path
import fitz
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
PDF=Path('C:/Users/kylej/AppData/Local/Temp/B2W-2819U-12_02.pdf')
SHA='54b246fb2956c8970193b54cce160544ece74a7259169a188b6aacd8c9dd4608'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/B2W-2819U-12_02.pdf'
OUT=HERE/'engine-removal-refit-v1.procedure.json'
assert hashlib.sha256(PDF.read_bytes()).hexdigest()==SHA
if OUT.exists() and json.loads(OUT.read_text(encoding='utf8'))['source']['review_status']=='APPROVED':raise SystemExit('Frozen artifact: refusing overwrite')
template=ROOT/'docs/research/workshop-pass11/yamaha-2023-frame/engine-removal-refit-v1.procedure.json'
p=json.loads(template.read_text(encoding='utf8'))
p.update(target={**p['target'],'model_year':2022},id='yamaha-yz450f-2022-engine-removal-refit-v1',status='SOURCE_REVIEW_CANDIDATE',publication_status='NOT_APPROVED_NOT_IMPORTED',integration_status='AUTHORING_EXACT_SOURCE',scope_confirmed=True)
p['source']={'source_url':URL,'document_sha256':SHA,'document_revision':'B2W-2819U-12 / LIT-11626-35-03; First edition March2021','pdf_pages':[],'printed_pages':[],'review_status':'PENDING_INDEPENDENT_REVIEW'}
p['editorial_template']={'path':str(template.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(template.read_bytes()).hexdigest(),'scope':'Workflow scaffold only. Explicit per-step exact2022 source map and rewritten changed interfaces; no automatic applicability or numeric inheritance.'}
p['completeness']='Exact stock assembled bike to supported intact engine on a bench and back to assembled checks. Shock lower and connecting-arm frame joints are temporarily released for exhaust clearance. Oil-level check-bolt closure requires a documented external exact-interface specification; no unsupported torque is supplied.'
p['applicability']['included']='Exact stock US2022 YZ450F / YZ450FN, serviceable mounting interfaces, intact stock chain and functional brakes. ECU and coil remain bolted to the aircase. No automatic year inheritance.'
p['applicability']['excluded']+=['ECU mounting-fastener service: source table3.8Nm conflicts with exploded8Nm; retained mounts are not disturbed.','Oil-level check-bolt torque/seal prescription: documented exact-interface closure required before work.']
p['prerequisites']=[
'Before beginning, obtain and record a documented exact2022 oil-level check-bolt refit torque/seal requirement from an attributed source or qualified Yamaha service provider. The manual requires opening it for final level but does not defensibly identify its closure torque; no generic cover or pressure-check bolt value is adopted.',
'Confirm exact stock engine, intact chain and working rear brake. Photograph all routing, shim positions and control settings.',
'Independent chassis, engine, swingarm and shock support is required. Lower shock and frame-side connecting-arm bolts are released for exhaust clearance; keep the remaining joints assembled.',
'ECU and ignition coil stay mounted on the aircase. Confirm the complete retained assembly can be lifted after disconnecting its identified couplers and plug cap without blocking the three case bolts or loading wiring. If actual clearance requires ECU removal, resolve its conflicting source torque first.',
'Any separate internal bench work must return sealed covers/filter/strainer and documented timing, clearances, lubrication and free rotation. No internals are serviced here.',
'A replaced cylinder-head gasket needs the separate OEM266 warm3-minute pressure-test method; the retained-gasket cold check here does not complete that requirement.'
]
p['required_parts']=[{'name':n,'purpose':why} for n,why in [
('New engine-oil drain gasket','One20Nm drain is opened.'),('New coolant drain copper washer and specified coolant','10Nm drain closure and1:1 mixture.'),('New exact sprocket lock washer and stock-chain joint clip','One-use locking parts.'),('New exhaust-port gasket and two pipe-joint gaskets','All three exhaust seals renewed.'),('Recommended engine oil','Recorded.63/.65/.90L case selection and exact level/flow verification.'),('New two pedal-pivot O-rings','LS grease per194.'),('Replacement original-type wiring ties','Restore exact route and direction.'),('Molybdenum-disulfide grease and lithium-soap grease','Pivot and released suspension bolts M; pedal O-rings/pivot and throttle contacts LS.'),('OEM-specified LOCTITE locking agent','Drive sprocket nut; grade not named, record selected product.'),('Oil-level check-bolt sealing parts required by separately documented exact-interface closure','Do not infer a seal or torque from another fastener.')]]
p['affected_components']+=['shock','suspension']
p['remaining_gaps']=['Documented external oil-level check-bolt closure required; no inferred torque.','ECU mounting8Nm diagram/3.8Nm table conflict retained; mounts remain intact.','Internal engine work and replaced-head-gasket commissioning are separate.','No physical bike validation performed.']
p['external_operations']=[{'step_id':'engine-initial-record','operation':'Acquire exact oil-level check-bolt closure specification before dismantling','required_before_start':True},{'step_id':'engine-final-checks','operation':'Apply and record that documented check-bolt torque/seal closure after level check, before subsequent start or return to use'}]
for s in p['supplemental_sources']:s['scope']=s['scope'].replace('Yamaha BHR','Yamaha B2W')
S={s['id']:s for s in p['steps']}
M={}
def setstep(id,pages,instruction=None,verification=None):
 s=S[id];M[id]=pages
 if instruction is not None:s['instruction']=instruction
 if verification is not None:s['verification']=[verification]
# Explicit source locators for each unchanged or replaced action. No numeric page-offset conversion.

setstep('engine-initial-record',[87,91,89,194],S['engine-initial-record']['instruction']+' Record the exact oil-level check-bolt closure document, applicable fastener/seal and torque before proceeding; this value is not established by the available manual.','Exact bike, bench/supports, routing, initial7-12mm clutch free play and external check-bolt closure document recorded.')
setstep('control-renew-record',[87,149,153],'Record pull/return cable positions at the grip against the exact handlebar diagram and actual grip free play, specified3-6mm. Preserve routing and adjustment without swapping cables.','Original cable positions and actual free play recorded.')
setstep('engine-oil-drain',[89,90],'For a normally running engine, warm for several minutes, stop and wait about5minutes; do not run a faulted engine solely to warm oil. Stand upright on level ground. Remove filler cap and the single drain bolt over a container. Leave filter/strainer assembled unless separately serviced. Drain completely and refit the drain with a new gasket at20Nm. Mark the engine empty.','One drain closed with new gasket20Nm; engine marked empty.')
setstep('engine-access-prepare',[89,97,273])
setstep('engine-access-subseat',[35,117],'Lift the fuel-tank-cap cover with fingers under both sides, upward toward the rear as illustrated; retain its plastic-band attachment to the seat. Open cap, transfer fuel to an appropriate container with fuel-safe equipment, then secure cap.','Cap cover released intact; fuel safely contained and cap secured.')
setstep('engine-access-body',[115,116,117,118],'Remove the left side-cover fasteners first, then the seat fasteners and slide the seat rearward with its attached cap cover. Remove the right side cover by releasing its illustrated projections from the slots. Label collars and fastener positions.','Both covers and seat removed without damaging projections or plastic band.')
setstep('engine-isolate',[115])
setstep('engine-access-shrouds',[91,92,116],'Loosen the air-filter-cover quick-fastener screw. Release its two ribs from the air-scoop projections and slide the cover forward. Keep the filter installed. Remove left/right air scoops, releasing their illustrated projections, grooves and slots without prying. Retain collars.','Forward cover removal and scoop locators preserved; filter remains sealed.')
setstep('engine-access-tank-disconnect',[65,272,273])
setstep('engine-access-tank-remove',[272,273])
setstep('engine-access-case-release',[68,69,193,275],'Label and unplug ECU and ignition-coil couplers, disconnect intake-temperature coupler and pull the plug cap clear without removing the spark plug. Leave ECU and coil bolted to the aircase. Release only the routing clips needed to free their leads. Loosen case joint clamp and remove its three mounting bolts with original collars/washers/dampers. Do not disturb the ECU bolts because the manual gives conflicting tightening values.','Retained ECU/coil assembly disconnected from harness and plug; case bolts/clamp accessible without disturbing ECU mounts.')
setstep('engine-access-case-remove',[68,69,275],'Lift the complete aircase with retained ECU, coil and filter off the intake joint, supporting its high-tension lead and plug cap. Stop if a mount is inaccessible or the retained assembly cannot clear freely; do not force it or remove ECU mounts without resolving their torque conflict. Cover exposed intake and keep the removed assembly clean.','Case/ECU/coil clear and supported; inlet protected; all retained mounts unchanged.')
setstep('control-renew-housing-open',[149])
setstep('control-renew-ends-release',[149,153])
setstep('control-renew-inspect',[151,153])
setstep('engine-exhaust-silencer-remove',[192])
setstep('engine-exhaust-midpipe-remove',[192,196],'Loosen pipe2 joint clamp and remove its bracket bolt while supporting the pipe. With the shock lower and frame-side connecting-arm joints already released, move pipe2 through the exact illustrated clearance path and remove without forcing adjacent parts.','Exhaust2 clear without load on unsupported suspension or hoses.')
setstep('engine-exhaust-header-remove',[192,197])
setstep('engine-cooling-prepare',[96,97])
setstep('engine-cooling-drain',[97])
setstep('engine-cooling-seal',[97])
setstep('engine-coolant-hoses',[263,264])
setstep('engine-intake-clear',[275,276,278],'Label/disconnect injector, intake-pressure and throttle-position sensor couplers. Keep sensors installed. Clean lower joint, loosen clamp and lift intact throttle body clear. Support its detached grip-end cables without tension; body-end seats, screws and pulley stay untouched. Cover engine inlet and body openings; never push the throttle valve.','Three identified sensor/injector couplers disconnected; complete body/cables separately supported; calibration untouched.')
setstep('engine-electrical-left',[62,63,193],S['engine-electrical-left']['instruction'].replace('including the white 3-pin gear-position and gray 2-pin stator connectors','using the actual labeled connectors and exact source routing'))
setstep('engine-electrical-right',[64,65,206,228],'Disconnect coolant-temperature coupler and remove the head ground terminal bolt. Plug cap was released with the retained aircase group. At the starter lead pull back its rubber terminal cover and hold the motor-side nut with a spanner while undoing the lead nut. Release necessary lead clips and support harness clear. Leave motor and rigid motor covers installed; if terminal access is blocked, do not force it.','Ground, temperature and starter lead free; isolated battery; motor/covers retained.')
setstep('engine-sprocket',[52,56,194,195,240],S['engine-sprocket']['instruction'].replace('Remove the cover and flatten','Remove the sprocket cover and retained drive-chain guide, label their arrangement, and flatten'))
setstep('engine-release-cylinder',[91,232])
setstep('engine-pedal-guard',[194,63,65])
setstep('engine-engine-support',[194,196])
setstep('engine-mounts-out',[194,195,196],'Remove both upper brackets and the two lower brackets with four identified shims and their mapped hardware. Preserve left/right shim positions. Withdraw the pivot while maintaining swingarm support with the temporary shaft. Keep the engine independently supported until every mount is free.','Two lower brackets/four shims identified; shared pivot removed once with swingarm supported.')
setstep('engine-engine-out',[196])
setstep('engine-bench-record',[196])
setstep('engine-engine-in',[196,197],'Bring supported engine in from the right, lower part first. Align mounts without trapping hoses or leads. Apply molybdenum-disulfide grease to the pivot shaft and insert from the right while withdrawing temporary support, preserving original swingarm side stacks. No lithium grease on pivot-nut threads is specified here.','Engine and swingarm aligned; M-greased pivot from right; no newer-year nut preparation inherited.')
setstep('engine-mount-torque',[195,196,197],'Restore two lower brackets and four shims with shim projections toward the outside of the bike, plus both upper brackets and mapped hardware. Follow installation sequence: pivot nut85Nm; lower mount53Nm; front bracket bolts34Nm; front engine mount55Nm; upper bracket bolts34Nm; upper mounts45Nm. Keep the assembly supported/aligned throughout.','Shim projections outward; recorded85/53/34/55/34/45Nm at exact labeled joints.')
setstep('engine-release-refit',[56,91,232])
setstep('engine-pedal-refit',[194,62,63,64,65],'Install new pedal-pivot O-rings in both illustrated positions with lithium-soap grease. Grease pivot/seal contacts as shown and restore pivot bolt26Nm and return spring; engine guard7Nm. Restore head breather at engine and original holders: between radiator hose and engine bracket, outlet down aligned with lower down tube. Keep it clear of lower/front engine bosses and route radiator breather around it as illustrated.','Two new LS pedal seals;26/7Nm; head breather points down in exact route, not into aircase.')
setstep('engine-sprocket-refit',[52,102,194,240,242])
setstep('engine-ground-starter',[65,69,206,228],'Restore head ground terminal at its illustrated location7Nm; exact routing permits its terminal to face either way, so retain original untensioned routing. Restore starter lead6Nm while holding motor-side nut and replace rubber terminal cover. Restore its clamps and lead path along cylinder without slack.','Ground7Nm/starter6Nm; terminal supported during tightening; rubber cover/lead route restored.')
setstep('engine-harness-refit',[62,63,64,65,68,69],'Reconnect labeled stator, crank-position, gear-position and coolant-temperature couplers/covers. Stator passes behind radiator without tension-arm pinch; gear lead follows case inside front engine bracket without slack. Clutch cable must not sag down; protector contacts radiator hose outside stator/gear leads. Regulator leads stay inside tension arm. Restore frame clip lock forward and trim where shown; starter lead follows cylinder without slack. Reproduce the exact left/right routing and tie positions, distinguishing trimmed ties from those the source says leave uncut.','All identified engine couplers latched; cable/lead separation and exact ties restored; no inherited newer-year grommet arrangement.')
setstep('engine-intake-refit',[55,275,276,278],S['engine-intake-refit']['instruction']+' Reconnect all three labeled injector/pressure/TPS couplers without moving sensors.')
setstep('control-renew-lubricate',[153])
setstep('control-renew-ends-fit',[153])
setstep('control-renew-housing-close',[154])
setstep('control-renew-static-check',[87,88,155])
setstep('engine-hoses-refit',[55,263,264])
setstep('engine-exhaust-header-install',[192,197])
setstep('engine-exhaust-midpipe-install',[192,197],'Install new joint gaskets in the exact exploded locations. Refit clamp, pipe2 and bracket bolt. Engage clamp projection in pipe/silencer slot and keep clamp off the raised pipe projection. Leave final clamp/bracket torque until silencer is seated.','New joint seals and clamp projection/slot alignment correct.')
setstep('engine-exhaust-silencer-install',[192,197])
setstep('engine-exhaust-joints-final',[198])
setstep('engine-access-case-refit',[55,68,69,275],'Remove intake protection and seat complete aircase with retained ECU, coil and filter onto its original joint. Restore collars, dampers and washers; three case bolts7Nm and joint clamp3Nm. Reconnect labeled ECU, coil and intake-temperature couplers/covers. Restore sub-lead between ECU and case and clips fully against ribs; keep harness clear of rails/intake joint. Fully seat plug cap facing right within the illustrated10-degree range. ECU/coil mounts remain untouched.','Three7Nm case bolts/3Nm clamp; case-mounted electronics connected and original orientation preserved; plug cap fully seated facing right.')
setstep('engine-access-intake-check',[68,69,275],'Check case support, fully seated intake joints, reconnects and retained ECU/coil mounts. Verify no temporary covers remain and no wire lies pinched under case or between frame rail and joint. Filter remains correctly seated.','Sealed supported intake and retained electronics; all protection removed.')
setstep('engine-access-tank-install',[65,272,274],'Restore tank on its original four dampers and retained collars. Tighten two front mounts7Nm and rear retaining screw9Nm. Remove joint covers, press fuel joint until click and lock cover/holder. Reconnect white2-pin pump connector. Route BOTH fuel hose and pump lead through cover guide; keep pump lead outside hose, hose ahead of battery, with no pinch/kink.','Tank7/9Nm at exact mounts; fuel joint clicked/locked; both hose and lead guided.')
setstep('engine-cooling-fill',[96,97])
S['engine-cooling-fill']['instruction']=S['engine-cooling-fill']['instruction'].replace('PDF99','PDF96')
setstep('engine-cooling-cap',[97,98])
setstep('pressure-test',[265,266])
setstep('engine-oil-fill',[47,89,90],'Record applicable oil quantity:.63L unchanged filter,.65L filter removal,.90L disassembled engine. Use source-listed Yamalube/API SG-or-higher JASO MA with SAE10W40,10W50,15W40,20W40 or20W50 selected against the ambient-temperature chart. No additives. Record product and actual quantity, check filler cap/seal condition and install cap. Do not copy newer-year filler O-ring grease/replacement instructions absent here. Flow and exact final level checks remain required.','Actual oil product and case-specific quantity recorded; cap secure; no unsupported filler torque/preparation.')
setstep('engine-battery-refit',[70,71,115],'Recheck interfaces, reconnect positive before negative and restore positive cover. Both battery leads pass UNDER the crossmember; source permits either relative order. Negative lead coupler sits right of starter relay; restore battery bracket clips and protect all conductors from frame contact.','Positive then negative; both under crossmember; covers/clips restored.')
setstep('engine-access-body-install',[35,93,115,116,117,118],'Fit air-scoop projections into aircase holes, grooves over ribs and remaining projections into slots; bolts7Nm. Refit aircase cover with its two rear slots engaging case edges and left/right ribs aligned with scoop projections; secure quick-fastener screw and restore fuel breather to cover as illustrated. Refit right-cover projections/slots with its rib under rear-fender rib. Slide seat forward and secure its two bolts22Nm; ordinary cover fasteners7Nm. Restore fuel-cap cover with attached plastic bands all the way under seat.','Scoop/cover locators seated;22Nm seat and7Nm ordinary covers; cap-cover bands under seat; breather restored.')
setstep('engine-slack',[102])
setstep('engine-torque',[102])
setstep('engine-sprocket-final',[56,194,195],S['engine-sprocket-final']['instruction'].replace('fit the sprocket cover at 7 Nm','restore the retained drive-chain guide in its original position and fit the sprocket cover at7Nm'))
setstep('engine-fuel-ready',[35,36,272,274],'Lift fuel-cap cover and add clean recommended unleaded minimum91(R+M)/2 gasoline; E10 permitted. Secure cap and restore cover with bands under seat. Verify latched pump connector and fuel hose/holder and no fuel leak. Select neutral in a ventilated area before starter operation.','Correct fuel/cap/cover; no leaks; neutral and ventilation.')
setstep('engine-oil-flow',[90,91])
setstep('engine-cooling-warm-cool',[87,98])
setstep('control-renew-idle-check',[87])
setstep('control-renew-final-adjust',[88])
setstep('control-renew-steering-check',[88])
setstep('engine-complete-cooling',[98])
setstep('engine-cooling-recheck',[96,98])
setstep('engine-final-checks',[89,91,102],'Follow exact oil-level method upright on level ground: warm2-3minutes, stop and wait about1minute. Verify oil above the minimum window mark. Place a container, remove the identified level-check bolt and verify oil does not run out; if it does, drain excess until last drop. If at/below minimum, add correct oil above minimum and repeat exact check. Restore check bolt/seal using the documented exact-interface closure obtained before work; record source, actual torque and seal action. Do not restart or return to use with this closure unresolved. Check leaks, clutch7-12mm, throttle3-6mm/full return, brakes firm, chain50-60mm and recorded warm steering idle. Record mount/fluid/support closure and any separate bench record.','Actual final level and documented check-bolt closure recorded; all fluid/chain/control/support checks complete; no unresolved leak/binding.')

# Final direct source cross-checks: 2022 sprocket nut has no locking-agent instruction.
p['required_parts']=[x for x in p['required_parts'] if x['name']!='OEM-specified LOCTITE locking agent']
setstep('engine-sprocket-final',[22,56,182,184,194,195],'With rear axle and adjusters torqued, chain installed and rear brake firm, keep neutral and have a helper hold the rear brake. Tighten the hand-fitted sprocket nut90Nm with a torque wrench. The exact2022 source gives no locking-agent preparation for this nut; do not inherit it from another year. Bend the new lock-washer tabs firmly against the nut flats. Restore the retained chain guide/bracket and cover at7Nm. No impact, heat or case jamming.','Nut90Nm/new washer tabs locked; original guide/bracket restored; cover7Nm; brake holding load controlled.')
S['engine-sprocket-refit']['instruction']=S['engine-sprocket-refit']['instruction'].replace('final LOCTITE preparation, torque and tab locking','final torque and tab locking')
M['engine-sprocket-refit']+=[22,183,184]
M['engine-sprocket']+=[22,182,183]
M['engine-isolate']+=[23]
M['engine-battery-refit']+=[23]
assert set(M)==set(S),set(S)-set(M)
for s in p['steps']:
 s['source_pdf_pages']=M[s['id']]
 s['source_links']=[{'title':f'Yamaha2022 owner/service manual PDF{n}','url':URL+f'#page={n}'} for n in M[s['id']]]
 if s['id'] in ['engine-sprocket','engine-sprocket-final']:s['source_links'].append({'title':'Nick Dole manual rear-brake holding technique','url':p['supplemental_sources'][0]['url']+'#page=5'})
 # Old exact source symbols may have display-only encoding damage; no frozen bytes are changed.
 for k in ['instruction','title']:s[k]=s[k].replace('\u00c2\u00b7','\u00b7')
 s['verification']=[v.replace('\u00c2\u00b7','\u00b7') for v in s['verification']]
# Exhaust access explicitly releases two suspension joints in this generation.
def extra(id,title,instruction,verification,pages):return {'id':id,'title':title,'instruction':instruction,'verification':[verification],'record_required':False,'diagram_reference_required':True,'depends_on':[],'source_pdf_pages':pages,'source_links':[{'title':f'Yamaha2022 owner/service manual PDF{n}','url':URL+f'#page={n}'} for n in pages]}
release=extra('engine-exhaust-suspension-release','Support suspension and open the exhaust clearance path','Support chassis, swingarm/rear wheel and shock independently so neither released joint carries spring or bike load. Remove the shock lower bolt and connecting-arm frame-side bolt as the exhaust prerequisites require. Preserve collars/seals and support the arm/shock without hanging from the remaining joints. Keep upper shock and other linkage pivots assembled.','Two required access bolts removed under support; collars/seals retained; other joints untouched.',[173,174,175,178,192])
refit=extra('engine-exhaust-suspension-refit','Restore the two suspension access joints','With exhaust fully seated and torqued, align supported shock lower and connecting-arm frame joints with their retained collars/seals. Apply molybdenum-disulfide grease to the disturbed bolt circumference and threads. Insert connecting-arm frame bolt from RIGHT and shock lower bolt from LEFT. Tighten frame connecting-arm nut80Nm and shock lower nut53Nm. Inspect unobstructed movement and full seating; retain support until closure is verified.','Correct bolt directions, M grease, frame80Nm and shock lower53Nm; no trapped seal or binding.',[174,175,178,192])
ix=next(i for i,s in enumerate(p['steps']) if s['id']=='engine-exhaust-silencer-remove');p['steps'].insert(ix,release)
ix=next(i for i,s in enumerate(p['steps']) if s['id']=='engine-exhaust-joints-final');p['steps'].insert(ix+1,refit)
for i,s in enumerate(p['steps']):s['depends_on']=[] if i==0 else [p['steps'][i-1]['id']]
p['source']['pdf_pages']=sorted({n for s in p['steps'] for n in s['source_pdf_pages']})
d=fitz.open(PDF)
for n in p['source']['pdf_pages']:
 page=d[n-1];footer=page.get_text(clip=fitz.Rect(0,page.rect.height-75,page.rect.width,page.rect.height))
 labels=re.findall(r'(?m)^\s*(\d+-\d+)\s*$',footer);assert labels,(n,footer)
 p['source']['printed_pages'].append(labels[-1])
# Preserve actual new source requirements and distinguish their external completion record.
p['required_tools']=[{**t,'name':t['name'].replace('Ruler/free-play gauge','Ruler/free-play gauge').replace('90890-03264 and supplied instructions','90890-03264, FI sub-lead90890-03212/YU-03212 and OBD/GST lead kit90890-03249 with supplied instructions')} for t in p['required_tools']]
p['required_tools'][0]['name']='Stable motorcycle stand plus independent engine, swingarm and shock supports, temporary pivot-support shaft and helper'
p['source']['review_note']='Exact2022 author candidate; independently reviewed frozen2023 scaffold is not mechanical authority for this redesign. ECU retained-assembly adaptation and external oil-check closure require explicit review.'
OUT.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({'steps':len(p['steps']),'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),'status':p['status']}))

m={'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':'yamaha-2022-yz450f-owner-service','url':URL,'local_pdf_path':str(PDF),'sha256':SHA}],'artifacts':[{'path':OUT.name,'kind':'procedure','sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),'source_id':'yamaha-2022-yz450f-owner-service','target':p['target']}]}
(HERE/'source-review-manifest.json').write_text(json.dumps(m,indent=2)+'\n',encoding='utf8',newline='\n')
