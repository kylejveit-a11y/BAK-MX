"""Payloads for private.stage_manual_rows from the Yamaha "ROAD CONDITION AND EXAMPLES OF CARBURETOR SETTING" charts.
usage: build_yamaha_jetting.py <yam.jsonl from yamaha_jetting.py> <jobs MODEL|YEAR|CODE> <stock.json> <out dir>
One row per cell: path "Carburetor tuning / <road> condition / <temperature band>", value = the settings printed in that
cell, plus the printed rule for reading the pilot air screw values. Checks before a bike-year is written:
- second read: every single-line row is read again from pdftotext -layout and must give the same six values;
- the general-condition 15-25 °C column must equal the stock carburetor settings already verified for that bike-year
  (main jet, jet needle, pilot jet, power jet; the pilot air screw too where the chart prints turns out);
- a row marked for a market is kept only when its legend names the USA."""
import sys, json, hashlib, os, re, subprocess, collections
def h(s): return hashlib.sha256(s.encode()).hexdigest()
REF = ('docs/research/expansion/jetting-2026-11-07/REVIEW.md; {code}; OEM Owner\'s Service Manual from Yamaha\'s owner\'s manual library, '
       'hashed; chapter 10 "Road condition and examples of carburetor setting" chart read from the text layer by column position, '
       'second read with pdftotext -layout row by row, and the general-condition 15-25 °C column matched to the stock carburetor '
       'settings already verified for this bike-year.')
NAMES = {'Main jet': ('MJ', 'main jet {}'), 'Jet needle': ('JN', 'jet needle-clip position {}'), 'Pilot jet': ('PJ', 'pilot jet {}'),
         'Pilot air screw': ('AS', None), 'Power jet': ('PW', 'power jet {}')}
def temp(c):
    s = {'winter': 'winter', 'summer': 'summer', 'spring, autumn': 'spring and autumn'}.get(c['season'] or '', None)
    if c['kind'] == 'range': t = f"{c['c'][0]} to {c['c'][1]} °C ({c['f'][0]} to {c['f'][1]} °F)"
    else: t = f"{c['kind']} {c['c'][0]} °C ({c['f'][0]} °F)"
    return t + (f', {s}' if s else '')
def norm(v): return re.sub(r'^([A-Z0-9]+)-([A-Z]{2})-', r'\1\2-', v.replace(' ', ''))
def second_read(path, page, rows):
    t = subprocess.run(['pdftotext', '-q', '-layout', '-f', str(page), '-l', str(page), path, '-'], capture_output=True, text=True).stdout
    bad = []
    for r in rows:
        if r['mk']: continue
        L = t.split('\n'); m = [k for k, l in enumerate(L) if re.match(r'^\s*' + re.escape(r['name']) + r'\s', l)]
        if len(m) != 1: continue          # label on two lines: covered by the position read only
        toks = L[m[0]].split()[len(r['name'].split()):]
        if len(toks) == 6 and all(x.endswith('-') for x in toks):   # value split over two lines
            nxt = L[m[0] + 1].split()
            if len(nxt) == 6: toks = [a + b for a, b in zip(toks, nxt)]
        if len(toks) == 6 and toks != r['vals']: bad.append((r['name'], toks, r['vals']))
        if len(toks) not in (0, 6): bad.append((r['name'], 'token count', toks))
    return bad
def main():
    docs = {json.loads(l)['doc']: json.loads(l) for l in open(sys.argv[1])}
    stock = json.load(open(sys.argv[3])); out = sys.argv[4]; os.makedirs(out, exist_ok=True)
    i = 0; summary = []
    for line in open(sys.argv[2]):
        if not line.strip(): continue
        model, yr, code = line.strip().split('|'); yr = int(yr)
        d = docs.get(code)
        if not d or len(d['charts']) != 1:
            summary.append({'make': 'Yamaha', 'model': model, 'yr': yr, 'doc': code, 'skipped': 'no readable chart' + (f": {d['problems'][:3]}" if d else ': manual not read')}); continue
        ch = d['charts'][0]; flags = []
        rows = [r for r in ch['rows'] if not r['mk'] or re.match(r'For USA\b', r.get('market') or '')]
        names = [r['name'] for r in rows]
        if len(names) != len(set(names)) or any(n not in NAMES for n in names):
            summary.append({'make': 'Yamaha', 'model': model, 'yr': yr, 'doc': code, 'skipped': f'rows not understood: {names}'}); continue
        sr = second_read(d['path'], ch['page'], ch['rows'])
        if sr: summary.append({'make': 'Yamaha', 'model': model, 'yr': yr, 'doc': code, 'skipped': f'second read differs: {sr}'}); continue
        R = {NAMES[r['name']][0]: r['vals'] for r in rows}
        tip = bool(ch['tip'])
        if 'AS' in R and tip and any(not (v == '0' or v[0] in '+-') for v in R['AS']):
            flags.append('pilot air screw printed as turns out while the TIP says the values are added to the ex-factory turns: row not stored'); del R['AS']
        # stock check on the general 15-25 °C column
        k = [j for j, c in enumerate(ch['cols']) if c['cond'] == 'general' and c['kind'] == 'range']
        st = stock.get(f'{model}|{yr}', {}); mism = []
        for key, v in st.items():
            if key == 'AS':
                if 'AS' not in R: continue
                want = '0' if tip else v
                if R['AS'][k[0]] != want: mism.append((key, R['AS'][k[0]], want))
            elif key in R and norm(R[key][k[0]]) != norm(v): mism.append((key, R[key][k[0]], v))
        if mism or not st:
            summary.append({'make': 'Yamaha', 'model': model, 'yr': yr, 'doc': code, 'skipped': f'chart standard column differs from stock on file: {mism}' if st else 'no stock settings on file to check against'}); continue
        recs = []
        for j, c in enumerate(ch['cols']):
            parts = []
            for key in ('MJ', 'JN', 'PJ', 'AS', 'PW'):
                if key not in R: continue
                v = R[key][j]
                if key == 'AS':
                    v = v.replace('+', '+').strip()
                    parts.append(('pilot air screw at the ex-factory setting' if v == '0' else f'pilot air screw {v} turn from the ex-factory setting') if tip else f'pilot air screw {v} turns out')
                else: parts.append(dict((a, b) for a, b in NAMES.values())[key].format(v))
            recs.append((ch['page'], ch['printed'], f"Carburetor tuning / {c['cond']} condition / {temp(c)}", '; '.join(parts)))
        if tip and 'AS' in R:
            recs.append((ch['page'], ch['printed'], 'Carburetor tuning / pilot air screw chart values', 'turns added to the ex-factory back-out setting'))
        lines = [f'{a}|{p}|{q}|{v}|' for a, p, q, v in sorted(recs, key=lambda r: h(r[2]))]
        assert len({r[2] for r in recs}) == len(recs)
        i += 1
        lit = None
        rec = {'make': 'Yamaha', 'model': model, 'yr': yr, 'doc': code, 'sha': d['sha'],
               'url': f'https://library.ymcapps.net/library/om/contents/pdf/10/{code}_02.pdf',
               'rev': f"Yamaha {model} {yr} Owner's Service Manual {code}, road condition and examples of carburetor setting",
               'ref': REF.format(code=code), 'want': h('\n'.join(lines)), 'delta': '\n'.join('+|' + l for l in lines), 'n': len(lines)}
        json.dump(rec, open(f'{out}/{i}.json', 'w'), ensure_ascii=False)
        summary.append({'i': i, 'make': 'Yamaha', 'model': model, 'yr': yr, 'doc': code, 'n': len(lines), **({'flags': flags} if flags else {})})
    json.dump(summary, open(out + '/summary.json', 'w'), ensure_ascii=False, indent=1)
    print(i, 'payloads', sum(s.get('n', 0) for s in summary), 'rows')
    for s in summary:
        if 'skipped' in s or 'flags' in s: print(s)
if __name__ == '__main__': main()
