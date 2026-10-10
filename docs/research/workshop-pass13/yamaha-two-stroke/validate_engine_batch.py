"""Read-only older-year batch validator; pass manifest filename explicitly."""
import json,hashlib,sys
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=read(B/(sys.argv[1] if len(sys.argv)>1 else 'engine-2024-source-review-manifest.json'))
assert sha(R/m['comparison']['path'])==m['comparison']['sha256']
for s in m['sources']:assert sha(Path(s['local_path']))==s['sha256']
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=read(p);s=next(s for s in m['sources'] if s['source_id']==a['source_id'])
 assert d['target']==a['target'] and d['target']['model']=='YZ250' and d['target']['region']=='US'
 assert d['source']['source_url']==s['url'] and d['source']['document_sha256']==s['sha256']
 ids=[]
 for st in d['steps']:
  assert st['id'] not in ids and st['depends_on']==([ids[-1]] if ids else [])
  assert st['source_links']==[s['url']+'#page='+str(n) for n in st['source_pdf_pages']]
  assert set(st['source_pdf_pages'])<=set(d['source']['pdf_pages']) and st['diagram_reference_required'];ids.append(st['id'])
 assert len(ids)==a['step_count']==28
 for key in ['pushrod-off','pushrod-install']:
  st=next(st for st in d['steps'] if st['id']==key);assert st['record_required'] and 'REMOVE' in st['instruction'] and 'set pin' in st['instruction']
 assert ids.index('thrust-plate')<ids.index('shaft-stack')<ids.index('valve-lock')
 assert d['applicability']['year_inheritance']=='NONE' and 'Do not start' in d['steps'][-1]['instruction']
 if d['target']['model_year']==2020:
  steps={x['id']:x for x in d['steps']}
  assert 'stepped inner surface a' in steps['piston-measure']['instruction']
  assert 'one quarter' in steps['head-off']['instruction']
  assert '5 N' in steps['pushrod-install']['instruction'] and '5 N' in steps['housing-close']['instruction']
  assert '0.40-0.55' in steps['rings-check']['instruction'] and '17.995-18.000' in steps['pin-check']['instruction']
  assert '18.040' not in steps['pin-check']['instruction'] and '0.065' not in steps['pin-check']['instruction']
  for key in ['entry','bore-measure','piston-measure','bench-handoff']:
   assert steps[key]['record_required'] and 'qualified' in steps[key]['instruction']
  assert any('average' in x and 'maximum' in x for x in d['preflight'])
 assert all(x not in p.read_text(encoding='utf8') for x in ['\ufffd','N\u00c2\u00b7'])
 if m['status']=='APPROVED':
  assert d['publication_status']==d['source']['review_status']=='APPROVED'
  assert sha(R/m['independent_review']['path'])==m['independent_review']['sha256']
  review=read(R/m['independent_review']['path']);assert review['status']=='APPROVED_FOR_BOUNDED_RUNTIME'
  if 'original_peer_review' in review:
   op=review['original_peer_review'];assert sha(R/op['path'])==op['sha256']
   peer=read(R/op['path']);assert peer['status']=='APPROVED_FOR_BOUNDED_RUNTIME'
   frozen=next(x for x in review['artifacts'] if x['target']==a['target'])
   original=next(x for x in peer['artifacts'] if x['target']==a['target'])
   assert frozen['candidate_sha256']==original['reviewed_candidate_sha256']
  reviewed=next(x for x in review['artifacts'] if x['target']==a['target']);assert reviewed['approved_artifact_sha256']==a['sha256'] and reviewed['source_sha256']==s['sha256']
print('PASS: exact older-year source/artifact/comparison, sequential checks and bounded closure; physical validation separate')
