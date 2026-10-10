"""One-time exact candidate freeze authorized by independent root review."""
import hashlib,json
from pathlib import Path
OUT=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=OUT/'top-end-bench-v1.procedure.json';candidate='e76e18a4a15852c1de8d114988283fb82930c8335d401dd3b55bfc0be0504626';assert sha(p)==candidate
d=json.loads(p.read_text(encoding='utf-8'));d['publication_status']=d['source']['review_status']='APPROVED';save(p,d)
r=dict(schema_version=1,status='APPROVED',reviewer='/root',artifact_sha256=sha(p),reviewed_candidate_sha256=candidate,source_sha256=d['source']['document_sha256'],reviewed_steps='All changed 2022 top-end instruction fields compared with approved 2023 structural template; exact 2022 source independently reviewed.',text_pages=[48,202,203,204,205,210,211,212,213,215,218,219,220,221],visual_pages=[85,86,200,204,206,209,216,222],findings=[],approval_only_change='Publication/source review status only; no mechanical instructions changed.',review_notes=['Small head bolts 10 Nm clean/dry, distinct oil-plug LT; seven cam-cap bolts and clips.','Head 40 Nm then individual 23 Nm plus 90 degrees then all 60 degrees; 1215 sealant and LS access O-rings confirmed.'])
save(OUT/'top-end-independent-review-v1.json',r)
m=json.loads((OUT/'source-review-manifest.json').read_text());m['status']='APPROVED';m['artifacts'][0]['review_status']='APPROVED';m['artifacts'][0]['sha256']=sha(p);m['independent_review']=dict(path='top-end-independent-review-v1.json',sha256=sha(OUT/'top-end-independent-review-v1.json'),status='APPROVED');save(OUT/'source-review-manifest.json',m)
runtime=dict(m);runtime['author_review_manifest']=dict(path='docs/research/workshop-pass12/yamaha-2022-engine/source-review-manifest.json',sha256=sha(OUT/'source-review-manifest.json'));save(OUT/'runtime-source-review-manifest.json',runtime)
print(sha(p))
