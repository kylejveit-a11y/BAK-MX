"""One-time root-authorized approval-only freeze, not a validator."""
import hashlib,json
from pathlib import Path
OUT=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=OUT/'lower-engine-bench-v1.procedure.json'
candidate='d3f375c0539add024dbb189a3381272ac8f1eeb3a41ad5cd7e0df10a7f45598e'
assert sha(p)==candidate
before=json.loads(p.read_text(encoding='utf-8'));d=json.loads(p.read_text(encoding='utf-8'))
d['publication_status']=d['source']['review_status']='APPROVED';save(p,d)
assert before['steps']==d['steps']
r=dict(schema_version=1,status='APPROVED',reviewer='/root',artifact_sha256=sha(p),reviewed_candidate_sha256=candidate,approval_only_change='Publication and source review status only; all47 instructions unchanged.',source_sha256=d['source']['document_sha256'],reviewed_steps='All47 instructions and verification compared with approved2024 plus exact2023 source review.',text_pages=[244,260,265,266,269,270],visual_pages=[22,242,247,250,258,263,264,275,276],findings=[],review_notes=['Primary120Nm engine oil; boss105Nm LOCTITE; shiftseal0–0.1mm LS confirmed.','Case30/12Nm LOCTITE and bearing0mm/drive-seal0–0.5mm, newclips, gearbox M-oil and fork L/C/R verified.','Crank0.03mm and61.93–62mm, pump6/5Nm LOCTITE verified. Bounded exclusions remain explicit.'])
save(OUT/'lower-independent-review-v1.json',r)
m=json.loads((OUT/'lower-source-review-manifest.json').read_text(encoding='utf-8'));m['status']='APPROVED';m['artifacts'][0]['review_status']='APPROVED';m['artifacts'][0]['sha256']=sha(p)
m['independent_review']=dict(path='lower-independent-review-v1.json',sha256=sha(OUT/'lower-independent-review-v1.json'),status='APPROVED');save(OUT/'lower-source-review-manifest.json',m)
runtime=dict(m);runtime['author_review_manifest']=dict(path='docs/research/workshop-pass11/yamaha-2023-engine/lower-source-review-manifest.json',sha256=sha(OUT/'lower-source-review-manifest.json'));save(OUT/'lower-runtime-source-review-manifest.json',runtime)
print(sha(p))
