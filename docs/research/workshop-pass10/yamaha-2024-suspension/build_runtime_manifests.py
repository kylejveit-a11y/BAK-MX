"""Adapt frozen author manifests to generator schema without changing procedures."""
import hashlib,json
from pathlib import Path
B=Path(__file__).parent;R=B.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for folder in [B,B.parent/'yamaha-2024-brakes']:
 p=folder/'source-review-manifest.json';m=json.loads(p.read_text(encoding='utf8'));assert m['status']=='APPROVED'
 runtime={'schema_version':1,'author_review_manifest':{'path':str(p.relative_to(R)).replace('\\','/'),'sha256':sha(p)},'sources':[{'id':s['source_id'],'url':s['url'],'sha256':s['sha256'],'local_pdf_path':s['local_path']} for s in m['sources']],'artifacts':[dict(path=Path(a['path']).name,kind='procedure',source_id=a['source_id'],target=a['target'],sha256=a['sha256'],step_count=a['step_count']) for a in m['artifacts']]}
 (folder/'runtime-source-review-manifest.json').write_text(json.dumps(runtime,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 print(folder.name+' runtime manifest ready')
