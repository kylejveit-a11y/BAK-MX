import re,subprocess,sys,json
DIM=r'(\d+(?:[.,]\d+)?x\d+(?:[.,]\d+)?x\d+(?:[.,]\d+)?|\d{8}|[sS]?\d{6,}[sS]?\d*|[A-Z]\d{8,})'
def text(f): return subprocess.run(['pdftotext','-layout',f,'-'],capture_output=True,text=True).stdout
def num(s): return s.replace(',','.')
def parse(f):
    t=text(f);L=t.splitlines();o={'file':f.rsplit('/',1)[-1]}
    kind='fork' if re.search(r'SETTINGLIST FORK',t) else 'shock' if re.search(r'SETTINGLIST SHOCK',t) else None
    if not kind: return None
    o['kind']=kind
    m=re.search(r'Article number\s+(\S+)',t); o['article']=m.group(1) if m else None
    # model description: text to the right on the first 3 lines
    desc=' '.join(re.sub(r'^.{0,75}','',l).strip() for l in L[1:4]).strip()
    o['models']=re.sub(r'\s+',' ',re.split(r'\bF?ahrer\b',desc)[0]).strip()
    def after(label,n=3,pat=r'(-?\d+(?:[.,]\d+)?)'):
        for i,l in enumerate(L):
            if re.search(label,l):
                for k in range(i,min(i+n,len(L))):
                    v=re.findall(pat,re.sub(label,'',L[k]))
                    if v: return [num(x) for x in v]
        return None
    def row3(label):
        for i,l in enumerate(L):
            if re.search(label,l,re.I):
                for k in range(i+1,min(i+3,len(L))):
                    v=re.findall(r'(?<![\w.,])(\d+(?:[.,]\d+)?)(?![\w.,])',L[k])
                    if len(v)>=3: return [num(x) for x in v[:3]]
        return None
    if kind=='fork':
        o['comp']=row3(r'compression damping \(clicks open\)'); o['reb']=row3(r'rebound damping \(clicks open\)')
        for key,lab in (('cart_oil_ml',r'oil capacity cartridge right'),('grease_g',r'grease quantity cartridge left'),('outer_r_ml',r'oil capacity outertube right'),('outer_l_ml',r'oil capacity outertube left'),('oil_capacity_ml',r'^oil capacity\s'),('air_chamber',r'air chamber')):
            v=after(lab,2); 
            if v: o[key]=v[0]
        m=re.search(r'SAE\s*([\d.,]+)',t); o['oil_sae']=num(m.group(1)) if m else None
        m=re.search(r'(\d+)\s*mm\s*\n?.*fork stroke|fork stroke[\s\S]{0,120}?(\d{3})\s*mm',t); 
        pr=re.findall(r'(\d+[.,]\d+)\s*bar',t); o['air_bar']=[num(x) for x in pr[:3]] if pr else None
    else:
        o['lsc']=row3(r'compression damping low speed'); o['hsc']=row3(r'compression damping high speed'); o['reb']=row3(r'rebound damping \(clicks open')
        m=re.search(r'static SAG[\s\S]{0,80}?(\d+)\s*mm',t); o['static_sag']=m.group(1) if m else None
        m=re.search(r'riding SAG[\s\S]{0,80}?(\d+)\s*mm',t); o['rider_sag']=m.group(1) if m else None
        m=re.search(r'(\d+)\s*bar',t); o['gas_bar']=m.group(1) if m else None
        m=re.search(r'SAE\s*([\d.,]+)',t); o['oil_sae']=num(m.group(1)) if m else None
        o['springs']=re.findall(r'\(?[\d/]*\)?\s*(\d{2,3})-(\d{3})\s+\d+\s*mm\s+(\d{8})',t)
    wt=re.findall(r'(\d{2,3}-\d{2,3})\s*kg',t); o['weights_kg']=wt[:3]
    # shim table
    hi=next((i for i,l in enumerate(L) if len(re.findall(r'Qty',l))>=2),None)
    stacks={}
    if hi is not None:
        qpos=[m.start() for m in re.finditer(r'Qty',L[hi])]
        names=[re.sub(r'\s+',' ',x).strip() for x in re.split(r'Qty',L[hi])[1:]]
        # section titles two lines above
        title=L[hi-2] if hi>=2 else ''
        for l in L[hi+1:hi+40]:
            for m in re.finditer(r'(?<!\S)(\d{1,2})\s{2,}'+DIM+r'(?!\S)',l):
                c=min(range(len(qpos)),key=lambda k:abs(qpos[k]-m.start(1)))
                if abs(qpos[c]-m.start(1))>12: continue
                stacks.setdefault(c,[]).append([int(m.group(1)),num(m.group(2))])
        # English group titles sit on the line two above the Qty header (the German ones three above)
        groups=[(m.start(),re.sub(r'\s+',' ',m.group(0)).strip()) for m in re.finditer(r'(shims piston ?\w*|details compression unit|shims nut|shims \w+(?: \w+)?)',title)]
        order=[]
        for p,n in groups: order+= [n,n] if n.startswith('shims piston') else [n]
        def gname(c): return order[c] if c<len(order) else 'stack'
        o['stacks']={}
        for c,v in sorted(stacks.items()):
            o['stacks'][(gname(c)+' / '+(names[c] if c<len(names) else '')).strip(' /')]=v
    return o
if __name__=='__main__':
    for f in sys.argv[1:]: print(json.dumps(parse(f),indent=1))
