"""Honda CRF owner's manuals 2010-2019 (the US "Owner's Manual & Competition Handbook" PDFs from powersports.honda.com).

The PDFs are two-page spreads set in three text columns. The column edges come from the Specifications table, whose three
"Item" headings sit at the same x as the columns.

Read, each with its own check, nothing guessed:
- specs(): the Specifications table. A row is kept only when its label and its value sit on the same line of the same column;
  wrapped rows are left out. A label indented under a heading ("Engine oil capacity" / "after draining") takes the heading.
  Where both are printed, the English and metric figures must agree (in-mm, US qt-L, US oz-cm3, US gal-L, psi-kPa).
- dampers(): the adjustment procedures ("Front Suspension Damping" ... "High Speed Damping:" ... "has 20 positions or more" ...
  "Turn the adjuster counterclockwise 11 clicks."), read column by column; front/rear, compression/rebound and high/low speed come
  from the headings above the step in the same chapter. A step with no damping heading above it is not used.
- torques(): the Torque Specifications tables (Item | lbf-ft | N-m | kgf-m | Remarks). A row's item is the text since the previous
  row in the item column; a "(lower)" style sub-row takes its parent's name. N-m must agree with lbf-ft (+-1) and kgf-m (+-0.1).
Rows: (pdf page, printed page or '?', path, value, unit)."""
import re,sys,pdfplumber

def norm(t): return t.replace('•','·').replace('–','-').replace('’',"'").replace('ℓ','L')

def columns(pdf):
    """Text-column edges: from the three "Item" headings of a spread's Specifications table (2010-2017), else page thirds (2018-on)."""
    for p in pdf.pages:
        ws=p.extract_words(x_tolerance=1.5,y_tolerance=2)
        items=[]
        for x in sorted(w['x0'] for w in ws if w['text']=='Item'):
            if not items or x-items[-1]>100: items.append(x)      # two tables stacked in one column share an x
        if len(items)>=3 and any(w['text']=='English' for w in ws):
            a,b,c=items[:3]; return [(0,b-48),(b-48,c-48),(c-48,1e9)],(a,b,c)
    w=pdf.pages[len(pdf.pages)//2].width
    return [(0,w/3),(w/3,2*w/3),(2*w/3,1e9)],None

def col_lines(page,bounds):
    ws=page.extract_words(x_tolerance=1.5,y_tolerance=2)
    for c0,c1 in bounds:
        rows={}
        for w in ws:
            if c0<=w['x0']<c1 and 40<w['top']<page.height-30: rows.setdefault(round(w['top']/3),[]).append(w)
        for k in sorted(rows):
            r=sorted(rows[k],key=lambda w:w['x0']); yield r[0]['x0'],norm(' '.join(w['text'] for w in r))

def printed_of(page,pdfno):
    """The printed page numbers in the spread's footers ("Technical Information 149", "150 Technical Information")."""
    t=page.extract_text() or ''
    nums=sorted({int(n) for a,b in re.findall(r'^\s*(\d{1,3})\s+[A-Z][A-Za-z ,&]+$|^[A-Z][A-Za-z ,&]+\s(\d{1,3})\s*$',t,re.M) for n in (a,b) if n and pdfno-15<=int(n)<=pdfno+2})
    return '-'.join(map(str,nums)) if nums else '?'

NUM=r'(?:\d+ \d/\d|\d+/\d+|\d+)'
DAMP=re.compile(r'(?:Turn the adjuster|the adjuster is turned|turn the adjuster) counterclockwise (?:\(softer\) )?('+NUM+r'(?:\s?[–-]\s?'+NUM+r')?) (clicks?|turns?)')
POS=re.compile(r'has (\d+) (?:positions|clicks)')
# 2017-on manuals count positions: "Turn ... counterclockwise (softer) until it clicks. This click is position 1. The standard position
# is 11th click." / "Set the adjuster 7th - 10th click".
NTH=re.compile(r'(?:The standard position is|Set the adjuster)(?: position)? (\d+)(?:st|nd|rd|th)?(?:\s?[–-]\s?(\d+)(?:st|nd|rd|th)?)?(?: clicks?\b| \(\d)')
def numval(v):
    v=v.split('–')[-1].split('-')[-1].strip()
    if ' ' in v: a,b=v.split(); n,d=b.split('/'); return int(a)+int(n)/int(d)
    if '/' in v: n,d=v.split('/'); return int(n)/int(d)
    return float(v)
def tag_ok(tag,model):
    """A shared manual's model tag "(CRF450R/RWE)", "(CRF250RX)": does it name this model?"""
    if not tag or not model: return True
    first,*rest=tag.split('/'); base=re.match(r'CRF\d+',first)
    names={first}|{p if p.startswith('CRF') else (base.group(0)+p if base else p) for p in rest}
    return model in names
def dampers(pdf,bounds,model=None):
    """Column text of the suspension chapter, read as one stream; a value phrase may run onto the next line."""
    lines=[]
    for i,p in enumerate(pdf.pages):
        t=p.extract_text() or ''
        if 'standard position' not in t and 'standard setting' not in t: continue
        pr=printed_of(p,i+1)
        for x,l in col_lines(p,bounds): lines.append((i+1,pr,l))
    out=[];prob=[];side=None;kind=None;speed=None;rng=None;tag=None
    for j,(pg,pr,l) in enumerate(lines):
        t=re.fullmatch(r'\((CRF[\w/]+)\)',l.strip())
        if t: tag=t.group(1); continue
        # running heads repeat "Rear Suspension Adjustments" on every page: only a change of side resets the damper headings
        ns='Front suspension' if re.match(r'^Front Suspension\b',l) else 'Rear suspension' if re.match(r'^Rear Suspension\b',l) else None
        if ns and ns!=side: side=ns;kind=None;speed=None
        if re.search(r'(?i)steering damper',l): kind=None;speed=None;rng=None
        if re.match(r'^Compression Damping( Adjustment)?$',l): kind='Compression damping';speed=None;rng=None;tag=None
        elif re.match(r'^Rebound Damping( Adjustment)?$',l): kind='Rebound damping';speed=None;rng=None;tag=None
        elif re.match(r'^High Speed Damping:?$',l): speed='High-speed';rng=None;tag=None
        elif re.match(r'^Low Speed Damping:?$',l): speed='Low-speed';rng=None;tag=None
        two=l+' '+(lines[j+1][2] if j+1<len(lines) else '')
        m=POS.search(two)
        if m and m.start()<len(l): rng=m.group(1)
        n=NTH.search(two)
        if n and n.start()<len(l) and not tag_ok(tag,model): continue
        if n and n.start()<len(l):
            if not side or not kind: prob.append(('no heading',pg,two[:120])); continue
            name=f'{side} / {speed+" "+kind.lower() if speed else kind}'
            val=n.group(1)+(f'–{n.group(2)}' if n.group(2) else '')
            if rng and int(n.group(2) or n.group(1))>int(rng): prob.append(('range',name,val,rng)); continue
            out.append((pg,pr,f'{name} / Standard position (click number from full hard; the first click out is position 1)',val,'click'))
            if rng: out.append((pg,pr,f'{name} / Adjuster positions (at least)',rng,'click'))
            rng=None; continue
        m=DAMP.search(two)
        if not m or m.start()>=len(l) or not tag_ok(tag,model): continue
        if not side or not kind: prob.append(('no heading',pg,two[:120])); continue
        name=f'{side} / {speed+" "+kind.lower() if speed else kind}'
        val=re.sub(r'\s?[–-]\s?','–',m.group(1)); unit='click' if m.group(2).startswith('click') else 'turn'
        if rng and unit=='click' and numval(val)>float(rng): prob.append(('range',name,val,rng)); continue
        out.append((pg,pr,f'{name} / Standard setting (out from full hard)',val,unit))
        if rng and unit=='click': out.append((pg,pr,f'{name} / Adjuster positions (at least)',rng,unit))
        rng=None
    paths=[o[2] for o in out]; dup={x for x in paths if paths.count(x)>1}
    for d in dup:
        if len({o[3] for o in out if o[2]==d})>1: prob.append(('two values',d,sorted({o[3] for o in out if o[2]==d})))
    seen=set();keep=[]
    for o in out:
        if o[2] in dup and len({x[3] for x in out if x[2]==o[2]})>1: continue
        if o[2] in seen: continue
        seen.add(o[2]); keep.append(o)
    return keep,prob

CONV=[(r'([\d.,]+) in\b',r'([\d.,]+) mm',25.4,0.02),(r'([\d.]+) US qt',r'([\d.]+) L',0.946353,0.04),(r'([\d.]+) US oz',r'([\d.]+) cm3',29.5735,0.03),
      (r'([\d.]+) US gal',r'([\d.]+) L',3.78541,0.04),(r'([\d.]+) psi',r'([\d.]+) kPa',6.89476,0.05)]
def conv_ok(v):
    for a,b,k,tol in CONV:
        ea=re.findall(a,v); mb=re.findall(b,v)
        if ea and mb:
            x=float(ea[0].replace(',',''));y=float(mb[0].replace(',',''))
            if x and abs(x*k-y)/y>tol: return False
    return True
def specs(pdf,bounds,items):
    out=[];prob=[]
    for i,p in enumerate(pdf.pages):
        ws=p.extract_words(x_tolerance=1.5,y_tolerance=2)
        its=sorted((w for w in ws if w['text']=='Item'),key=lambda w:w['x0'])
        if not its or not any(w['text']=='English' for w in ws) or not ('Specifications' in (p.extract_text() or '')): continue
        for gi,it in enumerate(its):
            c0=it['x0']-50; c1=its[gi+1]['x0']-50 if gi+1<len(its) else 1e9
            ex=min((w['x0'] for w in ws if w['text']=='English' and w['x0']>it['x0'] and abs(w['top']-it['top'])<4),default=None)
            if ex is None: continue
            head=it['top']
            rows={}
            for w in ws:
                if c0<=w['x0']<c1 and w['top']>head+4 and w['top']<p.height-40: rows.setdefault(round(w['top']/2.5),[]).append(w)
            section=None;parent=None
            tops=sorted(min(w['top'] for w in rows[k]) for k in rows)
            def isolated(y): return all(abs(y-o)>=9 or o==y for o in tops)
            for k in sorted(rows):
                r=sorted(rows[k],key=lambda w:w['x0'])
                y=min(w['top'] for w in r)
                if 'Technical Information' in norm(' '.join(w['text'] for w in r)): continue
                if not isolated(y):
                    if not any(w['x0']>=ex-6 for w in r): parent=None
                    continue
                lab=[w for w in r if w['x0']<ex-6]; val=[w for w in r if w['x0']>=ex-6]
                lt=norm(' '.join(w['text'] for w in lab)); vt=norm(' '.join(w['text'] for w in val))
                if lab and not val:
                    x=lab[0]['x0']
                    if x<it['x0']-30: section=lt; parent=None
                    else: parent=(x,lt)
                    continue
                if not lab or not val: continue
                x=lab[0]['x0']; label=lt
                if parent and x>parent[0]+4: label=parent[1]+' / '+lt
                else: parent=None
                if not conv_ok(vt): prob.append(('conversion',label,vt)); continue
                out.append((i+1,printed_of(p,i+1),f'Specifications / {section+" / " if section else ""}{label}',vt,''))
    paths=[o[2] for o in out]; dup={x for x in paths if paths.count(x)>1}
    return [o for o in out if o[2] not in dup],prob+[('dup',d) for d in dup]

def torques(pdf):
    out=[];prob=[]
    for i,p in enumerate(pdf.pages):
        t=p.extract_text() or ''
        if 'Torque Specifications' not in t or not re.search(r'lbf\W?ft',t) or 'kgf' not in t: continue
        ws=p.extract_words(x_tolerance=1.5,y_tolerance=2)
        heads=[w for w in ws if re.fullmatch(r'lbf\W?ft',norm(w['text']))]
        for h in heads:
            nmw=min((w for w in ws if re.fullmatch(r'N\W?m',norm(w['text'])) and abs(w['top']-h['top'])<4 and w['x0']>h['x0']),key=lambda w:w['x0']-h['x0'],default=None)
            kgw=min((w for w in ws if re.fullmatch(r'kgf\W?m',norm(w['text'])) and abs(w['top']-h['top'])<4 and w['x0']>h['x0']),key=lambda w:w['x0']-h['x0'],default=None)
            if not nmw or not kgw: continue
            itemx=next((w['x0'] for w in ws if w['text']=='Item' and abs(w['top']-h['top'])<14 and w['x0']<h['x0']),None)
            left=h['x0']-260; right=kgw['x1']+70
            sec=next((norm(w['text']) for w in sorted(ws,key=lambda w:-w['top']) if w['text'] in ('ENGINE','FRAME') and w['top']<h['top'] and left-40<w['x0']<right),None)
            rows={}
            for w in ws:
                if left<=w['x0']<right and w['top']>h['top']+6: rows.setdefault(round(w['top']/2.5),[]).append(w)
            acc=[];parent=None;notes={}
            lines=[sorted(rows[k],key=lambda w:w['x0']) for k in sorted(rows)]
            for r in lines:
                tx=norm(' '.join(w['text'] for w in r))
                m=re.match(r'^NOTES?:\s*(\d+)\.\s*(.*)$',tx) or re.match(r'^(\d+)\.\s+(.*)$',tx)
                if m and not any(h['x0']-12<=w['x0']<=kgw['x1']+4 and re.fullmatch(r'[\d.]+',w['text']) for w in r): notes[m.group(1)]=m.group(2); continue
            for r in lines:
                nums=[w for w in r if h['x0']-12<=w['x0']<=kgw['x1']+4 and re.fullmatch(r'\d+(\.\d+)?',w['text'])]
                txt=[w for w in r if w['x0']<h['x0']-12 and not re.fullmatch(r'\(\d+\)',w['text'])]      # figure call-outs overlap the item column
                rem=norm(' '.join(w['text'] for w in r if w['x0']>kgw['x1']+4))
                tt=norm(' '.join(w['text'] for w in txt))
                if tt.startswith('NOTE'): break
                if len(nums)==3:
                    lb,nm,kg=(w['text'] for w in nums)
                    item=' '.join(acc+[tt]).strip(); acc=[]
                    num=re.match(r'^(\d{1,2})\s+(.*)$',item)
                    if num: item=num.group(2); parent=item
                    elif item.startswith('(') and parent: item=f'{re.sub(r" \(.*$","",parent)} {item}'
                    if not item: prob.append(('no item',i+1,lb,nm)); continue
                    n=float(nm)
                    if abs(n*0.7376-float(lb))>1.01 or abs(n/9.80665-float(kg))>0.11: prob.append(('conversion',item,lb,nm,kg)); continue
                    rm=[]
                    for nn in re.findall(r'\d+',rem.replace('NOTE','')):
                        rm.append(notes.get(nn,f'note {nn}'))
                    path=f'Torque specifications / {sec.title() if sec else "?"} / {item}'+(f' ({"; ".join(rm)})' if rm else '')
                    out.append((i+1,printed_of(p,i+1),path,nm,'N·m'))
                elif not nums and tt and not re.match(r'^\(\d+\)$',tt): acc.append(tt)
                elif nums: acc=[]; prob.append(('partial row',i+1,tt))
    paths=[o[2] for o in out]; dup={x for x in paths if paths.count(x)>1}
    keep=[];seen=set()
    for o in out:
        if o[2] in dup and len({x[3] for x in out if x[2]==o[2]})>1: continue
        if o[2] in seen: continue
        seen.add(o[2]); keep.append(o)
    return keep,prob

def read(path,model=None):
    """model: for a manual shared by two models, only the values tagged for this model (or untagged) are read."""
    pdf=pdfplumber.open(path); bounds,items=columns(pdf)
    a,pa=specs(pdf,bounds,items); b,pb=dampers(pdf,bounds,model); c,pc=torques(pdf)
    return a+b+c,pa+pb+pc
if __name__=='__main__':
    rows,prob=read(sys.argv[1])
    for r in rows: print(r)
    print('PROBLEMS',len(prob)); [print(' ',p) for p in prob[:40]]
