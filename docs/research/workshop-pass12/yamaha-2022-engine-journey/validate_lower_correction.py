"""Read-only exact patch verification. Never rewrites or approves sources."""
import copy,hashlib,json
from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rd=lambda p:json.loads(p.read_text(encoding='utf-8'))
m=rd(H/'lower-correction-review-manifest.json');assert m['status']=='APPROVED'
assert sha(R/m['original_artifact'])==m['original_sha256']
assert sha(H/m['overlay']['path'])==m['overlay']['sha256']
assert sha(H/m['corrected_snapshot']['path'])==m['corrected_snapshot']['sha256']
o=rd(H/m['overlay']['path']);assert o['status']=='APPROVED' and o['original_sha256']==m['original_sha256']
assert o['patches']==m['only_allowed_changes'] and len(o['patches'])==2
d=rd(R/m['original_artifact'])
for p in o['patches']:
 assert p['field']=='instruction' and p['step_id'] in ['right-cover-out','pipe-filter']
 s=next(s for s in d['steps'] if s['id']==p['step_id']);assert s[p['field']]==p['before'];s[p['field']]=p['after']
assert d==rd(H/m['corrected_snapshot']['path']),'Unapproved extra snapshot change'
print('PASS exact two-field O-ring correction; original preserved')
