"""Every row of a batch must show its label and value on its own PDF page (pdftotext layout text).
usage: check_pages.py <batch dir> <pdf dir>   prints rows it cannot find (renamed gear labels and long wrapped text are skipped)."""
import json,glob,subprocess,re,sys,os
bd,pd=sys.argv[1:3]; cache={}; bad=[]; n=0
def page(doc,p):
    k=(doc,p)
    if k not in cache:
        cache[k]=re.sub(r'\s+',' ',subprocess.run(['pdftotext','-layout','-f',str(p),'-l',str(p),os.path.join(pd,doc+'.pdf'),'-'],capture_output=True,text=True).stdout.replace('USA','US').replace('‑','-'))
    return cache[k]
norm=lambda s:re.sub(r'\s+',' ',s.replace('‑','-'))
for f in glob.glob(bd+'/[0-9]*.json'):
    d=json.load(open(f))
    for l in d['delta'].split('\n'):
        _,pdf,pr,path,val,_=l.split('|'); n+=1
        last=path.split(' / ')[-1]
        if 'gear' in last.lower() or len(val)>45 or path.startswith('Service schedule'): continue
        t=page(d['doc'],int(pdf)); v0=norm(val.split(';')[0].split(' (')[0].strip()); lab=norm(last.split(' (')[0][:22])
        if v0 not in t or lab not in t: bad.append((d['model'],d['yr'],pdf,path,val))
print(n,'rows',len(bad),'not found')
for b in bad[:40]: print(b)
