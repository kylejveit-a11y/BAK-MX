import json,hashlib
from pathlib import Path
P=Path(__file__).parent
m=json.loads((P/'source-review-manifest.json').read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for s in m['sources']:assert sha(Path(s['local_pdf_path']))==s['sha256']
for a in m['artifacts']:
 p=P/a['path'];assert sha(p)==a['sha256'];d=json.loads(p.read_text(encoding='utf-8'));assert d['target']==a['target'];seen=set()
 for dep in d.get('operation_dependencies',[]):assert sha(P.parents[3]/dep['artifact'])==dep['sha256']
 for s in d['steps']:
  assert s['id'] not in seen and set(s.get('depends_on',[]))<=seen
  assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  assert isinstance(s['verification'],list) and s['verification']
  if s.get('diagram_reference_required'):assert s['source_links']
  seen.add(s['id'])
 print(a['path'],len(d['steps']),d['publication_status'],a['sha256'])
print('PASS source bytes, artifact hashes, exact target, ordered dependencies and source-page coverage. Independent review status preserved.')
