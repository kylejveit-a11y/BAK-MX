"""Resume exact observed Kawasaki indexes using ordinary persistent public HTTP sessions."""
import concurrent.futures, hashlib, html, json, re, sys, threading, time
from pathlib import Path
sys.path.insert(0, 'C:/Users/kylej/AppData/Local/Temp/parts-pass14-python')
import requests
from motosport_inventory import Tree
BASE=Path('docs/research/parts-pass14/kawasaki')
local=threading.local()
jobs=[]
for p in sorted(BASE.glob('*-index.json')):
 d=json.loads(p.read_text(encoding='utf-8'))
 if not d['target']['model'].startswith('KX'):continue
 seen=set()
 for link in d['links']:
  if link['url'] in seen:continue
  seen.add(link['url']);jobs.append({'target':d['target'],'model_code':d['model_code'],'index_url':d['url'],'assembly_url':link['url'],'name':link['name']})
if '--finish-started' in sys.argv:
 started=set()
 for p in BASE.glob('*.json'):
  if p.name.endswith('-index.json') or p.name in ('model-options.json','capture-state.json'):continue
  d=json.loads(p.read_text(encoding='utf-8'))
  if d.get('rows') is not None:started.add((d['target']['model_year'],d['target']['model']))
 jobs=[j for j in jobs if (j['target']['model_year'],j['target']['model']) in started]
def capture(job):
 aid=re.search(r'/parts/(\d+)/',job['assembly_url'])[1]
 p=BASE/f"{job['target']['model_year']}-{job['target']['model']}-{aid}.json"
 if p.exists():
  d=json.loads(p.read_text(encoding='utf-8'))
  if d.get('rows') is not None and d.get('headers') and d.get('target')==job['target']:return {'cached':True,'rows':len(d['rows'])}
 if not hasattr(local,'session'):local.session=requests.Session()
 response=local.session.get(job['assembly_url'],timeout=40);response.raise_for_status()
 text=response.text
 match=re.search(r'<table\b[^>]*class="[^"]*partItemTable[^\"]*sm-display-none[^\"]*"[^>]*>.*?</table>',text,re.S)
 if not match:raise ValueError('Missing exact public OEM part table: '+job['assembly_url'])
 table=Tree(match[0]).root.find('table')[0]
 rows=[[c.text() for c in row.children if not isinstance(c,str) and c.tag in ('th','td')] for row in table.find('tr')]
 headers=rows.pop(0)
 if headers!=['ITEM NAME','REF #','PART NUMBER','QUANTITY','DESTINATION','REMARKS'] or any(len(r)!=6 for r in rows):raise ValueError('Changed table schema')
 headings=[Tree(x).root.text() for x in re.findall(r'<h3\b[^>]*>.*?</h3>',text,re.S)]
 expected=f"{job['target']['model_year']}{job['target']['model']}"
 if not any(re.sub(r'[^A-Za-z0-9]','',h.split(' - ')[0])==expected for h in headings):raise ValueError('Exact heading mismatch')
 images=[html.unescape(x) for x in re.findall(r'<img\b[^>]*src="([^"]*?/Images/Parts/[^\"]+)"',text,re.I)]
 data={**job,'url':response.url,'headings':headings,'headers':headers,'rows':rows,'diagram_urls':images,'captured_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'authority':'OEM','quantity_basis':'EXPLICIT_OEM_TABLE','source_response_sha256':hashlib.sha256(response.content).hexdigest(),'acquisition':'Ordinary requests.Session GET with server-issued public cookies; TLS verification enabled'}
 temp=p.with_suffix('.tmp');temp.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8');temp.replace(p)
 return {'cached':False,'rows':len(rows)}
state={'total':len(jobs),'processed':0,'rows':0,'cached':0,'errors':[]}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 futures={pool.submit(capture,j):j for j in jobs}
 for f in concurrent.futures.as_completed(futures):
  try:
   r=f.result();state['rows']+=r['rows'];state['cached']+=int(r['cached'])
  except Exception as e:state['errors'].append({'url':futures[f]['assembly_url'],'error':str(e)})
  state['processed']+=1
  if state['processed']%20==0 or state['processed']==state['total']:
   (BASE/'capture-state.json').write_text(json.dumps(state,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:v for k,v in state.items() if k!='errors'}),flush=True)
