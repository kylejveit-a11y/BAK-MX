"""Read-only integrity validator. Does not create or approve evidence."""
import json,hashlib,sys
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf8'))
m=read(B/'source-review-manifest.json');approved='--approved' in sys.argv
if approved:
 assert m['status']=='APPROVED'
 ir=m['independent_review'];assert sha(R/ir['path'])==ir['sha256'];review=read(R/ir['path']);assert review['status']=='APPROVED'
 runtime=read(B/'runtime-source-review-manifest.json');assert sha(R/runtime['author_review_manifest']['path'])==runtime['author_review_manifest']['sha256']
sources={s['source_id']:s for s in m['sources']}
for s in sources.values():assert sha(Path(s['local_path']))==s['sha256']
ids=set()
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'],str(p);d=read(p);assert d['id'] not in ids;ids.add(d['id'])
 assert d['target']==a['target'] and d['target']['model']=='YZ250F' and d['target']['region']=='US'
 s=sources[a['source_id']];assert d['source']['document_sha256']==s['sha256'] and d['source']['source_url']==s['url']
 assert len(d['steps'])==a['step_count'];seen=set()
 for st in d['steps']:
  assert st['id'] not in seen and set(st['depends_on'])<=seen
  seen.add(st['id']);assert set(st['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  assert st['source_links']==[s['url']+'#page='+str(n) for n in st['source_pdf_pages']]
  assert isinstance(st['record_required'],bool) and st['verification']
 assert len(d['source']['printed_pages'])==len(d['source']['pdf_pages'])
 if approved:
  assert d['publication_status']==d['source']['review_status']==a['review_status']=='APPROVED'
  assert any(x['path']==a['path'] and x['artifact_sha256']==a['sha256'] for x in review['artifacts'])
  assert any((B/x['path']).resolve()==p.resolve() and x['sha256']==a['sha256'] for x in runtime['artifacts'])
assert len(ids)==21 and len(sources)==7
print('PASS: 21 exact-year setup candidates; source hashes, artifact hashes, applicability, step graph and locators. Read only.')
