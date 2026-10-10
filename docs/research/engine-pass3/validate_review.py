import hashlib,json
from pathlib import Path
root=Path(__file__).parent
m=json.loads((root/'source-review-manifest.json').read_text())
sources={s['id']:s for s in m['sources']}
count=0
for a in m['artifacts']:
 p=root/a['path']; assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],p
 if a['kind']!='procedure':continue
 d=json.loads(p.read_text()); assert d['target']==a['target']; assert d['source']['document_sha256']==sources[a['source_id']]['sha256']
 assert d['source']['review_status']=='APPROVED'
 assert d['source']['printed_pages']
 assert d['entry_state'] and d['exit_state']
 ids=[s['id'] for s in d['steps']]; assert len(ids)==len(set(ids))
 for n,s in enumerate(d['steps']):
  assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages']),(p,s['id'])
  assert all(x in ids[:n] for x in s['depends_on']),(p,s['id'])
  assert isinstance(s['record_required'],bool)
  assert s['verification'] and s['source_links']
 count+=len(ids)
print(f'PASS: {len(m["artifacts"])} source-hashed procedure artifacts; {count} steps; entry/exit states, pages and dependencies valid')
