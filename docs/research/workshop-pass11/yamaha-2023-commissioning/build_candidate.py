"""Exact2023 commissioning candidate; structure source is not year authority."""
from pathlib import Path
import json,hashlib,re,fitz
B=Path(__file__).resolve().parent;R=B.parents[3];OLD=R/'docs/research/workshop-pass10/yamaha-2024-commissioning/post-rebuild-commissioning-v1.procedure.json';OUT=B/'post-rebuild-commissioning-v1.procedure.json';PDF=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-10_02.pdf');URL='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-10_02.pdf';SHA='9a8605e26301ba1d0d1d21e93d23cca721bdcdbece6188775626a8819332aa9f'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(PDF)==SHA
if OUT.exists():assert json.loads(OUT.read_text(encoding='utf8'))['publication_status']!='APPROVED','Frozen; refusing rebuild'
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def mp(n):return n-1 if 35<=n<=41 else n
def transform(v,k=''):
 if isinstance(v,dict):return {a:transform(b,a) for a,b in v.items()}
 if isinstance(v,list):return [mp(x) for x in v] if k in ['pdf_pages','source_pdf_pages'] else [transform(x) for x in v]
 if isinstance(v,str):
  v=re.sub(r'https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-11_02.pdf#page=(\d+)',lambda m:URL+'#page='+str(mp(int(m[1]))),v)
  return v.replace('2024','2023').replace('BHR-2819U-11','BHR-2819U-10').replace('LIT-11626-37-11','LIT-11626-36-32')
 return v
d=transform(json.loads(OLD.read_text(encoding='utf8')));d['target']['model_year']=2023;d['publication_status']=d['source']['review_status']='CANDIDATE';d['status']='SOURCE_REVIEW_CANDIDATE'
d['source'].update(source_url=URL,document_sha256=SHA,document_revision='BHR-2819U-10 / LIT-11626-36-32; first edition July2022',document_id='BHR-2819U-10 / LIT-11626-36-32',review_note='Exact2023 author source comparison complete; independent review pending.')
for st in d['steps']:
 if st['id']=='filter-close':st['source_pdf_pages']=sorted(set(st['source_pdf_pages']+[95]));st['source_links']=[URL+'#page='+str(n) for n in st['source_pdf_pages']]
book=fitz.open(PDF);d['source']['printed_pages']=[f'{n}: '+next(x for x in book[n-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x)) for n in d['source']['pdf_pages']]
wr(OUT,d)
wr(B/'source-review-manifest.json',{'schema_version':1,'status':'CANDIDATE','sources':[{'source_id':'yamaha-us-2023-yz450f-oem','url':URL,'sha256':SHA,'local_path':str(PDF)},*[{'source_id':x['id'],'url':x['url'],'sha256':x['sha256'],'local_path':x['local_path']} for x in d['supplemental_sources']]],'artifacts':[{'path':OUT.relative_to(R).as_posix(),'sha256':sha(OUT),'target':d['target'],'review_status':'CANDIDATE','source_id':'yamaha-us-2023-yz450f-oem'}],'structure_reference':{'path':OLD.relative_to(R).as_posix(),'sha256':sha(OLD),'scope':'Structure only; exact2023 source checked independently.'},'independent_review':None})
print('Candidate32',sha(OUT))
