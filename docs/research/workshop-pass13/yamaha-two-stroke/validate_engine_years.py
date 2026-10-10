"""Read-only source, comparison and exact-year candidate validation."""
import json,hashlib
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=read(B/'engine-years-source-review-manifest.json')
if m['status']=='APPROVED':
 assert read(B/'engine-years-runtime-source-review-manifest.json')==m
 assert sha(R/m['independent_review']['path'])==m['independent_review']['sha256']
 review=read(R/m['independent_review']['path']);assert review['status']=='APPROVED_FOR_BOUNDED_RUNTIME'
 for a in m['artifacts']:
  reviewed=next(v for v in review['artifacts'] if v['target']==a['target'])
  assert reviewed['approved_artifact_sha256']==a['sha256']
  assert read(R/a['path'])['publication_status']=='APPROVED'
for binding in ['template','comparison']:assert sha(R/m[binding]['path'])==m[binding]['sha256']
c=read(R/m['comparison']['path']);template=read(R/m['template']['path'])
for s in m['sources']:assert sha(Path(s['local_path']))==s['sha256']
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=read(p);s=next(s for s in m['sources'] if s['source_id']==a['source_id'])
 assert d['target']==a['target'] and d['target']['model']=='YZ250' and d['target']['region']=='US'
 row=next(t for t in c['targets'] if t['target']==d['target']);assert row['author_review_status']=='REVIEWED_EXACT_SOURCE'
 assert d['source']['source_url']==s['url'] and d['source']['document_sha256']==s['sha256']==row['source_sha256']
 ids=[]
 for st in d['steps']:
  assert st['id'] not in ids and st['depends_on']==([ids[-1]] if ids else [])
  assert st['source_links']==[s['url']+'#page='+str(n) for n in st['source_pdf_pages']]
  assert set(st['source_pdf_pages'])<=set(d['source']['pdf_pages']) and st['diagram_reference_required']
  assert st['instruction']==template['steps'][len(ids)]['instruction'].replace('2027 YZ250V',str(d['target']['model_year'])+' YZ250'+{2025:'S',2026:'T'}[d['target']['model_year']])
  ids.append(st['id'])
 assert len(ids)==a['step_count']==28
 for key in ['pushrod-off','pushrod-install']:
  st=next(st for st in d['steps'] if st['id']==key);assert st['record_required'] and 'REMOVE' in st['instruction'] and 'set pin' in st['instruction']
 assert d['applicability']['year_inheritance']=='NONE' and 'Do not start' in d['steps'][-1]['instruction']
 assert all(x not in p.read_text(encoding='utf8') for x in ['\ufffd','N\u00c2\u00b7'])
print('PASS: exact-year source/comparison bindings, 28 ordered steps each, no unreviewed mechanical mutations; independent approval separate')
