"""Yamaha genuine accessories and GYTR parts from yamahaonlineparts.com (public store feeds) -> research records.

usage: yamaha_accessories_convert.py <roster.json> <out.json> <feed file or dir> [...]
Inputs: collection feed pages ({"products": [...]}) and single product files ({"product": {...}}), e.g. the store's
accessories collection and every product whose handle names GYTR (handles taken from the store's product sitemaps).
Fitment comes from the listing's "Fits These Yamaha Models" block ("YZ450F - 2023-2026"); edition names map to the base
model. A listing with no such block whose title names one in-scope model ("... YZ450F") is kept with that model and no
years, so it shows in the catalog but on no bike page. Confidence "medium" (dealer catalog of genuine parts)."""
import html,json,os,re,sys,glob,collections
roster_f,out_f,*ins=sys.argv[1:]
models={m for mk,m,y in json.load(open(roster_f)) if mk=='Yamaha'}
files=[]
for x in ins: files+=sorted(glob.glob(os.path.join(x,'*.json'))) if os.path.isdir(x) else [x]
prods={}
for f in files:
    try: d=json.load(open(f))
    except Exception: continue
    for p in d.get('products') or ([d['product']] if d.get('product') else []): prods[p['id']]=p
def years(s):
    out=[]
    for a,b in re.findall(r'(\d{4})(?:\s*-\s*(\d{4}))?',s): out+=list(range(int(a),int(b or a)+1))
    return out
def base(m):
    m=re.sub(r'\s+(Monster Energy.*|\d+th Anniversary.*|World GP.*|Edition.*)$','',m.strip(),flags=re.I)
    return m.replace(' ','')
text=lambda s:re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s or ''))).strip()
recs=[]
for p in prods.values():
    b=p.get('body_html') or ''; i=b.find('Fits These Yamaha Models'); fits=collections.defaultdict(set); notes={}
    if i>=0:
        for li in re.findall(r'<li>(.*?)</li>',b[i:b.find('</ul>',i)],re.S):
            m=re.match(r'(.+?) - (.+)',html.unescape(li).strip())
            if not m: continue
            bm=base(m.group(1))
            if bm in models:
                fits[bm].update(years(m.group(2)))
                if bm!=m.group(1).replace(' ',''): notes[bm]=m.group(1)
    else:
        named=[m for m in models if re.search(rf'\b{re.escape(m)}\b',p['title'])]
        if len(named)==1: fits[named[0]]=set()
    if not fits: continue
    gytr='gytr' in p['handle'] or 'GYTR' in p['title'].upper()
    v=p.get('variants') or [{}]
    pn=sorted({x.get('sku') for x in v if x.get('sku')})
    desc=text(b[:b.find('<hr')] if '<hr' in b else b)
    recs.append({'id':'yop-'+p['handle'][:80],'category':'GYTR' if gytr else (p.get('product_type') or 'Accessories'),'subcategory':p.get('product_type') or '',
        'brand':'Yamaha GYTR' if gytr else 'Yamaha Genuine Accessories','product':re.sub(r'^Yamaha \S+ - ','',p['title']),'part_numbers':pn,'variants':[],
        'fits':[{'make':'Yamaha','model':m,'years':sorted(ys),'notes':notes.get(m,'' if ys else 'model named in the listing title; years not stated')} for m,ys in sorted(fits.items())],
        'fitment_source_url':f"https://yamahaonlineparts.com/products/{p['handle']}",'what_it_changes':('Seller description: '+desc[:260]) if desc else '',
        'supporting_parts':'','where_to_buy':[{'seller':'Yamaha Online Parts','url':f"https://yamahaonlineparts.com/products/{p['handle']}",'price_if_stated':v[0].get('price'),'currency':'USD','date':'2026-10-14'}],
        'rider_feedback':[],'caveats':'Fitment as listed by the dealer; confirm the part number against the Yamaha parts diagram for the bike.','confidence':'medium'})
json.dump({'slice':'Yamaha genuine accessories and GYTR (yamahaonlineparts.com dealer catalog)','source':'https://yamahaonlineparts.com (public store feeds)','retrieved':'2026-10-14','products':recs},open(out_f,'w'))
c=collections.Counter(r['brand'] for r in recs); print(len(recs),'records',dict(c),sum(1 for r in recs if all(f['years'] for f in r['fits'])),'with years')
