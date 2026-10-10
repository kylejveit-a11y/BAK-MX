"""Read-only dependency/source/branch/cold-start closure checks."""
import hashlib,json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((HERE/'source-review-manifest.json').read_text(encoding='utf8'))
for source in m['sources']:assert sha(Path(source['local_pdf_path']))==source['sha256'],source['id']
for a in m['artifacts']:
 p=HERE/a['path'];assert sha(p)==a['sha256'];d=json.loads(p.read_text(encoding='utf8'))
 assert d['target']==a['target']=={'manufacturer':'Yamaha','model':'YZ450F','model_year':2024,'region':'US','variant':'standard'}
 assert d['source']['document_sha256']=='6e784b3b15fe1e131f0e385676ca2873e74d783ee2499ce561e595bcea9ca9be'
 for dep in d['operation_dependencies']:
  dp=ROOT/dep['artifact'];assert sha(dp)==dep['sha256'];s=json.loads(dp.read_text(encoding='utf8'))
  assert s['source']['review_status']=='APPROVED' and s['target']==d['target']
  assert s['source']['document_sha256']==d['source']['document_sha256']
 ids=[s['id'] for s in d['steps']];assert len(ids)==len(set(ids))==a['step_count']
 for i,s in enumerate(d['steps']):
  assert s['depends_on']==([ids[i-1]] if i else [])
  assert s['verification'] and s['source_links'] and s['source_pdf_pages']
  origin=s.get('origin');assert origin, s['id']
  op=ROOT/origin['artifact'];assert sha(op)==origin['sha256']
  od=json.loads(op.read_text(encoding='utf8'));assert od['target']==d['target'] and od['source']['review_status']=='APPROVED'
  assert any(x['id']==origin['step_id'] for x in od['steps'])
  assert all(('D02-' not in (x if isinstance(x,str) else x.get('url',''))) for x in s['source_links'])
  assert all(p in d['source']['pdf_pages'] for p in s['source_pdf_pages'])
  for b in s.get('branches',[]):assert ids.index(b['next_step'])>i
 def before(a,b):assert ids.index(a)<ids.index(b),(a,b)
 before('access-engine-engine-out','topend-entry');before('topend-ports-close','access-engine-bench-record');before('access-engine-bench-record','access-engine-engine-in')
 before('access-engine-torque','access-engine-sprocket-final')
 before('commission-test-attach','access-engine-oil-flow');before('access-engine-oil-flow','commission-test-warm')
 before('commission-test-warm','commission-test-hold');before('commission-test-hold','commission-test-cool-close')
 before('commission-test-cool-close','access-control-renew-idle-check');before('access-engine-final-checks','commission-first-ride')
 before('commission-generator-close','commission-oil-fill');before('commission-oil-fill','commission-oil-flow');before('commission-oil-flow','commission-final')
 assert 'access-pressure-test' not in ids and 'topend-exit' not in ids
 assert len([s for s in ids if s=='commission-test-attach'])==1
 before('access-engine-bench-record','access-engine-oil-fill')
 assert 'filter' in next(s for s in d['steps'] if s['id']=='access-engine-bench-record')['verification'][0]
 for x in d.get('external_operations',[]):assert x.get('step_id') in ids
 assert d.get('external_operations') and d.get('open_knowledge_dependencies'),'External work must not disappear in composition'
 for id in ['topend-first-measure','topend-adjust-measure','commission-test-hold','commission-tank-cleaning-record','commission-final']:
  assert next(s for s in d['steps'] if s['id']==id)['record_required'],id
 if '--approved' in sys.argv:
  assert d['source']['review_status']=='APPROVED' and d['integration_status']=='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED'
  r=m['independent_review'];rp=HERE/r['path'];assert sha(rp)==r['sha256']
  review=json.loads(rp.read_text(encoding='utf8'));assert review['target']==d['target']
  assert any(x['path']==p.name and x['sha256']==a['sha256'] for x in review['artifacts'])
 print(p.name,len(ids),'steps: source/dependency/branch/closure PASS;',d['source']['review_status'])
