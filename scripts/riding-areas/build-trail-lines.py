"""Build trail lines for Where to Ride from the Forest Service Motor Vehicle Use Map (MVUM) national trails download.

Source (public domain): https://data.fs.usda.gov/geodata/edw/datasets.php -> "Motor Vehicle Use Map: Trails" shapefile
(Trans_MVUM_Trail.zip). Unzip it and pass the folder. Writes docs/research/riding-areas/trail-lines.json, which
load-trail-lines.sql.py turns into upserts for public.trail_lines.

Each area in AREAS names its forest and district and the trails that anchor it. In the national file a trail's name sits
on a row with no geometry and its segments carry only the trail ID, so names are joined by ID and every segment of an anchor trail is taken. (Pulling in
whatever connects was tried and swept in neighbouring systems, so it is not used.) Lines are simplified
to about 10 m and rounded to 4 decimals (about 10 m), then stored as an encoded polyline.

Usage: python3 -I scripts/riding-areas/build-trail-lines.py <mvum-folder> <map-date YYYY-MM-DD>
"""
import json, math, re, sys
import shapefile  # pyshp

AREAS = {
  'houston-valley-orv': {'forest': 'Chattahoochee-Oconee National Forests', 'district': 'Conasauga', 'ids': r'^181'},
  'windy-gap-ohv': {'forest': 'Chattahoochee-Oconee National Forests', 'district': 'Conasauga', 'names': r'^(WINDY GAP BIKE|MILMA CREEK ATV|TIBBS ATV TRAIL)$'},
  # Whissenhunt: only 1.5 of its 11.2 miles carry a name in the national file, too little to draw; riders get the official map.
  'oakey-mountain-ohv': {'forest': 'Chattahoochee-Oconee National Forests', 'district': 'Chattooga', 'names': r'^(OAKEY MOUNTAIN OHV TRAIL|MOATES KNOB OHV TRAIL)$'},
  'locust-stake-ohv': {'forest': 'Chattahoochee-Oconee National Forests', 'district': 'Chattooga', 'names': r'^(TRESTLE LOOP|MOON WALK|RIDGE RUNNER|RANGER RUN|CC LOOP|4 TOES)$'},
  'town-creek-ohv': {'forest': 'Chattahoochee-Oconee National Forests', 'district': 'Oconee', 'names': r'^TOWN CREEK'},
  'ocala-nf-ohv-trail-system': {'forest': 'National Forests in Florida', 'district': 'Lake George', 'all': True},
  'big-scrub-ohv': {'forest': 'National Forests in Florida', 'district': 'Seminole', 'names': r'^(CENTENNIAL TRAIL|BIG SCRUB LINK|SCRUB JAY SHORTCUT|SOUTH LOOP)$'},
  'wandering-wiregrass-ohv': {'forest': 'National Forests in Florida', 'district': 'Seminole', 'names': r'^WANDERING WIREGRASS'},
}

def width(symbol, rec):
    s = symbol.lower()
    if 'all vehicles' in s: return 'full_width'
    if '50" or less' in s or 'ohv <50' in s: return 'atv'
    if 'motorcycles' in s: return 'single_track'
    if str(rec.get('ATV', '')).strip().lower() == 'open': return 'atv'
    if str(rec.get('MOTORCYCLE', '')).strip().lower() == 'open': return 'single_track'
    return 'unknown'

def encode(pts):
    """Google encoded polyline (precision 5), [lng, lat] in, so a line costs a few bytes per point in the database."""
    out, plat, plng = [], 0, 0
    for lng, lat in pts:
        for v, prev in ((round(lat * 1e5), plat), (round(lng * 1e5), plng)):
            d = v - prev; d = ~(d << 1) if d < 0 else d << 1
            while d >= 0x20: out.append(chr((0x20 | (d & 0x1f)) + 63)); d >>= 5
            out.append(chr(d + 63))
        plat, plng = round(lat * 1e5), round(lng * 1e5)
    return ''.join(out)

def simplify(pts, tol=0.0001):
    if len(pts) < 3: return pts
    def d(p, a, b):
        if a == b: return math.dist(p, a)
        (x, y), (x1, y1), (x2, y2) = p, a, b
        return abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / math.dist(a, b)
    i, dmax = 0, 0.0
    for k in range(1, len(pts) - 1):
        dd = d(pts[k], pts[0], pts[-1])
        if dd > dmax: i, dmax = k, dd
    if dmax <= tol: return [pts[0], pts[-1]]
    return simplify(pts[:i + 1], tol)[:-1] + simplify(pts[i:], tol)

def main(folder, map_date):
    base = folder.rstrip('/') + '/S_USA.Trans_MVUM_Trail'
    r = shapefile.Reader(shp=open(base + '.shp', 'rb'), dbf=open(base + '.dbf', 'rb'), shx=open(base + '.shx', 'rb'))
    fields = [f[0] for f in r.fields[1:]]
    rows = []
    for sr in r.iterShapeRecords():
        rec = dict(zip(fields, sr.record))
        rows.append((rec, [[[round(x, 4), round(y, 4)] for x, y in sr.shape.points[a:b]] for a, b in zip(sr.shape.parts, list(sr.shape.parts[1:]) + [len(sr.shape.points)])] if sr.shape.points else []))
    out = []
    for area, rule in AREAS.items():
        pool = [(rec, parts) for rec, parts in rows if rec['FORESTNAME'] == rule['forest'] and rec['DISTRICTNA'].startswith(rule['district'])]
        name_by_id = {rec['ID']: rec['NAME'] for rec, parts in pool if rec['NAME'].strip()}
        def named(rec): return rec['NAME'].strip() or name_by_id.get(rec['ID'], '')
        segs = [(rec, p, k) for rec, parts in pool for k, p in enumerate(parts) if len(p) >= 2]
        if rule.get('all'):
            take = segs
        else:
            anchor = lambda rec: (('ids' in rule and re.search(rule['ids'], rec['ID'])) or ('names' in rule and re.search(rule['names'], named(rec))))
            take = [s for s in segs if anchor(s[0])]
        seen = set()
        for n, (rec, p, k) in enumerate(take):
            line = simplify([tuple(x) for x in p])
            if len(set(line)) < 2 or tuple(line) in seen: continue  # empty or repeated parts in the national file
            seen.add(tuple(line))
            seasonal = rec['MVUM_SYMBO'].strip().lower().endswith('seasonal')
            clean = lambda v: str(v).split()[0] if str(v).strip() else ''
            dates = clean(rec['MOTORCYC_1']) or clean(rec['ATV_DATESO'])
            out.append({'id': f"{area}:{rec['ID']}:{n}", 'track_id': area, 'source_id': rec['ID'], 'name': named(rec).title(),
                        'number': rec['ID'], 'width': width(rec['MVUM_SYMBO'], rec),
                        'vehicles': {k2: v for k2, v in {'motorcycle': clean(rec['MOTORCYC_1']) or clean(rec['MOTORCYCLE']), 'atv': clean(rec['ATV_DATESO']) or clean(rec['ATV'])}.items() if v},
                        'dates_open': (dates or 'Seasonal') if seasonal else 'Yearlong',
                        'miles': (round(rec['GIS_MILES'] or 0, 2) or None) if k == 0 else None, 'line': encode(line), 'map_date': map_date})
        print(area, len(take), 'segments', file=sys.stderr)
    json.dump(out, open('docs/research/riding-areas/trail-lines.json', 'w'))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
