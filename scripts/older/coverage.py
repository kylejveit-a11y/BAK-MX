"""Per bike-year row counts for every older batch: docs/research/older/manual-coverage.json (read by build-bike-support.ts)."""
import json,glob,re
out={}
for f in sorted(glob.glob('docs/research/older/*/[0-9]*.json')):
    r=json.load(open(f)); paths=[l.split('|')[3] for l in r['delta'].split('\n') if l.startswith('+|')]
    k=(r['make'],r['model'],r['yr']); c=out.setdefault(k,{'manufacturer':k[0],'model':k[1],'model_year':k[2],'n':0,'suspension':0,'torques':0})
    c['n']+=len(paths); c['suspension']+=sum(bool(re.match(r'(Fork|Shock absorber|Rear suspension|Front suspension|Suspension)\b',p)) for p in paths)
    c['torques']+=sum('torque' in p.lower() for p in paths)
json.dump(sorted(out.values(),key=lambda c:(c['manufacturer'],c['model'],c['model_year'])),open('docs/research/older/manual-coverage.json','w'),indent=1)
print(len(out))
