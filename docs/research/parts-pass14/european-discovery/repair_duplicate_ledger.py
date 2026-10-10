"""Bounded four-file integrity repair. Refetch only existing assembly4668, no new catalog."""
import json,pathlib,hashlib,re,sys,urllib.parse,datetime
sys.path.insert(0,'C:/Users/kylej/AppData/Local/Temp/parts-pass14-python')
import requests
B=pathlib.Path(__file__).resolve().parent;T=pathlib.Path('C:/Users/kylej/AppData/Local/Temp/parts-pass14-europe/duplicate-verification');T.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest();session=requests.Session();audit=[]
names=['250-sx-f-2024-1003029304.json','250-sx-f-2025-1003417530.json','250-sx-f-2026-1003992693.json','450-sx-f-2024-1003029294.json']
for name in names:
 p=B/'captures/ktm'/name;before=p.read_bytes();d=json.loads(before);a=next(x for x in d['assemblies'] if x['id']=='4668');assert not d['raw_duplicate_rows']
 page=session.get(a['source_url'],timeout=40);page.raise_for_status();m=re.search(r'"read":\{"url":"([^"]+)"',page.text);assert m
 endpoint=urllib.parse.urljoin(a['source_url'],json.loads('"'+m[1]+'"'))
 response=session.post(endpoint,data={'id':'4668','partType':1,'sort':'SequenceNumber-asc'},headers={'X-Requested-With':'XMLHttpRequest'},timeout=40);response.raise_for_status();raw=response.content;(T/(name+'.response.json')).write_bytes(raw);j=response.json()
 seen=set();duplicates=[];normalized=[]
 for row in j['Data']:
  key=(str(row['SequenceNumber']),row['ArticleNumber'])
  if key in seen:duplicates.append({'assembly_id':'4668','row':row});continue
  seen.add(key);normalized.append((key[0],key[1],row['ArticleDescription'],row['ArticleAdditionalText'],row['Quantity']))
 old=[(x['callout'],x['part_number'],x['description'],x['additional_text'],x['catalog_quantity']) for x in d['parts'] if x['assembly_id']=='4668']
 assert normalized==old and len(normalized)==380 and len(j['Data'])==j['Total']==a['expected_occurrences']==381
 assert len(duplicates)==1 and duplicates[0]['row']['ArticleNumber']=='S64080000100000' and duplicates[0]['row']['SequenceNumber']==8 and duplicates[0]['row']['Quantity']==0
 d['raw_duplicate_rows']=duplicates;p.write_text(json.dumps(d,indent=2)+'\n')
 audit.append({'path':str(p.relative_to(B)),'before_sha256':sha(before),'after_sha256':sha(p.read_bytes()),'assembly_id':'4668','source_url':a['source_url'],'response_endpoint':endpoint,'original_response_sha256':a['source_response_sha256'],'verification_response_sha256':sha(raw),'response_bytes_identical':sha(raw)==a['source_response_sha256'],'raw_rows':381,'unchanged_normalized_rows':380,'restored_duplicate_rows':duplicates})
 print(name,'verified381=380+1',flush=True)
(B/'duplicate-ledger-repair.json').write_text(json.dumps({'verified_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reason':'Cached-resume branch carried normalized parts but omitted raw_duplicate_rows. Four existing assembly responses rechecked; no part, quantity or applicability changes.','artifacts':audit},indent=2)+'\n')
