"""Append selected visually reviewed engine-page facts, with exact-year provenance.

Run after extract_yamaha_dimensions.py with the source PDF directory as argv[1].
Only the first general page (two-strokes) or first engine page (four-strokes)
is read. Missing fields stay absent; no assumptions about other model-years.
"""
import hashlib
import json
import pathlib
import re
import sys
import fitz

ROOT = pathlib.Path(__file__).parent


def main():
    src = pathlib.Path(sys.argv[1])
    count = 0
    for job in json.loads((ROOT / 'source-discovery.json').read_text()):
        if job['manufacturer'] != 'Yamaha' or 'general_spec_page' not in job:
            continue
        year, model = job['year'], job['model']
        path = src / f'{year}_{model.lower()}.pdf'
        assert hashlib.sha256(path.read_bytes()).hexdigest() == job['sha256']
        four = model.endswith('F')
        page = job['general_spec_page'] + int(four)
        with fitz.open(path) as doc:
            text = doc[page-1].get_text().replace('\uf0b4', '×')
        target = ROOT / 'yamaha' / f'{year}-{model.lower()}-candidates.json'
        data = json.loads(target.read_text())
        base = data['facts'][0]
        prefix = f'yamaha-{year}-{model.lower()}-engine-page-'
        data['facts'] = [f for f in data['facts'] if not f['id'].startswith(prefix)]
        printed = '2-2' if four else '9-1' if model in {'YZ65', 'YZ85'} else '2-1'
        def add(joint, value, unit, condition=None):
            nonlocal count
            conditions = ['Exact US stock motocross model and model-year only; X/LW variants excluded.',
                          'Selected specification-page value; independent review and procedure reconciliation pending.']
            if condition: conditions.append(condition)
            data['facts'].append(dict(base,
                id=prefix + re.sub('[^a-z0-9]+', '-', joint.lower()).strip('-'),
                property='dimensions' if unit == 'mm' else 'other',
                joint=joint, value=value, unit=unit, conditions=conditions,
                locator=f'PDF page {page}; printed page {printed}',
                review_note='Selected engine-page rows visually inspected against this exact PDF. No cross-year or cross-country inheritance.'))
            count += 1
        def match(pattern, required=False):
            hits=list(re.finditer(pattern, text, re.I))
            assert len(hits) <= 1, (year, model, pattern, 'ambiguous')
            if required: assert hits, (year, model, pattern)
            return hits[0] if hits else None
        m = match(r'Displacement:?\s*([\d.]+)\s*cm[3³]', True)
        add('Engine / Displacement', m[1], 'cm³')
        m = match(r'Bore\s*[×x]\s*stroke:?\s*([\d.]+)\s*[×x]\s*([\d.]+)\s*mm', True)
        add('Engine / Bore', m[1], 'mm'); add('Engine / Stroke', m[2], 'mm')
        m = match(r'Compression ratio:?\s*(?:' + model + r'\s*)?([\d.]+(?:[–-][\d.]+)?)\s*:\s*1')
        if m: add('Engine / Compression ratio', m[1]+':1', None)
        m = match(r'(?:Fuel tank capacity|Tank capacity):?\s*([\d.]+)\s*L')
        if m: add('Frame / Fuel tank capacity', m[1], 'L')
        m = match(r'(?:Radiator \(including all routes\)|Coolant capacity \(including all routes\)):?\s*([\d.]+)\s*L')
        if m: add('Cooling / Capacity including all routes', m[1], 'L', 'Includes all routes; not a radiator-only quantity. Follow the manufacturer filling and bleeding procedure.')
        if four:
            for joint, pattern in [
                ('Engine oil / Quantity disassembled', r'Quantity \(disassembled\)\s*([\d.]+)\s*L'),
                ('Engine oil / With oil filter removal or replacement', r'With oil filter (?:element replacement|removal)\s*([\d.]+)\s*L'),
                ('Engine oil / Oil change without filter replacement', r'(?:Without oil filter element replacement|Oil change)\s*([\d.]+)\s*L')]:
                m = match(pattern, True)
                add(joint, m[1], 'L', 'Use only for the named service operation; specification-table quantity must be reconciled with the level-check procedure before use.')
        if model in {'YZ65', 'YZ85'}:
            for ordinal in ['1st','2nd','3rd','4th','5th','6th']:
                m = match(re.escape(ordinal)+r':\s*([\d.]+)\s*\((\d+/\d+)\)', True)
                add('Drive train / Gear ratio '+ordinal, m[1], None, 'Published rounded ratio; tooth counts '+m[2]+'.')
        assert len([f for f in data['facts'] if f['id'].startswith(prefix)]) >= 3
        target.write_text(json.dumps(data, indent=2, ensure_ascii=False)+'\n')
    print(f'Added/rebuilt {count} selected Yamaha engine-page candidates')


if __name__ == '__main__':
    main()
