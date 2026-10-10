"""Validate bounded fork review and preserve the previously frozen fact bundle."""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
PDF = Path('C:/Users/kylej/AppData/Local/Temp/D03-2819U-10_02.pdf')
PDF_HASH = 'b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd'
FROZEN_HASH = '761d6bf6b82127138da2b5345ee19d5d3bdbe5157f89bc1fd84749f3533c12d1'
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def read(name):
    return json.loads((HERE / name).read_text(encoding='utf-8-sig'))

p = read('fork-remove-refit-v1.procedure.json')
c = read('fork-internal-coverage-v1.json')
assert digest(PDF) == PDF_HASH
assert digest(HERE / 'approved-bundle.json') == FROZEN_HASH
assert p['source']['document_sha256'] == c['source']['document_sha256'] == PDF_HASH
assert p['target']['model_year'] == 2026 and p['target']['region'] == 'US'
assert p['applicability']['year_inheritance'] == 'NONE'
assert len(p['steps']) == 14
seen = set()
for step in p['steps']:
    assert step['id'] not in seen
    assert set(step['depends_on']) <= seen
    assert step['verification'] and step['source_pdf_pages']
    assert set(step['source_pdf_pages']) <= set(p['source']['pdf_pages'])
    if step['diagram_reference_required']:
        assert step['source_links']
    seen.add(step['id'])
steps = {step['id']: step for step in p['steps']}
assert '115' in steps['seat-torque']['instruction'] and '21' in steps['seat-torque']['instruction']
assert 'before final axle-nut tightening' in steps['seat-torque']['instruction']
assert '30' in steps['legs-refit']['instruction']
assert '21' in steps['height-clamps']['instruction']
assert all(str(value) in steps['guards-brake']['instruction'] for value in [7, 28, 9])
assert 'Keep the hose union, bleed screw, pad pin and pads undisturbed' in steps['caliper']['instruction']
assert p['settings']['fork_projection_mm'] == 2
assert c['decision'] == 'NOT_RELEASED_AS_COMPLETE_INTERNAL_SERVICE'
assert len(c['unresolved_before_internal_runtime_release']) == 4
assert c['visually_reviewed_pdf_pages'] == list(range(167, 179))
manifest = read('fork-service-v1.manifest.json')
for artifact in manifest['artifacts']:
    assert digest(HERE / artifact['path']) == artifact['sha256']
print('PASS: 14-step dependency graph, exact source binding, torque/seating/closed-brake conditions, 4 internal-service gaps, artifact hashes, frozen bundle unchanged.')
