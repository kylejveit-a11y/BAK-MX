import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PREV = HERE.parent / 'workshop-2026'
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
assert digest(Path('C:/Users/kylej/AppData/Local/Temp/D03-2819U-10_02.pdf')) == 'b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd'
assert digest(PREV / 'approved-bundle.json') == '761d6bf6b82127138da2b5345ee19d5d3bdbe5157f89bc1fd84749f3533c12d1'
for file in ['valve-adjustment-v2.procedure.json','stock-tensioner-service-v1.procedure.json']:
    p=json.loads((HERE/file).read_text(encoding='utf-8'))
    assert p['derivation']['sha256'] == digest(PREV/'valve-inspection-v1.procedure.json')
    assert p['source']['review_status']=='APPROVED'
    seen=set()
    for s in p['steps']:
        assert s['id'] not in seen and set(s['depends_on']) <= seen
        assert s['verification'] and set(s['source_pdf_pages'])<=set(p['source']['pdf_pages'])
        assert not s['diagram_reference_required'] or s['source_links']
        seen.add(s['id'])
    steps={s['id']:s for s in p['steps']}
    assert '10 N' in steps['tensioner-install']['instruction'] and 'UP' in steps['tensioner-install']['instruction']
    assert '6 N' in steps['tensioner-release']['instruction']
    assert 'counterclockwise' in steps['timing-verify']['instruction']
    assert '0.10' in steps['remeasure']['instruction'] and '0.22' in steps['remeasure']['instruction']
    assert all(steps[k]['record_required'] for k in ['measure','timing-verify','remeasure','tensioner-check'])
    if 'valve-adjustment' in file:
        assert p['chart_policy']['unsupported_original_pad_last_digits']==[3,7]
        assert p['chart_policy']['automatic_formula'] is None
        assert steps['pads-select']['record_required']
        assert 'engine oil' in steps['caps-install']['instruction']
        assert '1 through 8' in steps['caps-install']['instruction']
        assert '10 N' in steps['caps-install']['instruction']
    else: assert 'cams-remove' not in steps and 'pads-install' not in steps
    print('PASS',file,len(p['steps']),'steps, dependencies, source binding and critical conditions')
print('PASS frozen approved bundle unchanged')
e=json.loads((HERE/'exhaust-remove-refit-v1.procedure.json').read_text(encoding='utf-8'))
assert len(e['steps'])==9
seen=set()
for s in e['steps']:
    assert s['id'] not in seen and set(s['depends_on'])<=seen
    assert set(s['source_pdf_pages'])<=set(e['source']['pdf_pages'])
    seen.add(s['id'])
assert all(str(n) in e['steps'][7]['instruction'] for n in [20,16])
assert '7 N' in e['steps'][4]['instruction'] and '10 N' in e['steps'][4]['instruction']
assert e['steps'][4]['record_required']
c=json.loads((HERE/'topend-chain-coverage-v1.json').read_text(encoding='utf-8'))
assert c['status']=='PARTIAL_REVIEW_NOT_RUNTIME_COMPLETE'
assert len(c['remaining_dependency_graph'])==6
print('PASS exhaust9 steps, staged torques and explicit top-end incomplete state')
