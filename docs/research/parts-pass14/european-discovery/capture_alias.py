"""Capture US catalogs whose official name differs from the Garage model name (2020-2022 fuel-injected two-strokes)."""
import pathlib,json,re,sys,concurrent.futures,io
sys.path.insert(0,'C:/Users/kylej/AppData/Local/Temp/parts-pass14-python')
import requests
class PersistentPublicSession:
 def __init__(self):self.session=requests.Session()
 def open(self,req,timeout=50):
  if isinstance(req,str):response=self.session.get(req,timeout=timeout)
  else:response=self.session.request(req.get_method(),req.full_url,data=req.data,headers=dict(req.header_items()),timeout=timeout)
  response.raise_for_status();return io.BytesIO(response.content)
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[3]
base=(ROOT/'docs/research/expansion/husqvarna/acquire_catalog.py').read_text()
base=base[:base.index("if __name__=='__main__':")]
base=base.replace('urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))','PersistentPublicSession()')
base=base.replace("label=n['text'];model=re.match(r'FC (250|450)',label)[0];year=int(re.search(r'202\\d',label)[0]);ident=n['id'];code=re.findall(r'<([^>]+)>',label)[-1];region=re.findall(r'<([^>]+)>',label);region=region[1] if len(region)==3 else None", "label=n['label'];model=re.split(r'\\s+20[0-9]{2}',label)[0].strip();year=n['year'];ident=n['id'];code=re.findall(r'<([^>]+)>',label)[-1];region='US'")
base=base.replace("'manufacturer':'Husqvarna'","'manufacturer':MANUFACTURER").replace("'retrieved_at':'2026-09-13'","'retrieved_at':'2026-09-21'")
base=base.replace('path=OUT/f"fc-{model.split()[1].lower()}-{year}.json"','path=OUT/(re.sub(r"[^a-z0-9]+","-",model.lower()).strip("-")+f"-{year}-{ident}.json")')
base=base.replace("'Torque and other specification acquisition pending.'","'Parts inventory only; no torque, clearance, compatibility or procedure inference.'")
base=base.replace("   endpoint=json.loads", "   img=re.search(r'background:\\s*Url\\(([^)]+)\\)',s,re.I);a['diagram_url']=urllib.parse.urljoin(BASE,img[1]) if img else a['source_url']\n   endpoint=json.loads")
base=base.replace(' def save():'," previous=json.loads(path.read_text()) if path.exists() else {}\n def save():")
base=base.replace("  try:\n   s=fetch(op,a['source_url'])", "  cached=next((x for x in previous.get('assemblies',[]) if x['id']==gid and x.get('enumeration_checked')),None)\n  if cached:\n   a.update(cached);obj['parts'].extend(x for x in previous.get('parts',[]) if x['assembly_id']==gid);obj['raw_duplicate_rows'].extend(x for x in previous.get('raw_duplicate_rows',[]) if x['assembly_id']==gid);save();continue\n  try:\n   s=fetch(op,a['source_url'])")
ALIAS={'250 XC TPI':'250 XC','300 XC TPI':'300 XC','150 XC-W TPI':'150 XC-W','250 XC-W TPI':'250 XC-W','300 XC-W TPI':'300 XC-W','TE 150i':'TE 150','TE 250i':'TE 250','TE 300i':'TE 300','TX 300i':'TX 300'}
index=json.loads((HERE/'official-target-discovery.json').read_text());legacy=json.loads((HERE/'legacy-catalog-audit.json').read_text());done={str(x['catalog_model_identifier']) for x in legacy if x['catalog_complete'] and x.get('scope_confirmed')};jobs=[]
roster=json.loads((HERE.parent/'launch-targets.json').read_text());planned={(x['manufacturer'].lower(),x['model'],x['model_year']):x for x in roster['rows'] if x.get('planned') and x['region']=='US' and x['variant']=='standard'}
for group in index['indexes']:
 for n in group.get('nodes',[]):
  if n.get('catalog_disabled'):continue
  model=re.split(r'\s+20[0-9]{2}',n['label'])[0].strip()
  target=planned.get((n['brand'],ALIAS.get(model,'__none__'),n['year']))
  if not target:continue
  n['original_60_target']=target.get('original_60_target',False)
  if re.match(r'^(50|65|85)\b',model) or re.match(r'^(TC|MC)\s*(50|65|85)\b',model):continue
  if model in ['FE 350','FE 501']:continue
  if any(x in model for x in ['FACTORY','ROCKSTAR','6DAYS','HARDENDURO','PRO','CHAMPION',' GP',' BT']):continue
  if 'EXC' in model or re.match(r'FE (350|501)s$',model):continue
  if str(n['id']) in done:continue
  jobs.append(n)
jobs.sort(key=lambda n:(not n['original_60_target'],n['year'] not in [2020,2021],n['brand'],n['year'],n['label']))
if '--pilot' in sys.argv:jobs=jobs[:1]
def run(n):
 if (HERE/'STOP').exists():return ('NOT_STARTED_STOP_CHECKPOINT',n['id'])
 out=HERE/'captures'/n['brand'];out.mkdir(parents=True,exist_ok=True)
 fname=re.sub(r'[^a-z0-9]+','-',re.split(r'\s+20[0-9]{2}',n['label'])[0].strip().lower()).strip('-')+f"-{n['year']}-{n['id']}.json"
 if (out/fname).exists() and json.loads((out/fname).read_text()).get('catalog_complete'):return ('REUSED_NEW',fname)
 scope={'__file__':str(HERE/'capture_official.py'),'PersistentPublicSession':PersistentPublicSession};exec(compile(base,'legacy-public-parser','exec'),scope);scope['OUT']=out;scope['BASE']=n['source_url'];scope['MANUFACTURER']={'ktm':'KTM','husqvarna':'Husqvarna','gasgas':'GasGas'}[n['brand']]
 return scope['acquire'](n)
print('Pending targets',len(jobs),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for result in pool.map(run,jobs):print('DONE',result,flush=True)
