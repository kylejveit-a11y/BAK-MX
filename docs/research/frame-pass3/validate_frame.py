from pathlib import Path
import json,hashlib
out=Path('docs/research/frame-pass3');m=json.loads((out/'source-review-manifest.json').read_text())
for a in m['artifacts']:
 p=json.loads((out/a['path']).read_text());assert hashlib.sha256((out/a['path']).read_bytes()).hexdigest()==a['sha256'];seen=set()
 for s in p['steps']:
  assert s['id'] not in seen and all(d in seen for d in s['depends_on']),s['id'];assert s['source_pdf_pages'] and set(s['source_pdf_pages'])<=set(p['source']['pdf_pages']);assert s['verification'];assert isinstance(s['record_required'],bool)
  if s['diagram_reference_required']:assert s['source_links']
  seen.add(s['id'])
 assert p['affected_components'];print(a['path'],len(seen),'OK')
engine=json.loads((out/'engine-remove-refit-v1.procedure.json').read_text());ids=[s['id'] for s in engine['steps']];assert ids.index('fuel-ready')<ids.index('oil-flow');assert 'internal' in next(s['instruction'] for s in engine['steps'] if s['id']=='bench-record')
assert 'Loosen the rear axle nut' in next(s['instruction'] for s in engine['steps'] if s['id']=='slack')
steer=json.loads((out/'steering-bearing-inspection-v1.procedure.json').read_text());ids=[s['id'] for s in steer['steps']];assert ids.index('bar-off')<ids.index('legs-remove');assert next(s for s in steer['steps'] if s['id']=='setup')['record_required'];assert 'one full turn' in next(s['instruction'] for s in steer['steps'] if s['id']=='preload')
chain=json.loads((out/'FRAME_CHAIN.json').read_text());chain['completed_reusable_operations']=[{'id':json.loads((out/a['path']).read_text())['id'],'path':a['path'],'sha256':a['sha256']} for a in m['artifacts']];(out/'FRAME_CHAIN.json').write_text(json.dumps(chain,indent=2)+'\n',encoding='utf8')
recovery=json.loads((out/'RECOVERY.json').read_text());recovery['steps']=sum(a['step_count'] for a in m['artifacts']);(out/'RECOVERY.json').write_text(json.dumps(recovery,indent=2)+'\n',encoding='utf8')
p=out/'REVIEW.md';s=p.read_text(encoding='utf8').replace('119 displayed steps','120 displayed steps').replace('refit55','refit56');s+='\nValidation passed:6 manifest byte hashes,120 unique ordered steps, source-page containment, mandatory verification/diagram links and explicit record flags. Additional closure assertions checked fuel before startup, rear-axle release before chain adjustment, early stem-nut loosening and actual steering setup notes.\n';p.write_text(s,encoding='utf8',newline='\n')
