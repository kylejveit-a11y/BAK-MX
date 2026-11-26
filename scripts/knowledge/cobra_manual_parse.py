"""Parse the Specifications tables out of Cobra owner manuals (text made with pdftotext -layout from cobramoto.com PDFs).\nusage: python3 -I scripts/knowledge/cobra_manual_parse.py <dir of .txt> <out.json>. The manuals themselves are not stored."""
import re,glob,json,os,sys,collections
src=sys.argv[1]
out={}
for f in sorted(glob.glob(src+'/*.txt')):
    name=os.path.basename(f)[:-4]
    L=open(f,errors='replace').read().split('\n')
    idx=[i for i,l in enumerate(L) if re.match(r'^\s*Specifications\s*[-–]\s*General\s*$',l,re.I)]
    tq=[i for i,l in enumerate(L) if re.match(r'^\s*Specifications\s*[-–]\s*Torque Values\s*$',l,re.I)]
    if not idx or not tq: out[name]={'error':'no section'};continue
    a=idx[-1] if len(idx)==1 else idx[0]; b=[t for t in tq if t>a][0]
    gen=[];parent=None;held=None;pendkey=None
    stop=[i for i,l in enumerate(L[a+1:b]) if re.match(r'^\s*Optional',l)]
    body=[l for l in L[a+1:(a+1+stop[0]) if stop else b] if l.strip() and not re.match(r'^\s*\d+\s*$',l)]
    HEAD={'dimensions','engine','transmission','chassis'}
    def keyonly(l): return (len(l)-len(l.lstrip()))<8 and not re.search(r'\S\s{2,}\S',l.strip()) and l.strip().lower() not in HEAD
    for i,l in enumerate(body):
        m=re.match(r'^(\s*)(\S.*?)\s{2,}(\S.*)$',l)
        ind=len(l)-len(l.lstrip())
        if m and ind<12:
            pendkey=None
            k=m.group(2).strip();v=m.group(3).strip()
            if k.lower()=='items': gen.append(('_model',v));continue
            if ind>=2 and parent: k=parent+' / '+k
            else: parent=k
            gen.append((k,v))
        elif ind>=12:
            t=re.sub(r'\s{2,}',' ',l.strip())
            if pendkey is not None: gen[-1]=(gen[-1][0],(gen[-1][1]+' '+t).strip())
            elif i+1<len(body) and keyonly(body[i+1]): held=t
            elif gen: gen[-1]=(gen[-1][0],gen[-1][1]+' '+t)
        elif l.strip().lower() in HEAD: pendkey=None;parent=None
        else:
            k=l.strip();pendkey=k;parent=k
            gen.append((k,held or ''));held=None
    # torque
    e=b+1;tor=[]
    for l in L[b+1:b+60]:
        m=re.match(r'^\s*(\S.*?)\s{2,}([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(.*)$',l)
        if m: tor.append((m.group(1),m.group(2),m.group(3),m.group(4),m.group(5).strip()))
        if re.search(r'crows foot|\(SP\) To apply',l): break
    txt='\n'.join(L)
    pm=re.search(r'mixed at\s*([\d:]+)',txt)
    out[name]={'gen':gen,'torque':tor,'breakin_mix':pm.group(1) if pm else None}
json.dump(out,open(sys.argv[2],'w'),indent=0)
keys=collections.Counter(k for v in out.values() if 'gen' in v for k,_ in v['gen'])
print(len(out),[n for n,v in out.items() if 'error' in v])
for k,c in keys.most_common(): print(c,k)
print(collections.Counter(len(v.get('torque',[])) for v in out.values()))
