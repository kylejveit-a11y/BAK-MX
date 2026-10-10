"""Build a review candidate from structure only; exact BHR locators reviewed separately."""
import json,hashlib,re,fitz
from pathlib import Path
B=Path(__file__).parent;R=B.parents[3]
old=R/'docs/research/workshop-pass9/yamaha-2025-commissioning/post-rebuild-commissioning-v1.procedure.json'
out=B/'post-rebuild-commissioning-v1.procedure.json'
if out.exists() and json.loads(out.read_text())['publication_status']=='APPROVED':raise SystemExit('Frozen; refusing rebuild')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
d=json.loads(old.read_text(encoding='utf8'))
m={38:36,39:37,40:38,41:39,42:40,43:41,**{n:n-2 for n in range(56,76)},**{n:n-4 for n in range(88,125)},194:191,195:192,235:231,236:232,237:233,238:234,239:235,246:242,288:283,289:284,296:290,297:291,298:292}
u='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-11_02.pdf'
pdf=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-11_02.pdf');doc=fitz.open(pdf)
def transform(v,k=''):
 if isinstance(v,dict):return {a:transform(b,a) for a,b in v.items()}
 if isinstance(v,list):return [m[x] for x in v] if k in ['pdf_pages','source_pdf_pages'] else [transform(x) for x in v]
 if isinstance(v,str):
  v=re.sub(r'https://library\.ymcapps\.net/library/om/contents/pdf/10/D02-2819U-10_02.pdf#page=(\d+)',lambda a:u+'#page='+str(m[int(a[1])]),v)
  v=v.replace('https://library.ymcapps.net/library/om/contents/pdf/10/D02-2819U-10_02.pdf',u).replace('2025','2024').replace('D02','BHR')
  return re.sub(r'(?<=[A-Za-z])(?=\d)|(?<=\d)(?=minutes|Nm)', ' ',v) if k=='instruction' else v
 return v
d=transform(d);d['target']['model_year']=2024;d['publication_status']='CANDIDATE';d['status']='SOURCE_REVIEW_CANDIDATE'
d['applicability']['included']='Exact US 2024 standard stock YZ450F after completed engine repair with a new head gasket and new valves, piston, rings, camshaft, gears, cylinder or crankshaft.'
d['applicability']['excluded']=[x for x in d['applicability']['excluded'] if not x.startswith('Bottom-end')]
s=d['source'];s.update(document_sha256=sha(pdf),document_revision='BHR-2819U-11 / LIT-11626-37-11; February 2023',document_id='BHR-2819U-11 / LIT-11626-37-11',review_status='CANDIDATE',review_note='Exact 2024 BHR author review; independent review pending.')
s['printed_pages']=[f'{n}: '+next(x for x in doc[n-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x)) for n in s['pdf_pages']]
for st in d['steps']:
 if st['id']=='plan':st['instruction']=st['instruction'].replace('rings or camshaft','rings, camshaft or gears').replace('A new cylinder','A new cylinder or crankshaft')
 if st['id']=='remaining-ride':st['instruction']=st['instruction'].replace('valves/piston/rings/camshaft','valves/piston/rings/camshaft/gears').replace('without cylinder replacement','without cylinder or crankshaft replacement').replace('a new cylinder','a new cylinder or crankshaft')
 if st['id']=='tank-cleaning-record':st['instruction']+=' Route the fuel hose and pump lead through the guide on the cover.'
# Independent reviewer requested clearer mechanical order and complete bodywork closure.
for t in d['required_tools']:
 t['name']=t['name'].replace('2.5–135 N·m','2.5–145 N·m for the actual joint-check sheet')
for st in d['steps']:
 if st['id']=='oil-fill':
  st['instruction']=st['instruction'].replace('and install filler cap with a new O-ring.','and apply lithium-soap-based grease to the new filler-cap O-ring before fitting the cap.').replace(' Apply lithium-soap-based grease to the new filler-cap O-ring as shown in the engine-cover diagram.','')
 if st['id']=='generator-access':st['instruction']=st['instruction'].replace('both external lead clamps/holder','both clamp-1 pieces and the single clamp-2 holder')
 if st['id']=='body-close':
  st['instruction']='Restore both shrouds with each radiator-guard projection engaged in its shroud hole; tighten shroud fasteners to 7 N·m. Refit the left side cover and its 7 N·m fasteners. Slide the right cover into its projection/slot engagement, keeping its rib below the rear-fender rib; fit its 7 N·m fasteners and shared seat fixing at 13 N·m as illustrated. Restore filter-cover projections/ribs and breather routing. Refit the seat with its bolts at 13 N·m and secure the sub-seat with untwisted tether. Confirm all connectors, wire clearance, fuel connections and oil closures before restart.'
  st['source_pdf_pages']=sorted(set(st['source_pdf_pages']+[118,121]));st['source_links']=[u+'#page='+str(x) for x in st['source_pdf_pages']]
s['pdf_pages']=sorted(set(s['pdf_pages']+[118,121]))
s['printed_pages']=[f'{n}: '+next(x for x in doc[n-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x)) for n in s['pdf_pages']]
write(out,d)
manifest={'schema_version':1,'status':'CANDIDATE','sources':[{'source_id':'yamaha-us-2024-yz450f-oem','url':u,'sha256':sha(pdf),'local_path':str(pdf)},*[{ 'source_id':x['id'],'url':x['url'],'sha256':x['sha256'],'local_path':x['local_path']} for x in d['supplemental_sources']]],'artifacts':[{'path':out.relative_to(R).as_posix(),'sha256':sha(out),'target':d['target'],'review_status':'CANDIDATE','source_id':'yamaha-us-2024-yz450f-oem'}],'structure_reference':{'path':old.relative_to(R).as_posix(),'sha256':sha(old),'scope':'Structure only; no year inheritance.'},'independent_review':None}
write(B/'source-review-manifest.json',manifest);write(B/'source-page-map.json',{'source_2024_sha256':sha(pdf),'structure_2025_sha256':sha(old),'pages_2025_to_2024':m,'specific_changes':['2024 expressly includes crankshaft in one-hour group and gear in 30-minute half-throttle group (PDF38).','2024 PDF292 additionally requires fuel hose and pump lead through cover guide.','Exhaust clamps are12Nm at2024PDF99; no clamp torque instruction inherited here.','2024 diagnostic USB tool90890-03269 differs; no tool part number inherited in this companion.','Exact2024PDF242 LS oil-filter/filler O-rings confirmed visually; pedal12Nm without LT on2024PDF232.']})
