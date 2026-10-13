import pdfplumber, re, sys, json
import validity as V
def is_note(s): return V.applies(s,'125 SX') is not None
def head_note(name):
    if is_note(name): return None,name
    if V.suspicious(name): return V.PAR.sub('',name).strip(),'?'+name
    notes=[m for m in V.PAR.findall(name) if is_note(m)]
    base=V.PAR.sub(lambda m:'' if is_note(m.group(1)) else m.group(0),name).strip()
    return base,(notes[0] if notes else None)
VALCOLS=(147,156,223,295)
MERGED=[]; SKIPPED=[]
def lines_of(pg):
    ws=pg.extract_words(extra_attrs=['fontname'],x_tolerance=1.2,y_tolerance=2)
    # size of a word = size of its first glyph (asking extract_words for size would split words at superscripts)
    sizes={(round(c['x0'],1),round(c['top'],1)):c['size'] for c in pg.chars}
    for w in ws: w['size']=sizes.get((round(w['x0'],1),round(w['top'],1)),9.0)
    L=[]
    for w in sorted(ws,key=lambda w:(w['top'],w['x0'])):
        w['b']=bool(re.search(r'Bold|-Bd$|Black|Heavy',w['fontname'])) or w['size']>=9.8; w['text']=w['text'].replace('\u00ad','-')
        if L and abs(L[-1][0]['top']-w['top'])<3.5: L[-1].append(w)
        else: L.append([w])
    L=[sorted(l,key=lambda w:w['x0']) for l in L]
    out=[]
    for l in L:
        # stacked tolerance: a line of "− n" pairs printed directly under "+ m" pairs of the line above
        if out and len(l)%2==0 and all(l[i]['text']=='−' for i in range(0,len(l),2)) and l[0]['top']-out[-1][0]['top']<7:
            prev=out[-1]; ok=True; todo=[]
            for i in range(0,len(l),2):
                j=next((k for k,w in enumerate(prev) if w['text']=='+' and abs(w['x0']-l[i]['x0'])<2 and k+1<len(prev)),None)
                if j is None: ok=False; break
                todo.append((j,l[i+1]['text']))
            if ok:
                for j,t in todo:
                    prev[j]=dict(prev[j],text='+'+prev[j+1]['text']+'/−'+t); prev[j+1]=dict(prev[j+1],text='')
                out[-1]=[w for w in prev if w['text']]
                MERGED.append(' '.join(w['text'] for w in out[-1])); continue
        out.append(l)
    return out
def clean(s):
    s=re.sub(r'\(\s*p\.\s*\d+\)','',s)
    s=re.sub(r'\s+',' ',s).strip()
    s=s.replace(' ,',',').replace('( ','(').replace(' )',')')
    return s
def join(a,b):
    if not a: return b
    if a.endswith('-') and b[:1].islower(): return a[:-1]+b
    return a+' '+b
def parse(path):
    pdf=pdfplumber.open(path); rows=[]; sec=None; skip=False; grp=None; cur=None; seen=False; hv=None; top=None
    for pi,pg in enumerate(pdf.pages):
        L=lines_of(pg)
        if not L: continue
        head=' '.join(w['text'] for w in L[0])
        if 'TECHNICAL DATA' not in head and 'TECHNICAL SPECIFICATIONS' not in head:
            if seen and rows: break
            continue
        seen=True
        base=104 if L[0][0]['x0']<100 else 54
        foot=[w['text'] for w in L[-1] if w['text'].isdigit() and (w['b'] or len(L[-1])==1)]
        printed=foot[0] if foot else '?'
        body=L[1:-1] if foot else L[1:]
        items=[]
        for l in body:
            o=l[0]['x0']-base
            if l[0]['b'] and -4<=o<=0 and re.match(r'^\d+\.\d+(\.\d+)?$',l[0]['text']):
                items.append(('H',l[0]['text'],' '.join(w['text'] for w in l[1:]))); continue
            lab=[];vals={};rem=[];px=-99
            for w in l:
                wo=w['x0']-base
                if w['b'] and wo>=375 and not any(x['b'] and x['x0']-base<375 for x in l):
                    if w['text']!='®': rem.append(w['text'])
                    px=w['x1']; continue
                col=None
                for c in VALCOLS:
                    if abs(wo-c)<=4: col=c
                gap=w['x0']-px; px=w['x1']
                if col is not None and (not vals or col>max(vals)) and (wo>100) and gap>6:
                    vals[col]=[w['text']]
                elif vals: vals[max(vals)].append(w['text'])
                else: lab.append(w)
            ind=None
            if lab:
                lo=lab[0]['x0']-base
                ind=0 if abs(lo)<=3 else 1 if abs(lo-15)<=3 else 9
            items.append(('L',ind,' '.join(w['text'] for w in lab),{k:' '.join(v) for k,v in vals.items()},' '.join(rem),any(w['b'] for w in lab),l[0]['top']))
        prev_y=None; flat=None
        for i,it in enumerate(items):
            if it[0]=='H':
                prev_y=None; flat=None
                num,name=it[1],re.sub(r'^Motor\b','Engine',it[2])
                if num.count('.')==1: sec=name; top=name; hv=None; skip=False
                else:
                    sub,hv=head_note(name)
                    if sub: sub=re.sub(r'^Carburetor - basic setting','Basic carburetor setting',sub)
                    sec=top+' / '+sub if (top=='Carburetor' and sub and sub!='Carburetor') else top
                    skip = bool(sub) and 'tuning' in sub
                grp=None; cur=None
                if name=='Tires': skip='T'
                continue
            _,ind,lab,vals,rem,bold,top_y=it
            gap=top_y-prev_y if prev_y is not None else None; prev_y=top_y
            if skip is True or sec is None: continue
            vals={k:clean(v) for k,v in vals.items()}; vals={k:v for k,v in vals.items() if v}
            lab=clean(lab)
            if skip=='T':
                if lab.startswith('The tires'): skip=True; cur=None; continue
                if lab=='Validity': continue
                if lab or not cur:
                    cur={'sec':sec,'grp':None,'lab':'@T'+lab,'vals':dict(vals),'rem':'','pdf':pi+1,'printed':printed,'hv':hv}; rows.append(cur)
                else:
                    for k,v in vals.items(): cur['vals'][k]=join(cur['vals'].get(k,''),v)
                continue
            if ind==9 or (bold and ind is not None): SKIPPED.append((pi+1,lab,str(vals))); cur=None; continue   # prose / info boxes
            if ind is None:
                if cur:
                    for k,v in vals.items(): cur['vals'][k]=join(cur['vals'].get(k,''),v)
                    if rem: cur['rem']=join(cur['rem'],rem)
                continue
            nxt=next((x for x in items[i+1:] if x[0]=='H' or x[1] is not None),None)
            if ind==0 and not vals:
                # Rows are 14.4 pt apart; the lines of one row are closer than 12.5 pt.
                same_row=gap is not None and gap<12.5
                nx=items[i+1] if i+1<len(items) else None
                nx_fills=nx is not None and nx[0]=='L' and nx[1] in (0,None) and any(clean(v) for v in nx[3].values()) and nx[6]-top_y<12.5
                if nxt and nxt[0]=='L' and nxt[1]==1 and not nx_fills: grp=lab; cur=None
                elif cur and same_row: cur['lab']=join(cur['lab'],lab)
                elif nx_fills:        # a row whose value is printed beside its second line
                    grp=None; cur={'sec':sec,'grp':None,'lab':lab,'vals':{},'rem':'','pdf':pi+1,'printed':printed,'hv':hv,'pending':True,'desc':''}; rows.append(cur); continue
                elif nxt is None: grp=lab; cur=None      # group header at the foot of a page
                elif nxt[0]=='L' and nxt[1]==0 and any(clean(v) for v in nxt[3].values()): flat=lab; cur=None   # heading row for the single row below it
                else: cur=None
                if rem and cur: cur['rem']=join(cur['rem'],rem)
                continue
            if ind==0 and cur and cur.get('pending') and gap is not None and gap<12.5:
                cur['desc']=join(cur['desc'],lab)
                for k,v in vals.items(): cur['vals'][k]=join(cur['vals'].get(k,''),v)
                continue
            if ind==0 and cur and is_note(lab):
                cur['lab']=join(cur['lab'],lab if lab.startswith('(') else '('+lab+')')
                for k,v in vals.items(): cur['vals'][k]=join(cur['vals'].get(k,''),v)
                continue
            if ind==0:
                grp=None
                first=cur['vals'].get(min(cur['vals'])) if cur and cur['vals'] else ''
                if cur and first.count('(')>first.count(')'):
                    cur['lab']=join(cur['lab'],lab)
                    for k,v in vals.items(): cur['vals'][k]=join(cur['vals'].get(k,''),v)
                    continue
            if ind==1 and not vals and cur and cur['grp']==grp:
                cur['lab']=join(cur['lab'],lab); continue
            cur={'sec':sec,'grp':grp if ind==1 else (flat if ind==0 else None),'lab':lab,'vals':dict(vals),'rem':rem,'pdf':pi+1,'printed':printed,'hv':hv}; rows.append(cur); flat=None
    return rows
def facts(rows,model):
    out=[];quals=set()
    for r in rows:
        lab=r['lab']; grp=r['grp']; ok=True
        if r.get('hv'):
            quals.add(('UNRECOGNIZED ' if r['hv'].startswith('?') else '')+r['hv'])
            if r['hv'].startswith('?') or not V.applies(r['hv'],model): ok=False
        if lab.startswith('@T'):
            q=lab[2:]; a=V.applies(q,model) if q else True; quals.add(q)
            if not ok or a is False: continue
            ks=sorted(r['vals'])
            if len(ks)==2:
                out.append((r,'Tires / Front tire',r['vals'][ks[0]])); out.append((r,'Tires / Rear tire',r['vals'][ks[1]]))
            continue
        lab,o1,n1=V.strip(lab,model); g2,o2,n2=V.strip(grp or '',model); grp=g2 or None
        quals.update(n1+n2)
        if not (ok and o1 and o2): continue
        ks=sorted(r['vals'])
        if not ks: continue
        if 'torques' in r['sec']:
            if len(ks)==1 and ks[0]==295: val=r['vals'][295]
            elif len(ks)<2: out.append((r,'!BAD '+lab,str(r['vals']))); continue
            else: lab=f"{lab} ({r['vals'][ks[0]]})"; val=r['vals'][ks[1]]
            if r['rem']: val+='; '+re.sub(r'\s+',' ',r['rem'].replace('®',' '))
        else:
            val='; '.join(r['vals'][k] for k in ks)
            if r.get('desc'): val+='; '+r['desc']
        path=' / '.join(x for x in (r['sec'],grp,lab) if x)
        out.append((r,path,val))
    return out,quals
if __name__=='__main__':
    rows=parse(sys.argv[1]); f,q=facts(rows,sys.argv[2])
    print(q)
    for r,p,v in f: print(r['pdf'],r['printed'],'|',p,'=',v)
