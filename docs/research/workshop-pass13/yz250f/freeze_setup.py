"""One-time root-authorized status freeze, not a validator."""
import json,hashlib
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def rd(p):return json.loads(p.read_text(encoding='utf8'))
def wr(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
m=rd(B/'source-review-manifest.json');assert m['status']=='PENDING_INDEPENDENT_REVIEW'
review={'status':'APPROVED','reviewer':'root independent source reviewer','scope':'21 bounded setup companions, US standard YZ250F 2020–2026','review_method':'Root read all 19 exact2026 actions and every-year raw Standard block and source locator, checked cover identities and visually reviewed critical control/sag diagrams. Author checked remaining per-year instructions: only exact numeric controls, datum, 2020 access scope and page locations differ.','source_visual_pages':{'2020':[104,106,107,352],'2021':[105,107,356],'2022':[105,107,356],'2023':[103,105,354],'2024':[112,114,378],'2025':[114,116,388],'2026':[114,116,390]},'resolved_findings':['Added assembled-bike ring/locknut access prerequisite for 2021–2026 sag; no implied access/remove-refit service.'],'artifacts':[]}
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=rd(p);assert d['publication_status']=='PENDING_INDEPENDENT_REVIEW'
 before=sha(p);d['publication_status']=d['source']['review_status']='APPROVED';d['status']='SOURCE_REVIEWED_BOUNDED_PROCEDURE';d['source']['review_note']='Root independent review approved exact-year settings and diagrams; assembled preload access prerequisite preserved. Physical validation remains outstanding.';wr(p,d)
 a['sha256']=sha(p);a['review_status']='APPROVED';review['artifacts'].append({'path':a['path'],'candidate_sha256':before,'artifact_sha256':sha(p)})
wr(B/'independent-review-v1.json',review);m['status']='APPROVED';m['independent_review']={'path':(B/'independent-review-v1.json').relative_to(R).as_posix(),'sha256':sha(B/'independent-review-v1.json')};wr(B/'source-review-manifest.json',m)
runtime={'status':'APPROVED','author_review_manifest':{'path':(B/'source-review-manifest.json').relative_to(R).as_posix(),'sha256':sha(B/'source-review-manifest.json')},'sources':[{'id':s['source_id'],'url':s['url'],'sha256':s['sha256'],'local_pdf_path':s['local_path']} for s in m['sources']],'artifacts':[{'path':Path(a['path']).relative_to(B.relative_to(R)).as_posix(),'kind':'procedure','source_id':a['source_id'],'sha256':a['sha256'],'target':a['target'],'step_count':a['step_count']} for a in m['artifacts']]};wr(B/'runtime-source-review-manifest.json',runtime)
print('Root-authorized freeze: 21 bounded setup guides')
