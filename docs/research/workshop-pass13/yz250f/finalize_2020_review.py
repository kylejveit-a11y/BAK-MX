"""One-time metadata freezing of independently approved2021–2023 candidates."""
import json,hashlib,subprocess,sys
from pathlib import Path
B=Path(__file__).resolve().parent;rd=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
external=B.parent/'yamaha-roster/independent-yz250f-2020-engine-review.json';r=rd(external)
assert sha(external)=='dcdb15f09815dd0f061b5c306ab76310c52e956973f4a255a6a879cec5551223' and r['status']=='APPROVED_FOR_BOUNDED_RUNTIME'
for y in [2020]:
 d=B/(str(y)+'-engine');m=rd(d/'source-review-manifest.json');assert m['status']=='PENDING_INDEPENDENT_REVIEW'
 review={'status':r['status'],'reviewer':r['reviewer'],'external_review':{'path':'../../yamaha-roster/'+external.name,'sha256':sha(external)},'artifacts':[dict(x,candidate_sha256=x['reviewed_candidate_sha256']) for x in r['artifacts'] if x['target']['model_year']==y]}
 (d/'independent-review.json').write_text(json.dumps(review,indent=2)+'\n',encoding='utf8')
 (d/'freeze_review.py').write_text((B/'2025-engine/freeze_review.py').read_text(),encoding='utf8')
 v=(B/'2025-engine/validate_review.py').read_text().replace('2025',str(y))
 v=v.replace("rt=rd(B/'runtime-source-review-manifest.json');", "ext=review['external_review'];assert sha(B/ext['path'])==ext['sha256'];rt=rd(B/'runtime-source-review-manifest.json');")
 (d/'validate_review.py').write_text(v,encoding='utf8')
 subprocess.run([sys.executable,str(d/'freeze_review.py')],check=True);subprocess.run([sys.executable,str(d/'validate_review.py'),'--approved'],check=True)
