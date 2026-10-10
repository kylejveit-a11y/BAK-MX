"""Normalize an approved author manifest for the runtime generator, without changing sources."""
import hashlib,json
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
p=B/'source-review-manifest.json';m=json.loads(p.read_text(encoding='utf8'))
assert m['status']=='APPROVED'
out={'schema_version':1,'status':'APPROVED','author_review_manifest':{'path':p.relative_to(R).as_posix(),'sha256':sha(p)},'sources':[{'id':x['source_id'],'url':x['url'],'sha256':x['sha256'],'local_pdf_path':x['local_path']} for x in m['sources']],'artifacts':[]}
for a in m['artifacts']:
 q=R/a['path'];assert sha(q)==a['sha256'];d=json.loads(q.read_text(encoding='utf8'))
 out['artifacts'].append({'path':q.name,'kind':'procedure','source_id':a['source_id'],'target':a['target'],'sha256':a['sha256'],'step_count':len(d['steps'])})
(B/'runtime-source-review-manifest.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Runtime manifest bound to approved author review')
