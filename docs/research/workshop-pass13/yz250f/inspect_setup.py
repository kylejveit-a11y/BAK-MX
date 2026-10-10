import json,fitz,sys,hashlib
from pathlib import Path
sys.stdout.reconfigure(encoding='utf8')
B=Path(__file__).resolve().parent;T=Path('C:/Users/kylej/AppData/Local/Temp')
rows=json.loads((B/'recovered-source-index.json').read_text())
for year,code in [(2021,'B7B-2819U-12'),(2020,'B7B-28199-11')]:
 p=T/(code+'_02.pdf')
 if p.exists():rows.append({'target':{'manufacturer':'Yamaha','model':'YZ250F','model_year':year,'region':'US','variant':'standard'},'local_pdf_path':str(p),'source_url':'https://library.ymcapps.net/library/om/contents/pdf/10/'+p.name,'document_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'document_revision':code})
for row in sorted(rows,key=lambda x:x['target']['model_year']):
 y=row['target']['model_year'];b=fitz.open(row['local_pdf_path']);ps=[]
 for i,p in enumerate(b):
  s=p.get_text().replace('\u0001',' ').replace('\ue001',' ')
  if ('ADJUSTING THE FRONT FORK' in s and i>90) or ('CHOOSING SET LENGTH' in s and i>200):ps.append(i+1)
 if not ps:print('unindexed',y);continue
 f=ps[0];s=ps[-1];pages=list(range(f,f+5))+[s,s+1]
 row.update(page_count=len(b),setup_pages=pages)
 (T/f'yz250f-{y}-setup-review.txt').write_text('\n'.join(f'PDF {n}\n'+b[n-1].get_text() for n in pages),encoding='utf8')
 print(y,'pages',pages,'cover',b[0].get_text().replace('\n',' '))
(B/'source-index.json').write_text(json.dumps(rows,indent=2)+'\n',encoding='utf8')
