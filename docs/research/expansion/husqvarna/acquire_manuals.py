import urllib.request,urllib.parse,json,re,pathlib,concurrent.futures,hashlib,subprocess
OUT=pathlib.Path(__file__).parent
TMP=pathlib.Path('/tmp/hq-manuals');TMP.mkdir(exist_ok=True)
PAGE='https://www.husqvarna-motorcycles.com/en-us/service/user-manuals.html'
s=urllib.request.urlopen(PAGE,timeout=30).read().decode();endpoint=re.search(r'data-manualsurl="([^"]+)"',s)[1]
def acquire(pair):
 model,year=pair;name=f'FC {model} {year}';query=endpoint+'?'+urllib.parse.urlencode({'modelName':name});j=json.load(urllib.request.urlopen(query,timeout=40));ls=[m for m in j.get('data',{}).get('manuals',[]) if '(en)' in m['title']];us=[m for m in ls if ' US ' in m['title']];chosen=(us or ls)[0] if ls else None
 row={'target':{'manufacturer':'Husqvarna','model':f'FC {model}','model_year':year,'variant':'standard','region':'US'},'selector_url':PAGE,'query_url':query,'english_results':ls,'selected':chosen,'scope_confirmed_by_selector':bool(us),'review_status':'PENDING'}
 if chosen:
  b=urllib.request.urlopen(chosen['link'],timeout=60).read();pdf=TMP/f'fc-{model}-{year}.pdf';pdf.write_bytes(b);subprocess.run(['pdftotext','-layout',str(pdf),str(pdf.with_suffix('.txt'))],check=True);row.update(document_sha256=hashlib.sha256(b).hexdigest(),bytes=len(b),temporary_pdf=str(pdf),temporary_text=str(pdf.with_suffix('.txt')))
 (OUT/f'manual-fc-{model}-{year}.json').write_text(json.dumps(row,indent=2)+'\n');print(name,chosen,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for x in pool.map(acquire,[(m,y) for m in [450,250] for y in [2025,2022,2023,2024,2026]]):pass
