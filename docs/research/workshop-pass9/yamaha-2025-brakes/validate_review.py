from pathlib import Path
import hashlib,json,re
P=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((P/'source-review-manifest.json').read_text());sources={s['id']:s for s in m['sources']}
for s in sources.values():assert sha(Path(s['local_pdf_path']))==s['sha256']
for a in m['artifacts']:
 f=P/a['path'];assert sha(f)==a['sha256']
 if a['kind']!='procedure':continue
 d=json.loads(f.read_text(encoding='utf-8'));assert d['target']==a['target'];assert d['target']['model_year']==2025 and d['target']['region']=='US' and d['target']['variant']=='standard'
 assert d['source']['review_status']=='APPROVED'
 assert d['source']['source_url']==sources[a['source_id']]['url']
 assert d['source']['document_sha256']==sources[a['source_id']]['sha256']
 t=d['authoring_template'];assert sha(P.parents[3]/t['artifact'])==t['sha256']
 assert 'D03-2819U' not in f.read_text(encoding='utf-8')
 seen=set()
 for s in d['steps']:
  assert s['id'] not in seen and set(s['depends_on'])<=seen
  assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  assert all(u.startswith(d['source']['source_url']+'#page=') for u in s['source_links'])
  seen.add(s['id'])
 print(f.name,len(seen),'APPROVED exact2025')
print('PASS source bytes, exact scope, template integrity, review hashes and ordered steps')
