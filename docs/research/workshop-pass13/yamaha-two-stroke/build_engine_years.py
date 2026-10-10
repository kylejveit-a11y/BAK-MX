"""Author exact-year candidates only for individually reviewed source mappings."""
import copy, hashlib, json, re
from pathlib import Path
import fitz
B=Path(__file__).resolve().parent; R=B.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d): p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
template=B/'2027-yz250-top-end-power-valve-bench-v1.procedure.json'
assert sha(template)=='0c3d1de84dd5067ecd7ca8df57415bf5484457ec2473c2a21976a010016d280b'
comparison=read(B/'yz250-engine-year-comparison.json')
manifest={'schema_version':1,'status':'CANDIDATE_PENDING_INDEPENDENT_REVIEW','sources':[],'artifacts':[],'template':{'path':template.relative_to(R).as_posix(),'sha256':sha(template)},'limitations':['Prepared-engine scope only; access/refit and commissioning remain separate.','Exact manual comparison does not establish part interchangeability.']}
for year,suffix,lit in [(2025,'S','LIT-11626-38-54'),(2026,'T','LIT-11626-39-07')]:
 c=next(c for c in comparison['targets'] if c['target']['model_year']==year)
 assert c.get('author_review_status')=='REVIEWED_EXACT_SOURCE'
 p=B/f'{year}-yz250-top-end-power-valve-bench-v1.procedure.json'
 if p.exists() and read(p)['publication_status']=='APPROVED':raise SystemExit('Frozen artifact: '+str(p))
 assert sha(Path(c['local_path']))==c['source_sha256']
 d=copy.deepcopy(read(template));d['id']=d['id'].replace('2027',str(year));d['target']=c['target'];d['publication_status']='PENDING_INDEPENDENT_REVIEW'
 d['applicability']['included']=f'Exact standard US {year} YZ250{suffix} original two-stroke engine; prepared cold engine with accepted closed lower end.'
 doc=fitz.open(c['local_path']);code=Path(c['local_path']).stem.replace('_02','')
 d['source'].update(source_url=c['source_url'],document_sha256=c['source_sha256'],document_revision=f'{code} / {lit}; US {year} YZ250{suffix}',review_status='AUTHOR_REVIEWED_PENDING_INDEPENDENT_REVIEW',review_note='Exact-year cover, complete top-end text, source-specification differences and rendered assembly/measurement diagrams reviewed; independent review pending.')
 for st in d['steps']:
  st['source_links']=[c['source_url']+'#page='+str(n) for n in st['source_pdf_pages']]
  for k in ['instruction','title','verification']:
   if isinstance(st.get(k),str):st[k]=st[k].replace('2027 YZ250V',f'{year} YZ250{suffix}')
 write(p,d);sid=f'yamaha-us-{year}-yz250-oem'
 manifest['sources'].append(dict(id=sid,source_id=sid,url=c['source_url'],sha256=c['source_sha256'],local_path=c['local_path'],local_pdf_path=c['local_path']))
 manifest['artifacts'].append(dict(path=p.relative_to(R).as_posix(),kind='procedure',sha256=sha(p),source_id=sid,target=d['target'],step_count=len(d['steps'])))
manifest['comparison']={'path':(B/'yz250-engine-year-comparison.json').relative_to(R).as_posix(),'sha256':sha(B/'yz250-engine-year-comparison.json')}
write(B/'engine-years-source-review-manifest.json',manifest)
print('Saved exact-year candidates:',len(manifest['artifacts']))
