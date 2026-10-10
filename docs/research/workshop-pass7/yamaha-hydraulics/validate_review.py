"""Check immutable source/review bindings; --require-approved gates integration."""
from pathlib import Path
import hashlib,json,sys
ROOT=Path(__file__).resolve().parent
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def validate(root=ROOT,approved=False):
 m=json.loads((root/'source-review-manifest.json').read_text())
 sources={s['id']:s for s in m['sources']}
 for a in m.get('inherited_artifacts',[]): assert sha(ROOT.parents[3]/a['path'])==a['sha256'],'Inherited artifact changed'
 for s in sources.values(): assert sha(Path(s['local_pdf_path']))==s['sha256'],'Source changed'
 for a in m['artifacts']:
  assert sha(root/a['path'])==a['sha256'],'Artifact changed'
  if a['kind']!='procedure': continue
  p=json.loads((root/a['path']).read_text()); s=sources[a['source_id']]
  assert p['target']==a['target'] and p['scope_confirmed']
  assert p['source']['source_url']==s['url'] and p['source']['document_sha256']==s['sha256']
  if approved: assert p['source']['review_status']=='APPROVED','Independent review pending'
  seen=set()
  for step in p['steps']:
   assert step['id'] not in seen and set(step['depends_on'])<=seen
   assert set(step['source_pdf_pages'])<=set(p['source']['pdf_pages'])
   assert all(link.startswith(s['url']+'#page=') for link in step['source_links'])
   assert step['instruction'] and step['verification']
   seen.add(step['id'])
 print('PASS: immutable bindings, exact scope and ordered steps'+('; approved' if approved else '; approval not asserted'))
if __name__=='__main__': validate(approved='--require-approved' in sys.argv)
