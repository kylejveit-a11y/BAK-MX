"""Read-only integrity and exact-scope checks; no source-approval inference."""
import hashlib,json,re,sys
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((B/('remaining-source-review-manifest.json' if '--remaining' in sys.argv else 'current-source-review-manifest.json')).read_text());sources={s['source_id']:s for s in m['sources']}
if '--approved' in sys.argv:
 assert m['status']=='APPROVED'
 assert sha(R/m['independent_review']['path'])==m['independent_review']['sha256']
for s in sources.values():assert sha(Path(s['local_path']))==s['sha256']
for a in m['artifacts']:
 p=R/a['path'];assert sha(p)==a['sha256'];d=json.loads(p.read_text(encoding='utf8'));s=sources[a['source_id']]
 assert d['target']==a['target'] and len(d['steps'])==a['step_count']
 assert d['source']['source_url']==s['url'] and d['source']['document_sha256']==s['sha256']
 ids={st['id'] for st in d['steps']};assert len(ids)==len(d['steps'])
 for st in d['steps']:
  assert set(st['depends_on'])<=ids
  assert st['source_links']==[s['url']+'#page='+str(n) for n in st['source_pdf_pages']]
  assert all(int(n) in st['source_pdf_pages'] for n in re.findall(r'PDF\s+(\d+)',st['instruction']))
 assert 'B2W-' not in json.dumps(d['source'])
 if '--approved' in sys.argv:
  assert d['status']=='SOURCE_REVIEWED_BOUNDED_PROCEDURE'
  assert d['publication_status']==d['source']['review_status']=='APPROVED'
  runtime=json.loads((p.parent/'runtime-source-review-manifest.json').read_text())
  binding=runtime['author_review_manifest'];assert sha(R/binding['path'])==binding['sha256']
  assert runtime['status']=='APPROVED'
  assert any(x['id']==a['source_id'] and x['sha256']==s['sha256'] for x in runtime['sources'])
  assert any(x['path']==p.name and x['sha256']==a['sha256'] and x['kind']=='procedure' for x in runtime['artifacts'])
print('PASS',len(m['artifacts']),'source-bound candidates; source approval is separate')
