"""Print the SQL that loads docs/research/riding-areas/*.json into public.tracks (kind='riding_area', area=record).
Run the output in the MX database after research changes.

- new-places.json: riding areas BAK did not have yet; inserted once (on conflict do nothing), never overwritten.
- Every other file: one record per place, written to tracks.area. Areas with Forest Service trail lines also get
  area.center, the middle of their lines: used for "near me" and the weather, never for directions (it can be deep in
  the woods). Tracks with only offroad/enduro types become riding areas too.
Usage: python3 -I scripts/riding-areas/areas-sql.py
"""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
D = 'docs/research/riding-areas/'
q = lambda s: "'" + str(s).replace("'", "''") + "'"

def decode(s):
    out, i, lat, lng = [], 0, 0, 0
    def nxt():
        nonlocal i
        sh = r = 0
        while True:
            b = ord(s[i]) - 63; i += 1; r |= (b & 0x1f) << sh; sh += 5
            if b < 0x20: break
        return ~(r >> 1) if r & 1 else r >> 1
    while i < len(s):
        lat += nxt(); lng += nxt(); out.append((lat / 1e5, lng / 1e5))
    return out

centers = {}
for l in json.load(open(D + 'trail-lines.json')):
    pts = decode(l['line']); c = centers.setdefault(l['track_id'], [0.0, 0.0, 0])
    for la, ln in pts: c[0] += la; c[1] += ln; c[2] += 1

for p in json.load(open(D + 'new-places.json')):
    cols = ['id', 'name', 'state', 'city', 'lat', 'lng', 'types', 'access', 'status', 'confidence', 'research_file', 'review_status', 'listed', 'kind']
    vals = [q(p['id']), q(p['name']), q(p['state']), q(p['city']) if p.get('city') else 'null',
            str(p['lat']) if p.get('lat') is not None else 'null', str(p['lng']) if p.get('lng') is not None else 'null',
            "array['offroad']", "'public'", q(p.get('status', 'unknown')), "'medium'", q(p['file']), "'APPROVED'", 'true', "'riding_area'"]
    print(f"insert into public.tracks({','.join(cols)}) values ({','.join(vals)}) on conflict (id) do nothing;")

print("update public.tracks set kind='riding_area' where kind='track' and (types && array['offroad','enduro']) "
      "and not (types && array['motocross','supercross','arenacross','pit_bike','flat_track']);")
for f in sorted(glob.glob(D + '*.json')):
    if f.endswith(('trail-lines.json', 'new-places.json')): continue
    for r in json.load(open(f)):
        body = {k: v for k, v in r.items() if k != 'id'}
        c = centers.get(r['id'])
        if c and c[2]: body['center'] = {'lat': round(c[0] / c[2], 4), 'lng': round(c[1] / c[2], 4)}
        print(f"update public.tracks set kind='riding_area', area={q(json.dumps(body, ensure_ascii=False))}::jsonb where id={q(r['id'])};")
