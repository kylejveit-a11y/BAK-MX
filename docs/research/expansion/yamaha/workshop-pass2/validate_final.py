import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
pdf=Path('C:/Users/kylej/AppData/Local/Temp/D03-2819U-10_02.pdf')
assert sha(pdf)=='b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd'
assert sha(HERE.parent/'workshop-2026'/'approved-bundle.json')=='761d6bf6b82127138da2b5345ee19d5d3bdbe5157f89bc1fd84749f3533c12d1'
counts={'valve-adjustment-v2.procedure.json':29,'stock-tensioner-service-v1.procedure.json':22,'exhaust-remove-refit-v1.procedure.json':9,'coolant-change-v1.procedure.json':9,'airbox-remove-refit-v1.procedure.json':13}
for n,count in counts.items():
    p=read(HERE/n)
    assert p['source']['review_status']=='APPROVED' and p['target']['model_year']==2026 and p['target']['region']=='US'
    assert p['source']['document_sha256']==sha(pdf)
    assert len(p['steps'])==count
    seen=set()
    for s in p['steps']:
        assert s['id'] not in seen and set(s['depends_on'])<=seen,(n,s['id'])
        assert set(s['source_pdf_pages'])<=set(p['source']['pdf_pages']),(n,s['id'],'source index')
        assert s['verification']
        assert not s['diagram_reference_required'] or s['source_links']
        seen.add(s['id'])
    assert any(s.get('record_required') for s in p['steps'])
    print('PASS',n,count,'steps')
v=read(HERE/'valve-adjustment-v2.procedure.json')
assert v['chart_policy']['unsupported_original_pad_last_digits']==[3,7]
assert all(next(s for s in v['steps'] if s['id']==i)['record_required'] for i in ['measure','pads-select','remeasure','timing-verify'])
c=read(HERE/'page-index-correction.json')
assert c['original_artifact_sha256']==sha(HERE.parent/'workshop-2026'/'valve-inspection-v1.procedure.json')
assert c['add_source_pdf_pages']==[58] and c['mechanical_step_changes']==[]
assert read(HERE/'topend-chain-coverage-v1.json')['status']=='PARTIAL_REVIEW_NOT_RUNTIME_COMPLETE'
manifest=read(HERE/'checkpoint-manifest-final.json')
for a in manifest['artifacts']:
    assert sha(HERE/a['path'])==a['sha256'],a['path']
print('PASS exact source/frozen hash, explicit shim exceptions, required observations, separate metadata correction and final manifest')
