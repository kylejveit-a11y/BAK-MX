import json,hashlib,re,fitz
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3];P=Path('C:/Users/kylej/AppData/Local/Temp/B2W-2819U-12_02.pdf');U='https://library.ymcapps.net/library/om/contents/pdf/10/B2W-2819U-12_02.pdf';H='54b246fb2956c8970193b54cce160544ece74a7259169a188b6aacd8c9dd4608'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(P)==H;book=fitz.open(P)
wr=lambda p,d:p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
M={8:8,84:81,102:99,103:100,104:101,105:102,106:102,124:120,127:123,129:124,130:125,131:126,132:127,133:128,134:129,135:130,136:131,137:132,138:133,139:134,140:135,141:136,142:137,143:138,144:139,145:140,146:140,147:141,149:143,150:144,151:145,152:146,153:147,160:154,161:154}
def text(v):
 if isinstance(v,str):
  v=v.replace('2023','2022').replace('BHR-2819U-10','B2W-2819U-12').replace('YZ450FP','YZ450FN')
  v=re.sub(r'(?<![\d.])('+'|'.join(map(str,sorted(M,reverse=True)))+r')(?![\d.])',lambda m:str(M[int(m[0])]) if int(m[0])>=81 and int(m[0])!=135 else m[0],v) if False else v
  return v
 if isinstance(v,list):return [text(x) for x in v]
 if isinstance(v,dict):return {k:text(x) for k,x in v.items()}
 return v
# Only explicit locator expressions are remapped; torque and dimensional numerals never globally replaced.
def loc(v):
 if isinstance(v,str):return re.sub(r'(diagram |diagrams |PDF |shown on |shown there on )(\d{2,3})(?:/(\d{2,3}))?',lambda m:m[1]+str(M[int(m[2])])+(('/'+str(M[int(m[3])])) if m[3] else ''),v)
 if isinstance(v,list):return [loc(x) for x in v]
 if isinstance(v,dict):return {k:loc(x) for k,x in v.items()}
 return v
art=[]
for old in sorted((R/'docs/research/workshop-pass11/yamaha-2023-brakes').glob('*.procedure.json')):
 dest=B/old.name
 if dest.exists():assert json.loads(dest.read_text(encoding='utf8'))['publication_status']!='APPROVED'
 d=loc(text(json.loads(old.read_text(encoding='utf8'))));d['target']['model_year']=2022
 d['publication_status']=d['source']['review_status']='PENDING_INDEPENDENT_REVIEW';d['status']='SOURCE_REVIEW_CANDIDATE'
 d['source'].update(source_url=U,document_sha256=H,document_revision='B2W-2819U-12 / LIT-11626-35-03; first edition March 2021',review_note='Exact 2022 hydraulic source review; independent review pending.')
 d['authoring_template']={'path':old.relative_to(R).as_posix(),'sha256':sha(old),'scope':'Prior approved sequence structure only; every mechanical fact checked in exact 2022 manual.'};d['operation_dependencies']=[]
 for st in d['steps']:
  st['source_pdf_pages']=sorted(set(M[n] for n in st['source_pdf_pages']))
  for k in ['instruction','verification']:
   if isinstance(st[k],str):st[k]=re.sub(r'(bleed(?:er| screw)(?: at)? )5 Nm',r'\g<1>6 Nm',st[k],flags=re.I)
  st['origin']='Original illustrated companion checked against exact 2022 B2W source; operational records and closed access are explicit workflow adaptations.'
 steps={s['id']:s for s in d['steps']}
 if old.name.startswith('front-master'):
  steps['remove']['instruction']=steps['remove']['instruction'].replace('original location and starter-lead routing','original location and control routing')
  steps['mount']['instruction']=steps['mount']['instruction'].replace('preserve starter-lead route through holder','preserve original control routing without trapping leads')
  steps['cups']['source_pdf_pages']=[130,135,136]
  steps['cups']['instruction']=steps['cups']['instruction'].replace('shown on 136','shown on 135')
  steps['cups']['verification']='Record both cup orientations against PDF 135 and spring orientation against PDF 136; no reversal or torn lips.'
  d['required_parts'][0]['purpose']='Renew exact diagram 130 kit; piston assembly and circlip explicitly NEW on 136.'
  d['required_parts'][3]['purpose']='Pushrod end and lever locations marked on 129/136.'
 if old.name.startswith('rear-master'):
  steps['mount']['instruction']='Install master mounting bolts 10 Nm. Connect pedal joint with pin, washer and new split pin; secure pin as diagram 140. Restore the recorded correct pedal position using the adjusting bolt and tighten adjustment locknut 6 Nm. Check pedal movement and verify no brake drag.'
  steps['mount']['instruction']=steps['mount']['instruction'].rstrip('.')+'.'
  steps['mount']['verification']='Record restored pedal position, mounting 10 Nm and adjustment locknut 6 Nm, secure new split pin, and free return without brake drag.'
  d['required_parts'][0]['purpose']='Renew piston assembly, pushrod, circlip and boot marked NEW on 147.'
  steps['prepare']['instruction']+=' Record the existing correct pedal position before disturbing its adjustment.'
 if old.name.startswith('front-caliper'):steps['remove']['verification']='Keep spring positions matched to diagram 127; wheel stays installed.'
 for st in d['steps']:st['source_links']=[U+'#page='+str(n) for n in st['source_pdf_pages']]
 d['source']['pdf_pages']=sorted({n for st in d['steps'] for n in st['source_pdf_pages']})
 d['source']['printed_pages']=['Symbols (unnumbered)' if n==8 else f'{n}: '+next((x for x in book[n-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x)),'front matter') for n in d['source']['pdf_pages']]
 # Source tables must not retain the prior 5 Nm bleeder or unavailable 5 mm pedal datum.
 def fix(v):
  if isinstance(v,str):return re.sub(r'(bleed(?:er| screw)(?: at)? )5 Nm',r'\g<1>6 Nm',v,flags=re.I)
  if isinstance(v,list):return [fix(x) for x in v]
  if isinstance(v,dict):return {k:fix(x) for k,x in v.items()}
  return v
 d=fix(d);wr(dest,d);art.append(dict(path=dest.relative_to(R).as_posix(),sha256=sha(dest),source_id='yamaha-us-2022-yz450f-oem',target=d['target'],step_count=len(d['steps']),review_status=d['publication_status'],template_sha256=sha(old)))
wr(B/'source-review-manifest.json',dict(schema_version=1,status='PENDING_INDEPENDENT_REVIEW',sources=[dict(source_id='yamaha-us-2022-yz450f-oem',url=U,sha256=H,local_path=str(P))],artifacts=art))
wr(B/'source-comparison.json',dict(source_sha256=H,page_mapping=M,changes=['Bleed screws 6 Nm (102/128/139), not later 5.','Rear pedal source 99 restores correct position and 6 Nm locknut; later 5 mm diagram datum not inherited.','Front master holder 154 UP/top-first 9; no later starter-lead-through-holder claim.','Front master cups135 plus retention136; rear146/147.','Rear wheel chain source102 and126, no steering page103 substitution.'],author_review_status='Candidate awaiting independent review'))
print('4 candidates, 54 steps')
