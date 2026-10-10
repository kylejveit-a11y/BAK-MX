"""Read-only source and candidate integrity checks."""
import json,hashlib,sys
from pathlib import Path
B=Path(__file__).resolve().parent
def rd(p):return json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
head='--head' in sys.argv
m=rd(B/('head-source-review-manifest.json' if head else 'source-review-manifest.json'));sources={s['id']:s for s in m['sources']}
for s in sources.values():assert sha(Path(s['local_pdf_path']))==s['sha256']
for a in m['artifacts']:
 p=B/a['path'];assert sha(p)==a['sha256'];d=rd(p);s=sources[a['source_id']]
 assert d['target']==a['target']=={'manufacturer':'Yamaha','model':'YZ250F','model_year':2026,'variant':'standard','region':'US'}
 assert d['source']['document_sha256']==s['sha256'];assert len(d['steps'])==a['step_count'];seen=set()
 for st in d['steps']:
  assert st['id'] not in seen and set(st['depends_on'])<=seen;seen.add(st['id'])
  assert set(st['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  assert st['source_links']==[s['url']+'#page='+str(n) for n in st['source_pdf_pages']]
 assert ('detached' if head else 'disassembled') in ' '.join(d['exit_state'])
 if '--approved' in sys.argv:
  assert m['status']==d['publication_status']==d['source']['review_status']=='APPROVED'
  r=m['independent_review'];assert sha(B/r['path'])==r['sha256']
  review=rd(B/r['path']);assert review['candidate_sha256']==r['candidate_sha256']
  assert r['approved_artifact_sha256']==a['sha256'];assert d['completeness']
  runtime=rd(B/(('head-' if head else '')+'runtime-source-review-manifest.json'))
  assert sha(B/runtime['parent_manifest']['path'])==runtime['parent_manifest']['sha256']
  assert runtime['artifacts']==m['artifacts'] and runtime['sources']==m['sources']
print('PASS: exact-source hash, candidate integrity, ordered graph and source locators. No approval written.')
