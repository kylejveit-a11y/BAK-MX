"""Parse the 2020 owner's manual 'Torque Specifications' tables (numbered item list printed beside the location figures).
Each numbered item may wrap onto a second line; a value line without an item number either finishes the open item or is a
second row of the same item (e.g. front/rear spokes, A/B muffler bolts, R/RX fuel pump fasteners)."""
import re
N = r'(\d+(?:\.\d+)?)'
VALS = re.compile(r'\s{2,}' + N + r'\s+' + N + r'\s+' + N + r'(?:\s+(NOTE[\d ,]+))?\s*$')
START = re.compile(r'(?:^|\s{2,})(\d{1,2})\s{2,}(?=[A-Z])')

def parse(pages, first, last):
    rows = []
    for pi in range(first - 1, last):
        text = pages[pi]
        notes = dict(re.findall(r'(?:NOTES:\s*)?\b(\d)\.\s+([A-Z][^\n]*?)\s*(?=\n|$)', text))
        col = None; cur = None
        for line in text.splitlines():
            if col is None:
                m = re.search(r'\s(\d{1,2})\s{2,}[A-Z][a-z]', line)
                if m and m.start(1) > 60: col = m.start(1)
                else: continue
            seg = line[col - 3:] if len(line) > col - 3 else ''
            seg = seg.strip()
            if not seg: continue
            if seg.startswith('NOTES') or re.match(r'^\d\.\s', seg) or seg.startswith('(cont'):
                cur = None; continue
            ms = re.match(r'^(\d{1,2})\s{2,}(.*)$', seg)
            if ms:
                body = ms.group(2); v = VALS.search('  ' + body)
                name = ('  ' + body)[:v.start()].strip() if v else body.strip()
                cur = {'no': int(ms.group(1)), 'name': name, 'nm': v.group(2) if v else None,
                       'note': (v.group(4) or '').strip() if v else '', 'pdf_page': pi + 1}
                rows.append(cur); continue
            if cur is None: continue
            v = VALS.search('  ' + seg)
            name = ('  ' + seg)[:v.start()].strip() if v else seg
            if re.fullmatch(r'\(\d+\)(\s+\(\d+\))*', name or 'x'):  # figure callouts
                continue
            if v:
                if cur.get('_pending'):
                    name = cur.pop('_pending') + ' ' + name
                    cur = dict(cur, name=name, nm=v.group(2), note=(v.group(4) or '').strip()); cur.pop('_pending', None)
                    rows.append(cur); continue
                if cur['nm'] is None:
                    cur['name'] += ' ' + name; cur['nm'] = v.group(2); cur['note'] = (v.group(4) or '').strip()
                else:
                    base = re.sub(r'\s*\((?!CRF)[^)]*\)\s*$', '', cur['name']).split('  ')[0]
                    nm = (base + ' ' + name) if name.startswith('(') else name
                    cur = dict(cur, name=nm, nm=v.group(2), note=(v.group(4) or '').strip())
                    rows.append(cur)
            else:
                if cur['nm'] is None or name.startswith('('):
                    cur['name'] += ' ' + name
                else:
                    cur['_pending'] = (cur.get('_pending', '') + ' ' + name).strip()
        for r in rows:
            if r['pdf_page'] == pi + 1:
                r['name'] = re.sub(r'\s{2,}', ' ', r['name']).replace('/ ', '/').strip(); r.pop('_pending', None)
                r['note_text'] = ' '.join(notes.get(n, '') for n in re.findall(r'\d', r['note'])).strip()
    return rows
