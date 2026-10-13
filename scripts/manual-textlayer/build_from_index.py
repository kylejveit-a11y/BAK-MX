"""Build payloads for every manual in the index with a given status.
usage (from the PDF directory): build_from_index.py <index.tsv> <status> <out dir> [doc ...]"""
import sys,json,hashlib,collections,os,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import tech_data_2020_2025 as td, tech_data_2025_plus as td2, service_schedule as ss, validity as V
def h(s): return hashlib.sha256(s.encode()).hexdigest()
def flags(p,v):
    f=[]
    lab=p.split(' / ')[-1]
    if not p.startswith('Service') and len(lab)>75: f.append('longlabel')
    if v.startswith(('(',')',';')) or re.search(r'\) US$|liq\. gal\b(?!.*\))',v) or '  ' in p: f.append('shape')
    if v.count('(')!=v.count(')') or lab.count('(')!=lab.count(')'): f.append('parens')
    return f
PARTIAL={('GasGas','MC 250F',2024),('Husqvarna','FC 250',2023),('Husqvarna','FC 250',2024),('Husqvarna','FC 450',2023),('Husqvarna','FC 450',2024)}
def main():
    index,status,outdir=sys.argv[1:4]; only=set(sys.argv[4:]); os.makedirs(outdir,exist_ok=True); i=0; report=[]
    for line in open(index):
        if line.startswith('#'): continue
        make,models,yr,doc,st=line.rstrip('\n').split('\t')[:5]
        if st!=status or (only and doc not in only): continue
        path=doc+'.pdf'; sha=hashlib.sha256(open(path,'rb').read()).hexdigest()
        mod=td; rows=td.parse(path)
        if not rows: mod=td2; rows=td2.parse(path)
        sched,prob=ss.parse(path)
        import pdfplumber
        cover=re.sub(r'\s+',' ',(pdfplumber.open(path).pages[0].extract_text(x_tolerance=1.2) or '').replace('\u2011','-').replace('\u00ad','-'))
        for model in models.split(' / '):
            if not re.search(r'(?<![\w-])'+re.escape(model)+r'(?![\w-])',cover):
                report.append({'i':None,'make':make,'model':model,'yr':yr,'doc':doc,'layout':'','n':0,'sched':0,'sched_problems':[],'secs':{},'damp':0,'dropped':[],'flagged':[],'notes':['NOT ON COVER: '+cover[:120]]}); continue
            f,q=mod.facts(rows,model)
            # A bike that already has a reviewed table on file only receives suspension rows and the service schedule.
            partial=(make,model,int(yr)) in PARTIAL
            allr=[(r['pdf'],r['printed'],p,v) for r,p,v in f if not partial or p.startswith(('Fork','Shock absorber'))]; ns=0
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
            rep={'i':i,'make':make,'model':model,'yr':yr,'doc':doc,'layout':mod.__name__[-9:],'n':len(keep),'sched':ns,'sched_problems':prob,'secs':dict(secs),
                 'damp':sum(1 for k in keep if re.search(r'damping / (Comfort|Standard|Sport)$',k[2])),'dropped':drop,'flagged':flagged,'notes':sorted(q)}
            report.append(rep)
            if keep: json.dump(rec,open(f'{outdir}/{i}.json','w'),ensure_ascii=False); i+=1
            else: rep['i']=None
    json.dump(report,open(outdir+'.report.json','w'),ensure_ascii=False,indent=1)
    for r in report:
        print(r['i'],r['make'],r['model'],r['yr'],r['doc'],r['layout'],'n',r['n'],'sched',r['sched'],'damp',r['damp'],'drop',len(r['dropped']),'flag',len(r['flagged']),'prob',len(r['sched_problems']))
if __name__=='__main__': main()
