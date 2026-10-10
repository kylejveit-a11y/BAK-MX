"""Refresh authoring manifest, never grant source approval."""
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
if (HERE/'source-review-manifest.json').exists() and json.loads((HERE/'source-review-manifest.json').read_text(encoding='utf8')).get('status')=='APPROVED':raise SystemExit('Frozen approved manifest; do not overwrite its independent review binding.')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
write=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
files=sorted(HERE.glob('*.procedure.json'))
docs=[json.loads(p.read_text(encoding='utf8')) for p in files]
sources=[{'id':'yamaha-2025-d02','url':docs[0]['source']['source_url'],'local_pdf_path':'C:/Users/kylej/AppData/Local/Temp/D02-2819U-10_02.pdf','sha256':docs[0]['source']['document_sha256']}]
for d in docs:
 for s in d['supplemental_sources']:
  if not any(x['url']==s['url'] for x in sources):sources.append({'id':s.get('id',f'supplemental-{len(sources)}'),'url':s['url'],'local_pdf_path':s['local_path'],'sha256':s['sha256']})
manifest={'schema_version':1,'id':'yamaha-2025-frame-pass9','database_writes':False,'sources':sources,'artifacts':[{'path':p.name,'kind':'procedure','sha256':sha(p),'source_id':'yamaha-2025-d02','target':d['target'],'step_count':len(d['steps']),'review_status':d['source']['review_status']} for p,d in zip(files,docs)]}
write(HERE/'source-review-manifest.json',manifest)
write(HERE/'RECOVERY.json',{'target':docs[0]['target'],'status':'PENDING_ROOT_INDEPENDENT_REVIEW' if any(d['source']['review_status']!='APPROVED' for d in docs) else 'APPROVED_READY_FOR_INTEGRATION','database_writes':False,'artifacts':manifest['artifacts'],'next':'Root independent review then freeze approved metadata/hashes. Do not infer physical validation or complete-bike qualification.'})
print('Checkpoint manifest:',len(files),'candidates',sum(len(d['steps']) for d in docs),'ordered steps')
