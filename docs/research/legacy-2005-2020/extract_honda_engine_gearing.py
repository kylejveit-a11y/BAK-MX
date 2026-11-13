"""Append bounded engine/gearing, trail and tank specifications to existing targets.

Run after extract_honda_dimensions.py with the original PDF directory as argv[1].
Uses only exact reviewed pages in honda-dimension-jobs.json. No year inheritance.
Unknown layouts and multi-model values fail closed. No service limits are read.
"""
import hashlib
import json
import pathlib
import re
import sys

import fitz
import pdfplumber

ROOT = pathlib.Path(__file__).parent
LABELS = {'Bore and stroke', 'Displacement', 'Compression ratio',
          'Primary reduction', 'Final reduction', 'Trail length',
          'Fuel capacity', 'Fuel tank capacity'} | {
              'Gear ratio ' + n for n in ['I', 'II', 'III', 'IV', 'V', 'VI']}


def clean(s):
    return ' '.join((s or '').split())


def select(value, model):
    if 'CRF' not in value:
        return value
    # An exact R or explicit R/RWE shared row is allowed; RX alone is never used.
    m = re.search(r'(?<![A-Z0-9])' + model + r'(?:/RWE)?:\s*(.*?)(?=\s+CRF|$)', value)
    assert m, (model, value)
    return m[1]


def parse(label, raw, model):
    v = select(raw, model)
    if label == 'Bore and stroke':
        m = re.fullmatch(r'([\d.]+)\s*[x×]\s*([\d.]+)\s*mm', v)
        assert m, v
        return [('Engine / Bore', m[1], 'mm'), ('Engine / Stroke', m[2], 'mm')]
    if label == 'Displacement':
        m = re.fullmatch(r'([\d.]+)\s*cm[3³]', v)
        assert m, v
        return [('Engine / Displacement', m[1], 'cm³')]
    if label == 'Compression ratio':
        m = re.fullmatch(r'([\d.]+)\s*:\s*1', v)
        assert m, v
        return [('Engine / Compression ratio', m[1] + ':1', None)]
    if label == 'Trail length':
        m = re.fullmatch(r'([\d.]+)\s*mm', v)
        assert m, v
        return [('Dimension / Trail length', m[1], 'mm')]
    if label in {'Fuel capacity', 'Fuel tank capacity'}:
        # These exact reviewed fuel rows render the litre glyph as R or x in
        # older text layers. This mapping is not used for any other field.
        m = re.fullmatch(r'([\d.]+)\s*(?:liter|ℓ|R|x)', v)
        assert m, v
        return [('Frame / Fuel tank capacity', m[1], 'L')]
    assert re.fullmatch(r'\d+\.\d+', v), (label, v)
    return [('Drive train / ' + label, v, None)]


def main():
    src = pathlib.Path(sys.argv[1])
    count = 0
    for job in json.loads((ROOT / 'honda-dimension-jobs.json').read_text()):
        path = src / pathlib.Path(job['local_path']).name
        assert hashlib.sha256(path.read_bytes()).hexdigest() == job['sha256']
        with pdfplumber.open(path) as pdf, fitz.open(path) as doc:
            for index, page in enumerate(job['spec_pages']):
                model = job['model']
                if model == 'CR85R_RB': model = ['CR85R', 'CR85RB'][index]
                elif model == 'CRF150R': model = ['CRF150R', 'CRF150RB'][index]
                year = job['year']
                target = ROOT / 'honda' / f'{year}-{model.lower()}-candidates.json'
                data = json.loads(target.read_text())
                base = data['facts'][0]
                prefix = f'honda-{year}-{model.lower()}-engine-gearing-'
                data['facts'] = [f for f in data['facts'] if not f['id'].startswith(prefix)]
                rows = [r for t in pdf.pages[page-1].extract_tables() for r in t
                        if clean(r[0]) in LABELS]
                locators = {clean(r[0]): base['locator'] for r in rows}
                if model == 'CRF450R' and year >= 2018:
                    continuation = page + 1
                    footer = re.search(r'(\d+)\s+Technical Information', doc[continuation-1].get_text())
                    assert footer
                    extra = [r for t in pdf.pages[continuation-1].extract_tables() for r in t
                             if clean(r[0]) in LABELS]
                    assert len(extra) == 7
                    rows.extend(extra)
                    locators.update({clean(r[0]): f'PDF page {continuation}; printed page {footer[1]}' for r in extra})
                if (year, model) == (2014, 'CRF250R'):
                    text = doc[page-1].get_text()
                    for label, pattern in [
                        ('Fuel tank capacity', r'Fuel tank capacity\n([\d.]+ US gal)\n([\d.]+ ℓ)'),
                        ('Trail length', r'Trail length\n([\d.]+ in)\n([\d.]+ mm)')]:
                        m = re.search(pattern, text)
                        assert m, (year, model, label)
                        rows.append([label, m[1], m[2]])
                seen = set()
                for row in rows:
                    label = clean(row[0])
                    assert label not in seen, (year, model, label)
                    seen.add(label)
                    raw = clean(next(c for c in reversed(row[1:]) if c))
                    for joint, value, unit in parse(label, raw, model):
                        fact = dict(base,
                            id=prefix + re.sub('[^a-z0-9]+', '-', joint.lower()).strip('-'),
                            property='dimensions' if unit == 'mm' else 'other',
                            joint=joint, value=value, unit=unit,
                            locator=locators.get(label, base['locator']),
                            conditions=['Exact stock model and model-year in this target only; no cross-year inheritance.',
                                        'RX and RWE targets excluded. Shared values used only when the manual explicitly includes this model.'],
                            review_note='Bounded engine/gearing, trail and tank rows visually checked against this exact specification page. Independent identity and conflict review pending; service procedures not covered.')
                        if label in {'Fuel capacity', 'Fuel tank capacity'} and re.search(r'[Rx]$', raw):
                            fact['conditions'].append('Litre unit confirmed from the page image; text-layer R/x is a font mapping artifact.')
                        data['facts'].append(fact)
                        count += 1
                expected = 14 if model.startswith('CR85') else 13
                assert sum(f['id'].startswith(prefix) for f in data['facts']) == expected, (year, model)
                target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(f'Added/rebuilt {count} bounded specification candidates across 54 targets')


if __name__ == '__main__':
    main()
