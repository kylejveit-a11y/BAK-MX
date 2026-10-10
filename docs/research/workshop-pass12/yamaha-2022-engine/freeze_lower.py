"""One-time root-authorized approval-only freeze; not a validator."""
import hashlib,json
from pathlib import Path
OUT=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=OUT/'lower-engine-bench-v1.procedure.json'
candidate='471a5fa1f3306636316126f068e6e4339b1de5267da43d97c8e6c17b6a733d35'
assert sha(p)==candidate
before=json.loads(p.read_text(encoding='utf-8'));d=json.loads(p.read_text(encoding='utf-8'))
d['publication_status']=d['source']['review_status']='APPROVED';save(p,d)
assert before['steps']==d['steps']
r=dict(schema_version=1,status='APPROVED',reviewer='/root',artifact_sha256=sha(p),reviewed_candidate_sha256=candidate,approval_only_change='Publication and source review status only; all 45 instructions unchanged.',source_sha256=d['source']['document_sha256'],reviewed_steps='All 45 instructions read against exact 2022 source; critical diagrams independently inspected.',text_pages=[224,225,227,235,236,237,238,239,242,247,248,252,254,255],visual_pages=[226,232,234,236,240,244,248,249,250,252,257,258,259,260],findings=[],review_notes=['Clutch 75 Nm engine oil/new lockwasher; primary 80 Nm engine oil/new conical washer facing outward; balance nuts50/45 confirmed.','Starter holder12 Nm LT and right-cover seal inward confirmed.','Case12 Nm, drive seal0–0.5 mm, crank bearing retainers22 Nm LT, exact gear stacks/forks and spring guides verified.','Prepared bench scope and peripheral exclusions retained; no oil-check-bolt torque invented.'])
save(OUT/'lower-independent-review-v1.json',r)
m=json.loads((OUT/'lower-source-review-manifest.json').read_text(encoding='utf-8'));m['status']='APPROVED';m['artifacts'][0]['review_status']='APPROVED';m['artifacts'][0]['sha256']=sha(p)
m['independent_review']=dict(path='lower-independent-review-v1.json',sha256=sha(OUT/'lower-independent-review-v1.json'),status='APPROVED');save(OUT/'lower-source-review-manifest.json',m)
runtime=dict(m);runtime['author_review_manifest']=dict(path='docs/research/workshop-pass12/yamaha-2022-engine/lower-source-review-manifest.json',sha256=sha(OUT/'lower-source-review-manifest.json'));save(OUT/'lower-runtime-source-review-manifest.json',runtime)
print(sha(p))
