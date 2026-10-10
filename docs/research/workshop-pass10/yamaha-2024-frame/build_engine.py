"""Exact 2024 authoring: page candidates are only locators; changes follow recorded review."""
import json,copy,hashlib,re
from pathlib import Path
import fitz
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def rd(p):return json.loads(p.read_text(encoding='utf8'))
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
source=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-11_02.pdf');assert sha(source)=='6e784b3b15fe1e131f0e385676ca2873e74d783ee2499ce561e595bcea9ca9be'
pdf=fitz.open(source)
url='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-11_02.pdf'
lead=rd(ROOT/'docs/research/workshop-pass10/yamaha-2024-source-audit/approved-2025-page-map-candidates.json')
mapping={x['pdf_2025']:x['candidate_matches_2024'][0]['pdf_page'] for x in lead['mapping']}
mapping.update({37:36,38:36,39:37,40:38,54:52,57:55,58:56,61:58,62:59,63:60,94:90,104:100,105:101,158:155,159:156,160:157,161:158,163:160,164:161,288:283,289:284,302:296,303:297,304:298})
mapping.update({25: 23, 59: 56, 60: 57, 76: 74, 77: 75, 88: 84, 89: 85, 109: 105, 110: 106, 111: 107, 112: 108, 113: 109, 121: 117, 122: 118, 123: 119, 124: 120, 125: 121, 126: 122, 127: 123, 128: 124, 129: 125, 130: 126, 131: 127, 132: 128, 133: 129, 134: 130, 135: 131, 136: 132, 143: 139, 147: 143, 149: 145, 150: 146, 165: 162, 167: 164, 168: 165, 169: 166, 175: 172, 176: 173, 177: 174, 178: 175, 179: 176, 180: 177, 181: 178, 182: 179, 183: 180, 184: 181, 185: 182, 186: 183, 187: 184, 188: 185, 190: 187, 191: 188, 192: 189, 193: 190, 195: 192})
name='engine-removal-refit-v1.procedure.json';out=HERE/name
if out.exists() and rd(out)['source']['review_status']=='APPROVED':raise SystemExit('Frozen approved source: new revision required.')
old=ROOT/'docs/research/workshop-pass9/yamaha-2025-frame'/name;assert sha(old)=='ac4ff7e9f086bd069a4c1008c8e09076a64c93afdbef204501ecbc048975157d'
d=rd(old)
def transform(x):
 if isinstance(x,str):
  x=x.replace('2025','2024').replace('D02-2819U-10_02.pdf','BHR-2819U-11_02.pdf').replace('90890-03275','90890-03269').replace('Yamaha D02','Yamaha BHR').replace('1.5-90 Nm','1.5-135 Nm')
  return re.sub(r'PDF ?(\d+)',lambda m:'PDF'+str(mapping.get(int(m[1]),int(m[1]))),x)
 if isinstance(x,list):return [transform(v) for v in x]
 if isinstance(x,dict):return {k:transform(v) for k,v in x.items()}
 return x
d=transform(d);d['target']['model_year']=2024
d.update(status='SOURCE_REVIEWED_CANDIDATE',publication_status='NOT_IMPORTED',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['source'].update(source_url=url,document_sha256=sha(source),document_revision='BHR-2819U-11 / LIT-11626-37-11; First edition February 2023',review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact 2024 interface diagrams/text reviewed; independent root review pending. Locator similarity was not treated as specification authority.')
d['editorial_template']={'path':str(old.relative_to(ROOT)).replace('\\','/'),'sha256':sha(old),'scope':'Workflow scaffold only; exact 2024 source controls all mechanical claims.'}
for s in d['steps']:
 s['source_pdf_pages']=sorted(set(mapping[p] for p in s['source_pdf_pages']))
 s['source_links']=[{'title':'Yamaha 2024 owner/service manual, PDF'+str(p),'url':url+'#page='+str(p)} for p in s['source_pdf_pages']]
 if s.get('supplemental_source_pdf_pages'):pass
rows={s['id']:s for s in d['steps']}
rows['engine-initial-record']['source_pdf_pages']=sorted(set(rows['engine-initial-record']['source_pdf_pages']+[93]))
rows['engine-access-tank-install']['instruction']+=' Route both the fuel hose and fuel-pump lead through the guide on the cover as shown in PDF292.'
rows['engine-cooling-drain']['source_pdf_pages']=[100,101]
rows['control-renew-record']['instruction']=rows['control-renew-record']['instruction'].replace('page 4-38','page 4-39')
rows['engine-mounts-out']['instruction']=rows['engine-mounts-out']['instruction'].replace('two lower brackets','four lower bracket plates (a paired stack on each side)')
rows['engine-mount-torque']['instruction']=rows['engine-mount-torque']['instruction'].replace('original lower and upper brackets','original four lower bracket plates in their paired left/right stacks and both upper brackets')
rows['engine-exhaust-joints-final']['instruction']=rows['engine-exhaust-joints-final']['instruction'].replace('16 N·m','12 N·m')
rows['engine-exhaust-joints-final']['verification']=[x.replace('16 N·m','12 N·m') for x in rows['engine-exhaust-joints-final']['verification']]
rows['engine-harness-refit']['instruction']='Reconnect stator, crankshaft-position, gear-position and coolant-temperature connectors and their covers. Route stator lead behind the radiator, clear of the tension arm and gear-position connector. The clutch cable protector contacts the radiator hose and passes outside the stator and gear leads. Fasten clutch cable, gear lead and stator lead over the grommet with the tie end forward and cut off excess. Clamp the clutch cable ahead of the leads, seat the frame clip with its lock forward and trim excess as illustrated. Keep regulator leads inside the tension arm. Fully seat the plug cap and route temperature, engine-ground and high-tension leads outside the head breather. Check the starter lead stays clear of the push lever shaft. Restore steering-area switch leads and cable routing to the exact diagrams.'
rows['engine-harness-refit']['source_pdf_pages']=[62,63,66,67,68,69,70,71]
rows['engine-ground-starter']['instruction']=rows['engine-ground-starter']['instruction'].replace('route it outside the high-tension cord','route it with the temperature and high-tension leads outside the head breather')
rows['engine-oil-fill']['instruction']=rows['engine-oil-fill']['instruction'].replace('Fit the filler cap with a new O-ring.','Apply lithium-soap grease to the new filler-cap O-ring shown in PDF242 and fit the cap.')
rows['engine-oil-fill']['source_pdf_pages'].append(242)
# Retain only preparation actually used by engine access, including the pivot and pedal grease.
d['required_parts']=[x for x in d['required_parts'] if x.get('purpose') not in ['Upper/lower mounting-bolt circumference and threads','Upper eye O-rings per OEM187; separate from lower bearing molybdenum-disulfide grease','Seal lips and rear axle.','Disc bolt threads; actual product recorded, grade unspecified by source.','OEM marks the removed joint clip for replacement; verify chain identity first.']]
for x in d['required_parts']:
 if 'PDF201/206' in x.get('purpose',''):x['purpose']=x['purpose'].replace('PDF201/206','PDF201/202')
d['required_parts'] += [{'name':'Molybdenum-disulfide grease and lithium-soap grease','purpose':'Pivot shaft/nut, pedal O-rings and pivot, throttle contact points and new filler O-ring.'},{'name':'OEM-specified LOCTITE locking agent','purpose':'Drive sprocket nut threads; record actual product, grade not named by Yamaha.'}]
for s in d['steps']:
 s['source_pdf_pages']=sorted(set(s['source_pdf_pages']))
 s['source_links']=[{'title':'Yamaha 2024 owner/service manual, PDF'+str(p),'url':url+'#page='+str(p)} for p in s['source_pdf_pages']]
for id in ['engine-sprocket','engine-sprocket-final']:
 rows[id]['source_links'].append({'title':'Nick Dole manual brake-holding technique, PDF5','url':d['supplemental_sources'][0]['url']+'#page=5'})
d['source']['pdf_pages']=sorted(set(p for s in d['steps'] for p in s['source_pdf_pages']))
d['source']['printed_pages']=list(dict.fromkeys(x for p in d['source']['pdf_pages'] for x in re.findall(r'^\d{1,2}-\d{1,3}$',pdf[p-1].get_text(),re.M)[-1:]))
wr(out,d);print(len(d['steps']),sha(out))
