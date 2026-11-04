"""Carburetor tuning charts (jetting by elevation and air temperature) from KTM, Husqvarna and GasGas owner's manuals.

The chart is a grid: elevation bands down the left (metres, with feet in brackets), air-temperature bands across the top
(°C, with °F in brackets), and in each cell the settings the maker prints for that air: idle air screw turns (ASO),
idling jet (IJ), jet needle (NDL), needle clip position from the top (POS), main jet (MJ). Some carburetors use other row
labels (PJ, ATS ...); any upper-case row label is kept as printed.

Cells are placed by the x position of the column headers, never by order, so a column the maker leaves empty (no setting
printed for that air) stays empty instead of shifting the row. A chart whose cells cannot all be placed is not returned.

usage: jetting.py <pdf> [...]   prints one JSON object per manual: {doc, carburetor, charts:{name:[bands]}, problems:[...]}"""
import sys,re,json,os
import pdfplumber

ROW=re.compile(r'^[A-Z]{2,4}$')
SKIP={'ASL','TEMP','M/FT','FT','INFO'}
NUM=r'[−-]?\d+(?:[.,]\d+)?'

def _num(s): return float(s.replace('−','-').replace(',',''))

def _lines(words,tol=2.5):
    out=[]
    for w in sorted(words,key=lambda w:(w['top'],w['x0'])):
        if out and abs(out[-1][0]-w['top'])<=tol: out[-1][1].append(w)
        else: out.append([w['top'],[w]])
    for o in out: o[1].sort(key=lambda w:w['x0'])
    return out

def parse_page(page):
    """Every chart on the page: [(header top, bands)], problems."""
    words=page.extract_words(x_tolerance=1.2)
    # A chart header is the TEMP word with ASL to its left on the same line (the legend prints them on separate lines).
    heads=sorted([t for t in words if t['text']=='TEMP' and any(a['text']=='ASL' and abs(a['top']-t['top'])<3 and a['x0']<t['x0']-15 for a in words)],key=lambda t:t['top'])
    if not heads: return [],['no ASL/TEMP header']
    out=[];problems=[]
    for k,h in enumerate(heads):
        lo=h['top']; hi=heads[k+1]['top']-45 if k+1<len(heads) else 1e9
        bands,pr=_chart(words,h,lo,hi); problems+=pr
        if bands: out.append((lo,bands))
    return out,problems

def _chart(words,head,lo,hi):
    label_x=head['x0']
    labels=[w for w in words if abs(w['x0']-label_x)<6 and lo+5<w['top']<hi and ROW.match(w['text']) and w['text'] not in SKIP]
    if not labels: return None,['no row labels']
    first_row=min(l['top'] for l in labels)
    # Column starts: the first token of each °C range in the header block.
    hdr=[w for w in words if lo-45<=w['top']<first_row-3 and w['x0']>label_x+25]
    starts=[]
    for ln_top,ln in _lines(hdr):
        for i,w in enumerate(ln):
            nxt=[x['text'] for x in ln[i+1:i+4]]
            if re.fullmatch(NUM,w['text']) and ((nxt[:1]==['…'] and '°C' in nxt) or nxt[:2]==['°C','…']):
                starts.append(w['x0'])
    starts=sorted(set(round(x) for x in starts))
    if len(starts)<3: return None,['too few temperature columns']
    def col(x):
        c=[i for i,s in enumerate(starts) if s<=x+8]
        return c[-1] if c else None
    titles=['']*len(starts)
    for _,ln in _lines(hdr):
        for w in ln:
            c=col(w['x0'])
            if c is not None: titles[c]+=' '+w['text']
    temps=[]
    for t in titles:
        m=re.search(rf'({NUM})\s*(?:°C)?\s*…\s*\(?({NUM})\s*°C',t); f=re.search(rf'\(({NUM})\s*(?:°F)?\s*…\s*({NUM})\s*°F',t)
        if not m: return None,[f'unreadable column title: {t.strip()}']
        c=[_num(m.group(1)),_num(m.group(2))]
        # Some layouts print only °C; °F is then the plain unit conversion of the printed °C.
        fv=[_num(f.group(1)),_num(f.group(2))] if f else [round(x*9/5+32,1) for x in c]
        if f and any(abs(x*9/5+32-y)>1.2 for x,y in zip(c,fv)): return None,[f'°C and °F disagree: {t.strip()}']
        temps.append({'c':c,'f':fv,**({} if f else {'f_converted':True})})
    # Rows grouped into elevation bands: a band ends at the row label that repeats the first one.
    lab=sorted(labels,key=lambda w:w['top']); bands=[]; cur=[]
    for l in lab:
        if cur and l['text']==cur[0]['text']: bands.append(cur); cur=[]
        cur.append(l)
    if cur: bands.append(cur)
    # Each value word goes to the nearest row label (a value can print a little below its label, e.g. POS).
    vals=[w for w in words if w['x0']>label_x+20 and first_row-6<w['top']<min(hi,lab[-1]['top']+8) and not (w['x0']<starts[0]-15)]
    owner={}
    for w in vals:
        l=min(lab,key=lambda l:abs(l['top']-w['top']))
        if abs(l['top']-w['top'])<=7: owner.setdefault(id(l),[]).append(w)
    out=[];problems=[]
    for b in bands:
        top,bot=b[0]['top']-9,b[-1]['top']+9
        side=' '.join(w['text'] for _,ln in _lines([w for w in words if w['x0']<label_x-5 and top<=w['top']<=bot]) for w in ln)
        # "2,301 … 3,000 m (7,549 … 9,843 ft)" or "2,301 m … 3,000 m (7,549 ft ‒ 3 in … 9,842 ft ‒ 6 in)"
        mm=[_num(x) for x in re.findall(rf'({NUM})\s*(?=…|m\b|m…)',side.split('(')[0])]
        ff=[_num(x) for x in re.findall(rf'({NUM})\s*(?=…|ft\b|ft\))',side.split('(',1)[1] if '(' in side else '')]
        ftconv=False
        if len(mm)==2 and not ff and '(' not in side: ff=[round(x*3.28084) for x in mm]; ftconv=True   # only metres printed
        if len(mm)!=2 or len(ff)!=2 or mm[0]>mm[1] or ff[0]>ff[1]: problems.append(f'unreadable elevation band: {side[:80]}'); continue
        if not ftconv and any(abs(x*3.28084-y)>2 for x,y in zip(mm,ff)): problems.append(f'metres and feet disagree: {side[:80]}'); continue
        cells=[{} for _ in starts]
        for l in b:
            got={}
            for w in sorted(owner.get(id(l),[]),key=lambda w:(w['x0'])):
                c=col(w['x0'])
                if c is not None: got.setdefault(c,[]).append(w['text'])
            for c,v in got.items(): cells[c][l['text']]=' '.join(v)
        # "•/•" marks a cell with no setting for that air; such a cell is left empty.
        cells=[{} if any(v=='•/•' for v in c.values()) else c for c in cells]
        n={len(c) for c in cells if c}
        if len(n)!=1 or n!={len(b)}: problems.append(f'band {mm}: cells with different row counts {sorted(n)} for {len(b)} rows'); continue
        out.append({'m':mm,'ft':ff,**({'ft_converted':True} if ftconv else {}),'cells':[{'temp':temps[i],'settings':c or None} for i,c in enumerate(cells)]})
    return out,problems

HEAD=re.compile(r'Carburetor tuning(?:\s*\(([^)]+)\))?',re.I)
def _candidates(pdf_path):
    """Pages worth opening with pdfplumber (fast pre-scan with pdftotext): chart pages and pages with a chart heading."""
    import subprocess
    txt=subprocess.run(['pdftotext','-q',pdf_path,'-'],capture_output=True,text=True).stdout.split('\f')
    return [i for i,t in enumerate(txt) if ('ASL' in t and 'TEMP' in t) or re.search(r'Carburetor tuning|Carburetor type|carburetor',t)]
def parse(pdf_path):
    pdf=pdfplumber.open(pdf_path); charts={};problems=[];carb=None;name='standard'
    for idx in _candidates(pdf_path):
        p=pdf.pages[idx]
        t=p.extract_text(x_tolerance=1.2) or ''
        heads=[]
        for top,ln in _lines(p.extract_words(x_tolerance=1.2)):
            m=HEAD.search(' '.join(w['text'] for w in ln))
            if m and re.match(r'^[\d.]+\s',' '.join(w['text'] for w in ln)): heads.append((top,(m.group(1) or 'standard').strip().lower()))
        if carb is None:
            m=re.search(r'Carburetor type\s+([^\n]+)',t)
            if m: carb=m.group(1).strip()
        if not ('ASL' in t and 'TEMP' in t and re.search(r'\bMJ\b',t)):
            if heads: name=heads[-1][1]
            continue
        found,pr=parse_page(p); problems+=[x for x in pr if x!='too few temperature columns' or re.search(r'°C',t)]
        last=[l.strip() for l in t.strip().split('\n') if l.strip()]
        printed=next((x for x in (last[-1:]+last[:1]) if re.fullmatch(r'\d{1,3}',x)),'?')
        for top,b in found:
            above=[h for h in heads if h[0]<top]
            if above: name=above[-1][1]
            for x in b: x['pdf']=p.page_number; x['printed']=printed
            charts.setdefault(name,[]).extend(b)
        tops=[top for top,_ in found]
        below=[h for h in heads if not tops or h[0]>max(tops)]
        if below: name=below[-1][1]
    out={}
    for k,bands in charts.items():
        keys=[tuple(b['m']) for b in bands]
        # The same band twice under one heading means two charts were read as one: keep none of that chart.
        if len(keys)!=len(set(keys)): problems.append(f'chart {k}: an elevation band is printed twice'); continue
        bands=sorted(bands,key=lambda b:b['m'][0])
        # A chart must run from sea level up with no band missing, or it is not kept.
        if bands[0]['m'][0]!=0 or any(abs(b['m'][0]-a['m'][1]-1)>1 for a,b in zip(bands,bands[1:])):
            problems.append(f'chart {k}: elevation bands not continuous from sea level {[b["m"] for b in bands]}'); continue
        out[k]=bands
    return {'doc':os.path.basename(pdf_path)[:-4],'carburetor':carb,'charts':out,'problems':problems}

if __name__=='__main__':
    for a in sys.argv[1:]: print(json.dumps(parse(a),ensure_ascii=False))
