#!/usr/bin/env python3
"""Knowledge gaps per bike-year straight from the research files (no database needed).

usage: python3 scripts/knowledge/gaps.py [MAKE [MODEL]]
Builds rows with build_rows.py into a temp file and scores each roster bike-year per domain exactly like coverage.py /
scripts/build-bike-support.ts: 100 = 3+ approved rows incl. one OEM/MEASURED (DERIVED counts as strong for drivetrain),
60 = one OEM/MEASURED row or 3+ rows, 30 = one or two weaker rows, 0 = none. Knowledge = mean of the 11 domains;
Good (orange) needs 60+, Strong (blue) 80+. Prints bike-years under 80 with their weak domains (score<100)."""
import json,os,subprocess,sys,tempfile,collections
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0,os.path.join(root,'scripts/knowledge'))
from coverage import roster,DOMAINS,SHORT
tmp=tempfile.NamedTemporaryFile(suffix='.json',delete=False).name
subprocess.run([sys.executable,os.path.join(root,'scripts/knowledge/build_rows.py'),tmp],check=True,stdout=subprocess.DEVNULL)
n=collections.Counter();s=collections.Counter()
for r in json.load(open(tmp)):
    if r['status']!='APPROVED':continue
    k=(r['manufacturer'],r['model'],r['model_year'],r['domain']);n[k]+=1;s[k]+=r['tier'] in('OEM','MEASURED') or (r['domain']=='drivetrain')
os.unlink(tmp)
def sc(k):return 0 if not n[k] else 100 if s[k] and n[k]>=3 else 60 if s[k] or n[k]>=3 else 30
mk=sys.argv[1] if len(sys.argv)>1 else None;md=sys.argv[2] if len(sys.argv)>2 else None
lv=collections.Counter()
for m,mo,y,_ in roster():
    if mk and m!=mk or md and mo!=md:continue
    ds={d:sc((m,mo,y,d)) for d in DOMAINS};k=round(sum(ds.values())/len(DOMAINS))
    lv['strong' if k>=80 else 'good' if k>=60 else 'basic']+=1
    if k<80:print(f"{m} {mo} {y}: {k}  weak: "+', '.join(f"{d}={v}(n{n[(m,mo,y,d)]})" for d,v in ds.items() if v<100))
print(dict(lv))
