"""MotoSport aftermarket catalog crawl for the app's bike list (research input, not app data).

usage: motosport_crawl.py targets.json outdir
targets.json: [[make, model, year, listing_url], ...]; listing_url is https://www.motosport.com/dirtbike/parts?mmy=<make>;<model
code>;<year>, the code taken from the store's ride selector (/ajax/ride-selector/model). The plain ride pages
(/dirtbike/rides/<year>/<make>/<model>-parts) are not filtered by bike when read without a selected ride (every one lists the
same 1,959 items), so the ride is selected with the mmy parameter, which the store's own links use.

Stage 1, per bike: every page of the bike's filtered parts listing (server-rendered, the retailer's own fitment). Each product card
gives the store item id, product name, brand, price and link -> outdir/bikes/<make>_<model>_<year>.json
Stage 2, per unique product (after each make group's bikes): the product page's category path, the "Part Numbers" table
(variant -> manufacturer part number), rating and description -> outdir/products/<slug>.json

robots.txt (motosport.com) allows product and ride pages (it disallows search, account, checkout and ?mmy=clear, none of
which are read). One connection, 1.1 s between requests, resumable; a bike whose later page fails is not saved, so a
re-run reads it again. Only the listing's stated page count is read: pages past it return items that are not
fitted to the bike."""
import html,json,os,re,subprocess,sys,time
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
targets=json.load(open(sys.argv[1])); out=sys.argv[2]
os.makedirs(f'{out}/bikes',exist_ok=True); os.makedirs(f'{out}/products',exist_ok=True)
def get(url):
    for attempt in range(3):
        r=subprocess.run(['curl','-s','-L','-A',UA,'--compressed','--max-time','60','-w','\n%{http_code}',url],capture_output=True,text=True)
        time.sleep(1.1)
        body,_,code=r.stdout.rpartition('\n')
        if code=='200': return body
        if code in ('404','410'): return None
        time.sleep(10*(attempt+1))
    return False
def text(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s or ''))).strip()
def cards(h):
    """Product cards: each has data-product-id, a link to the product page and a data-logging-info JSON (name, id, price, brand)."""
    out=[]
    parts=h.split('class="product-card')
    for i in range(1,len(parts)):
        blk=parts[i]; head=parts[i-1][-600:]
        pid=re.search(r'data-product-id="([^"]+)"[^<]*$',head)
        href=re.search(r'<a href="/([a-z0-9-]+)"',blk); li=re.search(r"data-logging-info='(\{.*?\})'",blk)
        if not href or not li: continue
        try: info=json.loads(html.unescape(li.group(1)))
        except Exception: info={}
        out.append({'slug':href.group(1),'item_id':pid.group(1) if pid else info.get('id'),'name':html.unescape(info.get('name') or ''),
                    'brand':info.get('brand') or '','price':info.get('price'),'original_price':info.get('originalPrice')})
    return out
def crawl_bike(make,model,year,url):
    f=f'{out}/bikes/{make}_{model.replace(" ","_").replace("/","")}_{year}.json'
    if os.path.exists(f): return json.load(open(f))['products']
    seen={};page=1;total=None;last=120
    while page<=last:
        h=get(url+(('&' if '?' in url else '?')+f'page={page}' if page>1 else ''))
        if h is False and page>1:
            print('bike',make,model,year,'page',page,'failed; not saved',flush=True); return list(seen.values())
        if not h: break
        if total is None:
            m=re.search(r'([\d,]+) Results',h); total=int(m.group(1).replace(',','')) if m else None
            m=re.search(r'Page 1 of (\d+)',h); last=int(m.group(1)) if m else 1  # pages past the stated last page list unrelated items
        new=[x for x in cards(h) if x['slug'] not in seen]
        for x in new: seen[x['slug']]=x
        if not new: break
        page+=1
    if total and len(seen)<0.95*total:  # stopped early (an empty or failed page): keep nothing so the next run reads it again
        print('bike',make,model,year,len(seen),'of',total,'incomplete; not saved',flush=True); return list(seen.values())
    json.dump({'make':make,'model':model,'year':year,'url':url,'pages':page-1,'stated_results':total,'retrieved':time.strftime('%Y-%m-%d'),'products':list(seen.values())},open(f,'w'))
    print('bike',make,model,year,len(seen),'of',total,flush=True)
    return list(seen.values())
def crawl_product(slug):
    f=f'{out}/products/{slug}.json'
    if os.path.exists(f): return
    h=get(f'https://www.motosport.com/{slug}')
    if not h: json.dump({'slug':slug,'error':'not found' if h is None else 'failed'},open(f,'w')); return
    pn=[]
    k=h.find('id="partnumbers"')
    if k>0:
        for v,p in re.findall(r'<tr>\s*<th scope="row">(.*?)</th>\s*<td>(.*?)</td>',h[k:k+60000],re.S): pn.append([text(v),text(p)])
    cat=re.search(r'"category":"(motosport\\/[^"]*)"',h); brand=re.search(r'"brand":"([^"]+)"',h)
    rating=re.search(r'"rating":([\d.]+),"ratingCount":(\d+)',h)
    desc=''
    for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>',h,re.S):
        try: d=json.loads(m)
        except Exception: continue
        for x in (d if isinstance(d,list) else [d]):
            if isinstance(x,dict) and x.get('@type')=='Product': desc=text(str(x.get('description') or ''))[:600]
    json.dump({'slug':slug,'url':f'https://www.motosport.com/{slug}','brand':html.unescape(brand.group(1)) if brand else None,
               'category':cat.group(1).replace('\\/','/') if cat else '','part_numbers':pn,
               'rating':{'ratingValue':rating.group(1),'reviewCount':int(rating.group(2))} if rating else None,
               'description':desc,'retrieved':time.strftime('%Y-%m-%d')},open(f,'w'))
if __name__=='__main__':
    groups=[['KTM','Husqvarna','GasGas'],['Triumph'],['Yamaha'],['Honda'],['Kawasaki']]
    for g in groups:
        slugs={}
        for make,model,year,url in sorted([t for t in targets if t[0] in g],key=lambda t:(-t[2],t[0],t[1])):
            for p in crawl_bike(make,model,year,url): slugs.setdefault(p['slug'],1)
        print('group',g,'unique products',len(slugs),flush=True)
        for s in slugs: crawl_product(s)
        print('group done',g,flush=True)
    print('all done',flush=True)
