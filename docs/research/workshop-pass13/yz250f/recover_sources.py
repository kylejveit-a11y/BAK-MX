"""Recover previously captured public OEM bytes; no facts are re-extracted."""
import json,hashlib,urllib.request,concurrent.futures
from pathlib import Path
import fitz
B=Path(__file__).resolve().parent; R=B.parents[3]; T=Path('C:/Users/kylej/AppData/Local/Temp')
rows=[x for x in json.loads((R/'docs/research/expansion/yamaha/source-map.json').read_text()) if x['target']['model']=='YZ250F']
def get(x):
 p=T/x['source_url'].split('/')[-1]
 if not p.exists():
  with urllib.request.urlopen(x['source_url'],timeout=120) as f:p.write_bytes(f.read())
 assert hashlib.sha256(p.read_bytes()).hexdigest()==x['document_sha256'],str(p)
 y=x['target']['model_year'];book=fitz.open(p); hits=[]
 for n,page in enumerate(book,1):
  s=page.get_text()
  if any(k in s for k in ['ADJUSTING THE FRONT FORK','ADJUSTING THE REAR SHOCK','RACING SAG','Racing sag','ADJUSTING THE REAR SUSPENSION']):hits.append(n)
 return dict(x,local_pdf_path=str(p),page_count=len(book),setup_search_pages=hits)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:out=list(ex.map(get,rows))
(B/'recovered-source-index.json').write_text(json.dumps(out,indent=2)+'\n')
print([(x['target']['model_year'],x['page_count'],x['setup_search_pages']) for x in out])
