import json,hashlib,sys
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3]
d=json.loads((B/'yamaha-model-year-matrix.json').read_text(encoding='utf8'))
assert len(d['families'])==10 and len(d['rows'])==80
keys=[(x['model'],x['model_year']) for x in d['rows']];assert len(keys)==len(set(keys))
for x in d['rows']:
 assert x['region']=='US' and x['variant']=='standard' and x['full_rebuild_qualified'] is False
 assert x['gaps'] and x['service_equivalence']=='NOT_ESTABLISHED_BY_THIS_ROSTER'
 assert bool(x['identity_evidence'])==x['identity_status'].startswith('CONFIRMED')
 for a in x['source_approved_artifacts']:
  assert hashlib.sha256((R/a['path']).read_bytes()).hexdigest()==a['sha256']
for x in d['prior_reference_bindings']:assert hashlib.sha256((R/x['path']).read_bytes()).hexdigest()==x['sha256']
assert sum(x['identity_status'].startswith('CONFIRMED') for x in d['rows'])==d['summary']['confirmed']
assert sum(x['identity_status'].startswith('UNKNOWN') for x in d['rows'])==d['summary']['unknown']
print('PASS:',d['summary'],'exact scope and existing artifact/reference hashes; no full-rebuild claims')

if '--runtime' in sys.argv:
 snapshot=d['runtime_snapshot'];sp=R/snapshot['path'];assert hashlib.sha256(sp.read_bytes()).hexdigest()==snapshot['sha256']
 text=sp.read_text(encoding='utf8');lib=json.loads(text[text.index('['):text.rindex(']')+1]);assert len(lib)==snapshot['guide_count']
 byid={p['id']:p for p in lib}
 for row in d['rows']:
  expected={p['id'] for p in lib if p.get('target',{}).get('model')==row['model'] and p.get('target',{}).get('model_year')==row['model_year']}
  assert set(row['runtime_integration']['procedure_ids'])==expected
  assert {a['procedure_id'] for a in row['runtime_source_bindings']}==expected
  for a in row['runtime_source_bindings']:
   live=byid[a['procedure_id']];assert a['content_sha256']==live['content_sha256'] and a['document_sha256']==live['source']['document_sha256'] and a['source_url']==live['source']['source_url']
 print('PASS runtime snapshot:',len(lib),'guides, all planned exact-target source/content bindings match')
