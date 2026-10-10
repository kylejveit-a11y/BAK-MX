"""Freeze only a current hash explicitly approved in an independent review record."""
import hashlib,json,sys
from pathlib import Path
B=Path(__file__).resolve().parent
major='--major' in sys.argv
p=B/('major-engine-bike-journey-v1.procedure.json' if major else 'top-end-bike-journey-v1.procedure.json')
q=B/('major-independent-review-v1.json' if major else 'independent-review-v1.json')
mp=B/('major-source-review-manifest.json' if major else 'source-review-manifest.json')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def rd(p):return json.loads(p.read_text(encoding='utf8'))
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
d=rd(p);r=rd(q);m=rd(mp)
assert d['source']['review_status']!='APPROVED','Frozen; refusing rewrite'
assert r['status']=='APPROVED' and r['approved_candidate_sha256']==sha(p) and r['target']==d['target']
assert r.get('metadata_only_freeze_authorized') is True
r['source_reviewed_candidate_sha256']=sha(p)
d['publication_status']=d['source']['review_status']='APPROVED';d['status']='SOURCE_REVIEWED_BOUNDED_PROCEDURE';d['integration_status']='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED';d['source']['review_note']='Independent root review accepted exact2023 approved dependencies, adapted bench/refit and commissioning handoffs. Required actual external work and excluded-system scope remain explicit.'
wr(p,d);r['artifacts']=[{'path':p.name,'sha256':sha(p)}];r['freeze_changes']='Approval and review metadata only; instructions unchanged.';wr(q,r)
m['status']='APPROVED';m['artifacts'][0]['sha256']=sha(p);m['independent_review']={'path':q.name,'sha256':sha(q),'status':'APPROVED'};wr(mp,m)
if not major:
 bindings=rd(B/'approved-dependencies.json');bindings['major']['journey']=sha(p);wr(B/'approved-dependencies.json',bindings)
wr(B/('MAJOR_RECOVERY.json' if major else 'RECOVERY.json'),{'status':'APPROVED','artifacts':m['artifacts'],'dependencies':d['operation_dependencies'],'next':'Root integration or remaining exact-bike composition; no physical repair qualification.'})
print(p.name,sha(p))
