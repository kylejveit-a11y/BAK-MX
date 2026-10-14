"""Cycle Gear crawl output -> aftermarket research records (one per product), for build_catalog.py.

usage: cyclegear_convert.py <crawl out dir> <make,make,...> <out.json>
Fitment = every bike-year listing (the retailer's own "Parts for <year> <make> <model>" page) the product appears on.
Part numbers = the manufacturer product number of each style on the product page (empty until the product page is read).
Category = the product page's breadcrumb (first level "Motorcycle Parts" dropped). Fitment notes are kept as caveats.
Confidence "medium" (retailer fitment)."""
import json,os,re,sys,glob,collections
cdir,makes,out_f=sys.argv[1],set(sys.argv[2].split(',')),sys.argv[3]
fits=collections.defaultdict(lambda:collections.defaultdict(set)); tile={}; bikes=0
for f in glob.glob(os.path.join(cdir,'bikes','*.json')):
    b=json.load(open(f))
    if b['make'] not in makes: continue
    bikes+=1
    for p in b['products']:
        fits[p['slug']][(b['make'],b['model'])].add(b['year']); tile.setdefault(p['slug'],p)
recs=[];read=0
for slug,by in fits.items():
    t=tile[slug]; pf=os.path.join(cdir,'products',slug+'.json')
    pg=json.load(open(pf)) if os.path.exists(pf) else {}
    if pg and not pg.get('error'): read+=1
    cats=[c for c in pg.get('categories') or [] if c not in ('Motorcycle Parts','Parts')]
    styles=pg.get('styles') or []
    pns=sorted({s[3] for s in styles if len(s)>3 and s[3] and s[3].upper() not in ('N/A','NA','-')})
    rating=pg.get('rating') or {}
    fb=[]
    if rating.get('reviewCount') or t.get('reviews'):
        fb=[{'source':'Cycle Gear customer reviews','summary':f"{rating.get('ratingValue') or t.get('rating')} of 5 from {rating.get('reviewCount') or t.get('reviews')} reviews (all fitments)"}]
    url=f'https://www.cyclegear.com/parts/{slug}'
    recs.append({'id':'cg-'+slug[:90],'category':(cats[0] if cats else 'Uncategorised'),'subcategory':' / '.join(cats[1:]),
        'brand':pg.get('brand') or t.get('brand') or '','product':t.get('name') or slug,'part_numbers':pns,
        'variants':[s[0] for s in styles if s and s[0] and s[0]!=t.get('name')][:20],
        'fits':[{'make':mk,'model':m,'years':sorted(ys),'notes':''} for (mk,m),ys in sorted(by.items())],
        'fitment_source_url':url,'what_it_changes':('Seller description: '+pg['description'][:260]) if pg.get('description') else '',
        'supporting_parts':'','where_to_buy':[{'seller':'Cycle Gear','url':url,'price_if_stated':(t.get('price') or '').replace(',','') or None,'currency':'USD','date':pg.get('retrieved') or '2026-10-14'}],
        'rider_feedback':fb,'caveats':(('Retailer fitment notes: '+pg['fitment_notes'][:300]+' ') if pg.get('fitment_notes') else '')+'Fitment as listed by the retailer.',
        'confidence':'medium'})
json.dump({'slice':'Cycle Gear retailer catalog (every brand listed for each bike-year)','source':'https://www.cyclegear.com (server-rendered bike and product pages)',
    'retrieved':'2026-10-14','bikes_read':bikes,'products':recs},open(out_f,'w'))
c=collections.Counter(r['brand'] for r in recs)
print(bikes,'bikes;',len(recs),'products;',read,'product pages read;',sum(1 for r in recs if r['part_numbers']),'with part numbers;',len(c),'brands')
