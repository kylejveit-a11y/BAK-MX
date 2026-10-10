import json,re,fitz
from pathlib import Path
B=Path(__file__).resolve().parent
out=[]
for r in json.loads((B/'all-manual-inventory.json').read_text(encoding='utf8')):
 d=fitz.open(r['local_path']);a=r['fork_page'];g=r['sag_page'];ts=[d[n-1].get_text() for n in range(a,a+5)];text='\n'.join(ts)
 blocks=re.findall(r'(Rebound damping|Compression damping|Fast compression damping|Slow compression damping)\s+Minimum \(soft\)\s+([^*]+?)\*\s+Standard\s+([^\n]+)',text)
 preload=re.search(r'Spring preload adjusting positions[\s\S]*?Standard\s+Position in which the spring is\s+turned in ([\d.]+)',text)
 rec={k:r[k] for k in ['code','model','year','sha256','url','copyright_page','fork_page','sag_page']}
 rec.update(settings=[dict(control=x[0],minimum=x[1].strip(),standard=x[2]) for x in blocks],preload=preload[1] if preload else None,rear_frame_access='Rear frame' in text,locknut_numeric=bool(re.search(r'Locknut\s+10 N',text)),sag_reference='bolt' if 'holding bolt' in d[g-1].get_text()+d[g].get_text() else 'triangle')
 out.append(rec);print(rec['year'],rec['model'],rec['code'],'pages',a,g,'settings',[(x['control'],x['standard']) for x in rec['settings']],'preload',rec['preload'],'frame',rec['rear_frame_access'],'lock10',rec['locknut_numeric'],'datum',rec['sag_reference'])
(B/'parameter-review-candidates.json').write_text(json.dumps(out,indent=2)+'\n')
