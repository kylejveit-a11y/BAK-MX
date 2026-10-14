"""Lings (UK KTM / Husqvarna / GasGas dealer, Shopify) accessory feeds -> aftermarket research records.

usage: lings_convert.py <collections dir> <jobs.json> <out.json>
jobs.json: [[collection handle, make, model, year], ...] for the dealer's per-model-year accessory collections
("fc450-2025-accessories", "450-sx-f-2025-accessories", "mc450f-2024-accessories"). A product's fitment is every
model-year collection it appears in. Part number = variant SKU. Prices are the dealer's GBP prices. This is a European-market
catalog: US-model differences (homologation, colour codes) are possible, so every record says so. Confidence "medium"."""
import html,json,os,re,sys,glob,collections
cdir,jobs_f,out_f=sys.argv[1:4]
jobs={h:(mk,model,y) for h,mk,model,y in json.load(open(jobs_f))}
prods={};fit=collections.defaultdict(set)
for f in glob.glob(os.path.join(cdir,'*.json')):
    h=os.path.basename(f).rsplit('.',2)[0]
    if h not in jobs: continue
    try: ps=json.load(open(f))['products']
    except Exception: continue
    for p in ps: prods[p['id']]=p; fit[p['id']].add(jobs[h])
def text(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s or ''))).strip()
recs=[]
for pid,p in prods.items():
    by=collections.defaultdict(list)
    for mk,model,y in fit[pid]: by[(mk,model)].append(y)
    fits=[{'make':mk,'model':model,'years':sorted(ys),'notes':''} for (mk,model),ys in sorted(by.items())]
    skus=sorted({v.get('sku') for v in p['variants'] if v.get('sku')})
    prices=[float(v['price']) for v in p['variants'] if v.get('price')]
    vendor=re.sub(r'\s*PCA$',' (OEM accessory)',p['vendor'] or '').strip()
    brand={'Husqvarna (OEM accessory)':'Husqvarna Technical Accessories','GasGas (OEM accessory)':'GasGas Technical Accessories','KTM (OEM accessory)':'KTM PowerParts'}.get(vendor,vendor)
    desc=text(p.get('body_html'))
    recs.append({'id':'lng-'+p['handle'][:80],'category':p.get('product_type') or 'Accessories','subcategory':'','brand':brand,'product':p['title'],
        'part_numbers':skus,'variants':[v.get('title') for v in p['variants'] if v.get('title')!='Default Title'][:20],'fits':fits,
        'fitment_source_url':f"https://lings.com/products/{p['handle']}",'what_it_changes':('Seller description: '+desc[:260]) if desc else '',
        'supporting_parts':'','where_to_buy':[{'seller':'Lings (UK)','url':f"https://lings.com/products/{p['handle']}",'price_if_stated':(f'{min(prices):.2f}' if prices else None),'currency':'GBP','date':'2026-10-14'}],
        'rider_feedback':[],'caveats':'European-market dealer catalog; fitment from the dealer\'s model-year accessory lists; confirm US-model fit.','confidence':'medium'})
json.dump({'slice':'Lings dealer catalog (KTM PowerParts, Husqvarna and GasGas Technical Accessories, EU market)','source':'https://lings.com (public collection feeds)','retrieved':'2026-10-14','products':recs},open(out_f,'w'))
c=collections.Counter(r['brand'] for r in recs); print(len(recs),'records;',c.most_common(12))
