"""Validate this bounded reviewed dataset without accessing or writing a database."""
import collections
import hashlib
import json
from pathlib import Path

root = Path(__file__).parent
manifest = json.loads((root / 'review-manifest.json').read_text())
for entry in manifest['files']:
    assert hashlib.sha256((root / entry['file']).read_bytes()).hexdigest() == entry['sha256'], entry['file']

specs = json.loads((root / '2026-yz450f-specs.json').read_text())
torques = json.loads((root / '2026-yz450f-torques.json').read_text())
assert len(specs['facts']) == 180
assert len(torques['facts']) == 163
facts = specs['facts'] + torques['facts']
assert len({f['id'] for f in facts}) == 343
for data in [specs, torques]:
    assert data['scope_confirmed']
    assert data['target'] == {'manufacturer': 'Yamaha', 'model': 'YZ450F', 'model_year': 2026, 'region': 'US', 'variant': 'standard'}
    for f in data['facts']:
        assert f['review_status'] == 'APPROVED'
        assert f['document_sha256'] == manifest['source_sha256']
        assert f['conditions'] and f['locator']
        assert '\ufffd' not in json.dumps(f, ensure_ascii=False)

counts = collections.Counter(f['locator'].split(';')[0] for f in torques['facts'])
assert [counts[f'PDF page {n}'] for n in range(57, 64)] == [29, 32, 17, 11, 34, 34, 6]
assert collections.Counter(f['property'] for f in torques['facts']) == {'torque': 161, 'installation': 2}
primary = next(f for f in torques['facts'] if f['joint'] == 'Primary drive gear nut')
assert primary['value'] == 170 and any('remove oil' in c for c in primary['conditions'])
resistance = next(f for f in specs['facts'] if f['joint'] == 'Fuel injector / Resistance')
assert resistance['value'] == 12 and resistance['unit'] == '\u03a9'
proc = json.loads((root / 'fork-clicker-baseline.procedure.json').read_text())
assert proc['source']['document_sha256'] == manifest['source_sha256']
assert set(proc['fact_ids']) <= {f['id'] for f in facts}
visited = set()
for step in proc['steps']:
    assert set(step['depends_on']) <= visited
    assert step['verification'] and step['instruction']
    visited.add(step['id'])
assert len(visited) == 8
assert proc['baseline']['rebound_clicks_out'] == 9
assert proc['baseline']['compression_clicks_out'] == 12
shock = json.loads((root / 'shock-damping-baseline.procedure.json').read_text())
assert shock['source']['document_sha256'] == manifest['source_sha256']
assert set(shock['fact_ids']) <= {f['id'] for f in facts}
visited = set()
for step in shock['steps']:
    assert set(step['depends_on']) <= visited
    assert step['verification'] and step['instruction']
    visited.add(step['id'])
assert len(visited) == 7
assert shock['baseline']['rebound_clicks_out'] == 10
assert shock['baseline']['high_speed_compression_turns_out'] == 1.25
assert shock['baseline']['low_speed_compression_clicks_out'] == 8
print('PASS: 343 reviewed facts; exact source/hash binding; 7 table denominators; conditional values; 8-step fork and 7-step shock procedure dependencies.')
