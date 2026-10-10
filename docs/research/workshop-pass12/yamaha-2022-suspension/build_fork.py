"""Exact2022 fork55 candidate, separately manifest-bound from frozen setup guides."""
import json,hashlib,re,copy,fitz
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3];OLD=R/'docs/research/workshop-pass11/yamaha-2023-suspension/fork-oil-seals-bushings-v1.procedure.json';OUT=B/'fork-oil-seals-bushings-v1.procedure.json';PDF=Path('C:/Users/kylej/AppData/Local/Temp/B2W-2819U-12_02.pdf');URL='https://library.ymcapps.net/library/om/contents/pdf/10/B2W-2819U-12_02.pdf';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
if OUT.exists():assert json.loads(OUT.read_text(encoding='utf8'))['publication_status']!='APPROVED'
MAP={1:1,4:4,8:8,60:116,120:117,122:119,125:121,126:122,136:131,137:132,139:134,162:156,163:157,164:158,165:159,166:160,167:162,168:163,169:163,170:164,171:166,172:167,173:168}
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def cv(v):
 if isinstance(v,str):
  v=v.replace('2023','2022').replace('BHR-2819U-10','B2W-2819U-12').replace('LIT-11626-36-32','LIT-11626-35-03').replace('YZ450FS','YZ450FN').replace('90890-01911','90890-01500 / YM-01500').replace('S 1','S1').replace('270 cm³','295 cm³').replace('270 cm3','295 cm3').replace('7 mm','5 mm').replace('and7 mm','and5 mm')
  v=re.sub(r'PDF\s*(\d+(?:[/,–]\d+)*)',lambda m:'PDF '+re.sub(r'\d+',lambda z:str(MAP[int(z[0])]),m[1]),v)
  return re.sub(r'page\s+(\d+)',lambda m:'page '+str(MAP[int(m[1])]),v)
 if isinstance(v,dict):return {k:cv(x) for k,x in v.items()}
 if isinstance(v,list):return [cv(x) for x in v]
 return v
old=json.loads(OLD.read_text(encoding='utf8'));d=cv(old);d['target']['model_year']=2022;d['publication_status']=d['source']['review_status']='PENDING_INDEPENDENT_REVIEW';d['status']='SOURCE_REVIEW_CANDIDATE';d['settings']['fork_projection_mm']=5;d['affected_components']+=['handlebar','controls'];d['authoring_template']={'path':OLD.relative_to(R).as_posix(),'sha256':sha(OLD),'scope':'Structure only; exact2022 B2W mechanics independently reviewed.'}
d['settings']['projection_reference']='Dimension a on exact2022PDF167, upper-bracket top to outer-tube top, excluding cap.'
d['prerequisites']=[x.replace('PDF 156/168','PDF 167') for x in d['prerequisites']]
d['source'].update(source_url=URL,document_sha256=sha(PDF),document_revision='B2W-2819U-12 / LIT-11626-35-03; first edition March2021',review_note='Exact2022 fork author review; independent review pending.')
d['required_tools']=[t for t in d['required_tools'] if not t['name'].startswith('Torque driver accurate')]
for t in d['required_tools']:
 if t['name']=='Suitable torque wrenches and sockets':t.update(range_required='Accurate at touched joints from1.3 to115 N·m; account for offset-adapter lever length.',size='Includes5Nm protectors and40Nm lower handlebar holders.')
 if t['name']=='Metric depth/height measuring tool':t['purpose']='5mm fork projection using exact2022 diagram.'
d['preflight']=[x.replace('0.6–115','1.3–115') for x in d['preflight']]
ps={'setup':[156,158,167,168],'plate':[116,117],'wheel-remove':[119,120],'caliper':[127,131,134,156],'protectors':[156,168],'legs-remove':[158],'drain':[157,158],'bottom':[158,165,166],'cartridge':[157,158],'split':[157,159],'base-remove':[159,161],'inspect':[159,160],'renew':[8,157,160,161],'fill':[161],'bleed':[161],'level':[161],'base-seat':[161,162],'base-torque':[162],'purge':[162,163],'seal-stack':[163],'tubes':[163,164],'dust':[164],'spring':[164,165],'adjuster':[165,166],'adjuster-torque':[166],'outer-fill':[166],'legs-refit':[167],'height-clamps':[167,168],'guards-brake':[127,132,134,168],'wheel-refit':[121],'seat-torque':[122],'plate-settings':[116,117,168],'verify':[122,132,134,168]}
steps=[]
for st in d['steps']:
 key=re.sub(r'^(left|right)-','',st['id']);st['source_pdf_pages']=ps[key]
 if key=='plate':st['instruction']='Remove the number-plate bolt. Release its band from the projection, free the clutch cable from the plate guide, and pull the plate off the lower-bracket projection. Keep cables unstressed and preserve the band attachment.'
 if key=='base-remove':st['instruction']='Record the compression setting, then fully loosen that adjuster. Hold the damper with ring wrench90890-01501 and remove the intact base valve using cap wrench90890-01500/YM-01500. Drain damper oil. Leave the compression adjuster and valve internals assembled; no knob-screw or shim-stack dismantling is part of this2022 operation.'
 if key=='base-seat':st['instruction']='Confirm the compression damping adjuster remains fully loosened before installation as Yamaha requires. '+st['instruction']
 if key=='base-torque':st['instruction']='Hold the damper with ring wrench90890-01501 and use cap wrench90890-01500/YM-01500 to tighten the base valve to28 N·m. The compression adjuster remains fully loosened until final setting restoration.'
 if key=='base-torque':st['verification']=['Base valve28 N·m recorded; compression adjuster remains fully loosened.']
 if key=='guards-brake':st['instruction']=st['instruction'].replace('protectors at 7 N·m','protectors at 5 N·m')
 if key=='plate-settings':st['instruction']='Engage the lower-bracket projection in the number plate, restore the clutch cable in its guide and fit the plate projection into the upper hole of its band. Tighten the number-plate bolt to7 N·m. Restore each recorded rebound and compression setting from gently seated full hard; confirm both legs match the intended setup.'
 if key=='legs-refit':st['instruction']+=' Set both supported fork legs to the standard5mm outer-tube projection shown before refitting the handlebar assembly.'
 st['source_links']=[URL+'#page='+str(n) for n in st['source_pdf_pages']];st['origin']='Exact2022 B2W service with supported closed-caliper and intact-handlebar workflow adaptations.'
 steps.append(st)
 if key=='protectors':
  x=copy.deepcopy(st);x.update(id='bars-support',title='Lift and secure the intact handlebar assembly',instruction='Record the lower-holder orientation and damper positions. Support the complete handlebar and controls, remove both lower-holder nuts, and lift the holders with the handlebar still clamped in them. Retain all four dampers and washers in their original positions. Secure the assembly so it cannot move or strain any attached cable, hose or lead. Do not loosen the upper bar clamps or disconnect controls.',source_pdf_pages=[149,150,158],record_required=True,verification=['Both holders and four dampers indexed; intact assembly secured without tension.']);steps.append(x)
 if key=='legs-refit':
  x=copy.deepcopy(st);x.update(id='bars-refit',title='Restore the handlebar holders',instruction='After both damper caps are tightened and5mm fork projection is set, restore the four dampers and lower holders with the intact bar assembly. For this stock-position route, the longer distance from mounting-bolt center faces rearward as shown. Seat the original washers and tighten both lower-holder nuts to40 N·m. Keep the undisturbed upper clamps and bar alignment unchanged. Check full left/right steering for tank contact and cable/hose tension before proceeding.',source_pdf_pages=[150,151,152,167],record_required=True,verification=['Dampers/holders correctly seated; both nuts40Nm; controls clear through steering.']);steps.append(x)
for i,st in enumerate(steps):st['depends_on']=[steps[i-1]['id']] if i else [];st['source_links']=[URL+'#page='+str(n) for n in st['source_pdf_pages']]
d['steps']=steps;book=fitz.open(PDF);d['source']['pdf_pages']=sorted(set([1,4,8]+[n for s in steps for n in s['source_pdf_pages']]));d['source']['printed_pages']=['Symbols (unnumbered)' if n==8 else f'{n}: '+next((x for x in book[n-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x)),'front matter') for n in d['source']['pdf_pages']]
wr(OUT,d);wr(B/'fork-source-review-manifest.json',{'schema_version':1,'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'source_id':'yamaha-us-2022-yz450f-oem','url':URL,'sha256':sha(PDF),'local_path':str(PDF)}],'artifacts':[{'path':OUT.relative_to(R).as_posix(),'sha256':sha(OUT),'source_id':'yamaha-us-2022-yz450f-oem','target':d['target'],'step_count':len(steps),'review_status':d['publication_status'],'template_sha256':sha(OLD)}]});print('Fork',len(steps),'candidate',sha(OUT))
