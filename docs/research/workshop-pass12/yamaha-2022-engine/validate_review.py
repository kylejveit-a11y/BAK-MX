"""Read-only source/procedure integrity and graph checks. Does not grant approval."""
import hashlib,json,sys
from pathlib import Path
OUT=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf-8'))
m=read(OUT/('lower-source-review-manifest.json' if '--lower' in sys.argv else 'source-review-manifest.json'))
assert sha(OUT/m['author_review']['path'])==m['author_review']['sha256']
author=read(OUT/m['author_review']['path'])
if 'step_ledger' in author: assert sha(OUT/author['step_ledger']['path'])==author['step_ledger']['sha256']
src={s['id']:s for s in m['sources']}
for s in src.values():assert sha(Path(s['local_pdf_path']))==s['sha256']
for a in m['artifacts']:
 p=OUT/a['path'];assert sha(p)==a['sha256'],'Procedure content changed'
 d=read(p);assert d['target']==a['target']==dict(manufacturer='Yamaha',model='YZ450F',model_year=2022,region='US',variant='standard')
 assert d['source']['document_sha256']==src[a['source_id']]['sha256']
 ids=[s['id'] for s in d['steps']];assert len(ids)==len(set(ids))
 for i,s in enumerate(d['steps']):
  assert s['depends_on']==([ids[i-1]] if i else [])
  assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  assert s['source_links']==[d['source']['source_url']+'#page='+str(p) for p in s['source_pdf_pages']]
  for b in s.get('branches',[]):assert ids.index(b['next_step'])>i
 assert len(d['source']['printed_pages'])==len(d['source']['pdf_pages'])
 assert '2024' not in json.dumps(d) and '2025' not in json.dumps(d) and 'D02-' not in json.dumps(d)
 if '--approved' in sys.argv:
  assert m['status']==a['review_status']==d['publication_status']==d['source']['review_status']=='APPROVED'
  r=m['independent_review'];assert sha(OUT/r['path'])==r['sha256']
  review=read(OUT/r['path']);assert review['status']=='APPROVED' and review['artifact_sha256']==sha(p)
 print('PASS',d['id'],len(ids),'steps',sha(p))
