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
name='frame-bearing-renewal-reassembly-v1.procedure.json';out=HERE/name
if out.exists() and rd(out)['source']['review_status']=='APPROVED':raise SystemExit('Frozen approved source: new revision required.')
old=ROOT/'docs/research/workshop-pass9/yamaha-2025-frame'/name;assert sha(old)=='41e9d90bfe0017e793dd22f662076528d5e980f70bde6b6d56e57dc5eaeec8c5'
original=rd(old)
def text_map(x):
 if isinstance(x,str):
  if x.startswith('http') and 'ymcapps' not in x:return x
  x=x.replace('2025','2024').replace('D02-2819U-10_02.pdf','BHR-2819U-11_02.pdf').replace('Yamaha D02','Yamaha BHR').replace('90890-03275','90890-03269')
  # These are audited metadata page labels; never remap arbitrary OEM-prefixed numbers.
  for old_label,new_label in {'OEM191':'OEM188','OEM184/186':'OEM181/183','OEM25':'OEM23','OEM187':'OEM184'}.items():x=x.replace(old_label,new_label)
  def numbers(m):return m[1]+re.sub(r'\d+',lambda n:str(mapping.get(int(n[0]),int(n[0]))),m[2])
  return re.sub(r'(PDF ?)(\d+(?:[/–-]\d+)*)',numbers,x)
 if isinstance(x,list):return [text_map(v) for v in x]
 if isinstance(x,dict):return {k:text_map(v) for k,v in x.items()}
 return x
d=text_map(original);d['target']['model_year']=2024
d.update(status='SOURCE_REVIEWED_CANDIDATE',publication_status='NOT_IMPORTED',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['source'].update(source_url=url,document_sha256=sha(source),document_revision='BHR-2819U-11 / LIT-11626-37-11; First edition February 2023',review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact 2024 chassis interfaces, bearing stacks/depths, routing and mounting source reviewed. Independent root review pending; no model-year inheritance.')
d['editorial_template']={'path':str(old.relative_to(ROOT)).replace('\\','/'),'sha256':sha(old),'scope':'Workflow scaffold only; exact 2024 source controls all mechanical claims.'}
d['supplemental_sources']=copy.deepcopy(original['supplemental_sources'])
for x in d['supplemental_sources']:x['scope']=x['scope'].replace('Yamaha D02','Yamaha BHR')
for s in d['steps']:
 s['source_pdf_pages']=sorted(set(mapping[p] for p in s['source_pdf_pages']))
 s['source_links']=[{'title':'Yamaha 2024 owner/service manual, PDF'+str(p),'url':url+'#page='+str(p)} for p in s['source_pdf_pages']]
rows={s['id']:s for s in d['steps']}
rows['engine-initial-record']['source_pdf_pages']=sorted(set(rows['engine-initial-record']['source_pdf_pages']+[93]))
rows['engine-access-tank-install']['instruction']+=' Route both the fuel hose and fuel-pump lead through the guide on the cover as shown in PDF292.'
rows['engine-cooling-drain']['source_pdf_pages']=[100,101]
# Keep composite cutpoints; apply exact-year changes, not engine-only retained-assembly prose.
for id in ['front-setup','front-height-clamps']:
 rows[id]['instruction']=rows[id]['instruction'].replace('standard5 mm','standard7 mm').replace('to 5 mm','to 7 mm')
rows['front-height-clamps']['verification']=[x.replace('5 mm','7 mm') for x in rows['front-height-clamps']['verification']]
rows['engine-slack']['verification']=[x.replace('48 N','50 N') for x in rows['engine-slack']['verification']]
rows['control-renew-record']['instruction']=rows['control-renew-record']['instruction'].replace('page 4-38','page 4-39')
rows['engine-mounts-out']['instruction']=rows['engine-mounts-out']['instruction'].replace('two lower brackets','four lower bracket plates in paired left/right stacks')
rows['engine-mount-torque']['instruction']=rows['engine-mount-torque']['instruction'].replace('original lower and upper brackets','original four lower bracket plates in paired left/right stacks and upper brackets')
rows['engine-exhaust-joints-final']['instruction']=rows['engine-exhaust-joints-final']['instruction'].replace('16 N·m','12 N·m')
rows['engine-exhaust-joints-final']['verification']=[x.replace('16 N·m','12 N·m') for x in rows['engine-exhaust-joints-final']['verification']]
rows['engine-ground-starter']['instruction']=rows['engine-ground-starter']['instruction'].replace('route it outside the high-tension cord','route it with temperature and high-tension leads outside the head breather')
rows['engine-harness-refit']['instruction']='Reconnect stator, crankshaft-position, gear-position and coolant-temperature connectors and their covers. Route stator lead behind the radiator, clear of the tension arm and gear-position connector. The clutch cable protector contacts the radiator hose and passes outside the stator and gear leads. Fasten clutch cable, gear lead and stator lead over the grommet with the tie end forward and cut off excess. Clamp the clutch cable ahead of the leads, seat the frame clip with its lock forward and trim excess as illustrated. Keep regulator leads inside the tension arm. Fully seat the plug cap and route temperature, engine-ground and high-tension leads outside the head breather. Check the starter lead stays clear of the push lever shaft.'
rows['engine-harness-refit']['source_pdf_pages']=[62,63,66,67,70,71]
rows['rear-harness-route']['instruction']='Restore the white-tape rear-frame harness/starter-lead tie with lock DOWN and trimmed end OUTWARD. At the green-tape frame clip, point the end DOWN and trim. Route the starter lead between the relay and rear fender and take up slack between the relay and rear-frame tie. Keep positive lead outside the rear-fender projection; install starter lead terminal pointing outward as illustrated. Seat relay and CCU coupler in their battery bracket, with CCU coupler inside, and restore covers. Reconnect ECU and route positive lead under negative; point the negative battery terminal inward and the frame-ground terminal in the illustrated direction. Fit battery and band but leave terminals isolated until final preparation.'
rows['rear-harness-route']['source_pdf_pages']=[64,65,66,67,72,73,117]
rows['loom-control-refit']['instruction']=rows['loom-control-refit']['instruction'].replace('Route the TPS lead inside along the ignition coil as drawn.','Restore the TPS connector cover and route its lead along the exact right-side and top-view drawings without trapping it against the engine.')
rows['engine-oil-fill']['instruction']=rows['engine-oil-fill']['instruction'].replace('Fit the filler cap with a new O-ring.','Apply lithium-soap grease to the new filler-cap O-ring shown in PDF242 and fit the cap.')
rows['engine-oil-fill']['source_pdf_pages'].append(242)
rows['front-bar-refit']['instruction']=rows['front-bar-refit']['instruction'].replace('equal side-to-side marks.','equal side-to-side marks. Align upper-holder projection d with the corresponding handlebar mark as illustrated in PDF157/158.')
rows['front-bar-refit']['source_pdf_pages']=sorted(set(rows['front-bar-refit']['source_pdf_pages']+[157,158]))
for x in d['required_parts']:
 if 'source_pdf_page' in x:x['source_pdf_page']=mapping[x['source_pdf_page']]
for s in d['steps']:
 s['source_pdf_pages']=sorted(set(s['source_pdf_pages']))
 s['source_links']=[{'title':'Yamaha 2024 owner/service manual, PDF'+str(p),'url':url+'#page='+str(p)} for p in s['source_pdf_pages']]
 for oldlink in next(x for x in original['steps'] if x['id']==s['id'])['source_links']:
  u=oldlink['url'] if isinstance(oldlink,dict) else oldlink
  if 'ymcapps' not in u:s['source_links'].append(copy.deepcopy(oldlink))
for id in ['engine-sprocket','engine-sprocket-final']:rows[id]['source_links'].append({'title':'Nick Dole manual brake-holding technique, PDF5','url':d['supplemental_sources'][-1]['url']+'#page=5'})
d['source']['pdf_pages']=sorted(set(p for s in d['steps'] for p in s['source_pdf_pages']))
d['source']['printed_pages']=list(dict.fromkeys(x for p in d['source']['pdf_pages'] for x in re.findall(r'^\d{1,2}-\d{1,3}$',pdf[p-1].get_text(),re.M)[-1:]))
wr(out,d);print(len(d['steps']),sha(out))
