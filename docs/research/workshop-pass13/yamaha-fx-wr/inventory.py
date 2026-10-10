"""Recover exact source identities and setup page locators, not service equivalence."""
import json,re,hashlib
from pathlib import Path
import fitz
B=Path(__file__).resolve().parent;T=Path('C:/Users/kylej/AppData/Local/Temp/bakmx-pass13')
records=[]
for file in ['fx-discovery.json','fx-older-discovery.json','remaining-discovery.json','latest-fx-discovery.json']:
 for m in json.loads((T/file).read_text()):
  if 'sha256' not in m or '-51' in m['code']:continue
  model=next((x for x in ['YZ250FX','YZ450FX','WR250F','WR450F'] if x+'\n' in m['cover']),None)
  if not model:continue
  p=T/(m['code']+'.pdf');assert hashlib.sha256(p.read_bytes()).hexdigest()==m['sha256'];d=fitz.open(p);texts=[x.get_text() for x in d]
  cp=next(i+1 for i,t in enumerate(texts[:8]) if 'U.S.A.' in t and ('First edition' in t or '1st Edition' in t))
  f=next(i+1 for i,t in enumerate(texts[:160]) if 'Rebound damping\nMinimum (soft)\n20 click' in t)
  sag=next(i+1 for i,t in enumerate(texts) if 'CHOOSING SET LENGTH' in t and ('Place a stand' in t or 'Place the vehicle' in t))
  rec=dict(**m,model=model,year=int(re.search(r'20\d\d',m['cover'])[0]),local_path=str(p),copyright_page=cp,us_copyright_confirmed=True,fork_page=f,sag_page=sag,review_status='IDENTITY_AND_LOCATORS_ONLY')
  rec['setup_evidence']=[]
  rec['preload_access_review_text']='\n'.join(texts[f:f+2])
  for n in range(f,f+4):
   t=texts[n-1];blocks=re.findall(r'(?:Rebound damping|Compression damping|Fast compression damping|Slow compression damping|Spring preload adjusting positions)\n(?:Minimum|[\s\S]*?Minimum)[\s\S]*?(?:\*With|TIP)',t)
   rec['setup_evidence'].append(dict(pdf_page=n,blocks=blocks))
  records.append(rec)
(B/'all-manual-inventory.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for r in records:print(r['year'],r['model'],r['code'],'copyright',r['copyright_page'],'fork',r['fork_page'],'sag',r['sag_page'])
