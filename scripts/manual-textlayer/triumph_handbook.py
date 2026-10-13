"""Triumph off-road owner's handbook (public PDF): Specifications chapter tables, one table per section and model."""
import pdfplumber,re,sys
def bold(w): return bool(re.search(r'Bold|-Bd|Black|Heavy|Semibold|Medium',w['fontname']))
def lines_of(pg):
    ws=pg.extract_words(extra_attrs=['fontname'],x_tolerance=1.5,y_tolerance=2); L=[]
    for w in sorted(ws,key=lambda w:(w['top'],w['x0'])):
        if L and abs(L[-1][0]['top']-w['top'])<2.5: L[-1].append(w)
        else: L.append([w])
    return [sorted(l,key=lambda w:w['x0']) for l in L]
def norm_model(s): return re.sub(r'[\s-]|Edition','',s).upper()
def clean(s): return re.sub(r'\s+',' ',s).replace('( ','(').replace(' )',')').replace(' ,',',').strip()
def parse(path,split=150):
    pdf=pdfplumber.open(path); rows=[]; sec=None; model=None
    for pi,pg in enumerate(pdf.pages):
        L=lines_of(pg)
        if not L: continue
        top=[w for l in L for w in l if w['top']<40]
        if 'SPECIFICATIONS' not in ' '.join(w['text'] for w in top): 
            if rows: break
            continue
        printed=next((w['text'] for w in top if w['text'].isdigit()),'?')
        body=[l for l in L if l[0]['top']>=45]
        cur=None; last=None
        for l in body:
            lab=[w for w in l if w['x0']<split]; val=[w for w in l if w['x0']>=split]
            if l[0]['x0']<60 and all(bold(w) for w in l) and val:
                sec=clean(' '.join(w['text'] for w in lab)); model=clean(' '.join(w['text'] for w in val)); cur=None; last=l[0]['top']; continue
            if all(bold(w) for w in l) and not val: sec=None; cur=None; last=None; continue   # chapter/model titles
            if sec is None or (lab and lab[0]['x0']>40 and not val): cur=None; last=None; continue
            if val and abs(val[0]['x0']-156)>2: sec=None; cur=None; last=None; continue   # running text, not a table row
            if last is not None and l[0]['top']-last>26: sec=None; cur=None; last=None; continue   # a table is contiguous; a larger gap ends it
            if cur is None or l[0]['top']-last>11: cur={'sec':sec,'model':model,'lab':[],'val':[],'pdf':pi+1,'printed':printed}; rows.append(cur)
            cur['lab']+=[w['text'] for w in lab]; cur['val']+=[w['text'] for w in val]; last=l[0]['top']
    return rows
def facts(rows,model):
    out=[]; models=set()
    for r in rows:
        models.add(r['model'])
        if norm_model(r['model'])!=norm_model(model): continue
        lab=clean(' '.join(r['lab'])); val=clean(' '.join(r['val']))
        if not lab or not val: continue
        if lab=='Rear tire size' and re.fullmatch(r'\d\d x \d\.\d+',val): models.add('DROPPED '+lab+' = '+val+' (a rim size printed in the tire row)'); continue
        out.append((r,r['sec']+' / '+lab,val))
    return out,models
if __name__=='__main__':
    f,m=facts(parse(sys.argv[1]),sys.argv[2]); print(m)
    for r,p,v in f: print(r['pdf'],r['printed'],'|',p,'=',v)

# --- Chassis setup chapter: factory suspension settings and riding sag -------------------------------------------
REAR=['Shock absorber / Rebound damping / Standard','Shock absorber / Low speed compression damping / Standard','Shock absorber / High speed compression damping / Standard']
FRONT=['Fork / Compression damping / Standard','Fork / Rebound damping / Standard']
def _models(s): return [norm_model(x) for x in re.split(r',| and ',s) if x.strip()]
def settings(path):
    """Rows (pdf, printed, path, value, [models]) from the 'Suspension Settings - <model>' and 'Riding Sag - <model>' tables."""
    pdf=pdfplumber.open(path); out=[]; problems=[]
    for pi,pg in enumerate(pdf.pages):
        L=lines_of(pg)
        top=[w for l in L for w in l if w['top']<40]
        if 'CHASSIS SETUP' not in ' '.join(w['text'] for w in top): continue
        printed=next((w['text'] for w in top if w['text'].isdigit()),'?')
        # a page can hold two text columns; work on runs of words rather than whole lines
        segs=[]
        for l in L:
            run=[l[0]]
            for a,b in zip(l,l[1:]):
                if b['x0']-a['x1']>14 and (b['x0']>185 and a['x1']<185): segs.append(run); run=[b]
                else: run.append(b)
            segs.append(run)
        for i,s in enumerate(segs):
            txt=clean(' '.join(w['text'] for w in s))
            if not all(bold(w) for w in s): continue
            if re.search(r'( and|,)$',txt):   # a model list that wraps onto the next line
                nxt=[t for t in segs if 0<t[0]['top']-s[0]['top']<13 and abs(t[0]['x0']-s[0]['x0'])<3 and all(bold(w) for w in t)]
                if len(nxt)==1: txt=clean(txt+' '+' '.join(w['text'] for w in nxt[0]))
            m=re.match(r'^(Rear|Front) Suspension Settings - (.+)$',txt)
            if m:
                x0=s[0]['x0']; y=s[0]['top']
                pool=L if m.group(1)=='Rear' else segs     # the rear table spans the page; the front table sits in one text column
                cand=[t for t in pool if 0<t[0]['top']-y<60 and abs(t[0]['x0']-x0)<3 and t[0]['text']=='Standard' and not bold(t[0])]
                if len(cand)!=1: problems.append((pi+1,txt,'no Standard row')); continue
                line=clean(' '.join(w['text'] for w in cand[0]))
                VAL=r'((?:\d+ \d/\d|\d+ ?[¼½¾⅛⅜⅝⅞]|[¼½¾⅛⅜⅝⅞]|\d+)) (clicks?|turns?)'
                vals=[clean(a+' '+b) for a,b in re.findall(VAL,line)]
                if re.sub(VAL,'',line).replace('Standard','').strip(): problems.append((pi+1,txt,'unparsed: '+line)); continue
                names=REAR if m.group(1)=='Rear' else FRONT
                if len(vals)!=len(names) or (m.group(1)=='Rear' and not vals[2].endswith(('turn','turns'))) or any('turn' in v for v in vals[:2]): problems.append((pi+1,txt,line)); continue
                for n,v in zip(names,vals): out.append((pi+1,printed,n,v,_models(m.group(2))))
                continue
            m=re.match(r'^Riding Sag - (.+)$',txt)
            if m:
                x0=s[0]['x0']; y=s[0]['top']
                cand=[t for t in segs if 0<t[0]['top']-y<30 and abs(t[0]['x0']-x0)<3 and not bold(t[0]) and clean(' '.join(w['text'] for w in t)).startswith('Riding Sag')]
                if len(cand)!=1: problems.append((pi+1,txt,'no value row')); continue
                v=clean(' '.join(w['text'] for w in cand[0]))[len('Riding Sag'):].strip()
                v=re.sub(r'(\d)\. (\d)',r'\1.\2',v); v=re.sub(r'\((\d+) (\d) mm\)',r'(\1\2 mm)',v)   # kerned digits printed apart
                if not re.fullmatch(r'\d\.\d+ in \(\d{2,3} mm\)',v): problems.append((pi+1,txt,v)); continue
                out.append((pi+1,printed,'Shock absorber / Riding sag',v,_models(m.group(1))))
    return out,problems
