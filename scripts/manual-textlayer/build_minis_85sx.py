"""KTM 85 SX 17/14 and 19/16: the cover prints "85 SX" only, so build_from_index.py's cover check skips these bike-years
(the review built them with plan.py / build_payloads.py). Same row selection, conflict drop, shape flags and report format as
build_from_index.py (its flags() is imported), so finalize_payloads.py can take the output.
usage (from the PDF directory): build_minis_85sx.py <out dir> <doc> ..."""
import sys,json,hashlib,collections,os,re
sys.path.insert(0,'/home/claude/bak-mx/scripts/manual-textlayer')
import tech_data_2025_plus as td2, service_schedule as ss, validity as V
from build_from_index import flags, h
from plan import PLAN
import pdfplumber
outdir=sys.argv[1]; only=set(sys.argv[2:]); os.makedirs(outdir,exist_ok=True); i=0; report=[]
for doc,mod,mys in PLAN:
    if doc not in only: continue
    if not all(m.startswith('85 SX') for m,_ in mys): continue   # the 125/150/125 XC manuals are covered by build_from_index.py
    assert mod is td2,(doc,mys)
    path=doc+'.pdf'; sha=hashlib.sha256(open(path,'rb').read()).hexdigest()
    rows=mod.parse(path); sched,prob=ss.parse(path)
    cover=re.sub(r'\s+',' ',(pdfplumber.open(path).pages[0].extract_text(x_tolerance=1.2) or ''))
    for model,yr in mys:
        make='KTM'
        if not re.search(r'(?<![\w-])85 SX(?![\w-])',cover):
            report.append({'i':None,'make':make,'model':model,'yr':str(yr),'doc':doc,'layout':'','n':0,'sched':0,'sched_problems':[],'secs':{},'damp':0,'dropped':[],'flagged':[],'notes':['NOT ON COVER: '+cover[:120]]}); continue
        f,q=mod.facts(rows,model)
        allr=[(r['pdf'],r['printed'],p,v) for r,p,v in f]; ns=0
        for a,b,p,v in sched:
            p2,ok,notes=V.strip(p,model); q.update(notes)
            if ok: allr.append((a,b,p2,v)); ns+=1
        by=collections.defaultdict(set)
        for a,b,p,v in allr: by[p].add((a,b,v))
        keep=[];drop=[];flagged=[]
        for p,s in by.items():
            if p.startswith('!') or len({v for _,_,v in s})!=1: drop.append(p); continue
            x=sorted(s)[0]; fl=flags(p,x[2])
            if fl or '|' in p+x[2] or x[1]=='?' or not x[2].strip() or p.count(' / ')<1: flagged.append((p,x[2],fl)); continue
            keep.append((x[0],x[1],p,x[2]))
        lines=[f'{a}|{b}|{p}|{v}|' for a,b,p,v in sorted(keep,key=lambda x:h(x[2]))]
        rec={'make':make,'model':model,'yr':int(yr),'doc':doc,'sha':sha,'want':h('\n'.join(lines)),'delta':'\n'.join('+|'+l for l in lines),'n':len(keep)}
        secs=collections.Counter(p.split(' / ')[0] for _,_,p,_ in keep)
        rep={'i':i,'make':make,'model':model,'yr':str(yr),'doc':doc,'layout':'2025_plus','n':len(keep),'sched':ns,'sched_problems':prob,'secs':dict(secs),
             'damp':sum(1 for k in keep if re.search(r'damping / (Comfort|Standard|Sport)$',k[2])),'dropped':drop,'flagged':flagged,'notes':sorted(q)}
        report.append(rep)
        if keep: json.dump(rec,open(f'{outdir}/{i}.json','w'),ensure_ascii=False); i+=1
        else: rep['i']=None
json.dump(report,open(outdir+'.report.json','w'),ensure_ascii=False,indent=1)
for r in report:
    print(r['i'],r['make'],r['model'],r['yr'],r['doc'],r['layout'],'n',r['n'],'sched',r['sched'],'damp',r['damp'],'drop',len(r['dropped']),'flag',len(r['flagged']),'prob',len(r['sched_problems']))
