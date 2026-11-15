"""Clean a finalized batch in place after the page check: section names set in lower case by a manual's running head are capitalised
("engine tightening torques" -> "Engine tightening torques"); rows matching a --drop regex (on "path|value") are removed; a path
that ends up twice is removed. Recomputes want and n.
usage: filter_batch.py <batch dir> [--drop REGEX ...]"""
import sys,json,glob,hashlib,re
h=lambda s:hashlib.sha256(s.encode()).hexdigest()
d=sys.argv[1]; drops=[re.compile(sys.argv[i+1]) for i,a in enumerate(sys.argv) if a=='--drop']
tot=0;rm=0
for f in sorted(glob.glob(d+'/[0-9]*.json')):
    r=json.load(open(f)); rows=[]
    for l in r['delta'].split('\n'):
        p=l.split('|'); p[3]=p[3][:1].upper()+p[3][1:]
        if any(x.search(p[3]+'|'+p[4]) for x in drops): rm+=1; continue
        rows.append('|'.join(p[1:]))
    paths=[x.split('|')[2] for x in rows]; dup={x for x in paths if paths.count(x)>1}
    rm+=sum(1 for x in rows if x.split('|')[2] in dup); rows=[x for x in rows if x.split('|')[2] not in dup]
    rows.sort(key=lambda x:h(x.split('|')[2]))
    r['delta']='\n'.join('+|'+x for x in rows); r['want']=h('\n'.join(rows)); r['n']=len(rows); tot+=len(rows)
    json.dump(r,open(f,'w'),ensure_ascii=False)
print('rows',tot,'removed',rm)
