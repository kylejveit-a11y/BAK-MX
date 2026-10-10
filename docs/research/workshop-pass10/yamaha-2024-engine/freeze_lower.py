"""One-time status-only freeze authorized by independent root review."""
import hashlib,json
from pathlib import Path
OUT=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=OUT/'lower-engine-bench-v1.procedure.json'
candidate='fcbc7ca657a4e55609442404e2c5bfa99fcfc63dc1e573adffdc7c9b34fef1b7'
assert sha(p)==candidate
before=json.loads(p.read_text(encoding='utf-8'));d=json.loads(p.read_text(encoding='utf-8'))
d['publication_status']=d['source']['review_status']='APPROVED';save(p,d)
assert before['steps']==d['steps']
r=dict(schema_version=1,status='APPROVED',reviewer='/root',artifact_sha256=sha(p),reviewed_candidate_sha256=candidate,approval_only_change='Publication and source status only; all47 mechanical instructions unchanged.',source_sha256=d['source']['document_sha256'],reviewed_steps='All47 instructions and verification reviewed, including complete middle and changed exact2024 mechanics.',text_pages=[244,245,246,250,253,257,260,264,265,266,267,268,269,270,274,275,276,277],visual_pages=[247,248,250,258,261,262,266,267,268],findings=[],review_notes=['Primary120Nm engine oil, clutch105Nm LOCTITE without extra spacer verified.','Shift seal0–0.1mm LS; crank-only M; circlips and blue-mark clutch plate order verified.','Gear stacks, forks, shaft0.08mm/crank0.03mm limits, crank width61.93–62mm, case30/12LT and drive seal0.5mm verified.','Existing bounded scope exclusions preserved. No2025 shift-seal grease erratum: withdrawn tiny-icon misreading;2025 LS confirmed.'])
save(OUT/'lower-independent-review-v1.json',r)
m=json.loads((OUT/'lower-source-review-manifest.json').read_text(encoding='utf-8'));m['status']='APPROVED';m['artifacts'][0]['review_status']='APPROVED';m['artifacts'][0]['sha256']=sha(p)
m['independent_review']=dict(path='lower-independent-review-v1.json',sha256=sha(OUT/'lower-independent-review-v1.json'),status='APPROVED');save(OUT/'lower-source-review-manifest.json',m)
runtime=dict(m);runtime['author_review_manifest']=dict(path='docs/research/workshop-pass10/yamaha-2024-engine/lower-source-review-manifest.json',sha256=sha(OUT/'lower-source-review-manifest.json'));save(OUT/'lower-runtime-source-review-manifest.json',runtime)
print(sha(p))
