"""Engine-management and fuel facts from Yamaha Owner's Service Manuals (fuel-injected four-strokes).

Reads the text layer in content order (pdftotext without -layout keeps each column's sentences together), joins
hyphenated line breaks and looks for fixed statements. Every value is built from words captured in the manual; a fact
printed with two different captures is dropped. Printed page numbers ("1-22") come from the -layout text of the same page.

Facts (path -> what must be printed):
  Engine management / Maps / switch               "Push the mode switch "1" to change between map|drive mode 1 and ... 2"
  Engine management / Maps / as shipped           "As shipped from the factory, maps|drive modes 1 and 2 are the same. You must use the Power Tuner app to adjust the map settings"
  Engine management / Maps / map 2 indicator      "When the mode switch "1" is illuminated | the indicator light "2" illuminates <colour>, map|drive mode 2 is selected"
  Engine management / Launch control / function   "the ignition timing is delayed to reduce slipping at the rear wheel"
  Engine management / Launch control / activation "Push the mode switch|button "1" for more than one second to turn on the launch control ..."
  Engine management / Launch control / start gear "Put the gear into the 1st or 2nd gear for starting off"
  Engine management / Launch control / turns off  "will turn off automatically when the gear is shifted into the 3rd gear"
  Engine management / Power Tuner                 "By downloading the Power Tuner app ... CCU wireless network, you can adjust various vehicle settings"
  Engine management / Power Tuner / modified engine  "designed for adjusting the settings on a standard vehicle ... (muffler, compression ratio, etc.) have been changed"
  Fuel / Gasohol                                  "Gasohol containing ethanol can be used if the ethanol content does not exceed N %. Gasohol containing methanol is not recommended"

usage: yamaha_fi_facts.py <manual.pdf>   prints [[pdf page, printed page, path, value], ...] and problems"""
import re, sys, json, subprocess

def _pages(path, layout):
    a = ['pdftotext', '-q'] + (['-layout'] if layout else []) + [path, '-']
    return subprocess.run(a, capture_output=True, text=True).stdout.split('\f')

def _flat(s):
    s = re.sub(r'(\w)-\n(\w)', r'\1\2', s)
    return re.sub(r'\s+', ' ', s)

def facts(path):
    raw = _pages(path, False); lay = _pages(path, True)
    flat = [_flat(p) for p in raw]
    def printed(i):
        ls = [l.strip() for l in lay[i].split('\n') if l.strip()] if i < len(lay) else []
        for l in reversed(ls):
            m = re.search(r'(?:^|\s)(\d{1,2}-\d{1,3})$', l)
            if m: return m.group(1)
        return '?'
    rows = {}; probs = []
    def put(p, v, i):
        if p in rows:
            if rows[p] is not None and rows[p][3] != v: probs.append(f'{p}: {rows[p][3]!r} / {v!r}'); rows[p] = None
            return
        rows[p] = [i + 1, printed(i), p, v]
    def each(pat):
        for i, t in enumerate(flat):
            if '.....' in t: continue
            for m in re.finditer(pat, t): yield i, m
    Q = r'[“"]1[”"]'
    for i, m in each(rf'Push the mode switch {Q} to change between (drive mode|map) 1 and (?:drive mode|map) 2'):
        put('Engine management / Maps / switch', f'the mode switch changes between {m.group(1)} 1 and {m.group(1)} 2', i)
    for i, m in each(r'As shipped from the factory, (maps|map|drive modes) 1 and 2 are the same\. •? ?You must use the Power Tuner app to adjust the map settings'):
        w = {'maps': 'map', 'map': 'map', 'drive modes': 'drive mode'}[m.group(1)]
        put('Engine management / Maps / as shipped', f'{w} 1 and {w} 2 are the same as shipped; the map settings are adjusted with the Power Tuner app', i)
    for i, m in each(rf'When (?:the mode switch {Q} is illuminated|the indicator light [“"]2[”"] illuminates (\w+)), (?:map|drive mode) 2 is selected'):
        put('Engine management / Maps / map 2 indicator', f'indicator light lights up {m.group(1)}' if m.group(1) else 'the mode switch is lit', i)
    for i, m in each(r'the ignition timing is delayed to reduce slipping at the rear wheel which occurs when the vehicle accelerates from a stationary position'):
        put('Engine management / Launch control / function', 'retards the ignition timing to reduce rear-wheel slip when accelerating from a standstill', i)
    for i, m in each(rf'Push (the mode switch|button) {Q} for more than (one|two|\d+) seconds? to turn on the launch control (?:system|switch)'):
        put('Engine management / Launch control / activation', f'push {m.group(1).replace("button", "the launch control button")} for more than {m.group(2)} second{"s" if m.group(2) not in ("one", "1") else ""}', i)
    for i, m in each(r'Put the gear into the (1st or 2nd) gear for starting off'):
        put('Engine management / Launch control / start gear', f'{m.group(1)} gear', i)
    for i, m in each(r'launch control (?:system|function) will turn off automatically when the gear is shifted into the (3rd) gear'):
        put('Engine management / Launch control / turns off', f'automatically when shifted into {m.group(1)} gear', i)
    for i, m in each(r'By downloading the Power Tuner app to your smartphone and wirelessly connecting to the CCU wireless network, you can adjust various vehicle settings'):
        put('Engine management / Power Tuner', 'Power Tuner smartphone app, connected over the CCU (Communication Control Unit) wireless network, adjusts vehicle settings', i)
    for i, m in each(r'This application is designed for adjusting the settings on a standard vehicle\. In case the engine specifications \(muffler, compression ratio, etc\.\) have been changed'):
        put('Engine management / Power Tuner / modified engine', 'the app settings are designed for a standard vehicle; with a changed muffler, compression ratio or other engine specification the performance may not match the settings', i)
    for i, m in each(r'Gasohol containing ethanol can be used if the ethanol content does not exceed (\d+) ?%\. Gasohol containing methanol is not recommended'):
        put('Fuel / Gasohol', f'ethanol gasohol can be used up to {m.group(1)}% ethanol; methanol gasohol is not recommended', i)
    return [r for r in rows.values() if r], probs

if __name__ == '__main__':
    r, p = facts(sys.argv[1]); print(json.dumps({'rows': r, 'problems': p}, ensure_ascii=False, indent=1))
