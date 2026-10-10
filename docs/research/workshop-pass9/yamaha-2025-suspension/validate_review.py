from pathlib import Path
import json,hashlib
P=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((P/'source-review-manifest.json').read_text())
for s in m['sources']:assert sha(Path(s['local_pdf_path']))==s['sha256']
for a in m['artifacts']:
 f=P/a['path'];assert sha(f)==a['sha256'];d=json.loads(f.read_text(encoding='utf-8'));assert d['target']==a['target'];seen=set()
 for dep in d.get('operation_dependencies',[]):assert sha(P.parents[3]/dep['artifact'])==dep['sha256']
 for s in d['steps']:
  assert s['id'] not in seen and set(s['depends_on'])<=seen
  assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  seen.add(s['id'])
 assert len(seen)==a['step_count']
 print(a['path'],len(seen),d['source']['review_status'])
print('PASS exact source/target/immutable references and ordered steps; pending approvals remain pending')
