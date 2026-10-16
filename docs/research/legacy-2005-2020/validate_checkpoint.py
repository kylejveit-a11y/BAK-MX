import json,pathlib,re
root=pathlib.Path(__file__).parent
manifest=json.loads((root/'source-manifest.json').read_text()); ids=set(); totals={}; bymodel={}
for entry in manifest:
 d=json.loads((root/entry['file']).read_text()); assert d['target']==entry['target']; assert d['target']['model_year']==2005
 assert len(d['facts'])==entry['facts']
 for f in d['facts']:
  assert f['id'] not in ids; ids.add(f['id'])
  assert f['review_status']=='PENDING' and f['approval_reference'] is None
  assert f['source_url']==entry['source_url'] and f['document_sha256']==entry['document_sha256']
  assert re.fullmatch('[0-9a-f]{64}',f['document_sha256']) and f['conditions']
  assert re.fullmatch(r'PDF page \d+; printed page \d+',f['locator'])
  assert f['value'] and f['joint'] and f['retrieved_at']
 totals[d['target']['model']]=len(d['facts']); bymodel[d['target']['model']]={f['joint']:f for f in d['facts']}
assert bymodel['CR85R']['Suspension / Rear compression damping STD']['value']=='1.75'
assert bymodel['CR85RB']['Suspension / Rear compression damping STD']['value']=='0.75'
assert bymodel['CRF450R']['Suspension / Rear rebound damping STD']['value']=='7–10'
assert 'Engine / Transmission oil capacity / After draining' not in bymodel['CRF250R']
assert all(not d['database_imported'] for d in manifest)
print(json.dumps({'result':'PASS','candidate_facts':len(ids),'per_model':totals,'database_imported':False},indent=2))
