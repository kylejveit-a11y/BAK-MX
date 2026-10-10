"""Independent read-only comparison helper; never approves another author's work."""
import json,hashlib,fitz,re
from pathlib import Path
B=Path(__file__).resolve().parent;S=B.parent/'yamaha-two-stroke';R=B.parents[3];T=Path('C:/Users/kylej/AppData/Local/Temp/twostroke-independent13');T.mkdir(exist_ok=True)
read=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=read(S/'source-review-manifest.json');sources={s['source_id']:s for s in m['sources']};rows=read(S/'setup-parameters.json');out=[];keys={}
for row in rows:
 s=sources[row['source_id']];p=Path(s['local_path']);assert sha(p)==s['sha256'];b=fitz.open(p);out.append(str(row['target'])+' COVER '+b[0].get_text().replace('\n',' '))
 for n in sorted({v['pdf_page'] for v in row['parameters'].values()}):
  text=b[n-1].get_text();h=hashlib.sha256(text.encode()).hexdigest()
  out.append('PDF '+str(n)+' '+str({k:v['value'] for k,v in row['parameters'].items() if v['pdf_page']==n}))
  if h not in keys:
   keys[h]=(row['source_id'],n);out.append('\n'.join(re.findall(r'Standard[\s\S]{0,330}',text)))
  else:out.append('Identical entire source-page extracted text to '+str(keys[h]))
 for a in m['artifacts']:
  if a['target']==row['target']:assert sha(R/a['path'])==a['sha256']
(T/'raw-standard-review.txt').write_text('\n'.join(out),encoding='utf8')
print(len(rows),'exact targets;',len(keys),'distinct source text pages;',T)
