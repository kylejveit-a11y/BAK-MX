"""Print the updates that load docs/research/riding-areas/*.json into public.tracks (kind='riding_area', area=record).
Run the output in the MX database after research changes. Tracks with only offroad/enduro types become riding areas too."""
import glob, json
print("update public.tracks set kind='riding_area' where kind='track' and (types && array['offroad','enduro']) "
      "and not (types && array['motocross','supercross','arenacross','pit_bike','flat_track']);")
for f in sorted(glob.glob('docs/research/riding-areas/*.json')):
    if f.endswith('trail-lines.json'): continue
    for r in json.load(open(f)):
        body = json.dumps({k: v for k, v in r.items() if k != 'id'}, ensure_ascii=False).replace("'", "''")
        print(f"update public.tracks set kind='riding_area', area='{body}'::jsonb where id='{r['id']}';")
