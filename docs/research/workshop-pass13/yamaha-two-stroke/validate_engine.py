"""Read-only exact-source and ordered engine artifact validation."""
import json,hashlib,sys
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=read(B/'engine-source-review-manifest.json')
if m['status']=='APPROVED':
 review=R/m['independent_review']['path'];assert sha(review)==m['independent_review']['sha256']
 v=read(review);assert v['status']=='APPROVED_FOR_BOUNDED_RUNTIME'
 assert v['approved_artifact_sha256']==m['artifacts'][0]['sha256'] and v['source_sha256']==m['sources'][0]['sha256']
 assert read(B/'engine-runtime-source-review-manifest.json')==m
for s in m['sources']:assert sha(Path(s['local_path']))==s['sha256']
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=read(p);s=next(s for s in m['sources'] if s['source_id']==a['source_id'])
 assert d['target']==a['target']==dict(manufacturer='Yamaha',model='YZ250',model_year=2027,region='US',variant='standard')
 assert d['source']['document_sha256']==s['sha256'] and d['source']['source_url']==s['url']
 if '--approved' in sys.argv:assert d['publication_status']==d['source']['review_status']=='APPROVED'
 ids=[]
 for st in d['steps']:
  assert st['id'] not in ids and st['depends_on']==([ids[-1]] if ids else [])
  assert st['source_links']==[s['url']+'#page='+str(n) for n in st['source_pdf_pages']]
  assert set(st['source_pdf_pages'])<=set(d['source']['pdf_pages']) and st['diagram_reference_required'];ids.append(st['id'])
  if any(x in st['id'] for x in ['measure','check','match','handoff','entry']):assert st['record_required']
 assert len(ids)==a['step_count']==28
 for id in ['pushrod-off','pushrod-install']:
  st=next(st for st in d['steps'] if st['id']==id);assert 'set pin' in st['instruction'] and 'REMOVE' in st['instruction'] and st['record_required']
 assert ids.index('thrust-plate')<ids.index('shaft-stack')<ids.index('valve-lock')
 assert ids.index('piston-install')<ids.index('cylinder-install')<ids.index('head-install')
 assert d['applicability']['year_inheritance']=='NONE' and 'Do not start' in d['steps'][-1]['instruction']
 assert all(c not in p.read_text(encoding='utf8') for c in ['\ufffd','N\u00c2\u00b7'])
print('PASS: prepared-engine 28 steps, exact-source/artifact hashes, ordered assembly and recorded set-pin removal; independent review is separate')
