"""KTM Twins (official KTM dealer, Shopify store) catalog -> aftermarket research records for the KTM family.

usage: ktmtwins_convert.py <collections dir> <roster.json> <out.json>
Input: the store's public collection feeds (/collections/<handle>/products.json), one file per page, named
<handle>.<page>.json. Each listing's "FITMENT" block ("KTM 250 SX-F 2023-2027", "KTM 300 XC TPI 2020-2022, 2024") is read
into make / model / years; "TPI" and edition suffixes map to the base model. OEM microfiche (replacement parts) is left out.
A listing without a fitment block but filed in a model collection ("ktm-450-sx-f-parts") keeps that as a yearless hint.
Records follow the research schema used by build_catalog.py; confidence "medium" (dealer listing)."""
import html,json,os,re,sys,glob,collections
cdir,roster_f,out_f=sys.argv[1:4]
roster={(a,b) for a,b,c in json.load(open(roster_f))}
models={m for a,m in roster if a=='KTM'}
prods={};member=collections.defaultdict(set)
for f in glob.glob(os.path.join(cdir,'*.json')):
    h=os.path.basename(f).rsplit('.',2)[0]
    try: ps=json.load(open(f))['products']
    except Exception: continue
    for p in ps: prods[p['id']]=p; member[p['id']].add(h)
def text(s): return re.sub(r'[ \t]+',' ',html.unescape(re.sub(r'<[^>]+>','\n',s)))
def years(s):
    out=[]
    for a,b in re.findall(r'(\d{4})(?:\s*-\s*(\d{4}))?',s):
        out+=list(range(int(a),int(b or a)+1))
    return out
MAKES=r'(KTM|Husqvarna|HUSQVARNA|GasGas|GASGAS|Gas Gas)'
def fits_of(body):
    t=text(body); i=t.upper().find('FITMENT')
    if i<0: return []
    blk=re.sub(r'\s+',' ',t[i+7:i+6000])
    out=[]
    for mk,model,ys in re.findall(MAKES+r'\s+(.+?)\s+((?:\d{4}(?:\s*-\s*\d{4})?\s*,?\s*)+)',blk):
        make={'HUSQVARNA':'Husqvarna','GASGAS':'GasGas','Gas Gas':'GasGas'}.get(mk,mk)
        base=re.sub(r'\s+(TPI|TBI|Factory Edition|Six Days|Adamo Edition|Rockstar Edition|Heritage|Champion Edition).*$','',model.strip(),flags=re.I)
        base={'85 SX':'85 SX 17/14'}.get(base,base)
        out.append({'make':make,'model':base,'years':years(ys),'notes':model.strip() if base!=model.strip() else ''})
    return out
recs=[]
for p in prods.values():
    if p['product_type']=='OEM Microfiche': continue
    fits=fits_of(p['body_html'])
    insc=[x for x in fits if (x['make'],x['model']) in roster or (x['make']=='KTM' and x['model']=='85 SX 17/14')]
    hints=sorted(h for h in member[p['id']] if re.fullmatch(r'ktm-(\d+)-(sx|sx-f|xc|xc-f)-parts',h))
    if not insc and not hints: continue
    for x in list(insc):
        if x['model']=='85 SX 17/14': insc.append(dict(x,model='85 SX 19/16'))
    for h in hints:
        if not insc:
            m=re.fullmatch(r'ktm-(\d+)-(sx|sx-f|xc|xc-f)-parts',h); mm=f"{m.group(1)} {m.group(2).upper()}"
            insc.append({'make':'KTM','model':mm,'years':[],'notes':f'listed in the dealer\'s {mm} parts collection; years not stated'})
    t=text(p['body_html']); i=t.upper().find('FITMENT'); desc=re.sub(r'\s+',' ',(t[:i] if i>0 else t)).strip()
    desc=re.sub(r'PROPOSITION 65.*?(?:p65warnings\.ca\.gov|oehha\.ca\.gov/proposition-65)\S*','',desc,flags=re.I|re.S).strip()
    skus=[v.get('sku') for v in p['variants'] if v.get('sku')]
    prices=[float(v['price']) for v in p['variants'] if v.get('price')]
    recs.append({'id':'ktt-'+p['handle'][:80],'category':p['product_type'] or 'Other','subcategory':'','brand':p['vendor'],
        'product':p['title'],'part_numbers':sorted(set(skus)),'variants':[v.get('title') for v in p['variants'] if v.get('title')!='Default Title'][:20],
        'fits':insc,'fitment_source_url':f"https://ktmtwins.com/products/{p['handle']}",
        'what_it_changes':('Seller description: '+desc[:260]) if desc else '','supporting_parts':'',
        'where_to_buy':[{'seller':'KTM Twins','url':f"https://ktmtwins.com/products/{p['handle']}",'price_if_stated':(f'{min(prices):.2f}' if prices else None),'currency':'USD','date':'2026-10-14'}],
        'rider_feedback':[],'caveats':('Dealer marks fitment to be confirmed. ' if 'confirm-fitment' in p['tags'] else '')+'Fitment as listed by the dealer.',
        'confidence':'medium','tags':[t for t in p['tags'] if re.match(r'(20\d\dpowerparts|PowerParts|KTM All MX|KTM All Enduro)$',t)]})
json.dump({'slice':'KTM Twins dealer catalog (KTM PowerParts and aftermarket brands sold by an official KTM dealer)','source':'https://ktmtwins.com (public collection feeds)','retrieved':'2026-10-14','products':recs},open(out_f,'w'))
c=collections.Counter(r['brand'] for r in recs)
print(len(recs),'records;',len(c),'brands;',sum(1 for r in recs if r['part_numbers']),'with part numbers'); print(c.most_common(25))
