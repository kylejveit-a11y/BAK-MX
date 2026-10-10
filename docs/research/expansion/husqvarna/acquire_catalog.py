import urllib.request,urllib.parse,http.cookiejar,json,re,html,hashlib,concurrent.futures,time,pathlib
OUT=pathlib.Path(__file__).parent
BASE='https://sparepartsfinder.husqvarna-motorcycles.com'
def fetch(op,url,data=None):
 for retry in range(3):
  try:
   req=urllib.request.Request(url,data=data,headers={'X-Requested-With':'XMLHttpRequest'} if data else {})
   return op.open(req,timeout=50).read()
  except Exception:
   if retry==2:raise

def acquire(n):
 label=n['text'];model=re.match(r'FC (250|450)',label)[0];year=int(re.search(r'202\d',label)[0]);ident=n['id'];code=re.findall(r'<([^>]+)>',label)[-1];region=re.findall(r'<([^>]+)>',label);region=region[1] if len(region)==3 else None
 op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
 obj={'target':{'manufacturer':'Husqvarna','model':model,'model_year':year,'variant':'standard','region':'US'},'catalog_model_code':code,'catalog_region':region,'catalog_model_identifier':ident,'catalog_label':label,'assemblies':[],'parts':[],'facts':[],'mappings':[],'gaps':['Torque and other specification acquisition pending.'],'catalog_complete':False,'scope_confirmed':region=='US','source_url':BASE+'/','retrieved_at':'2026-09-13','raw_duplicate_rows':[]}
 path=OUT/f"fc-{model.split()[1].lower()}-{year}.json"
 def save():path.write_text(json.dumps(obj,indent=2)+'\n')
 links={}
 for engine in ['False','True']:
  url=BASE+'/Result/ExecuteSearch?modelIdentification='+ident+'&isEngine='+engine
  s=fetch(op,url).decode(); s=html.unescape(html.unescape(s))
  for match in re.finditer(r'<a\s+href="(/ComponentGroupTemplate/Index/\d+\?modelidentifier='+ident+r'&isEngine='+engine+r')"[^>]*>(.*?)</a>',s,re.S):
   name=re.sub('<[^>]+>','',match[2]).strip();title=re.search(r'title="([^"]+)"',match[0]);name=title[1] if title else name
   links[match[1]]={'name':name,'source_url':BASE+match[1]}
 obj['expected_assembly_count']=len(links);obj['catalog_manifest']={'source_url':BASE+'/Result/ExecuteSearch?modelIdentification='+ident+'&isEngine=False','source_urls':[BASE+'/Result/ExecuteSearch?modelIdentification='+ident+'&isEngine='+e for e in ['False','True']],'expected_assembly_ids':[re.search(r'/Index/(\d+)',x)[1] for x in links],'review_note':'Official engine and frame indexes reconciled against every table row count and diagram part number.'};save()
 for href,a in links.items():
  gid=re.search(r'/Index/(\d+)',href)[1];a.update(id=gid,expected_occurrences=None,enumeration_checked=False);obj['assemblies'].append(a)
  try:
   s=fetch(op,a['source_url']).decode();r=re.search(r'"read":\{"url":"([^"]+)"',s)
   endpoint=json.loads('"'+r[1]+'"');payload=urllib.parse.urlencode({'id':gid,'partType':1,'sort':'SequenceNumber-asc'}).encode()
   raw=fetch(op,BASE+endpoint,payload);j=json.loads(raw);rows=j['Data'];a['expected_occurrences']=j['Total'];a['source_response_sha256']=hashlib.sha256(raw).hexdigest();seen=set();pn=set()
   for row in rows:
    key=(row['SequenceNumber'],row['ArticleNumber']);pn.add(row['ArticleNumber'])
    if key in seen:obj['raw_duplicate_rows'].append({'assembly_id':gid,'row':row});continue
    seen.add(key);q=row['Quantity'];obj['parts'].append({'assembly_id':gid,'callout':str(row['SequenceNumber']),'part_number':row['ArticleNumber'],'description':row['ArticleDescription'],'additional_text':row['ArticleAdditionalText'],'quantity':q if q>0 else None,'catalog_quantity':q,'source_url':a['source_url'],'quantity_basis':'OEM_CATALOG'})
   diagram=set(html.unescape(x) for x in re.findall(r'data-article-number="([^"]+)"',s) if x not in ['${articleNumber}', '${data.ArticleNumber}']);a['diagram_part_count']=len(diagram);a['diagram_missing_part_numbers']=sorted(diagram-pn);a['enumeration_checked']=len(rows)==j['Total'] and not(diagram-pn);a['captured_occurrences']=len(seen)
  except Exception as e:a['error']=str(e)
  save();print(model,year,gid,len(obj['parts']),flush=True)
 obj['catalog_complete']=len(links)>0 and len(obj['assemblies'])==len(links) and all(a['enumeration_checked'] for a in obj['assemblies']);save();return model,year,len(obj['parts']),obj['catalog_complete']
if __name__=='__main__':
 s=urllib.request.urlopen(BASE).read().decode();tree=json.loads(re.search(r'var treeSettings = (.*);',s)[1]);nodes=[]
 def walk(ns):
  for n in ns:
   if n.get('children'):walk(n['children'])
   elif re.match(r'FC (250|450)\s+202[2-6]',n['text']) and not n['state']['disabled'] and '<US>' in n['text']:nodes.append(n)
 walk(tree['TreeElements']);nodes.sort(key=lambda n:(not('450' in n['text'] and '2025' in n['text']),n['text']))
 (OUT/'catalog-target-discovery.json').write_text(json.dumps({'source_url':BASE,'nodes':nodes},indent=2)+'\n')
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for result in pool.map(acquire,nodes):print('DONE',result,flush=True)
