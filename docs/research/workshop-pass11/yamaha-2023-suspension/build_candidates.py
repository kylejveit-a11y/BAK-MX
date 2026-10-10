"""Exact2023 candidates from checked BHR pages; prior-year sequence structure only."""
import hashlib,json,re,fitz,sys
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3];P=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-10_02.pdf');U='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-10_02.pdf';H='9a8605e26301ba1d0d1d21e93d23cca721bdcdbece6188775626a8819332aa9f'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(P)==H;book=fitz.open(P)
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def change(v):
 if isinstance(v,str):return v.replace('2024','2023').replace('BHR-2819U-11','BHR-2819U-10').replace('LIT-11626-37-11','LIT-11626-36-32')
 if isinstance(v,list):return [change(x) for x in v]
 if isinstance(v,dict):return {k:change(x) for k,x in v.items()}
 return v
for kind in (['brakes'] if '--brakes-only' in sys.argv else ['suspension','brakes']):
 out=B if kind=='suspension' else B.parent/'yamaha-2023-brakes';out.mkdir(exist_ok=True);art=[]
 for old in sorted((R/f'docs/research/workshop-pass10/yamaha-2024-{kind}').glob('*.procedure.json')):
  dest=out/old.name
  if dest.exists():assert json.loads(dest.read_text(encoding="utf8"))['publication_status']!='APPROVED','Frozen; do not overwrite'
  prior=json.loads(old.read_text(encoding="utf8"));assert prior['publication_status']=='APPROVED';d=change(prior);d['target']['model_year']=2023;d['publication_status']=d['source']['review_status']='PENDING_INDEPENDENT_REVIEW';d['status']='SOURCE_REVIEW_CANDIDATE'
  for k in ['reviewed_at','integration_status']:d.pop(k,None)
  d['source'].update(source_url=U,document_sha256=H,document_revision='BHR-2819U-10 / LIT-11626-36-32; first edition July2022',review_note='Exact2023 author source comparison; independent review pending. Mechanical values verified in this manual, no inferred year inheritance.')
  d['source']['printed_pages']=['Symbols (unnumbered)' if n==8 else f'{n}: '+next((x for x in book[n-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x)),'front matter') for n in d['source']['pdf_pages']]
  d['authoring_template']={'path':old.relative_to(R).as_posix(),'sha256':sha(old),'scope':'Sequence structure only; source identity does not transfer across years.'};d['operation_dependencies']=[]
  for st in d['steps']:
   st['source_links']=[U+'#page='+str(n) for n in st['source_pdf_pages']]
   st['origin']='Original illustrated companion checked against exact2023 BHR pages; closed hydraulic access and observation records are explicit workflow adaptations.'
  wr(dest,d);art.append({'path':dest.relative_to(R).as_posix(),'sha256':sha(dest),'source_id':'yamaha-us-2023-yz450f-oem','target':d['target'],'step_count':len(d['steps']),'review_status':d['publication_status'],'template_sha256':sha(old)})
 wr(out/'source-review-manifest.json',{'schema_version':1,'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'source_id':'yamaha-us-2023-yz450f-oem','url':U,'sha256':H,'local_path':str(P)}],'artifacts':art});print(kind,len(art),sum(a['step_count'] for a in art),'candidate steps')
