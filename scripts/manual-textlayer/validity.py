import re
TYPES='SX-F|XC-F|SX|XC|TC|TX|MC|EX|FC|FX'
ONE=re.compile(r'^(All )?(\d+(?:/\d+)*)? ?('+TYPES+r')?( \d\d/\d\d)?( models)?( [A-Z]{2})?$')
LIST=re.compile(r'\d+ (?:'+TYPES+r')(?: \d\d/\d\d)?(?: [A-Z]{2}\b)?')
def _m(model):
    m=re.match(r'^(\d+) ('+TYPES+r')(?: (\d\d/\d\d))?$',model); return m.groups()
def applies(note,model,region='US'):
    """True/False if note is a validity note; None if it is ordinary text."""
    t=note.strip().strip('()').strip()
    disp,typ,wheel=_m(model)
    if t in('Big wheel','Small wheel'): return (wheel=='19/16')==(t=='Big wheel')
    def one(s):
        m=ONE.match(s)
        if not m or not (m.group(2) or m.group(3)): return None
        if m.group(2) and not m.group(3) and not m.group(1): return None   # bare number
        d,ty,wh,rg=m.group(2),m.group(3),m.group(4),m.group(6)
        return (not d or disp in d.split('/')) and (not ty or ty==typ) and (not wh or wh.strip()==wheel) and (not rg or rg.strip()==region)
    r=one(t)
    if r is not None: return r
    ms=LIST.findall(t)
    if ms and not LIST.sub('',t).strip(' ,/'):
        return any(one(x) for x in ms)
    return None
PAR=re.compile(r'\s*\(([^()]*)\)')
def strip(s,model):
    """Remove validity notes from s. Returns (text, ok, notes)."""
    ok=True; notes=[]
    def rep(m):
        nonlocal ok
        a=applies(m.group(1),model)
        if a is None: return m.group(0)
        notes.append(m.group(1))
        if not a: ok=False
        return ''
    out=PAR.sub(rep,s).strip()
    return out,ok,notes
if __name__=='__main__':
    for n,m in [('All SX models','150 SX'),('XC','150 SX'),('125 SX EU','125 SX'),('125/150 SX US','150 SX'),('All 125 models','150 SX'),('150 SX','150 SX'),('85 SX 19/1685 SX 19/16 CN','85 SX 19/16'),('85 SX 17/14','85 SX 19/16'),('Big wheel','85 SX 19/16'),('SX','125 SX'),('upper edge','125 SX'),('120','125 SX'),('SAE 4','125 SX'),('15W/50','125 SX'),('125 XC US','125 SX')]:
        print(n,'|',m,applies(n,m))
