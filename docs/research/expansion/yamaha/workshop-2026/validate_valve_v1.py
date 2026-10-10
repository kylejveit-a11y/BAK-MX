import hashlib
import json
from pathlib import Path

root = Path(__file__).parent
manifest = json.loads((root / 'valve-inspection-v1.manifest.json').read_text())
for item in manifest['files']:
    assert hashlib.sha256((root / item['file']).read_bytes()).hexdigest() == item['sha256']
assert hashlib.sha256((root / 'approved-bundle.json').read_bytes()).hexdigest() == '761d6bf6b82127138da2b5345ee19d5d3bdbe5157f89bc1fd84749f3533c12d1'
p = json.loads((root / 'valve-inspection-v1.procedure.json').read_text())
assert p['target']['model_year'] == 2026 and p['target']['region'] == 'US'
assert p['source']['document_sha256'] == 'b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd'
assert p['measurement_spec']['intake'] == [0.10, 0.17]
assert p['measurement_spec']['exhaust'] == [0.15, 0.22]
seen = set()
for s in p['steps']:
    assert set(s['depends_on']) <= seen
    assert s['verification'] and s['instruction']
    if s['diagram_reference_required']:
        assert s['source_links']
    seen.add(s['id'])
assert len(seen) == 16
closure = next(s for s in p['steps'] if s['id'] == 'plug-access-close')
assert 'two new access-screw O-rings' in closure['instruction']
assert 'lithium-soap-based grease' in closure['instruction']
assert 'engine oil to the access-screw threads' in closure['instruction']
exceptions = json.loads((root / 'generation-exceptions-v1.json').read_text())
assert len(exceptions['exceptions']) == 4
assert exceptions['cross_year_equivalence_approved'] is False
for e in exceptions['exceptions']:
    assert e['decision'] == 'DO_NOT_INHERIT'
    assert e['2025']['document_sha256'] != e['2026']['document_sha256']
    assert e['2025']['value'] != e['2026']['value']
print('PASS: 16-step inspection graph; source binding; measurement and seal closure; four year exceptions; frozen bundle unchanged.')
