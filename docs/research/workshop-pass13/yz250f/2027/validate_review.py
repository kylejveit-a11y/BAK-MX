"""Read-only exact source, graph and artifact validator; cannot confer approval."""
import json,hashlib,sys
from pathlib import Path
B=Path(__file__).resolve().parent;rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=rd(B/'source-review-manifest.json');s=m['sources'][0];assert sha(Path(s['local_pdf_path']))==s['sha256']
for a in m['artifacts']:
 p=B/a['path'];assert sha(p)==a['sha256'];d=rd(p);assert d['target']==a['target'];assert d['target']['model_year']==2027 and d['target']['model']=='YZ250F'
 assert d['source']['document_sha256']==s['sha256'];assert len(d['steps'])==a['step_count'];seen=set()
 for st in d['steps']:
  assert st['id'] not in seen and set(st['depends_on'])<=seen;seen.add(st['id']);assert set(st['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  assert st['source_links']==[s['url']+'#page='+str(n) for n in st['source_pdf_pages']]
 assert d['completeness']
 if '--approved' in sys.argv:
  assert m['status']==d['publication_status']==d['source']['review_status']=='APPROVED';assert d['status']=='SOURCE_REVIEWED_BOUNDED_PROCEDURE'
  rr=m['independent_review'];assert sha(B/rr['path'])==rr['sha256'];review=rd(B/rr['path']);assert a['candidate_sha256']==next(x['candidate_sha256'] for x in review['artifacts'] if Path(x['path']).name==p.name)
  rt=rd(B/'runtime-source-review-manifest.json');assert rt['artifacts']==m['artifacts'];assert sha(B/rt['parent_manifest']['path'])==rt['parent_manifest']['sha256']
print('PASS: three exact2027 candidates, source bytes, ordered steps and locators; no approval written.')
