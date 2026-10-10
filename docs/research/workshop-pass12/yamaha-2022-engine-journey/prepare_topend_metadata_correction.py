"""One-time root-authorized metadata overlay; never changes frozen guide bytes."""
import json,hashlib
from pathlib import Path
H=Path(__file__).parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
p=H/'top-end-bike-journey-v1.procedure.json';expected='f9207a0cd26f1412979f3100584a362bcc6653119dde5bae3c43660fb7f4a6a3';assert sha(p)==expected
d=json.loads(p.read_text(encoding='utf-8'))
indices=[i for i,x in enumerate(d['prerequisites']) if x.endswith('No internals are serviced here.')];assert len(indices)==1
i=indices[0];before=d['prerequisites'][i];after=before.replace('Any separate internal bench work, if any','The completed top-end bench work').replace('Any separate internal bench work must return','The completed top-end bench work must return').replace(' No internals are serviced here.','')
note=d['source']['review_note'];assert note.endswith('Independent composition review pending.')
out=H/'top-end-metadata-correction-v1.json';assert not out.exists()
record=dict(schema_version=1,id='yamaha-2022-topend-metadata-correction-v1',status='APPROVED',reviewer='/root',original_artifact='docs/research/workshop-pass12/yamaha-2022-engine-journey/'+p.name,original_sha256=expected,source_sha256=d['source']['document_sha256'],scope='Two metadata-only corrections; every step, verification, torque, quantity, graph and saved guide identity remains unchanged.',patches=[dict(path=['prerequisites',i],before=before,after=after),dict(path=['source','review_note'],before=note,after=note.replace('Independent composition review pending.','Independent root composition review approved.'))])
out.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(sha(out))
