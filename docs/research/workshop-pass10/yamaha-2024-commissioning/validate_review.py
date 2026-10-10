"""Read-only source and candidate integrity checks; never approves."""
import hashlib,json,sys
from pathlib import Path
B=Path(__file__).parent;R=B.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((B/'source-review-manifest.json').read_text(encoding='utf8'))
for s in m['sources']:assert sha(Path(s['local_path']))==s['sha256']
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=json.loads(p.read_text(encoding='utf8'))
 assert d['target']==dict(manufacturer='Yamaha',model='YZ450F',model_year=2024,region='US',variant='standard')
 assert d['publication_status']==d['source']['review_status']==a['review_status']
 assert 'D02' not in json.dumps(d) and 'D03' not in json.dumps(d) and '2026' not in d['source']['document_revision']
 assert d['source']['document_sha256']==m['sources'][0]['sha256']
 ids=[s['id'] for s in d['steps']];assert len(ids)==len(set(ids))
 for i,s in enumerate(d['steps']):
  assert s['depends_on']==([ids[i-1]] if i else [])
  assert s['instruction'] and s['verification']
  assert all(d['source']['source_url']+'#page='+str(x) in s['source_links'] for x in s['source_pdf_pages'])
 for s in d['supplemental_sources']:assert sha(Path(s['local_path']))==s['sha256']
 if '--approved' in sys.argv:
  assert d['publication_status']=='APPROVED' and m['independent_review']
  q=m['independent_review'];assert sha(R/q['path'])==q['sha256']
  review=json.loads((R/q['path']).read_text(encoding='utf8'))
  assert review['artifact_sha256']==sha(p) and review['status']=='APPROVED'
print('PASS: exact target, source/artifact/supplemental hashes, sequence and locators')
