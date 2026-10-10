"""One-time exact candidate freeze authorized by independent root review."""
import hashlib,json
from pathlib import Path
OUT=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=OUT/'top-end-bench-v1.procedure.json';candidate='27d8da9660452ec0b0494164ce91f2b5bb86cf52e0eba6cc157491daa82e1acb';assert sha(p)==candidate
d=json.loads(p.read_text(encoding='utf-8'));d['publication_status']=d['source']['review_status']='APPROVED';save(p,d)
r=dict(schema_version=1,status='APPROVED',reviewer='/root',artifact_sha256=sha(p),reviewed_candidate_sha256=candidate,source_sha256=d['source']['document_sha256'],reviewed_steps='All67 instructions and verification compared with approved structural template; exact2023 source reviewed independently.',text_pages=[48,209,210,211,212,215,217,222,223,228,229,230],visual_pages=[85,88,89,216,217,221,224,230],findings=[],approval_only_change='Publication/source review status only; no mechanical instructions changed.',review_notes=['Head36 then individual18+90 then all60 with M preparation; small bolts12LT.','Guide heights/ID/limits, distinct lapping/running titanium valves, piston/ring/cam values, actual shim charts and04015 tool confirmed.'])
save(OUT/'top-end-independent-review-v1.json',r)
m=json.loads((OUT/'source-review-manifest.json').read_text());m['status']='APPROVED';m['artifacts'][0]['review_status']='APPROVED';m['artifacts'][0]['sha256']=sha(p);m['independent_review']=dict(path='top-end-independent-review-v1.json',sha256=sha(OUT/'top-end-independent-review-v1.json'),status='APPROVED');save(OUT/'source-review-manifest.json',m)
runtime=dict(m);runtime['author_review_manifest']=dict(path='docs/research/workshop-pass11/yamaha-2023-engine/source-review-manifest.json',sha256=sha(OUT/'source-review-manifest.json'));save(OUT/'runtime-source-review-manifest.json',runtime)
print(sha(p))
