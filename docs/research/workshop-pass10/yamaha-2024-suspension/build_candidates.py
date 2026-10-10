"""Exact 2024 candidate authoring using reviewed structure and explicit source mapping."""
import hashlib,json,re,sys
from pathlib import Path
import fitz
B=Path(__file__).parent;R=B.parents[3];PDF=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-11_02.pdf')
SHA='6e784b3b15fe1e131f0e385676ca2873e74d783ee2499ce561e595bcea9ca9be';URL='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-11_02.pdf'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(PDF)==SHA
book=fitz.open(PDF)
MAP={1:1,3:4,7:8,62:60,88:84,384:376,385:377}
MAP.update({n:n-4 for n in range(106,158)})
MAP.update({n:n-3 for n in range(160,196)})
def mapped(ns):return sorted({MAP[n] for n in ns})
def textfix(t):
 for a,b in [('Â³','³'),('Â·','·'),('â€“','–'),('â€”','—'),('â‰¥','≥')]:t=t.replace(a,b)
 t=t.replace('2025','2024').replace('D02-2819U-10','BHR-2819U-11').replace('LIT-11626-38-16','LIT-11626-37-11')
 def refs(m):return 'PDF'+re.sub(r'\d+',lambda x:str(MAP[int(x[0])]),m[1])
 t=re.sub(r'PDF\s*(\d+(?:[/,–-]\d+)*)',refs,t)
 t=re.sub(r'\b(pages?)\s*(\d+(?:[/,–-]\d+)*)',lambda m:m[1]+' '+re.sub(r'\d+',lambda n:str(MAP[int(n[0])]),m[2]),t)
 t=re.sub(r'(diagram|shown on|marked on|NEW on|from|on)(\s*)(1[2-7]\d(?:/1[2-7]\d)*)',lambda m:m[1]+m[2]+'/'.join(str(MAP[int(x)]) for x in m[3].split('/')),t)
 return t
def walk(v):
 if isinstance(v,str):return textfix(v)
 if isinstance(v,list):return [walk(x) for x in v]
 if isinstance(v,dict):return {k:walk(x) for k,x in v.items()}
 return v
def save(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
for kind in (['brakes'] if '--brakes-only' in sys.argv else ['suspension','brakes']):
 out=B if kind=='suspension' else B.parent/'yamaha-2024-brakes';out.mkdir(exist_ok=True)
 entries=[]
 for p in sorted((R/f'docs/research/workshop-pass9/yamaha-2025-{kind}').glob('*.procedure.json')):
  name=p.name.replace('bushings-v2','bushings-v1');dest=out/name
  if dest.exists():assert json.loads(dest.read_text())['publication_status']!='APPROVED','Frozen artifact: '+str(dest)
  old=json.loads(p.read_text(encoding='utf8'));assert old['publication_status']=='APPROVED'
  d=walk(old);d['target']['model_year']=2024;d['id']=d['id'].replace('bushings-v2','bushings-v1')
  d['publication_status']='PENDING_INDEPENDENT_REVIEW';d['source']['review_status']=d['publication_status']
  d['source']['source_url']=URL;d['source']['document_sha256']=SHA;d['source']['document_revision']='BHR-2819U-11 / LIT-11626-37-11; first edition February 2023'
  d['source']['review_note']='Exact 2024 author source reconciliation complete; independent review pending. Similar structure does not transfer year approval.'
  d['source']['pdf_pages']=mapped(old['source']['pdf_pages'])
  d['source']['printed_pages']=['Symbols (unnumbered)' if n==8 else str(n)+': '+next((x.strip() for x in book[n-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x.strip())),'front matter') for n in d['source']['pdf_pages']]
  for k in ['reviewed_at','integration_status']:d.pop(k,None)
  d['operation_dependencies']=[]
  d['authoring_template']={'path':str(p.relative_to(R)).replace('\\','/'),'sha256':sha(p),'scope':'Sequence structure only; not mechanical applicability evidence.'}
  for i,s in enumerate(d['steps']):
   s['source_pdf_pages']=mapped(old['steps'][i]['source_pdf_pages'])
   s['source_links']=[URL+'#page='+str(n) for n in s['source_pdf_pages']]
   s['origin']='Original illustrated companion reconciled against exact 2024 BHR source; logging/support and closed-caliper retention are explicit workflow adaptations.'
  if name=='fork-baseline-v1.procedure.json':
   for s in d['steps']:
    s['instruction']=s['instruction'].replace('adjuster10 clicks','adjuster11 clicks').replace('adjuster12 clicks','adjuster10 clicks').replace('rebound10/compression12','rebound11/compression10')
  if name=='shock-baseline-v1.procedure.json':
   for s in d['steps']:
    s['instruction']=s['instruction'].replace('rebound12 clicks','rebound13 clicks').replace('screw9 clicks','screw10 clicks').replace('low-speed9 clicks','low-speed10 clicks').replace(' This2024 shock is not the revised2026 tool-free unit.','')
  if name=='rider-sag-preload-v1.procedure.json':
   for s in d['steps']:s['instruction']=s['instruction'].replace('reference is8.0mm','reference is7.0mm')
  if 'oil-seals' in name:
   def forkvalues(v):
    if isinstance(v,str):return re.sub(r'(?<![\d.])5 mm','7 mm',v).replace('275 cm','270 cm')
    if isinstance(v,list):return [forkvalues(x) for x in v]
    if isinstance(v,dict):return {k:forkvalues(x) for k,x in v.items()}
    return v
   d=forkvalues(d);d['settings']['fork_projection_mm']=7
   for material in d.get('materials',[]):
    if material.get('name')=='Lithium-soap-based grease':material['purpose']='Fork seal lips and inner-tube surface during dust-seal installation, plus axle/wheel oil-seal lips. Use fork oil on the tube during the earlier oil-seal insertion stage, as each step specifies.'
  for s in d['steps']:
   if name=='front-master-rebuild-v1.procedure.json':s['instruction']=re.sub(r'as\s*148/149','as illustrated in the linked hose-routing diagrams',s['instruction'])
   s['instruction']=re.sub(r'(?<=[A-Za-z])(?=\d)', ' ', s['instruction'])
   s['instruction']=re.sub(r'(?<=\d)(Nm|mm|cm³)\b',lambda m:' '+('N·m' if m[1]=='Nm' else m[1]),s['instruction'])
  save(dest,d)
  entries.append({'path':str(dest.relative_to(R)).replace('\\','/'),'sha256':sha(dest),'source_id':'yamaha-us-2024-yz450f-oem','target':d['target'],'step_count':len(d['steps']),'review_status':d['publication_status'],'template_sha256':sha(p)})
 save(out/'source-review-manifest.json',{'schema_version':1,'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'source_id':'yamaha-us-2024-yz450f-oem','url':URL,'sha256':SHA,'local_path':str(PDF)}],'artifacts':entries})
 print(kind,len(entries),'candidates',sum(a['step_count'] for a in entries),'steps')
