"""Public OEM indexes; reuse existing byte-bound catalogs, no inferred fitment."""
import json,re,urllib.request,hashlib,pathlib,datetime
OUT=pathlib.Path(__file__).resolve().parent;ROOT=OUT.parents[3]
TEMP=pathlib.Path('C:/Users/kylej/AppData/Local/Temp/parts-pass14-europe');TEMP.mkdir(exist_ok=True)
def save(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
sha=lambda b:hashlib.sha256(b).hexdigest()
brands={'ktm':'https://sparepartsfinder.ktm.com','husqvarna':'https://sparepartsfinder.husqvarna-motorcycles.com','gasgas':'https://sparepartsfinder.gasgas.com'}
existing=[]
for b in brands:
 for p in (ROOT/'docs/research/expansion'/b).glob('*.json'):
  try:d=json.loads(p.read_text(encoding='utf8'))
  except Exception:continue
  if isinstance(d,dict) and d.get('assemblies') and d.get('parts'):
   existing.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p.read_bytes()),'target':d.get('target'),'catalog_model_identifier':d.get('catalog_model_identifier'),'catalog_complete':d.get('catalog_complete'), 'assemblies':len(d['assemblies']),'parts':len(d['parts'])})
for p in (ROOT/'docs/research/parts').glob('*.json'):
 try:d=json.loads(p.read_text(encoding='utf8'))
 except Exception:continue
 if isinstance(d,dict) and d.get('catalog_enumeration_complete') and d.get('bike',{}).get('make') in ['KTM','Husqvarna','GasGas']:
  b=d['bike'];existing.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p.read_bytes()),'target':{'manufacturer':b['make'],'model':b['model'],'model_year':b['year'],'variant':b['edition'],'region':b['target_market']},'catalog_model_identifier':b['model_identifier'],'catalog_complete':True,'assemblies':len(d['assemblies']),'parts':len(d['parts'])})
for item in existing:
 d=json.loads((ROOT/item['path']).read_text(encoding='utf8'))
 item.update(scope_confirmed=d.get('scope_confirmed',False),catalog_region=d.get('catalog_region',d.get('bike',{}).get('target_market')),catalog_label=d.get('catalog_label'),reusable_for_us=bool(item['catalog_complete'] and d.get('scope_confirmed',False)))
save(OUT/'legacy-catalog-audit.json',existing)
records=[]
for b,url in brands.items():
 try:
  raw=urllib.request.urlopen(url,timeout=45).read();(TEMP/(b+'-home.html')).write_bytes(raw);tree=json.loads(re.search(r'var treeSettings = (.*);',raw.decode())[1]);nodes=[];stack=tree['TreeElements'][:]
  while stack:
   n=stack.pop()
   if n.get('children'):stack.extend(n['children']);continue
   label=n['text'];y=re.search(r'<(20\d\d)>',label)
   if not y or not 2020<=int(y[1])<=2027 or '<US>' not in label:continue
   if not (re.match(r'(?:\d+\s+(?:SX|XC|EXC)|(?:FC|TC|FX|TX|FE|TE|MC|EC|EX)\s*\d+)',label)):continue
   nodes.append({'id':n['id'],'label':label,'year':int(y[1]),'source_url':url,'brand':b,'catalog_disabled':bool(n.get('state',{}).get('disabled')),'status':'IDENTITY_ONLY_DISABLED_CATALOG' if n.get('state',{}).get('disabled') else 'DISCOVERED_NOT_CAPTURED'})
  records.append({'brand':b,'source_url':url,'source_sha256':sha(raw),'nodes':sorted(nodes,key=lambda x:(x['year'],x['label']))});print(b,len(nodes),flush=True)
 except Exception as e:records.append({'brand':b,'source_url':url,'error':str(e)});print(b,str(e),flush=True)
 save(OUT/'official-target-discovery.json',{'retrieved_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'indexes':records})
