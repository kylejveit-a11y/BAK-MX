"""Capture Triumph off-road parts catalogs from the public catalog pages of an authorized Triumph dealer store.

Public pages only (robots.txt allows the catalog; no login, cart, account or API paths are used). One file per exact
catalogue and model year. Nothing is inferred: quantities and descriptions stay as published, prices are not kept.
A catalog is complete only when every category and assembly in the index was read and every assembly's row count
matches the count the page states.

  python3 scripts/capture-triumph-parts.py            # all off-road catalogues and years
"""
import hashlib,html,json,re,sys,time,urllib.parse,urllib.request
from pathlib import Path
BASE='https://www.triumphpartstore.com';OUT=Path('docs/research/parts-pass14/triumph');OUT.mkdir(parents=True,exist_ok=True)
CATALOGUES={'TF250-X':'TF 250-X','TF450-X':'TF 450-X','TF450-RC Edition':'TF 450-RC Edition','TF250-E':'TF 250-E','TF450-E':'TF 450-E','TF250-C':'TF 250-C','TF450-C':'TF 450-C'}
def get(url):
 for attempt in range(4):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (BAK MX parts research)'}),timeout=40) as r:
    time.sleep(0.25);return r.read()
  except Exception as e:
   if attempt==3:raise
   time.sleep(2+attempt*3)
text=lambda s:re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
def capture(code,model,year):
 path=OUT/f"{year}-{re.sub(r'[^a-z0-9]+','-',model.lower()).strip('-')}.json"
 if path.exists() and json.loads(path.read_text()).get('catalog_complete'):return 'REUSED',path.name
 q=urllib.parse.quote(code);index_url=f"{BASE}/us/catalog/{q}/{year}/{q}/all";raw=get(index_url).decode('utf-8','replace')
 cats=sorted(set(urllib.parse.unquote(m) for m in re.findall(r'/all/([^"\\?#<]+)',raw)))
 out={'target':{'manufacturer':'Triumph','model':model,'model_year':year,'variant':'standard','region':'US'},'source':'Authorized Triumph dealer OEM catalog (US)','catalogue_code':code,'index_url':index_url,'index_sha256':hashlib.sha256(raw.encode()).hexdigest(),'retrieved_at':time.strftime('%Y-%m-%d'),'categories':cats,'assemblies':[],'errors':[]}
 for cat in cats:
  cat_url=f"{index_url}/{urllib.parse.quote(cat)}";page=get(cat_url).decode('utf-8','replace')
  ids=list(dict.fromkeys(re.findall(r'/catalog/assembly/(\d+)',page)))
  if not ids:out['errors'].append(f'No assemblies listed in category {cat}')
  for aid in ids:
   url=f"{BASE}/us/catalog/assembly/{aid}?catalogue={q}&year={year}";body=get(url);s=body.decode('utf-8','replace')
   name=text(re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S)[1]) if re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S) else ''
   stated=re.search(r'Parts\s*(?:<!-- -->)?\s*\((?:<!-- -->)?(\d+)',s);rows=[]
   for n,tr in enumerate(re.findall(r'<tr id="part-row-[^"]+"[^>]*>(.*?)</tr>',s,re.S),1):
    cells=re.findall(r'<td[^>]*>(.*?)</td>',tr,re.S);pn=re.search(r'/catalog/part/([^?"]+)',tr)
    if len(cells)<4 or not pn:out['errors'].append(f'Unreadable row {n} in assembly {aid}');continue
    rows.append({'occurrence_index':n,'callout':text(cells[0]),'part_number':urllib.parse.unquote(pn[1]),'description':text(cells[2]),'catalog_quantity_raw':text(cells[3]),'remarks':''})
   img=re.search(r'(https(?:%3A|:)(?:%2F|/){2}[^"&\\ ]*?watermarked[^"&\\ ]*?\.(?:jpg|png|webp))',s)
   a={'id':aid,'name':name,'category':cat,'url':url,'rows':rows,'stated_rows':int(stated[1]) if stated else None,'diagram_urls':[urllib.parse.unquote(img[1])] if img else [],'source_response_sha256':hashlib.sha256(body).hexdigest()}
   a['enumeration_checked']=bool(name and rows and a['stated_rows']==len(rows));out['assemblies'].append(a)
 out['counts']={'categories':len(cats),'assemblies':len(out['assemblies']),'occurrences':sum(len(a['rows']) for a in out['assemblies'])}
 out['catalog_complete']=bool(cats and out['assemblies'] and not out['errors'] and all(a['enumeration_checked'] for a in out['assemblies']))
 path.write_text(json.dumps(out,indent=2)+'\n');return model,year,out['counts'],out['catalog_complete']
if __name__=='__main__':
 for code,model in CATALOGUES.items():
  listing=get(f"{BASE}/us/catalog/{urllib.parse.quote(code)}").decode('utf-8','replace')
  years=sorted({int(y) for y in re.findall(r'/us/catalog/'+re.escape(urllib.parse.quote(code))+r'/(20\d\d)',listing)}|{int(y) for y in re.findall(r'/us/catalog/'+re.escape(code)+r'/(20\d\d)',listing)})
  print(model,'years',years,flush=True)
  for y in years:
   try:print('DONE',capture(code,model,y),flush=True)
   except Exception as e:print('FAILED',model,y,repr(e)[:160],flush=True)
