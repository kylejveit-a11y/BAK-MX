#!/usr/bin/env python3
"""Validate and merge docs/research/tracks/*.json into docs/research/tracks/load/tracks-<STATE>.json.

Rules (docs/research/tracks/README.md): enum values only, coordinates inside the state box or null, one record per id
(regional files can overlap at their borders: the record with more evidence wins and the other's sources and
reports are merged in). Prints a coverage summary. Usage: build_tracks.py [STATE]
"""
import json, re, sys, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DIR = os.path.join(ROOT, 'docs', 'research', 'tracks')
BOX = {'FL': (24.3, 31.1, -87.7, -79.9)}
TYPES = {'motocross', 'supercross', 'arenacross', 'offroad', 'enduro', 'training', 'pit_bike', 'flat_track'}
ACCESS = {'public', 'members', 'private', 'appointment', 'unknown'}
STATUS = {'open', 'closed', 'seasonal', 'unknown'}
CONF = {'high', 'medium', 'low'}
# Same facility researched under two ids at a regional border: second id folds into the first.
SAME = {'motobros-okeechobee-mx': 'moto-bros-okeechobee'}
# Never loaded: a private person's home or property is not a track listing (privacy), whatever its history.
EXCLUDE = {'chad-reed-compound': "a rider's private home compound"}

def norm(r, file):
    errs = []
    rid = r.get('id') or ''
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{1,80}', rid): errs.append(f'bad id {rid!r}')
    for k in ('name', 'state'):
        if not r.get(k): errs.append(f'{rid}: missing {k}')
    r['types'] = [t for t in (r.get('types') or []) if t in TYPES] or ['motocross']
    if r.get('access') not in ACCESS: r['access'] = 'unknown'
    if r.get('status') not in STATUS: r['status'] = 'unknown'
    if r.get('confidence') not in CONF: r['confidence'] = 'low'
    soil = r.get('soil') or {}
    if soil.get('confidence') not in CONF: soil['confidence'] = 'low'
    r['soil'] = soil
    lat, lng = r.get('lat'), r.get('lng')
    box = BOX.get(r.get('state'))
    if lat is not None or lng is not None:
        ok = isinstance(lat, (int, float)) and isinstance(lng, (int, float)) and (not box or (box[0] <= lat <= box[1] and box[2] <= lng <= box[3]))
        if not ok:
            errs.append(f'{rid}: coordinates outside {r.get("state")} — cleared')
            r['lat'] = r['lng'] = None
    for k in ('aliases', 'tracks_on_site', 'gaps'):
        r[k] = [str(x) for x in (r.get(k) or []) if str(x).strip()]
    r['rider_reports'] = [x for x in (r.get('rider_reports') or []) if isinstance(x, dict) and x.get('says')]
    r['sources'] = [x for x in (r.get('sources') or []) if isinstance(x, dict) and str(x.get('url', '')).startswith('http')]
    for k in ('layout', 'conditions'):
        if not isinstance(r.get(k), dict): r[k] = {}
    r['research_file'] = os.path.basename(file)
    return errs

def weight(r):
    return len(r['sources']) + 2 * len(r['rider_reports']) + {'high': 6, 'medium': 3, 'low': 0}[r['confidence']]

def main():
    state = (sys.argv[1] if len(sys.argv) > 1 else 'FL').upper()
    merged, problems = {}, []
    for f in sorted(glob.glob(os.path.join(DIR, f'{state.lower()}-*.json'))):
        if '-update-' in os.path.basename(f): continue
        data = json.load(open(f))
        for r in data:
            if r.get('id') in EXCLUDE:
                problems.append(f"{r['id']}: left out ({EXCLUDE[r['id']]})"); continue
            r['id'] = SAME.get(r.get('id'), r.get('id'))
            problems += norm(r, f)
            old = merged.get(r['id'])
            if old:
                keep, other = (r, old) if weight(r) > weight(old) else (old, r)
                urls = {s['url'] for s in keep['sources']}
                keep['sources'] += [s for s in other['sources'] if s['url'] not in urls]
                said = {x['says'] for x in keep['rider_reports']}
                keep['rider_reports'] += [x for x in other['rider_reports'] if x['says'] not in said]
                keep['aliases'] = sorted(set(keep['aliases']) | set(other['aliases']) | ({other['name']} - {keep['name']}))
                problems.append(f"{r['id']}: in two files, merged ({keep['research_file']} kept)")
                merged[r['id']] = keep
            else:
                merged[r['id']] = r
    # Correction passes: <state>-update-*.json is {"updates": [{"id": ..., field: value, ...}]}. A listed scalar or dict
    # field replaces the old one (dicts merge key by key), sources/rider_reports/aliases/gaps/tracks_on_site are added
    # to, and "remove_gaps" drops gaps the pass closed. Later passes win.
    for f in sorted(glob.glob(os.path.join(DIR, f'{state.lower()}-update-*.json'))):
        for u in json.load(open(f)).get('updates', []):
            r = merged.get(u.get('id'))
            if not r:
                problems.append(f"{u.get('id')}: update in {os.path.basename(f)} names no track"); continue
            for k, v in u.items():
                if k in ('id', 'note') or v in (None, '', [], {}): continue
                if k == 'remove_gaps':
                    r['gaps'] = [g for g in r['gaps'] if g not in v]
                elif k in ('sources', 'rider_reports'):
                    key = 'url' if k == 'sources' else 'says'
                    have = {x.get(key) for x in r.get(k, [])}
                    r[k] = r.get(k, []) + [x for x in v if isinstance(x, dict) and x.get(key) not in have]
                elif k in ('aliases', 'gaps', 'tracks_on_site', 'types'):
                    r[k] = list(dict.fromkeys((r.get(k) or []) + [str(x) for x in v]))
                elif isinstance(v, dict) and isinstance(r.get(k), dict):
                    r[k] = {**r[k], **{a: b for a, b in v.items() if b not in (None, '', [])}}
                else:
                    r[k] = v
            problems += norm(r, os.path.join(DIR, r['research_file']))
            r['research_file'] += ' + ' + os.path.basename(f)
    rows = sorted(merged.values(), key=lambda r: r['id'])
    os.makedirs(os.path.join(DIR, 'load'), exist_ok=True)
    out = os.path.join(DIR, 'load', f'tracks-{state}.json')
    json.dump(rows, open(out, 'w'), indent=1, ensure_ascii=False)
    openr = [r for r in rows if r['status'] != 'closed']
    print(f'{state}: {len(rows)} tracks ({len(openr)} not closed) -> {os.path.relpath(out, ROOT)}')
    print(f"  soil medium/high: {sum(r['soil'].get('primary') and r['soil']['confidence'] != 'low' for r in openr)}/{len(openr)}")
    print(f"  with rider reports: {sum(bool(r['rider_reports']) for r in openr)}/{len(openr)}  with coordinates: {sum(r['lat'] is not None for r in openr)}/{len(openr)}")
    for p in problems: print('  note:', p)

if __name__ == '__main__':
    main()
