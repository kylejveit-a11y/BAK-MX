"""Freeze a candidate only after an independent approval bound to its current bytes."""
import hashlib,json
from pathlib import Path
B=Path(__file__).parent;R=B.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
p=B/'post-rebuild-commissioning-v1.procedure.json';q=B/'independent-review-v1.json'
d=json.loads(p.read_text(encoding='utf8'));review=json.loads(q.read_text(encoding='utf8'))
assert d['publication_status']!='APPROVED','Already frozen'
assert review['status']=='APPROVED' and review['artifact_sha256']==sha(p),'Independent approval must match candidate bytes'
review['approved_candidate_sha256']=sha(p)
d['publication_status']=d['source']['review_status']='APPROVED'
d['status']='SOURCE_REVIEWED_BOUNDED_PROCEDURE'
d['source']['review_note']='Independently reviewed against exact BHR and Mityvac tool-method pages; approved as the stated illustrated companion with actual external-work obligations.'
save(p,d);review['artifact_sha256']=sha(p);review['freeze_changes']='Publication/source status and review note only; mechanical text unchanged after approval.';save(q,review)
mp=B/'source-review-manifest.json';m=json.loads(mp.read_text(encoding='utf8'));m['status']='APPROVED'
for a in m['artifacts']:a['sha256']=sha(p);a['review_status']='APPROVED';a['source_id']='yamaha-us-2023-yz450f-oem'
m['independent_review']={'path':str(q.relative_to(R)).replace('\\','/'),'sha256':sha(q),'status':'APPROVED'};save(mp,m)
print('APPROVED '+sha(p))
