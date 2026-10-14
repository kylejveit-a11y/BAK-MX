"""MotoSport crawl output -> aftermarket research records (one per product), for build_catalog.py.

usage: motosport_convert.py <crawl out dir> <make,make,...> <out.json>
Fitment = every bike-year whose filtered listing (the retailer's own fitment) carries the product.
Part numbers = the product page's "Part Numbers" table (variant -> manufacturer part number); empty until the page is read.
Category = the product page's category path. Confidence "medium" (retailer fitment)."""
import json,os,sys,glob,collections
cdir,makes,out_f=sys.argv[1],set(sys.argv[2].split(',')),sys.argv[3]
fits=collections.defaultdict(lambda:collections.defaultdict(set)); card={}; bikes=0
for f in glob.glob(os.path.join(cdir,'bikes','*.json')):
    b=json.load(open(f))
    if b['make'] not in makes: continue
    bikes+=1
    for p in b['products']:
        fits[p['slug']][(b['make'],b['model'])].add(b['year']); card.setdefault(p['slug'],p)
recs=[];read=0
for slug,by in fits.items():
    c=card[slug]; pf=os.path.join(cdir,'products',slug+'.json')
    pg=json.load(open(pf)) if os.path.exists(pf) else {}
    if pg and not pg.get('error'): read+=1
    cats=[x for x in (pg.get('category') or '').split('/') if x and x!='motosport']
    if cats and cats[0]=='Parts': cats=cats[1:]
    pns=pg.get('part_numbers') or []
    rating=pg.get('rating') or {}
    url=f'https://www.motosport.com/{slug}'
    brand=pg.get('brand') or c.get('brand') or ''
    recs.append({'id':'ms-'+slug[:90],'category':cats[0] if cats else 'Uncategorised','subcategory':' / '.join(cats[1:]),
        'brand':brand,'product':(brand+' '+c['name']) if c.get('name') and not c['name'].startswith(brand) else (c.get('name') or slug),
        'part_numbers':sorted({p for v,p in pns if p}),'variants':[f'{v}: {p}' for v,p in pns][:20],
        'fits':[{'make':mk,'model':m,'years':sorted(ys),'notes':''} for (mk,m),ys in sorted(by.items())],
        'fitment_source_url':url,'what_it_changes':('Seller description: '+pg['description'][:260]) if pg.get('description') else '',
        'supporting_parts':'','where_to_buy':[{'seller':'MotoSport','url':url,'price_if_stated':c.get('price'),'currency':'USD','date':pg.get('retrieved') or '2026-10-14'}],
        'rider_feedback':([{'source':'MotoSport customer reviews','summary':f"{rating['ratingValue']} of 5 from {rating['reviewCount']} reviews (all fitments)"}] if rating.get('reviewCount') else []),
        'caveats':'Fitment as listed by the retailer.','confidence':'medium'})
json.dump({'slice':'MotoSport retailer catalog (every brand listed for each bike-year)','source':'https://www.motosport.com (server-rendered listing and product pages)',
    'retrieved':'2026-10-14','bikes_read':bikes,'products':recs},open(out_f,'w'))
b=collections.Counter(r['brand'] for r in recs)
print(bikes,'bikes;',len(recs),'products;',read,'product pages read;',sum(1 for r in recs if r['part_numbers']),'with part numbers;',len(b),'brands')
