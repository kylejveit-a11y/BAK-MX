"""One-time narrow root-authorized correction; frozen original remains unchanged."""
import copy,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
original='docs/research/workshop-pass12/yamaha-2022-engine/lower-engine-bench-v1.procedure.json'
expected='7f00ea163b0867b3e60b19246aba36af5bfb75b63e12266829ca0cac2da8fba4'
assert sha(ROOT/original)==expected
d=json.loads((ROOT/original).read_text(encoding='utf-8'));patches=[]
for step_id,old,new in [('right-cover-out','Remove the oil-filter cover, filter and O-rings.','Remove the oil-filter cover, filter and O-ring.'),('pipe-filter','new LS-greased cover O-rings','a new LS-greased cover O-ring')]:
 s=next(s for s in d['steps'] if s['id']==step_id);assert s['instruction'].count(old)==1
 patches.append(dict(step_id=step_id,field='instruction',before=s['instruction'],after=s['instruction'].replace(old,new)))
overlay=dict(schema_version=1,id='yamaha-2022-lower-filter-oring-singular-v1',status='APPROVED',reviewer='/root',original_artifact=original,original_sha256=expected,source_sha256=d['source']['document_sha256'],source_pdf_pages=[89,90,234],scope='Exactly two filter-cover O-ring singular-wording corrections. No torque, grease, component, order or other mechanical instruction changes.',patches=patches)
op=HERE/'lower-filter-oring-correction-v1.json';assert not op.exists();wr(op,overlay)
for patch in patches:next(s for s in d['steps'] if s['id']==patch['step_id'])[patch['field']]=patch['after']
snapshot=HERE/'lower-engine-bench-v1-corrected.procedure.json';assert not snapshot.exists();wr(snapshot,d)
wr(HERE/'lower-correction-review-manifest.json',dict(schema_version=1,status='APPROVED',reviewer='/root',original_artifact=original,original_sha256=expected,overlay=dict(path=op.name,sha256=sha(op)),corrected_snapshot=dict(path=snapshot.name,sha256=sha(snapshot)),source_sha256=d['source']['document_sha256'],only_allowed_changes=patches))
print(sha(snapshot),sha(op))
