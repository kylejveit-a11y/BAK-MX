"""Offline regression checks on captured real DOM and quantity ambiguity."""
import importlib.util
import json
from pathlib import Path

repo = Path(__file__).resolve().parents[4]
spec = importlib.util.spec_from_file_location('inventory', repo/'scripts/motosport_inventory.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
folder = Path(__file__).parent
index = json.loads((folder/'index.json').read_text(encoding='utf-8'))
group = next(g for g in index['assemblies'] if g['name'] == 'OIL CLEANER')
capture = json.loads((folder/'captures/oil-cleaner.json').read_text(encoding='utf-8'))
parsed = module.parse_capture(capture, group, index['target'])
assert len(parsed['rows']) == 4  # Header is not a parts occurrence.
assert parsed['rows'][0]['supersedes_part_number'] == '5TA-13440-00-00'
assert parsed['rows'][0]['part_number'] == '5D3-13440-09-00'
assert parsed['rows'][3]['catalog_quantity'] == 2
ambiguous = dict(capture, html=capture['html'].replace('manufacturer recommends a quantity of 2', 'quantity'))
row = module.parse_capture(ambiguous, group, index['target'])['rows'][3]
assert row['catalog_quantity'] is None and row['purchase_input_default'] == '2'
for corrupted in (dict(capture, title='2024 Yamaha YZ250F OIL CLEANER'), dict(capture, url=group['url']+'-wrong')):
    try:
        module.parse_capture(corrupted, group, index['target'])
    except ValueError:
        pass
    else:
        raise AssertionError('Identity mismatch was accepted')
result = module.build(folder)
assert result['status'] == 'ALL_INDEXED_PAGES_CAPTURED'
assert result['counts']['occurrences'] == 958
assert result['counts']['explicit_catalog_quantities'] == 931
assert len(result['assemblies']) == 45
assert all(row['part_number'] and row['description'] for g in result['assemblies'] for row in g['rows'])
print('PASS: real rows, header exclusion, supersession direction, quantity ambiguity, identity, full-index reconciliation')
