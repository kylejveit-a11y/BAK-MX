#!/usr/bin/env python3
"""Pack research records into load batches for public.bike_knowledge.

usage: python3 scripts/knowledge/pack_load.py ID_PREFIX[,ID_PREFIX...] NAME [MAKE|MODEL|YEAR]
(the optional bike keeps only rows for that one bike-year, e.g. after adding it to the roster; prefix "" matches all)
Runs build_rows.py (expansion to roster bike-years and anonymisation), keeps rows whose research id starts with a prefix,
groups them per record with their bike-year targets (t) and writes docs/research/knowledge/load/NAME-<n>.json (~900 KB each).
See load/README.md for the SQL that pulls a batch at a pinned commit."""
import json,os,sys,subprocess,tempfile,collections
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
pref=tuple(sys.argv[1].split(','));name=sys.argv[2];only=sys.argv[3].split('|') if len(sys.argv)>3 else None
tmp=tempfile.NamedTemporaryFile(suffix='.json',delete=False).name
subprocess.run([sys.executable,os.path.join(root,'scripts/knowledge/build_rows.py'),tmp],check=True,stdout=subprocess.DEVNULL)
g=collections.OrderedDict()
for r in json.load(open(tmp)):
    if not r['research_id'].startswith(pref):continue
    if only and [r['manufacturer'],r['model'],str(r['model_year'])]!=only:continue
    k=r['research_id']
    if k not in g:g[k]={x:r[x] for x in ('research_id','domain','topic','statement','vals','tier','confidence','notes','source','status')};g[k]['t']=[]
    g[k]['t'].append([r['manufacturer'],r['model'],r['model_year']])
os.unlink(tmp)
d=os.path.join(root,'docs/research/knowledge/load');out=[[]];sz=0
for r in g.values():
    s=len(json.dumps(r,ensure_ascii=False))
    if sz+s>900000 and out[-1]:out.append([]);sz=0
    out[-1].append(r);sz+=s
for i,b in enumerate(out):json.dump(b,open(f'{d}/{name}-{i}.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out),'files',len(g),'records',sum(len(r['t']) for r in g.values()),'rows')
