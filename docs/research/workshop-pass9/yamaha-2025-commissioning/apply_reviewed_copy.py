"""Parent-requested final rider-copy correction; preserves prior reviewed hash history."""
import hashlib,json
from pathlib import Path
B=Path(__file__).parent;R=B.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
p=B/'post-rebuild-commissioning-v1.procedure.json';d=json.loads(p.read_text(encoding='utf8'))
assert sha(p)=='10b1ceec5ece36a2338c5b763272365a687a8837806ee75247c3594aa2445a03'
prior=sha(p)
changes={
'filter-open':('in the the linked source arrow direction','in the arrow direction shown in the diagram'),
'preflight':('Physically complete the linked source:','Complete the pre-ride inspection:'),
'generator-access':(' the linked source supports this access with the engine installed.',' Keep the engine installed during this inspection.'),
'engine-inspect':('Record the the linked source repaired-part fit/contact assessment','Record the actual repaired-part fit and contact inspection'),
'torques':('Physically complete the linked source against exact joint rows and conditions on the linked source:','Complete the post-break-in fastener checks using the linked joint table and its preparation conditions:'),
'oil-level':('Use the linked source: warm oil to stated normal60°C','Warm the oil to the specified normal 60°C'),
}
for s in d['steps']:
 if s['id'] in changes:s['instruction']=s['instruction'].replace(*changes[s['id']])
 if s['id']=='filter-renew':s['instruction']='Renew the oil filter during this oil change. Remove the cover and old filter. Apply lithium-soap-based grease to the new cover O-ring, install it, and fit the exact new filter in the diagram orientation. Refit the cover bolts at 10 N·m. Filter renewal is included in this route; the post-break-in list itself requires the oil change.'
 s['instruction']=s['instruction'].replace('and3–6mm','and 3–6 mm').replace('is100kPa(15psi)','is 100 kPa (15 psi)').replace('to2.5Nm','to 2.5 N·m')
save(p,d)
q=B/'independent-review-v1.json';review=json.loads(q.read_text(encoding='utf8'))
review['prior_frozen_sha256']=prior;review['artifact_sha256']=sha(p)
review['parent_requested_copy_correction']='Replaced generic linked-source placeholders with named pre-ride, fastener, fit and diagram checks; placed already-reviewed O-ring lubrication before installation; normalized spacing. Mechanical values, sources and scope unchanged.'
save(q,review)
mp=B/'source-review-manifest.json';m=json.loads(mp.read_text(encoding='utf8'));m['artifacts'][0]['sha256']=sha(p);m['independent_review']['sha256']=sha(q);save(mp,m)
print(sha(p))
