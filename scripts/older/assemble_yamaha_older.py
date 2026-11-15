"""Collect the newest payload per bike-year into docs/research/older/yamaha-2010-2019 (numbered by model, year)."""
import json,glob,os,hashlib,re,sys
h=lambda s:hashlib.sha256(s.encode()).hexdigest()
best={}
for f in glob.glob('st_*/[0-9]*.json')+glob.glob('one/*/out/[0-9]*.json'):
    if f.startswith(('st_new','st_test')): continue
    r=json.load(open(f)); k=(r['model'],r['yr']); t=os.path.getmtime(f)
    if k not in best or t>best[k][0]: best[k]=(t,f,r)
skip={tuple(x.split('|')[:2]) for x in sys.argv[2:]}
out=sys.argv[1]; os.makedirs(out,exist_ok=True)
GRP={'Front suspension / Compression damping adjusting positions':'Front suspension / Compression damping',
     'Front suspension / Rebound damping adjusting positions':'Front suspension / Rebound damping',
     'Rear suspension / Rebound damping adjusting positions':'Rear suspension / Rebound damping'}
VAL=re.compile(r'(\d+(?:-\d+/\d+)?|\d+/\d+) (click|turn)s?(?: \(s\))? out\*?((?:\s*\(?[A-Z]{3}\))*)')
def table_damper(path,val):
    """A chapter-2 'adjusting positions' row -> (std path, value, unit) | None (drop) | 'keep'."""
    if 'adjusting positions' not in path and 'damping setting' not in path and not re.search(r'/ \*With',path): return 'keep'
    if path.startswith('Rear suspension / Spring preload adjusting positions'): return 'keep'
    g,_,lab=path.rpartition(' / ')
    if g not in GRP: return None
    lab=lab.strip(); val=val.strip()
    if lab.startswith('Maximum'):
        return (f'{GRP[g]} / Adjustment value from the start position (Hard)','0','') if val.lower().startswith('fully turned in') else None
    ms=VAL.findall(val)
    if not ms: return None
    if any(t for *_,t in ms): ms=[m for m in ms if '(USA)' in m[2]]
    if len(ms)!=1: return None
    n,u,_=ms[0]
    k={'Minimum':'Soft','Standard':'STD'}.get(lab)
    return (f'{GRP[g]} / Adjustment value from the start position ({k})',n,u) if k else None
BAD=re.compile(r'^\(Min|---|\(\d+(\.\d+)? ?in\)|\d mm\b')          # a label that swallowed a value cell
i=0; tot=0; dropped=[]
for k in sorted(best,key=lambda k:(k[0],k[1])):
    if (k[0],str(k[1])) in skip: continue
    r=best[k][2]; rows=[]; tabd=[]
    for l in r['delta'].split('\n'):
        p=l[2:].split('|')
        if (BAD.search(p[2].split(' / ')[-1]) or re.fullmatch(r'[^/]+ \(Min[^/]*\)',p[2])) and not p[2].startswith('Tightening torques'): dropped.append((k,p[2],p[3])); continue
        td=table_damper(p[2],p[3])
        if td is None: dropped.append((k,p[2],p[3])); continue
        if td!='keep':
            if any(td[0]==x.split('|')[2] for x in tabd): continue
            tabd.append('|'.join([p[0],p[1],td[0],td[1],td[2]])); continue
        segs=p[2].split(' / '); last=re.sub(r'(?<=[a-z)])(\s[A-Z])+$','',segs[-1])     # figure call-out letters ("Height H H D")
        if last!=segs[-1]: p[2]=' / '.join(segs[:-1]+[last])
        rows.append('|'.join(p))
    units={t.split('|')[2].rsplit(' (',1)[0]:t.split('|')[4] for t in tabd if t.split('|')[4]}
    tabd=[t if t.split('|')[4] else ('|'.join(t.split('|')[:4]+[units[t.split('|')[2].rsplit(' (',1)[0]]]) if t.split('|')[2].rsplit(' (',1)[0] in units else None) for t in tabd]
    tabd=[t for t in tabd if t]
    have={x.split('|')[2]:x.split('|')[3] for x in rows if 'Adjustment value from the start position' in x}
    for t in tabd:
        q=t.split('|')
        if q[2] in have:
            if have[q[2]]!=q[3]: dropped.append((k,'TABLE/PROCEDURE DISAGREE',q[2],q[3],have[q[2]]))
            continue
        rows.append(t)
    ps=[x.split('|')[2] for x in rows]; dup={x for x in ps if ps.count(x)>1}
    rows=[x for x in rows if x.split('|')[2] not in dup]
    rows.sort(key=lambda x:h(x.split('|')[2]))
    i+=1; r=dict(r); r['doc']=r['rev'].split(' /')[0]; r['delta']='\n'.join('+|'+x for x in rows); r['want']=h('\n'.join(rows)); r['n']=len(rows); tot+=len(rows)
    json.dump(r,open(f'{out}/{i}.json','w'),ensure_ascii=False)
print(i,'bike-years',tot,'rows'); print(len(dropped),'dropped'); [print(' ',d) for d in dropped[:30]]
