"""Yamaha Owner's Service Manual, chapter 10 (TUNING): "ROAD CONDITION AND EXAMPLES OF CARBURETOR SETTING".

The chart is a grid: two road conditions (General, Sandy) x three air-temperature bands (Under 10 °C winter, 15-25 °C spring /
autumn, Over 25 or 30 °C summer), and per cell the main jet, jet needle with clip groove, pilot jet, pilot air screw (turns
relative to the ex-factory setting, per the TIP under the chart) and, where fitted, the power jet. Some manuals print two
rows for one part, marked A and B, with a legend such as "A. For USA and CAN"; only a row whose legend names the USA is
kept (an unmarked row applies to every market).

Cells are placed by the x position of the six temperature headers, never by order. A row must carry exactly one value per
column; a value split over two lines ("6BFY44-74-" / "3") is joined. °C and °F in each header must agree.
A table that fails any check is not returned.

usage: yamaha_jetting.py <pdf> [...]   prints one JSON object per manual: {doc, charts:[{page, printed, cols, rows, tip}], problems}"""
import sys, re, json, os, subprocess
import pdfplumber

HEAD = 'ROAD CONDITION AND EXAMPLES OF CARBURETOR SETTING'
STOP = re.compile(r'^(TIP|Optimum pilot air screw|EXAMPLES OF CARBURETOR SETTING DEPENDING|SPECIFICATIONS OF JET NEEDLE|EAM\d+|\d+-\d+$|A\. )')

def _lines(words, tol=2.5):
    out = []
    for w in sorted(words, key=lambda w: (w['top'], w['x0'])):
        if out and abs(out[-1][0] - w['top']) <= tol: out[-1][1].append(w)
        else: out.append([w['top'], [w]])
    for o in out: o[1].sort(key=lambda w: w['x0'])
    return out

def _txt(ws): return ' '.join(w['text'] for w in ws)

def parse_page(p):
    words = p.extract_words(x_tolerance=1.5, keep_blank_chars=False)
    lines = _lines(words)
    head = next((t for t, ln in lines if _txt(ln).strip() == HEAD), None)
    if head is None: return None, []
    probs = []
    # end of the table: first stop line below the header block
    body = [(t, ln) for t, ln in lines if t > head + 5]
    # temperature anchors
    first_row = next((t for t, ln in body if ln[0]['text'] == 'Main'), None)
    if first_row is None: return None, ['no Main jet row']
    anchors = [w for t, ln in body if t < first_row - 2 for w in ln if w['text'] in ('Under', 'Over') or re.fullmatch(r'\d+[–-]\d+(?:\uf0b0?°?C)?', w['text'])]
    hdr_bottom = max((w['top'] for w in anchors), default=None)
    if len(anchors) != 6: return None, [f'{len(anchors)} temperature headers, expected 6']
    anchors.sort(key=lambda w: w['x0'])
    # header words (between heading and first row label "Main")
    first_row = next((t for t, ln in body if ln[0]['text'] == 'Main' and t > hdr_bottom), None)
    if first_row is None: return None, ['no Main jet row']
    hdr = [w for t, ln in body if t < first_row - 2 for w in ln]
    gen = next((w for w in hdr if w['text'] == 'General'), None); sandy = next((w for w in hdr if w['text'] == 'Sandy'), None)
    if not gen or not sandy: return None, ['road condition headers missing']
    # column centre = centre of the temperature words of that column
    temp_ws = [w for w in hdr if w['top'] >= min(a['top'] for a in anchors) - 3]
    starts = [a['x0'] for a in anchors]
    def col_of(x):
        d = [abs(x - s) for s in centres]; i = d.index(min(d)); return i if d[i] < 45 else None
    # first pass: centres from anchor word plus its following unit token
    centres = []
    for a in anchors:
        grp = [w for w in temp_ws if abs(w['top'] - a['top']) < 2 and a['x0'] - 2 <= w['x0'] <= a['x0'] + 45]
        centres.append((min(w['x0'] for w in grp) + max(w['x1'] for w in grp)) / 2)
    colw = {i: [] for i in range(6)}
    for w in temp_ws:
        c = col_of((w['x0'] + w['x1']) / 2)
        if c is not None: colw[c].append(w)
    cols = []
    for i in range(6):
        s = ' '.join(w['text'] for t, ln in _lines(colw[i]) for w in ln)
        s = s.replace('Au- tumn', 'Autumn').replace('\uf0b0', ' ').replace('°', ' ').replace('  ', ' ')
        m = re.search(r'(Under|Over)\s+(\d+)\s*C\s*\(\s*(\d+)\s*F\s*\)', s)
        r = re.search(r'(\d+)[–-](\d+)\s*C\s*\(\s*(\d+)[–-](\d+)\s*F\s*\)', s)
        season = re.search(r'\((Winter|Summer|Spring, ?Autumn)\)', s)
        if m:
            c, f = int(m.group(2)), int(m.group(3))
            if abs(c * 9 / 5 + 32 - f) > 1: return None, [f'°C/°F disagree: {s}']
            cols.append({'kind': m.group(1).lower(), 'c': [c], 'f': [f]})
        elif r:
            c = [int(r.group(1)), int(r.group(2))]; f = [int(r.group(3)), int(r.group(4))]
            if any(abs(a * 9 / 5 + 32 - b) > 1 for a, b in zip(c, f)): return None, [f'°C/°F disagree: {s}']
            cols.append({'kind': 'range', 'c': c, 'f': f})
        else: return None, [f'unreadable column header: {s}']
        cols[-1]['season'] = season.group(1).replace(',', ', ').replace('  ', ' ').lower() if season else None
        cols[-1]['cond'] = 'general' if centres[i] < ((gen['x0'] + gen['x1']) / 2 + (sandy['x0'] + sandy['x1']) / 2) / 2 else 'sandy'
    if [c['cond'] for c in cols] != ['general'] * 3 + ['sandy'] * 3: return None, ['condition groups not 3 + 3']
    # rows
    vx = min(centres) - 40
    rows = []; legend = {}; tip = None
    end = None
    for t, ln in body:
        if t < first_row - 2: continue
        s = _txt(ln)
        if re.match(r'^[AB]\. ', s): legend[s[0]] = s[3:].strip(); end = end or t; continue
        if end is None and (s.startswith('TIP') or STOP.match(s) and not re.match(r'^[AB]$', s)):
            end = t
        if end is not None:
            if tip is None and s.startswith('Optimum pilot air screw'): tip = s
            if s.startswith('TIP') or s.startswith('Optimum') or re.match(r'^[AB]\. ', s): continue
            if len(rows) and (STOP.match(s) or t > end + 60):
                if not s.startswith('back-out') and not s.startswith('"1"') and not s.startswith('“1”') and not s.startswith('add'): break
            continue
        lab = [w for w in ln if w['x1'] < vx + 8]; val = [w for w in ln if w['x1'] >= vx + 8]
        rows.append({'top': t, 'label': _txt(lab), 'vals': val})
    # merge: anchors are lines with a capitalised label or a market letter
    anchors_r = []
    for r in rows:
        lab = r['label']; mk = None
        m = re.fullmatch(r'(.*?)\s*\b([AB])$', lab)
        if m: lab, mk = m.group(1).strip(), m.group(2)
        if lab and lab[0].isupper() or mk:
            name = lab if lab else (anchors_r[-1]['name'] if anchors_r else '?')
            anchors_r.append({'top': r['top'], 'name': name, 'mk': mk, 'cells': {}, 'tail': []})
            for w in r['vals']: anchors_r[-1]['tail'].append(w)
        else:
            if lab and anchors_r: anchors_r[-1]['name'] += ' ' + lab
            if r['vals']: rows_vals = r['vals']; r['orphan'] = True; anchors_r and anchors_r[-1].setdefault('orph', []).append(r)
    # orphan value lines: continuation of a split value (previous cells end with '-') or the value line of a two-line label
    out = []
    for a in anchors_r:
        cells = {}
        for w in a['tail']:
            c = col_of((w['x0'] + w['x1']) / 2)
            if c is None: probs.append(f'{a["name"]}: value outside columns {w["text"]}'); continue
            cells.setdefault(c, []).append(w['text'])
        for o in a.get('orph', []):
            for w in o['vals']:
                c = col_of((w['x0'] + w['x1']) / 2)
                if c is None: probs.append(f'{a["name"]}: value outside columns {w["text"]}'); continue
                if c in cells and not cells[c][-1].endswith('-'):
                    probs.append(f'{a["name"]}: second value in column {c}'); continue
                cells.setdefault(c, []).append(w['text'])
        vals = [''.join(cells[c]) if c in cells and all(x.endswith('-') for x in cells[c][:-1]) else ' '.join(cells.get(c, [])) for c in range(6)]
        if any(not v for v in vals): probs.append(f'{a["name"]}{" "+a["mk"] if a["mk"] else ""}: {sum(1 for v in vals if v)} of 6 columns'); return None, probs
        out.append({'name': a['name'].strip(), 'mk': a['mk'], 'vals': vals})
    if probs: return None, probs
    # market rows
    for r in out:
        if r['mk']:
            if r['mk'] not in legend: return None, probs + [f'market mark {r["mk"]} without legend']
            r['market'] = legend[r['mk']]
    if not out: return None, probs + ['no rows']
    words_all = p.extract_text() or ''
    pr = re.findall(r'\b(\d{1,2}-\d{1,2})\b', ' '.join(_txt(ln) for t, ln in lines[-6:]))
    return {'page': p.page_number, 'printed': pr[-1] if pr else '?', 'cols': cols, 'rows': out, 'legend': legend, 'tip': tip}, probs

def parse(path):
    txt = subprocess.run(['pdftotext', '-q', path, '-'], capture_output=True, text=True).stdout.split('\f')
    cand = [i for i, t in enumerate(txt) if HEAD in t and 'Main jet' in t]
    pdf = pdfplumber.open(path); charts = []; probs = []
    for i in cand:
        ch, pr = parse_page(pdf.pages[i]); probs += [f'p{i+1}: {x}' for x in pr]
        if ch: charts.append(ch)
    return {'doc': os.path.basename(path).replace('_02.pdf', '').replace('.pdf', ''), 'charts': charts, 'problems': probs}

if __name__ == '__main__':
    for a in sys.argv[1:]: print(json.dumps(parse(a), ensure_ascii=False))
