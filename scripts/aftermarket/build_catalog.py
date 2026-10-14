"""Aftermarket research catalog builder (one bike family at a time).

usage: build_catalog.py <family dir> <family title> <make>[,<make>...]
Reads every *.json research file in the family dir (products from the slice files, feedback and builds from the
rider-feedback file), normalises each fitment line to the app's bike list (docs/research/aftermarket/roster-2020-2027.json),
links rider feedback to products by brand and product words, and writes CATALOG.md and index.json in the same dir.
Research candidates only: nothing here is verified evidence or loaded into the app."""
import json,glob,os,re,sys,collections
fam_dir,title,makes=sys.argv[1],sys.argv[2],sys.argv[3].split(',')
root=os.path.dirname(os.path.abspath(fam_dir.rstrip('/')))
ENDURO_MODELS=re.compile(r'(XC-W|XCF-W|^TE |^FE |^EC |^WR)')   # enduro / trail models are out of the aftermarket scope for now
roster=[tuple(r) for r in json.load(open(os.path.join(root,'roster-2020-2027.json'))) if r[0] in makes and not ENDURO_MODELS.search(r[1])]
ENDURO=re.compile(r'\b(EXC|XC-W|XCW|XCF-W|TE|FE|EC|EC-F|ECF|out of scope|enduro)\b',re.I)
def family(model):
    m=model.upper().replace(' ','')
    for f in ('SX-F','XC-F','SX','XC','TC','FC','TX','FX','MC','EX'):
        if f.replace('-','') in m.replace('-',''): return f
def norm_fit(make,text):
    """Bikes in the roster named by one fitment line ("SX / SX-F", "250 SX-F", "TC / FC (per title)", "MC 450F")."""
    if ENDURO.search(text) and not re.search(r'\b(SX|XC(?!-W)|TC|FC|TX|FX|MC|EX(?!C))\b',text.upper()): return []
    t=text.upper().replace('SXF','SX-F').replace('XCF','XC-F')
    nums=set(re.findall(r'(?<!\d)(85|125|150|250|300|350|450)(?!\d)',t))
    rng=re.search(r'(?<!\d)(85|125|150|250)\s*-\s*(450|500|501|530|890)(?!\d)',t)
    if rng: nums|={d for d in ('125','150','250','300','350','450') if int(rng.group(1))<=int(d)<=int(rng.group(2))}
    every=bool(re.search(r'\bALL\b|ALL MODELS|ANY MODEL|FULL-SIZE',t))
    stroke='4' if re.search(r'\b4T\b|4-?STROKE|\d{3}\s?F\b|SX-F|XC-F|\bFC\b|\bFX\b|MC-F|EX-F',t) else '2' if re.search(r'\b2T\b|2-?STROKE|TBI|\b(SX|XC|TC|TX)\b',t) else None
    out=set()
    for mk,model,y in roster:
        if mk!=make: continue
        M=model.upper(); fam=family(M); d=re.search(r'\d+',M).group(0)
        if nums and d not in nums: continue
        if not nums and d=='85': continue                      # a line naming no size means the full-size bikes
        famtoks=[f for f in ('SX-F','XC-F','SX','XC','TC','FC','TX','FX','MC','EX') if re.search(r'(?<![A-Z])'+re.escape(f)+r'(?![A-Z-])',t) or (f.endswith('-F') and f in t)]
        if mk=='GasGas':
            four=M.endswith('F'); 
            if 'MC' in t and fam!='MC' and 'EX' not in t: continue
            named=('MC' in t) or bool(re.search(r'\bEX\b|EX\s?\d',t))
            if named and fam=='MC' and 'MC' not in t: continue
            if named and fam=='EX' and not re.search(r'\bEX\b|EX\s?\d',t): continue
            if not named and not (nums or every): continue
            if four and named and nums and not re.search(r'\d{3}\s?F\b|4-?STROKE|\b4T\b|MC-F|EX-F',t): continue   # "MC 250" names the two-stroke
            if stroke and four!=(stroke=='4'): continue
            if re.search(r'\d{3}F|MC-F|MCF|EX-F|4-?STROKE|4T',t) and not re.search(r'\d{3}(?!F)\b|2-?STROKE|2T',t) and not four: continue
            if re.search(r'2-?STROKE|2T|TBI',t) and not re.search(r'\d{3}F|4-?STROKE',t) and four: continue
        else:
            four=fam in ('SX-F','XC-F','FC','FX')
            if famtoks and fam not in famtoks: continue
            if not famtoks and not (nums or every): continue
            if stroke and four!=(stroke=='4'): continue
        out.add((mk,model))
    return sorted(out)
products=[];feedback=[];builds=[];gaps=[];notdone=[];platforms=[];updates=[]
for f in sorted(glob.glob(os.path.join(fam_dir,'*.json'))):
    if f.endswith('index.json'): continue
    d=json.load(open(f)); src=os.path.basename(f)
    for p in d.get('products',[]): p['_file']=src; products.append(p)
    for x in d.get('feedback',[]): x['_file']=src; feedback.append(x)
    builds+=d.get('builds',[]); platforms+=[dict(p,_file=src) for p in d.get('platforms',[])]
    gaps+=[(src,g) for g in d.get('gaps',[])]; notdone+=[(src,g) for g in d.get('not_done',[])]
    updates+=[dict(u,_file=src) for u in d.get('updates',[])]
# a later pass confirms or corrects a product by id: listed fields replace the earlier ones, sources are kept
byid={p['id']:p for p in products}
for u in updates:
    p=byid.get(u.get('id'))
    if not p: continue
    for k,v in u.items():
        if k in ('id','_file','note') or v in (None,'',[]): continue
        if k=='where_to_buy': p[k]=(p.get(k) or [])+[w for w in v if w not in (p.get(k) or [])]
        elif k=='rider_feedback': p[k]=(p.get(k) or [])+v
        else: p[k]=v
    p['_updated']=u['_file']+(': '+u['note'] if u.get('note') else '')
# per-bike index
bike=collections.defaultdict(set); unmapped=[]
for p in products:
    hit=False
    for fit in p.get('fits') or []:
        for mk in [m.strip() for m in re.split(r'[/,&]| and ',str(fit.get('make','')))]:
          if mk not in makes: continue
          for mk2,model in norm_fit(mk,str(fit.get('model',''))):
            for y in fit.get('years') or []:
                if (mk2,model,y) in roster: bike[(mk2,model,y)].add(p['id']); hit=True
    if not hit: unmapped.append(p['id'])
# feedback to products
words=lambda s:set(w for w in re.findall(r'[a-z0-9]{3,}',str(s).lower()) if w not in {'the','and','for','with','kit','system','full','ktm','husqvarna','gasgas'})
for x in feedback:
    best=[p for p in products if str(p.get('brand','')).lower()[:5]==str(x.get('brand','')).lower()[:5] and len(words(p.get('product'))&words(x.get('product')))>=1]
    x['_linked']=[p['id'] for p in best]
    for p in best: p.setdefault('_feedback',[]).append(x)
esc=lambda s:re.sub(r'\s+',' ',str(s if s is not None else '')).replace('|','/')
def fits_text(p):
    return '; '.join(f"{esc(f.get('make'))} {esc(f.get('model'))} {','.join(str(y) for y in f.get('years') or [])}" for f in p.get('fits') or [] if any(m.strip() in makes for m in re.split(r'[/,&]',str(f.get('make','')))))[:300]
def buy(p):
    return ' '.join(f"[{esc(w.get('seller'))}]({w.get('url')})"+(f" {esc(w.get('price_if_stated'))} {esc(w.get('currency') or '')}".rstrip() if w.get('price_if_stated') else '') for w in (p.get('where_to_buy') or [])[:3])
L=[f'# {title}: aftermarket parts research catalog','',
 'Research candidates gathered from public web sources (manufacturer pages, dealers, retailers, magazine tests, testers, forums). '
 'Each product keeps its source and a confidence: high = the manufacturer lists the part number and fitment; medium = a dealer or major retailer does; '
 'unverified = inferred or title-only. Nothing here is verified evidence, nothing is shown to riders yet, and no fitment, price or performance claim '
 'should be repeated without checking the source. Performance claims are the maker\'s or tester\'s, with their conditions.','',
 f'Files: {", ".join(sorted({p["_file"] for p in products}|{x["_file"] for x in feedback}))}. Built by scripts/aftermarket/build_catalog.py.','',
 f'Counts: {len(products)} products, {sum(len(p.get("part_numbers") or []) for p in products)} part numbers, {len(feedback)} rider/tester findings, {len(builds)} project-bike builds, '
 f'{len(bike)} of {len(roster)} in-scope bike-years with at least one mapped product.','',
 '## Platforms','','| Platform | Bikes and years | Source |','|---|---|---|']
seen=set()
for pl in platforms:
    k=esc(pl.get('description'))[:80]
    if k in seen: continue
    seen.add(k); L.append(f"| {esc(pl.get('description'))[:220]} | {esc(pl.get('models_years'))[:220]} | [link]({pl.get('source_url')}) |")
FEED=('ktt-','cg-','lng-')
isfeed=lambda p:str(p['id']).startswith(FEED)
feed=[p for p in products if isfeed(p)]
if feed:
    L+=['','## Dealer and retailer catalogs','',f'{len(feed)} listings from dealer and retailer catalogs are summarised here and listed in full on the per-bike pages (bikes/) and in BRANDS.md.','',
        '| Source | Listings | Brands | With part numbers |','|---|---|---|---|']
    for pre,name in (('ktt-','KTM Twins (official KTM dealer, US)'),('lng-','Lings (KTM/Husqvarna/GasGas dealer, UK)'),('cg-','Cycle Gear (retailer, US)')):
        ff=[p for p in feed if p['id'].startswith(pre)]
        if ff: L.append(f"| {name} | {len(ff)} | {len({p.get('brand') for p in ff})} | {sum(1 for p in ff if p.get('part_numbers'))} |")
bycat=collections.defaultdict(list)
for p in products:
    if not isfeed(p): bycat[str(p.get('category') or 'other').lower()].append(p)
for cat in sorted(bycat):
    L+=['',f'## {cat.title()}','','| Brand | Product | Part numbers | Fits (as listed) | What it changes (attributed) | Supporting parts / caveats | Where to buy | Confidence | Feedback |','|---|---|---|---|---|---|---|---|---|']
    for p in sorted(bycat[cat],key=lambda p:(str(p.get('subcategory')),str(p.get('brand')))):
        fb='; '.join(f"{esc(x.get('publication') or x.get('source_type'))} {esc(x.get('date'))}" for x in p.get('_feedback',[]))[:120]
        L.append(f"| {esc(p.get('brand'))} | {esc(p.get('product'))} ({esc(p.get('subcategory'))}) | {esc(', '.join(p.get('part_numbers') or []))} | {fits_text(p)} | {esc(p.get('what_it_changes'))[:260]} | {esc(p.get('supporting_parts'))[:120]} {esc(p.get('caveats'))[:160]} | {buy(p)} | {esc(p.get('confidence'))} | {fb} |")
L+=['','## Rider and tester findings','','| Bike | Category | Product | Source | Conditions / other mods | What they found | Measured | Confidence |','|---|---|---|---|---|---|---|---|']
for x in sorted(feedback,key=lambda x:(-float(re.match(r'[0-9.]*',str((x.get('bike') or {}).get('year') or 0)).group(0) or 0),str(x.get('category')))):
    b=x.get('bike') or {}
    L.append(f"| {esc(b.get('make'))} {esc(b.get('model'))} {esc(b.get('year'))} | {esc(x.get('category'))} | {esc(x.get('brand'))} {esc(x.get('product'))} | [{esc(x.get('publication'))}, {esc(x.get('author'))}, {esc(x.get('date'))}]({x.get('url')}) ({esc(x.get('source_type'))}) | {esc(x.get('conditions'))[:150]} {esc(x.get('other_mods'))[:100]} | {esc(x.get('observed'))[:300]} | {esc(x.get('measured'))[:120]} | {esc(x.get('confidence'))} |")
L+=['','## Project-bike builds','']
for b in builds:
    bk=b.get('bike') or {}
    L+=[f"### [{esc(b.get('title'))}]({b.get('url')}) — {esc(bk.get('make'))} {esc(bk.get('model'))} {esc(bk.get('year'))}, {esc(b.get('publication'))} {esc(b.get('date'))}",'']
    L+=[f"- {esc(x.get('category'))}: {esc(x.get('brand'))} {esc(x.get('product'))}{(' ('+esc(', '.join(x.get('part_numbers') or []))+')') if x.get('part_numbers') else ''} — {esc(x.get('purpose'))}{('; found: '+esc(x.get('observed'))) if x.get('observed') else ''}" for x in b.get('parts',[])]
    L.append('')
name={p['id']:f"{esc(p.get('brand'))} {esc(p.get('product'))}" for p in products}
bslug=lambda mk,model,y:re.sub(r'[^a-z0-9]+','-',f'{mk} {model} {y}'.lower()).strip('-')
L+=['## By bike (newest first)','','Products whose listed fitment names the bike-year (normalised from the fitment lines above; check each product row before relying on it).','']
for mk,model,y in sorted(roster,key=lambda r:(-r[2],r[0],r[1])):
    ids=sorted(bike.get((mk,model,y),[]))
    cur=[i for i in ids if not str(i).startswith(FEED)]
    L.append(f"- **[{mk} {model} {y}](bikes/{bslug(mk,model,y)}.md)** ({len(ids)} parts; researched: "+('; '.join(name[i] for i in cur)[:600] if cur else 'none')+')')
if unmapped: L+=['',f'Products whose fitment did not map to a roster bike: {", ".join(unmapped)}']
L+=['','## Gaps and work not done','']+[f'- ({s}) {esc(g)}' for s,g in gaps+notdone]
open(os.path.join(fam_dir,'CATALOG.md'),'w').write('\n'.join(L)+'\n')
os.makedirs(os.path.join(fam_dir,'bikes'),exist_ok=True)
byid={p['id']:p for p in products}
for (mk,model,y),ids in bike.items():
    B=[f'# {mk} {model} {y}: aftermarket parts','',f'{len(ids)} parts whose listed fitment names this bike. Research candidates: check fitment on the maker\'s page before relying on a row. Back to [the family catalog](../CATALOG.md).','']
    cats=collections.defaultdict(list)
    for i in ids: cats[str(byid[i].get('category') or 'Other').split(' > ')[-1].strip().title()].append(byid[i])
    for c in sorted(cats):
        B+=[f'## {c} ({len(cats[c])})','','| Brand | Part | Part numbers | Price (as listed) | Notes | Source | Confidence |','|---|---|---|---|---|---|---|']
        rows=collections.OrderedDict()
        for p in sorted(cats[c],key=lambda p:(str(p.get('brand')).lower(),str(p.get('product')))):
            k=(str(p.get('brand')).lower(),tuple(sorted(p.get('part_numbers') or []))) if p.get('part_numbers') else p['id']
            rows.setdefault(k,[]).append(p)
        for grp in rows.values():
            p=grp[0]
            w=dict((p.get('where_to_buy') or [{}])[0])
            if len(grp)>1: w['seller']=' / '.join(dict.fromkeys(str((g.get('where_to_buy') or [{}])[0].get('seller')) for g in grp))
            fitn='; '.join(esc(f.get('notes')) for f in p.get('fits') or [] if f.get('notes') and (f.get('model')==model or model in str(f.get('model'))))[:120]
            B.append(f"| {esc(p.get('brand'))} | {esc(p.get('product'))[:120]} | {esc(', '.join(p.get('part_numbers') or [])[:160])} | {esc(w.get('price_if_stated') or '')} {esc(w.get('currency') or '') if w.get('price_if_stated') else ''} | {fitn} {esc(p.get('caveats'))[:140]} | [{esc(w.get('seller') or 'source')}]({w.get('url') or p.get('fitment_source_url')}) | {esc(p.get('confidence'))} |")
        B.append('')
    open(os.path.join(fam_dir,'bikes',bslug(mk,model,y)+'.md'),'w').write('\n'.join(B)+'\n')
br=collections.defaultdict(list)
for p in products: br[str(p.get('brand') or 'Unknown').strip()].append(p)
R=[f'# {title}: aftermarket brands','',f'{len(br)} brands with at least one part listed for these bikes, with the categories they cover and where the listings come from.','','| Brand | Parts | Categories | Sources |','|---|---|---|---|']
for b in sorted(br,key=lambda b:(-len(br[b]),b.lower())):
    ps=br[b]; cats=collections.Counter(str(p.get('category') or 'Other').split(' > ')[-1].strip() for p in ps)
    src=collections.Counter('KTM Twins' if p['id'].startswith('ktt-') else 'Lings' if p['id'].startswith('lng-') else 'Cycle Gear' if p['id'].startswith('cg-') else 'research' for p in ps)
    R.append(f"| {esc(b)} | {len(ps)} | {esc(', '.join(f'{c} ({n})' for c,n in cats.most_common(6)))} | {esc(', '.join(f'{k} {v}' for k,v in src.items()))} |")
open(os.path.join(fam_dir,'BRANDS.md'),'w').write('\n'.join(R)+'\n')
json.dump({'by_bike':{f'{a}|{b}|{c}':sorted(v) for (a,b,c),v in sorted(bike.items())},'unmapped':unmapped,
           'feedback_links':{x.get('id'):x['_linked'] for x in feedback}},open(os.path.join(fam_dir,'index.json'),'w'),indent=0)
print(len(products),'products',len(feedback),'feedback',len(builds),'builds;',len(bike),'of',len(roster),'bike-years mapped; unmapped',len(unmapped))
