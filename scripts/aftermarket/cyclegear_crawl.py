"""Cycle Gear aftermarket catalog crawl for the app's bike list (research input, not app data).

usage: cyclegear_crawl.py targets.json outdir
targets.json: [[make, model, year, vehicle_page_url], ...] in the order to crawl.

Stage 1, per bike: every page of the bike's "Parts for <year> <make> <model>" listing (server-rendered; the retailer's own
fitment). Each product tile gives product id, name, brand, price, rating and review count -> outdir/bikes/<make>_<model>_<year>.json
Stage 2, per unique product (after each make's bikes): the product page's breadcrumb category, every style with the
retailer item number and the manufacturer product number, the "Fitment Notes & Exceptions" text and the first part of the
description -> outdir/products/<slug>.json

robots.txt (cyclegear.com) allows /motorcycle/ and /parts/ pages and asks for a crawl delay of 1 s; this crawler waits
1.1 s between requests, uses one connection and resumes from the files already written."""
import html,json,os,re,subprocess,sys,time
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
targets=json.load(open(sys.argv[1])); out=sys.argv[2]
os.makedirs(f'{out}/bikes',exist_ok=True); os.makedirs(f'{out}/products',exist_ok=True)
def get(url):
    for attempt in range(3):
        r=subprocess.run(['curl','-s','-L','-A',UA,'--max-time','60','-w','\n%{http_code}',url],capture_output=True,text=True)
        time.sleep(1.1)
        body,_,code=r.stdout.rpartition('\n')
        if code=='200': return body
        if code=='404': return None
        time.sleep(10*(attempt+1))
    return None
TILE=re.compile(r'data-cnstrc-item-id="(\d+)" data-cnstrc-item-name="([^"]*)" data-cnstrc-item-price="([^"]*)".*?href="(/parts/[^"]+)".*?itemprop="brand"|data-cnstrc-item-id="(\d+)"',re.S)
def tiles(h):
    out=[]
    for blk in h.split('product-index-listing__product-tile-wrapper')[1:]:
        g=lambda p:(re.search(p,blk) or [None,None])[1]
        slug=g(r'href="/parts/([^"?#]+)"')
        if not slug: continue
        out.append({'slug':slug,'product_id':g(r'data-cnstrc-item-id="(\d+)"'),'name':html.unescape(g(r'data-cnstrc-item-name="([^"]*)"') or ''),
                    'price':g(r'data-cnstrc-item-price="([^"]*)"'),'brand':html.unescape(g(r'itemprop="brand" content="([^"]*)"') or g(r'content="([^"]*)" itemprop="brand"') or ''),
                    'rating':g(r'content="([\d.]+)" itemprop="ratingValue"'),'reviews':g(r'content="(\d+)" itemprop="reviewCount"')})
    return out
def crawl_bike(make,model,year,url):
    f=f'{out}/bikes/{make}_{model.replace(" ","_").replace("/","")}_{year}.json'
    if os.path.exists(f): return json.load(open(f))['products']
    seen={};page=1
    while page<=80:
        h=get(url+(f'?page={page}' if page>1 else ''))
        if not h: break
        t=tiles(h); new=[x for x in t if x['slug'] not in seen]
        for x in new: seen[x['slug']]=x
        if not new: break
        page+=1
    json.dump({'make':make,'model':model,'year':year,'url':url,'pages':page-1,'retrieved':time.strftime('%Y-%m-%d'),'products':list(seen.values())},open(f,'w'))
    print('bike',make,model,year,len(seen),flush=True)
    return list(seen.values())
def text(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
def crawl_product(slug):
    f=f'{out}/products/{slug}.json'
    if os.path.exists(f): return
    h=get(f'https://www.cyclegear.com/parts/{slug}')
    if not h: json.dump({'slug':slug,'error':'not found'},open(f,'w')); return
    j=h.find('breadcrumbs__list'); crumbs=[html.unescape(x) for x in re.findall(r'<meta content="([^"]*)" itemprop="name">',h[j:j+4000])][2:] if j>0 else []
    styles=[]
    for row in re.findall(r'<tr[^>]*>(.*?)</tr>',h,re.S):
        cells=[text(c) for c in re.findall(r'<td[^>]*>(.*?)</td>',row,re.S)]
        if len(cells)>=4 and re.search(r'\d',cells[1] if len(cells)>1 else ''):
            styles.append([re.sub(r'^(Product Style|Item #|Store SKU|Manufacturer Product #|Availability)\s*','',c) for c in cells])
    if not styles:
        t=text(h[h.find('Product Style'):h.find('Product Style')+6000]) if 'Product Style' in h else ''
        for m in re.finditer(r'Product Style (.*?) Item # (\S+) Store SKU (\S*?) ?Manufacturer Product # (\S+)',t): styles.append([m.group(1),m.group(2),m.group(3),m.group(4)])
    k=h.find('Fitment Notes'); fit=text(h[k:k+1500].split('<table')[0]) if k>0 else ''
    fit=re.split(r'Product Style|Item #',fit)[0].replace('Fitment Notes & Exceptions','').strip()
    desc='';brand=None;rating=None
    for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>',h,re.S):
        if m.lstrip().startswith('['):
            try: d=json.loads(m)[0]
            except Exception: continue
            brand=(d.get('brand') or {}).get('name'); desc=re.sub(r'\s+',' ',html.unescape(str(d.get('description') or '')))[:600]
            rating=d.get('aggregateRating'); break
    json.dump({'slug':slug,'url':f'https://www.cyclegear.com/parts/{slug}','brand':brand,'categories':crumbs,'styles':styles,'fitment_notes':fit,'rating':rating,
               'description':desc,'retrieved':time.strftime('%Y-%m-%d')},open(f,'w'))
order=[]
for make in dict.fromkeys(t[0] for t in targets): order.append(make)
groups=[['KTM','Husqvarna','GasGas'],['Triumph'],['Yamaha'],['Honda'],['Kawasaki']]
for g in groups:
    slugs={}
    for make,model,year,url in sorted([t for t in targets if t[0] in g],key=lambda t:(-t[2],t[0],t[1])):
        for p in crawl_bike(make,model,year,url): slugs.setdefault(p['slug'],1)
    print('group',g,'unique products',len(slugs),flush=True)
    for s in slugs: crawl_product(s)
    print('group done',g,flush=True)
print('all done',flush=True)
