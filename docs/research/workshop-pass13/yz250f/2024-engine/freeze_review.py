"""One-time exact-byte independent approval finalization."""
import json,hashlib
from pathlib import Path
B=Path(__file__).resolve().parent;rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
m=rd(B/'source-review-manifest.json');r=rd(B/'independent-review.json');assert r['status']=='APPROVED_FOR_BOUNDED_RUNTIME' and m['status']=='PENDING_INDEPENDENT_REVIEW'
for a in m['artifacts']:
 p=B/a['path'];old=sha(p);assert old==a['sha256']==next(x['candidate_sha256'] for x in r['artifacts'] if Path(x['path']).name==p.name)
 d=rd(p);d['publication_status']='APPROVED';d['status']='SOURCE_REVIEWED_BOUNDED_PROCEDURE';d['source']['review_status']='APPROVED';d['source']['review_note']='Independently source-reviewed bounded engine operation; physical validation remains outstanding.'
 wr(p,d);a['candidate_sha256']=old;a['sha256']=sha(p)
m['status']='APPROVED';m['independent_review']={'path':'independent-review.json','sha256':sha(B/'independent-review.json')};wr(B/'source-review-manifest.json',m)
rt=dict(m);rt['parent_manifest']={'path':'source-review-manifest.json','sha256':sha(B/'source-review-manifest.json')};wr(B/'runtime-source-review-manifest.json',rt)
print([(a['path'],a['sha256']) for a in m['artifacts']])
