"""Read-only validation of exact source, scope and referenced procedure structure."""
import hashlib,json,sys
from pathlib import Path
B=Path(__file__).parent;R=B.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for folder in ([B] if '--suspension-only' in sys.argv else [B,B.parent/'yamaha-2022-brakes']):
 m=json.loads((folder/('fork-source-review-manifest.json' if '--fork' in sys.argv else 'source-review-manifest.json')).read_text(encoding='utf8'))
 for s in m['sources']:assert sha(Path(s['local_path']))==s['sha256']
 for a in m['artifacts']:
  p=R/a['path'];assert sha(p)==a['sha256'];d=json.loads(p.read_text(encoding='utf8'))
  assert d['target']==a['target']==dict(manufacturer='Yamaha',model='YZ450F',model_year=2022,region='US',variant='standard')
  assert d['source']['document_sha256']==m['sources'][0]['sha256']
  assert 'B2W-2819U-12' in d['source']['source_url'] and d['source']['review_status']==d['publication_status']==a['review_status']
  t=d['authoring_template'];assert sha(R/t['path'])==t['sha256']==a['template_sha256']
  assert not d['operation_dependencies'], 'No cross-year operational dependency allowed'
  ids=[s['id'] for s in d['steps']];assert len(ids)==len(set(ids))
  for i,s in enumerate(d['steps']):
   assert s['depends_on']==([ids[i-1]] if i else [])
   assert s['instruction'] and s['verification']
   assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
   assert s['source_links']==[d['source']['source_url']+'#page='+str(n) for n in s['source_pdf_pages']]
   assert 'D02-' not in s['instruction'] and '2025' not in s['instruction'] and 'Â' not in s['instruction']
   for branch in s.get('branches',[]):assert ids.index(branch['next_step'])>i
  if '--approved' in sys.argv:assert d['publication_status']=='APPROVED' and m.get('independent_review')
 if m.get('independent_review'):
  q=m['independent_review'];assert sha(R/q['path'])==q['sha256']
  review=json.loads((R/q['path']).read_text(encoding='utf8'))
  assert review['status']=='APPROVED'
  for a in review['artifacts']:assert sha(R/a['path'])==a['sha256']
 print(folder.name+': PASS source/scope/template/artifact hashes, sequence, links and branches')
