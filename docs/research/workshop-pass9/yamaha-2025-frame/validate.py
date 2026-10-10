"""Read-only source/hash/closure validation. Pass --approved for integration gate."""
import hashlib,json,re,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
m=json.loads((HERE/'source-review-manifest.json').read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
review=None
if 'independent_review' in m:
 binding=m['independent_review'];rp=HERE/binding['path']
 assert rp.resolve().parent==HERE.resolve() and sha(rp)==binding['sha256'],'Independent review hash/path'
 review=json.loads(rp.read_text(encoding='utf8'))
 assert review['status']=='APPROVED_BOUNDED_OPERATIONS'
 assert review['source_sha256']=='5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac'
 assert {(x['path'],x['sha256']) for x in review['artifacts']}=={(x['path'],x['sha256']) for x in m['artifacts']},'Review artifact bindings'
elif '--approved' in sys.argv:raise AssertionError('Missing independent review binding')
for s in m['sources']:assert sha(Path(s['local_pdf_path']))==s['sha256'],s['id']
for a in m['artifacts']:
 p=HERE/a['path'];assert sha(p)==a['sha256'],p.name
 text=p.read_text(encoding='utf8');d=json.loads(text)
 assert d['target']=={'manufacturer':'Yamaha','model':'YZ450F','model_year':2025,'region':'US','variant':'standard'}
 source=next(x for x in m['sources'] if x['id']==a['source_id'])
 assert d['source']['document_sha256']==source['sha256'] and d['source']['source_url']==source['url']
 assert a['target']==d['target']
 if review:assert review['target']==d['target'] and review['source_sha256']==d['source']['document_sha256']
 assert not any(x in text for x in ['\ufffd','N\u00c2\u00b7m','7-15 mm','old head gasket','upper-chain-tensioner retaining pin'])
 if '--approved' in sys.argv:assert d['source']['review_status']=='APPROVED' and d['integration_status']=='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED'
 ids=[s['id'] for s in d['steps']];assert len(ids)==len(set(ids))==a['step_count']
 for i,s in enumerate(d['steps']):
  assert s['depends_on']==([ids[i-1]] if i else []),s['id']
  assert s['source_pdf_pages'] and all(x in d['source']['pdf_pages'] for x in s['source_pdf_pages'])
  assert s['verification'] and s['source_links']
  assert all('D03-' not in (x if isinstance(x,str) else x['url']) for x in s['source_links'])
 def before(a,b):assert ids.index(a)<ids.index(b),(a,b)
 def instruction(id):return next(s['instruction'] for s in d['steps'] if s['id']==id)
 before('engine-sprocket','engine-pedal-guard');before('engine-torque','engine-sprocket-final');before('engine-sprocket-final','engine-oil-flow')
 before('engine-engine-out','engine-engine-in');before('engine-mount-torque','engine-oil-flow')
 before('engine-cooling-recheck','engine-final-checks')
 assert '7-12 mm' in instruction('engine-release-refit') and '4.3' in instruction('engine-release-refit')
 assert '0.94' in instruction('engine-oil-fill') and '0.96' in instruction('engine-oil-fill')
 if 'frame-final' in ids:
  before('engine-engine-out','swingarm-off');before('rear-refit','front-seat-torque');before('rear-link-torque','front-seat-torque')
  before('steering-renew-head-races-in','front-preload');before('eyes-renew-upper-eye-in','shock-upper-refit')
  assert '5 mm' in instruction('front-height-clamps') and '2 mm' not in instruction('front-height-clamps')
  assert '16 Nm' in instruction('rear-frame-refit') and 'retaining pin' not in instruction('rear-frame-refit')
  assert 'molybdenum' in instruction('eyes-renew-upper-eye-in')
  before('rear-renew-right-bearing','rear-renew-new-circlip');before('rear-renew-new-circlip','rear-renew-spacer-left-bearings')
  assert 'OUTSIDE' in instruction('rear-harness-route') and 'LEFT' in instruction('front-control-route')
 for id in ['engine-initial-record','engine-release-refit','engine-oil-fill','engine-final-checks']:
  assert next(s for s in d['steps'] if s['id']==id)['record_required'],id
 print(p.name,len(ids),'steps: hashes, exact target and ordered closure PASS;',d['source']['review_status'])
