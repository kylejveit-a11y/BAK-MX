import json,hashlib
from pathlib import Path
P=Path(__file__).parent;R=P.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
p=P/'top-end-guide-valve-renew-v1.procedure.json';d=json.loads(p.read_text(encoding='utf-8'))
m=json.loads((P/'top-end-source-review-manifest-v1.json').read_text())
assert m['status']=='APPROVED' and m['independent_review']['decision']=='APPROVED'
assert d['publication_status']=='APPROVED' and d['source']['review_status']=='APPROVED'
for source in m['sources']:assert sha(Path(source['local_pdf_path']))==source['sha256']
a=next(a for a in m['artifacts'] if a['path']==p.name)
assert sha(p)==a['sha256'] and d['target']==a['target']
for dep in d['operation_dependencies']:assert sha(R/dep['artifact'])==dep['sha256']
seen=set();ids={s['id'] for s in d['steps']}
for s in d['steps']:
 assert s['id'] not in seen and set(s['depends_on'])<=seen
 assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
 for b in s.get('branches',[]):assert b['next_step'] in ids
 seen.add(s['id'])
assert len(seen)==142
assert not any(i.startswith('head-service-1--') for i in ids)
assert set(i for p in d['phases'] for i in p['step_ids'])==ids
assert d['external_operations'][0]['step']=='head-renew--seat-service'
assert len(d['downstream_required_operations'])==2
print('PASS142steps, all dependency hashes, source-page closure, phase coverage, valid branch targets, explicit external machining and downstream run-in boundary.')
