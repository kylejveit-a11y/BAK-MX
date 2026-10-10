import json,hashlib
from pathlib import Path
out=Path(__file__).parent;m=json.loads((out/'source-review-manifest.json').read_text(encoding='utf8'));p=json.loads((out/m['artifacts'][0]['path']).read_text(encoding='utf8'))
for a in m['artifacts']:assert hashlib.sha256((out/a['path']).read_bytes()).hexdigest()==a['sha256']
for s in m['sources']:assert hashlib.sha256(Path(s['local_pdf_path']).read_bytes()).hexdigest()==s['sha256']
for d in p['operation_dependencies']:assert hashlib.sha256(Path(d['artifact']).read_bytes()).hexdigest()==d['sha256']
ids=[]
for s in p['steps']:
 assert s['id'] not in ids;assert s['depends_on']==ids[-1:];ids.append(s['id']);assert s['verification'];assert set(s['source_pdf_pages'])<=set(p['source']['pdf_pages'])
 if s['diagram_reference_required']:assert s['source_links']
 for u in s['source_links']:assert u.split('#')[0]==p['source']['source_url'] and int(u.split('=')[-1]) in s['source_pdf_pages']
for a,b in [('seals-clip-out','bearings-out'),('right-bearing','new-circlip'),('new-circlip','spacer-left-bearings'),('spacer-left-bearings','new-seals'),('sprocket-refit','refit'),('disc-refit','refit'),('slack','torque'),('torque','close')]:assert ids.index(a)<ids.index(b)
assert len(ids)==18
assert p['integration_status']=='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED'
by={s['id']:s for s in p['steps']}
assert 'both matching new left-side bearings' in by['spacer-left-bearings']['instruction']
assert 'approximate1.0 mm' in by['new-seals']['instruction'] and by['new-seals']['record_required']
assert '42 N' in by['sprocket-refit']['instruction'] and '12 N' in by['disc-refit']['instruction']
assert '135 N' in by['torque']['instruction'] and '21 N' in by['torque']['instruction']
assert 'each rear-wheel limit is2.0 mm' in by['close']['instruction']
assert 'runout measurements recorded' not in str(by['hub-inspection']['verification'])
assert by['close']['record_required']
print('PASS18steps; source/dependency hashes; three-bearing sequence, seal depth, disc/sprocket and axle/chain closure')
