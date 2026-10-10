"""One-time reviewed corrections and freeze. Refuses to alter an approved artifact."""
import hashlib, json
from pathlib import Path
B = Path(__file__).parent
P = B/'top-end-bench-v1.procedure.json'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d): p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
d=json.loads(P.read_text(encoding='utf-8'))
assert d['publication_status'] != 'APPROVED', 'Frozen; do not rerun'
builder=B/'build_topend.py'
txt=builder.read_text(encoding='utf-8')
old='5.5 mm remover/installer 90890-04016 / YM-01122'
new='5.5 mm remover/installer set 90890-04016 (YM-01122 is the remover only; an appropriate installer is also required)'
for tool in d['required_tools']: tool['name']=tool['name'].replace(old,new)
txt=txt.replace(old,new)
prefix={
 'cylinder-in':'Account for and remove the crankcase protective cloth before lowering the cylinder, keeping the timing chain supported. ',
 'first-cams':'Account for and remove all protective cloths from the head and timing-chain space before installing the cams. ',
 'adjust-pads-in':'After securing every pad and lifter, account for and remove the protective cloth from the timing-chain space before the next cam-installation step. ',
}
for s in d['steps']:
 old=s['instruction']
 if s['id'] in prefix:
  s['instruction']=(old+' '+prefix[s['id']].strip()) if s['id']=='adjust-pads-in' else prefix[s['id']]+old
 if s['id']=='sealing-final': s['instruction']+=' After acceptance, drain the test solvent and dry the ports before engine assembly.'
 if old!=s['instruction']: txt=txt.replace(old,s['instruction'])
builder.write_text(txt,encoding='utf-8')
d['publication_status']=d['source']['review_status']='APPROVED'
save(P,d)
review={
 'status':'APPROVED','reviewer':'independent agent year_groups_research',
 'artifact':P.name,'artifact_sha256':sha(P),'source_sha256':d['source']['document_sha256'],
 'text_pages_reviewed':[7,50,89,90,91,92,93,95,210,211,212,213,214,215,216,218,219,220,221,224,225,226,227,228,229,230,231,232,233,234],
 'rendered_pages_reviewed':[92,93,211,215,219,220,225,227,228,230,234],
 'checks':['Exact 2025 dimensions and measured part-pair acceptance; no 2026 numerical inheritance.','Distinct head removal and installation diagrams; 36 Nm then individual 18 Nm plus 90 degrees followed by final 60 degrees, small bolts 12 Nm with source unspecified Loctite.','Valve guides, titanium sacrificial-lapping versus distinct new running valves, actual outsourced seat refacing and final sealing.','Ring orientation, spring orientation, renewed seals, cam-cap sequence, tensioner release, repeated cold timing and clearance acceptance.','Retained-valve and no-adjustment forward branches preserve required measurements; bench scope excludes engine installation and commissioning.'],
 'resolved_findings':['Clarified YM-01122 is remover only, not remover/installer set.','Added explicit protective-cloth accounting/removal at cylinder and cam closure, including the adjustment loop.','Added final port-test solvent drainage/drying before head assembly.'],
 'remaining_scope':['Illustrated bench companion for a sound retained head/caps/lifters and lower engine.','Seat refacing is an actual specialist dependency; cutter angles and machining allowance are not supplied.','Engine removal/refit and running commissioning remain separate; no physical repair or whole-bike completion asserted.'],
 'open_blocking_findings':[]
}
rp=B/'independent-review-v1.json';save(rp,review)
mp=B/'source-review-manifest.json';m=json.loads(mp.read_text(encoding='utf-8'))
m['status']='APPROVED'
for a in m['artifacts']: a['sha256']=sha(P);a['review_status']='APPROVED'
m['independent_review']={'path':str(rp.relative_to(B.parents[3])).replace('\\','/'),'sha256':sha(rp),'status':'APPROVED'}
save(mp,m)
print('APPROVED '+sha(P))
