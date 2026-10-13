import sys,json,hashlib,collections,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import tech_data_2020_2025 as td, tech_data_2025_plus as td2, service_schedule as ss, validity as V
from plan import PLAN
def h(s): return hashlib.sha256(s.encode()).hexdigest()
EXTRA={'21_3214209_en_OM':[('125 XC',2021)],'22_3214411_en_OM':[('125 XC',2022)],'23_3214638_en_OM':[('125 XC',2023)],'24_3214832_en_OM':[('125 XC',2024)],'25_3240041_en_OM':[('125 XC',2025)],'26_3240232_en_BA':[('125 XC',2026)],'27_3240379_en_BA':[('125 XC',2027)]}
pdfdir,outdir=sys.argv[1:3]; os.makedirs(outdir,exist_ok=True); i=0; summary=[]
for doc,mod,mys in PLAN:
    path=f'{pdfdir}/{doc}.pdf'; sha=hashlib.sha256(open(path,'rb').read()).hexdigest()
    rows=mod.parse(path); sched,prob=ss.parse(path); assert not prob,(doc,prob)
    for model,yr in mys+EXTRA.get(doc,[]):
        f,_=mod.facts(rows,model)
        allr=[(r['pdf'],r['printed'],p,v) for r,p,v in f]
        ns=0
        for a,b,p,v in sched:
            p2,ok,notes=V.strip(p,model)
            if ok: allr.append((a,b,p2,v)); ns+=1
        by=collections.defaultdict(set)
        for a,b,p,v in allr: by[p].add((a,b,v))
        keep=[];drop=[]
        for p,s in by.items():
            assert not p.startswith('!'),p
            if len({v for _,_,v in s})==1: x=sorted(s)[0]; keep.append((x[0],x[1],p,x[2]))
            else: drop.append(p)
        for _,pr,p,v in keep: assert '|' not in p+v and '\n' not in p+v and pr!='?' and v.strip() and p.count(' / ')>=1,(p,v)
        lines=[f'{a}|{b}|{p}|{v}|' for a,b,p,v in sorted(keep,key=lambda x:h(x[2]))]
        json.dump({'make':'KTM','model':model,'yr':yr,'doc':doc,'sha':sha,'want':h('\n'.join(lines)),'delta':'\n'.join('+|'+l for l in lines),'n':len(keep)},open(f'{outdir}/{i}.json','w'),ensure_ascii=False)
        dm=[(p,v) for _,_,p,v in keep if 'damping' in p]
        summary.append((i,model,yr,doc,len(keep),ns,len(dm),drop)); print(summary[-1]); i+=1
json.dump(summary,open(outdir+'/../ml-summary.json','w'))
