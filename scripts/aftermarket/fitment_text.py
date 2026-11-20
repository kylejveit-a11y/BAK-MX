"""Read a maker's free-text fitment line ("2019 - 2023 KX450/KX450X; 2021-2024 KX250/KX250X", "Honda CRF250R 2022-2024 /
CRF450R 2021-2024") into bikes on the app's roster. Deliberately conservative: a line is only turned into bikes when the model
and the years are both written out; anything else returns nothing and is listed for a person to look at. Nothing is guessed.

parse(text, roster, order) -> [(make, model, [years])]
  order 'models-first' (model then its years) or 'years-first' (years then the models they apply to).
  Open-ended years ("2023+", "2023-") stop at OPEN_END, the newest model year the maker's page could have meant.
"""
import re,collections
OPEN_END=2026
JP={'CRF':'Honda','KX':'Kawasaki','YZ':'Yamaha','WR':'Yamaha','RMZ':'Suzuki'}
KTM_FAM=['XCF-W','XC-W','SX-F','XC-F','SX','XC']
HUSQ_FAM=['FC','TC','FE','TE','FX','TX']
GAS_FAM=['MC','EX','EC']
FULL=('125','150','250','300','350','450','500','501')
def _yr(s):
    s=s.strip(); half=s.endswith('.5'); n=int(float(s)); 
    if n<100: n+=1900 if n>=80 else 2000
    return n,half
def _years(text):
    """Replace every year expression with a marker and return (text, {marker: [years]})."""
    found={}
    def put(a,b): k=f' \x01{len(found)}\x02 '; found[k.strip()]=list(range(a,b+1)) if a<=b<=2030 and a>=1980 else []; return k
    def rng(m):
        (a,ah),(b,bh)=_yr(m.group(1)),_yr(m.group(2)); return put(a+(1 if ah else 0),b)
    def opn(m):
        a,ah=_yr(m.group(1)); return put(a+(1 if ah else 0),OPEN_END)
    Y4=r'((?:19|20)\d\d(?:\.5)?)'
    t=re.sub(Y4+r'\s*(?:-|–|—|TO|THRU)\s*((?:19|20)\d\d(?:\.5)?|\d\d(?:\.5)?)(?![\d])',rng,text)
    t=re.sub(Y4+r'\s*(?:\+|-(?!\s*\d)|–(?!\s*\d)|& ?UP\b|AND UP\b|& ?NEWER\b|AND NEWER\b|OR NEWER\b)',opn,t)
    t=re.sub(r"(?<![\d.A-Z,'])'?(\d\d(?:\.5)?)\s*-\s*'?(\d\d(?:\.5)?)(?![\d.,]|\s?MM)",lambda m:rng(m) if (lambda a,b:(a<=30 or a>=90) and (b<=30 or b>=90))(int(float(m.group(1))),int(float(m.group(2)))) else m.group(0),t)
    t=re.sub(r"(?<![\d.A-Z,'])'?(\d\d(?:\.5)?)\+",lambda m:opn(m) if int(float(m.group(1)))<=30 else m.group(0),t)
    t=re.sub(r'(?<![\d.])((?:19|20)\d\d)(?![\d.])',lambda m:put(int(m.group(1)),int(m.group(1))),t)
    return t,found
def _jp(chunk,carry,bare_crf_r):
    """Japanese models named in a chunk. Returns ([(make, model)], last prefix)."""
    out=[]; c=chunk.replace('RM-Z','RMZ').replace('RM Z','RMZ')
    c=re.sub(r'\bRM\s?(\d{3})\s?Z\b',r'RMZ\1',c)
    def canon(pre,num,suf):
        mk=JP[pre]
        if pre=='CRF':
            if suf in ('RWE','RB','R-S','RS'): suf='R'
            if suf=='' and bare_crf_r: suf='R'
            if suf not in ('R','RX','X'): return None
            return mk,f'CRF{num}{suf}'
        if pre=='KX':
            if suf in ('F',''): return mk,f'KX{num}'
            if suf=='X': return mk,f'KX{num}X'
            return None
        if pre=='YZ':
            if suf=='LC': suf=''
            return (mk,f'YZ{num}{suf}') if suf in ('','F','FX','X') else None
        if pre=='WR': return (mk,f'WR{num}F') if suf=='F' else None
        if pre=='RMZ': return (mk,f'RM-Z{num}') if suf=='' else None
    pat=re.compile(r'\b(CRF|KX|YZ|WR|RMZ)[\s-]?(\d{2,3})\s?(RWE|RB|RX|FX|LC|R|F|X)?(?![A-Z0-9])((?:\s?\(\s?(?:RX|FX|X|F)\s?\))?)((?:\s?[/,&]\s?(?:\d{2,3})?\s?(?:RWE|RX|FX|R|F|X)?(?![A-Z0-9-]))*)')
    last=carry
    for m in pat.finditer(c):
        pre,num,suf,par,tail=m.group(1),m.group(2),m.group(3) or '',m.group(4),m.group(5); last=pre
        got=[canon(pre,num,suf)]
        if par: got.append(canon(pre,num,(suf if suf!='R' else '')+re.sub(r'[^A-Z]','',par) if re.sub(r'[^A-Z]','',par)!=suf else suf))
        n=num
        for piece in re.findall(r'[/,&]\s?(\d{2,3})?\s?(RWE|RX|FX|R|F|X)?',tail):
            if not piece[0] and not piece[1]: continue
            n=piece[0] or n; got.append(canon(pre,n,piece[1] or ('' if piece[0] else suf)))
        out+= [g for g in got if g]
    if not out and carry:                                    # "| 450 2019 - 2026" after "KX250/F 2019 - 2027"
        m=re.fullmatch(r'[\s|/,&;:-]*(\d{3})\s?(RX|FX|R|F|X)?[\s|/,&;:(-]*',c)
        if m:
            g=canon(carry,m.group(1),m.group(2) or ''); out+=[g] if g else []
    return out,last
MODELS=set()
def _ktm(chunk,whole):
    """KTM / Husqvarna / GasGas models named in a chunk: family words and engine sizes."""
    t=chunk.replace('SXF','SX-F').replace('XCF-W','XCF-W').replace('XCFW','XCF-W').replace('XCW','XC-W').replace('XCF','XC-F').replace('MCF','MC-F').replace('EXF','EX-F').replace('ECF','EC-F')
    t=re.sub(r'\bXC-F-W\b','XCF-W',t)
    out=set()
    husq=bool(re.search(r'HUSQ|HUSKY|\bHUS\b|\bHQV\b',whole)); gas=bool(re.search(r'GAS',whole)); ktm='KTM' in whole
    nums=set(re.findall(r'(?<![\d.])(50|65|85|105|125|150|250|300|350|450|500|501)(?![\d.]|\s?MM)',t))
    rng=re.search(r'(?<![\d.])(125|150|250)\s?-\s?(300|350|450|500|501)(?![\d.])',t)
    if rng: nums|={d for d in FULL if int(rng.group(1))<=int(d)<=int(rng.group(2))}
    def fams(names): return [f for f in names if re.search(r'(?<![A-Z-])'+re.escape(f)+r'(?![A-Z-])',re.sub(r'(\d)([A-Z])',r'\1 \2',re.sub(r'([A-Z])(\d)',r'\1 \2',t)))]
    paired=len(nums)>1 and not rng and not re.search(r'\d{2,3}\s?[/,]\s?\d{2,3}',t)
    def want(fam,size,four=None):
        if not nums: return size in FULL
        if size not in nums: return False
        if paired:                                           # "450 SX-F, 250 XC": each size belongs to the family written next to it
            return bool(re.search(r'(?<!\d)'+size+r'\s?'+re.escape(fam)+r'(?![A-Z-])|(?<![A-Z-])'+re.escape(fam)+r'\s?'+size+r'(?!\d)',t))
        return True
    named=[(mk,f) for mk,on,names in (('KTM',ktm,KTM_FAM),('Husqvarna',husq,HUSQ_FAM)) if on for f in fams(names)]
    for d in nums:
        if d in FULL and named and not gas and not any(((mk,f'{d} {f}') if mk=='KTM' else (mk,f'{f} {d}')) in MODELS for mk,f in named): return set()   # "250/350 SX": no 350 SX exists, so the family word is not reliable
    if ktm:
        for f in fams(KTM_FAM):
            for d in ('50','65','85')+FULL:
                if want(f,d): out|={('KTM',f'{d} {f}')} if d!='85' else {('KTM','85 SX 17/14'),('KTM','85 SX 19/16')} if f=='SX' else set()
    if husq:
        for f in fams(HUSQ_FAM):
            for d in ('50','65','85')+FULL:
                if want(f,d): out.add(('Husqvarna',f'{f} {d}'))
    if gas:
        tt=re.sub(r'(\d)([A-Z])',r'\1 \2',re.sub(r'([A-Z])(\d)',r'\1 \2',t))
        for f in GAS_FAM:
            two=bool(re.search(r'(?<![A-Z-])'+f+r'(?![A-Z-])',tt)); four=bool(re.search(r'(?<![A-Z-])'+f+r'-F\b|(?<![A-Z-])'+f+r'\s?\d{3}\s?F\b',tt))
            if two and re.search(r'(?<![A-Z-])'+f+r'\s?\d{3}\s?F\b',tt) and not re.search(r'(?<![A-Z-])'+f+r'\s?\d{2,3}(?!\s?F\b)(?!\d)',tt) and not re.search(r'(?<![A-Z-])'+f+r'\s?/',tt): two=False
            for d in ('50','65','85')+FULL:
                if not want(f,d): continue
                if two: out.add(('GasGas',f'{f} {d}'))
                if four: out.add(('GasGas',f'{f} {d}F'))
    return out
def _tri(chunk):
    out=set()
    for m in re.finditer(r'\bTF\s?(250|450)\s?-?\s?((?:RC|X|C|E)(?:\s?/\s?(?:RC|X|C|E))*)(?![A-Z])',chunk):
        for v in re.split(r'\s?/\s?',m.group(2)): out.add(('Triumph',f'TF {m.group(1)}-{v}'+(' Edition' if v=='RC' else '')))
    return out
MAKE_RE=re.compile(r'HONDA|KAWASAKI|\bKAW\b|YAMAHA|\bYAM\b|SUZUKI|\bSUZ\b|KTM|HUSQVARNA|HUSKY|HUSQ|\bHUS\b|\bHQV\b|GAS ?GAS|\bGAS\b|TRIUMPH|\bTRI\b')
MODEL_RE=re.compile(r'\b(?:CRF|KX|YZ|WR|RM-?Z|RM\s?\d{3}\s?Z|TF\s?\d{3})|(?<![A-Z-])(?:SX-?F|XC-?F|XCF-?W|XC-?W|SX|XC|FC|TC|FE|TE|FX|TX|MC|EX|EC)(?![A-Z])')
def parse(text,roster,order='auto',bare_crf_r=False):
    """order: 'models-first', 'years-first', or 'auto' (decided for each ;-separated part by which comes first)."""
    global MODELS
    MODELS={(mk,m) for mk,m,y in roster}
    T=' '+re.sub(r'[\u2010-\u2015]','-',str(text).upper())+' '
    T=re.sub(r'OFFSETS?\s*[\d.,]+(?:\s?-\s?[\d.,]+)?(?:\s?MM)?|OFFS\s*[\d.,]+(?:\s?-\s?[\d.,]+)?|Ø\s?[\d.,]+|\b[\d.,]+\s?MM\b|\bM\d{1,2}\b',' ',T)
    t,found=_years(T)
    fits=collections.defaultdict(set); carry=None; ctx=''
    for seg in re.split(r';|\n|\s-\s',t) if order=='auto' else [t]:
        o=order
        if o=='auto':
            y=re.search(r'\x01\d+\x02',seg); m=MODEL_RE.search(seg)
            if not y: 
                if MAKE_RE.search(seg): ctx=' '.join(MAKE_RE.findall(seg))
                _,carry=_jp(seg,carry,bare_crf_r); continue
            o='years-first' if (not m or y.start()<m.start()) else 'models-first'
        parts=re.split(r'(\x01\d+\x02)',seg); groups=[]
        if o=='models-first':
            chunk='';ys=[]
            for p in parts:
                if p in found: ys+=found[p]
                else:
                    if ys and p.strip(' |/,;&()-:'): groups.append((chunk,ys)); chunk=p; ys=[]
                    else: chunk+=p
            groups.append((chunk,ys))
        else:
            ys=[];pending=False
            for p in parts:
                if p in found:
                    if pending: ys=[]; pending=False
                    ys+=found[p]
                elif p.strip(' |/,;&()-:'):
                    groups.append((p,list(ys))); pending=True
            if groups and not pending: groups=[]              # "2010-2027 YZ450F & YZ250F 2012-2027": which years go with which bike is not clear, so none are read
        for chunk,ys in groups:
            if MAKE_RE.search(chunk): ctx=' '.join(MAKE_RE.findall(chunk))
            jp,carry=_jp(chunk,carry,bare_crf_r)
            if not ys or re.search(r'EDITION|ROCKSTAR|TROY LEE|\bTLD\b|REPLICA',chunk): continue   # a special edition is not the standard bike of that year
            own=' KTM' if not ctx and not MAKE_RE.search(T.split(chunk)[0]) and re.search(r'(?<![A-Z-])(?:SX-?F|XC-?F|XC-?W|XCF-?W|SX)(?![A-Z])',chunk) else ''   # SX / SX-F / XC-F are KTM's own names when the line opens with them
            for mk,model in set(jp)|_ktm(chunk,(ctx or T)+own)|_tri(chunk):
                for y in ys:
                    if (mk,model,y) in roster: fits[(mk,model)].add(y)
    return [(mk,model,sorted(ys)) for (mk,model),ys in sorted(fits.items())]

if __name__=='__main__':
    import json,os,sys
    R={tuple(r) for r in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','docs','research','aftermarket','roster-all.json')))}
    span=lambda text,**k:{f'{mk} {m}':(ys[0],ys[-1]) for mk,m,ys in parse(text,R,**k)}
    checks=[
     ("ROCS tech Kawasaki KX250F, KX250 2013-2020 / KX450F 2013-2018 / 23 blue",{'Kawasaki KX250':(2014,2020),'Kawasaki KX450':(2014,2018)},{}),
     ("ROCS pro Honda CRF250R 2014-2021 / CRF450R 2013-2020 / offset 22-24",{'Honda CRF250R':(2014,2021),'Honda CRF450R':(2013,2020)},{}),
     ("ROCS pro KTM / Husqvarna / GASGAS offset 20-22 red",{},{}),
     ("preload adjuster Honda CRF450 2013- 2016",{'Honda CRF450R':(2013,2016)},{'bare_crf_r':True}),
     ("preload adjuster Honda CRF450 2013- 2016",{},{}),
     ("P3 Carbon Front Brake Guard | KX250/F 2019 - 2027 | 450 2019 - 2026 (See Fitment Chart)",{'Kawasaki KX250':(2019,2026),'Kawasaki KX450':(2019,2026)},{}),
     ("KTM 250/350 SX (2023-2024)",{},{}),
     ("2019 - 2023 KX450/KX450X; 2021-2024 KX250/KX250X",{'Kawasaki KX450':(2019,2023),'Kawasaki KX450X':(2021,2023),'Kawasaki KX250':(2021,2024),'Kawasaki KX250X':(2021,2024)},{}),
     ("2010-2027 YZ450F & YZ250F 2012-2027",{},{}),
     ("KTM 450 SX-F Factory Edition 2015-2017 | 450 SX-F/XC-F 2016-2018",{'KTM 450 SX-F':(2016,2018),'KTM 450 XC-F':(2016,2018)},{}),
     ("2025-2027 CRF450R/450RX/450RWE; 2025-2027 CRF250R/250RX/250RWE",{'Honda CRF450R':(2025,2027),'Honda CRF450RX':(2025,2027),'Honda CRF250R':(2025,2027),'Honda CRF250RX':(2025,2027)},{}),
     ("Yamaha YZ250F (MY 2012 - 2023)",{'Yamaha YZ250F':(2012,2023)},{}),
     ("Triumph TF450-X/RC/C/E (2025-2026)",{'Triumph TF 450-RC Edition':(2025,2025),'Triumph TF 450-X':(2026,2026),'Triumph TF 450-C':(2026,2026),'Triumph TF 450-E':(2026,2026)},{}),
    ]
    bad=[(t,span(t,**k),want) for t,want,k in checks if span(t,**k)!=want]
    for b in bad: print('FAIL',b)
    print(len(checks)-len(bad),'of',len(checks),'fitment checks pass'); sys.exit(1 if bad else 0)
