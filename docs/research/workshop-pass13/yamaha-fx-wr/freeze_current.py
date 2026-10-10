"""Metadata-only freeze authorized by the independent review."""
import json,hashlib
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
mp=B/'current-source-review-manifest.json';m=json.loads(mp.read_text());review=B/'current-independent-review.json';assert review.exists()
assert sha(review)=='202c32f720c06ffe65b768f6730f190b60a7fdbcff8189073a0374e0468e28d6'
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=json.loads(p.read_text(encoding='utf8'))
 assert d['publication_status']=='PENDING_INDEPENDENT_REVIEW'
 d['status']='SOURCE_REVIEWED_BOUNDED_PROCEDURE';d['publication_status']=d['source']['review_status']='APPROVED';d['source']['review_note']='Exact US source author and independent mechanical review accepted this bounded setup companion. Actual work and measurements remain rider records.'
 a['reviewed_candidate_sha256']=a['sha256'];wr(p,d);a['sha256']=sha(p);a['review_status']='APPROVED'
m['status']='APPROVED';m['independent_review']={'path':review.relative_to(R).as_posix(),'sha256':sha(review),'status':'APPROVED'};wr(mp,m)
for sid in {a['source_id'] for a in m['artifacts']}:
 arts=[a for a in m['artifacts'] if a['source_id']==sid];folder=(R/arts[0]['path']).parent;s=next(s for s in m['sources'] if s['source_id']==sid)
 runtime={'schema_version':1,'status':'APPROVED','author_review_manifest':{'path':mp.relative_to(R).as_posix(),'sha256':sha(mp)},'sources':[{'id':sid,'url':s['url'],'sha256':s['sha256'],'local_pdf_path':s['local_path']}],'artifacts':[{'path':Path(a['path']).name,'kind':'procedure','source_id':sid,'sha256':a['sha256'],'target':a['target'],'step_count':a['step_count']} for a in arts]}
 wr(folder/'runtime-source-review-manifest.json',runtime)
print('Frozen12 approved companions,76 steps; independent reviewed candidate hashes preserved')
