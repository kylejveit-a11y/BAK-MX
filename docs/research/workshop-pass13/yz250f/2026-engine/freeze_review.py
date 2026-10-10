"""One-time approval-only freeze against the independent reviewer's exact bytes."""
import json,hashlib
from pathlib import Path
B=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for prefix,review in [('', 'engine-independent-review.json'),('head-', 'head-independent-review.json')]:
 mp=B/(prefix+'source-review-manifest.json');m=read(mp);r=read(B/review)
 assert m['status']=='PENDING_INDEPENDENT_REVIEW'
 assert r['status']=='APPROVED_FOR_BOUNDED_RUNTIME'
 a=m['artifacts'][0];p=B/a['path'];d=read(p);old=sha(p)
 assert old==a['sha256']==r['candidate_sha256']
 assert d['publication_status']=='PENDING_INDEPENDENT_REVIEW'
 d['publication_status']='APPROVED';d['status']='SOURCE_REVIEWED';d['source']['review_status']='APPROVED'
 d['source']['review_note']='Independent source review approved the stated bounded operation; physical workshop validation remains outstanding.'
 if not d.get('completeness'):d['completeness']='Continuous assembly of accepted original valve-train parts in the detached head; excludes head installation, timing and commissioning.'
 write(p,d);a['sha256']=sha(p);m['status']='APPROVED'
 m['independent_review']={'path':review,'sha256':sha(B/review),'candidate_sha256':old,'approved_artifact_sha256':a['sha256'],'freeze_changes':'Approval metadata only; head completeness describes its existing detached-head scope.'}
 write(mp,m)
 runtime=dict(m);runtime['parent_manifest']={'path':mp.name,'sha256':sha(mp)}
 write(B/(prefix+'runtime-source-review-manifest.json'),runtime)
 print(p.name,a['sha256'])
