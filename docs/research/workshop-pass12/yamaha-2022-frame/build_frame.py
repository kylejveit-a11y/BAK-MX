"""Exact2022 frame candidate. Prior-year geometry is not an applicability source."""
import json,hashlib,re,copy
from pathlib import Path
import fitz
H=Path(__file__).resolve().parent;R=H.parents[3]
def rd(x):return json.loads(x.read_text(encoding='utf8'))
def wr(x,v):x.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
def sha(x):return hashlib.sha256(x.read_bytes()).hexdigest()
PDF=Path('C:/Users/kylej/AppData/Local/Temp/B2W-2819U-12_02.pdf');SHA='54b246fb2956c8970193b54cce160544ece74a7259169a188b6aacd8c9dd4608';assert sha(PDF)==SHA
URL='https://library.ymcapps.net/library/om/contents/pdf/10/B2W-2819U-12_02.pdf';out=H/'frame-bearing-renewal-reassembly-v1.procedure.json'
if out.exists() and rd(out)['source']['review_status']=='APPROVED':raise SystemExit('Frozen source: refusing overwrite')
base=R/'docs/research/workshop-pass11/yamaha-2023-frame/frame-bearing-renewal-reassembly-v1.procedure.json';assert sha(base)=='7079c8378e79d4525d909e06c3f5fc4c1dbbe62b870bf4321bcd4b697f7721e3'
access=H/'engine-removal-refit-v1.procedure.json';assert sha(access)=='cbf8d699bd55eea9bd8d5ba98c459829dc8aa94110736340679fc3b4f5f2244a'
e=rd(access);E={s['id']:s for s in e['steps']};p=rd(base)
p.update(id='yamaha-yz450f-2022-frame-bearing-renewal-reassembly-v1',target=e['target'],status='SOURCE_REVIEW_CANDIDATE',publication_status='NOT_IMPORTED',integration_status='AUTHORING_EXACT_SOURCE',source=copy.deepcopy(e['source']))
p['source'].update(review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact2022 chassis source review candidate; engine access dependency approved, conditional external oil-check and wheel-seal endpoints remain explicit.')
p['editorial_template']={'path':base.relative_to(R).as_posix(),'sha256':sha(base),'scope':'Order scaffold only; all chassis stages assigned exact2022 sources and source changes explicitly authored.'}
p['operation_dependencies']=[{'artifact':access.relative_to(R).as_posix(),'sha256':sha(access),'scope':'Approved exact2022 engine interface and closure, with composition cutpoints preserving single pivot and deferred suspension clearance closure.'}]
p['steps']=[copy.deepcopy(E[s['id']]) if s['id'] in E else s for s in p['steps']]
S={s['id']:s for s in p['steps']};M={s['id']:s['source_pdf_pages'] for s in p['steps'] if s['id'] in E}
def edit(id,pages,instruction=None,verification=None):
 s=S[id];M[id]=pages
 if instruction is not None:s['instruction']=instruction
 if verification is not None:s['verification']=[verification]

edit('rear-prepare',[123,124])
edit('rear-remove',[123,124])
edit('rear-inspect',[120,124])
edit('rear-brake-free',[59,72,73,138])
edit('rear-shock-lower',[173,175,178],'Lower shock and connecting-arm frame bolts were already removed for exhaust access. Keep swingarm and shock supported. Remove ONLY connecting-arm-to-relay and relay-to-swingarm bolts now; keep each collar/washer/seal stack with its identified joint. Other removed bolts remain labeled for final closure.','Previously released lower/frame joints not repeated; remaining two linkage joints identified and removed.')
edit('swingarm-off',[179,180,196])
edit('arm-inspect',[177,180])
edit('shock-upper-off',[173,174,176])
edit('front-setup',[167,172],'Record both fork clicker settings and current height. This route restores exact2022 standard5mm projection. Independently support stripped chassis with front wheel clear; engine/rear wheel are removed.','Actual settings recorded; exact5mm refit target and stand support established.')
edit('front-plate',[66,67,117],'Remove plate bolt, release its band projection, and remove clutch cable from the plate guide. Pull plate off the lower steering-bracket projection. Keep the front brake hose in front of the plate without stress; do not copy a front-fender locating projection from another year.','Plate/lower-bracket projection and clutch guide released; brake hose supported.')
edit('front-bar-off',[149,150,151,156,169],'Record both lower-holder offset orientations and the four rubber damper/washer positions against the source. Remove the two lower-holder nuts and lift the complete bar with upper/lower holders and controls still assembled. Retain all four dampers and washers in order. Support bar/closed hydraulics without loading cables; the throttle tube and grip-end cables are already detached. Leave the four upper-holder bolts untouched. With fork legs still clamped, loosen steering-stem nut for later removal.','Lower-holder positions/four dampers recorded; complete bar/holders supported; upper-holder bolts unchanged.')
edit('front-wheel-remove',[119,120])
edit('front-caliper',[58,127,134])
edit('front-protectors',[156])
edit('front-legs-remove',[156,167])
edit('front-bench-check',[156,162])
edit('front-fender-off',[169])
edit('front-stem-out',[169,170])
edit('front-steering-inspect',[170])
edit('steering-renew-old-races-out',[170],'Use exact steering-head illustrations: remove both head races with long rod/hammer and lower-bracket race with chisel/hammer while protecting frame/stem. Discard old matched bearing/race sets. Clean/inspect empty seats before fitting new sets.','Old matched sets removed; seats undamaged and clean.')
edit('radiators-off',[263,264])
edit('rear-electrical-free',[64,65,70,71,115],'Battery already isolated. Release band and lift battery. Unplug CCU, main-relay and starter-relay harness couplers/covers; retain units/holders on rear frame. Free main loom clips/ties as shown. Keep starter/positive leads on relay and carry with rear-frame assembly; starter engine terminal is already free. ECU/coil were removed intact with aircase, not this rear frame.','Rear couplers and clips free; retained rear units supported; ECU not falsely located on rear frame.')
edit('rear-frame-off',[59],S['rear-frame-off']['instruction'].replace('2023','2022'),'Four mapped bolts and separate upper roller/collar retained; no tethered group.')
edit('loom-control-off',[57,60,62,63,64,65,68,69],'Throttle body/cables and case/ECU/coil are already disconnected and supported separately. Release remaining frame holders/ties using exact routing. Unbolt rectifier/regulator but leave its housing intact. Identify/disconnect frame ground terminal and record its location. Lift main loom and supported bar/closed front brake/cable clutch clear without loading any line; do not remove nonexistent separate aircase/coil brackets from a later design. Keep switches and hydraulic circuits assembled.','All groups independently supported; regulator/frame ground released; ECU/coil mounts retained.')
edit('remaining-brackets',[59,60,170])
edit('frame-inspection',[170,180])
edit('rear-renew-disc-sprocket-off',[123,124])
edit('rear-renew-seals-clip-out',[120,123,124])
edit('rear-renew-bearings-out',[120,123,125],'Use suitable bearing puller to remove single right bearing after circlip removal; retain internal spacer and remove both left bearings. Preserve side/order from exact exploded diagram. Support hub and do not pull against retained hardware.','Three old bearings removed; right circlip already removed; spacer retained.')
edit('rear-renew-hub-inspection',[120,124])
edit('rear-renew-right-bearing',[22,123,125],'Install new right/disc-side bearing FIRST into original seat, pressing outer race square/parallel with matching driver. Seal faces outward as exact source instructs. Apply lithium-soap grease to bearing per source. Do not load inner race or spin with air.','Right bearing first; outward sealed face; outer-race load only.')
edit('rear-renew-new-circlip',[22,123,125],'Install matching new right-side circlip with general edge/force orientation. Avoid overexpansion; verify full groove seating before seal. If groove is blocked, correct bearing/retainer fit rather than forcing clip.','New correct circlip fully seated in right groove.')
edit('rear-renew-spacer-left-bearings',[123,125],'Locate original serviceable internal spacer between right bearing and left pair, then install both matching new left bearings in exact exploded order with outward sealed face. Grease bearings with lithium-soap grease and press outer races squarely with matching driver. Verify correct spacer location and smooth movement.','Spacer retained; both left bearings installed with correct orientation and smooth stack.')
edit('rear-renew-new-seals',[22,123,125],'Use the documented exact rear-hub seal-seating endpoint acquired before work; the available2022 manual does not give the later1mm numeric recess. Apply lithium-soap grease to new seal lips, marked faces outward and main lips toward hub. Drive each evenly with matching outer-diameter tool to that documented endpoint. Record both actual positions and source, then verify collar/seal engagement. Do not invent a recess from the drawing.','Documented exact rear-hub endpoint and both actual seal positions recorded; no later-year1mm assumption.')
edit('rear-renew-sprocket-refit',[123,124,125])
edit('rear-renew-disc-refit',[123,125])
edit('front-renew-inspect',[120])
edit('front-renew-seals-out',[120])
edit('front-renew-bearings-out',[119,120,121])
edit('front-renew-hub-check',[120,121])
edit('front-renew-left-bearing',[22,120,121],S['front-renew-left-bearing']['instruction']+' Apply source-specified lithium-soap grease to bearing.')
edit('front-renew-spacer-right',[22,120,121],S['front-renew-spacer-right']['instruction']+' Apply source-specified lithium-soap grease to bearing.')
edit('front-renew-seals-in',[22,120,121],'Use documented exact front-hub seal-seating endpoint obtained before work; no later-year0mm depth is asserted by this2022 source. Grease lips with lithium-soap grease, marks outward/main lips toward hub, and install square with matching seal-diameter driver to that documented endpoint. Record actual position of both seals and source.','Exact front-hub endpoint and actual seal positions recorded; no inferred flush setting.')
edit('front-renew-bearing-check',[120,121])
edit('linkage-renew-stack-record',[175,179],'Photograph both swingarm ends and each linkage joint against exact exploded diagrams. Remove collars,seals,thrust bearings,bushes and washers in order. Retain identified serviceable washers separately. Swingarm has four pivot bearings; relay four and connecting arm two, with eight relay washers. Do not mix washer groups or press through retained hardware.','All original stacks recorded, four swingarm/six linkage bearings and eight relay washers accounted.')
edit('linkage-renew-bearings-out',[175,179,180])
edit('linkage-renew-swingarm-bearings-in',[179,180],'Pack new bearings and lubricate pivot stack with molybdenum-disulfide grease. Use fitting needle-support mandrel per Motion Pro figures3-4 and support housing squarely. OEM requires OUTER bearings first, then inner bearings at dimension b6.5mm measured from inside as shown. Record both sides. Do not substitute tool-example bottoming endpoint.','Outer-before-inner order and both6.5mm positions recorded; fitted needles supported.')
edit('linkage-renew-swingarm-seals',[179,180],'Restore two new matched bushes, two thrust bearings, four new seals and inspected collars in exact exploded order. Apply molybdenum grease. Measure all four seal recesses a0–0.5mm at illustrated bore faces; follow cross-section lip orientation and general marked-face-out guidance. Record each depth and stack.','Four0–0.5mm seal readings and all side stacks recorded.')
edit('linkage-renew-relay-renew',[175,177],'Install four relay bearings with fitting mandrels/supported housing at exact0mm bearing end-face locations. Molybdenum-grease bearings, washers, seals and collars. Restore inner washers, four new seals, matched collars and outer washers in exact exploded/cross-section order. Record flushness and both four-washer groups; bearing0mm is not a generic seal depth.','Four relay bearings flush; eight washers in two correct groups; four seals and collars restored.')
edit('linkage-renew-connecting-renew',[175,177],'Install two connecting-arm bearings at exact0mm illustrated bearing positions with fitting mandrels. Molybdenum-grease marked bearing/seal/collar surfaces. Restore two new seals and matched collar in shown orientation. Record bearing positions and smooth collar movement.','Both bearing0mm positions recorded; no seal-depth inference.')
edit('eyes-renew-eye-stack',[173,174,177],S['eyes-renew-eye-stack']['instruction'].replace('PDF180','PDF173/174'))
edit('eyes-renew-eye-extract',[173,174,176,177])
edit('eyes-renew-upper-eye-in',[174,177],S['eyes-renew-upper-eye-in']['instruction'].replace('PDF184','PDF177').replace('PDF180','PDF174'))
edit('eyes-renew-lower-eye-in',[173,177,178],'Fit new lower bearing/bushing and correct collars to exact cross-section. Apply molybdenum grease to bearing and dust-seal lips but keep press-fit bearing outer race DRY as OEM warns. Fit two new dust seals lips inward. Measure each installed-depth a from the eye housing outer face to the bearing1 face shown in the exact cross-section:4.25mm. Do not substitute a seal or collar reference surface. Record both readings and smooth collar movement.','Exact illustrated4.25mm a dimensions recorded both sides; dry outer race/M lips and inward seal lips confirmed.')
edit('steering-renew-head-races-in',[170])
edit('steering-renew-lower-bearing-in',[170,171])
edit('frame-small-refit',[59,60])
edit('rear-frame-refit',[59])
edit('loom-control-refit',[57,60,62,63,64,65,68,69],'Restore supported throttle-body/cable and bar/closed-brake assemblies near original positions. Route loom along exact tank-rail path and engage frame projections. Refit regulator7Nm and frame ground7Nm at original locations. ECU and coil stay on removed aircase until that closure. Injector/pressure/TPS remain disconnected until engine/body refit. Preserve connector covers and supports without trapping harness in engine opening.','Regulator/frame ground7Nm; frame locators seated; retained groups supported and engine opening clear.')
edit('rear-harness-route',[64,65,70,71,115],'Restore main relay, starter relay and CCU couplers/covers and battery bracket clips. Route starter/relay tie within20mm cross-tube width, lock DOWN, tail INSIDE rear frame UNCUT. Starter lead follows inside rear frame/rear fender; restore exact pink fuel-hose and white harness tape markers, original slack and remaining trim exceptions per right-side drawing. Both battery leads go UNDER crossmember; their relative order is unrestricted. Fit battery/band but leave terminals isolated.','Exact2022 rear tie directions/uncut exception and lead paths restored; battery remains isolated.')
edit('radiators-refit',[55,63,65,263,264],S['radiators-refit']['instruction'].replace('behind the upper boss, ahead of the lower boss','behind the upper boss, behind the cylinder-head breather, ahead of the lower boss'))
edit('shock-upper-refit',[174,178])
edit('front-steering-grease',[169,170,171])
edit('front-preload',[60,103,170,171])
edit('front-upper-refit',[169,171,172])
edit('front-legs-refit',[167])
edit('front-height-clamps',[167,172],S['front-height-clamps']['instruction'].replace('7 mm','5 mm'),'Both actual5mm projections recorded; both clamps21Nm.')
edit('front-bar-refit',[60,149,150,151,152,167],'Refit front fender with four bolts10Nm. Restore four dampers and original washer/holder stack; lower-holder longer-offset side faces rear in the standard orientation, or restore recorded source-permitted reversed offset if previously confirmed. Refit the complete bar/holder assembly in its recorded positions and tighten both lower-holder nuts40Nm. Upper holders/bar alignment remained clamped; do not repeat their undisturbed bolt operation. Confirm secure bar, clear controls and full steering movement; verify no tank contact after tank refit.','Fender10Nm; four dampers and original offset correct; both lower-holder nuts40Nm; upper-holder bolts retained.')
edit('front-guards-brake',[58,127,134,168],S['front-guards-brake']['instruction'].replace('protectors at 7','protectors at 5'),'Protectors5Nm, caliper28Nm and original hose holder9Nm with source paint-mark alignment.')
edit('front-wheel-refit',[119,121])
edit('front-control-route',[66,67,117],'Route clutch cable behind number-plate band and through plate guide. Brake hose passes FRONT of number plate. Start/launch leads pass LEFT of plate bracket. Engine-stop/mode and start leads pass between frame and cable guide. Restore handlebar lead ties as shown, ends UNCUT. Do not inherit newer-year plate upper/lower brake-hose guides.','Exact2022 clutch, brake and switch lead paths; uncut tie ends restored.')
edit('front-plate-settings',[60,117,168],'Engage plate on LOWER STEERING BRACKET projection, place clutch cable in its guide and secure plate projection in band UPPER hole. Keep brake hose in front. Plate bolt7Nm. Restore recorded fork rebound/compression via gently seated hard reference, matching intended sides.','Plate lower-bracket/band/clutch routing correct7Nm; original clickers restored.')
edit('rear-link-refit',[175,178],'Lubricate only connecting-arm-to-relay and relay-to-swingarm bolt circumference/threads with molybdenum grease. Fit both from LEFT with renewed collars/seals and correct washers. Keep frame-side connecting-arm and lower-shock joints supported but OPEN for exhaust refit clearance. Their two bolts close in the explicit post-exhaust step.','Two internal linkage bolts from LEFT; frame/lower-shock clearance joints remain supported/open.')
edit('rear-link-torque',[175,178],'Tighten connecting-arm-to-relay nut80Nm and relay-to-swingarm nut70Nm. Upper shock already restored56Nm. Keep frame connecting-arm and lower shock bolts out until exhaust closure; do not load unsupported suspension.','Relay80/70Nm; upper56Nm recorded; other two joints deliberately deferred.')
edit('rear-brake-refit',[59,72,73,138])
edit('rear-refit',[125,126],S['rear-refit']['instruction'].replace('Push the wheel forward and put the chain onto the sprocket.','Keep the chain removed for now; the later explicit sprocket/chain step installs and joins it.'),'Wheel/disc/caliper bracket and left greased axle located; chain remains removed until its explicit installation step.')
edit('rear-hardware',[126])
edit('rear-renew-close',[120,124,126],'With wheel on final-torqued axle and supported off ground, verify rotation, bearing play and brake function. Measure radial/lateral runout using stable dial gauge at exact rim locations; each limit2mm. Save replacements, spacer/circlip checks and documented seal-endpoint plus actual positions. Resolve binding or out-of-limit runout before use.','Runout both2mm-or-less; bearings smooth; documented seal endpoints/actual positions retained.')
edit('front-seat-torque',[121,122])
edit('front-steering-close',[120,122,172],'After final axle tightening, check steering free from play/binding, smooth fork action, firm front brake and clear hoses. With front wheel raised on its torqued axle verify rotation/play and record radial/lateral runout at exact rim locations using stable gauge; each limit2mm. Resolve any binding or out-of-limit wheel.','Steering/fork/brake/wheel checks complete; both runout readings2mm-or-less.')
edit('frame-final',[87,88,102,120,124,151,172,177,178,180],'Verify steering/lock clearance, smooth suspension, both wheel/brake functions, chain, footrest return, all disturbed fasteners and fluids. Record separate engine/component work and faults. With tank installed verify bar does not contact tank at either lock. Confirm wheel seal positions against documented exact endpoints, wheel bearing/spacer/circlip stacks, steering seats, swingarm6.5mm and0–0.5mm seals, linkage0mm bearings and shock-eye4.25mm reference. Exact oil-check-bolt closure must be recorded. No housing refit implies unperformed renewal; no structural repair or physical validation is claimed.','All real measurement/closure records saved; external oilbolt/wheel endpoints accounted; no unresolved defect concealed.')

# Composition-specific single-pivot and chain context.
S['engine-bench-record']['instruction']='Confirm documented checks for any separate internal work; engine internals remain assembled here. Verify renewed swingarm side stacks and all measured depths. Molybdenum-grease specified contacts and position supported swingarm with renewed stacks. Next shared pivot locates both arm and engine once.'
S['engine-bench-record']['verification']=['Renewed swingarm stacks/depths and any separate internal record accepted; single pivot replacement ready.']
M['engine-bench-record']=[179,180,196]
S['engine-engine-in']['instruction']=S['engine-engine-in']['instruction'].replace('preserving original swingarm side stacks','preserving newly renewed swingarm side stacks')
S['engine-sprocket-refit']['instruction']=S['engine-sprocket-refit']['instruction'].replace('With the supported rear wheel still installed, loosen the axle nut and both adjuster locknuts and back off adjusters enough to bring the wheel forward for chain installation. ','')
# Before dismantling, record endpoint sources. These records cannot be bypassed in this unbranched sequence.
S['engine-initial-record']['instruction']+=' Also acquire and record exact front/rear hub seal-seating endpoints from an attributed exact-interface source before removing any wheel seals. OEM2022 lacks the later numeric recess values; never infer0mm/1mm. Record stock frame, wheel and bearing identities, existing condition and complete routing photographs.'
S['engine-initial-record']['verification'].append('Exact front/rear wheel seal endpoint documents and installed hub identities recorded before work.')
for id in ['engine-initial-record','rear-renew-new-seals','front-renew-seals-in','eyes-renew-lower-eye-in','front-height-clamps','frame-final']:S[id]['record_required']=True
assert set(M)==set(S),set(S)-set(M)
for s in p['steps']:
 s['source_pdf_pages']=M[s['id']]
 oldlinks=[x for x in s.get('source_links',[]) if 'ymcapps' not in (x if isinstance(x,str) else x['url'])]
 s['source_links']=[{'title':f'Yamaha2022 owner/service manual PDF{n}','url':URL+f'#page={n}'} for n in M[s['id']]]+oldlinks
# Add new-generation release before silencer, but closure only after all exhaust joints.
for anchor,id in [('engine-exhaust-silencer-remove','engine-exhaust-suspension-release'),('engine-exhaust-joints-final','engine-exhaust-suspension-refit')]:
 ix=next(i for i,s in enumerate(p['steps']) if s['id']==anchor)+(1 if id.endswith('refit') else 0)
 addition=copy.deepcopy(E[id])
 if id.endswith('refit'):addition['instruction']=addition['instruction'].replace('retained collars/seals','newly renewed collars/seals')
 p['steps'].insert(ix,addition)
for i,s in enumerate(p['steps']):s['depends_on']=[] if i==0 else [p['steps'][i-1]['id']]
p['title']='Strip the stock frame, renew chassis bearings and reassemble the bike'
p['completeness']='Exact2022 assembled stock bike to exposed serviceable main frame, then steering, swingarm/linkage, wheel and sealed shock-eye bearing renewal and reassembly. Conditional on documented exact wheel-seal endpoints and oil-check-bolt closure acquired before work. Bonded pads remain; no structural repair or engine internal completion is implied.'
p['applicability']={'included':'Exact stock US2022YZ450F / YZ450FN with serviceable frame and original interfaces, documented required external closure values and intact working brake/chain holding system.','excluded':e['applicability']['excluded']+['Structural frame repair, pressed-seat machining, paint stripping and removal of bonded pads.','Unknown wheel-seal seating endpoints: obtain exact-interface documentation before this route.','Tire/spoke/sprocket replacement and internal suspension service are separate.']}
p['prerequisites']=e['prerequisites']+['Document exact front/rear hub seal seating endpoints and source before dismantling. OEM2022 does not specify the later0mm/1mm numeric depths; unknown endpoints are not inferred.','Confirm all universal bearing-tool drivers/receivers physically fit the actual interface, load only the fitted ring and support the housing without obscuring required depth measurements.','Bonded pads remain; serviceable frame geometry is required. Steering races and removable controls/closed hydraulics are removed, while ECU and coil remain mounted to aircase.']
p['prerequisites']=[x.replace('keep the remaining joints assembled.','remaining linkage joints are removed once in the frame stage.') for x in p['prerequisites']]
p['required_parts']=copy.deepcopy(e['required_parts'])+[
 {'name':'Exact new matched steering bearings/races/dust seal','purpose':'Renew upper/lower matched sets.'},
 {'name':'Exact wheel bearings, seals and new rear circlip','purpose':'Front2 and rear3 bearings; four seal endpoints must be externally documented before work.'},
 {'name':'New rear sprocket self-locking nuts','purpose':'Six removed during wheel work; original serviceable sprocket retained.'},
 {'name':'Exact new swingarm bearings/bushes/seals and serviceable thrust bearings/collars','purpose':'Four bearings/four seals; source depth and stack checks.'},
 {'name':'Exact new linkage bearings/collars/seals','purpose':'Six bearings/six seals; eight relay washers retained if serviceable.'},
 {'name':'Exact new shock-eye bushings/bearing, seals, O-rings and stopper ring','purpose':'Closed shock eyes only; no gas release.'},
 {'name':'OEM-specified LOCTITE locking agent','purpose':'Footrest-bracket and wheel-disc bolts only, not the dry2022 drive-sprocket nut; record actual product, grade unspecified.'}]
# Keep source-bound universal bearing tools, while replacing engine-only old assumptions.
p['required_tools']=copy.deepcopy(e['required_tools'])+[
 {'name':'Calibrated torque tools additionally reaching145Nm, accurate at5/7/12/28/42/55/56/70/80Nm for chassis joints'},
 {'name':'Steering nut wrench90890-01403/YU-A9472 used at right angle; cap ring wrench90890-01501/YM-01501'},
 {'name':'Motion Pro08-0544 stem tool and08-0669 race installer with actual fitting drivers/adapter;14/24mm wrenches and protective block/soft mallet'},
 {'name':'Motion Pro08-0294 bearing tool with actual fitting needle-support mandrels and receivers; appropriate vise support'},
 {'name':'Hub bearing pullers, matching outer-race/seal drivers, circlip pliers and protective cloth/screwdriver'},
 {'name':'Depth gauge and straight references for exact source dimensions and externally documented wheel-seal endpoints'},
 {'name':'Stable dial gauge mount for rim radial/lateral runout on installed supported axles'},
 {'name':'Long rod/hammer and chisel for OEM race removal; clean storage and kerosene for specified cleaning'}]
p['external_operations']=copy.deepcopy(e['external_operations'])+[
 {'step_id':'engine-initial-record','operation':'Acquire exact front/rear wheel seal seating endpoint documents before work','required_before_start':True},
 {'step_id':'rear-renew-new-seals','operation':'Apply and record externally documented exact rear-hub seal positions'},
 {'step_id':'front-renew-seals-in','operation':'Apply and record externally documented exact front-hub seal positions'}]
p['remaining_gaps']=copy.deepcopy(e['remaining_gaps'])+['Exact front/rear wheel seal-seating endpoints not numerically stated in available OEM source; external documentation required before work.','No structural/paint/pressed-seat machining, tire renewal or suspension internal completion.']
p['entry_state']=['Assembled exact stock2022 bike; identified original interfaces; external oil-check and wheel-seal closure documents acquired.']
p['exit_state']=['Serviceable frame reassembled with actual renewal/torque/depth/routing records and documented external closures; separate internal jobs retain their own records.']
p['source']['pdf_pages']=sorted({n for s in p['steps'] for n in s['source_pdf_pages']});p['source']['printed_pages']=[]
d=fitz.open(PDF)
for n in p['source']['pdf_pages']:
 page=d[n-1];footer=page.get_text(clip=fitz.Rect(0,page.rect.height-75,page.rect.width,page.rect.height));labels=re.findall(r'(?m)^\s*(\d+-\d+)\s*$',footer);assert labels,(n,footer);p['source']['printed_pages'].append(labels[-1])
for s in p['supplemental_sources']:s['scope']=s['scope'].replace('BHR','B2W')
wr(out,p)
manifest={'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':'yamaha-2022-b2w','url':URL,'local_pdf_path':PDF.as_posix(),'sha256':SHA}],'artifacts':[{'path':out.name,'kind':'procedure','sha256':sha(out),'source_id':'yamaha-2022-b2w','target':p['target']}]}
wr(H/'frame-source-review-manifest.json',manifest)
print(json.dumps({'steps':len(p['steps']),'sha256':sha(out),'status':p['status']}))
