import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((HERE/'source-review-manifest.json').read_text(encoding='utf8'))
e=m['artifacts'][0];p=HERE/e['path'];d=json.loads(p.read_text(encoding='utf8'))
assert sha(p)==e['sha256']
assert d['source']['review_status']=='APPROVED'
assert d['integration_status']=='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED'
for s in m['sources']:
 assert sha(Path(s.get('local_pdf_path',s.get('local_path'))))==s['sha256']
for dep in d['operation_dependencies']:
 assert sha(ROOT/dep['artifact'])==dep['sha256']
 assert json.loads((ROOT/dep['artifact']).read_text(encoding='utf8'))['source']['review_status']=='APPROVED'
ids=[s['id'] for s in d['steps']]
assert len(ids)==len(set(ids))==e['step_count']==150
assert d['target']=={'manufacturer':'Yamaha','model':'YZ450F','model_year':2026,'region':'US','variant':'standard'}
for i,s in enumerate(d['steps']):
 assert s['depends_on']==([ids[i-1]] if i else [])
 assert s['source_pdf_pages'] and s['verification']
 origin=s['origin'];assert sha(ROOT/origin['artifact'])==origin['sha256']
 assert origin['step_id'] in [r['id'] for r in json.loads((ROOT/origin['artifact']).read_text(encoding='utf8'))['steps']]
def before(*names):assert [ids.index(x) for x in names]==sorted(ids.index(x) for x in names),names
before('engine-engine-out','swingarm-off','linkage-renew-swingarm-bearings-in','engine-engine-in','engine-mount-torque')
before('front-stem-out','steering-renew-old-races-out','frame-inspection','steering-renew-head-races-in','front-steering-grease','front-preload')
before('rear-remove','rear-renew-bearings-out','rear-renew-right-bearing','rear-renew-new-circlip','rear-renew-spacer-left-bearings','rear-refit','engine-torque','rear-renew-close')
before('front-wheel-remove','front-renew-bearings-out','front-renew-left-bearing','front-renew-spacer-right','front-wheel-refit','rear-refit','front-seat-torque','front-steering-close')
before('control-renew-record','control-renew-ends-release','front-bar-off','loom-control-off','loom-control-refit','front-bar-refit','control-renew-ends-fit','front-control-route','control-renew-static-check','engine-oil-flow','control-renew-idle-check','control-renew-final-adjust','control-renew-steering-check','engine-complete-cooling','engine-cooling-recheck')
before('shock-upper-off','eyes-renew-eye-stack','eyes-renew-upper-eye-in','shock-upper-refit','rear-link-torque')
assert sum(s['id']=='engine-engine-out' for s in d['steps'])==1
assert all(bad not in p.read_text(encoding='utf8') for bad in ['\ufffd','â€','Â·'])
assert all(__import__('re').fullmatch(r'\d+-\d+',x) for x in d['source']['printed_pages'])
print('PASS150 steps; seven approved dependency hashes; source hashes; unique ordered progression; shared pivot, wheel, bearing, control and startup/cooldown cutpoints')
