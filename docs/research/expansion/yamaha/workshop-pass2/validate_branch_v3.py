import json,hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent
def read(n):return json.loads((HERE/n).read_text(encoding='utf-8'))
def sha(n):return hashlib.sha256((HERE/n).read_bytes()).hexdigest()
m=read('branch-review-manifest.json')
assert sha(m['original_artifact'])==m['original_artifact_sha256']
assert sha(m['preserved_checkpoint_manifest'])==m['preserved_checkpoint_manifest_sha256']
for a in m['artifacts']: assert sha(a['path'])==a['sha256']
p=read('valve-adjustment-v3.procedure.json')
old=read('valve-adjustment-v2.procedure.json')
ids=[s['id'] for s in p['steps']]
assert ids==[s['id'] for s in old['steps']]
scope=next(s for s in p['steps'] if s['id']=='adjustment-scope')
assert scope['record_required'] and 92 in scope['source_pdf_pages']
assert len(scope['branches'])==1
b=scope['branches'][0]
assert b['id']=='within-range' and b['next_step']=='cover-install'
skipped=ids[ids.index('adjustment-scope')+1:ids.index('cover-install')]
assert all(s in skipped for s in ['tensioner-remove','cams-remove','pads-select','cams-install','timing-verify','remeasure'])
assert p['branch_completion_policy']['within-range']['skipped_step_status']=='NOT_PERFORMED'
assert p['branch_completion_policy']['within-range']['never_mark_skipped_complete']
for current,original in zip(p['steps'],old['steps']):
    if current['id']!='adjustment-scope':assert current==original
assert ids[ids.index('cover-install'):]==['cover-install','plug-access-close','tank-install','body-install','closeout']
print('PASS explicit in-range branch; bypassed steps NOT_PERFORMED; complete closure retained; v2 and original final manifest unchanged')
