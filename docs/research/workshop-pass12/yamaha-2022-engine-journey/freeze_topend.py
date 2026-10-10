"""One-time independent root approval freeze, not a validator."""
import json,hashlib
from pathlib import Path
H=Path(__file__).parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rd=lambda p:json.loads(p.read_text(encoding='utf-8'))
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=H/'top-end-bike-journey-v1.procedure.json';candidate='0b05f904f1912756424910baf316321bfc631a6c7107cf18fbd06aa76b458d32';assert sha(p)==candidate
d=rd(p);d['publication_status']=d['source']['review_status']='APPROVED';d['integration_status']='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED';d['status']='SOURCE_REVIEWED_BOUNDED_PROCEDURE';wr(p,d)
r=dict(schema_version=1,status='APPROVED',reviewer='/root',artifact_sha256=sha(p),reviewed_candidate_sha256=candidate,target=d['target'],review='All five composition adaptations and actual handoff/cold entry/first idle/final oil-check wording independently reviewed. Read-only validator confirms all other instructions/verifications unchanged against approved exact-year origins.',findings=[],preserved_external_records=4,approval_only_changes=['publication_status','source.review_status','integration_status','status'])
wr(H/'independent-review-v1.json',r)
m=rd(H/'source-review-manifest.json');m['status']='APPROVED';m['artifacts'][0]['sha256']=sha(p);m['artifacts'][0]['review_status']='APPROVED';m['independent_review']=dict(path='independent-review-v1.json',sha256=sha(H/'independent-review-v1.json'));wr(H/'source-review-manifest.json',m)
locks=rd(H/'approved-dependencies.json');locks['journey']=dict(artifact='docs/research/workshop-pass12/yamaha-2022-engine-journey/'+p.name,sha256=sha(p));wr(H/'approved-dependencies.json',locks)
wr(H/'RECOVERY.json',dict(status='APPROVED',artifact=p.name,sha256=sha(p),steps=len(d['steps']),dependencies=d['operation_dependencies'],next='Compose approved corrected lower engine, then independent major-route review.',database_writes=False))
print(sha(p))
