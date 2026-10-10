"""Read-only source, original-step, correction, graph and first-start integrity checks."""
import hashlib,json,sys
from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rd=lambda p:json.loads(p.read_text(encoding='utf-8'))
major='--major' in sys.argv
m=rd(H/('major-source-review-manifest.json' if major else 'source-review-manifest.json'))
for src in m['sources']:assert sha(Path(src['local_pdf_path']))==src['sha256']
if m.get('author_review'):assert sha(H/m['author_review']['path'])==m['author_review']['sha256']
for a in m['artifacts']:
 p=H/a['path'];assert sha(p)==a['sha256'];d=rd(p)
 assert d['target']==a['target']==dict(manufacturer='Yamaha',model='YZ450F',model_year=2022,region='US',variant='standard')
 assert d['source']['document_sha256']=='54b246fb2956c8970193b54cce160544ece74a7259169a188b6aacd8c9dd4608'
 for dep in d['operation_dependencies']:
  q=R/dep['artifact'];assert sha(q)==dep['sha256'];od=rd(q)
  assert od['source']['review_status']=='APPROVED' and od['target']==d['target']
 for dep in d.get('correction_dependencies',[]):assert sha(R/dep['artifact'])==dep['sha256']
 ids=[s['id'] for s in d['steps']];assert len(set(ids))==len(ids)==a['step_count']
 assert len(d['source']['pdf_pages'])==len(d['source']['printed_pages'])
 for i,s in enumerate(d['steps']):
  assert s['depends_on']==([ids[i-1]] if i else [])
  assert s['verification'] and s['source_links']
  assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  o=s['origin'];q=R/o['artifact'];assert sha(q)==o['sha256'];od=rd(q)
  assert od['target']==d['target'] and od['source']['review_status']=='APPROVED'
  original=next(x for x in od['steps'] if x['id']==o['step_id'])
  if not s.get('composition_adaptation'):
   assert s['instruction']==original['instruction'] and s['verification']==original['verification'],s['id']
  for branch in s.get('branches',[]):assert ids.index(branch['next_step'])>i
 def before(a,b):assert ids.index(a)<ids.index(b),(a,b)
 before('access-engine-engine-out','topend-entry');before('topend-ports-close','access-engine-bench-record');before('access-engine-bench-record','access-engine-engine-in')
 before('access-engine-exhaust-suspension-refit','access-engine-oil-flow')
 before('access-engine-torque','access-engine-sprocket-final')
 before('commission-test-attach','access-engine-oil-flow');before('access-engine-oil-flow','commission-test-warm')
 before('commission-test-warm','commission-test-hold');before('commission-test-hold','commission-test-cool-close')
 before('commission-test-cool-close','access-control-renew-idle-check');before('access-engine-final-checks','commission-first-ride')
 before('commission-generator-close','commission-oil-fill');before('commission-oil-fill','commission-oil-flow');before('commission-oil-flow','commission-final')
 assert 'access-pressure-test' not in ids and 'topend-exit' not in ids
 for x in d.get('external_operations',[]):assert x.get('step_id') in ids
 assert {'access-engine-initial-record','access-engine-final-checks','commission-tank-cleaning-record','commission-oil-level'}<={x['step_id'] for x in d['external_operations']}
 for id in ['topend-first-measure','topend-adjust-measure','commission-test-hold','commission-tank-cleaning-record','commission-final']:assert next(s for s in d['steps'] if s['id']==id)['record_required']
 if major:
  before('topend-piston-out','lower-entry');before('lower-exit','topend-bore')
  assert 'cloth' in next(s for s in d['steps'] if s['id']=='lower-entry')['instruction']
  assert '0.90' in next(s for s in d['steps'] if s['id']=='access-engine-oil-fill')['instruction']
  assert '0.65' in next(s for s in d['steps'] if s['id']=='commission-oil-fill')['instruction']
 if '--approved' in sys.argv:
  assert m['status']=='APPROVED' and d['source']['review_status']=='APPROVED'
  rv=m['independent_review'];assert sha(H/rv['path'])==rv['sha256'];review=rd(H/rv['path'])
  assert review['status']=='APPROVED' and review['artifact_sha256']==a['sha256']
 print('PASS',a['path'],len(ids),'steps',sha(p))
