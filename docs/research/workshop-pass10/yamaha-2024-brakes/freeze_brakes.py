"""Freeze four brake guides following explicit independent root approval."""
import hashlib,json
from pathlib import Path
B=Path(__file__).parent;R=B.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
mp=B/'source-review-manifest.json';m=json.loads(mp.read_text(encoding='utf8'));assert m['status']=='PENDING_INDEPENDENT_REVIEW'
rows=[]
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=json.loads(p.read_text(encoding='utf8'));prior=sha(p)
 assert d['publication_status']=='PENDING_INDEPENDENT_REVIEW'
 d['publication_status']=d['source']['review_status']='APPROVED';d['source']['review_note']='Independent root review approved exact2024 fluid, seals, retention, access, bleed and closure. Hose diagram reference corrected; sound front-master washer/boot reuse retained after enlarged NEW-callout review.'
 save(p,d);a['sha256']=sha(p);a['review_status']='APPROVED';rows.append({'path':a['path'],'approved_candidate_sha256':prior,'sha256':sha(p)})
review={'status':'APPROVED','reviewer':'root independent source review','artifacts':rows,'text_pages':[102,103,104,105,127,129,130,131,138,139,140,141,142,150,151,152,153],'rendered_pages':[132,133,134,135,139,141,143,144,146,147,152,153,160,161],'resolved_findings':['Stale front-master hose prose as148/149 replaced by linked exact141/142 routing diagrams.','Reviewer initially requested new washer2/boot4; enlarged PDF141 confirms NEW only piston1/circlip3. Request withdrawn; sound washer/boot retention remains supported. Rear-master distinct renewal requirements unchanged.'],'scope':'Four exact stock hydraulic repairs54steps with access/refit/bleed/operation checks. No common-part-number or cross-year inheritance asserted.','open_blocking_findings':[]}
q=B/'independent-review-v1.json';save(q,review);m['status']='APPROVED';m['independent_review']={'path':str(q.relative_to(R)).replace('\\','/'),'sha256':sha(q),'status':'APPROVED'};save(mp,m)
print('APPROVED four brake guides')
