"""One-time approval-only freeze authorized by independent root reviewer."""
import json,hashlib,copy
from pathlib import Path
B=Path(__file__).parent
R='docs/research/workshop-pass9/yamaha-2025-engine/'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=B/'lower-engine-bench-v1.procedure.json'
assert sha(p)=='0a6ed213ebcd66a76bc0eed9317dc57ebe606ba0f2b731aaf8a49d3ed9f01e18'
d=json.loads(p.read_text(encoding='utf-8'))
d['publication_status']=d['source']['review_status']='APPROVED'
write(p,d)
review=dict(schema_version=1,reviewer='root (independent of author yamaha_workshop_evidence)',status='APPROVED',artifact=p.name,artifact_sha256=sha(p),reviewed_candidate_sha256='0a6ed213ebcd66a76bc0eed9317dc57ebe606ba0f2b731aaf8a49d3ed9f01e18',approval_scope='47-step bounded lower-engine bench repair with prepared top-end-removed entry and explicit retained-assembly exclusions.',review_method='All47 instructions independently read; exact OEM text and rendered235/237/238/239/245–255/258–269/271–278 and text270/279–282 checked. Source SHA5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac.',findings_resolved=['LS grease on drive-shaft, filter and filler O-rings','Early matched timing-chain/cam/crank disposition before crank selection','M grease on both exact crank and balancer diagram locations','Either primary-gear failure requires replacement of the pair','Solvent and debris clearance before case assembly'],open_blocking_findings=[],freeze_changes='Publication/source status only; mechanical instructions and exclusions unchanged.')
rp=B/'lower-independent-review-v1.json';write(rp,review)
mp=B/'lower-source-review-manifest.json';m=json.loads(mp.read_text(encoding='utf-8'));m['status']='APPROVED';m['artifacts'][0].update(sha256=sha(p),review_status='APPROVED');m['independent_review']=dict(path=R+rp.name,sha256=sha(rp),status='APPROVED');write(mp,m)
runtime=copy.deepcopy(m)
for s in runtime['sources']:s.update(id=s['source_id'],local_pdf_path=s['local_path'])
for a in runtime['artifacts']:a.update(path=Path(a['path']).name,kind='procedure')
runtime['author_review_manifest']=dict(path=R+mp.name,sha256=sha(mp))
write(B/'lower-runtime-source-review-manifest.json',runtime)
print('FROZEN',sha(p))
