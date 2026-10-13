# New-layout (2025+) KTM-group owner's manual: "Technical specifications" chapter.
import pdfplumber,re,sys
from tech_data_2020_2025 import lines_of, join, head_note, is_note
import validity as V
MODEL=re.compile(r'\d+ (?:SX|XC|TC|TX|MC|EX|FC|FX)(?:-F)?(?: \d\d/\d\d)?(?: (?:[A-Z]{2}\b|Factory Edition|Heritage))?')
SK=[]
def clean(s):
    s=re.sub(r'\(\s*p\.\s*\d+\)','',s); s=re.sub(r'\s+',' ',s).strip()
    return s.replace(' ,',',').replace('( ','(').replace(' )',')')
def fold(parts):
    o=''
    for p in parts:
        if p: o=join(o,p)
    return o
def txt(ws): return clean(' '.join(w['text'] for w in ws))
def validity(s):
    """None if s is not a pure validity note, else list of model names it names."""
    t=s.strip()
    if not (t.startswith('(') and t.endswith(')')): return None
    inner=t[1:-1]; ms=MODEL.findall(inner)
    if not ms or MODEL.sub('',inner).strip(' ,/'): return None
    return ms
def secname(top,sub):
    s=sub.lower()
    if 'torque' in s: return 'Engine tightening torques' if 'engine' in s else 'Chassis tightening torques'
    if 'tuning' in s: return None
    if 'apacit' in s: return 'Capacities' if top in('Engine','Chassis') else top
    if 'technical data' in s: return 'Tires' if 'tires' in s else top
    if top=='Carburetor' and sub!='Carburetor': return top+' / '+sub
    return top
def parse(path):
    pdf=pdfplumber.open(path); rows=[]; top=None; sec=None; mode=None; grp=None; cur=None; seen=False; tire=False; hv=None
    for pi,pg in enumerate(pdf.pages):
        L=lines_of(pg)
        if not L: continue
        head=' '.join(w['text'] for w in L[0])
        if 'Technical specifications' not in head:
            if seen and rows: break
            continue
        seen=True
        base=104 if L[0][0]['x0']<100 else 54
        foot=[w['text'] for w in L[-1] if w['b'] and w['text'].isdigit()]
        printed=foot[0] if foot else '?'
        body=L[1:-1] if foot else L[1:]
        def new(lab,g,vals=None):
            r={'sec':sec,'grp':g,'lab':lab,'val':[],'size':[],'rem':[],'desc':[],'pdf':pi+1,'printed':printed,'hv':hv}
            rows.append(r); return r
        n=len(body)
        for i,l in enumerate(body):
            o=l[0]['x0']-base
            if l[0]['b'] and -4<=o<=0 and re.match(r'^\d+\.\d+(\.\d+){0,2}$',l[0]['text']):
                name=' '.join(w['text'] for w in l[1:]); grp=None; cur=None; tire=False
                if l[0]['text'].count('.')==1: top=name; sec=top; mode='row'; hv=None
                else:
                    sub,hv=head_note(name); sub=sub or ''
                    sec=secname(top,sub); mode='block' if 'apacit' in sub.lower() else 'torque' if 'torque' in sub.lower() else 'row'
                if 'torque' in name.lower() and l[0]['text'].count('.')==1: sec=None
                continue
            if sec is None: continue
            first=txt(l)
            if mode=='torque':
                lab=[];rest=[];px=None
                for w in l:
                    if not rest and abs(l[0]['x0']-base)<=3 and (px is None or w['x0']-px<=12) and not w['b']: lab.append(w)
                    else: rest.append(w)
                    px=w['x1']
                val=[w for w in rest if not w['b'] and w['x0']-base>=326]
                size=[w for w in rest if not w['b'] and w['x0']-base<326]
                rem=[w['text'] for w in rest if w['b'] and w['text']!='®']
                boldtxt=txt([w for w in l if w['b']])
                if boldtxt and is_note(boldtxt):
                    if cur: cur['variant']=True
                    continue
                if lab and val: cur=new(txt(lab),None); cur['val']=[txt(val)]
                elif lab and cur: cur['lab']=join(cur['lab'],txt(lab))
                if cur:
                    if size: cur['size'].append(txt(size))
                    cur['rem']+=rem
                continue
            if tire or (mode=='row' and first.startswith('Validity')):
                if first.startswith('Validity'): tire=True; cur=None; continue
                if first.startswith('The tires'): tire=False; sec=None; cur=None; continue
                lab=[w for w in l if w['x0']-base<125]; fr=[w for w in l if 125<=w['x0']-base<260]; rr=[w for w in l if w['x0']-base>=260]
                if lab: cur=new('@T'+txt(lab),None); cur['val']=['','']
                if cur and cur['lab'].startswith('@T'):
                    cur['val'][0]=join(cur['val'][0],txt(fr)); cur['val'][1]=join(cur['val'][1],txt(rr))
                continue
            # split label / value by the value column (base+223)
            lab=[w for w in l if w['x0']-base<215]; val=[w for w in l if w['x0']-base>=215]
            # a long label may run into the value column: label words are contiguous from the line start
            if lab and val:
                k=[w for w in l]; cut=None
                for a,b in zip(k,k[1:]):
                    g=b['x0']-a['x1']
                    if (g>8 and b['x0']-base>=215) or g>25: cut=b; break
                if cut is None: lab=l; val=[]
                else: lab=[w for w in l if w['x0']<cut['x0']]; val=[w for w in l if w['x0']>=cut['x0']]
            if lab and all(w['b'] for w in lab) and not is_note(txt(lab)): SK.append((pi+1,'B '+txt(l))); cur=None; continue   # notes
            ind=None
            if lab:
                lo=lab[0]['x0']-base; ind=0 if abs(lo)<=3 else 1 if abs(lo-15)<=3 else 9
            if ind==9: SK.append((pi+1,txt(l))); cur=None; continue
            if mode=='block':
                nxt=body[i+1] if i+1<n else None
                nxt_has_val=bool(nxt) and any(w['x0']-base>=215 and abs(w['x0']-base-223)<90 for w in nxt) and not (nxt[0]['b'] and re.match(r'^\d+\.\d',nxt[0]['text']))
                nxt_note=bool(nxt) and is_note(txt([w for w in nxt if w['x0']-base<215]) or 'x')
                if lab and not val and ind==0 and nxt_note and not is_note(txt(lab)): grp=txt(lab); cur=None; continue
                if lab and not val and nxt_has_val and ind==0:
                    if not is_note(txt(lab)): grp=None
                    cur=new(txt(lab),grp); continue
                if cur:
                    if val: cur['val']+=[(w['top'],w['x0'],w['text']) for w in val]
                    if lab: cur['desc'].append(txt(lab))
                continue
            if ind is None:
                if cur: cur['val'].append(txt(val))
                continue
            nx=next((b for b in body[i+1:] if b[0]['x0']-base<215),None)
            nind=None
            if nx is not None and not (nx[0]['b'] and re.match(r'^\d+\.\d',nx[0]['text'])):
                d=nx[0]['x0']-base; nind=0 if abs(d)<=3 else 1 if abs(d-15)<=3 else 9
            if ind==0 and not val:
                if nind==1 or nx is None: grp=txt(lab); cur=None
                elif cur and cur['grp'] is None: cur['lab']=join(cur['lab'],txt(lab))
                else: cur=None
                continue
            if ind==0: grp=None
            if ind==1 and not val:
                if cur and cur['grp']==grp: cur['lab']=join(cur['lab'],txt(lab))
                continue
            if cur and txt(val).startswith('(') and not txt(lab).startswith('('):
                cur['lab']=join(cur['lab'],txt(lab)); cur['val'].append(txt(val)); continue
            cur=new(txt(lab),grp if ind==1 else None); cur['val']=[txt(val)]
    return rows
def facts(rows,model):
    out=[]; quals=set()
    for r in rows:
        lab=r['lab']; grp=r['grp']; ok=True
        if r.get('hv'):
            quals.add(r['hv'])
            if not V.applies(r['hv'],model): ok=False
        if lab.startswith('@T'):
            a=V.applies(lab[2:],model); quals.add(lab[2:])
            if not ok or a is False: continue
            out.append((r,'Tires / Front tire',r['val'][0])); out.append((r,'Tires / Rear tire',r['val'][1])); continue
        parts=[]
        for s in (grp,lab):
            if s is None: continue
            t,o,n=V.strip(s if not is_note(s) else '('+s.strip('()')+')',model); quals.update(n)
            if not o: ok=False
            if t: parts.append(t)
        if r.get('variant'): quals.add('VARIANT '+' / '.join(parts)); continue
        if not ok or not parts: 
            if ok and not parts: quals.add('NOLABEL '+str(r['val'])[:60])
            continue
        if r['desc'] or (r['val'] and isinstance(r['val'][0],tuple)):
            vs=sorted(r['val']); t0=vs[0][0] if vs else 0
            val=clean(' '.join(t for tp,_,t in sorted((v for v in vs if v[0]-t0<=5),key=lambda v:v[1])))
            if r['desc']: val+='; '+clean(fold(r['desc']))
        else:
            val=clean(fold(r['val'])).replace('● ','').strip()
            if '●' in ' '.join(r['val']): val=', '.join(val.split())
        if 'torque' in r['sec'].lower():
            if r['size']: parts[-1]+=' ('+clean(' '.join(r['size'])).replace(' × ','x')+')'
            if r['rem']: val+='; '+' '.join(r['rem'])
        val=re.sub(r'− (\d+) ° C',r'−\1 °C',val); val=re.sub(r'lb\s*/in\) f',r'lbf/in)',val); val=re.sub(r'\(− ([\d.]+) ° F\)',r'(−\1 °F)',val); parts=[re.sub(r'^‒ ','',p) for p in parts]
        if 'torque' in r['sec'].lower(): parts[-1]=parts[-1].replace('(‒ ','(')
        if not val or re.search(r'\d:\d\d [AP]M',val): quals.add('DROPPED '+' / '.join(parts)+' = '+val); continue
        out.append((r,' / '.join([r['sec']]+parts),val))
    return out,quals
if __name__=='__main__':
    rows=parse(sys.argv[1]); f,q=facts(rows,sys.argv[2])
    print(q)
    for r,p,v in f: print(r['pdf'],r['printed'],'|',p,'=',v)
