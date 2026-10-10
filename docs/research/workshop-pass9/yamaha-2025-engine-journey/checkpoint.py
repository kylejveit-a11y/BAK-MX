import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
mf=HERE/'source-review-manifest.json'
if mf.exists() and json.loads(mf.read_text(encoding='utf8')).get('status')=='APPROVED':raise SystemExit('Frozen approved manifest; create a new revision.')
files=sorted(HERE.glob('*.procedure.json'));docs=[json.loads(p.read_text(encoding='utf8')) for p in files]
sources=[{'id':'yamaha-2025-d02','url':docs[0]['source']['source_url'],'local_pdf_path':'C:/Users/kylej/AppData/Local/Temp/D02-2819U-10_02.pdf','sha256':docs[0]['source']['document_sha256']}]
for d in docs:
 for s in d['supplemental_sources']:
  if not any(x['url']==s['url'] for x in sources):sources.append({'id':s.get('id',f'supplemental-{len(sources)}'),'url':s['url'],'local_pdf_path':s['local_path'],'sha256':s['sha256']})
m={'schema_version':1,'id':'yamaha-2025-engine-journey-pass9','status':'PENDING_ROOT_COMPOSITION_REVIEW','database_writes':False,'sources':sources,'artifacts':[{'path':p.name,'kind':'procedure','sha256':sha(p),'source_id':'yamaha-2025-d02','target':d['target'],'step_count':len(d['steps'])} for p,d in zip(files,docs)]}
mf.write_text(json.dumps(m,indent=2)+'\n',encoding='utf8',newline='\n')
print('Saved manifest',len(files),'candidate(s)')
