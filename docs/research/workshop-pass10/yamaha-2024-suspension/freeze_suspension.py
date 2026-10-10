"""Finalize explicit independent root approval of four exact2024 suspension guides."""
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
 d['publication_status']=d['source']['review_status']='APPROVED';d['source']['review_note']='Independent root review approved exact2024 instructions, diagrams, values and bounded scope; plain page references and stage-specific lubricant materials corrected before freeze.'
 save(p,d);a['sha256']=sha(p);a['review_status']='APPROVED';rows.append({'path':a['path'],'approved_candidate_sha256':prior,'sha256':sha(p)})
review={'status':'APPROVED','reviewer':'root independent source review','artifacts':rows,'text_pages':[108,109,110,111,120,122,125,126,136,137,139,162,163,164,165,166,167,168,169,170,171,172,173,376,377],'rendered_pages':[162,163,164,166,167,168,170,171,172,173,126,139,376],'resolved_findings':['Inline seating/adjuster page references corrected to167/171.','Material list preserves fork oil during oilseal insertion and lithium-soap grease at later dustseal/inner-tube stage.'],'scope':'Four bounded suspension operations72steps; cartridge rod-seal and internal shock overhaul remain outside scope.','open_blocking_findings':[]}
q=B/'independent-review-v1.json';save(q,review);m['status']='APPROVED';m['independent_review']={'path':str(q.relative_to(R)).replace('\\','/'),'sha256':sha(q),'status':'APPROVED'};save(mp,m)
print('APPROVED four suspension guides')
