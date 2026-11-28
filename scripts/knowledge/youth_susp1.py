"""Youth bikes: stock springs, springs by rider weight, sag, standard clickers and the Comfort / Sport presets, as each
manufacturer publishes them in its owner's manuals and parts diagrams (docs/research/minis/youth-oem-suspension.json,
read 2026-11-28). Years with identical content are merged into one record. Nothing is filled in where the maker
publishes nothing: those items are listed as not published so Ask BAK says so. usage: python3 scripts/knowledge/youth_susp1.py"""
import sys,os,json,re,collections
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File,root
D=json.load(open(os.path.join(root,'docs/research/minis/youth-oem-suspension.json')))['facts']
F=File('youth_susp1','y-s1','Youth OEM suspension: springs by rider weight, sag, clickers (2026-11)','KTM',[],list(range(2010,2028)))
N="Read from the manufacturer's owner's manual and parts diagrams for this model year. Confirm against the manual for your exact bike before buying springs."
def clean(s):
    s=str(s).replace('…','-').replace('–','-').replace('’',"'").replace('·','-').replace('≤','up to ').replace('≥','from ')
    s=re.sub(r'\s*-\s*(?=\d)','-',s) if re.fullmatch(r'[\d.\s\-]+',s.strip()) else s
    return re.sub(r'\s+',' ',s).strip()
def unit(u):
    u=clean(u);return {'N/MM':'N/mm','KG/MM':'kg/mm','LB/IN':'lb/in','lb.':'lb','click(s)':'clicks','turn out':'turns out','out (unit unstated)':'out (the manual does not say clicks or turns)','out':'out (the manual does not say clicks or turns)'}.get(u,u)
def val(o): return (clean(o['value'])+' '+unit(o['units'])).strip()
def join(vs):
    out=[]
    for v in vs:
        if v not in out:out.append(v)
    return out[0]+(' ('+', '.join(out[1:])+')' if len(out)>1 else '')
def grouped(items):
    """Unit pairs of one spring or one figure -> one entry. Key: rider weight + part number, or the note when there is no part number."""
    g=collections.OrderedDict()
    for o in items:
        k=(clean(o['weight']),o['part']) if o['part'] else (clean(o['weight']),o['note'][:60])
        g.setdefault(k,[]).append(o)
    return g
def short(note,n=150):
    note=clean(note);note=re.sub(r'(KTM|Husqvarna|GasGas) fiche position \d+, quantity [\d.]+\.\s*','',note);note=re.sub(r'Catalog rate/length notation:[^.]*\.?\s*','',note)
    note=re.sub(r'Optional Components\.\s*','',note)
    if len(note)>n:note=note[:n].rsplit(' ',1)[0].rstrip(',;:')+'...'
    return note
by=collections.defaultdict(list)
for o in D: by[(o['make'],o['model'],o['year'])].append(o)
src={}
def S(make,url):
    if make not in src: src[make]=F.src('manufacturer',f"{make} owner's manuals and parts diagrams, youth models",url,'2026')
    return src[make]
def build(make,model,items):
    """-> {record key: (domain, topic, body, vals)} for one bike-year; the year is added to the sentence later."""
    I=collections.defaultdict(list);missing=[]
    for o in items:
        n=o['item'].split('.')[0]
        if o['value']=='NOT FOUND':
            if not re.search(r'preset|unit$|Unambiguous|Numeric|Rider weight for|counting origin',o['item']):missing.append(o['item'].split('. ',1)[1])
            continue
        I[o['item']].append(o)
    get=lambda pre:[o for k,v in I.items() if k.startswith(pre) for o in v]
    R={}
    # A. stock springs and the rider weight the stock setup suits
    parts=[];vals={}
    w=get('1.')
    if w:
        t=join([val(o) for o in w]);parts.append((f"The stock setup is for a rider of {t}" if re.search(r'\d',t) else f"The stock setup is for a {t[0].lower()+t[1:]}")+(' in full gear' if any('full protective' in o['note'] for o in w) else ''));vals['stock_rider_weight']=t
        nn=[short(o['note']) for o in w if o['note'] and 'full protective' not in o['note']]
        if nn:parts.append(nn[0])
    for pre,label,key in (('2. Standard fork air','Standard fork air pressure','fork_air_pressure'),('2. Stock fork','Stock fork spring','stock_fork_spring'),('4.','Stock shock spring','stock_shock_spring')):
        g=grouped(get(pre))
        ent=[]
        for (wt,_),os_ in g.items():
            p=os_[0]['part'];t=join([val(o) for o in os_])+(f" (part {p})" if p else '')
            ent.append(t)
        if ent:
            parts.append(f"{label}: "+'; or '.join(ent));vals[key]=ent[0]
            conflict=[short(o['note'],260) for o in get(pre) if re.search(r'conflict',o['note'],re.I)]
            if conflict:parts.append('The manual disagrees with itself here: '+conflict[0])
    if parts:R['stock']=('suspension','Stock springs and the rider weight they suit','. '.join(p.rstrip('.') for p in parts)+'.',vals)
    # B/C. springs by rider weight
    for pre,key,label in (('5.','shock_by_weight','Shock spring by rider weight'),('6.','fork_by_weight','Fork spring by rider weight')):
        its=get(pre);
        if not its:continue
        withw=[o for o in its if 'without rider weight' not in o['item']];nowt=[o for o in its if 'without rider weight' in o['item']]
        def lines(os_,parts_on=True):
            out=[]
            for (wt,_),g in grouped(os_).items():
                p=g[0]['part'];col=re.search(r'\b(Red or gray|Red|Yellow|Black|Green|Blue|White|Gray|Orange|Silver|Purple)\b',g[0]['note']) if make=='Cobra' else None
                t=join([val(o) for o in g])+(f", part {p}" if p and parts_on else '')+(f", {col.group(1).lower()}" if col else '')
                out.append((f"{wt}: " if wt else '')+t)
            return out
        for parts_on in (True,False):
            body=[]
            if withw:body.append('By rider weight: '+'; '.join(lines(withw,parts_on))+'.')
            if nowt:body.append(('Other springs' if withw else 'Optional springs')+' the maker lists with no rider weight given: '+'; '.join(lines(nowt,parts_on))+'.')
            text=' '.join(body)
            if len(text)<1000:break
        if any('qualitative' in o['note'].lower() for o in its):text+=" Bands like 'even lighter' are the manual's own words; it gives no number for them."
        R[key]=('suspension',label if withw else label.replace('by rider weight','options (no rider weights published)'),text,{})
    # D. sag
    sg=[]
    for pre,label in (('7. Rider sag','Rider (race) sag'),('7. Static sag','Static (free) sag')):
        g=grouped(get(pre))
        ent=[join([val(o) for o in os_])+(f" ({clean(os_[0]['note']).split('.')[0].lower()})" if os_[0]['note'] and re.search(r'spring',os_[0]['note'],re.I) else '') for os_ in g.values()]
        if ent:sg.append(f"{label}: "+'; '.join(ent))
    if sg:R['sag']=('suspension','Rear sag targets','. '.join(sg)+'.',{})
    # E. standard clickers
    ck=[]
    for k,v in I.items():
        if k.startswith('8. Standard'):
            ck.append(k.split('8. Standard ',1)[1].replace(' (single adjuster)','')+' '+join([val(o) for o in v]))
    dirs=list(dict.fromkeys(short(o['value']+('. '+o['note'] if len(o['value'])<30 and o['note'] else ''),200) for o in get('8. Clicker direction')))
    if ck:
        t='Standard settings: '+'; '.join(ck)+'.'
        if dirs:t+=' How to count: '+' / '.join(dirs[:2]).rstrip('.')+'.'
        if make=='Yamaha':t+=" Directions (a) and (b) are the arrows in the manual's drawing: (a) is the full-hard stop."
        R['clickers']=('setups','Standard clicker settings and how to count them',t,{})
    # F. presets
    pr=[]
    for name in ('Comfort','Sport'):
        e=[k.split('· ',1)[1]+' '+join([val(o) for o in v]) for k,v in I.items() if k.startswith(f'9. {name} ·')]
        if e:pr.append(f"{name}: "+'; '.join(e))
    if pr:R['presets']=('setups','Comfort and Sport clicker presets from the manual','. '.join(pr)+'. Counted the same way as the standard settings.',{})
    single=any('single adjuster' in k for k in I)
    miss=sorted({clean(m) for m in missing if 'in owner' not in m and not (single and re.search(r'(high|low)-speed',m))})
    if miss:R['missing']=('suspension','What the manufacturer does not publish for this bike','The manufacturer does not publish these for this model year, so treat any number you see elsewhere as not confirmed: '+'; '.join(m[0].lower()+m[1:] for m in miss)+'.',{})
    return R
merged=collections.OrderedDict()
for (make,model,year),items in sorted(by.items()):
    for key,(dom,topic,body,vals) in build(make,model,items).items():
        merged.setdefault((make,model,key,dom,topic,body),{'years':[],'vals':vals,'url':items[0]['url']})['years'].append(year)
def span(ys):
    ys=sorted(ys);out=[];a=b=ys[0]
    for y in ys[1:]+[None]:
        if y is not None and y==b+1:b=y;continue
        out.append(str(a) if a==b else f"{a}-{b}");a=b=y
    return ', '.join(out)
for (make,model,key,dom,topic,body),m in merged.items():
    st=f"{span(m['years'])} {make} {model}. {body}"
    if len(st)>1190:st=st[:1185].rsplit(';',1)[0]+'. See the manual for the rest.'
    conf='medium' if key in ('stock','shock_by_weight','fork_by_weight','missing') else 'high'
    F.R(dom,topic,[model],m['years'],st,m['vals'],'OEM',S(make,m['url']),conf,N,make=make)
F.head['platform']['models']=sorted({k[1] for k in merged})
F.write()
print(collections.Counter(k[2] for k in merged),max(len(r['statement']) for r in F.recs))
