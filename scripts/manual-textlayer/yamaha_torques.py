"""Yamaha Owner's Service Manual, chapter 2 TIGHTENING TORQUES tables (engine, chassis and, in the older layout, electrical).

Pages headed TIGHTENING TORQUES hold ruled tables with the columns Item | Thread size | Q'ty | Tightening torques | Remarks.
The table's own rules give the columns and the row bands (a wrapped item or a two-line remark stays inside its band).
Two layouts are read:

- 2020-on four-strokes and 2021-on two-strokes ("ENGINE TIGHTENING TORQUES" / "CHASSIS TIGHTENING TORQUES" headings):
  torque printed "10 N·m (1.0 kgf·m, 7.4 lb·ft)"; the Remarks column carries the manual's boxed symbols (Helvetica-Bold
  letters E, LT, M, LS, ...), free text ("Use a lock washer.") and the torque-check mark (a Wingdings glyph, printed in the
  TIP above the table as "marked portion shall be checked for torque tightening after break-in or before each race").
- 2020 two-strokes (B0V, B9U; "ENGINE" / "CHASSIS" / "ELECTRICAL" headings): "25 Nm (2.5 m·kg, 18 ft·lb)", the check mark
  is a "△" in the item column, remarks are plain text ("Copper washer", "YPVS"), and a group heading ("Power valve:",
  "Silencer:") is printed as a row without values; its name is prefixed to the rows below it while they keep the remark
  the first row under it has (YPVS), or, when that row has no remark, only to a row whose item is a single word (Fiber).
  Group assignments are printed as problems of kind 'group' so they can be checked against the page.

Every N·m value is checked against the kgf·m / m·kg (N·m / 10, Yamaha's convention, or / 9.80665) and the lb·ft / ft·lb
(from the N·m or from the kgf·m figure) printed on the same line; a mismatch drops the row. "See TIP." / "Refer to TIP."
values take the text of the TIP block printed after the table for that item (the steps are the torque specification of
that row); its N·m figures are checked the same way. A model tag "(YZ250X)" on an item keeps the row for that model only
(--model), as yamaha_specs.py does. The GENERAL TIGHTENING TORQUE chart (standard fasteners by thread size) is not read.
The specification table's own "tightening torque" lines (suspension setting section) are not on these pages.

Row: (pdf page, printed page, "Tightening torques / Engine / Camshaft cap bolt (M6, qty 8; remark: E = engine oil)",
"10", "N·m"); a TIP row has the TIP text as its value and no unit.

usage: yamaha_torques.py manual.pdf [--model YZ250X]"""
import pdfplumber,re,sys
SECTION_HEAD={'ENGINE TIGHTENING TORQUES':'Engine','CHASSIS TIGHTENING TORQUES':'Chassis','ENGINE':'Engine','CHASSIS':'Chassis','ELECTRICAL':'Electrical'}
# the manual's SYMBOLS page; a code is decoded only when its definition is printed on that page of the same manual
LEGEND={'E':'engine oil','LT':'apply locking agent (LOCTITE)','LS':'lithium-soap-based grease','BF':'brake fluid','S':'silicone grease',
        'B':'wheel bearing grease','G':'gear oil','M':'molybdenum disulfide oil or grease'}
LEGEND_TEXT={'E':'Engine oil','LT':'LOCTITE','LS':'Lithium-soap-based grease','BF':'Brake fluid','S':'Silicone grease','B':'Wheel bearing grease','G':'Gear oil','M':'Molybdenum disulfide'}
MARK='torque-check mark (check after break-in and before each race)'
NEW=re.compile(r'^(\d+(?:\.\d+)?) N·m \((\d+(?:\.\d+)?) kgf·m, (\d+(?:\.\d+)?) lb·ft\)$')
OLD=re.compile(r'^(\d+(?:\.\d+)?) Nm \((\d+(?:\.\d+)?) m·kg, (\d+(?:\.\d+)?) ft·lb\)$')
ANY=re.compile(r'(\d+(?:\.\d+)?) N·?m \((\d+(?:\.\d+)?) (?:kgf·m|m·kg), (\d+(?:\.\d+)?) (?:lb·ft|ft·lb)\)')
TIPREF=re.compile(r'^(See|Refer to) TIP\.?$')
TAG=re.compile(r'\s*\((YZ\d+\w*)\)\s*$')

def ulp(s):
    return 0.5*10**-(len(s.split('.')[1]) if '.' in s else 0)
def conv_ok(nm,kg,lb):
    n=float(nm); k=float(kg); l=float(lb)
    kok=min(abs(k-n/10),abs(k-n/9.80665))<=ulp(kg)+0.005*k+1e-9
    lok=min(abs(l-n*0.7375621),abs(l-k*7.2330139))<=ulp(lb)+0.01*l+1e-9
    return kok and lok
def is_mark(c):
    return 'Wingdings' in c['fontname'] or c['text'] in ('','△')
def textof(chars,tol=1):
    return pdfplumber.utils.extract_text(chars,x_tolerance=tol).strip() if chars else ''
def join_lines(t):
    """Lines of one cell: a line-break hyphen before a lower-case continuation is dropped ("(ex-" "haust side)", "Alumi-" "num")."""
    t=re.sub(r'(\w)-\n([a-z])',r'\1\2',t)
    return re.sub(r'\s*\n\s*',' ',t).strip()
def fix(t):
    return t.replace('(cid:129)','·').replace('’',"'").replace('\xa0',' ')

def legend(pdf):
    """Codes whose definition is printed on the SYMBOLS page of this manual."""
    for pg in pdf.pages[:20]:
        t=pg.extract_text() or ''
        if 'SYMBOLS' in t and 'DEFINITION' in t:
            return {k:v for k,v in LEGEND.items() if LEGEND_TEXT[k] in t}
    return {}

def vrules(pg):
    out={}
    for l in pg.lines+pg.edges:
        if abs(l['x0']-l['x1'])<1 and l['bottom']-l['top']>5:
            k=next((k for k in out if abs(k-l['x0'])<=2),round(l['x0'])); out.setdefault(k,[]).append((l['top'],l['bottom']))
    return out
def segments(spans):
    spans=sorted(spans); out=[]
    for t,b in spans:
        if out and t<=out[-1][1]+3: out[-1]=(out[-1][0],max(out[-1][1],b))
        else: out.append((t,b))
    return out

def parse(path,model=None):
    pdf=pdfplumber.open(path); rows=[]; problems=[]; tips=[]; seen=False; section=None; shape=None
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        head=' '.join(w['text'] for w in ws if w['top']<30)
        if 'TIGHTENING TORQUES' not in head:
            if seen: break
            continue
        seen=True
        printed=next((w['text'] for w in ws if re.fullmatch(r'\d-\d+',w['text']) and w['top']>700),'?')
        V=vrules(pg)
        def rule(lo,hi):
            xs=[x for x in V if lo<=x<=hi]
            return max(xs,key=lambda x:sum(b-t for t,b in V[x])) if xs else None
        c1,c2,c3,c4,left=rule(230,240),rule(272,282),rule(304,314),rule(486,495),rule(60,70)
        if None in (c1,c2,c3,c4,left): continue                # the general torque chart page
        # a table block: a span of the thread-size rule that the Q'ty and torque rules share (a figure can draw lines at x≈235 too);
        # the Remarks rule is not required: a remark cell merged across rows interrupts it
        blocks=[(t,b) for t,b in segments(V[c1]) if all(any(s<=t+3 and e>=b-3 for s,e in segments(V[c])) for c in (c2,c3))]
        # row rules are printed per cell; the item column's segments give the row bands
        H=[(l['top'],l['x0'],l['x1']) for l in pg.lines+pg.edges if abs(l['top']-l['bottom'])<1 and l['x0']<=left+5 and l['x1']>=c1-5]
        lines=pg.extract_text_lines()
        heads=[(ln['top'],SECTION_HEAD[ln['text'].strip()]) for ln in lines if ln['x0']<70 and ln['text'].strip() in SECTION_HEAD]
        # some manuals draw the torque-check mark as a small filled shape instead of a font glyph: its size is taken from the
        # shape printed before "- marked portion shall be checked ..." on the same page
        for ln in lines:
            if 'marked portion shall be checked' in ln['text']:
                sig=[(round(o['x1']-o['x0'],1),round(o['bottom']-o['top'],1)) for o in pg.curves
                     if o['x0']<ln['x0']+15 and o['top']<ln['bottom'] and o['bottom']>ln['top'] and 3<o['x1']-o['x0']<15]
                if sig: shape=sig[0]
        # text outside the tables (TIP blocks): lines at the left margin, not inside a table block
        for ln in lines:
            y=ln['top']
            if y<50 or y>760 or ln['x0']>=100 or any(t-3<=y<=b+3 for t,b in blocks): continue
            tips.append((pi+1,y,fix(ln['text']).strip()))
        for bt,bb in blocks:
            hs=[h for h in heads if h[0]<bt]
            if hs: section=hs[-1][1]
            rules=sorted({round(h[0]) for h in H if bt-3<=h[0]<=bb+3})
            group=None
            for a,b in zip(rules,rules[1:]):
                cs=[c for c in pg.chars if a<(c['top']+c['bottom'])/2<b and 40<c['top']<765]
                if not cs: continue
                # a ligature is reported twice at the same position
                u=set(); cc=[]
                for c in cs:
                    k=(c['text'],round(c['x0'],1),round(c['top'],1))
                    if k in u: continue
                    u.add(k); cc.append(c)
                cs=cc
                marks=[c for c in cs if is_mark(c)]
                cs=[c for c in cs if not is_mark(c)]
                if shape:
                    marks+=[o for o in pg.curves if o['x0']>=c4 and a<(o['top']+o['bottom'])/2<b
                            and abs(o['x1']-o['x0']-shape[0])<=0.6 and abs(o['bottom']-o['top']-shape[1])<=0.6]
                item=fix(pdfplumber.utils.extract_text([c for c in cs if c['x0']<c1],x_tolerance=1,layout=False))
                if re.match(r'^(Item|Thread)\b',item.strip()) or "Q'ty" in fix(textof(cs)): continue   # the header band
                item=join_lines(item.replace('△','')).strip()
                thread=join_lines(fix(textof([c for c in cs if c1<=c['x0']<c2])))
                qty=join_lines(fix(textof([c for c in cs if c2<=c['x0']<c3])))
                torque=join_lines(fix(textof([c for c in cs if c3<=c['x0']<c4])))
                rem=[c for c in cs if c['x0']>=c4]
                codes=[]; cur=[]
                for c in sorted(rem,key=lambda c:(round(c['top']),c['x0'])):
                    if 'Bold' in c['fontname'] and c['text'].isalpha():
                        if cur and (abs(c['top']-cur[-1]['top'])>2 or c['x0']-cur[-1]['x1']>2): codes.append(''.join(x['text'] for x in cur)); cur=[]
                        cur.append(c)
                if cur: codes.append(''.join(x['text'] for x in cur))
                remtext=join_lines(fix(textof([c for c in rem if not ('Bold' in c['fontname'] and c['text'].isalpha())]))).strip(' /')
                remtext=re.sub(r'\s*/\s*','',remtext) if remtext in ('/','//') else remtext
                if not item and not torque:
                    continue
                if item and not thread and not qty and not torque:
                    if item.endswith(':'): group=(item[:-1],None,None); continue    # a group heading (older layout)
                    problems.append(('row without values',pi+1,item)); continue
                if group:
                    gname,gremark,gfirst=group
                    named=gname.lower() in item.lower()
                    if gfirst is None: group=(gname,remtext,True); keep=True
                    else: keep=named or (bool(gremark) and remtext==gremark)
                    if keep:
                        if not named: problems.append(('group',pi+1,gname,item)); item=f'{gname}: {item}'
                    else:
                        group=None
                        if ' ' not in item.strip() and not gremark:     # a bare word right after a group without a remark: its group is not certain
                            problems.append(('ambiguous group row',pi+1,gname,item)); continue
                remarks=[]
                if marks: remarks.append(MARK)
                remarks+=[f'{k} = {LEG[k]}' if k in LEG else k for k in codes]
                if remtext: remarks.append(remtext)
                rows.append({'pdf':pi+1,'printed':printed,'section':section,'item':item,'thread':thread,'qty':qty,'torque':torque,'remarks':remarks})
        if heads: section=heads[-1][1]                       # a heading printed below the last table runs on to the next page
    # TIP blocks: a title line (the item) followed by its text, or (older layout) numbered steps naming the item
    blocks=[]
    for pg,y,t in tips:
        if not t or t=='TIP' or re.match(r'^(EAM|EAS)\d',t) or t in SECTION_HEAD or re.fullmatch(r'\d-\d+',t):
            if t=='TIP' or t in SECTION_HEAD: blocks.append(None)
            continue
        if 'marked portion shall be checked' in t or 'DEFINITION OF UNITS' in t: blocks.append(None); continue
        if blocks and blocks[-1] is not None and blocks[-1]['pg']==pg and y-blocks[-1]['y']<20: blocks[-1]['lines'].append(t); blocks[-1]['y']=y
        else: blocks.append({'pg':pg,'y':y,'lines':[t]})
    blocks=[b for b in blocks if b]
    out=[]
    for r in rows:
        if r['section'] is None: problems.append(('no section',r['pdf'],r['item'])); continue
        item=r['item']; m=TAG.search(item)
        if m:
            if not model: problems.append(('two-model row',r['item'])); continue
            if m.group(1)!=model: continue
            item=TAG.sub('',item)
        if TAG.search(r['torque']): problems.append(('two-model value',r['item'],r['torque'])); continue
        t=r['torque']; unit='N·m'
        mm=NEW.match(t) or OLD.match(t)
        if mm:
            if not conv_ok(*mm.groups()): problems.append(('conversion mismatch',r['pdf'],item,t)); continue
            val=mm.group(1)
        elif TIPREF.match(t):
            key=re.sub(r'\s*\(.*\)$','',item).lower()
            cands=[b for b in blocks if b['pg']>=r['pdf'] and (b['lines'][0].lower()==key or key in ' '.join(b['lines']).lower())]
            if not cands: problems.append(('TIP not found',r['pdf'],item)); continue
            b=cands[0]; body=b['lines'][1:] if b['lines'][0].lower()==key else b['lines']
            val=join_lines('\n'.join(body)); unit=None
            figs=ANY.findall(val)
            if not figs or any(not conv_ok(*f) for f in figs): problems.append(('TIP conversion',r['pdf'],item,val)); continue
            val='TIP: '+val
        else:
            problems.append(('unreadable torque',r['pdf'],item,t)); continue
        if not re.fullmatch(r'\d+',r['qty']) or not item or not r['thread']:
            problems.append(('cell shape',r['pdf'],item,r['thread'],r['qty'])); continue
        detail=f"{r['thread']}, qty {r['qty']}"
        if r['remarks']: detail+='; remark: '+', '.join(r['remarks'])
        p=f"Tightening torques / {r['section']} / {item} ({detail})"
        if '|' in p or (val and '|' in val): problems.append(('pipe in text',p)); continue
        out.append((r['pdf'],r['printed'],p,val,unit))
    paths=[o[2] for o in out]; dup={p for p in paths if paths.count(p)>1}
    for p in sorted(dup):
        vals={o[3] for o in out if o[2]==p}
        if len(vals)>1: problems.append(('same path, two values',p,sorted(vals)))
        else: problems.append(('same path, same value',p))
    ded=[]; sp=set()
    for o in out:
        if o[2] in dup:
            if len({x[3] for x in out if x[2]==o[2]})>1 or o[2] in sp: continue
            sp.add(o[2])
        ded.append(o)
    return ded,problems

LEG={}
def read(path,model=None):
    """parse() with the symbol legend of the same manual."""
    global LEG
    LEG=legend(pdfplumber.open(path))
    return parse(path,model)

REF=('docs/research/expansion/gaps/yamaha-torques/REPORT.md; {code}; OEM PDF fetched from the manufacturer library and hashed; '
     'chapter-2 tightening-torque tables read from the document text layer with the table rules giving the columns and rows, every N·m '
     'value checked against the kgf·m and lb·ft figures printed on the same line{extra}; no same-scope value on file to conflict.')
def build(jobs,outdir,specs=()):
    """Payloads for private.stage_manual_rows (empty base), one per bike-year, same shape as build_yamaha_specs.py.
    jobs: MODEL|YEAR|CODE|PDF path. A bike-year named in specs ("YZ250F:2019") also gets the full chapter-2 specification
    table (yamaha_specs.parse), the sag figure and the damper cross-check (yamaha_dampers.check), as build_yamaha_specs.py does."""
    import hashlib,json,os
    sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
    import yamaha_specs,yamaha_dampers
    os.makedirs(outdir,exist_ok=True); n=0; report=[]; hashes={}
    for line in open(jobs):
        if not line.strip() or line.startswith('#'): continue
        model,yr,code,path=line.rstrip('\n').split('|')[:4]
        pdf=pdfplumber.open(path); t=re.sub(r'\s+',' ',' '.join((pdf.pages[i].extract_text() or '') for i in range(6)))
        ed=re.search(r'(?:First|1st) [Ee]dition,? ([A-Z][a-z]+ \d{4})',t); lit=re.search(r'LIT-\d+-\d+-\d+',t)
        sha=hashlib.sha256(open(path,'rb').read()).hexdigest(); hashes[code]=sha
        rows,problems=read(path,model)
        info=[p for p in problems if p[0]=='group']; dropped=[p for p in problems if p[0]!='group']
        ntorque=len(rows); extra=''
        if f'{model}:{yr}' in specs:
            srows,sprob=yamaha_specs.parse(path,model); sag=yamaha_specs.sag(path)
            if sag: srows.append(sag)
            mism,found=yamaha_dampers.check(path,srows,model)
            dampers=sum(1 for r in srows if 'Adjustment value from the start position' in r[2])
            if mism or dampers<12:
                print('SKIP',model,yr,code,'dampers',dampers,'mismatch',mism); report.append((model,yr,code,0,0,'damper check failed')); continue
            rows=srows+rows; dropped+=sprob
            extra=f'; chapter-2 specification table and sag figure read as in build_yamaha_specs.py, {dampers} damper values cross-checked against the adjustment section'
        paths=[r[2] for r in rows]
        if len(paths)!=len(set(paths)) or not ed or not lit or not rows:
            print('SKIP',model,yr,code,'duplicate path' if len(paths)!=len(set(paths)) else 'edition/LIT',ed,lit); report.append((model,yr,code,0,0,'skipped')); continue
        lines=[f'{p}|{pr}|{a}|{v}|{u or ""}' for p,pr,a,v,u in rows]
        lines.sort(key=lambda l: hashlib.sha256(l.split('|')[2].encode()).hexdigest())
        want=hashlib.sha256('\n'.join(lines).encode()).hexdigest()
        n+=1
        json.dump({'make':'Yamaha','model':model,'yr':int(yr),'url':f'https://library.ymcapps.net/library/om/contents/pdf/10/{code}_02.pdf',
                   'sha':sha,'rev':f'{code} / {lit.group(0)}; First edition {ed.group(1)}','ref':REF.format(code=code,extra=extra),'want':want,'n':len(lines),
                   'delta':'\n'.join('+|'+l for l in lines)},open(f'{outdir}/{n}.json','w'))
        report.append((model,yr,code,ntorque,len(lines)-ntorque,n,dropped,info))
        print(model,yr,code,'torque rows',ntorque,'other rows',len(lines)-ntorque,'dropped',len(dropped))
    json.dump(hashes,open(f'{outdir}/doc_hashes.json','w'),indent=1,sort_keys=True)
    json.dump(report,open(f'{outdir}/build_report.json','w'),indent=1)
    print('payloads',n)

if __name__=='__main__':
    if '--build' in sys.argv:
        i=sys.argv.index('--build'); specs=sys.argv[sys.argv.index('--specs')+1].split(',') if '--specs' in sys.argv else ()
        build(sys.argv[i+1],sys.argv[i+2],specs); sys.exit()
    model=sys.argv[sys.argv.index('--model')+1] if '--model' in sys.argv else None
    o,p=read(sys.argv[1],model); print('PROBLEMS'); [print(' ',x) for x in p]; print(len(o),'rows')
    for x in o: print(x)
