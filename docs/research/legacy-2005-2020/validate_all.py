"""Validate the full research set; optionally verify original PDF hashes in argv[1]."""
import pathlib,json,re,sys,hashlib,collections
root=pathlib.Path(__file__).parent;catalog=json.loads((root/'acquired-source-catalog.json').read_text());sources={(r['source_url'],r['document_sha256']):r for r in catalog};ids=set();targets=set();stats=collections.Counter();facts=0
for row in json.loads((root/'model-coverage.json').read_text()):
 d=json.loads((root/row['file']).read_text());t=d['target'];key=(t['manufacturer'],t['model'],t['model_year'],t['variant'],t['region']);assert key not in targets;targets.add(key)
 assert 2005<=t['model_year']<=2020 and t['region']=='US'
 assert len(d['facts'])==row['candidate_facts'] and not d['parts'] and not d['assemblies']
 joints=set()
 for f in d['facts']:
  assert f['id'] not in ids and f['joint'] not in joints;ids.add(f['id']);joints.add(f['joint'])
  assert f['review_status']=='PENDING' and f['approval_reference'] is None
  assert (f['source_url'],f['document_sha256']) in sources
  assert f['value'] and f['joint'] and f['conditions']
  m=re.fullmatch(r'PDF page (\d+); printed page (\d+(?:-\d+)?|unreadable in source)',f['locator']);assert m,f['locator']
  assert 0<int(m[1])<=sources[(f['source_url'],f['document_sha256'])]['pdf_pages']
 facts+=len(d['facts']);stats[t['manufacturer']]+=len(d['facts'])
assert len(list(root.rglob('*-candidates.json')))==len(targets)
p=json.loads((root/'progress.json').read_text());assert p['candidate_models']==len(targets) and p['candidate_facts']==facts and p['complete_models']==p['live_imported']==0
if len(sys.argv)>1:
 for r in catalog:
  f=pathlib.Path(sys.argv[1])/r['local_filename'];assert hashlib.sha256(f.read_bytes()).hexdigest()==r['document_sha256'],str(f)
print(json.dumps(dict(result='PASS',candidate_models=len(targets),candidate_facts=facts,by_manufacturer=stats,source_documents=len(catalog),pdf_hashes_verified=len(catalog) if len(sys.argv)>1 else 0,complete_models=0,live_imported=0),indent=2))
