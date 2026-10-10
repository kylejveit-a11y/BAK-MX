"""One-time root review freeze; mechanics already independently accepted."""
import hashlib,json
from pathlib import Path
H=Path(__file__).parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rd=lambda p:json.loads(p.read_text(encoding='utf-8'))
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=H/'major-engine-bike-journey-v1.procedure.json';candidate='85aedbc6431c6a7815feae4147571200541460495d342e29c2f614b56f87942a';assert sha(p)==candidate
d=rd(p);d['publication_status']=d['source']['review_status']='APPROVED';d['integration_status']='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED';d['status']='SOURCE_REVIEWED_BOUNDED_PROCEDURE';d['source']['review_note']=d['source']['review_note'].replace('New composition review pending.','Independent root composition review approved.');wr(p,d)
r=dict(schema_version=1,status='APPROVED',reviewer='/root',artifact_sha256=sha(p),reviewed_candidate_sha256=candidate,target=d['target'],review='Root independently reviewed all six composition adaptations and approved the explicit lower-entry continuation correction. Unadapted instructions/verifications remain identical to approved origins under the read-only validator.',reviewed_previous_candidate_sha256='a0f4880eca056cd4ab4ce7626dcfdd5dae627afedfc1d56989a43624675c9698',resolved_findings=['Lower entry now points to the top-end/refit/commissioning steps in this journey rather than separate work.'],preserved=['Piston cloth removed before case opening','Matched crank/chain/cam replacement disposition','Initial0.90L versus later filter-service0.65L','All four external oil-check/tank records','Original lower bytes and two-field correction bound'],approval_only_changes=['publication_status','source.review_status','source.review_note','integration_status','status'])
wr(H/'major-independent-review-v1.json',r)
m=rd(H/'major-source-review-manifest.json');m['status']='APPROVED';m['artifacts'][0]['sha256']=sha(p);m['artifacts'][0]['review_status']='APPROVED';m['independent_review']=dict(path='major-independent-review-v1.json',sha256=sha(H/'major-independent-review-v1.json'));wr(H/'major-source-review-manifest.json',m)
wr(H/'MAJOR_RECOVERY.json',dict(status='APPROVED',artifact=p.name,sha256=sha(p),steps=len(d['steps']),dependencies=d['operation_dependencies'],correction_dependencies=d['correction_dependencies'],next='Root runtime integration and product checks; external/physical validation gaps remain visible.',database_writes=False))
print(sha(p))
