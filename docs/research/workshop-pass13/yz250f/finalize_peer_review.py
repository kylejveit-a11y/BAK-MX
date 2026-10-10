"""Record this reviewer's completed independent setup review; refuse overwrite."""
import json,hashlib
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3];S=B.parent/'yamaha-two-stroke'
rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=rd(S/'source-review-manifest.json');rows=rd(S/'setup-parameters.json');artifacts=[]
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=rd(p);row=next(r for r in rows if r['target']==d['target'])
 assert len(d['steps'])==8 and d['completeness'];steps={s['id']:s for s in d['steps']}
 for k,v in row['parameters'].items():
  st=steps[k.replace('_','-')];assert v['pdf_page'] in st['source_pdf_pages']
  if d['target']['model_year']>2020 and k in ['fork_rebound','fork_compression','shock_high_speed']:assert v['pdf_page']+1 in st['source_pdf_pages']
  assert set(st['source_pdf_pages'])<=set(steps['record']['source_pdf_pages'])
 artifacts.append({'path':a['path'],'artifact_sha256':a['sha256'],'target':a['target'],'status':'APPROVED'})
out=B/'two-stroke-independent-review-v1.json';assert not out.exists()
review={'status':'APPROVED','reviewer':'yamaha_workshop_evidence, independent of core_flow_repairs','scope':'32 exact US2020–2027 YZ125/YZ125X/YZ250/YZ250X assembled stock damping baseline guides; not sag or rebuild coverage.','artifacts':artifacts,'source_manifest_sha256_at_review':sha(S/'source-review-manifest.json'),'source_checks':'All29 PDF byte hashes and covers checked; all32 target parameter rows compared to exact extracted Standard blocks. Shared entire-page text hashes recorded only after exact source capture; no automatic year approval. Eight-step authored sequence read in full and per-target parameter/link substitutions checked.','visual_checks':{'B0V-28199-11_02':[81,83,84],'B9U-28199-11_02':[81,83,84],'BF1-2819U-10_02':[85,86,88,89],'D68-2819U-12_02':[86,88,89],'DF3-2819U-12_02':[86,88,89],'D69-2819U-12_02':[88,90,91],'DF4-2819U-12_02':[88,90,91]},'resolved_findings':['Added split-page control diagram links to setting and record steps; table values unchanged.','Preserved2020 factory punch-mark alignment and tolerance rather than an invented midpoint.','Mixed fractions displayed with spaces.'],'open_blocking_findings':[],'physical_validation':False,'review_limit':'Independent visual sampling spans original combined manuals,2021 split layout and2027 four-model diagrams; all intervening exact-year numeric blocks were read as text. Author separately rendered controls across29 exact sources.'}
out.write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(out,sha(out))
