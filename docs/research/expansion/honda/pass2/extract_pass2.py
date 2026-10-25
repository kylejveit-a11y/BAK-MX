"""Honda pass 2: CRF250R/RX and CRF450R/RX facts from Honda competition handbooks and owner's manuals -> pass2/*-facts.json.

usage: python3 -I extract_pass2.py <folder holding the Honda PDFs under their original file names>

Targets (US, variant 'standard'): 2021 CRF250R/RX and CRF450R/RX; CRF250RX and CRF450RX 2022 and 2024; CRF250RX 2026
(handbooks); CRF250RX/CRF450RX 2023 and 2025 and CRF450RX 2026 (owner's manuals); 2027 CRF450R/RX (handbook, kept in its own
files). RWE and HRC Works Edition values are never emitted.

Every value is checked against the text layer of the cited PDF page (whitespace and dash style normalised) and the script
stops on any miss. Model assignment, which the text layer cannot prove on two-column pages, was checked on rendered page images
(see REVIEW.md). Torque tables and cylinder/clutch tables are parsed; everything else is listed here by hand from the
reviewed pages.
"""
import hashlib, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
PDF_DIR = sys.argv[1]
CDN = 'https://cdn.powersports.honda.com/documentum/MWOM/'

def pdf_pages(fn):
    out = subprocess.run(['pdftotext', '-layout', os.path.join(PDF_DIR, fn), '-'], capture_output=True, text=True).stdout
    return out.split('\f')

def norm(s):
    s = s.replace('–', '-').replace('−', '-').replace('—', '-').replace('“', '"').replace('”', '"')
    return re.sub(r'\s+', ' ', s).strip()

def printed_page(text, kind):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if kind == 'handbook':
        for l in reversed(lines[-4:]):
            m = re.fullmatch(r'(\d-\d+)', l) or re.match(r'^(\d-\d+)\b', l) or re.search(r'\b(\d-\d+)$', l)
            if m: return m.group(1)
        return None
    for l in reversed(lines[-3:]):
        m = re.search(r'(?:^|\s)(\d{1,3})$', l) or re.match(r'^(\d{1,3})\s+[A-Z]', l)
        if m: return m.group(1)
    return None

# ---------------------------------------------------------------- documents
DOCS = {
 'h21_250': dict(file='ml.remawmom.2021_crf250r-rx_61k95x01_ch_web.pdf', kind='handbook', fam='CRF250', year=2021,
                 revision='CRF250R/RX Competition Handbook (cover "CRF250R/RX"; MY2021 per Honda file name 2021_crf250r-rx_61k95x01); Date of Issue March 2020'),
 'h21_450': dict(file='ml.remawmom.2021_crf450r-rx-rwe_ch_61mkex00_web.pdf', kind='handbook', fam='CRF450', year=2021,
                 revision='CRF450R/RX/RWE Competition Handbook (cover "CRF450R/RX/RWE"; MY2021 per Honda file name 2021_crf450r-rx-rwe_ch_61mkex00); Date of Issue June 2020'),
 'h22_250': dict(file='ml.remawmom.2022_crf250r_rx_competition_handbook.pdf', kind='handbook', fam='CRF250', year=2022,
                 revision='2022 CRF250R/RX Competition Handbook; Date of Issue March 2021'),
 'h22_450': dict(file='ml.remawmom.2022_crf450r_rx_rwe_competition_handbook.pdf', kind='handbook', fam='CRF450', year=2022,
                 revision='2022 CRF450R/RX/RWE Competition Handbook; Date of Issue February 2021'),
 'h24_250': dict(file='ml.remawmom.ak952424chen.pdf', kind='handbook', fam='CRF250', year=2024,
                 revision='2024 CRF250R/RX Competition Handbook; Date of Issue February 2023'),
 'h24_450': dict(file='ml.remawmom.amker2424chen.pdf', kind='handbook', fam='CRF450', year=2024,
                 revision='2024 CRF450R/RX/RWE Competition Handbook; Date of Issue March 2023'),
 'h26_250': dict(file='ml.remawmom.ak952626chen.pdf', kind='handbook', fam='CRF250', year=2026,
                 revision='2026 CRF250R/RX/RWE Competition Handbook; Date of Issue January 2024'),
 'h27_450': dict(file='ml.remawmom.amker2727chen.pdf', kind='handbook', fam='CRF450', year=2027,
                 revision='2027 CRF450R/RX/HRC Works Edition Competition Handbook; Date of Issue February 2026'),
 'h23_250': dict(file='ml.remawmom.ak952323chen.pdf', kind='handbook', fam='CRF250', year=2023,
                 revision='2023 CRF250R/RX Competition Handbook'),
 'h23_450': dict(file='ml.remawmom.amker2323chen.pdf', kind='handbook', fam='CRF450', year=2023,
                 revision='2023 CRF450R/RX/RWE Competition Handbook'),
 'h25_250': dict(file='ml.remawmom.ak952525chen.pdf', kind='handbook', fam='CRF250', year=2025,
                 revision='2025 CRF250R/RX/RWE Competition Handbook'),
 'h25_450': dict(file='ml.remawmom.amker2525chen.pdf', kind='handbook', fam='CRF450', year=2025,
                 revision='2025 CRF450R/RX/RWE/R-S Competition Handbook'),
 'h26_450': dict(file='ml.remawmom.amker2626chen.pdf', kind='handbook', fam='CRF450', year=2026,
                 revision='2026 CRF450R/RX/RWE Competition Handbook'),
 'h27_250': dict(file='AK952727CHEN.pdf', url_name='ml.remawmom.ak952727chen.pdf', kind='handbook', fam='CRF250', year=2027,
                 revision='2027 CRF250R/RX/HRC Works Edition Competition Handbook'),
 'o20_250': dict(file='ml.remawmom.2020_31k95620_crf250r_rx.pdf', kind='om', fam='CRF250', year=2020,
                 revision="2020 CRF250R/RX Owner's Manual (31K95620)"),
 'o20_450': dict(file='ml.remawmom.2020_31mke630_crf450r_rx_rwe.pdf', kind='om', fam='CRF450', year=2020,
                 revision="2020 CRF450R/RX/RWE Owner's Manual (31MKE630)"),
 'o23_250': dict(file='ml.remawmom.ak952323omen.pdf', kind='om', fam='CRF250', year=2023,
                 revision="2023 CRF250R/RX Owner's Manual (31K956500); copyright 2022"),
 'o23_450': dict(file='ml.remawmom.amker2323omen.pdf', kind='om', fam='CRF450', year=2023,
                 revision="2023 CRF450R/RX/RWE Owner's Manual (31MKE6600); copyright 2022"),
 'o25_250': dict(file='ml.remawmom.ak952525omen.pdf', kind='om', fam='CRF250', year=2025,
                 revision="2025 CRF250R/RX/RWE Owner's Manual (31K956700); copyright 2024"),
 'o25_450': dict(file='ml.remawmom.amker2525omen.pdf', kind='om', fam='CRF450', year=2025,
                 revision="2025 CRF450R/RX/RWE Owner's Manual (31MKE6800); copyright 2024"),
 'o26_450': dict(file='ml.remawmom.amker2626omen.pdf', kind='om', fam='CRF450', year=2026,
                 revision="2026 CRF450R/RX/RWE Owner's Manual (31MKE6910); copyright 2025"),
}
# (year, model) -> doc ; output file name
TARGETS = [
 (2021, 'CRF250R', 'h21_250'), (2021, 'CRF250RX', 'h21_250'), (2021, 'CRF450R', 'h21_450'), (2021, 'CRF450RX', 'h21_450'),
 (2022, 'CRF250RX', 'h22_250'), (2022, 'CRF450RX', 'h22_450'), (2024, 'CRF250RX', 'h24_250'), (2024, 'CRF450RX', 'h24_450'),
 (2026, 'CRF250RX', 'h26_250'),
 (2023, 'CRF250RX', 'h23_250'), (2023, 'CRF450RX', 'h23_450'), (2025, 'CRF250RX', 'h25_250'), (2025, 'CRF450RX', 'h25_450'),
 (2026, 'CRF450RX', 'h26_450'),
 (2020, 'CRF250R', 'o20_250'), (2020, 'CRF250RX', 'o20_250'), (2020, 'CRF450R', 'o20_450'), (2020, 'CRF450RX', 'o20_450'),
 (2027, 'CRF450R', 'h27_450'), (2027, 'CRF450RX', 'h27_450'), (2027, 'CRF250R', 'h27_250'), (2027, 'CRF250RX', 'h27_250'),
]
# owner's manuals used only for values the handbook of the same year does not print
SUPP = {'o23_250': [(2023, 'CRF250RX')], 'o23_450': [(2023, 'CRF450RX')], 'o25_250': [(2025, 'CRF250RX')],
        'o25_450': [(2025, 'CRF450RX')], 'o26_450': [(2026, 'CRF450RX')]}

# ---------------------------------------------------------------- condition text
def scope_text(doc, model, scope):
    what = 'handbook' if DOCS[doc]['kind'] == 'handbook' else "owner's manual"
    if scope == 'labelled':
        return f"Value printed for the {model} in this {what}, which also covers other variants. Stock OEM parts only."
    return f"The {what} prints this value once for every model it covers, so it applies to the {model}. Stock OEM parts only."
EXTRA = {
 'clicks': 'Counted in clicks counterclockwise (softer) from the stiffest, fully clockwise position; the first click is position 1.',
 'turns': 'Counted in turns counterclockwise (softer) from the stiffest, fully clockwise position.',
 'turns_mark': 'Counted in turns counterclockwise (softer) from the stiffest, fully clockwise position; the handbook has the adjuster punch mark aligned with the body punch mark within the printed range.',
 'clicks_mark': 'Counted in clicks counterclockwise (softer) from the stiffest, fully clockwise position; within the printed range the adjuster punch mark is aligned with the punch mark on the shock absorber.',
 'sag': 'Race sag is the unloaded measurement minus the rider-aboard measurement with the bike at race weight, per the procedure on the cited page.',
 'sil': 'Installed length of the standard-rate shock spring at the standard setting; changing it changes race sag.',
 'proc': 'Measure or fill using the OEM procedure on the cited page.',
 'forkoil': 'Fork tube oil amount per fork leg with the standard spring; the handbook gives a maximum, standard and minimum amount for each spring and requires the same amount in both legs.',
 'damper': 'Oil poured into the fork damper during damper service, per the procedure on the cited page; a small amount is expelled during air bleeding.',
 'spring_std': 'Standard (factory-installed) spring for this model; optional rates are alternatives, not stock specification. Factory springs may be unmarked; marks alone do not prove spring identity.',
 'spring_opt': 'Optional spring offered as an alternative; not the stock specification. Factory springs may be unmarked; marks alone do not prove spring identity.',
 'tire': 'OEM cold-tire baseline; measure tires cold. Terrain and aftermarket tires require contextual review.',
 'dim': 'OEM standard engine/components only; inspect using the associated measurement procedure.',
 'om_spec': "From the specifications table of the US owner's manual; stock OEM configuration.",
 'sprocket': 'Standard driven sprocket and chain length from the handbook optional-parts table; optional sprockets listed there are alternatives, not stock.',
}
SCHED_LEGEND = ('From this model\'s column of the handbook maintenance schedule, whichever of races or hours is printed; the schedule assumes average '
                'riding conditions and severe use needs more frequent service. Legend: I = inspect and clean, adjust, lubricate or replace if '
                'necessary; C = clean; R = replace; L = lubricate.')
NOTES = {1: 'Schedule note: clean after every moto in dusty riding conditions.',
         2: 'Schedule note: replace every 2 years; replacement requires mechanical skill.',
         3: 'Schedule note: replace after the first break-in ride.',
         4: 'Schedule note: inspect after the first break-in ride.',
         5: 'Schedule note: replace the engine oil if the clutch discs and plates are replaced.',
         6: 'Schedule note: replace every year.'}

# ---------------------------------------------------------------- collection
FACTS = {}          # (year, model) -> list
PAGES = {}
USED_PAGES = {}     # doc -> set of pdf pages
def _models_for(doc):
    return [m for (y, m, d) in TARGETS if d == doc] + [m for (y, m) in SUPP.get(doc, [])]

def put(doc, models, joint, value, unit, prop, page, needle=None, scope='labelled', extra=(), conds_pre=(), extra_fields=None):
    """models: 'R', 'RX', 'R,RX' (relative to family) or full names."""
    d = DOCS[doc]; pages = PAGES[doc]
    text = pages[page - 1]
    nd = needle if needle is not None else str(value)
    for n in (nd if isinstance(nd, (list, tuple)) else [nd]):
        if norm(n) not in norm(text):
            raise SystemExit(f'NOT FOUND {doc} p{page}: {n!r} ({joint})')
    USED_PAGES.setdefault(doc, set()).add(page)
    full = [m if m.startswith('CRF') else d['fam'] + m for m in models.split(',')] if isinstance(models, str) else models
    for model in full:
        if model not in _models_for(doc):
            continue
        conds = list(conds_pre) + [scope_text(doc, model, scope)] + [EXTRA.get(e, e) for e in extra]
        f = {'joint': joint, 'value': value, 'unit': unit, 'property': prop, 'conditions': conds, 'pdf_page': page,
             'printed_page': printed_page(text, d['kind'])}
        if extra_fields: f.update(extra_fields)
        f['_doc'] = doc
        lst = FACTS.setdefault((d['year'], model), [])
        if any(x['joint'] == joint for x in lst):
            raise SystemExit(f'duplicate joint {joint} {model} {doc}')
        lst.append(f)

# ---------------------------------------------------------------- torque tables
sys.path.insert(0, HERE)
from torque_table import parse as parse_torque, applies
TORQUE_DROPPED = []
def torques(doc):
    d = DOCS[doc]
    rows, tpages = parse_torque(PAGES[doc])
    for p in tpages: USED_PAGES.setdefault(doc, set()).add(p)
    for model in _models_for(doc):
        seen = {}
        for r in rows:
            if r['value'] is None or not applies(r['tag'], model):
                continue
            name = r['name']
            if name in seen:
                if seen[name]['value'] != r['value']:
                    TORQUE_DROPPED.append((doc, model, name, seen[name]['value'], r['value']))
                    seen[name]['_conflict'] = True
                else:
                    seen[name]['_also'].append(r['pdf_page'])
                continue
            seen[name] = dict(r, _also=[])
        for name, r in seen.items():
            if r.get('_conflict'):
                continue
            v = r['value']; val = str(int(v)) if v == int(v) else str(v)
            conds = []
            if r['remarks']: conds.append(r['remarks'])
            if r['tag']: conds.append(f"Row labelled for the {model} in the handbook torque table.")
            conds.append('Use OEM installation procedure; torque alone is not a complete service instruction.')
            f = {'joint': name, 'value': val, 'unit': 'N·m', 'property': 'torque', 'conditions': conds, 'pdf_page': r['pdf_page'],
                 'printed_page': printed_page(PAGES[doc][r['pdf_page'] - 1], 'handbook'), 'thread_diameter': r['thread'],
                 'manual_quantity': r['qty']}
            if r['_also']: f['also_on_pdf_pages'] = r['_also']
            f['_doc'] = doc
            lst = FACTS.setdefault((d['year'], model), [])
            assert not any(x['joint'] == name for x in lst), (doc, name)
            lst.append(f)

# ---------------------------------------------------------------- cylinder / clutch tables (STANDARD:/SERVICE LIMIT: layout)
ENGINE = [('Cylinder bore diameter', 'S'), ('Cylinder bore diameter', 'L'), ('Cylinder sealing face warpage', 'L'),
          ('Piston outside diameter', 'S'), ('Piston outside diameter', 'L'), ('Piston pin bore diameter', 'S'),
          ('Piston pin bore diameter', 'L'), ('Piston pin outside diameter', 'S'), ('Piston pin outside diameter', 'L'),
          ('Top piston ring end gap', 'S'), ('Top piston ring end gap', 'L'), ('Oil ring side rail end gap', 'S'),
          ('Oil ring side rail end gap', 'L'), ('Top ring to piston groove clearance', 'S'),
          ('Connecting rod small end diameter', 'S'), ('Connecting rod small end diameter', 'L')]
def spec_prop(joint, sl):
    return 'clearance_wear_limit' if sl == 'L' or 'clearance' in joint.lower() or 'gap' in joint else 'dimensions'
def table_rows(doc, page, heading, names, models='R,RX', depth=True):
    text = PAGES[doc][page - 1]
    seg = text[text.index(heading):]
    vals = re.findall(r'(STANDARD|SERVICE LIMIT):\s*([\d.]+(?:\s*[–-]\s*[\d.]+)?)\s*mm', seg)
    assert len(vals) == len(names), (doc, page, heading, len(vals), vals)
    dep = re.search(r'Piston O\.D\. at\s*([\d.]+)\s*mm', norm(seg)) if depth else None
    for (joint, sl), (kind, v) in zip(names, vals):
        assert (kind == 'STANDARD') == (sl == 'S'), (doc, joint, kind)
        v = v.replace('–', '-'); v = re.sub(r'\s*-\s*', ' - ', v)
        extra = ['dim']
        if joint == 'Piston outside diameter':
            extra.append(f'Measure {dep.group(1)} mm above the bottom of the piston skirt, following OEM orientation.')
        put(doc, models, f"{joint} — {'standard' if sl == 'S' else 'service limit'}", v, 'mm', spec_prop(joint, sl), page,
            needle=v, scope='shared', extra=extra)

CLUTCH_250 = [('Clutch lever free play', 'S'), ('Clutch friction disc thickness', 'S'), ('Clutch friction disc thickness', 'L'),
              ('Clutch plate warpage', 'L'), ('Clutch spring free length', 'S'), ('Clutch spring free length', 'L')]
CLUTCH_450 = CLUTCH_250[1:]

def common_rules(doc, cyl_page, clutch_page, clutch_names, models='R,RX'):
    put(doc, models, 'Piston pin surface treatment', 'Do not polish', None, 'installation', cyl_page, needle='Do not polish the piston pin', scope='shared')
    if clutch_page:
        t = PAGES[doc][clutch_page - 1]
        if 'Replace the clutch springs' in t:
            put(doc, models, 'Clutch spring replacement grouping', 'Replace as a set', None, 'replacement_rule', clutch_page,
                needle='Replace the clutch springs', scope='shared')
        put(doc, models, 'Clutch friction disc and plate replacement grouping', 'Replace as a set', None, 'replacement_rule', clutch_page,
            needle=['Replace the clutch', 'as a set'], scope='shared')

def tires(doc, page, models='R,RX'):
    put(doc, models, 'Front tire pressure', '100', 'kPa', 'pressure', page, needle='FRONT: 100 kPa (1.0 kgf/cm2, 15 psi)', scope='shared', extra=['tire'])
    put(doc, models, 'Rear tire pressure', '100', 'kPa', 'pressure', page, needle='REAR: 100 kPa (1.0 kgf/cm2, 15 psi)', scope='shared', extra=['tire'])
    for side in ('Front radial', 'Front axial', 'Rear radial', 'Rear axial'):
        put(doc, models, f'{side} wheel rim runout — service limit', '1.0', 'mm', 'clearance_wear_limit', page,
            needle=['Radial: 1.0 mm (0.04 in)', 'Axial: 1.0 mm (0.04 in)'], scope='shared')

def springs(doc, page, model, fork, shock):
    """fork/shock: (soft, standard, stiff) as printed; standard one is the factory spring for that model's table."""
    for part, rates, unit in (('Fork', fork, 'N/mm'), ('Shock', shock, 'N/mm')):
        for kind, v in zip(('optional soft', 'standard', 'optional stiff'), rates):
            put(doc, model, f'{part} {kind} spring rate', v, unit, 'spring_rate', page, needle=f'{v} N/mm',
                extra=['spring_std' if kind == 'standard' else 'spring_opt'])

# maintenance schedule (handbook layout is identical across the reviewed years apart from the rows listed per document)
R_COLS = {1: 'Each race or about 2.5 hours', 2: 'Every 3 races or about 7.5 hours', 3: 'Every 6 races or about 15.0 hours',
          4: 'Every 9 races or about 22.5 hours', 5: 'Every 12 races or about 30.0 hours'}
RX_COLS = {1: 'Each race or about 3.5 hours', 2: 'Every 2 races or about 7.5 hours', 3: 'Every 4 races or about 15.0 hours',
           4: 'Every 6 races or about 22.5 hours', 5: 'Every 8 races or about 30.0 hours'}
ACT = {'I': 'Inspect', 'C': 'Clean', 'R': 'Replace', 'L': 'Lubricate'}
BASE_SCHED = [  # item, [(action, column)], notes
 ('Fuel line', [('I', 1), ('R', 5)], [6]), ('Fuel pump filter', [('R', 5)], [6]), ('Throttle operation', [('I', 1)], []),
 ('Air filter', [('C', 1)], [1]), ('Crankcase breather', [('I', 1)], []), ('Spark plug', [('I', 1)], []),
 ('Valve clearance/decompressor system', [('I', 3)], [4]), ('Engine oil', [('I', 1), ('R', 3)], [3, 5]),
 ('Engine oil filter', [('R', 3)], [3]), ('Engine idle speed', [('I', 1)], []), ('Piston and piston rings', [('R', 3)], []),
 ('Piston pin', [('R', 3)], []), ('Radiator coolant', [('I', 1)], [2]), ('Cooling system', [('I', 1)], []),
 ('Drive chain', [('I', 1), ('L', 1), ('R', 2)], []), ('Drive chain slider', [('I', 1)], []), ('Drive chain roller', [('I', 1)], []),
 ('Drive sprocket', [('I', 1)], []), ('Driven sprocket', [('I', 1)], []), ('Brake fluid', [('I', 1)], [2]),
 ('Brake pads wear', [('I', 1)], []), ('Brake system', [('I', 1)], []), ('Clutch fluid', [('I', 1)], [2]),
 ('Clutch system', [('I', 1)], [5]), ('Control cables', [('I', 1), ('L', 1)], []), ('Exhaust pipe/muffler', [('I', 1)], []),
 ('Suspension', [('I', 1)], []), ('Swingarm/shock linkage', [('L', 2)], []), ('Fork oil', [('R', 4)], [3]),
 ('Nuts, bolts, fasteners', [('I', 1)], []), ('Wheels/tires', [('I', 1)], []), ('Steering head bearings', [('I', 4)], []),
 ('Sidestand', [('I', 1)], []),
]
def schedule(doc, page, model, items, needles, kind='handbook'):
    full = model if model.startswith('CRF') else DOCS[doc]['fam'] + model
    cols = RX_COLS if full.endswith('RX') else R_COLS
    for item, acts, notes in items:
        for a, c in acts:
            pre = []
            conds_extra = [SCHED_LEGEND.replace('handbook', 'handbook' if kind == 'handbook' else "owner's manual")] + [NOTES[n] for n in notes]
            pg = page[item] if isinstance(page, dict) else page
            key = {'Crankshaft': 'CRANK SHAFT', 'Air cleaner': 'AIR CLEANER'}.get(item, ' '.join(item.split('/')[0].split(',')[0].split()[:2]))
            pt = norm(PAGES[doc][pg - 1]).upper().replace('SIDE STAND', 'SIDESTAND')
            if norm(key).upper() not in pt:
                raise SystemExit(f'schedule item {item} not on {doc} p{pg}')
            put(doc, full, f'Maintenance schedule / {item} / {ACT[a]}', cols[c], None, 'service_interval', pg,
                needle=needles, scope='labelled', extra=conds_extra)

def sched_items(drop=(), add=(), replace=None):
    out = []
    for it in BASE_SCHED:
        if it[0] in drop: continue
        if replace and it[0] in replace: it = replace[it[0]]
        out.append(it)
    return out + list(add)

# ================================================================= document data
def load():
    for k, d in DOCS.items():
        PAGES[k] = pdf_pages(d['file'])

def doc_h21_250():
    D = 'h21_250'
    torques(D)
    # cylinder table (grid layout on this handbook) -- rows read from the table; checked on the page image
    cyl = [('Cylinder bore diameter — standard', '79.000 - 79.015', '79.000 – 79.015 (3.1102 – 3.1108)', 'dimensions'),
           ('Cylinder bore diameter — service limit', '79.100', '79.100 (3.1142)', 'clearance_wear_limit'),
           ('Cylinder sealing face warpage — service limit', '0.05', '0.05 (0.002)', 'clearance_wear_limit'),
           ('Piston outside diameter — standard', '78.975 - 78.985', '78.975 – 78.985 (3.1092 – 3.1096)', 'dimensions'),
           ('Piston outside diameter — service limit', '78.875', '78.875 (3.1053)', 'clearance_wear_limit'),
           ('Piston pin bore diameter — standard', '16.002 - 16.008', '16.002 – 16.008 (0.6300 – 0.6302)', 'dimensions'),
           ('Piston pin bore diameter — service limit', '16.020', '16.020 (0.6307)', 'clearance_wear_limit'),
           ('Piston pin outside diameter — standard', '15.994 - 16.000', '15.994 – 16.000 (0.6297 – 0.6300)', 'dimensions'),
           ('Piston pin outside diameter — service limit', '15.980', '15.980 (0.6291)', 'clearance_wear_limit'),
           ('Top piston ring end gap — standard', '0.15 - 0.25', '0.15 – 0.25 (0.0059 – 0.0098)', 'clearance_wear_limit'),
           ('Top piston ring end gap — service limit', '0.35', '0.35 (0.014)', 'clearance_wear_limit'),
           ('Oil ring side rail end gap — standard', '0.10 - 0.35', '0.10 – 0.35 (0.0039 – 0.0138)', 'clearance_wear_limit'),
           ('Oil ring side rail end gap — service limit', '0.55', '0.55 (0.022)', 'clearance_wear_limit'),
           ('Top ring to piston groove clearance — standard', '0.015 - 0.045', '0.015 – 0.045 (0.0006 – 0.0018)', 'clearance_wear_limit'),
           ('Connecting rod small end diameter — standard', '16.003 - 16.025', '16.003 – 16.025 (0.6300 – 0.6309)', 'dimensions'),
           ('Connecting rod small end diameter — service limit', '16.031', '16.031 (0.6311)', 'clearance_wear_limit')]
    for j, v, n, p in cyl:
        ex = ['dim'] + (['Measure 7.0 mm above the bottom of the piston skirt, following OEM orientation.'] if j.startswith('Piston outside') else [])
        put(D, 'R,RX', j, v, 'mm', p, 65, needle=n, scope='shared', extra=ex)
    clu = [('Clutch lever free play — standard', '10 - 20', '10 – 20 (3/8 – 13/16)', 'dimensions'),
           ('Clutch friction disc thickness — standard', '2.92 - 3.08', '2.92 – 3.08 (0.115 – 0.121)', 'dimensions'),
           ('Clutch friction disc thickness — service limit', '2.85', '2.85 (0.112)', 'clearance_wear_limit'),
           ('Clutch plate warpage — service limit', '0.10', '0.10 (0.004)', 'clearance_wear_limit'),
           ('Clutch spring free length — standard', '56.22', '56.22 (2.213)', 'dimensions'),
           ('Clutch spring free length — service limit', '55.32', '55.32 (2.178)', 'clearance_wear_limit')]
    for j, v, n, p in clu:
        put(D, 'R,RX', j, v, 'mm', p, 86, needle=n, scope='shared', extra=['dim'])
    common_rules(D, 65, 86, None)
    tires(D, 97)
    put(D, 'R,RX', 'Spark plug / Specified type', 'NGK R0451B-9', None, 'specification', 48, needle='SPECIFIED SPARK PLUG: R0451B-9 (NGK)', scope='shared')
    put(D, 'R,RX', 'Valve clearance / Intake', '0.09 ± 0.03', 'mm', 'valve_clearance', 50, needle='0.09 ± 0.03 mm (0.004 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Valve clearance / Exhaust', '0.19 ± 0.03', 'mm', 'valve_clearance', 50, needle='0.19 ± 0.03 mm (0.007 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil / Viscosity', 'SAE 10W-30', None, 'engine_oil', 59, needle='Viscosity: SAE 10W-30', scope='shared')
    put(D, 'R,RX', 'Engine oil capacity / At draining', '1.08', 'L', 'oil_capacity', 60, needle='1.08 liter (1.14 US qt, 0.95 Imp qt) at draining', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil capacity / At oil filter change', '1.12', 'L', 'oil_capacity', 60, needle='1.12 liter (1.18 US qt, 0.99 Imp qt) at oil filter change', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil capacity / At disassembly', '1.35', 'L', 'oil_capacity', 60, needle='1.35 liter (1.43 US qt, 1.19 Imp qt) at disassembly', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine idle speed', '2,000 ± 100', 'rpm', 'idle_speed', 61, needle='IDLE SPEED: 2,000 ± 100 rpm', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Coolant / Standard concentration', '1:1 mixture with distilled water', None, 'coolant', 70, scope='shared')
    put(D, 'R,RX', 'Coolant capacity / At change', '0.94', 'L', 'coolant', 71, needle='0.94 liter (0.99 US qt, 0.83 Imp qt)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Coolant capacity / At disassembly', '1.09', 'L', 'coolant', 71, needle='1.09 liters (1.15 US qt, 0.96 Imp qt)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Throttle grip / Freeplay', '2 – 6', 'mm', 'specification', 44, needle='FREEPLAY:2 – 6 mm (1/16 – 1/4 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Drive chain / Slack', '35–45', 'mm', 'drive_chain', 73, needle='CHAIN SLACK: 35 – 45 mm (1 3/8 – 1 3/4 in)', scope='shared', extra=['proc'])
    put(D, 'R', 'Drive chain / 17-pin (16-pitch) length — service limit', '257', 'mm', 'drive_chain', 74, needle='SERVICE LIMIT: 257 mm (10.12 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / Plate height — service limit', '12.0', 'mm', 'drive_chain', 74, needle='SERVICE LIMIT: 12.0 mm (0.47 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Plate height — service limit', '13.3', 'mm', 'drive_chain', 74, needle='SERVICE LIMIT: 13.3 mm (0.52 in)', extra=['proc'])
    put(D, 'R,RX', 'Drive chain / Standard links', '114', 'links', 'drive_chain', 76, needle='STANDARD LINKS: 114 LINKS')
    put(D, 'R', 'Drive chain / Replacement chain', 'DID 520DMS-120RB', None, 'drive_chain', 76, needle='DID: 520DMS-120RB')
    put(D, 'RX', 'Drive chain / Replacement chain', 'DID 520MXV5-120ZB', None, 'drive_chain', 76, needle='DID: 520MXV5-120ZB')
    put(D, 'R', 'Final drive / Standard driven sprocket', '48T (aluminum), 114-link chain', None, 'drive_chain', 101, needle='48T (Aluminum)/114', extra=['sprocket'])
    put(D, 'RX', 'Final drive / Standard driven sprocket', '48T (aluminum), 114-link chain', None, 'drive_chain', 102, needle='48T (Aluminum)/114', extra=['sprocket'])
    springs(D, 101, 'R', ('4.6', '4.8', '5.0'), ('50', '52', '54'))
    springs(D, 102, 'RX', ('4.4', '4.6', '4.8'), ('48', '50', '52'))
    put(D, 'R,RX', 'Fork / Recommended oil', 'Fork fluid (viscosity 5W)', None, 'specification', 115, needle='Fork fluid (viscosity 5 W)', scope='shared')
    put(D, 'R,RX', 'Fork / Damper filling oil capacity', '248', 'cm3', 'suspension_setting', 93, needle='248 cm3 (8.4 US oz, 8.7 Imp oz)', scope='shared', extra=['damper'])
    put(D, 'R', 'Fork / Oil capacity / Standard (standard spring)', '343', 'cm3', 'suspension_setting', 105, needle='343 cm3', extra=['forkoil'])
    put(D, 'R', 'Fork / Oil capacity / Maximum (standard spring)', '396', 'cm3', 'suspension_setting', 105, needle='396 cm3', extra=['forkoil'])
    put(D, 'R', 'Fork / Oil capacity / Minimum (standard spring)', '311', 'cm3', 'suspension_setting', 105, needle='311 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Standard (standard spring)', '356', 'cm3', 'suspension_setting', 106, needle='356 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Maximum (standard spring)', '391', 'cm3', 'suspension_setting', 106, needle='391 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Minimum (standard spring)', '306', 'cm3', 'suspension_setting', 106, needle='306 cm3', extra=['forkoil'])
    put(D, 'R', 'Fork / Compression damping adjuster / Standard position', '9', 'clicks', 'suspension_setting', 104, needle='and the 9 clicks', extra=['clicks'])
    put(D, 'RX', 'Fork / Compression damping adjuster / Standard position', '12', 'clicks', 'suspension_setting', 104, needle='and the 12 clicks', extra=['clicks'])
    put(D, 'R', 'Fork / Rebound damping adjuster / Standard position', '11', 'clicks', 'suspension_setting', 105, needle='and the 11 clicks', extra=['clicks'])
    put(D, 'RX', 'Fork / Rebound damping adjuster / Standard position', '15', 'clicks', 'suspension_setting', 105, needle='and the 15 clicks', extra=['clicks'])
    put(D, 'R', 'Shock / High speed compression damping adjuster / Standard position', '2 7/12 – 3 1/12', 'turns', 'suspension_setting', 119, needle='2-7/12 – 3-1/12', extra=['turns_mark'])
    put(D, 'RX', 'Shock / High speed compression damping adjuster / Standard position', '2 11/12 – 3 5/12', 'turns', 'suspension_setting', 119, needle='2-11/12 – 3-5/', extra=['turns_mark'])
    put(D, 'R', 'Shock / Low speed compression damping adjuster / Standard position', '11', 'clicks', 'suspension_setting', 120, needle='and the 11 clicks', extra=['clicks'])
    put(D, 'RX', 'Shock / Low speed compression damping adjuster / Standard position', '8', 'clicks', 'suspension_setting', 120, needle='and the 8 clicks', extra=['clicks'])
    put(D, 'R', 'Shock / Rebound damping adjuster / Standard position', '5–8', 'clicks', 'suspension_setting', 120, needle='and the 5 – 8', extra=['clicks_mark'])
    put(D, 'RX', 'Shock / Rebound damping adjuster / Standard position', '7–10', 'clicks', 'suspension_setting', 120, needle='and the 7 – 10', extra=['clicks_mark'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (standard spring)', '105', 'mm', 'race_sag', 121, needle=['Standard Race Sag (Standard spring)', '105 mm'], scope='shared', extra=['sag'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (optional soft spring)', '110–115', 'mm', 'race_sag', 121, needle='110 - 115 mm', scope='shared', extra=['sag'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (optional stiff spring)', '95–100', 'mm', 'race_sag', 121, needle='95 - 100 mm', scope='shared', extra=['sag'])
    put(D, 'R', 'Shock / Spring install length / Standard (standard spring)', '237', 'mm', 'spring_install_length', 122, needle='Standard: 237 mm (9.33 in)', extra=['sil'])
    put(D, 'RX', 'Shock / Spring install length / Standard (standard spring)', '233.5', 'mm', 'spring_install_length', 122, needle='Standard: 233.5 mm (9.19 in)', extra=['sil'])
    items = sched_items(drop=('Clutch fluid',), replace={'Air filter': ('Air cleaner', [('C', 1)], [1])})
    schedule(D, 31, 'R', [i for i in items if i[0] != 'Sidestand'], ['CRF250R or about 2.5', 'COMPETITION MAINTENANCE SCHEDULE'])
    schedule(D, 31, 'RX', items, ['CRF250RX or about 3.5', 'Only RX type'])

def doc_450_classic(D, chain_r_page=66, cfg=None):
    """2021/2022/2024 CRF450R/RX/RWE handbooks share one page layout."""
    c = cfg
    torques(D)
    table_rows(D, 57, 'CYLINDER/PISTON SPECIFICATIONS', ENGINE)
    table_rows(D, 79, 'CLUTCH SPECIFICATIONS', CLUTCH_450, depth=False)
    common_rules(D, 57, 79, None)
    tires(D, 101)
    if c['plug']:
        put(D, 'R,RX', 'Spark plug / Specified type', c['plug'], None, 'specification', 44, needle=c['plug_needle'], scope='shared')
    put(D, 'R,RX', 'Valve clearance / Intake', '0.13 ± 0.03', 'mm', 'valve_clearance', 46, needle='0.13 ± 0.03 mm (0.005 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Valve clearance / Exhaust', '0.28 ± 0.03', 'mm', 'valve_clearance', 46, needle='0.28 ± 0.03 mm (0.011 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil / Viscosity', 'SAE 10W-30', None, 'engine_oil', 52, needle='Viscosity: SAE 10W-30', scope='shared')
    put(D, 'R,RX', 'Engine oil capacity / At draining', '1.00', 'L', 'oil_capacity', 52, needle='1.00 liter (1.06 US qt, 0.88 Imp qt) at draining', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil capacity / At oil filter change', '1.04', 'L', 'oil_capacity', 52, needle='1.04 liters (1.10 US qt, 0.92 Imp qt) at oil filter change', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil capacity / At disassembly', '1.35', 'L', 'oil_capacity', 52, needle='1.35 liters (1.43 US qt, 1.19 Imp qt) at disassembly', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine idle speed', '2,000 ± 100', 'rpm', 'idle_speed', 53, needle='IDLE SPEED: 2,000 ± 100 rpm', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Coolant / Standard concentration', '1:1 mixture with distilled water', None, 'coolant', 63, scope='shared')
    put(D, 'R,RX', 'Coolant capacity / At change', '1.08', 'L', 'coolant', 63, needle=['at change:', '1.08 liters (1.14 US qt, 0.95 Imp qt)'], scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Coolant capacity / At disassembly', '1.14', 'L', 'coolant', 63, needle='1.14 liters (1.20 US qt, 1.00 Imp qt)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Throttle grip / Freeplay', '2 – 6', 'mm', 'specification', 41, needle='FREEPLAY: 2 – 6 mm (1/16 – 1/4 in)', scope='shared', extra=['proc'])
    put(D, 'R', 'Drive chain / Slack', '65–70', 'mm', 'drive_chain', 66, needle='STANDARD: 65 – 70 mm (2 1/2 – 2 3/4 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / Inner plate height — service limit', '14.0', 'mm', 'drive_chain', 68, needle='SERVICE LIMIT: 14.0 mm (0.55 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / 17-pin (16-pitch) length — service limit', '257', 'mm', 'drive_chain', 68, needle='SERVICE LIMIT: 257 mm (10.1 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / Standard links', '114', 'links', 'drive_chain', 69, needle='STANDARD LINKS: 114 LINKS')
    put(D, 'R', 'Drive chain / Replacement chain', 'DID 520DM2-120RB', None, 'drive_chain', 69, needle='CRF450R: DID 520DM2-120RB')
    put(D, 'RX', 'Drive chain / Slack', '65–70', 'mm', 'drive_chain', 69, needle='STANDARD: 65 – 70 mm (2 1/2 – 2 3/4 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Inner plate height — service limit', '13.5', 'mm', 'drive_chain', 70, needle='SERVICE LIMIT: 13.5 mm (0.53 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Standard links', '114', 'links', 'drive_chain', 71, needle='STANDARD LINKS: 114 LINKS')
    put(D, 'RX', 'Drive chain / Replacement chain', c['rx_chain'], None, 'drive_chain', 71, needle=c['rx_chain_needle'])
    put(D, 'R', 'Final drive / Standard driven sprocket', '49T (aluminum), 114-link chain', None, 'drive_chain', 105, needle='49T (Aluminum)/114', extra=['sprocket'])
    put(D, 'RX', 'Final drive / Standard driven sprocket', '50T (aluminum), 114-link chain', None, 'drive_chain', 106, needle='50T (Aluminum)/114', extra=['sprocket'])
    springs(D, 105, 'R', *c['r_springs']); springs(D, 106, 'RX', *c['rx_springs'])
    put(D, 'R,RX', 'Fork / Damper filling oil capacity', '248', 'cm3', 'suspension_setting', 91, needle='248 cm3 (8.4 US oz, 8.7 Imp oz)', scope='shared', extra=['damper'])
    for m in ('R', 'RX'):
        o = c['forkoil'][m]
        put(D, m, 'Fork / Oil capacity / Standard (standard spring)', o[1], 'cm3', 'suspension_setting', 110, needle=f'{o[1]} cm3', extra=['forkoil'])
        put(D, m, 'Fork / Oil capacity / Maximum (standard spring)', o[0], 'cm3', 'suspension_setting', 110, needle=f'{o[0]} cm3', extra=['forkoil'])
        put(D, m, 'Fork / Oil capacity / Minimum (standard spring)', o[2], 'cm3', 'suspension_setting', 110, needle=f'{o[2]} cm3', extra=['forkoil'])
        put(D, m, 'Fork / Compression damping adjuster / Standard position', c['fc'][m][0], 'clicks', 'suspension_setting', 109, needle=c['fc'][m][1], scope=c['fc'][m][2] if len(c['fc'][m]) > 2 else 'labelled', extra=['clicks'])
        put(D, m, 'Fork / Rebound damping adjuster / Standard position', c['fr'][m][0], 'clicks', 'suspension_setting', 109, needle=c['fr'][m][1], extra=['clicks'])
        put(D, m, 'Shock / High speed compression damping adjuster / Standard position', c['hsc'][m][0], 'turns', 'suspension_setting', 111, needle=c['hsc'][m][1], extra=['turns_mark'])
        put(D, m, 'Shock / Low speed compression damping adjuster / Standard position', c['lsc'][m][0], 'clicks', 'suspension_setting', 112, needle=c['lsc'][m][1], extra=['clicks'])
        put(D, m, 'Shock / Rebound damping adjuster / Standard position', c['reb'][m][0], 'clicks', 'suspension_setting', 112, needle=c['reb'][m][1], extra=[c.get('reb_kind', 'clicks_mark')])
        put(D, m, 'Shock / Spring install length / Standard (standard spring)', c['sil'][m][0], 'mm', 'spring_install_length', 114, needle=c['sil'][m][1], extra=['sil'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (standard spring)', '105', 'mm', 'race_sag', 113, needle=c['sag'][0], scope='shared', extra=['sag'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (optional soft spring)', '110–115', 'mm', 'race_sag', 113, needle=c['sag'][1], scope='shared', extra=['sag'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (optional stiff spring)', '95–100', 'mm', 'race_sag', 113, needle=c['sag'][2], scope='shared', extra=['sag'])
    items = sched_items()
    schedule(D, 29, 'R', [i for i in items if i[0] != 'Sidestand'], ['CRF450R/RWE', 'about 2.5'])
    schedule(D, 30, 'RX', items, ['CRF450RX', 'about 3.5'])

SAG_A = ('Standard Race Sag (Standard spring): 105 mm', 'Standard Race Sag (Soft spring): 110 – 115 mm', 'Standard Race Sag (Stiff spring): 95 – 100 mm')
SAG_B = ('Standard Race Sag (Standard spring): 105 mm (4.1 in)', 'Standard Race Sag (Soft spring): 110 – 115 mm (4.3 – 4.5 in)', 'Standard Race Sag (Stiff spring): 95 – 100 mm (3.7 – 3.9 in)')
CFG_450 = {
 'h21_450': dict(plug='NGK SILMAR10A-9S', plug_needle='SILMAR10A-9S (NGK)', rx_chain='RK 520EXU-120LJFZ', rx_chain_needle='RK: 520EXU-120LJFZ',
   r_springs=(('4.8', '5.0', '5.2'), ('52', '54', '56')), rx_springs=(('4.6', '4.8', '5.0'), ('48', '50', '52')),
   forkoil={'R': ('412', '388', '326'), 'RX': ('409', '372', '322')},
   fc={'R': ('10', 'CRF450R: 10 clicks'), 'RX': ('11', 'CRF450RX/RWE: 11 clicks')},
   fr={'R': ('15', 'CRF450R/RWE: 15 clicks'), 'RX': ('14', 'CRF450RX: 14 clicks')},
   hsc={'R': ('1 11/12 – 2 5/12', 'CRF450R/RX: 1 11/12 – 2 5/12'), 'RX': ('1 11/12 – 2 5/12', 'CRF450R/RX: 1 11/12 – 2 5/12')},
   lsc={'R': ('12', 'CRF450R: 12 clicks'), 'RX': ('9', 'CRF450RX: 9 clicks')},
   reb={'R': ('6–9', 'CRF450R/RWE: 6 – 9 clicks'), 'RX': ('8–11', 'CRF450RX: 8 – 11 clicks')},
   sil={'R': ('231', 'Standard: 231 mm (9.1 in)'), 'RX': ('227.9', 'Standard: 227.9 mm (8.97 in)')}, sag=SAG_A),
 'h22_450': dict(plug='NGK SILMAR10A-9S', plug_needle='Standard: SILMAR10A-9S (NGK)', rx_chain='RK 520EXU-120LJFZ', rx_chain_needle='RK: 520EXU-120LJFZ',
   r_springs=(('4.8', '5.0', '5.2'), ('52', '54', '56')), rx_springs=(('4.6', '4.8', '5.0'), ('48', '50', '52')),
   forkoil={'R': ('412', '380', '326'), 'RX': ('409', '380', '322')},
   fc={'R': ('10', 'CRF450R: 10 clicks'), 'RX': ('11', 'CRF450RX: 11 clicks')},
   fr={'R': ('13', 'CRF450R/RX: 13 clicks'), 'RX': ('13', 'CRF450R/RX: 13 clicks')},
   hsc={'R': ('1 11/12 – 2 5/12', 'CRF450R: 1 11/12 – 2 5/12'), 'RX': ('2 7/12 – 3 1/12', 'CRF450RX: 2 7/12 – 3 1/12')},
   lsc={'R': ('6', 'CRF450R: 6 clicks'), 'RX': ('7', 'CRF450RX: 7 clicks')},
   reb={'R': ('10–13', 'CRF450R: 10 – 13 clicks'), 'RX': ('12–15', 'CRF450RX: 12 – 15 clicks')},
   sil={'R': ('229.8', 'Standard: 229.8 mm (9.04 in)'), 'RX': ('227.5', 'Standard: 227.5 mm (8.96 in)')}, sag=SAG_A),
 'h24_450': dict(plug='NGK SILMAR9A-9S', plug_needle='SILMAR9A-9S (NGK)', rx_chain='RK 520EXU-120-LJFZ', rx_chain_needle='RK: 520EXU-120-LJFZ',
   r_springs=(('4.8', '5.0', '5.2'), ('54', '56', '58')), rx_springs=(('4.6', '4.8', '5.0'), ('48', '50', '52')),
   forkoil={'R': ('412', '387', '326'), 'RX': ('409', '396', '322')},
   fc={'R': ('10', 'CRF450R: 10 clicks'), 'RX': ('11', 'CRF450RX: 11 clicks')},
   fr={'R': ('13', 'CRF450R/RWE: 13 clicks'), 'RX': ('14', 'CRF450RX: 14 clicks')},
   hsc={'R': ('1 11/12 – 2 5/12', 'CRF450R: 1 11/12 – 2 5/12'), 'RX': ('2 1/12 – 2 7/12', 'CRF450RX: 2 1/12 – 2 7/12')},
   lsc={'R': ('6', 'CRF450R: 6 clicks'), 'RX': ('7', 'CRF450RX: 7 clicks')},
   reb={'R': ('11–14', 'CRF450R: 11 – 14 clicks'), 'RX': ('13–16', 'CRF450RX: 13 – 16 clicks')}, reb_kind='clicks',
   sil={'R': ('232.3', 'Standard: 232.3 mm (9.15 in)'), 'RX': ('227.4', 'Standard: 227.4 mm (8.95 in)')}, sag=SAG_A),
}

def doc_250_classic(D, c):
    """2022/2024 CRF250R/RX handbooks share one page layout."""
    torques(D)
    table_rows(D, 60, 'CYLINDER/PISTON SPECIFICATIONS', ENGINE)
    table_rows(D, 80, 'CLUTCH SPECIFICATIONS', CLUTCH_250, depth=False)
    common_rules(D, 60, 80, None)
    tires(D, 103)
    put(D, 'R,RX', 'Spark plug / Specified type', 'NGK SILMAR9A-9S', None, 'specification', 44, needle='SILMAR9A-9S (NGK)', scope='shared')
    put(D, 'R,RX', 'Valve clearance / Intake', '0.10 ± 0.03', 'mm', 'valve_clearance', 46, needle='0.10 ± 0.03 mm (0.004 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Valve clearance / Exhaust', '0.20 ± 0.03', 'mm', 'valve_clearance', 46, needle='0.20 ± 0.03 mm (0.008 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil / Viscosity', 'SAE 10W-30', None, 'engine_oil', 55, needle='Viscosity: SAE 10W-30', scope='shared')
    put(D, 'R,RX', 'Engine oil capacity / At draining', '1.05', 'L', 'oil_capacity', 55, needle='1.05 liters (1.11 US qt, 0.92 Imp qt) at draining', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil capacity / At disassembly', '1.35', 'L', 'oil_capacity', 55, needle='1.35 liters (1.43 US qt, 1.19 Imp qt) at disassembly', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine idle speed', '2,000 ± 100', 'rpm', 'idle_speed', 56, needle='IDLE SPEED: 2,000 ± 100 rpm', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Coolant / Standard concentration', '1:1 mixture with distilled water', None, 'coolant', 65, scope='shared')
    put(D, 'R,RX', 'Coolant capacity / At change', '1.04', 'L', 'coolant', 65, needle=['at change:', '1.04 liters (1.10 US qt, 0.92 Imp qt)'], scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Coolant capacity / At disassembly', '1.15', 'L', 'coolant', 65, needle='1.15 liters (1.22 US qt, 1.01 Imp qt)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Throttle grip / Freeplay', '2 – 6', 'mm', 'specification', 40, needle='FREEPLAY: 2 – 6 mm (1/16 – 1/4 in)', scope='shared', extra=['proc'])
    put(D, 'RX', 'Drive chain / Slack', '65–70', 'mm', 'drive_chain', 71, needle='STANDARD: 65 – 70 mm (2 1/2 – 2 3/4 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Inner plate height — service limit', '13.3', 'mm', 'drive_chain', 72, needle='SERVICE LIMIT: 13.3 mm (0.52 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Standard links', '114', 'links', 'drive_chain', 73, needle='STANDARD LINKS: 114 LINKS')
    put(D, 'RX', 'Drive chain / Replacement chain', 'DID 520MXV5-114ZB', None, 'drive_chain', 73, needle='REPLACEMENT CHAIN:DID520MXV5-114ZB')
    put(D, 'RX', 'Final drive / Standard driven sprocket', '50T (aluminum), 114-link chain', None, 'drive_chain', 108, needle='50T (Aluminum)/114', extra=['sprocket'])
    springs(D, 108, 'RX', ('4.4', '4.6', '4.8'), ('46', '48', '50'))
    put(D, 'R,RX', 'Fork / Damper filling oil capacity', '248', 'cm3', 'suspension_setting', 93, needle='248 cm3 (8.4 US oz, 8.7 Imp oz)', scope='shared', extra=['damper'])
    put(D, 'RX', 'Fork / Oil capacity / Standard (standard spring)', '380', 'cm3', 'suspension_setting', 112, needle='380 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Maximum (standard spring)', '415', 'cm3', 'suspension_setting', 112, needle='415 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Minimum (standard spring)', '328', 'cm3', 'suspension_setting', 112, needle='328 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Compression damping adjuster / Standard position', '13', 'clicks', 'suspension_setting', 111, needle='CRF250RX: 13 clicks', extra=['clicks'])
    put(D, 'RX', 'Fork / Rebound damping adjuster / Standard position', '13', 'clicks', 'suspension_setting', 111, needle='CRF250RX: 13 clicks', extra=['clicks'])
    put(D, 'RX', 'Shock / High speed compression damping adjuster / Standard position', '2 2/6', 'turns', 'suspension_setting', 113, needle='CRF250RX: 2 2/6', extra=['turns_mark'])
    put(D, 'RX', 'Shock / Low speed compression damping adjuster / Standard position', '8', 'clicks', 'suspension_setting', 114, needle='CRF250RX: 8 clicks', extra=['clicks'])
    put(D, 'RX', 'Shock / Rebound damping adjuster / Standard position', '13', 'clicks', 'suspension_setting', 114, needle='CRF250RX: 13 clicks', extra=['clicks'])
    put(D, 'RX', 'Shock / Race sag / Standard (standard spring)', '105', 'mm', 'race_sag', 115, needle=SAG_B[0], scope='shared', extra=['sag'])
    put(D, 'RX', 'Shock / Race sag / Standard (optional soft spring)', '110–115', 'mm', 'race_sag', 115, needle=SAG_B[1], scope='shared', extra=['sag'])
    put(D, 'RX', 'Shock / Race sag / Standard (optional stiff spring)', '95–100', 'mm', 'race_sag', 115, needle=SAG_B[2], scope='shared', extra=['sag'])
    put(D, 'RX', 'Shock / Spring install length / Standard (standard spring)', '233.2', 'mm', 'spring_install_length', 116, needle='Standard: 233.2 mm (9.18 in)', extra=['sil'])
    schedule(D, 29, 'RX', sched_items(drop=('Clutch fluid',)), ['CRF250RX', 'about 3.5'])

def doc_250_new(D, c):
    """2025/2026/2027 CRF250R/RX handbooks share one page layout; c holds the per-model settings."""
    torques(D)
    table_rows(D, 63, 'CYLINDER/PISTON SPECIFICATIONS', ENGINE)
    table_rows(D, 85, 'CLUTCH SPECIFICATIONS', CLUTCH_250, depth=False)
    common_rules(D, 63, 85, None)
    tires(D, 109)
    S = 'R,RX'
    put(D, S, 'Spark plug / Specified type', 'NGK SILMAR9A-9S', None, 'specification', 47, needle='SILMAR9A-9S (NGK)', scope='shared')
    put(D, S, 'Valve clearance / Intake', '0.10 ± 0.03', 'mm', 'valve_clearance', 49, needle='0.10 ± 0.03 mm (0.004 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, S, 'Valve clearance / Exhaust', '0.20 ± 0.03', 'mm', 'valve_clearance', 49, needle='0.20 ± 0.03 mm (0.008 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, S, 'Engine oil / Viscosity', 'SAE 10W-30', None, 'engine_oil', 58, needle='Viscosity: SAE 10W-30', scope='shared')
    put(D, S, 'Engine oil capacity / At draining', '1.05', 'L', 'oil_capacity', 58, needle='1.05 liters (1.11 US qt, 0.92 Imp qt) at draining', scope='shared', extra=['proc'])
    put(D, S, 'Engine oil capacity / At disassembly', '1.35', 'L', 'oil_capacity', 58, needle='1.35 liters (1.43 US qt, 1.19 Imp qt) at disassembly', scope='shared', extra=['proc'])
    put(D, S, 'Engine idle speed', '2,000 ± 100', 'rpm', 'idle_speed', 59, needle='IDLE SPEED: 2,000 ± 100 rpm', scope='shared', extra=['proc'])
    put(D, S, 'Coolant / Standard concentration', '1:1 mixture with distilled water', None, 'coolant', 68, scope='shared')
    put(D, S, 'Coolant capacity / At change', '1.04', 'L', 'coolant', 68, needle='1.04 liters (1.10 US qt, 0.92 Imp qt)', scope='shared', extra=['proc'])
    put(D, S, 'Coolant capacity / At disassembly', '1.15', 'L', 'coolant', 68, needle='1.15 liters (1.22 US qt, 1.01 Imp qt)', scope='shared', extra=['proc'])
    put(D, S, 'Throttle grip / Freeplay', '2 – 6', 'mm', 'specification', 43, needle='FREEPLAY: 2 – 6 mm (1/16 – 1/4 in)', scope='shared', extra=['proc'])
    put(D, S, 'Fork / Damper filling oil capacity', '248', 'cm3', 'suspension_setting', 98, needle='248 cm3 (8.4 US oz, 8.7 Imp oz)', scope='shared', extra=['damper'])
    put(D, S, 'Shock / Race sag / Standard (standard spring)', '100', 'mm', 'race_sag', 123, needle='Standard Race Sag (Standard spring): 100 mm (3.9 in)', scope='shared', extra=['sag'])
    put(D, S, 'Shock / Race sag / Standard (optional soft spring)', '105–110', 'mm', 'race_sag', 123, needle='Standard Race Sag (Soft spring): 105 – 110 mm (4.1 – 4.3 in)', scope='shared', extra=['sag'])
    put(D, S, 'Shock / Race sag / Standard (optional stiff spring)', '90–95', 'mm', 'race_sag', 123, needle='Standard Race Sag (Stiff spring): 90 – 95 mm (3.5 – 3.7 in)', scope='shared', extra=['sag'])
    # RX
    put(D, 'RX', 'Drive chain / Slack', '65–70', 'mm', 'drive_chain', 74, needle='STANDARD: 65 – 70 mm (2 1/2 – 2 3/4 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Inner plate height — service limit', '13.3', 'mm', 'drive_chain', 75, needle='SERVICE LIMIT: 13.3 mm (0.52 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Standard links', '114', 'links', 'drive_chain', 76, needle='STANDARD LINKS: 114 LINKS')
    put(D, 'RX', 'Drive chain / Replacement chain', 'DID 520MXV5-114ZB', None, 'drive_chain', 76, needle='REPLACEMENT CHAIN:DID 520MXV5-114ZB')
    put(D, 'RX', 'Final drive / Standard driven sprocket', '50T (aluminum), 114-link chain', None, 'drive_chain', 114, needle='50T (Aluminum)/114', extra=['sprocket'])
    springs(D, 114, 'RX', ('4.4', '4.6', '4.8'), ('46', '48', '50'))
    # R (only emitted where the R is a target of this document)
    put(D, 'R', 'Drive chain / Slack', '65–70', 'mm', 'drive_chain', 71, needle='STANDARD: 65 – 70 mm (2 1/2 – 2 3/4 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / Inner plate height — service limit', '12.0', 'mm', 'drive_chain', 72, needle='SERVICE LIMIT: 12.0 mm (0.47 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / 17-pin (16-pitch) length — service limit', '257', 'mm', 'drive_chain', 72, needle='SERVICE LIMIT: 257 mm (10.1 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / Standard links', '114', 'links', 'drive_chain', 73, needle='STANDARD LINKS: 114 LINKS')
    put(D, 'R', 'Drive chain / Replacement chain', 'DID 520DMS-114RB', None, 'drive_chain', 73, needle='CRF250R: DID 520DMS-114RB')
    put(D, 'R', 'Final drive / Standard driven sprocket', '50T (aluminum), 114-link chain', None, 'drive_chain', 113, needle='50T (Aluminum)/114', extra=['sprocket'])
    springs(D, 113, 'R', ('4.6', '4.8', '5.0'), ('48', '50', '52'))
    for m in ('R', 'RX'):
        if 'CRF250' + m not in _models_for(D): continue
        v = c[m]; name = 'CRF250' + m
        put(D, m, 'Fork / Oil capacity / Standard (standard spring)', v['oil'][1], 'cm3', 'suspension_setting', 120, needle=f"{v['oil'][1]} cm3", extra=['forkoil'])
        put(D, m, 'Fork / Oil capacity / Maximum (standard spring)', v['oil'][0], 'cm3', 'suspension_setting', 120, needle=f"{v['oil'][0]} cm3", extra=['forkoil'])
        put(D, m, 'Fork / Oil capacity / Minimum (standard spring)', v['oil'][2], 'cm3', 'suspension_setting', 120, needle=f"{v['oil'][2]} cm3", extra=['forkoil'])
        put(D, m, 'Fork / Compression damping adjuster / Standard position', v['fc'], 'clicks', 'suspension_setting', 118, needle=f"{name}: {v['fc']} clicks", extra=['clicks'])
        put(D, m, 'Fork / Rebound damping adjuster / Standard position', v['fr'], 'clicks', 'suspension_setting', 119, needle=f"{name}: {v['fr']} clicks", extra=['clicks'])
        put(D, m, 'Shock / High speed compression damping adjuster / Standard position', v['hsc'], 'turns', 'suspension_setting', 121, needle=f"{name}: {v['hsc']}", extra=['turns'])
        put(D, m, 'Shock / Low speed compression damping adjuster / Standard position', v['lsc'], 'clicks', 'suspension_setting', 122, needle=f"{name}: {v['lsc']} clicks", extra=['clicks'])
        put(D, m, 'Shock / Rebound damping adjuster / Standard position', v['reb'], 'clicks', 'suspension_setting', 122, needle=f"{name}: {v['reb']} clicks", extra=['clicks'])
        put(D, m, 'Shock / Spring install length / Standard (standard spring)', v['sil'], 'mm', 'spring_install_length', 124, needle=f"Standard: {v['sil']} mm", extra=['sil'])
    items = sched_items(drop=('Clutch fluid',))
    schedule(D, 30, 'R', [i for i in items if i[0] != 'Sidestand'], ['about 2.5'])
    schedule(D, 31, 'RX', items, ['CRF250RX', 'about 3.5'])

RX250_2526 = dict(oil=('403', '329', '317'), fc='10', fr='14', hsc='2 1/3', lsc='10', reb='15', sil='234.6')
CFG_250_NEW = {
 'h25_250': {'RX': RX250_2526}, 'h26_250': {'RX': RX250_2526},
 'h27_250': {'R': dict(oil=('394', '328', '309'), fc='10', fr='15', hsc='1 1/2', lsc='7', reb='7', sil='237.0'),
             'RX': dict(oil=('403', '337', '317'), fc='12', fr='14', hsc='2 1/3', lsc='10', reb='15', sil='234.6')},
}

def doc_450_new(D):
    """2025/2026 CRF450R/RX/RWE handbooks (identical values); RX targets only."""
    torques(D)
    table_rows(D, 55, 'CYLINDER/PISTON SPECIFICATIONS', ENGINE)
    table_rows(D, 78, 'CLUTCH SPECIFICATIONS', CLUTCH_450, depth=False)
    common_rules(D, 55, 78, None)
    tires(D, 102)
    S = 'R,RX'
    put(D, S, 'Spark plug / Specified type', 'NGK SILMAR9A-9S', None, 'specification', 43, needle='SILMAR9A-9S (NGK)', scope='shared')
    put(D, S, 'Valve clearance / Intake', '0.13 ± 0.03', 'mm', 'valve_clearance', 44, needle='0.13 ± 0.03 mm (0.005 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, S, 'Valve clearance / Exhaust', '0.28 ± 0.03', 'mm', 'valve_clearance', 45, needle='0.28 ± 0.03 mm (0.011 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, S, 'Engine oil / Viscosity', 'SAE 10W-30', None, 'engine_oil', 50, needle='Viscosity: SAE 10W-30', scope='shared')
    put(D, S, 'Engine oil capacity / At draining', '1.00', 'L', 'oil_capacity', 50, needle='1.00 liter (1.06 US qt, 0.88 Imp qt) at draining', scope='shared', extra=['proc'])
    put(D, S, 'Engine oil capacity / At oil filter change', '1.04', 'L', 'oil_capacity', 50, needle='1.04 liters (1.10 US qt, 0.92 Imp qt) at oil filter change', scope='shared', extra=['proc'])
    put(D, S, 'Engine oil capacity / At disassembly', '1.35', 'L', 'oil_capacity', 50, needle='1.35 liters (1.43 US qt, 1.19 Imp qt) at disassembly', scope='shared', extra=['proc'])
    put(D, S, 'Engine idle speed', '2,000 ± 100', 'rpm', 'idle_speed', 51, needle='IDLE SPEED: 2,000 ± 100 rpm', scope='shared', extra=['proc'])
    put(D, S, 'Coolant / Standard concentration', '1:1 mixture with distilled water', None, 'coolant', 62, scope='shared')
    put(D, S, 'Coolant capacity / At change', '1.08', 'L', 'coolant', 62, needle=['at change:', '1.08 liters (1.14 US qt, 0.95 Imp qt)'], scope='shared', extra=['proc'])
    put(D, S, 'Coolant capacity / At disassembly', '1.14', 'L', 'coolant', 62, needle=['at disassembly:', '1.14 liters (1.20 US qt, 1.00 Imp qt)'], scope='shared', extra=['proc'])
    put(D, S, 'Throttle grip / Freeplay', '2 – 6', 'mm', 'specification', 39, needle='FREEPLAY: 2 – 6 mm (1/16 – 1/4 in)', scope='shared', extra=['proc'])
    put(D, S, 'Fork / Damper filling oil capacity', '248', 'cm3', 'suspension_setting', 91, needle='248 cm3 (8.4 US oz, 8.7 Imp oz)', scope='shared', extra=['damper'])
    put(D, S, 'Shock / Race sag / Standard (standard spring)', '100', 'mm', 'race_sag', 114, needle=['Standard Race Sag (Standard spring):', '100 mm (3.9 in)'], scope='shared', extra=['sag'])
    put(D, S, 'Shock / Race sag / Standard (optional soft spring)', '105–110', 'mm', 'race_sag', 114, needle=['Standard Race Sag (Soft spring):', '105 – 110 mm (4.1 – 4.3 in)'], scope='shared', extra=['sag'])
    put(D, S, 'Shock / Race sag / Standard (optional stiff spring)', '90–95', 'mm', 'race_sag', 114, needle=['Standard Race Sag (Stiff spring):', '90 – 95 mm (3.5 – 3.7 in)'], scope='shared', extra=['sag'])
    put(D, 'RX', 'Drive chain / Slack', '65–70', 'mm', 'drive_chain', 68, needle='STANDARD: 65 – 70 mm (2 1/2 – 2 3/4 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Inner plate height — service limit', '13.5', 'mm', 'drive_chain', 69, needle='SERVICE LIMIT: 13.5 mm (0.53 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Standard links', '114', 'links', 'drive_chain', 70, needle='STANDARD LINKS: 114 LINKS')
    put(D, 'RX', 'Drive chain / Replacement chain', 'RK 520EXU-120-LJFZ', None, 'drive_chain', 106, needle='RK 520EXU-120-LJFZ')
    put(D, 'RX', 'Final drive / Standard driven sprocket', '50T (aluminum), 114-link chain', None, 'drive_chain', 106, needle='50T (Aluminum)/114', extra=['sprocket'])
    springs(D, 106, 'RX', ('4.6', '4.8', '5.0'), ('48', '50', '52'))
    put(D, 'RX', 'Fork / Oil capacity / Standard (standard spring)', '327', 'cm3', 'suspension_setting', 111, needle='327 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Maximum (standard spring)', '375', 'cm3', 'suspension_setting', 111, needle='375 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Minimum (standard spring)', '289', 'cm3', 'suspension_setting', 111, needle='289 cm3', extra=['forkoil'])
    put(D, 'RX', 'Fork / Compression damping adjuster / Standard position', '9', 'clicks', 'suspension_setting', 109, needle='CRF450RX: 9 clicks', extra=['clicks'])
    put(D, 'RX', 'Fork / Rebound damping adjuster / Standard position', '14', 'clicks', 'suspension_setting', 110, needle='CRF450RX: 14 clicks', extra=['clicks'])
    put(D, 'RX', 'Shock / High speed compression damping adjuster / Standard position', '2 2/12', 'turns', 'suspension_setting', 112, needle='CRF450RX: 2 2/12', extra=['turns'])
    put(D, 'RX', 'Shock / Low speed compression damping adjuster / Standard position', '9', 'clicks', 'suspension_setting', 113, needle='CRF450RX: 9 clicks', extra=['clicks'])
    put(D, 'RX', 'Shock / Rebound damping adjuster / Standard position', '13–16', 'clicks', 'suspension_setting', 113, needle='CRF450RX: 13 – 16 clicks', extra=['clicks'])
    put(D, 'RX', 'Shock / Spring install length / Standard (standard spring)', '231.0', 'mm', 'spring_install_length', 115, needle='Standard: 231.0 mm (9.09 in)', extra=['sil'])
    schedule(D, 28, 'RX', sched_items(), ['CRF450RX', 'about 3.5'])

def doc_h27_450():
    D = 'h27_450'
    torques(D)
    table_rows(D, 52, 'CYLINDER/PISTON SPECIFICATIONS', ENGINE)
    put(D, 'R,RX', 'Clutch thickness (discs and plates as a set) — service limit', '32.8', 'mm', 'clearance_wear_limit', 75, needle='SERVICE LIMIT: 32.8 mm (1.29 in)', scope='shared', extra=['dim', 'Measured as a set of clutch friction discs and clutch plates, per the procedure on the cited page.'])
    put(D, 'R,RX', 'Clutch plate warpage — service limit', '0.15', 'mm', 'clearance_wear_limit', 75, needle='SERVICE LIMIT: 0.15 mm (0.006 in) maximum', scope='shared', extra=['dim'])
    common_rules(D, 52, 75, None)
    tires(D, 101)
    put(D, 'R,RX', 'Spark plug / Specified type', 'NGK SILMAR9A-9S', None, 'specification', 39, needle='SILMAR9A-9S (NGK)', scope='shared')
    put(D, 'R,RX', 'Valve clearance / Intake', '0.13 ± 0.03', 'mm', 'valve_clearance', 41, needle='0.13 ± 0.03 mm (0.005 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Valve clearance / Exhaust', '0.24 ± 0.03', 'mm', 'valve_clearance', 41, needle='0.24 ± 0.03 mm (0.009 ± 0.001 in)', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil / Viscosity', 'SAE 10W-30', None, 'engine_oil', 47, needle='Viscosity: SAE 10W-30', scope='shared')
    put(D, 'R,RX', 'Engine oil capacity / At draining', '1.07', 'L', 'oil_capacity', 47, needle='1.07 liters (1.13 US qt, 0.94 Imp qt) at draining', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil capacity / At oil filter change', '1.10', 'L', 'oil_capacity', 47, needle='1.10 liters (1.16 US qt, 0.97 Imp qt) at oil filter change', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine oil capacity / At disassembly', '1.30', 'L', 'oil_capacity', 47, needle='1.30 liters (1.37 US qt, 1.14 Imp qt) at disassembly', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Engine idle speed', '2,000 ± 100', 'rpm', 'idle_speed', 48, needle='IDLE SPEED: 2,000 ± 100 rpm', scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Coolant / Standard concentration', '1:1 mixture with distilled water', None, 'coolant', 58, scope='shared')
    put(D, 'R,RX', 'Coolant capacity / At change', '1.08', 'L', 'coolant', 58, needle=['at change:', '1.08 liters (1.14 US qt, 0.95 Imp qt)'], scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Coolant capacity / At disassembly', '1.11', 'L', 'coolant', 58, needle=['at disassembly:', '1.11 liters (1.17 US qt, 0.98 Imp qt)'], scope='shared', extra=['proc'])
    put(D, 'R,RX', 'Throttle grip / Freeplay', '2 – 6', 'mm', 'specification', 36, needle='FREEPLAY: 2 – 6 mm (1/16 – 1/4 in)', scope='shared', extra=['proc'])
    put(D, 'R', 'Drive chain / Slack', '68–73', 'mm', 'drive_chain', 62, needle='STANDARD: 68 – 73 mm (2 11/16 – 2 7/8 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / Inner plate height — service limit', '14.0', 'mm', 'drive_chain', 63, needle='SERVICE LIMIT: 14.0 mm (0.55 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / 17-pin (16-pitch) length — service limit', '257', 'mm', 'drive_chain', 63, needle='SERVICE LIMIT: 257 mm (10.1 in)', extra=['proc'])
    put(D, 'R', 'Drive chain / Standard links', '116', 'links', 'drive_chain', 64, needle='STANDARD LINKS: 116 LINKS')
    put(D, 'R', 'Drive chain / Replacement chain', 'DID 520DM2-120RB', None, 'drive_chain', 64, needle='CRF450R: DID 520DM2-120RB')
    put(D, 'RX', 'Drive chain / Slack', '68–73', 'mm', 'drive_chain', 65, needle='STANDARD: 68 – 73 mm (2 11/16 – 2 7/8 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Inner plate height — service limit', '13.5', 'mm', 'drive_chain', 66, needle='SERVICE LIMIT: 13.5 mm (0.53 in)', extra=['proc'])
    put(D, 'RX', 'Drive chain / Standard links', '116', 'links', 'drive_chain', 67, needle='STANDARD LINKS: 116 LINKS')
    put(D, 'RX', 'Drive chain / Replacement chain', 'RK 520EXU-120-LJFZ', None, 'drive_chain', 67, needle='RK 520EXU-120-LJFZ')
    put(D, 'R', 'Final drive / Standard driven sprocket', '51T (aluminum), 116-link chain', None, 'drive_chain', 105, needle='51T (Aluminum)/116', extra=['sprocket'])
    put(D, 'RX', 'Final drive / Standard driven sprocket', '51T (aluminum), 116-link chain', None, 'drive_chain', 106, needle='51T (Aluminum)/116', extra=['sprocket'])
    springs(D, 105, 'R', ('5.0', '5.2', '5.4'), ('50', '52', '54'))
    springs(D, 106, 'RX', ('4.6', '4.8', '5.0'), ('48', '50', '52'))
    put(D, 'R,RX', 'Fork / Damper filling oil capacity', '248', 'cm3', 'suspension_setting', 90, needle='248 cm3 (8.4 US oz, 8.7 Imp oz)', scope='shared', extra=['damper'])
    for m, (mx, st, mn) in (('R', ('380', '324', '294')), ('RX', ('373', '304', '287'))):
        put(D, m, 'Fork / Oil capacity / Standard (standard spring)', st, 'cm3', 'suspension_setting', 111, needle=f'{st} cm3', extra=['forkoil'])
        put(D, m, 'Fork / Oil capacity / Maximum (standard spring)', mx, 'cm3', 'suspension_setting', 111, needle=f'{mx} cm3', extra=['forkoil'])
        put(D, m, 'Fork / Oil capacity / Minimum (standard spring)', mn, 'cm3', 'suspension_setting', 111, needle=f'{mn} cm3', extra=['forkoil'])
    for m, fc, fr, hsc, lsc, reb, sil in (('R', '11', '11', '2 1/6', '13', '7–10', ('231.2', 'Standard: 231.2 mm (9.10 in)')),
                                         ('RX', '12', '12', '2 6/12', '12', '11–14', ('231.3', 'Standard: 231.3 mm (9.11 in)'))):
        name = 'CRF450' + m
        put(D, m, 'Fork / Compression damping adjuster / Standard position', fc, 'clicks', 'suspension_setting', 109, needle=f'{name}: {fc} clicks', extra=['clicks'])
        put(D, m, 'Fork / Rebound damping adjuster / Standard position', fr, 'clicks', 'suspension_setting', 110, needle=f'{name}: {fr} clicks', extra=['clicks'])
        put(D, m, 'Shock / High speed compression damping adjuster / Standard position', hsc, 'turns', 'suspension_setting', 112, needle=f'{name}: {hsc}', extra=['turns'])
        put(D, m, 'Shock / Low speed compression damping adjuster / Standard position', lsc, 'clicks', 'suspension_setting', 113, needle=f'{name}: {lsc} clicks', extra=['clicks'])
        put(D, m, 'Shock / Rebound damping adjuster / Standard position', reb, 'clicks', 'suspension_setting', 113, needle=f"{name}: {reb.replace('–', ' – ')} clicks", extra=['clicks'])
        put(D, m, 'Shock / Spring install length / Standard (standard spring)', sil[0], 'mm', 'spring_install_length', 115, needle=sil[1], extra=['sil'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (standard spring)', '95', 'mm', 'race_sag', 114, needle='CRF450R/RX: 95 mm (3.7 in)', extra=['sag'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (optional soft spring)', '100–105', 'mm', 'race_sag', 114, needle='CRF450R/RX: 100 – 105 mm (3.9 – 4.1 in)', extra=['sag'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (optional stiff spring)', '85–90', 'mm', 'race_sag', 114, needle='CRF450R/RX: 85 – 90 mm (3.3 – 3.5 in)', extra=['sag'])
    rep = {'Spark plug': ('Spark plug', [('I', 3)], []), 'Engine idle speed': ('Engine idle speed', [('I', 1)], [4]),
           'Piston and piston rings': ('Piston and piston rings', [('R', 5)], []), 'Piston pin': ('Piston pin', [('R', 5)], [])}
    add = [('Crankshaft', [('I', 5)], []), ('Seal plate', [('I', 5)], []), ('Clutch center dampers', [('R', 3)], [])]
    items = sched_items(replace=rep, add=add)
    schedule(D, 27, 'R', [i for i in items if i[0] != 'Sidestand'], ['CRF450R/HRC-WE', 'CRANK SHAFT', 'CLUTCH CENTER DAMPERS'])
    schedule(D, 28, 'RX', items, ['CRF450RX', 'CRANK SHAFT', 'CLUTCH CENTER DAMPERS', 'about 3.5'])

# ---------------------------------------------------------------- owner's manuals (RX rows of the specifications table)
def om_doc(D, spec, sched_pages, tank_page, extra_items=(), supplement=True):
    """spec: list of (joint, value, unit, page, needle, prop). supplement: only rows the handbook does not print."""
    for joint, value, unit, page, needle, prop in spec:
        if supplement and not (joint.startswith('Specifications /') or joint == 'Spark plug / Gap'):
            continue
        put(D, 'RX', joint, value, unit, prop, page, needle=needle, scope='labelled' if 'RX' in str(needle) else 'shared', extra=['om_spec'])
    if supplement:
        return
    items = sched_items(drop=extra_items)
    pages = {}
    for it in items:
        pages[it[0]] = sched_pages[0] if it[0] in OM_P1 else (sched_pages[1] if it[0] in OM_P2 else sched_pages[2])
    schedule(D, pages, 'RX', items, ['about 3.5 hours'], kind='om')

OM_P1 = {'Fuel line', 'Fuel pump filter', 'Throttle operation', 'Air filter', 'Crankcase breather', 'Spark plug',
         'Valve clearance/decompressor system', 'Engine oil', 'Engine oil filter', 'Engine idle speed'}
OM_P2 = {'Piston and piston rings', 'Piston pin', 'Radiator coolant', 'Cooling system', 'Drive chain', 'Drive chain slider',
         'Drive chain roller', 'Drive sprocket', 'Driven sprocket', 'Brake fluid', 'Brake pads wear', 'Brake system'}

def om_spec_rows(fam, P, d):
    """d: dict of values for the RX; P: pages (dim, frame, engine, cooling/drive, electrical)."""
    rows = []
    def r(j, v, u, pg, n, prop='specification'): rows.append((j, v, u, pg, n, prop))
    for j, k in (('Overall length', 'len'), ('Overall width', 'wid'), ('Overall height', 'hgt'), ('Wheelbase', 'wb'), ('Seat height', 'seat'),
                 ('Footpeg height', 'peg'), ('Minimum ground clearance', 'gc')):
        v, n = d[k]; r(f'Specifications / Dimensions / {j}', v, 'mm', P['dim'], n)
    r('Specifications / Dimensions / Caster angle', d['caster'][0], None, P['dim'], d['caster'][1])
    r('Specifications / Dimensions / Trail length', d['trail'][0], 'mm', P['trail'], d['trail'][1])
    r('Specifications / Frame / Front tire size', d['ftire'][0], None, P['frame'], d['ftire'][1])
    r('Specifications / Frame / Rear tire size', d['rtire'][0], None, P['frame'], d['rtire'][1])
    r('Specifications / Frame / Tire type', 'Bias-ply, tube', None, P['frame'], 'Bias-ply, tube')
    r('Specifications / Frame / Recommended front tire', d['frec'][0], None, P['frame'], d['frec'][1])
    r('Specifications / Frame / Recommended rear tire', d['rrec'][0], None, P['frame'], d['rrec'][1])
    r('Front tire pressure', '100', 'kPa', P['frame'], 'Front 15 psi (100 kPa, 1.0 kgf/cm2)', 'pressure')
    r('Rear tire pressure', '100', 'kPa', P['frame'], 'Rear 15 psi (100 kPa, 1.0 kgf/cm2)', 'pressure')
    r('Specifications / Fuel tank capacity', '8.0', 'L', P['frame'], 'CRF' + fam[3:] + 'RX 2.11 US gal (8.0 L)')
    r('Specifications / Engine / Bore x stroke', d['bore'][0], 'mm', P['engine'], d['bore'][1])
    r('Specifications / Engine / Displacement', d['disp'][0], 'cm3', P['engine'], d['disp'][1])
    r('Specifications / Engine / Compression ratio', d['cr'][0], None, P['engine'], d['cr'][1])
    r('Valve clearance / Intake', d['vin'][0], 'mm', P['engine'], d['vin'][1], 'valve_clearance')
    r('Valve clearance / Exhaust', d['vex'][0], 'mm', P['engine'], d['vex'][1], 'valve_clearance')
    r('Engine oil / Viscosity', 'SAE 10W-30', None, P['engine'], 'SAE 10W-30, JASO T 903 standard MA', 'engine_oil')
    r('Engine oil / Classification', 'API SJ or higher (not energy/resource conserving), JASO T 903 MA', None, P['engine'], ['API Service Classification SJ or higher', 'JASO T 903 standard MA'], 'engine_oil')
    r('Engine oil capacity / After draining', d['oil'][0][0], 'L', P['engine'], d['oil'][0][1], 'oil_capacity')
    r('Engine oil capacity / After draining and oil filter change', d['oil'][1][0], 'L', P['engine'], d['oil'][1][1], 'oil_capacity')
    r('Engine oil capacity / After disassembly', d['oil'][2][0], 'L', P['engine'], d['oil'][2][1], 'oil_capacity')
    r('Engine idle speed', '2,000 ± 100', 'rpm', P['engine'], 'Idle speed 2,000 ± 100 rpm', 'idle_speed')
    r('Coolant / Recommended coolant', 'Pro Honda HP Coolant', None, P['cool'], 'Pro Honda HP Coolant', 'coolant')
    r('Coolant capacity / After draining', d['cool'][0][0], 'L', P['cool'], d['cool'][0][1], 'coolant')
    r('Coolant capacity / After disassembly', d['cool'][1][0], 'L', P['cool'], d['cool'][1][1], 'coolant')
    r('Specifications / Drive train / Primary reduction', d['prim'][0], None, P['drive'], d['prim'][1])
    for g, (v, n) in zip(('1st', '2nd', '3rd', '4th', '5th'), d['gears']):
        r(f'Specifications / Drive train / Gear ratio {g}', v, None, P['drive'], n)
    r('Specifications / Drive train / Final reduction', d['final'][0], None, P['drive'], d['final'][1])
    r('Specifications / Drive train / Gear shift pattern', 'Left foot-operated return system, 1-N-2-3-4-5', None, P['drive'], ['Left foot-operated return system', '1-N-2-3-4-5'])
    r('Specifications / Electrical / Battery', d['batt'][0], None, P['elec'], d['batt'][1])
    r('Spark plug / Specified type', d['plug'][0], None, P['elec'], d['plug'][1])
    r('Spark plug / Gap', d['gap'][0], 'mm', P['elec'], d['gap'][1])
    r('Specifications / Electrical / Main fuse', '10', 'A', P['elec'], 'Main fuse 10 A')
    for j, v, n in d['torques']:
        r(j, v, 'N·m', P['elec'], n, 'torque')
    return rows

def doc_oms():
    # 2023 CRF250R/RX
    d = dict(len=('2,176', 'CRF250RX 85.7 in (2,176 mm)'), wid=('839', 'CRF250RX 33.0 in (839 mm)'), hgt=('1,281', 'CRF250RX 50.4 in (1,281 mm)'),
             wb=('1,477', 'Wheelbase 58.1 in (1,477 mm)'), seat=('964', 'CRF250RX 38.0 in (964 mm)'), peg=('429', 'CRF250RX 16.9 in (429 mm)'),
             gc=('335', 'CRF250RX 13.2 in (335 mm)'), caster=("27°9'", "CRF250RX 27°9'"), trail=('114', 'CRF250RX 4.5 in (114 mm)'),
             ftire=('90/90-21 54M', 'CRF250RX 90/90-21 54M'), rtire=('110/100-18 64M', 'CRF250RX 110/100-18 64M'),
             frec=('DUNLOP AT81F', 'CRF250RX DUNLOP AT81F'), rrec=('DUNLOP AT81', 'CRF250RX DUNLOP AT81'),
             bore=('79.000 x 50.887', '(79.000 x 50.887 mm)'), disp=('249.43', '(249.43 cm3)'), cr=('13.9:1', '13.9 : 1'),
             vin=('0.10 ± 0.03', '(0.10 ± 0.03'), vex=('0.20 ± 0.03', '(0.20 ± 0.03'),
             oil=(('1.05', 'After draining 1.11 US qt (1.05 L)'), ('1.08', '1.14 US qt (1.08 L)'), ('1.35', '1.43 US qt (1.35 L)')),
             cool=(('1.04', 'After draining 1.10 US qt (1.04 L)'), ('1.15', '1.22 US qt (1.15 L)')),
             prim=('3.047', 'Primary reduction 3.047'), gears=[('2.384', '1st 2.384'), ('1.933', '2nd 1.933'), ('1.600', '3rd 1.600'), ('1.350', '4th 1.350'), ('1.153', '5th 1.153')],
             final=('3.846', 'Final reduction 3.846'), batt=('HY85S lithium-ion, 12 V 2 Ah (20 HR)', ['HY85S lithium-ion (li-ion)', '12 V-2 Ah (20 HR)']),
             plug=('NGK SILMAR9A9S', 'Spark plug NGK SILMAR9A9S'), gap=('0.8 - 0.9', '(0.8 - 0.9 mm)'),
             torques=[('Fork air pressure release screw', '1.3', '(1.3 N·m, 0.1 kgf·m)'), ('Battery terminal bolt', '2.0', 'Battery terminal bolt 1.5 lbf·ft (2.0 N·m, 0.2 kgf·m)'),
                      ('Battery lid bolt', '5.2', 'Battery lid bolt 3.8 lbf·ft (5.2 N·m, 0.5 kgf·m)')])
    P = dict(dim=75, trail=75, frame=75, engine=76, cool=76, drive=76, elec=77)
    om_doc('o23_250', om_spec_rows('CRF250', P, d), (40, 41, 42), 75, extra_items=('Clutch fluid',))
    # 2023 CRF450R/RX/RWE
    d450 = lambda **k: k
    d = dict(len=('2,174', 'CRF450RX 85.6 in (2,174 mm)'), wid=('839', 'CRF450RX 33.0 in (839 mm)'), hgt=('1,280', 'CRF450RX 50.4 in (1,280 mm)'),
             wb=('1,477', 'CRF450RX 58.1 in (1,477 mm)'), seat=('961', 'CRF450RX 37.8 in (961 mm)'), peg=('427', 'CRF450RX 16.8 in (427 mm)'),
             gc=('334', 'CRF450RX 13.1 in (334 mm)'), caster=("27°18'", "CRF450RX 27°18'"), trail=('115', 'CRF450RX 4.5 in (115 mm)'),
             ftire=('90/90-21 54M', 'CRF450RX 90/90-21 54M'), rtire=('120/90-18 65M', 'CRF450RX 120/90-18 65M'),
             frec=('DUNLOP AT81F', 'CRF450RX DUNLOP AT81F'), rrec=('DUNLOP AT81', 'CRF450RX DUNLOP AT81'),
             bore=('96.000 x 62.138', '(96.000 x 62.138 mm)'), disp=('449.77', '(449.77 cm3)'), cr=('13.5:1', '13.5 : 1'),
             vin=('0.13 ± 0.03', '(0.13 ± 0.03'), vex=('0.28 ± 0.03', '(0.28 ± 0.03'),
             oil=(('1.00', 'After draining 1.06 US qt (1.00 L)'), ('1.04', '1.10 US qt (1.04 L)'), ('1.35', '1.43 US qt (1.35 L)')),
             cool=(('1.08', '1.14 US qt (1.08 L)'), ('1.14', '1.20 US qt (1.14 L)')),
             prim=('2.357', 'Primary reduction 2.357'), gears=[('2.133', '1st 2.133'), ('1.706', '2nd 1.706'), ('1.421', '3rd 1.421'), ('1.211', '4th 1.211'), ('1.043', '5th 1.043')],
             final=('3.846', 'CRF450RX 3.846'), batt=('HY85S lithium-ion, 12 V 2.0 Ah (20 HR)', ['HY85S lithium-ion (li-ion)', '12 V-2.0 Ah (20 HR)']),
             plug=('NGK SILMAR9A-9S', 'NGK SILMAR9A-9S'), gap=('0.80 - 0.90', '(0.80 - 0.90 mm)'),
             torques=[('Fork air pressure release screw', '1.3', '(1.3 N·m, 0.1 kgf·m)'), ('Battery bolt', '2', 'Battery bolt 1.5 lbf·ft (2 N·m, 0.2 kgf·m)'),
                      ('Battery lid bolt', '5.2', 'Battery lid bolt 3.8 lbf·ft (5.2 N·m, 0.5 kgf·m)')])
    P = dict(dim=77, trail=77, frame=77, engine=78, cool=78, drive=78, elec=79)
    om_doc('o23_450', om_spec_rows('CRF450', P, d), (42, 43, 44), 77)
    # 2025 CRF250R/RX/RWE
    d = dict(len=('2,178', 'CRF250RX 85.7 in (2,178 mm)'), wid=('839', 'CRF250RX 33.0 in (839 mm)'), hgt=('1,278', 'CRF250RX 50.3 in (1,278 mm)'),
             wb=('1,478', 'CRF250RX 58.2 in (1,478 mm)'), seat=('958', 'CRF250RX 37.7 in (958 mm)'), peg=('424', 'CRF250RX 16.7 in (424 mm)'),
             gc=('331', 'CRF250RX 13.0 in (331 mm)'), caster=("27°26'", "CRF250RX 27°26'"), trail=('116', 'CRF250RX 4.6 in (116 mm)'),
             ftire=('90/90-21 54M', 'CRF250RX 90/90-21 54M'), rtire=('110/100-18 64M', 'CRF250RX 110/100-18 64M'),
             frec=('DUNLOP AT81F', 'CRF250RX DUNLOP AT81F'), rrec=('DUNLOP AT81', 'CRF250RX DUNLOP AT81'),
             bore=('79.000 x 50.887', '(79.000 x 50.887 mm)'), disp=('249.43', '(249.43 cm3)'), cr=('13.9:1', '13.9 : 1'),
             vin=('0.10 ± 0.03', '(0.10 ± 0.03'), vex=('0.20 ± 0.03', '(0.20 ± 0.03'),
             oil=(('1.05', 'After draining 1.11 US qt (1.05 L)'), ('1.08', '1.14 US qt (1.08 L)'), ('1.35', '1.43 US qt (1.35 L)')),
             cool=(('1.04', 'After draining 1.10 US qt (1.04 L)'), ('1.15', '1.22 US qt (1.15 L)')),
             prim=('3.047', 'Primary reduction 3.047'), gears=[('2.384', '1st 2.384'), ('1.933', '2nd 1.933'), ('1.600', '3rd 1.600'), ('1.350', '4th 1.350'), ('1.153', '5th 1.153')],
             final=('3.846', 'Final reduction 3.846'), batt=('HJ12L lithium-ion, 12 V 2.3 Ah (20 HR)', ['HJ12L lithium-ion (li-ion)', '12 V-2.3 Ah (20 HR)']),
             plug=('NGK SILMAR9A9S', 'Spark plug NGK SILMAR9A9S'), gap=('0.8 - 0.9', '(0.8 - 0.9 mm)'),
             torques=[('Fork air pressure release screw', '1.3', '(1.3 N·m, 0.1 kgf·m)'), ('Battery terminal bolt', '2.0', 'Battery terminal bolt 1.5 lbf·ft (2.0 N·m, 0.2 kgf·m)'),
                      ('Battery lid bolt', '5.2', 'Battery lid bolt 3.8 lbf·ft (5.2 N·m, 0.5 kgf·m)'), ('Left side cover bolt', '10', 'Left side cover bolt 7 lbf·ft (10 N·m, 1.0 kgf·m)')])
    P = dict(dim=78, trail=78, frame=79, engine=79, cool=80, drive=80, elec=80)
    om_doc('o25_250', om_spec_rows('CRF250', P, d), (42, 43, 44), 79, extra_items=('Clutch fluid',))
    # 2025 / 2026 CRF450R/RX/RWE (identical tables)
    for D in ('o25_450', 'o26_450'):
        d = dict(len=('2,175', 'CRF450RX 85.6 in (2,175 mm)'), wid=('839', 'CRF450RX 33.0 in (839 mm)'), hgt=('1,280', 'CRF450RX 50.4 in (1,280 mm)'),
                 wb=('1,478', 'CRF450RX 58.2 in (1,478 mm)'), seat=('958', 'CRF450RX 37.7 in (958 mm)'), peg=('424', 'CRF450RX 16.7 in (424 mm)'),
                 gc=('332', 'CRF450RX 13.1 in (332 mm)'), caster=("27°27'", "CRF450RX 27° 27'"), trail=('116', 'CRF450RX 4.6 in (116 mm)'),
                 ftire=('90/90-21 54M', 'CRF450RX 90/90-21 54M'), rtire=('120/90-18 65M', 'CRF450RX 120/90-18 65M'),
                 frec=('DUNLOP AT81F', 'CRF450RX DUNLOP AT81F'), rrec=('DUNLOP AT81', 'CRF450RX DUNLOP AT81'),
                 bore=('96.000 x 62.138', '(96.000 x 62.138 mm)'), disp=('449.77', '(449.77 cm3)'), cr=('13.5:1', '13.5 : 1'),
                 vin=('0.13 ± 0.03', '(0.13 ± 0.03'), vex=('0.28 ± 0.03', '(0.28 ± 0.03'),
                 oil=(('1.00', 'After draining 1.06 US qt (1.00 L)'), ('1.04', '1.10 US qt (1.04 L)'), ('1.35', '1.43 US qt (1.35 L)')),
                 cool=(('1.08', '1.14 US qt (1.08 L)'), ('1.14', '1.20 US qt (1.14 L)')),
                 prim=('2.357', 'Primary reduction 2.357'), gears=[('2.133', '1st 2.133'), ('1.705', '2nd 1.705'), ('1.421', '3rd 1.421'), ('1.210', '4th 1.210'), ('1.043', '5th 1.043')],
                 final=('3.846', 'CRF450RX 3.846'), batt=('HJ12L lithium-ion, 12 V 2.3 Ah (20 HR)', ['HJ12L lithium-ion (li-ion)', '12 V-2.3 Ah (20 HR)']),
                 plug=('NGK SILMAR9A-9S', 'NGK SILMAR9A-9S'), gap=('0.80 - 0.90', '(0.80 - 0.90 mm)'),
                 torques=[('Fork air pressure release screw', '1.3', '(1.3 N·m, 0.1 kgf·m)'), ('Battery bolt', '2', 'Battery bolt 1.5 lbf·ft (2 N·m, 0.2 kgf·m)'),
                          ('Battery lid bolt', '5.2', 'Battery lid bolt 3.8 lbf·ft (5.2 N·m, 0.5 kgf·m)'), ('Left side cover bolt', '10', 'Left side cover bolt 7 lbf·ft (10 N·m, 1.0 kgf·m)')])
        P = dict(dim=78, trail=78, frame=78, engine=79, cool=79, drive=79, elec=80)
        om_doc(D, om_spec_rows('CRF450', P, d), (42, 43, 44), 78)

# ---------------------------------------------------------------- 2020 owner's manuals (full-size manuals with setup data)
from om2020_torque import parse as parse_om_torque
def om_torques(D, first, last, drop_items=(), manual=()):
    fam = DOCS[D]['fam']
    rows = parse_om_torque(PAGES[D], first, last)
    for p in range(first, last + 1): USED_PAGES.setdefault(D, set()).add(p)
    for model in _models_for(D):
        seen = set()
        for r in rows:
            if r['no'] in drop_items and r['pdf_page'] == drop_items[r['no']]: continue
            if r['nm'] is None or re.match(r'^\d', r['name']): continue   # value-only line of a shared cell, handled in `manual`
            name = r['name']; tag = None
            m = re.search(r'\s*\((CRF[^)]*)\)\s*$', name)
            if m: tag = m.group(1); name = name[:m.start()].strip()
            if tag and not applies(tag, model): continue
            if name in seen: raise SystemExit(f'dup torque {D} {model} {name}')
            seen.add(name)
            conds = ([r['note_text']] if r['note_text'] else []) + ([f"Row labelled for the {model} in the owner's manual torque table."] if tag else []) + \
                    ['Use OEM installation procedure; torque alone is not a complete service instruction.']
            FACTS.setdefault((DOCS[D]['year'], model), []).append({'joint': name, 'value': r['nm'], 'unit': 'N·m', 'property': 'torque', 'conditions': conds,
                'pdf_page': r['pdf_page'], 'printed_page': printed_page(PAGES[D][r['pdf_page'] - 1], 'om'), 'manual_item_number': r['no'], '_doc': D})
    for models, joint, val, page, needle, cond in manual:
        put(D, models, joint, val, 'N·m', 'torque', page, needle=needle, extra=[cond, 'Use OEM installation procedure; torque alone is not a complete service instruction.'])

O20_SCHED_NOTE = "From this model's row of the 2020 owner's manual maintenance schedule"
def doc_o20():
    # ---------------- 2020 CRF250R/RX
    D = 'o20_250'; P = 180
    om_torques(D, 181, 183)
    sp = lambda models, j, v, u, needle, prop='specification', scope='labelled', page=P, extra=('om_spec',): put(D, models, j, v, u, prop, page, needle=needle, scope=scope, extra=list(extra))
    sp('R', 'Specifications / Dimensions / Overall length', '2,181', 'mm', '2,181 mm'); sp('RX', 'Specifications / Dimensions / Overall length', '2,185', 'mm', '2,185 mm')
    sp('R,RX', 'Specifications / Dimensions / Overall width', '827', 'mm', 'Overall width 32.6 in 827 mm', scope='shared')
    sp('R', 'Specifications / Dimensions / Overall height', '1,260', 'mm', '1,260 mm'); sp('RX', 'Specifications / Dimensions / Overall height', '1,262', 'mm', '1,262 mm')
    sp('R,RX', 'Specifications / Dimensions / Wheelbase', '1,486', 'mm', 'Wheelbase 58.5 in 1,486 mm', scope='shared')
    sp('R', 'Specifications / Dimensions / Seat height', '957', 'mm', '957 mm'); sp('RX', 'Specifications / Dimensions / Seat height', '961', 'mm', '961 mm')
    sp('R', 'Specifications / Dimensions / Footpeg height', '416', 'mm', '416 mm'); sp('RX', 'Specifications / Dimensions / Footpeg height', '419', 'mm', '419 mm')
    sp('R', 'Specifications / Dimensions / Ground clearance', '327', 'mm', '327 mm'); sp('RX', 'Specifications / Dimensions / Ground clearance', '329', 'mm', '329 mm')
    sp('R', 'Specifications / Dimensions / Caster angle', '27°29’', None, 'CRF250R: 27°29’'); sp('RX', 'Specifications / Dimensions / Caster angle', '27°18’', None, 'CRF250RX: 27°18’')
    sp('R', 'Specifications / Dimensions / Trail length', '116', 'mm', '116 mm'); sp('RX', 'Specifications / Dimensions / Trail length', '115', 'mm', '115 mm')
    sp('R', 'Specifications / Fuel tank capacity', '6.3', 'L', '6.3 ℓ'); sp('RX', 'Specifications / Fuel tank capacity', '8.5', 'L', '8.5 ℓ')
    sp('R', 'Fork / Oil capacity / Standard (standard spring)', '343', 'cm3', '343 cm3', prop='suspension_setting', extra=('om_spec', 'forkoil'))
    sp('RX', 'Fork / Oil capacity / Standard (standard spring)', '356', 'cm3', '356 cm3', prop='suspension_setting', extra=('om_spec', 'forkoil'))
    sp('R,RX', 'Fork / Damper oil capacity', '243', 'cm3', '243 cm3', prop='suspension_setting', scope='shared')
    sp('R,RX', 'Specifications / Frame / Front suspension travel', '268', 'mm', 'travel 10.6 in (268 mm)', scope='shared')
    sp('R,RX', 'Specifications / Frame / Front fork stroke', '305', 'mm', 'stroke 12.0 in (305 mm)', scope='shared')
    sp('R,RX', 'Specifications / Frame / Rear wheel travel', '317', 'mm', 'travel 12.5 in (317 mm)', scope='shared')
    sp('R', 'Specifications / Frame / Front tire size', '80/100-21 51M', None, 'CRF250R: 80/100-21 51M'); sp('RX', 'Specifications / Frame / Front tire size', '90/90-21 54M', None, 'CRF250RX: 90/90-21 54M')
    sp('R', 'Specifications / Frame / Rear tire size', '100/90-19 57M', None, 'CRF250R: 100/90-19 57M'); sp('RX', 'Specifications / Frame / Rear tire size', '110/100-18 64M', None, 'CRF250RX: 110/100-18 64M')
    sp('R', 'Specifications / Frame / Recommended front tire', 'DUNLOP MX3SF', None, ['DUNLOP', 'MX3SF']); sp('RX', 'Specifications / Frame / Recommended front tire', 'DUNLOP AT81F', None, ['DUNLOP', 'AT81F'])
    sp('R', 'Specifications / Frame / Recommended rear tire', 'DUNLOP MX3S', None, ['DUNLOP', 'MX3S ']); sp('RX', 'Specifications / Frame / Recommended rear tire', 'DUNLOP AT81', None, ['DUNLOP', 'AT81 '])
    sp('R,RX', 'Specifications / Frame / Tire type', 'Bias-ply, tube', None, 'bias-ply, tube', scope='shared')
    sp('R,RX', 'Front tire pressure', '100', 'kPa', 'Tire pressure, front 15 psi (100 kPa, 1.0 kgf/cm2)', prop='pressure', scope='shared', extra=('om_spec', 'tire'))
    sp('R,RX', 'Rear tire pressure', '100', 'kPa', 'Tire pressure, rear 15 psi (100 kPa, 1.0 kgf/cm2)', prop='pressure', scope='shared', extra=('om_spec', 'tire'))
    sp('R,RX', 'Specifications / Engine / Bore x stroke', '79.000 x 50.887', 'mm', ['79.000 x', '50.887 mm'], scope='shared')
    sp('R,RX', 'Specifications / Engine / Displacement', '249.43', 'cm3', '249.43 cm3', scope='shared')
    sp('R,RX', 'Specifications / Engine / Compression ratio', '13.9:1', None, '13.9 : 1', scope='shared')
    sp('R,RX', 'Valve clearance / Intake', '0.09 ± 0.03', 'mm', '(0.09 ± 0.03 mm)', prop='valve_clearance', scope='shared')
    sp('R,RX', 'Valve clearance / Exhaust', '0.19 ± 0.03', 'mm', '(0.19 ± 0.03 mm)', prop='valve_clearance', scope='shared')
    sp('R,RX', 'Engine oil capacity / After draining', '1.08', 'L', '1.14 US qt 1.08 ℓ', prop='oil_capacity', scope='shared')
    sp('R,RX', 'Engine oil capacity / After draining and oil filter change', '1.12', 'L', '1.18 US qt 1.12 ℓ', prop='oil_capacity', scope='shared')
    sp('R,RX', 'Engine oil capacity / After disassembly', '1.35', 'L', '1.43 US qt 1.35 ℓ', prop='oil_capacity', scope='shared')
    sp('R,RX', 'Engine idle speed', '2,000 ± 100', 'rpm', 'Idle speed 2,000 ± 100 rpm', prop='idle_speed', scope='shared')
    sp('R,RX', 'Coolant capacity / After draining', '0.94', 'L', '0.99 US qt 0.94 ℓ', prop='coolant', scope='shared')
    sp('R,RX', 'Coolant capacity / After disassembly', '1.09', 'L', '1.15 US qt 1.09 ℓ', prop='coolant', scope='shared')
    sp('R,RX', 'Specifications / Drive train / Primary reduction', '3.473', None, 'Primary reduction 3.473', scope='shared')
    for g, v in zip(('I', 'II', 'III', 'IV', 'V'), ('2.230', '1.750', '1.470', '1.227', '1.043')):
        sp('R,RX', f'Specifications / Drive train / Gear ratio {g}', v, None, f'Gear ratio {g} {v}', scope='shared')
    sp('R,RX', 'Specifications / Drive train / Final reduction', '3.692', None, 'Final reduction 3.692', scope='shared')
    sp('R,RX', 'Specifications / Electrical / Battery', 'HY85S lithium-ion, 12 V 2.0 Ah (20 HR)', None, ['HY85S lithium-ion (li-ion)', '12V-2.0 Ah (20HR)'], scope='shared')
    sp('R,RX', 'Spark plug / Specified type', 'NGK R0451B-9', None, 'NGK R0451B-9', scope='shared')
    sp('R,RX', 'Spark plug / Gap', '0.60 - 0.70', 'mm', '(0.60 – 0.70 mm)', scope='shared')
    sp('R,RX', 'Specifications / Electrical / Main fuse', '10', 'A', 'Main fuse 10 A', scope='shared')
    # suspension (pages 151-156) and optional parts list (page 187)
    put(D, 'R', 'Fork / Compression damping adjuster / Standard position', '9', 'clicks', 'suspension_setting', 151, needle=['(CRF250R)', 'The standard position is 9 clicks.'], extra=['clicks'])
    put(D, 'RX', 'Fork / Compression damping adjuster / Standard position', '12', 'clicks', 'suspension_setting', 151, needle=['(CRF250RX)', 'The standard position is 12 clicks.'], extra=['clicks'])
    put(D, 'R', 'Fork / Rebound damping adjuster / Standard position', '11', 'clicks', 'suspension_setting', 151, needle='The standard position is 11 clicks.', extra=['clicks'])
    put(D, 'RX', 'Fork / Rebound damping adjuster / Standard position', '15', 'clicks', 'suspension_setting', 151, needle='The standard position is 15 clicks.', extra=['clicks'])
    put(D, 'R', 'Fork / Oil capacity / Minimum (standard spring)', '311', 'cm3', 'suspension_setting', 151, needle=['Minimum oil capacity (CRF250R):', 'Standard spring: 10.5 US oz (311 cm3)'], extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Minimum (standard spring)', '306', 'cm3', 'suspension_setting', 151, needle=['Minimum oil capacity (CRF250RX):', 'Standard spring: 10.3 US oz (306 cm3)'], extra=['forkoil'])
    put(D, 'R', 'Fork / Oil capacity / Maximum (standard spring)', '396', 'cm3', 'suspension_setting', 152, needle='(396 cm3)', extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Maximum (standard spring)', '391', 'cm3', 'suspension_setting', 152, needle='(391 cm3)', extra=['forkoil'])
    put(D, 'R', 'Shock / High speed compression damping adjuster / Standard position', '2 7/12 – 3 1/12', 'turns', 'suspension_setting', 154, needle='2 7/12 – 3 1/12 turns (CRF250R)', extra=['turns_mark'])
    put(D, 'RX', 'Shock / High speed compression damping adjuster / Standard position', '2 11/12 – 3 5/12', 'turns', 'suspension_setting', 154, needle=['2 11/12 – 3 5/12', 'turns (CRF250RX)'], extra=['turns_mark'])
    put(D, 'R', 'Shock / Low speed compression damping adjuster / Standard position', '11', 'clicks', 'suspension_setting', 155, needle='2. Set the adjuster position 11 clicks (CRF250R)/', extra=['clicks'])
    put(D, 'RX', 'Shock / Low speed compression damping adjuster / Standard position', '8', 'clicks', 'suspension_setting', 155, needle='8 clicks (CRF250RX)', extra=['clicks'])
    put(D, 'R', 'Shock / Rebound damping adjuster / Standard position', '5–8', 'clicks', 'suspension_setting', 155, needle='2. Set the adjuster position 5 to 8 clicks', extra=['clicks_mark'])
    put(D, 'RX', 'Shock / Rebound damping adjuster / Standard position', '7–10', 'clicks', 'suspension_setting', 155, needle='(CRF250R)/7 to 10 clicks (CRF250RX)', extra=['clicks_mark'])
    put(D, 'R', 'Shock / Spring install length / Standard (standard spring)', '237.0', 'mm', 'spring_install_length', 154, needle='Standard: 9.33 in (237.0 mm)', extra=['sil'])
    put(D, 'RX', 'Shock / Spring install length / Standard (standard spring)', '233.5', 'mm', 'spring_install_length', 154, needle='Standard: 9.19 in (233.5 mm)', extra=['sil'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (standard spring)', '105', 'mm', 'race_sag', 156, needle='Standard Race Sag: 4.1 in (105 mm)', scope='shared', extra=['sag'])
    for m, fork, shock in (('R', ('4.6', '4.8', '5.0'), ('50', '52', '54')), ('RX', ('4.4', '4.6', '4.8'), ('48', '50', '52'))):
        for part, rates in (('Fork', fork), ('Shock', shock)):
            for kind, v in zip(('optional soft', 'standard', 'optional stiff'), rates):
                put(D, m, f'{part} {kind} spring rate', v, 'N/mm', 'spring_rate', 187, needle=[f'CRF250{m}: ', f'({v} N/mm)'], extra=['spring_std' if kind == 'standard' else 'spring_opt'])
    put(D, 'R,RX', 'Final drive / Standard driven sprocket', '48T (aluminum), 114-link chain', None, 'drive_chain', 187, needle=['48 Teeth, Aluminum', '<114>'], scope='shared', extra=['sprocket'])
    put(D, 'R', 'Drive chain / Standard chain', 'D.I.D 520 DMS/120RB', None, 'drive_chain', 187, needle='CRF250R: D.I.D 520 DMS/120RB')
    put(D, 'RX', 'Drive chain / Standard chain', 'D.I.D 520 MXV5/120ZB', None, 'drive_chain', 187, needle='CRF250RX: D.I.D 520 MXV5/120ZB')
    items = sched_items(drop=('Clutch fluid',))
    schedule(D, 30, 'R', [i for i in items if i[0] != 'Sidestand'], ['CRF250R', '2.5 hours'], kind='om')
    schedule(D, 30, 'RX', items, ['CRF250RX', '3.5 hours'], kind='om')

    # ---------------- 2020 CRF450R/RX/RWE
    D = 'o20_450'; P = 178
    om_torques(D, 180, 182, drop_items={21: 181, 23: 181}, manual=(
        ('RX', 'Fuel pump mounting bolts', '11', 181, ['Fuel pump mounting bolts', '(CRF450RX)', '8 11 1.1'], 'One torque value printed across the CRF450RX bolt row and the CRF450R/RWE nut row of item 21 (checked on the page image).'),
        ('R', 'Fuel pump mounting nuts/cap nut', '11', 181, ['Fuel pump mounting nuts/', 'cap nut (CRF450R/RWE)', '8 11 1.1'], 'One torque value printed across the CRF450RX bolt row and the CRF450R/RWE nut row of item 21 (checked on the page image).'),
        ('RX', 'Fuel tank bolt', '10', 181, ['Fuel tank bolt (CRF450RX)', 'Fuel tank bolts 7 10 1.0'], 'One torque value printed across the CRF450RX and CRF450R/RWE rows of item 23 (checked on the page image).'),
        ('R', 'Fuel tank bolts', '10', 181, ['Fuel tank bolts 7 10 1.0', '(CRF450R/RWE)'], 'One torque value printed across the CRF450RX and CRF450R/RWE rows of item 23 (checked on the page image).')))
    sp = lambda models, j, v, u, needle, prop='specification', scope='labelled', page=P, extra=('om_spec',): put(D, models, j, v, u, prop, page, needle=needle, scope=scope, extra=list(extra))
    sp('RX', 'Specifications / Dimensions / Overall length', '2,175', 'mm', '2,175 mm'); sp('R', 'Specifications / Dimensions / Overall length', '2,183', 'mm', '2,183 mm')
    sp('R,RX', 'Specifications / Dimensions / Overall width', '827', 'mm', 'Overall width 32.6 in 827 mm', scope='shared')
    sp('RX', 'Specifications / Dimensions / Overall height', '1,259', 'mm', '1,259 mm'); sp('R', 'Specifications / Dimensions / Overall height', '1,260', 'mm', '1,260 mm')
    sp('RX', 'Specifications / Dimensions / Wheelbase', '1,477', 'mm', '1,477 mm'); sp('R', 'Specifications / Dimensions / Wheelbase', '1,482', 'mm', '1,482 mm')
    sp('RX', 'Specifications / Dimensions / Seat height', '959', 'mm', '959 mm'); sp('R', 'Specifications / Dimensions / Seat height', '960', 'mm', '960 mm')
    sp('RX', 'Specifications / Dimensions / Footpeg height', '417', 'mm', '417 mm'); sp('R', 'Specifications / Dimensions / Footpeg height', '418', 'mm', '418 mm')
    sp('R,RX', 'Specifications / Dimensions / Ground clearance', '328', 'mm', 'Ground clearance 12.9 in 328 mm', scope='shared')
    sp('RX', 'Specifications / Dimensions / Caster angle', '27°26’', None, 'CRF450RX: 27°26’'); sp('R', 'Specifications / Dimensions / Caster angle', '27°22’', None, 'CRF450R/RWE: 27°22’')
    sp('R,RX', 'Specifications / Dimensions / Trail length', '116', 'mm', 'Trail length 4.6 in 116 mm', scope='shared')
    sp('RX', 'Specifications / Fuel tank capacity', '8.5', 'L', '8.5 ℓ'); sp('R', 'Specifications / Fuel tank capacity', '6.3', 'L', '6.3 ℓ')
    sp('RX', 'Fork / Oil capacity / Standard (standard spring)', '363', 'cm3', '363 cm3', prop='suspension_setting', extra=('om_spec', 'forkoil'))
    sp('R', 'Fork / Oil capacity / Standard (standard spring)', '356', 'cm3', '356 cm3', prop='suspension_setting', extra=('om_spec', 'forkoil'))
    sp('R,RX', 'Fork / Damper oil capacity', '243', 'cm3', '243 cm3', prop='suspension_setting', scope='shared')
    sp('R,RX', 'Specifications / Frame / Front suspension travel', '268', 'mm', 'travel 10.55 in (268 mm)', scope='shared')
    sp('R,RX', 'Specifications / Frame / Front fork stroke', '305', 'mm', 'stroke 12.01 in (305 mm)', scope='shared')
    sp('RX', 'Specifications / Frame / Rear wheel travel', '312', 'mm', 'travel 12.28 in (312 mm)'); sp('R', 'Specifications / Frame / Rear wheel travel', '314', 'mm', 'travel 12.36 in (314 mm)')
    sp('RX', 'Specifications / Frame / Front tire size', '90/90-21 54M', None, 'CRF450RX: 90/90-21 54M'); sp('R', 'Specifications / Frame / Front tire size', '80/100-21 51M', None, 'CRF450R/RWE: 80/100-21 51M')
    sp('RX', 'Specifications / Frame / Rear tire size', '120/90-18 65M', None, 'CRF450RX: 120/90-18 65M'); sp('R', 'Specifications / Frame / Rear tire size', '120/80-19 63M', None, 'CRF450R/RWE: 120/80-19 63M')
    sp('RX', 'Specifications / Frame / Recommended front tire', 'DUNLOP AT81F', None, ['DUNLOP', 'AT81F']); sp('R', 'Specifications / Frame / Recommended front tire', 'DUNLOP MX3SF', None, ['DUNLOP', 'MX3SF'])
    sp('RX', 'Specifications / Frame / Recommended rear tire', 'DUNLOP AT81', None, ['DUNLOP', 'AT81 ']); sp('R', 'Specifications / Frame / Recommended rear tire', 'DUNLOP MX3S', None, ['DUNLOP', 'MX3S '])
    sp('R,RX', 'Specifications / Frame / Tire type', 'Bias-ply, tube', None, 'bias-ply, tube', scope='shared')
    sp('R,RX', 'Front tire pressure', '100', 'kPa', ['Tire pressure, front', '15 psi (100 kPa, 1.0 kgf/cm2)'], prop='pressure', scope='shared', extra=('om_spec', 'tire'))
    sp('R,RX', 'Rear tire pressure', '100', 'kPa', ['Tire pressure, rear', '15 psi (100 kPa, 1.0 kgf/cm2)'], prop='pressure', scope='shared', extra=('om_spec', 'tire'))
    sp('R,RX', 'Specifications / Engine / Bore x stroke', '96.000 x 62.138', 'mm', ['96.000 x', '62.138 mm'], scope='shared')
    sp('R,RX', 'Specifications / Engine / Displacement', '449.77', 'cm3', '449.77 cm3', scope='shared')
    sp('R,RX', 'Specifications / Engine / Compression ratio', '13.5:1', None, '13.5 : 1', scope='shared')
    sp('R,RX', 'Valve clearance / Intake', '0.13 ± 0.03', 'mm', '(0.13 ± 0.03 mm)', prop='valve_clearance', scope='shared')
    sp('R,RX', 'Valve clearance / Exhaust', '0.28 ± 0.03', 'mm', '(0.28 ± 0.03 mm)', prop='valve_clearance', scope='shared')
    sp('R,RX', 'Engine oil capacity / After draining', '1.00', 'L', '1.06 US qt 1.00 ℓ', prop='oil_capacity', scope='shared')
    sp('R,RX', 'Engine oil capacity / After draining and oil filter change', '1.04', 'L', '1.10 US qt 1.04 ℓ', prop='oil_capacity', scope='shared')
    sp('R,RX', 'Engine oil capacity / After disassembly', '1.35', 'L', '1.43 US qt 1.35 ℓ', prop='oil_capacity', scope='shared')
    sp('R,RX', 'Engine idle speed', '2,000 ± 100', 'rpm', 'Idle speed 2,000 ± 100 rpm', prop='idle_speed', scope='shared')
    sp('R,RX', 'Coolant capacity / After draining', '1.07', 'L', '1.13 US qt 1.07 ℓ', prop='coolant', scope='shared')
    sp('RX', 'Coolant capacity / After disassembly', '1.15', 'L', '1.22 US qt 1.15 ℓ', prop='coolant')
    sp('R', 'Coolant capacity / After disassembly', '1.13', 'L', '1.19 US qt 1.13 ℓ', prop='coolant')
    sp2 = lambda models, j, v, u, needle, scope='shared': put(D, models, j, v, u, 'specification', 179, needle=needle, scope=scope, extra=['om_spec'])
    sp2('R,RX', 'Specifications / Drive train / Primary reduction', '2.357', None, 'Primary reduction 2.357')
    for g, v in zip(('I', 'II', 'III', 'IV', 'V'), ('2.133', '1.706', '1.421', '1.211', '1.043')):
        sp2('R,RX', f'Specifications / Drive train / Gear ratio {g}', v, None, f'Gear ratio {g} {v}')
    sp2('RX', 'Specifications / Drive train / Final reduction', '3.846', None, 'CRF450RX: 3.846', scope='labelled')
    sp2('R', 'Specifications / Drive train / Final reduction', '3.769', None, 'CRF450R/RWE: 3.769', scope='labelled')
    sp2('R,RX', 'Specifications / Electrical / Battery', 'HY85S lithium-ion, 12 V 2.0 Ah (20 HR)', None, ['HY85S lithium-ion (li-ion)', '12 V-2.0 Ah (20 HR)'])
    sp2('R,RX', 'Spark plug / Specified type', 'NGK SILMAR9A-9S', None, ['Standard SILMAR9A-9S'])
    sp2('R,RX', 'Spark plug / Gap', '0.8 – 0.9', 'mm', '(0.8 – 0.9 mm)')
    sp2('R,RX', 'Specifications / Electrical / Main fuse', '10', 'A', 'Main fuse 10 A')
    put(D, 'R,RX', 'Fork / Compression damping adjuster / Standard position', '8', 'clicks', 'suspension_setting', 149, needle='The standard position is 8 clicks.', scope='shared', extra=['clicks'])
    put(D, 'RX', 'Fork / Rebound damping adjuster / Standard position', '15', 'clicks', 'suspension_setting', 149, needle=['(CRF450RX)', 'The standard position is 15 clicks.'], extra=['clicks'])
    put(D, 'R', 'Fork / Rebound damping adjuster / Standard position', '9', 'clicks', 'suspension_setting', 149, needle=['(CRF450R/RWE)', 'The standard position is 9 clicks.'], extra=['clicks'])
    put(D, 'RX', 'Fork / Oil capacity / Minimum (standard spring)', '309', 'cm3', 'suspension_setting', 149, needle=['Minimum oil capacity (CRF450RX):', 'Standard spring: 10.5 US oz (309 cm3)'], extra=['forkoil'])
    put(D, 'R', 'Fork / Oil capacity / Minimum (standard spring)', '304', 'cm3', 'suspension_setting', 149, needle=['Minimum oil capacity (CRF450R/RWE):', 'Standard spring: 10.3 US oz (304 cm3)'], extra=['forkoil'])
    put(D, 'RX', 'Fork / Oil capacity / Maximum (standard spring)', '394', 'cm3', 'suspension_setting', 150, needle='(394 cm3)', extra=['forkoil'])
    put(D, 'R', 'Fork / Oil capacity / Maximum (standard spring)', '389', 'cm3', 'suspension_setting', 150, needle='(389 cm3)', extra=['forkoil'])
    put(D, 'RX', 'Shock / High speed compression damping adjuster / Standard position', '3 1/6', 'turns', 'suspension_setting', 152, needle=['2. (CRF450RX)', '3 1/6 turns. Further turn it by ± 1/4'], extra=['turns', 'The manual then has the adjuster turned within ±1/4 turn to align the punch marks.'])
    put(D, 'R', 'Shock / High speed compression damping adjuster / Standard position', '3', 'turns', 'suspension_setting', 152, needle=['(CRF450R/RWE)', '3 turns. Further turn it by ± 1/4'], extra=['turns', 'The manual then has the adjuster turned within ±1/4 turn to align the punch marks.'])
    put(D, 'RX', 'Shock / Low speed compression damping adjuster / Standard position', '10', 'clicks', 'suspension_setting', 153, needle=['2. (CRF450RX/RWE)', 'Set the adjuster 10 clicks'], extra=['clicks'])
    put(D, 'R', 'Shock / Low speed compression damping adjuster / Standard position', '9', 'clicks', 'suspension_setting', 153, needle=['(CRF450R)', 'Set the adjuster 9 clicks'], extra=['clicks'])
    put(D, 'RX', 'Shock / Rebound damping adjuster / Standard position', '8–11', 'clicks', 'suspension_setting', 153, needle='Set the adjuster 8 to 11 clicks', extra=['clicks_mark'])
    put(D, 'R', 'Shock / Rebound damping adjuster / Standard position', '6–9', 'clicks', 'suspension_setting', 153, needle='Set the adjuster 6 to 9 clicks', extra=['clicks_mark'])
    put(D, 'RX', 'Shock / Spring install length / Standard (standard spring)', '233.5', 'mm', 'spring_install_length', 152, needle='Standard: 9.19 in (233.5 mm)', extra=['sil'])
    put(D, 'R', 'Shock / Spring install length / Standard (standard spring)', '237.0', 'mm', 'spring_install_length', 152, needle='Standard: 9.33 in (237.0 mm)', extra=['sil'])
    put(D, 'R,RX', 'Shock / Race sag / Standard (standard spring)', '105', 'mm', 'race_sag', 154, needle='Standard Race Sag: 4.1 in (105 mm)', scope='shared', extra=['sag'])
    for m, tag, fork, shock in (('RX', 'CRF450RX:', ('4.6', '4.8', '5.0'), ('50', '52', '54')), ('R', 'CRF450R/RWE:', ('4.8', '5.0', '5.2'), ('54', '56', '58'))):
        for part, rates in (('Fork', fork), ('Shock', shock)):
            for kind, v in zip(('optional soft', 'standard', 'optional stiff'), rates):
                put(D, m, f'{part} {kind} spring rate', v, 'N/mm', 'spring_rate', 186, needle=[tag, f'({v} N/mm)'], extra=['spring_std' if kind == 'standard' else 'spring_opt'])
    put(D, 'RX', 'Final drive / Standard driven sprocket', '50T (aluminum), 114-link chain', None, 'drive_chain', 186, needle=['CRF450RX: 50 Teeth, Aluminum', '<114>'], extra=['sprocket'])
    put(D, 'R', 'Final drive / Standard driven sprocket', '49T (aluminum), 114-link chain', None, 'drive_chain', 186, needle=['CRF450R/RWE: 49 Teeth,', '<114>'], extra=['sprocket'])
    put(D, 'RX', 'Drive chain / Standard chain', 'RK 520EXU/120LJFZ', None, 'drive_chain', 186, needle='CRF450RX: RK520EXU/120LJFZ')
    put(D, 'R', 'Drive chain / Standard chain', 'RK 520TXZ/120RJ', None, 'drive_chain', 186, needle='CRF450R: RK520TXZ/120RJ')
    items = sched_items(drop=('Clutch fluid',))
    schedule(D, 31, 'R', [i for i in items if i[0] != 'Sidestand'], ['CRF450R/RWE', '2.5 hours'], kind='om')
    schedule(D, 30, 'RX', items, ['CRF450RX', '3.5 hours'], kind='om')

# ================================================================= main
def main():
    load()
    doc_h21_250()
    for D in ('h21_450', 'h22_450', 'h24_450'):
        doc_450_classic(D, cfg=CFG_450[D])
    doc_250_classic('h22_250', None); doc_250_classic('h24_250', None)
    doc_450_classic('h23_450', cfg=dict(CFG_450['h24_450'], rx_chain='RK 520EXU-120LJFZ', rx_chain_needle='RK: 520EXU-120LJFZ')); doc_250_classic('h23_250', None)
    for D in ('h25_250', 'h26_250', 'h27_250'):
        doc_250_new(D, CFG_250_NEW[D])
    doc_450_new('h25_450'); doc_450_new('h26_450')
    doc_h27_450(); doc_oms(); doc_o20()
    sums = {}
    for (year, model, doc) in TARGETS:
        d = DOCS[doc]; path = os.path.join(PDF_DIR, d['file'])
        sha = hashlib.sha256(open(path, 'rb').read()).hexdigest(); sums[doc] = sha
        vals = FACTS.get((year, model), [])
        extra_src = {}
        for v in vals:
            dd = v.pop('_doc')
            if dd != doc:
                od = DOCS[dd]; op = os.path.join(PDF_DIR, od['file'])
                osha = hashlib.sha256(open(op, 'rb').read()).hexdigest()
                v['source'] = {'file_name': od['file'], 'source_url': CDN + od.get('url_name', od['file']), 'document_sha256': osha,
                               'document_revision': od['revision'], 'kind': "owner's manual"}
                extra_src[dd] = {**v['source'], 'pdf_pages_used': sorted({x['pdf_page'] for x in vals if x.get('source', {}).get('file_name') == od['file']})}
        out = {'target': {'manufacturer': 'Honda', 'model': model, 'model_year': year, 'variant': 'standard', 'region': 'US'},
               'source_document': {'file_name': d['file'], 'source_url': CDN + d.get('url_name', d['file']), 'document_sha256': sha,
                                   'bytes': os.path.getsize(path), 'document_revision': d['revision'],
                                   'kind': 'competition handbook' if d['kind'] == 'handbook' else "owner's manual",
                                   'pdf_pages_used': sorted(USED_PAGES.get(doc, []))},
               'values': vals}
        if extra_src: out['additional_source_documents'] = list(extra_src.values())
        fn = f'{year}-{model.lower()}-facts.json'
        json.dump(out, open(os.path.join(HERE, fn), 'w'), indent=1, ensure_ascii=False); open(os.path.join(HERE, fn), 'a').write('\n')
        print(f'{fn}: {len(vals)} values')
    if TORQUE_DROPPED:
        print('torque rows dropped for disagreeing duplicates:', TORQUE_DROPPED)

if __name__ == '__main__':
    main()
