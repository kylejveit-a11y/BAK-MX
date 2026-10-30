"""Summarise the rows returned by gap_matrix.sql (saved as JSON) per model: how many model years lack each fact kind.
usage: python3 scripts/research/gap_matrix.py rows.json"""
import json,sys
from collections import defaultdict
rows=json.load(open(sys.argv[1]))
flags=['fork_damping','shock_damping','sag','fork_spring','shock_spring','fork_oil','tire_pressure','oil_capacity','valve_clearance']
by=defaultdict(list)
for r in rows: by[(r['manufacturer'],r['model'])].append(r)
print(f"{'bike':28} yrs  "+' '.join(f[:7].rjust(7) for f in flags)+'  torq<20 sched=0 total<300')
for (mk,md),rs in sorted(by.items()):
    miss=[sum(1 for r in rs if not r[f]) for f in flags]
    print(f"{mk+' '+md:28} {len(rs):3}  "+' '.join(str(x).rjust(7) for x in miss)
          +f"  {sum(1 for r in rs if r['torques']<20):6} {sum(1 for r in rs if r['schedule_rows']==0):7} {sum(1 for r in rs if r['total']<300):8}")
