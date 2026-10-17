"""DERIVED gearing knowledge from the manufacturers' own published ratios (public.claims).

usage: python3 scripts/knowledge/derive_gearing.py CLAIMS_EXPORT.json PARTS_EXPORT.json OUT_RESEARCH.json
When the manual gives no final drive or rear tire, the OEM parts catalog fills it only when it is unambiguous (exactly one
front and one rear sprocket listed; one rear tire size).
For every roster bike-year with primary, gearbox and final-drive ratios plus a rear tire size, works out the overall
ratio and road speed per 1,000 rpm in each gear with stock sprockets, and the change one rear tooth makes. Tire
rolling diameter is estimated from the size code (rim + 2 x section height); real knobby rolling diameter under load
differs slightly, which the record says. Output is a research file in the BIKE_KNOWLEDGE_STANDARD format (tier DERIVED)."""
import json,re,sys,collections,math
raw=open(sys.argv[1]).read()
load=lambda t:json.loads(t[t.index('['):t.rindex(']')+1].encode().decode('unicode_escape'))
rows=load(raw)
parts={(r['m'],r['model'],r['y']):r['d'] for r in load(open(sys.argv[2]).read())}
def from_parts(k):
    d=parts.get(k,'');items=[x.strip() for x in d.split('|')]
    rear=set();front=set();tires=set()
    for x in items:
        lx=x.lower()
        if re.search(r'(timing|cam|balancer|starter|kick)',lx):continue
        m=re.search(r'(\d{2})\s*-?\s*(?:t|z|teeth)\b',lx) or re.search(r',(\d{2})t\b',lx) or re.search(r'\((\d{2})t\)',lx)
        if m and ('sprocket' in lx or 'chain wheel' in lx):
            n=int(m.group(1))
            (rear if n>=38 else front).add(n)
        t=re.search(r'(\d{2,3})/(\d{2,3})[- ]?(18|19)\b',x)
        if t:tires.add(tuple(int(v) for v in t.groups()))
    fin=(min(front),min(rear)) if len(front)==1 and len(rear)==1 else None
    return fin,(next(iter(tires)) if len(tires)==1 else None)
by=collections.defaultdict(list)
for r in rows: by[(r['m'],r['model'],r['y'])].append(r)
ORD={'1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5,'6th':6,'first':1,'second':2,'third':3,'fourth':4,'fifth':5,'sixth':6}
def ratio_from(s):
    m=re.search(r'\((\d+)\s*/\s*(\d+)\)',s)            # "2.000 (28/14)" -> driven/driving
    if m: return int(m.group(1))/int(m.group(2))
    m=re.search(r':\s*(\d+)\s*:\s*(\d+)\b',s)            # "14:28" driving:driven
    if m: a,b=int(m.group(1)),int(m.group(2)); return b/a if b>a or True else a/b
    return None
out=[];skipped=[]
for (mk,model,y),rs in sorted(by.items()):
    gears={};prim=fin=None;fin_pair=None;tire=None;src={}
    for r in rs:
        s=r['s'];low=s.lower()
        g=re.search(r'(?:gear ratios?\s*[-/]\s*|tooth pair,\s*|transmission ratio\s*/\s*)(1st|2nd|3rd|4th|5th|6th|first|second|third|fourth|fifth|sixth)',low) or re.search(r'(?:transmission gear|^gear)\s*([1-6])\b',low)
        if g and 'reduction' not in low:
            n=ORD.get(g.group(1)) or int(g.group(1));v=ratio_from(s)
            if v and n not in gears: gears[n]=v;src.setdefault('gears',r['id'])
            continue
        if re.search(r'primary',low) and prim is None:
            v=ratio_from(s)
            if v: prim=v;src['primary']=r['id']
            continue
        if re.search(r'(secondary reduction|final.?(drive|reduction))',low) and fin is None:
            m=re.search(r'\((\d+)\s*/\s*(\d+)\)',s) or None
            if m: fin=int(m.group(1))/int(m.group(2));fin_pair=(int(m.group(2)),int(m.group(1)))
            else:
                m=re.search(r'(\d{2})\s*:\s*(\d{2})',s)
                if m: a,b=int(m.group(1)),int(m.group(2));fin=b/a;fin_pair=(a,b)
            if fin: src['final']=r['id']
            continue
        if re.search(r'rear tire|rear tyre|tire size/type / rear',low) and tire is None:
            m=re.search(r'(\d{2,3})\s*/\s*(\d{2,3})\s*[-x ]\s*(\d{2})',s)
            if m: tire=tuple(int(x) for x in m.groups());src['tire']=r['id']
    filled=[]
    if not fin or not tire:
        pf,pt=from_parts((mk,model,y))
        if not fin and pf: fp_,rp_=pf;fin=rp_/fp_;fin_pair=(fp_,rp_);filled.append('final drive from the OEM parts catalog')
        if not tire and pt: tire=pt;filled.append('rear tire size from the OEM parts catalog')
    if not (gears and prim and fin and tire) or len(gears)<4:
        skipped.append(f'{mk} {model} {y}');continue
    w,ar,rim=tire;dia=rim*25.4+2*w*ar/100;circ=math.pi*dia/1000  # m
    per=[]
    for n in sorted(gears):
        overall=prim*gears[n]*fin;kmh=1000/overall*circ*60/1000;per.append((n,overall,kmh,kmh/1.609344))
    fp,rp=fin_pair;fin_plus=(rp+1)/fp
    vals={f'gear_{n}':f'{mph:.1f} mph ({kmh:.1f} km/h) per 1,000 rpm; overall ratio {o:.2f}:1' for n,o,kmh,mph in per}
    vals['stock_sprockets']=f'{fp}/{rp}';vals['rear_tire_estimated_rolling_diameter']=f'{dia:.0f} mm ({w}/{ar}-{rim})'
    gl=', '.join(f'{n}: {mph:.1f} mph' for n,_,_,mph in per)
    stmt=(f'With stock {fp}/{rp} gearing and the stock {w}/{ar}-{rim} rear tire, road speed per 1,000 rpm works out to about {gl}. '
          f'One more tooth on the rear sprocket makes every gear about {(fin_plus/fin-1)*100:.1f}% shorter; one less on the front about {((rp/(fp-1))/fin-1)*100:.1f}% shorter.')
    notes=(f'Worked out from {mk}\'s published primary ratio {prim:.3f}, gearbox ratios and final drive {fp}/{rp}: speed = rpm / (primary x gear x final) x tire circumference. '
           f'Tire rolling diameter is estimated from the size code (rim {rim} in + 2 x {w} mm x {ar}%) = {dia:.0f} mm; a knobby under load rolls slightly smaller, so real speeds run a little lower. Multiply by rpm/1,000 for a given engine speed.'+(' Inputs: '+'; '.join(filled)+'.' if filled else ''))
    out.append({'id':f'gear-{mk[:3].lower()}-{re.sub(r"[^a-z0-9]","",model.lower())}-{y}','domain':'drivetrain','topic':'speed per gear and sprocket effect',
        'applies_to':{'make':mk,'models':[model],'years':[y]},'statement':stmt,'values':vals,'tier':'DERIVED',
        'source':{'type':'calculation','name':'BAK MX calculation from manufacturer gearing','url':'','date':'2026-10'},'confidence':'high','notes':notes})
json.dump({'slice':'Derived gearing for every roster bike with published ratios','platform':{'make':'mixed','models':[],'years':[]},'records':out,'conflicts':[],'not_found':skipped,'sources':['public.claims manufacturer gearing']},open(sys.argv[3],'w'),indent=1)
print(len(out),'bike-years derived;',len(skipped),'skipped e.g.',skipped[:12])
