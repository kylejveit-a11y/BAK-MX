"""Read-only artifact, source, applicability and recorded-progress validation."""
import json, hashlib, sys, fitz, re
from pathlib import Path
B=Path(__file__).resolve().parent; R=B.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=read(B/'source-review-manifest.json'); rows=read(B/'setup-parameters.json'); sources={s['source_id']:s for s in m['sources']}
if m['status']=='APPROVED':
 peer=R/m['independent_review']['path'];assert sha(peer)==m['independent_review']['sha256'];v=read(peer);assert v['status']=='APPROVED'
 freeze=R/m['freeze_record']['path'];assert sha(freeze)==m['freeze_record']['sha256'];f=read(freeze)
 assert read(B/'runtime-source-review-manifest.json')==m
 for a in m['artifacts']:
  binding=next(x for x in f['artifacts'] if x['path']==a['path']);approved=next(x for x in v['artifacts'] if x['path']==a['path'])
  assert binding['approved_sha256']==a['sha256'] and binding['candidate_sha256']==approved['artifact_sha256']
assert len(m['artifacts'])==32 and len(rows)==32
assert {(r['target']['model'],r['target']['model_year']) for r in rows}=={(model,year) for model in ['YZ125','YZ250','YZ125X','YZ250X'] for year in range(2020,2028)}
for s in sources.values():assert sha(Path(s['local_path']))==s['sha256']
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=read(p);s=sources[a['source_id']]
 assert d['target']==a['target'] and d['source']['document_sha256']==s['sha256'] and d['source']['source_url']==s['url']
 assert d['parameter_review']['sha256']==sha(B/'setup-parameters.json')
 if '--approved' in sys.argv:assert d['publication_status']==d['source']['review_status']=='APPROVED'
 else:assert d['publication_status'] in ['PENDING_INDEPENDENT_REVIEW','APPROVED']
 assert d['applicability']['year_inheritance']=='NONE' and set(d['affected_components'])=={'fork','shock','suspension'}
 row=next(r for r in rows if r['target']==d['target']);book=fitz.open(s['local_path']);ids=[]
 for st in d['steps']:
  assert st['id'] not in ids and st['depends_on']==([ids[-1]] if ids else [])
  assert st['record_required'] and st['diagram_reference_required']
  assert st['source_links']==[s['url']+'#page='+str(n) for n in st['source_pdf_pages']]
  assert all(0<n<=len(book) for n in st['source_pdf_pages']);ids.append(st['id'])
  key=st['id'].replace('-','_')
  if key in row['parameters']:
   v=row['parameters'][key];assert re.sub(r'(?<=\d)-(?=\d+/)', ' ', v['value']) in st['instruction'] and v['pdf_page'] in st['source_pdf_pages']
   assert hashlib.sha256(book[v['pdf_page']-1].get_text().encode()).hexdigest()==v['table_text_sha256']
   if d['target']['model_year']==2020 and key.startswith('shock'):assert 'punch-mark alignment' in st['instruction']
 assert len(ids)==8 and all(x not in p.read_text(encoding='utf8') for x in ['\ufffd','N\u00c2\u00b7'])
print('PASS: 32 exact targets, 29 source hashes, 256 recorded steps, source table hashes, range preservation and dependency ordering')
