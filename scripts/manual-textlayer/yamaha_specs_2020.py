"""Yamaha Owner's Service Manual specification tables, older (2020 two-stroke) layout.

The 2020 YZ125/YZ125X (B0V) and YZ250/YZ250X (B9U) manuals set chapter 2 as ruled tables: GENERAL SPECIFICATIONS
(item | value) and MAINTENANCE SPECIFICATIONS (item | Standard | Limit). Where the value differs by market the Standard
cell is split by an inner rule under a header such as "USA, CAN, EUROPE, NZ, ZA | AUS"; only the sub-column whose header
names USA is read. Rows that apply to one model are printed under a model sub-heading ("YZ250", "YZ250X") or tagged
"(YZ250X)"; the requested model's rows are kept. Market-tagged value lines ("B9U5 (USA, CAN)") keep the USA line only.

Each metric value in mm with an inch conversion is checked against it; a mismatch drops the row (catches a value read
from the wrong column). Electrical specifications and tightening torques are not read (as with the newer-layout reader).

The damper settings are not in this table: they are read from the adjustment procedures ("ADJUSTING THE FRONT FORK
REBOUND DAMPING FORCE", ... "Extent of adjustment: Maximum Fully turned in position / Minimum 20 clicks out",
"Standard position: YZ250: 12 clicks out") by dampers().

usage: yamaha_specs_2020.py manual.pdf --model YZ250X"""
import pdfplumber,re,sys,os
sys.path.insert(0,os.path.dirname(__file__))
from yamaha_specs import split_value
MODELS={'YZ125','YZ125X','YZ250','YZ250X'}
SKIP_SECTIONS={'ELECTRICAL'}

def vrules(pg):
    segs=[]
    for l in pg.lines+pg.edges:
        if abs(l['x0']-l['x1'])<1 and l['bottom']-l['top']>20 and l['x0']<565: segs.append((round(l['x0']),l['top'],l['bottom']))
    out={}
    for x,t,b in segs:
        k=next((k for k in out if abs(k-x)<=2),x)
        lo,hi=out.get(k,(t,b)); out[k]=(min(lo,t),max(hi,b))
    return out
def hrules(pg):
    return [(l['top'],l['x0'],l['x1']) for l in pg.lines+pg.edges if abs(l['top']-l['bottom'])<1 and l['x1']-l['x0']>20]

def lines_of(words,tol=4.5):
    rows=[]
    for w in sorted(words,key=lambda w:(w['top'],w['x0'])):
        r=next((r for r in rows if abs(r['top']-w['top'])<=tol),None)
        if r is None: r={'top':w['top'],'w':[]}; rows.append(r)
        r['w'].append(w)
    for r in rows: r['w'].sort(key=lambda w:w['x0'])
    return sorted(rows,key=lambda r:r['top'])
def text(ws):
    t=' '.join(w['text'] for w in ws)
    t=re.sub(r'\bcm ?3\b','cm³',t); t=re.sub(r'\bcm ?2\b','cm²',t); t=t.replace('(cid:129)','·')
    return t.strip()

CONV=re.compile(r'^(\d[\d,.]*)(?:–(\d[\d,.]*))?\s*mm\s*\((\d[\d.]*)(?:–(\d[\d.]*))?\s*in\)')
def conv_ok(v):
    m=CONV.match(v)
    if not m: return True
    a=[m.group(1),m.group(2)]; b=[m.group(3),m.group(4)]
    for x,y in zip(a,b):
        if x is None and y is None: continue
        if x is None or y is None: return False
        x=float(x.replace(',','')); dec=len(y.split('.')[1]) if '.' in y else 0
        if abs(x/25.4-float(y))>0.5*10**-dec+abs(float(y))*0.002: return False
    return True

def parse(path,model):
    pdf=pdfplumber.open(path); rows=[]; problems=[]; seen=False; section=None; stack=[]; prev=None
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        head=' '.join(w['text'] for w in ws if w['top']<30)
        if not re.search(r'(GENERAL|MAINTENANCE) SPECIFICATIONS',head):
            if seen: break
            continue
        seen=True
        printed=next((w['text'] for w in ws if re.fullmatch(r'\d-\d+',w['text']) and w['top']>700),'?')
        V=vrules(pg); H=hrules(pg)
        if not V: problems.append((pi+1,'no table')); continue
        left=min(V); right=max(V); ttop=V[left][0]; tbot=V[left][1]
        full=[x for x,(t,b) in V.items() if left<x<right and t<=ttop+3 and b>=tbot-3]
        if not full: problems.append((pi+1,'no item column rule')); continue
        item_r=min(full); lim_l=max(full) if len(full)>1 and 'MAINTENANCE' in head else None
        std_r=lim_l or right
        splits=[(x,t,b) for x,(t,b) in V.items() if item_r+5<x<std_r-5 and not (t<=ttop+3 and b>=tbot-3)]
        # a section heading above the table ("ENGINE", "CHASSIS"); a page without one continues the previous section
        sh=[w for w in ws if 40<w['top']<ttop-2 and w['x0']<100 and w['text'].isupper()]
        if sh: section=text(sh).title()
        if section and section.upper() in SKIP_SECTIONS: continue
        regions=[]
        for x,t,b in splits:
            hdr=[h for h in H if t-2<=h[0]<=b and h[1]<=item_r+3 and h[2]>=x-3 and h[2]<right+3 and h[1]>=item_r-3]
            hb=min((h[0] for h in hdr if h[0]>t+5),default=None)
            if hb is None: problems.append((pi+1,'split without header',x)); continue
            hw=[w for w in ws if t<w['top']<hb and w['x0']>=item_r]
            lt=text([w for w in hw if w['x0']<x]); rt=text([w for w in hw if w['x0']>=x])
            if 'USA' not in lt or 'USA' in rt: problems.append((pi+1,'USA not first column',lt,rt)); continue
            regions.append((t,hb,b,x))
        tw=[w for w in ws if ttop<w['top']<tbot and left<=w['x0']<right]
        for ln in lines_of(tw):
            y=ln['top']
            if text(ln['w']).startswith('Item Standard'): continue
            reg=next((r for r in regions if r[0]<y<r[2]),None)
            lab=[w for w in ln['w'] if w['x0']<item_r]
            if reg and y<reg[1]: std=[]                                # the market header row of a split group
            elif reg: std=[w for w in ln['w'] if item_r<=w['x0']<reg[3]]
            else: std=[w for w in ln['w'] if item_r<=w['x0']<std_r]
            lim=[w for w in ln['w'] if lim_l and w['x0']>=lim_l]
            L=text(lab); S=text(std); M=text(lim)
            x0=lab[0]['x0'] if lab else None
            if not L:
                if prev and (S or M):
                    if S: prev['std'].append(S)
                    if M: prev['lim'].append(M)
                continue
            if x0<left+8: stack=[]                                     # a group heading at the table's left edge
            if prev and (L[0].islower() or prev['label'].count('(')>prev['label'].count(')') or prev['label'].endswith('-')):
                prev['label']=(prev['label'][:-1] if prev['label'].endswith('-') else prev['label']+' ')+L   # a wrapped label
                if S: prev['std'].append(S)
                if M: prev['lim'].append(M)
                continue
            if not S and not M:
                stack=[s for s in stack if s[0]<x0-3]
                if L.startswith('<') and stack: stack[-1]=(stack[-1][0],stack[-1][1]+' ('+L.strip('<>')+')'); continue
                if re.fullmatch(r'"[A-Z]"',L) and prev: continue          # a wrapped measuring-point letter
                stack.append((x0,L.rstrip(':').strip())); prev=None; continue
            stack=[s for s in stack if s[0]<x0-3]
            lab=L.rstrip(':').strip()
            if lab in ('Quantity','Operation'):                         # an attribute of the row (or group) above it
                base=prev['label'] if prev and prev['pdf']==pi+1 and prev['label'] not in MODELS else (stack[-1][1] if stack else '')
                if stack and base==stack[-1][1]: stack=stack[:-1]
                base=re.sub(r'\s+(thickness|free length|type)$','',base)
                lab=f'{base} {lab.lower()}'.strip()
                if prev and prev['label'] in MODELS: stack=[s for s in stack if s[1]!=base]
            prev={'pdf':pi+1,'printed':printed,'label':lab,'stack':[s[1] for s in stack],'std':[S] if S else [],'lim':[M] if M else [],'section':section}
            rows.append(prev)
    out=[]
    for r in rows:
        names=r['stack']+[r['label']]
        tags=[n for n in names if n in MODELS]
        m=re.search(r'\s*\((YZ\d+X?)\)$',r['label'])
        if m: tags.append(m.group(1)); names[-1]=r['label'][:m.start()]
        if tags and any(t!=model for t in tags): continue
        names=[re.sub(r'\s*"[A-Z]"$','',n).rstrip('/').replace(' :',', ') for n in names if n not in MODELS]
        while any(n.startswith('<') for n in names[1:]):                 # "Preload length / <Min.–Max.>"
            k=next(i for i,n in enumerate(names) if i and n.startswith('<')); names[k-1:k+1]=[names[k-1]+' ('+names[k].strip('<>')+')']
        if names[0]=='Model name': continue                              # market model names; the model code row identifies the bike
        if not names: problems.append(('row without label',r)); continue
        p=' / '.join(names)
        has_lim=bool([v for v in r['lim'] if v.strip('- ')])
        for vals,suffix in ((r['std'],''),(r['lim'],' limit')):
            if not vals: continue
            q=p
            if 'limit' in p.lower():
                if suffix: suffix=''                                       # "Runout limit" / "Swingarm free play limit / End": the limit column
                elif has_lim: q=re.sub(r'\s+limit\b','',p,count=1)+' (standard)'   # its standard value
            tagged=[v for v in vals if re.search(r'\((?:USA|EUROPE|AUS|CAN|NZ)[^)]*\)\s*$',v)]
            if tagged:
                keep=[re.sub(r'\s*\([^)]*\)\s*$','',v) for v in tagged if 'USA' in v]
                if len(keep)>1:                                            # two US lines with no model named ("B0V5", "B1B5")
                    problems.append(('ambiguous market lines',p,keep)); continue
                vals=keep+[v for v in vals if v not in tagged]
            v=' '.join(vals).strip()
            if not v or not v.strip('- '): continue
            v=re.sub(r'(\w)- ([a-z])',r'\1\2',v); v=re.sub(r'(\w)- (\d)',r'\1-\2',v); v=re.sub(r'\s*/\s*(?=\S)','/',v)   # a word or a pair split across lines
            if '←' in v: problems.append(('arrow in USA column',q+suffix,v)); continue
            if not conv_ok(v): problems.append(('conversion mismatch',q+suffix,v)); continue
            val,u=split_value(v.replace(',','') if re.match(r'^\d{1,3},\d{3}\b',v) else v)
            out.append((r['pdf'],r['printed'],q+suffix,val,u))
    # the general table and the maintenance table both print some rows (carburetor type): one copy is kept when they agree
    ded=[]; seenp={}
    for r in out:
        if r[2] in seenp:
            if seenp[r[2]][3:]!=r[3:]: problems.append(('same row, two values',r[2],seenp[r[2]][3],r[3]))
            continue
        seenp[r[2]]=r; ded.append(r)
    return ded,problems

HEAD=re.compile(r'^ADJUSTING THE (FRONT FORK|REAR SHOCK)')
GROUP=[(r'FRONT FORK REBOUND','Front suspension / Rebound damping'),(r'FRONT FORK COMPRESSION','Front suspension / Compression damping'),
       (r'REAR SHOCK ABSORBER REBOUND','Rear suspension / Rebound damping'),(r'REAR SHOCK ABSORBER LOW COMPRESSION','Rear suspension / Slow compression damping'),
       (r'REAR SHOCK ABSORBER HIGH COMPRESSION','Rear suspension / Fast compression damping')]
DV=re.compile(r'^((?:\d+-\d+/\d+|\d+/\d+|\d+(?:[-–]\d+)?)(?:±\d+/\d+)?)\s+(clicks?|turns?)\s+out')
def dampers(path,model):
    import yamaha_dampers
    pdf=pdfplumber.open(path); lines=list(yamaha_dampers.column_lines(pdf))
    out=[]; problems=[]; i=0; done=set()
    while i<len(lines):
        pg,t=lines[i]
        if not HEAD.match(t): i+=1; continue
        h=t; j=i+1
        while j<len(lines) and not re.match(r'^\d\.',lines[j][1]) and len(h)<120: h+=' '+lines[j][1]; j+=1
        grp=next((g for k,g in GROUP if re.search(k,h)),None)
        if not grp or grp in done: i=j; continue
        block=[]; k=j
        while k<len(lines) and not HEAD.match(lines[k][1]) and not lines[k][1].startswith('CHECKING'): block.append(lines[k]); k+=1
        txt=[b[1] for b in block]
        try: e=txt.index('Maximum Minimum')
        except ValueError: problems.append((grp,'no extent')); i=k; continue
        ext=' '.join(txt[e+1:e+3])
        mx=re.search(r'Fully turned in',ext); mn=re.search(r'(\S+)\s+(clicks?|turns?)\s+out',ext)
        try: s=txt.index('Standard position:')
        except ValueError: problems.append((grp,'no standard')); i=k; continue
        std=None; cur=None
        for l in txt[s+1:s+6]:
            if re.fullmatch(r'(YZ\d+X?):',l): cur=l[:-1]; continue
            v=DV.match(l)
            if v and (cur is None or cur==model): std=v; break
        if not (mx and mn and std): problems.append((grp,'incomplete',ext,txt[s:s+6])); i=k; continue
        unit=mn.group(2).rstrip('s')[:5]
        if std.group(2).rstrip('s')!=unit: problems.append((grp,'unit mismatch')); i=k; continue
        pg0=block[s][0]; done.add(grp)
        for lab,val in (('Soft',mn.group(1)),('STD',std.group(1)),('Hard','0')):
            out.append((pg0,None,f'{grp} / Adjustment value from the start position ({lab})',val,unit))
        i=k
    return out,problems

if __name__=='__main__':
    model=sys.argv[sys.argv.index('--model')+1]
    o,p=parse(sys.argv[1],model); print('PROBLEMS',p,len(o))
    for x in o: print(x)
    o,p=dampers(sys.argv[1],model); print('DAMPER PROBLEMS',p,len(o))
    for x in o: print(x)
