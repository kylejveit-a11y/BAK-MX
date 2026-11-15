"""Page check for Yamaha payloads: every number in a row's value, and the first words of its label, must appear on the row's own
PDF page (pdftotext text, whitespace collapsed). Yamaha rows drop the inch conversion and the thousands comma ("2,135 mm" -> 2135),
so numbers are matched with or without the comma. Damper rows (read from the adjustment procedure across columns) check numbers only.
usage: check_pages_yamaha.py <batch dir or payload files...> <pdf dir>"""
import json,glob,subprocess,re,sys,os
*srcs,pd=sys.argv[1:]; cache={}; bad=[]; n=0
files=[f for s in srcs for f in (glob.glob(s+'/[0-9]*.json') if os.path.isdir(s) else [s])]
def page(doc,p):
    if (doc,p) not in cache:
        t=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),os.path.join(pd,doc+'.pdf'),'-'],capture_output=True,text=True).stdout
        cache[(doc,p)]=re.sub(r'\s+',' ',t.replace('•','·'))
    return cache[(doc,p)]
def num_ok(x,t):
    if x in t: return True
    if re.fullmatch(r'\d{4,}',x) and f'{x[:-3]},{x[-3:]}' in t: return True
    if re.fullmatch(r'\d+',x) and (x+'.0' in t or x+'.00' in t): return True
    if re.fullmatch(r'\d+\.\d+',x) and any(x+z in t for z in ('0','00')): return True
    return False
for f in files:
    d=json.load(open(f))
    for l in d['delta'].split('\n'):
        _,pdf,pr,path,val,unit=l.split('|'); n+=1
        t=page(d.get('doc') or d['rev'].split(' /')[0],int(pdf))
        nums=re.findall(r'\d+(?:\.\d+)?',re.sub(r'^TIP: ','',val))
        miss=[x for x in nums if not num_ok(x,t)]
        last=re.sub(r'\s*\((?:[^()]|\([^()]*\))*\)$','',path.split(' / ')[-1])
        lab=' '.join(last.split()[:3])
        lab_ok='Adjustment value from the start position' in path or path.startswith('Rear suspension setting') or lab.lower() in t.lower()
        if miss or not lab_ok: bad.append((d['model'],d['yr'],pdf,path,val,miss,lab_ok))
print(n,'rows',len(bad),'not found')
for b in bad[:int(os.environ.get('SHOW','40'))]: print(b)
