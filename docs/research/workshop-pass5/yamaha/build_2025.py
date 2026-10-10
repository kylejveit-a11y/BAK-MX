import json,copy,re,hashlib
from pathlib import Path
OUT=Path('docs/research/workshop-pass5/yamaha');template=Path('docs/research/suspension-pass3/fork-oil-seals-bushings-v1.procedure.json');p=json.loads(template.read_text(encoding='utf8'))
URL='https://library.ymcapps.net/library/om/contents/pdf/10/D02-2819U-10_02.pdf';HASH='5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac'
p['id']='yamaha-2025-yz450f-fork-oil-seals-bushings-v1';p['target']['model_year']=2025;p['applicability']['included']='Exact standard US 2025 YZ450F/YZ450FS with original spring forks';p['reviewed_at']='2026-09-13';p['source']={'source_url':URL,'document_sha256':HASH,'document_revision':'D02-2819U-10 / LIT-11626-38-16; First edition March 2024','pdf_pages':[],'printed_pages':['4-4','4-6','4-9','4-10','4-20','4-21','4-23','4-45 through 4-56','2-14 through 2-15','Symbols'],'review_status':'APPROVED','review_note':'Exact 2025 cover/copyright and all fork pages165–176 visually reviewed against D02 source. Wheel/caliper interfaces reviewed independently. Structure adapted from earlier authored guide; no numeric or year applicability inherited. See REVIEW.md for explicit2025 differences and bounded closed-brake adaptation.'}
p['prerequisites']=['Exact original 2025 stock fork configuration; no earlier unfinished internal job or unknown assembly state.','Ability to identify the 5 mm projection reference in PDF165/176 and execute the illustrated cartridge seating technique.','Working front brake, serviceable original valve/damper internals and secure supports; damaged assemblies require separate replacement work.']
p['settings']={'fork_projection_mm':5,'projection_reference':'Dimension a from upper-bracket top to outer-tube top edge in PDF165/176, excluding cap/knob.','restore_damping':'Recorded pre-removal settings; no new tuning target.'}
p['entry_state']=['Assembled exact-stock bike; front brake closed and working; fork settings/height can be recorded.'];p['exit_state']=['Both fork legs serviced and refitted; matched standard oil fills and5 mm height, original damping settings restored, wheel/brake and functional checks recorded.','Damper-rod seals, valve stacks and internal pressure spring retained; replacement/machining of damaged major components outside scope.']
def clean(v):
 if isinstance(v,str):return re.sub(r'\\u([0-9a-fA-F]{4})',lambda m:chr(int(m[1],16)),v)
 if isinstance(v,list):return [clean(x) for x in v]
 if isinstance(v,dict):return {k:clean(x) for k,x in v.items()}
 return v
p=clean(p)
for t in p['required_tools']:
 for k,v in t.items():
  if isinstance(v,str):t[k]=v.replace('90890-01917','90890-01502').replace('2 mm fork','5 mm fork')
p['materials']=[{'name':'Lithium-soap-based grease','purpose':'Fork seal lips/inner tube and axle/wheel oil-seal lips at the illustrated locations.'}]
p['required_parts']=[{'name':name,'purpose':purpose} for name,purpose in [
('New piston metal / inner-tube bushing','One per leg, PDF166 item8 and PDF172 groove.'),('New slide metal','One per leg, PDF166 item10 and PDF172 driver sequence.'),('New oil seal','One per leg, PDF166 item12; numbered face downward.'),('New dust seal','One per leg, PDF166 item4; no separate scraper in this source stack.'),('New copper washer','One per leg, PDF174 item2 at lower adjuster.'),('New matching external damper-assembly O-ring','One per leg at original lower cartridge groove; PDF169 top-left.'),('New matching lower-adjuster O-ring','One per leg at original groove; PDF169 adjuster close-up.'),('New matching base-valve external O-rings','Individually identify every disturbed NEW-marked position in PDF166/169; no kit contents assumed.'),('Yamaha Suspension Oil S1','Separate216 cm3 cartridge and275 cm3 outer fills per leg; enough for repeat bleed cycles.'),('Lithium-soap-based grease','Seal lips, indicated tube region and wheel/axle refit.'),('LOCTITE locking agent','Lower adjuster-to-inner-tube thread; source does not name grade/cure time. Record product and follow its instructions.')]]
access={'setup':[165,167,176],'plate':[124],'wheel-remove':[126],'caliper':[140,165],'protectors':[165],'legs-remove':[167],'legs-refit':[175],'height-clamps':[165,176],'guards-brake':[141,143,176],'wheel-refit':[129],'seat-torque':[130],'plate-settings':[62,124,176],'verify':[130,141,143,176]}
internal={'drain':[166,167],'bottom':[167,174],'cartridge':[166,167],'split':[166,167,168],'base-remove':[168],'inspect':[168],'renew':[7,166,169],'fill':[169],'bleed':[169,170],'level':[170],'base-seat':[170],'base-torque':[170,171],'purge':[171],'seal-stack':[171],'tubes':[172],'dust':[173],'spring':[173],'adjuster':[173,174],'adjuster-torque':[174],'outer-fill':[175]}
for s in p['steps']:
 part=s['id'].split('-',1)[1] if s['id'].startswith(('left-','right-')) else None
 s['source_pdf_pages']=internal[part] if part else access[s['id']]
 if s['diagram_reference_required']:s['source_links']=[{'title':f'2025 Yamaha OEM diagram - PDF page {n}','url':URL+f'#page={n}'} for n in s['source_pdf_pages']]
 else:s['source_links']=[]
 for k in ['instruction','title']:
  s[k]=s[k].replace('2 mm projection','5 mm projection').replace('280.0 cm³','275 cm³').replace('90890-01917','90890-01502').replace('page168','page166').replace('page171','page169').replace('page172','page170').replace('page177','page174')
 if s['id']=='height-clamps':s['instruction']=s['instruction'].replace('2 mm','5 mm')
 if part=='split':s['instruction']='Carefully lift the dust seal and remove the stopper ring without scratching the inner tube. Slowly push the inner tube almost to bottom, then pull it back quickly as illustrated; repeat until the tubes separate. Remove the old piston metal, slide metal, oil seal and dust seal. Retain the reusable washer, stopper ring and protector guide in order. This exact-year stack has no separate scraper.'
 if part=='renew':s['instruction']='Clean components and inspect the base valve, its spring/bushing, bleed screw, upper spring-seat contact face and adjuster. Failed valve/damper internals need separate component replacement; do not alter them within this service. Renew each disturbed NEW-marked external O-ring at its exact original groove using PDF166 and PDF169. Match each replacement before removing the next old seal and record each location. Keep the bleed screw, pressure spring and valve stacks assembled; no gas-charge work is included.'
 if part=='seal-stack':s['instruction']='Oil the inner tube with fork oil and protect its sharp seal-entry area with oiled vinyl film. Apply lithium-soap-based grease to dust- and oil-seal lips. Fit the new dust seal, stopper ring, new oil seal, washer and new slide metal in the PDF171 order. The oil seal numbered face points downward. Remove the protective film after the seal passes the sharp area.'
 if part=='dust':s['instruction']='Apply lithium-soap-based grease to the indicated inner-tube area and seat the new dust seal as illustrated. Slide the tubes to verify smooth movement. Binding or rough spots require correction and repetition of the tube/seal assembly checks; no separate scraper is installed.'
 if part=='outer-fill':s['instruction']='Measure and add275 cm³ of Yamaha Suspension Oil S1 to the outer fork chamber. This is separate from the earlier216 cm³ cartridge fill. Use the same standard quantity in both legs. Temporarily thread the damper assembly into the outer tube and refit the protector guide. Final top tightening follows during bike refit.'
 s['verification']=[x.replace('280.0','275').replace('280 cm','275 cm').replace('2 mm','5 mm').replace('scraper','dust seal').replace('Scraper/dust seal','Dust seal') for x in s['verification']]
 if s['id']=='verify':s['verification']=['Both serviced fork legs, wheel, brake and routing checks recorded; no leaks/binding; unresolved faults remain open.']
 s['origin']='Original authored service summary independently reconciled to exact2025 OEM source; support/logging and closed-caliper retention are bounded workflow adaptations.'
 # Settings, measured acceptance and selected chemicals must leave an actual work record.
 if part in ['inspect','renew','fill','bleed','level','base-seat','purge','spring','adjuster','adjuster-torque','outer-fill'] or s['id'] in ['setup','height-clamps','plate-settings','verify']:s['record_required']=True
 for k in ['instruction','origin']:s[k]=re.sub(r'(?<=[a-z])(?=\d)', ' ',s[k])
p['source']['pdf_pages']=sorted({1,3,7,*[n for s in p['steps'] for n in s['source_pdf_pages']]})
p['authoring_template']={'path':str(template).replace('\\','/'),'sha256':hashlib.sha256(template.read_bytes()).hexdigest(),'role':'Workflow structure only; exact2025 values, diagrams and assembly stack independently reviewed.'}
(OUT/'yz450f-2025-fork-oil-seals-bushings-v1.procedure.json').write_text(json.dumps(p,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print('Authored',len(p['steps']),'steps')
