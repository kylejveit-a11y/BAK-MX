"""Does a printed validity note apply to the US standard model being loaded?"""
import re
TYPE=r'(?:XCF-W|SX-F|XC-F|XC-W|EXC-F|MC-F|EX-F|EC-F|EXC|SX|XC|TC|FC|TX|FX|TE|FE|MC|EX|EC)'
REG=r'(?:EU|US|CN|BR|AU|JP|AR|CO|ZA|CA|MX)'
NAME=rf'(?:\d{{2,3}} {TYPE}(?![-\w])(?: \d\d/\d\d)?|{TYPE} \d{{2,3}}F?(?![\w]))'
ITEM=re.compile(rf'({NAME})(?: ({REG})\b)?')
EDITION=re.compile(r'Factory Edition|Heritage|Edition|Troy Lee|Rockstar|Adamo|Prado|Six Days|Erzberg|Champion|Cairoli|Herlings|Dungey|Musquin',re.I)
def _attrs(model):
    m=re.match(rf'^(\d+) ({TYPE})(?: (\d\d/\d\d))?$',model)
    if m: return m.group(1),m.group(2),m.group(3)
    m=re.match(rf'^({TYPE}) (\d+)(F?)$',model)
    if m: return m.group(2),m.group(1)+('-F' if m.group(3) else ''),None
    raise ValueError(model)
def applies(note,model,region='US'):
    """True/False if note is a validity note; None if it is ordinary text."""
    t=note.strip()
    if t.startswith('(') and t.endswith(')'): t=t[1:-1]
    t=t.replace('\u2011','-').replace('\u00ad','-')
    t=re.sub(r'(\w)- (\w)',r'\1\2',t)                      # hyphenated line break
    t=re.sub(r'\b(SX|XC|MC|EX|EC) ?- ?F\b',r'\1-F',t)
    t=re.sub(r'\b(MC|EX|EC) (\d{2,3}) F\b',r'\1 \2F',t)
    t=re.sub(r'\ball\b','All',t); t=re.sub(r'\bstandard ','',t)
    t=re.sub(r'\s+',' ',t).strip()
    disp,typ,wheel=_attrs(model)
    if ',' in t or ' / ' in t:
        segs=[x.strip() for x in re.split(r',| / ',t) if x.strip()]
        res=[False if (EDITION.search(x) and not re.search(TYPE,x)) else applies(x,model,region) for x in segs]
        if len(segs)>1 and all(r is not None for r in res): return any(res)
    if t in('Big wheel','Small wheel'): return (wheel=='19/16')==(t=='Big wheel')
    if ' except ' in t:
        left,right=t.split(' except ',1); x=applies(left,model,region); y=applies(right,model,region)
        return None if (x is None or y is None) else (x and not y)
    items=ITEM.findall(t)
    rest=ITEM.sub('',t)
    if EDITION.search(t): return False
    if items and not rest.strip(' ,/&') :
        return any(n==model and (not rg or rg==region) for n,rg in items)
    regs=re.findall(rf'\b{REG}\b',t)
    r=re.sub(rf'\b{REG}\b','',t)
    r=r.replace('/',' ') if not re.search(r'\d/\d',r) else r
    has_all=bool(re.search(r'\bAll\b|\bmodels?\b',r))
    r=re.sub(r'\b(All|models?|and)\b','',r).strip(' ,')
    regok=(not regs) or region in regs
    if r=='':
        return regok if (regs or has_all) else None
    m=re.match(rf'^(\d{{2,3}}F?(?:/\d{{2,3}}F?)*)?\s*({TYPE})?(?: (\d\d/\d\d))?$',r)
    if m and (m.group(2) or has_all) and (m.group(1) or m.group(2)):
        d,ty,wh=m.groups()
        return regok and (not d or disp in [x.rstrip('F') for x in d.split('/')]) and (not ty or ty==typ or (ty in('MC','EX','EC') and typ==ty+'-F')) and (not wh or wh==wheel)
    return None
PAR=re.compile(r'\s*\(([^()]*)\)')
SUSP=re.compile(rf'\b(?:{TYPE[3:-1]}|{REG[3:-1]})\b|\bexcept\b|\bonly\b|\bmodels?\b|Edition')
def suspicious(text):
    """A parenthetical that looks like a validity note but is not understood: fail closed."""
    return [m for m in PAR.findall(text) if applies(m,'125 SX') is None and SUSP.search(m)]
def strip(s,model):
    """Remove validity notes from s. Returns (text, ok, notes)."""
    ok=True; notes=[]
    def rep(m):
        nonlocal ok
        a=applies(m.group(1),model)
        if a is None:
            if SUSP.search(m.group(1)): ok=False; notes.append('UNRECOGNIZED '+m.group(1))
            return m.group(0)
        notes.append(m.group(1))
        if not a: ok=False
        return ''
    out=PAR.sub(rep,s).strip()
    return out,ok,notes
if __name__=='__main__':
    T=[('All SX models','150 SX',True),('XC','150 SX',False),('125 SX EU','125 SX',False),('125/150 SX US','150 SX',True),('All 125 models','150 SX',False),('150 SX','150 SX',True),
    ('85 SX 19/1685 SX 19/16 CN','85 SX 19/16',True),('85 SX 17/14','85 SX 19/16',False),('Big wheel','85 SX 19/16',True),('SX','125 SX',True),('upper edge','125 SX',None),('120','125 SX',None),
    ('SAE 4','125 SX',None),('15W/50','125 SX',None),('125 XC US','125 SX',False),('All models','FC 250',True),('EU','FC 250',False),('US','FC 250',True),('FC 250 Factory Edition','FC 250',False),
    ('250 SX-F US','250 SX-F',True),('250 SX-F Factory Edition','250 SX-F',False),('All SX-F models','250 SX-F',True),('All SX-F models','250 XC-F',False),('250 XC-F','250 SX-F',False),
    ('MC 250F','MC 250F',True),('EX 250F','MC 250F',False),('All EX models','MC 250F',False),('All MC models','MC 250F',True),('TC 250, TC 300','TC 300',True),('TX 300','TC 300',False),
    ('All EU models','FC 450',False),('All US models','FC 450',True),('p. 142','FC 450',None),('48601166S1','FC 450',None),('SX EU','250 SX',False),('SX US','250 SX',True),('250 SX-F EU','250 SX-F',False),
    ('M6','250 SX',None),('XC ‑ F US','250 XC-F',True),('All SX ‑ F models','250 SX-F',True),('SX ‑ F EU','250 SX-F',False),('all SX ‑ F models','250 XC-F',False),('Factory Edition','250 SX-F',False),('All SX ‑ F standard models','350 SX-F',True),('SX ‑ F EU/US, XC-F US','250 XC-F',True),('SX ‑ F EU/US, XC-F US, CAIROLI','450 SX-F',True),('SX ‑ F US, CAIROLI','450 XC-F',False),('XC ‑ F US FACTORY EDI- TION','450 XC-F',False),('All MC ‑ F models','MC 250F',True),('EX-F','MC 250F',False),('EX-F','EX 350F',True),('All standard models','MC 450F',True),('EX 350 F US','EX 350F',True),('MC-F / EX-F','EX 250F',True),('MC-F','MC 125',False),('MC','MC 125',True),('MC 250, EX 250 US','EX 300',False),('TC 250 / TC 300','TC 300',True),('All SX-F except US','250 SX-F',False),('All SX-F except US','250 XC-F',False),('All SX-F except EU','250 SX-F',True),('All XC models','300 XC',True),('250/300 XC','300 XC',True),('FX 350','FC 350',False),('MC 125','MC 125',True),('98 octane','MC 125',None),('720 °','125 SX',None),('1:40','125 SX',None)]
    bad=[(n,m,applies(n,m),e) for n,m,e in T if applies(n,m)!=e]
    print('FAIL' if bad else 'ok',bad)
