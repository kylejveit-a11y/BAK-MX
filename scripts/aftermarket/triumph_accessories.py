"""Triumph TF genuine accessories from triumphpartstore.com (Triumph Waukesha, an official US Triumph dealer) -> research records.

usage: triumph_accessories.py <out.json> [cache dir]
For each TF catalogue and model year: the Accessories category page (its embedded data lists every accessory assembly), then
each assembly page (every part: number, name, US retail price, availability, dealer comment such as "Replaced by A9601360").
Fitment = the catalogue and year the part is listed under. robots.txt allows /us/catalog; about one request per second.
Confidence "medium" (official dealer catalog)."""
import json,os,re,subprocess,sys,time,collections,urllib.parse
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
out_f=sys.argv[1]; cache=sys.argv[2] if len(sys.argv)>2 else '/tmp/tri-cache'; os.makedirs(cache,exist_ok=True)
BASE='https://www.triumphpartstore.com'
# catalogue -> (app model name)
CATS={'TF250-X':'TF 250-X','TF450-X':'TF 450-X','TF450-RC Edition':'TF 450-RC Edition','TF250-C':'TF 250-C','TF450-C':'TF 450-C','TF250-E':'TF 250-E','TF450-E':'TF 450-E'}
def get(path):
    f=os.path.join(cache,re.sub(r'[^A-Za-z0-9]+','_',path)[:180]+'.html')
    if os.path.exists(f): return open(f).read()
    r=subprocess.run(['curl','-s','-L','-A',UA,'--max-time','60',BASE+path],capture_output=True,text=True); time.sleep(1.1)
    open(f,'w').write(r.stdout); return r.stdout
def un(h): return h.replace('\\"','"')
parts={}
for cat,model in CATS.items():
    q=urllib.parse.quote(cat)
    years=sorted(set(int(y) for y in re.findall(rf'/us/catalog/{re.escape(q)}/(20\d\d)',get(f'/us/catalog/{q}'))))
    for y in years:
        subs=sorted(set(re.findall(rf'/us/catalog/{re.escape(q)}/{y}/([^/"\\;]+)',get(f'/us/catalog/{q}/{y}'))))
        for sub in subs:
            h=un(get(f'/us/catalog/{q}/{y}/{sub}/all/Accessories'))
            for aid,name,cnt,subcat in re.findall(r'"id":(\d+),"name":"(.*?)","part_count":(\d+),.*?"subcategory":"(.*?)"',h):
                a=un(get(f'/us/catalog/assembly/{aid}?catalogue={q}&year={y}'))
                m=re.search(r'"parts":\[(.*?)\],"prev"',a,re.S)
                if not m: continue
                plist=[{'part_name':x[0],'part_number':x[1],'retail_price':x[2],'availability_status':x[3],'comment':x[5]} for x in
                       re.findall(r'"part_name":"(.*?)","part_number":"(.*?)","retail_price":"?([^",]*)"?,.*?"availability_status":"(.*?)".*?"comment":(null|"(.*?)"),"alternative_part_number"',m.group(1),re.S)]
                for p in plist:
                    pn=p.get('part_number')
                    if not pn: continue
                    r=parts.setdefault(pn,{'name':p.get('part_name'),'assembly':name,'subcategory':subcat,'price':p.get('retail_price'),
                        'status':p.get('availability_status'),'comment':p.get('comment') or '','fits':collections.defaultdict(set),'url':f'{BASE}/us/catalog/assembly/{aid}?catalogue={q}&year={y}'})
                    r['fits'][model].add(y)
        print(cat,years,len(parts),flush=True)
recs=[]
for pn,r in parts.items():
    live=not str(r['status']).lower().startswith('obsolete')
    recs.append({'id':'tri-'+pn,'category':r['subcategory'] or 'Accessories','subcategory':r['assembly'],'brand':'Triumph Genuine Accessories',
        'product':r['name'],'part_numbers':[pn],'variants':[],'fits':[{'make':'Triumph','model':m,'years':sorted(ys),'notes':''} for m,ys in sorted(r['fits'].items())],
        'fitment_source_url':r['url'],'what_it_changes':'','supporting_parts':'',
        'where_to_buy':[{'seller':'Triumph Waukesha (official dealer)','url':r['url'],'price_if_stated':r['price'],'currency':'USD','date':time.strftime('%Y-%m-%d')}],
        'rider_feedback':[],'caveats':('; '.join(x for x in (r['comment'],'' if live else 'Listed as obsolete or non-live') if x)) or 'Fitment as listed by the dealer catalog.',
        'confidence':'medium','status':r['status']})
json.dump({'slice':'Triumph genuine TF accessories (official dealer catalog)','source':BASE,'retrieved':time.strftime('%Y-%m-%d'),'products':recs},open(out_f,'w'))
print(len(recs),'parts')
