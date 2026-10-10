import json,hashlib
from pathlib import Path
out=Path('docs/research/frame-pass3/continuation');p=json.loads((out/'frame-strip-reassemble-v1.procedure.json').read_text(encoding='utf8'));ids=[s['id'] for s in p['steps']];seen=set()
for s in p['steps']:
 assert s['id'] not in seen;assert all(i in seen for i in s['depends_on']);assert set(s['source_pdf_pages'])<=set(p['source']['pdf_pages']);assert s['verification'];assert not s['diagram_reference_required'] or s['source_links'];seen.add(s['id'])
for before,after in [('engine-engine-out','swingarm-off'),('frame-inspection','engine-engine-in'),('engine-engine-in','rear-link-refit'),('rear-hardware','engine-torque'),('engine-torque','front-seat-torque'),('front-seat-torque','engine-oil-flow'),('engine-fuel-ready','engine-oil-flow'),('pressure-test','engine-oil-flow')]:assert ids.index(before)<ids.index(after),(before,after)
assert all('unchanged upper shock mount' not in s['instruction'] for s in p['steps'])
assert next(s for s in p['steps'] if s['id']=='front-setup')['record_required']
assert next(s for s in p['steps'] if s['id']=='frame-inspection')['record_required']
for d in p['operation_dependencies']:assert hashlib.sha256(Path(d['artifact']).read_bytes()).hexdigest()==d['sha256']
(out/'RECOVERY.json').write_text(json.dumps({'status':p['status'],'artifact':'frame-strip-reassemble-v1.procedure.json','sha256':hashlib.sha256((out/'frame-strip-reassemble-v1.procedure.json').read_bytes()).hexdigest(),'steps':len(ids),'verified':['all source dependency hashes','unique ordered dependencies','source page containment','engine and swingarm shared pivot order','both wheels secured before fork seating','fuel and pressure check before startup','no false unchanged upper shock mount'],'frozen_parent_guides_modified':False,'remaining':'Runtime integration and physical/device validation are separate; source and closure review approved'},indent=2)+'\n',encoding='utf8')
print('Composite structural and cutpoint assertions passed:',len(ids))
