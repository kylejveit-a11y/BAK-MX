"""Fetch the public MotoSport OEM diagram pages listed in each saved Honda/Yamaha index and build the inventory.
Ordinary public HTTP, one request at a time per brand, no login, nothing bypassed: a page that is not a normal 200 with the
parts <main> element is recorded as a gap and left alone. Resumable. Never writes a database.
usage: python3 scripts/capture-motosport-parts.py [--only honda/2023-crf250r ...]"""
import hashlib,json,re,subprocess,sys,time,datetime
from pathlib import Path
import requests
B=Path('docs/research/parts-pass14')
sha=lambda s:hashlib.sha256(s.encode('utf-8')).hexdigest()
IMG=re.compile(r'<img\b[^>]*>',re.I)
def transform(main):
    """Copy a published data-src into src so the offline parser can read the diagram picture. Returns (html, log)."""
    log=[]
    def rep(m):
        tag=m.group(0); d=re.search(r'\bdata-src="([^"]*)"',tag)
        if not d: return tag
        s=re.search(r'(?<![-\w])src="([^"]*)"',tag)
        if s and s.group(1)==d.group(1): return tag
        log.append({'attribute':'src','copied_from':'data-src','value':d.group(1)})
        if s: return tag[:s.start()]+'src="'+d.group(1)+'"'+tag[s.end():]
        return tag[:4]+' src="'+d.group(1)+'"'+tag[4:]
    return IMG.sub(rep,main),log
def slug(url): return url.rstrip('/').rsplit('/',1)[1]
def run(folder,session):
    idx=json.loads((folder/'index.json').read_text()); cap=folder/'captures'; cap.mkdir(exist_ok=True); gaps=[]; ver=[]
    for a in idx['assemblies']:
        p=cap/(slug(a['url'])+'.json')
        if p.exists() and json.loads(p.read_text()).get('html'): continue
        time.sleep(0.8)
        try:
            r=session.get(a['url'],timeout=45)
        except Exception as e:
            gaps.append({'url':a['url'],'error':type(e).__name__}); continue
        m=re.search(r'<main id="oem".*?</main>',r.text,re.S)
        if r.status_code!=200 or not m or r.url.rstrip('/')!=a['url'].rstrip('/'):
            gaps.append({'url':a['url'],'status':r.status_code,'final_url':r.url}); continue
        html,log=transform(m.group(0)); t=re.search(r'<h1[^>]*>(.*?)</h1>',m.group(0),re.S)   # the page heading names year, make, model and diagram
        p.write_text(json.dumps({'url':a['url'],'title':re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',t.group(1))).strip() if t else '','html':html,'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'response_sha256':sha(r.text),'source_html_sha256':sha(m.group(0)),'html_transformations':log},ensure_ascii=False))
    out=subprocess.run([sys.executable,'scripts/motosport_inventory.py','--directory',str(folder)],capture_output=True,text=True)
    inv=json.loads((folder/'inventory.json').read_text()) if (folder/'inventory.json').exists() else None
    if inv:   # independent check: rows in each saved source table versus rows the parser produced
        parsed={x['url']:len(x.get('parts',x.get('rows',[]))) for x in inv.get('assemblies',[])}
        rows=[]
        for a in idx['assemblies']:
            p=cap/(slug(a['url'])+'.json')
            if not p.exists(): continue
            c=json.loads(p.read_text()); rows.append({'url':a['url'],'source_table_rows':len(re.findall(r'name="skuID"',c['html'])) or c['html'].count('skuID'),'parsed_rows':parsed.get(a['url']),'sha256':sha(c['html'])})
        (folder/'intake-verification.json').write_text(json.dumps({'source':'Saved source tables; independent skuID row count versus parser output','rows':rows},indent=1))
        gaps+=[{'url':x['url'],'row_mismatch':[x['source_table_rows'],x['parsed_rows']]} for x in rows if x['source_table_rows']!=x['parsed_rows']]
    return gaps,out.stdout[-300:]+out.stderr[-300:],inv
if __name__=='__main__':
    only=sys.argv[2:] if len(sys.argv)>2 and sys.argv[1]=='--only' else None
    st=json.loads((B/'INVENTORY_STATUS.json').read_text())
    todo=[]
    for r in st['rows']:
        t=r['target']
        if t['manufacturer'] in('Honda','Yamaha') and not r['catalog_inventory_complete']:
            f=B/t['manufacturer'].lower()/f"{t['model_year']}-{t['model'].lower()}"
            if (f/'index.json').exists() and (only is None or str(f.relative_to(B)) in only): todo.append((-t['model_year'],str(f),f))
    s=requests.Session(); s.headers['User-Agent']='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
    for _,_,f in sorted(todo):
        gaps,msg,inv=run(f,s)
        print(json.dumps({'folder':str(f.relative_to(B)),'gaps':len(gaps),'first_gap':gaps[:1],'assemblies':len(inv.get('assemblies',[])) if inv else None,'msg':msg.strip()[-160:]}),flush=True)
