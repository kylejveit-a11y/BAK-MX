"""Exact2022 setup companions; each mechanical change explicitly sourced from B2W."""
import json,hashlib,re,fitz
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3];PDF=Path('C:/Users/kylej/AppData/Local/Temp/B2W-2819U-12_02.pdf');URL='https://library.ymcapps.net/library/om/contents/pdf/10/B2W-2819U-12_02.pdf';SHA='54b246fb2956c8970193b54cce160544ece74a7259169a188b6aacd8c9dd4608'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();assert sha(PDF)==SHA
MAP={1:1,4:4,8:8,107:104,108:105,109:106,110:107,111:108,376:354,377:355};book=fitz.open(PDF)
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def change(v):
 if isinstance(v,str):
  v=v.replace('2023','2022').replace('BHR-2819U-10','B2W-2819U-12').replace('LIT-11626-36-32','LIT-11626-35-03')
  return re.sub(r'PDF\s*(\d+(?:[–/,]\d+)*)',lambda m:'PDF '+re.sub(r'\d+',lambda n:str(MAP[int(n[0])]),m[1]),v)
 if isinstance(v,list):return [change(x) for x in v]
 if isinstance(v,dict):return {k:change(x) for k,x in v.items()}
 return v
art=[]
for name in ['fork-baseline-v1','shock-baseline-v1','rider-sag-preload-v1']:
 old=R/f'docs/research/workshop-pass11/yamaha-2023-suspension/{name}.procedure.json';out=B/(name+'.procedure.json')
 if out.exists():assert json.loads(out.read_text(encoding='utf8'))['publication_status']!='APPROVED'
 prev=json.loads(old.read_text(encoding='utf8'));d=change(prev);d['target']['model_year']=2022;d['publication_status']=d['source']['review_status']='PENDING_INDEPENDENT_REVIEW';d['status']='SOURCE_REVIEW_CANDIDATE';d['authoring_template']={'path':old.relative_to(R).as_posix(),'sha256':sha(old),'scope':'Structure only. Exact2022 mechanical values and sag datum independently checked.'}
 d['source'].update(source_url=URL,document_sha256=SHA,document_revision='B2W-2819U-12 / LIT-11626-35-03; first edition March2021',review_note='Exact2022 B2W author review; independent review pending.')
 for st,prior in zip(d['steps'],prev['steps']):
  st['source_pdf_pages']=sorted({MAP[n] for n in prior['source_pdf_pages']})
  if name=='fork-baseline-v1':
   st['instruction']=st['instruction'].replace('adjuster 11 clicks','adjuster 9 clicks').replace('adjuster 10 clicks','adjuster 9 clicks').replace('rebound 11/compression 10','rebound 9/compression 9')
   if st['id']=='bleed':st['instruction']=st['instruction'].replace('PDF 106','PDF 105');st['source_pdf_pages']=[105]
  elif name=='shock-baseline-v1':st['instruction']=st['instruction'].replace('rebound 13 clicks','rebound 12 clicks').replace('to 1 full turn','to 7/8 turn').replace('screw 10 clicks','screw 6 clicks').replace('high-speed 1 turn','high-speed 7/8 turn').replace('low-speed 10 clicks','low-speed 6 clicks')
  else:st['instruction']=st['instruction'].replace('the exact marked rear-fender point','the rear-fender holding bolt').replace('axle center/fender mark','axle center/fender holding bolt')
  st['source_links']=[URL+'#page='+str(n) for n in st['source_pdf_pages']];st['origin']='Exact2022 B2W illustrated companion; actual setting/measurement records are explicit workflow adaptations.'
 d['source']['pdf_pages']=sorted(set([1,4]+[n for st in d['steps'] for n in st['source_pdf_pages']]))
 d['source']['printed_pages']=[f'{n}: '+next((x for x in book[n-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x)),'front matter') for n in d['source']['pdf_pages']]
 wr(out,d);art.append({'path':out.relative_to(R).as_posix(),'sha256':sha(out),'source_id':'yamaha-us-2022-yz450f-oem','target':d['target'],'step_count':len(d['steps']),'review_status':d['publication_status'],'template_sha256':sha(old)})
wr(B/'source-review-manifest.json',{'schema_version':1,'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'source_id':'yamaha-us-2022-yz450f-oem','url':URL,'sha256':SHA,'local_path':str(PDF)}],'artifacts':art});print('3 setup candidates',sum(a['step_count'] for a in art),'steps')
