"""Payloads for the pre-2020 KTM-group owner's manuals (technical data only; the service schedule reader is the 2020+ one and is
tried as well). Same checks and output as build_from_index.py: cover must name the model and year, a path printed with two
values is dropped, flagged shapes are left out, rows sorted by path hash, `want` = hash of the rows.
usage (from the PDF directory): build_older.py <index.tsv> <out dir> [doc ...]"""
import sys,json,hashlib,collections,os,re,subprocess
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import tech_data_pre2020 as td, validity as V
from build_from_index import flags
def h(s): return hashlib.sha256(s.encode()).hexdigest()
def main():
    index,outdir=sys.argv[1:3]; only=set(sys.argv[3:]); os.makedirs(outdir,exist_ok=True); i=0; report=[]
    jobs=collections.defaultdict(list)
    for line in open(index):
        if line.startswith(('#','make\t')): continue
        make,model,yr,doc,st=line.rstrip('\n').split('\t')[:5]
        if only and doc not in only: continue
        jobs[doc].append((make,model,int(yr)))
    for doc,bikes in jobs.items():
        path=doc+'.pdf'
        if not os.path.exists(path): report.append({'doc':doc,'notes':['MISSING PDF']}); continue
        sha=hashlib.sha256(open(path,'rb').read()).hexdigest()
        cover=re.sub(r'\s+',' ',subprocess.run(['pdftotext','-l','1',path,'-'],capture_output=True,text=True).stdout.replace('‑','-').replace('­','-'))
        rows=td.parse(path)
        for make,model,yr in bikes:
            V.REGION='US'
            if str(yr) not in cover or not re.search(r'(?<![\w-])'+re.escape(re.sub(r' (17/14|19/16)$','',model))+r'(?![\w-])',cover):
                report.append({'i':None,'make':make,'model':model,'yr':yr,'doc':doc,'n':0,'notes':['NOT ON COVER: '+cover[:160]]}); continue
            f,q=td.facts(rows,model)
            by=collections.defaultdict(set)
            for r,p,v in f: by[p].add((r['pdf'],r['printed'],v))
            keep=[];drop=[];flagged=[]
            for p,s in by.items():
                if len({v for _,_,v in s})!=1: drop.append(p); continue
                x=sorted(s)[0]; fl=flags(p,x[2])
                if fl or '|' in p+x[2] or x[1]=='?' or not x[2].strip() or p.count(' / ')<1: flagged.append((p,x[2],fl)); continue
                keep.append((x[0],x[1],p,x[2]))
            lines=[f'{a}|{b}|{p}|{v}|' for a,b,p,v in sorted(keep,key=lambda x:h(x[2]))]
            rec={'make':make,'model':model,'yr':yr,'doc':doc,'sha':sha,'want':h('\n'.join(lines)),'delta':'\n'.join('+|'+l for l in lines),'n':len(keep)}
            secs=collections.Counter(p.split(' / ')[0] for _,_,p,_ in keep)
            rep={'i':i if keep else None,'make':make,'model':model,'yr':yr,'doc':doc,'n':len(keep),'secs':dict(secs),'dropped':drop,'flagged':flagged,'notes':sorted(q)}
            report.append(rep)
            if keep: json.dump(rec,open(f'{outdir}/{i}.json','w'),ensure_ascii=False); i+=1
    json.dump(report,open(outdir+'.report.json','w'),ensure_ascii=False,indent=1)
    for r in report: print(r.get('i'),r.get('make'),r.get('model'),r.get('yr'),r['doc'],'n',r.get('n'),'drop',len(r.get('dropped',[])),'flag',len(r.get('flagged',[])),'|'.join(r.get('notes',[]))[:120])
if __name__=='__main__': main()
