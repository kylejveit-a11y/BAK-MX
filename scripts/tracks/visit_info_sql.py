#!/usr/bin/env python3
"""Print the SQL that loads docs/research/tracks/visit-info-*.json into public.tracks.area for tracks.

The place page (web and phone) already shows "Know before you go" (hours, pass or fee, rules, address) and a "checked on"
line with sources for any place that has `area`; riding areas get theirs from scripts/riding-areas. This gives tracks the
same block from each track's own website. Only fills a place whose `area` is empty or was written by an earlier
visit-info pass (area.visit_info = true): a riding area's researched record is never overwritten.
Usage: python3 -I scripts/tracks/visit_info_sql.py > /tmp/visit.sql
"""
import json, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
q = lambda s: "'" + str(s).replace("'", "''") + "'"
for f in sorted(glob.glob(os.path.join(ROOT, 'docs', 'research', 'tracks', (__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'visit-info-*.json')))):
    d = json.load(open(f))
    for p in d['places']:
        area = {'land': 'private', 'managed_by': None, 'near': None, 'address': p.get('address'),
                'vehicles': {'single_track': None, 'atv': None, 'full_width': None}, 'width_limit_in': None, 'trail_miles': None,
                'pass': {'day': p.get('day'), 'year': p.get('year'), 'how': p.get('how')} if (p.get('day') or p.get('year') or p.get('how')) else None,
                'season': p.get('season'), 'hours': p.get('hours'), 'rules': p.get('rules') or [], 'closures': None,
                'official_url': None, 'phone': None, 'sources': [{'url': p['source_url'], 'title': p['source_title'], 'accessed': d['verified']}],
                'verified': d['verified'], 'visit_info': True}
        print(f"update public.tracks set area={q(json.dumps(area, ensure_ascii=False))}::jsonb, updated_at=now() where id={q(p['id'])} and (area is null or (area->>'visit_info')='true');")
