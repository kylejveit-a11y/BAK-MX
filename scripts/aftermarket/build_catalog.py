"""Aftermarket research catalog builder (one bike family at a time).

usage: build_catalog.py <family dir> <family title> <make>[,<make>...]
Reads every *.json research file in the family dir (products from the slice files, feedback and builds from the
rider-feedback file), normalises each fitment line to the app's bike list (docs/research/aftermarket/roster-2020-2027.json),
links rider feedback to products by brand and product words, and writes CATALOG.md and index.json in the same dir.
Research candidates only: nothing here is verified evidence or loaded into the app."""
import json,glob,os,re,sys,collections
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from textclean import anon,short,brand_name,CARB,INJECTION
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
    exact=[(mk,model) for mk,model,y in roster if mk==make and re.sub(r'[^A-Z0-9]','',model.upper())==re.sub(r'[^A-Z0-9]','',text.upper())]
    if exact: return sorted(set(exact))                      # a line that is exactly a roster model name (dealer and retailer feeds)
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
            four=fam in ('SX-F','XC-F','FC','FX') or (mk in ('Yamaha','Honda') and re.search(r'\d{3}F',M) is not None) or (mk=='Kawasaki' and re.fullmatch(r'KX\d{3}X?',M) is not None and d in ('250','450'))
            if famtoks and fam not in famtoks: continue
            if not famtoks and not (nums or every): continue
            if stroke and four!=(stroke=='4'): continue
        out.add((mk,model))
    return sorted(out)
products=[];feedback=[];builds=[];gaps=[];notdone=[];platforms=[];updates=[]
for f in sorted(glob.glob(os.path.join(fam_dir,'*.json')))+sorted(glob.glob(os.path.join(root,'specialty','*.json'))):
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
FEED=('ktt-','cg-','lng-','tri-','ms-','yop-')
isfeed=lambda p:str(p['id']).startswith(FEED)
feed=[p for p in products if isfeed(p)]
if feed:
    L+=['','## Dealer and retailer catalogs','',f'{len(feed)} listings from dealer and retailer catalogs are summarised here and listed in full on the per-bike pages (bikes/) and in BRANDS.md.','',
        '| Source | Listings | Brands | With part numbers |','|---|---|---|---|']
    for pre,name in (('ktt-','KTM Twins (official KTM dealer, US)'),('lng-','Lings (KTM/Husqvarna/GasGas dealer, UK)'),('tri-','Triumph Waukesha (official Triumph dealer, US)'),('cg-','Cycle Gear (retailer, US)'),('ms-','MotoSport (retailer, US)'),('yop-','Yamaha Online Parts (Yamaha dealer, US)')):
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
SRC={'ktt-':'KTM Twins','lng-':'Lings','tri-':'Triumph dealer','cg-':'Cycle Gear','ms-':'MotoSport','yop-':'Yamaha dealer'}
src_of=lambda p:next((v for k,v in SRC.items() if str(p['id']).startswith(k)),'research')
# A retailer listing carried for three or more make families (KTM group, Triumph, Yamaha, Honda, Kawasaki) is a universal
# item (oil, grips, batteries): counted on the bike pages and kept in parts.csv, but not listed row by row.
read_by=collections.defaultdict(set)
for (mk,model,y),ids in bike.items():
    for i in ids: read_by[src_of(byid[i])].add((mk,model,y))
nfit=lambda p:sum(len(f.get('years') or []) for f in p.get('fits') or [])
universal=lambda p:src_of(p) in ('Cycle Gear','MotoSport') and p.get('listed_families',1)>=3
def yr(ys):
    ys=sorted(set(ys)); out=[]
    for y in ys:
        if out and y==out[-1][1]+1: out[-1][1]=y
        else: out.append([y,y])
    return ', '.join(f'{a}' if a==b else f'{a}-{b}' for a,b in out)
import csv
with open(os.path.join(fam_dir,'parts.csv'),'w',newline='') as fh:
    w=csv.writer(fh); w.writerow(['source','brand','product','category','part_numbers','price','currency','url','fits','confidence','id'])
    for p in sorted(products,key=lambda p:(str(p.get('brand')).lower(),str(p.get('product')))):
        wb=(p.get('where_to_buy') or [{}])[0]
        w.writerow([src_of(p),p.get('brand'),p.get('product'),' / '.join(x for x in (p.get('category'),p.get('subcategory')) if x),' '.join(p.get('part_numbers') or []),
                    wb.get('price_if_stated') or '',wb.get('currency') or '',wb.get('url') or p.get('fitment_source_url') or '',
                    '; '.join(f"{f.get('make')} {f.get('model')} {yr(f.get('years') or [])}".strip() for f in p.get('fits') or []),p.get('confidence'),p['id']])
norm=lambda s:re.sub(r'[^a-z0-9]+',' ',str(s).lower()).strip()
for (mk,model,y),ids in bike.items():
    ps=[byid[i] for i in ids]
    res=[p for p in ps if src_of(p)=='research']; uni=[p for p in ps if universal(p)]; spec=[p for p in ps if src_of(p)!='research' and not universal(p)]
    B=[f'# {mk} {model} {y}: aftermarket parts','',
       f'{len(ids)} listings whose stated fitment names this bike: {len(res)} researched parts (with what they change and rider findings), '
       f'{len(spec)} dealer and retailer listings specific to this bike, and {len(uni)} universal retailer listings (oil, grips, batteries and the like, '
       'counted below; every listing is in [parts.csv](../parts.csv)). Research candidates: check fitment on the maker\'s page before relying on a row. '
       'Back to [the family catalog](../CATALOG.md).','']
    if res:
        B+=['## Researched parts','','| Brand | Part | Part numbers | What it changes | Caveats | Source | Confidence |','|---|---|---|---|---|---|---|']
        for p in sorted(res,key=lambda p:(str(p.get('category')),str(p.get('brand')))):
            wb=(p.get('where_to_buy') or [{}])[0]
            B.append(f"| {esc(p.get('brand'))} | {esc(p.get('product'))[:120]} | {esc(', '.join(p.get('part_numbers') or [])[:160])} | {esc(p.get('what_it_changes'))[:200]} | {esc(p.get('caveats'))[:160]} | [{esc(wb.get('seller') or 'source')}]({wb.get('url') or p.get('fitment_source_url')}) | {esc(p.get('confidence'))} |")
        B.append('')
    cats=collections.defaultdict(list)
    for p in spec: cats[str(p.get('category') or 'Other').split(' > ')[-1].strip().title()].append(p)
    if spec: B+=['## Dealer and retailer listings for this bike','','Merged across sellers by brand and part number (or brand and name). Lings is a UK dealer (GBP prices, EU-market models).','']
    for c in sorted(cats):
        B+=[f'### {c} ({len(cats[c])})','','| Brand | Part | Part numbers | Price | Sellers |','|---|---|---|---|---|']
        rows=collections.OrderedDict()
        for p in sorted(cats[c],key=lambda p:(str(p.get('brand')).lower(),str(p.get('product')))):
            k=(norm(p.get('brand')),tuple(sorted(p.get('part_numbers') or []))) if p.get('part_numbers') else (norm(p.get('brand')),norm(p.get('product')))
            rows.setdefault(k,[]).append(p)
        for grp in rows.values():
            p=grp[0]; wb=(p.get('where_to_buy') or [{}])[0]
            sellers=' · '.join(dict.fromkeys(f"[{src_of(g)}]({(g.get('where_to_buy') or [{}])[0].get('url') or g.get('fitment_source_url')})" for g in grp))
            pns=sorted({x for g in grp for x in g.get('part_numbers') or []})
            B.append(f"| {esc(p.get('brand'))} | {esc(p.get('product'))[:100]} | {esc(', '.join(pns)[:120])} | {esc(wb.get('price_if_stated') or '')} {esc(wb.get('currency') or '') if wb.get('price_if_stated') else ''} | {sellers} |")
        B.append('')
    if uni:
        uc=collections.Counter(str(p.get('category') or 'Other').title() for p in uni); ub=collections.Counter(str(p.get('brand')) for p in uni)
        B+=['## Universal retailer listings (counted only)','',', '.join(f'{c} {n}' for c,n in uc.most_common()),'','Top brands: '+', '.join(f'{b} {n}' for b,n in ub.most_common(25)),'']
    open(os.path.join(fam_dir,'bikes',bslug(mk,model,y)+'.md'),'w').write('\n'.join(B)+'\n')
br=collections.defaultdict(list)
for p in products: br[str(p.get('brand') or 'Unknown').strip()].append(p)
R=[f'# {title}: aftermarket brands','',f'{len(br)} brands with at least one part listed for these bikes, with the categories they cover and where the listings come from.','','| Brand | Parts | Categories | Sources |','|---|---|---|---|']
for b in sorted(br,key=lambda b:(-len(br[b]),b.lower())):
    ps=br[b]; cats=collections.Counter(str(p.get('category') or 'Other').split(' > ')[-1].strip() for p in ps)
    src=collections.Counter('KTM Twins' if p['id'].startswith('ktt-') else 'Lings' if p['id'].startswith('lng-') else 'Triumph dealer' if p['id'].startswith('tri-') else 'Cycle Gear' if p['id'].startswith('cg-') else 'MotoSport' if p['id'].startswith('ms-') else 'Yamaha dealer' if p['id'].startswith('yop-') else 'research' for p in ps)
    R.append(f"| {esc(b)} | {len(ps)} | {esc(', '.join(f'{c} ({n})' for c,n in cats.most_common(6)))} | {esc(', '.join(f'{k} {v}' for k,v in src.items()))} |")
open(os.path.join(fam_dir,'BRANDS.md'),'w').write('\n'.join(R)+'\n')
json.dump({'by_bike':{f'{a}|{b}|{c}':sorted(i for i in v if src_of(byid[i])=='research') for (a,b,c),v in sorted(bike.items())},
           'listing_counts':{f'{a}|{b}|{c}':dict(collections.Counter(src_of(byid[i]) for i in v)) for (a,b,c),v in sorted(bike.items())},'unmapped':unmapped,
           'feedback_links':{x.get('id'):x['_linked'] for x in feedback}},open(os.path.join(fam_dir,'index.json'),'w'),indent=0)
print(len(products),'products',len(feedback),'feedback',len(builds),'builds;',len(bike),'of',len(roster),'bike-years mapped; unmapped',len(unmapped))

# ---------------------------------------------------------------------------------------------------------------
# App catalog (optional): APP_OUT=<dir> writes <dir>/<family>.json, the rider-facing "What's on your bike" picker data.
# Only parts a rider fits and that change how the bike runs or fits are kept, sorted into plain systems; listings merged
# across sellers by brand and part number (or brand and name). Researched parts carry what they change, caveats and tester
# notes and their source link; retailer listings keep brand, name and part numbers only, so the file stays small.
APP_OUT=os.environ.get('APP_OUT')
if APP_OUT:
    SYSTEMS=['exhaust','suspension','engine','clutch','tuning','intake','gearing','brakes','controls','chassis','wheels','protection','body']
    JUNK=re.compile(r'\b(testers?|diagnostic|timing (?:kit|light)|fuel pack|rotopax|fuel mixture|tool|tools|stand|lift|wrench|socket|torx|battery|batteries|charger|tender|light|lights|lamp|led|helmet|jersey|glove|gloves|boot|boots|goggle|goggles|decal|decals|graphic|graphics|sticker|backgrounds?|grease|lube|lubricant|cleaner|polish|wash|tie[- ]?downs?|ramp|bag|luggage|backpack|gps|phone|camera|hour ?meter|tach|speedometer|computer|radio|intercom|cover kit|bike cover|muffler plug|exhaust plug|packing|repack|wrap|manual|book|poster|key ?chain|mat|funnel|sealant|thread ?lock|loctite|zip ?ties?|fluid|coolant|oil(?! ?filter)|gift card|t-?shirt|hat|hoodie|sticker|tape(?! grip)|brush|towel|gauge|tie rod|winch|plow|rack|basket(?! clutch)|cooler|mirror|horn|turn signal|license|stand|umbrella)\b',re.I)
    RULES=[('tuning',r'\b(ecu|e\.c\.u|ignition (?:box|module|curve)|map ?switch|map select|tuner|tuning|fuel controller|power commander|programmable ignition|ignition(?! covers?)|re-?flash|remap|wi-?fi|connectivity|fi calibration|power tuner|launch control|traction control|engine control|fuel injection kit|injector|throttle body|fuel pump|carburetor|carb\b|jet kit|main jet|pilot jet|needle)'),
           ('controls',r'\b(handlebars?|fat ?bar|bar pad|grips?|levers?|perch|throttle tube|throttle|foot ?pegs?|pegs?|bar mounts?|bar clamps?|handguards?|hand guards?|brush guards?|kill switch|start button|shift(?:er| lever)|gear lever|brake pedal|kick ?start(?:er)?|hot start|clutch cable|throttle cable|bar riser)\b'),
           ('protection',r'\b(skid ?plates?|glide ?plates?|bash ?plates?|linkage guards?|link guards?)\b'),
           ('clutch',r'\bclutch\b(?! (cables?|levers?|perch|perches|guards?|covers? guard))'),
           ('exhaust',r'\b(exhausts?|mufflers?|silencers?|slip-?ons?|head ?pipes?|header|expansion chamber|pipes?|megabomb|spark arrest(?:o|e)r|end ?cap|power ?bomb|tailpipe|resonator)\b'),
           ('suspension',r'\b(forks?|shocks?|springs?|linkage|link arm|pull rod|cartridge|preload|holeshot|start device|launch device|bleeders?|fork seals?|seal kit|dust seals?|suspension|valving|revalve|air fork|fork guard|clickers?|sag|shock bladder|piston kit fork)\b'),
           ('clutch',r'\b(clutch|pressure plate|friction plates?|steel plates?|clutch basket|inner hub|torqdrive|auto ?clutch|slave cylinder)\b'),
           ('chassis',r'\b(triple clamps?|clamp set|steering stem|steering damper|stabilizer|engine mounts?|engine hanger|subframe|frame|swing ?arm|chain guide|chain slider|chain roller|rollers?|axle|axle block|wheel spacers?)\b'),
           ('gearing',r'\b(sprockets?|chain(?! guard)|master link|drive kit)\b'),
           ('brakes',r'\b(brakes?|rotors?|calipers?|pads?|master cylinder|brake discs?|discs?|brake lines?|oversize rotor)\b'),
           ('wheels',r'\b(wheels?|rims?|hubs?|spokes?|tires?|tyres?|tubes?|mousse|tubliss|rim locks?|bead lock|nipples)\b'),
           ('intake',r'\b(air ?filters?|air ?box|airbox|intake|velocity stack|filter cage|air boot|pre-?filter|filter skin|air filter cover|snorkel|reed|reeds|reed valve)\b'),
           ('engine',r'\b(pistons?|cylinders?|head|cams?|camshafts?|valves?|crank|crankshaft|connecting rod|big bore|stroker|gaskets?|top end|bottom end|water pump|radiators?|cooling|fan|hose kit|radiator hoses?|thermostat|ignition cover|stator|flywheel|engine|oil filter|power valve|exhaust valve|transmission|gear set|shift drum|cylinder head|compression)\b'),
           ('protection',r'\b(skid ?plate|glide ?plate|bash ?plate|guards?|protectors?|frame guards?|radiator guards?|disc guards?|caliper guard|case saver|case guard|shark fin|link guard|chain guard)\b'),
           ('body',r'\b(plastics?|plastic kit|fenders?|shrouds?|number plates?|side panels?|side covers?|seats?|seat cover|seat foam|tanks?|fuel tank|gas tank|airbox cover|air box cover)\b')]
    CATHINT=[('exhaust','exhaust'),('suspension','suspension'),('clutch','clutch'),('chain','gearing'),('sprocket','gearing'),('brake','brakes'),('tire','wheels'),('wheel','wheels'),
             ('handlebar','controls'),('controls','controls'),('ergonomic','controls'),('protection','protection'),('skid','protection'),('seat','body'),('body','body'),('plastics','body'),
             ('intake','intake'),('filter','intake'),('air & fuel','intake'),('fuel','tuning'),('ecu','tuning'),('electronics','tuning'),('engine','engine'),('cooling','engine'),
             ('chassis','chassis'),('drive','gearing'),('gytr','engine'),('performance','engine')]
    def system_of(p):
        name=f"{p.get('product') or ''}"; cat=f"{p.get('category') or ''} {p.get('subcategory') or ''}".lower(); t=(name+' '+cat).lower()
        if JUNK.search(name) and not re.search(r'clutch basket|oil filter',name,re.I): return None
        if re.search(r'\b(riding gear|helmets|luggage|lights|lighting|batteries|electrical|gauges|tools|utv|farming|winch|garage|security|styling|comfort|decal|fluids|graphics|vehicle communication|gps|bags)\b',cat) and not re.search(r'fuel|ecu|tun',t): return None
        for s,rx in RULES:
            if re.search(rx,name,re.I): return s
        for k,s in CATHINT:
            if k in cat: return s
        return None
    MAKES=r'(?:KTM|Husqvarna|Husky|Gas ?Gas|GASGAS|Yamaha|Honda|Kawasaki|Suzuki|Triumph|Beta|Sherco|CF ?Moto|Stark|Husaberg|AJP|TM|Fantic|Rieju|Kayo|Polaris|Can-Am|Arctic Cat|BMW|Ducati)'
    def clean(brand,name):
        n=re.sub(r'\s+',' ',str(name)).strip()
        if brand and n.lower().startswith(str(brand).lower()+' '): n=n[len(brand)+1:]
        m=re.search(r'\s+(?:-\s+|for\s+|\|\s+)?'+MAKES+r'\b[\s/,&+-]*(?:'+MAKES+r'\b[\s/,&+-]*)*.*$',n)
        if m and m.start()>=6: n=n[:m.start()]
        n=re.sub(r'\s*\([^)]*$','',n); n=re.sub(r'\s*[-|,/]\s*$','',n).strip()
        return n[:90] or str(name)[:90]
    SELL={'Cycle Gear':('cg','https://www.cyclegear.com/parts/'),'MotoSport':('ms','https://www.motosport.com/'),'KTM Twins':('kt','https://ktmtwins.com/products/'),
          'Lings':('lg','https://lings.com/products/'),'Triumph dealer':('tr',''),'Yamaha dealer':('ym','https://yamahaonlineparts.com/products/'),'research':('rs','')}
    brands=[];bidx={}
    def bi(b):
        b=re.sub(r'\s+',' ',str(b or 'Unbranded')).strip()
        k=re.sub(r'[^a-z0-9]','',b.lower())
        if k not in bidx: bidx[k]=len(brands); brands.append(b)
        return bidx[k]
    items=[];ikey={};bikes_out={}
    # testers and magazines are never named to riders: their findings read as "testers found"
    # testers and magazines are never named to riders (textclean.anon)
    for (mk,model,y),ids in sorted(bike.items()):
        lst=set()
        for i in ids:
            p=byid[i]; s=system_of(p)
            if not s: continue
            src=src_of(p); b=bi(brand_name(p.get('brand')) if src=='research' else p.get('brand')); pns=sorted(p.get('part_numbers') or [])
            name=clean(brands[b],p.get('product'))
            key=(b,tuple(pns)) if pns else (b,re.sub(r'[^a-z0-9]','',name.lower()))
            if key not in ikey:
                ikey[key]=len(items); items.append({'b':b,'n':name,'s':SYSTEMS.index(s),'p':' '.join(pns)[:48],'u':[],'r':None})
            it=items[ikey[key]]
            if src=='research':
                it['r']=p['id']; it['n']=name; it['conf']=p.get('confidence')
                it['w']=short(p.get('what_it_changes'),220); it['c']=short(' '.join((' '.join(map(str,x)) if isinstance(x,list) else str(x)) for x in (p.get('supporting_parts'),p.get('caveats')) if x),220)
                fb=[short(x.get('observed'),160) for x in p.get('_feedback',[]) if x.get('observed')][:2] or [short(x,160) for x in (p.get('rider_feedback') or []) if isinstance(x,str) and x.strip()][:2]
                if fb: it['t']=fb
                if not it['p'] and pns: it['p']=' '.join(pns)[:80]
            code,base=SELL.get(src,('rs',''))
            w=(p.get('where_to_buy') or [{}])[0]; url=w.get('url') or p.get('fitment_source_url') or ''
            path=url[len(base):] if base and url.startswith(base) else url
            if src=='research' and path and len(it['u'])<2 and all(c!=code for c,_,_ in it['u']):
                pr=w.get('price_if_stated'); it['u'].append((code,path,anon((str(pr)+' '+(w.get('currency') or '')).strip()) if pr else ''))
            if p.get('is_service'): it['sv']=1
            if s in ('tuning','intake','engine') and CARB.search(name+' '+str(p.get('subcategory') or '')) and not INJECTION.search(name): it['k']='c'
            elif s=='tuning' and INJECTION.search(name+' '+str(p.get('subcategory') or '')): it['k']='i'
            lst.add(ikey[key])
        srt=sorted(lst); bikes_out[f'{mk}|{model}|{y}']=[v-(srt[i-1] if i else 0) for i,v in enumerate(srt)]  # delta-encoded item indexes
    out_items=[]
    for it in items:
        o={'b':it['b'],'n':it['n'],'s':it['s']}
        if it['p']:o['p']=it['p']
        if it['u']:o['u']=[[c,pth]+([pr] if pr else []) for c,pth,pr in it['u']]
        for k in ('r','conf','w','c','t','sv','k'):
            if it.get(k):o[k]=it[k]
        out_items.append(o)
    fam=os.path.basename(fam_dir.rstrip('/'))
    os.makedirs(APP_OUT,exist_ok=True)
    json.dump({'v':2,'family':fam,'generated':'2026-10-15','systems':SYSTEMS,'sellers':{c:b for c,b in SELL.values()},'brands':brands,'items':out_items,'bikes':bikes_out},
              open(os.path.join(APP_OUT,fam+'.json'),'w'),separators=(',',':'),ensure_ascii=False)
    print('app catalog',fam,len(out_items),'items',len(brands),'brands',os.path.getsize(os.path.join(APP_OUT,fam+'.json'))//1024,'KB',collections.Counter(SYSTEMS[i['s']] for i in out_items).most_common())
