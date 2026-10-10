import hashlib,json
from pathlib import Path
R=Path(__file__).parent;REPO=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=read(R/'source-review-manifest.json');a=m['artifacts'][0];p=R/a['path'];d=read(p)
assert sha(p)==a['sha256']
assert d['target']==a['target'] and d['source']['document_sha256']==m['sources'][0]['sha256']
assert d['entry_state'] and d['exit_state'] and d['source']['printed_pages']
deps={x['artifact']:x for x in d['operation_dependencies']}
for dep in deps.values():assert sha(REPO/dep['artifact'])==dep['sha256'],dep
ids=[s['id'] for s in d['steps']];assert len(ids)==len(set(ids))
adapted={x['step_id'] for x in read(R/'composition-review-v1.json')['adaptations']}
for n,s in enumerate(d['steps']):
 assert s['depends_on']==([] if n==0 else [ids[n-1]])
 assert s['verification'] and isinstance(s['verification'],list)
 assert isinstance(s['record_required'],bool)
 assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
 origin=s['source_operation'];assert origin['artifact'] in deps
 src=read(REPO/origin['artifact']);assert src['id']==origin['procedure_id']
 original=next(x for x in src['steps'] if x['id']==origin['step_id'])
 if s['id'] not in adapted:assert original['instruction']==s['instruction'],s['id']
 for br in s.get('branches',[]):assert ids.index(br['next_step'])>n
assert [i for ph in d['phases'] for i in ph['step_ids']]==ids
scope=next(s for s in d['steps'] if s['id']=='clearance-adjust--adjustment-scope')
assert len(scope['branches'])==1
destination=scope['branches'][0]['next_step']
skipped=ids[ids.index(scope['id'])+1:ids.index(destination)]
assert skipped==d['branch_completion_policy']['within-range']['skipped_step_ids']
assert len(skipped)==13 and all(i.startswith('clearance-adjust--') for i in skipped)
assert ids.index('engine-out--engine-out')<ids.index('cams-out--entry')<ids.index('head-out--loosen')
assert ids.index('piston-out--pin-remove')<ids.index('piston-in--piston-install')<ids.index('head-in--seat')
assert ids.index('cams-in--timing-verify')<ids.index('cams-in--remeasure')<ids.index(scope['id'])
assert ids.index('clearance-adjust--remeasure')<ids.index(destination)<ids.index('engine-in--engine-in')
assert ids.index('cams-in--plug-access-close')<ids.index('engine-in--bench-record')
print(f'PASS: {len(ids)} steps / {len(d["phases"])} phases; {len(deps)} immutable dependencies; both clearance paths, source text adaptations and physical cutpoint order validated')
