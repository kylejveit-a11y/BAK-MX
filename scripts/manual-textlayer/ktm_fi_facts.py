"""Engine-management and fuel facts from KTM, Husqvarna and GasGas owner's manuals (fuel-injected bikes).

Reads the pdftotext -layout text of a manual (pages split by form feeds), cuts it into numbered sections, keeps only the
sections whose heading carries no validity note or one that applies to the US standard model (validity.applies), and
looks for fixed statements. Every value is built from words captured in the manual; a fact whose captures differ between
two applicable sections is dropped. Nothing is inferred from a missing section.

Facts (path -> what must be printed):
  Fuel / Fuel standard                              "Standard/classification - DIN EN 228 (...)"
  Fuel / Ethanol                                    "ethanol content of up to 10% (E10 fuel) is safe to use"
  Fuel / Fuels not to use                           "Do not use fuel containing methanol (e.g. ...) or more than 10% ethanol (e.g. ...)"
  Engine management / Mapping / STANDARD|ADVANCED   combination-switch states, indicator lamp colour where printed
  Engine management / Mapping / change while riding "mapping can (also) be changed during the ride"
  Engine management / Mapping / exhaust control     "Changing the mapping also affects the response of the exhaust control"
  Engine management / Traction control / ...        section "Activating traction control"
  Engine management / Launch control / ...          section "Activating launch control"
  Engine management / Quickshifter / ...            section "Activating the quickshifter"
  Engine management / Throttle grip guide plate     section "Adjusting the characteristic map of the throttle response"
  Engine management / Connectivity Unit Offroad     section "Connectivity Unit Offroad (CUO)"

usage: ktm_fi_facts.py <manual.txt> <model> [<model> ...]   prints {model: [[pdf page, printed page, path, value], ...], 'problems': [...]}"""
import re, sys, json, os
sys.path.insert(0, os.path.dirname(__file__))
import validity

HEAD = re.compile(r'^\s{0,14}(\d{1,2}(?:\.\d{1,2}){1,3})\s{1,12}([A-Z][^\n]{2,90}?)\s*$')
FIG = re.compile(r'\b[A-Z]?\d{5,6}-\d{2}\b')

def pages(path):
    return open(path, encoding='utf-8', errors='replace').read().split('\f')

def printed(pg):
    ls = [l.strip() for l in pg.strip().split('\n') if l.strip()]
    for x in ls[-1:] + ls[:1]:
        m = re.search(r'(?:^|\s)(\d{1,3})$', x) or re.match(r'^(\d{1,3})(?:\s|$)', x)
        if m: return m.group(1)
    return '?'

def flat(s):
    s = s.replace('‑', '-').replace('­', '-').replace('‒', '-').replace('‒', '-')
    s = FIG.sub(' ', s)
    s = re.sub(r'(\w)- *\n\s*(\w)', r'\1\2', s)          # hyphenated line break
    s = re.sub(r'\s+', ' ', s)
    return s

def sections(pgs):
    """[(number, title, note, [(page index, text)])]"""
    out = []; cur = None
    for i, pg in enumerate(pgs):
        if '. . . .' in pg or '.....' in pg:              # contents / index pages
            if cur: cur[3].append((i, ''));
            continue
        buf = []
        for line in pg.split('\n'):
            m = HEAD.match(line)
            if m and not re.search(r'\.{3}|\. \. \.|p\. \d', line):
                if cur is not None: cur[3].append((i, '\n'.join(buf)))
                title = m.group(2).strip()
                note = None
                n = re.search(r'\(([^()]*)\)\s*$', title)
                if n:
                    v = n.group(1)
                    note = v
                cur = [m.group(1), title, note, []]; out.append(cur); buf = []
            else:
                buf.append(line)
        if cur is not None: cur[3].append((i, '\n'.join(buf)))
    return out

def applicable(sec, model):
    note = sec[2]
    if not note: return True
    try: a = validity.applies(note, model)
    except Exception: return False
    return True if a is None else a

def find(secs, pat, flags=0, title=None):
    """All (page idx, match) for pat in applicable sections (optionally only sections whose title matches)."""
    res = []
    for s in secs:
        if title and not re.search(title, s[1], re.I): continue
        for i, t in s[3]:
            for m in re.finditer(pat, flat(t), flags): res.append((i, m))
    return res

def facts(path, model):
    pgs = pages(path); secs = [s for s in sections(pgs) if applicable(s, model)]
    rows = {}; probs = []
    def put(path_, val, i):
        if path_ in rows and rows[path_][3] != val:
            probs.append(f'{path_}: two values {rows[path_][3]!r} / {val!r}'); rows[path_] = None; return
        if path_ in rows and rows[path_] is None: return
        rows.setdefault(path_, [i + 1, printed(pgs[i]), path_, val])
    # fuel
    # only the fuel entry the US model uses (the ROZ 95 grade); an entry such as "Super unleaded (RON 95/97)" is for another market
    for i, m in find(secs, r'Super unleaded \(([^)]*ROZ 95[^)]*)\) Standard/classification – DIN EN 228 \(([^)]+)\)'):
        put('Fuel / Fuel standard', f'DIN EN 228 ({m.group(2).strip()})', i)
    for i, m in find(secs, r'Super unleaded Standards ● (ROZ 95) → DIN EN 228'):
        put('Fuel / Fuel standard', f'DIN EN 228 ({m.group(1)})', i)
    for i, m in find(secs, r'Super unleaded \([^)]*ROZ 95[^)]*\) Standard/classification – DIN EN 228 \([^)]+\) Guideline – Only use [^.]{0,90}\. – Fuel with an ethanol content of up to 10 ?% \(E10 fuel\) is safe to use'):
        put('Fuel / Ethanol', 'fuel with up to 10% ethanol (E10) is safe to use', i)
    for i, m in find(secs, r'Do not use fuel containing methanol \(e\. ?g\.,? ([^)]+)\) or more than 10 ?% ethanol \(e\. ?g\.,? ([^)]+)\)'):
        put('Fuel / Fuels not to use', f'methanol fuel ({m.group(1).strip()}) or more than 10% ethanol ({m.group(2).strip()})', i)
    # mapping
    sw = [s for s in secs if re.fullmatch(r'Combination switch', s[1]) or re.match(r'Changing the mapping', s[1])]
    for name, lamp in (('STANDARD', 'A'), ('ADVANCED', 'B')):
        hit = [(i, m) for s in sw for i, t in s[3] for m in re.finditer(rf'\b{name}\b(?: –)? {name} mapping', flat(t))] + \
              [(i, m) for s in sw for i, t in s[3] for m in re.finditer(rf'Activating {name} mapping', flat(t))]
        if not hit: continue
        col = {m.group(1).lower() for i, m in find(secs, rf'Indicator (?:lamp|light) {lamp} lights up (white|green|blue|orange|red|yellow)\.? ?–? ?{name} map')}
        val = f'{name} mapping' + (f'; indicator lamp {lamp} lights up {col.pop()}' if len(col) == 1 else '')
        if len(col) > 1: probs.append(f'{name}: lamp colours {col}')
        put(f'Engine management / Mapping / {name}', val, hit[0][0])
    for i, m in find(secs, r'mapping can (?:also )?be changed during the ride'):
        put('Engine management / Mapping / change while riding', 'the mapping can be changed during the ride', i)
    for i, m in find(secs, r'Changing the mapping also affects the response of the exhaust control'):
        put('Engine management / Mapping / exhaust control', 'changing the mapping also changes the response of the exhaust control', i)
    # traction control
    T = r'^Activat(?:e|ing) traction control$'
    for i, m in find(secs, r'reduces excessive slip on the rear wheel', title=T):
        put('Engine management / Traction control / function', 'reduces excessive rear-wheel slip, particularly in wet conditions' if 'wet conditions' in flat(m.string) else 'reduces excessive rear-wheel slip', i)
    for i, m in find(secs, r'Press the TC button ?\d? ?to switch traction control on or off', title=T):
        put('Engine management / Traction control / switch', 'TC button on the combination switch, on or off', i)
    for i, m in find(secs, r'Traction control can be switched on or off during the ride', title=T):
        put('Engine management / Traction control / while riding', 'can be switched on or off during the ride', i)
    for i, m in find(secs, r'Engine speed ≤ ([\d,]+) rpm', title=T):
        put('Engine management / Traction control / switching speed', f'engine speed ≤ {m.group(1)} rpm', i)
    for i, m in find(secs, r'setting most recently selected is activated again when restarting', title=T):
        put('Engine management / Traction control / at restart', 'the setting last selected is active again after a restart', i)
    # launch control
    L = r'^Activat(?:e|ing) launch control$'
    cond = [x for x in ('The motorcycle is stationary', 'The engine is running at idle speed', 'The transmission is in neutral')
            if find(secs, re.escape(x), title=L)]
    if len(cond) == 3 or find(secs, r'Condition: Motorcycle is stationary, The engine is running at idle speed, Transmission is in the neutral position', title=L):
        put('Engine management / Launch control / activation conditions', 'motorcycle stationary, engine at idle speed, transmission in neutral',
            find(secs, r'[Mm]otorcycle is stationary', title=L)[0][0])
    for i, m in find(secs, r'Press and hold (?:the )?([A-Z]{2,3}) button ?\d?(?: ?and (?:the )?([A-Z]{2,3}) button)?', title=L):
        put('Engine management / Launch control / activation', f'press and hold the {m.group(1)} button' + (f' and the {m.group(2)} button together' if m.group(2) else ''), i)
    for i, m in find(secs, r'Press and hold the ([A-Z]{2,3}) and ([A-Z]{2,3}) buttons simultaneously', title=L):
        put('Engine management / Launch control / activation', f'press and hold the {m.group(1)} button and the {m.group(2)} button together', i)
    for i, m in find(secs, r'throttle valve is closed more than (\S+) of the way after full throttle', title=L):
        put('Engine management / Launch control / cancels when', f'throttle closed more than {m.group(1)} of the way after full throttle', i)
    for i, m in find(secs, r'no start within (\d+) minutes', title=L):
        put('Engine management / Launch control / cancels after', f'{m.group(1)} minutes without a start', i)
    for i, m in find(secs, r'deactivated automatically for a few seconds after the vehicle has started', title=L):
        put('Engine management / Launch control / after the start', 'switches itself off a few seconds after the start', i)
    for i, m in find(secs, r'engine must be switched off for at least (\d+) seconds before the launch control can be activated again', title=L):
        put('Engine management / Launch control / re-arming', f'engine switched off for at least {m.group(1)} seconds before launch control can be activated again', i)
    # quickshifter
    Q = r'^Activat(?:e|ing) the quickshifter$'
    for i, m in find(secs, r'Press the QS button ?\d? ?to switch the quickshifter on or off', title=Q):
        put('Engine management / Quickshifter / switch', 'QS button on the combination switch, on or off', i)
    for i, m in find(secs, r'quickshifter is not activated when shifting up from (first|1st) gear', flags=re.I):
        put('Engine management / Quickshifter / first gear', 'not active when shifting up from first gear', i)
    # throttle grip guide plate
    G = r'^Adjusting the characteristic map of the throttle response$'
    if find(secs, r'characteristic map of the throttle response is changed by changing the guide plate', title=G):
        sup = bool(find(secs, r'guide plate with a different characteristic map is supplied', title=G))
        put('Engine management / Throttle grip guide plate', 'the throttle response characteristic is changed by changing the guide plate in the throttle grip' + ('; a guide plate with a different characteristic is supplied' if sup else ''),
            find(secs, r'changed by changing the guide plate', title=G)[0][0])
    # Connectivity Unit Offroad
    C = r'^Connectivity Unit Offroad \(CUO\)$'
    if find(secs, r'Connectivity Unit Offroad(?: \d)? is attached on the right fork leg', title=C) and find(secs, r'app provided by the manufacturer guides you', title=C):
        put('Engine management / Connectivity Unit Offroad', 'unit on the right fork leg with a GPS unit on the fender, operated through the manufacturer\'s app',
            find(secs, r'is attached on the right fork leg', title=C)[0][0])
    return [r for r in rows.values() if r], probs

if __name__ == '__main__':
    out = {}; pr = []
    for m in sys.argv[2:]:
        r, p = facts(sys.argv[1], m); out[m] = r; pr += [f'{m}: {x}' for x in p]
    out['problems'] = pr
    print(json.dumps(out, ensure_ascii=False, indent=1))
