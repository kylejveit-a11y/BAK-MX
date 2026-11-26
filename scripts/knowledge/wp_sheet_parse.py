"""Read one WP setting list (PDF with a text layer) into a dict: article, models, clickers, sag, pressures or springs
by rider weight, service fills and the factory shim stacks. Handles the three layouts WP used 2010-2027.
Values are taken only from labelled lines; anything not found is simply absent. usage: wp_sheet_parse.py FILE.pdf ..."""
import re,subprocess,sys,json
def text(f): return subprocess.run(['pdftotext','-layout',f,'-'],capture_output=True,text=True).stdout
num=lambda s:s.replace(',','.')
DIM=r'(?:Ø ?)?(\d+(?:[.,]\d+)?x\d+(?:[.,]\d+)?x\d+(?:[.,]\d+)?|\d{8}[sS]?\d*|[sS]\d{6,}[sS]?\d*|[A-Z]\d{8,}\w*)'
N=r'(?<![\w.,/x-])(-?\d+(?:[.,]\d+)?)(?![\w.,/x]|\s*(?:mm|ml|bar|kg|N/mm|g\b))'
def vals(l,label): return [num(x) for x in re.findall(N,l[l.lower().find(label)+len(label):])] if label in l.lower() else None
def parse(f):
    t=text(f)
    pages=t.split('\f');t=pages[0];L=t.splitlines();o={'file':f.rsplit('/',1)[-1]}
    low=t.lower()
    kind='fork' if re.search(r'settinglist fork|settingliste gabel|fork setting',low) else 'shock' if re.search(r'settinglist shock|settingliste federbein|shock setting',low) else None
    if not kind: return None
    o['kind']=kind
    m=re.search(r'(?:Artikelnummer|Article number)\s*/?:?\s*(?:\n\s*)?(?:Article number\s*)?([A-Z0-9]{6,}\w*)',t); o['article']=m.group(1) if m else None
    head=' '.join(L[:22])
    o['models']=sorted({re.sub(r'\s+',' ',x).strip(' /') for x in re.findall(r"((?:KTM|HQV|HUSQVARNA|Husqvarna|HSQ|GG|GASGAS|GAS GAS)\s+[0-9A-Za-z/ .'+-]{2,48}?)(?=\s{2,}|$|\s/\s)",head)})
    def find(*labels,need=2,span=3):
        for i,l in enumerate(L):
            ll=l.lower()
            for lab in labels:
                if lab in ll:
                    for k in range(i,min(i+span,len(L))):
                        v=vals(L[k],lab) if k==i else [num(x) for x in re.findall(N,L[k])]
                        if v and len(v)>=need: return v[:3]
        return None
    if kind=='fork':
        o['comp']=find('compression damping (clicks open)','druckstufendämpfung (klicks offen)','druckstufe (klicks offen)')
        o['reb']=find('rebound damping (clicks open)','zugstufendämpfung (klicks offen)','zugstufe (klicks offen)')
    else:
        o['lsc']=find('compression damping low speed','druckstufendämpfung low speed'); o['hsc']=find('compression damping high speed','druckstufendämpfung high speed'); o['reb']=find('rebound damping (cli','zugstufendämpfung (klicks')
        m=re.search(r'(?:static sag|Statischer Durchhang)[^\n\d]{0,60}(\d+)\s*mm',t,re.I) or re.search(r'static SAG[\s\S]{0,90}?(\d+)\s*mm',t); o['static_sag']=m.group(1) if m else None
        m=re.search(r'(?:riding sag|Fahrtdurchhang)[^\n\d]{0,60}(\d+)\s*mm',t,re.I) or re.search(r'riding SAG[\s\S]{0,90}?(\d+)\s*mm',t); o['rider_sag']=m.group(1) if m else None
        m=re.search(r'(?:gas pressure|Gasdruck)[^\n\d]{0,60}(\d+(?:[.,]\d+)?)\s*bar',t,re.I) or re.search(r'(\d+)\s*bar',t); o['gas_bar']=num(m.group(1)) if m else None
        o['springs']=[[a,num(b)] for a,b in re.findall(r'(\d{2,3}-\d{2,3})\s*kg\s+(\d{2,3}(?:[.,]\d)?)\s*N/mm',t)] or None
    m=re.search(r'SAE\s*([\d.,]+)',t); o['oil_sae']=num(m.group(1)) if m else None
    o['air']=[[a,num(b)] for a,b in re.findall(r'(\d{2,3}-\d{2,3})\s*kg\s+(\d{1,2}[.,]\d)\s*bar',t)] or None
    o['weights_kg']=re.findall(r'(\d{2,3}-\d{2,3})\s*kg',t)[:3]
    fills={}
    for key,labs in (('cartridge_oil_ml',('oil capacity cartridge','ölmenge cartridge')),('outer_tube_ml',('oil capacity outertube','ölmenge außenwerk')),('oil_capacity_ml',('oil capacity  ','ölmenge  ')),('air_chamber_mm',('luftkammer','air chamber'))):
        for l in L:
            ll=l.lower()
            if any(x in ll for x in labs):
                mm=re.search(r'(\d{2,4})\s*(?:ml|mm)',l)
                if mm: fills[key]=mm.group(1);break
    o['fills']=fills
    # shim tables: every header line with two or more Stk/Qty columns
    stacks={};tot=0;got=0
    for hi,l in enumerate(L):
        cols=[m.start() for m in re.finditer(r'\b(?:Stk|Qty)\b',l)]
        if len(cols)<2 or not re.search(r'Druckstufe|Compression|Zugstufe|Rebound|Bezeichnung|description',l,re.I): continue
        names=[re.sub(r'\s+',' ',x).strip(' /.') for x in re.split(r'\b(?:Stk|Qty)\b\.?',l)[1:]]
        title=' '.join(L[max(0,hi-2):hi])
        groups=[re.sub(r'\s+',' ',g).strip() for g in re.findall(r'(Shims? (?:Kolben|Piston) ?\w*|shims piston ?\w*|Details Druckstufenventil|details compression unit|Shims? Nut|shims nut)',title,re.I)]
        order=[]
        for g in groups: order+=[g,g] if re.search(r'kolben|piston',g,re.I) else [g]
        for r in L[hi+1:hi+45]:
            if re.search(r'\b(?:Stk|Qty)\b',r) or re.search(r'Kolben Nummer|Art\.Nr|Baugruppe|assembly no|Legende|Wechselventil',r): break
            pr=list(re.finditer(r'(?<!\S)(\d{1,2})\s{2,}'+DIM+r'(?!\S)',r)); tot+=len(pr)
            for m in pr:
                c=min(range(len(cols)),key=lambda k:abs(cols[k]-m.start(1)))
                if abs(cols[c]-m.start(1))>14: continue
                got+=1
                g=(order[c] if c<len(order) else 'stack')+' / '+(names[c] if c<len(names) else '')
                stacks.setdefault(g.strip(' /'),[]).append([int(m.group(1)),num(m.group(2)).lower()])
        if stacks: break
    o['stacks']=stacks;o['pairs_seen']=tot;o['pairs_kept']=got
    return o
if __name__=='__main__':
    for f in sys.argv[1:]: print(json.dumps(parse(f),indent=1,ensure_ascii=False))
