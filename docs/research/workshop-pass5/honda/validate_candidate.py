import json,hashlib
from pathlib import Path
p=Path(__file__).parent
m=json.loads((p/'candidate-review-manifest-v1.json').read_text())
assert m['status']=='CANDIDATE_NOT_RUNTIME_APPROVED'
for a in m['artifacts']:
    raw=(p/a['path']).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==a['sha256']
    d=json.loads(raw); assert d['target']==a['target']
    assert d['source']['review_status']=='PENDING_BYTE_CONFIRMATION_AND_INDEPENDENT_REVIEW'
    seen=set()
    for s in d['steps']:
        assert s['id'] not in seen
        assert set(s['depends_on'])<=seen
        assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
        assert isinstance(s['verification'],list) and s['verification']
        seen.add(s['id'])
    for i in ['tdc','intake','exhaust','assess']:
        assert next(s for s in d['steps'] if s['id']==i)['record_required']
print('PASS: candidate hashes, target, step dependency order, page containment, observation records and explicit release hold. No runtime approval asserted.')
