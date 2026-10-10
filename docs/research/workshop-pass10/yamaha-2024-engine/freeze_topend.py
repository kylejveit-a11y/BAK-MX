"""One-time approval-only freeze on explicit independent root approval."""
import hashlib,json
from pathlib import Path
OUT=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=OUT/'top-end-bench-v1.procedure.json'
assert sha(p)=='22ce257bd2c897652cc08789c6a989759b77f6fd065d3e7890f66ff612ffd1b9'
d=json.loads(p.read_text(encoding='utf-8'));d['publication_status']=d['source']['review_status']='APPROVED';save(p,d)
r=dict(schema_version=1,status='APPROVED',reviewer='/root',artifact_sha256=sha(p),reviewed_candidate_sha256='22ce257bd2c897652cc08789c6a989759b77f6fd065d3e7890f66ff612ffd1b9',approval_only_change='Publication and source status only; all 67 mechanical instructions unchanged.',source_sha256=d['source']['document_sha256'],reviewed_steps='All 67 mechanical instructions compared with independently reviewed source and exact installer change.',text_pages=[48,209,210,215,216,217,221,222,223,228,229],visual_pages=[85,88,89,207,208,211,212,215,216,217,221,224,230],findings=[],review_notes=['Head 36 then individually 18+90 then all60; new gasket and preparation verified.','100 C head heating, guide heights, sacrificial lapping and distinct running valves verified.','Ring/pin/clearance dimensions, actual charts, cloth and solvent closure verified.'])
save(OUT/'top-end-independent-review-v1.json',r)
m=json.loads((OUT/'source-review-manifest.json').read_text(encoding='utf-8'));m['status']='APPROVED';m['artifacts'][0]['review_status']='APPROVED';m['artifacts'][0]['sha256']=sha(p)
m['independent_review']=dict(path='top-end-independent-review-v1.json',sha256=sha(OUT/'top-end-independent-review-v1.json'),status='APPROVED');save(OUT/'source-review-manifest.json',m)
runtime=dict(m);runtime['author_review_manifest']=dict(path='docs/research/workshop-pass10/yamaha-2024-engine/source-review-manifest.json',sha256=sha(OUT/'source-review-manifest.json'));save(OUT/'runtime-source-review-manifest.json',runtime)
print(sha(p))
