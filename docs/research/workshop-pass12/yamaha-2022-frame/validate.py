import json,hashlib,re,sys
from pathlib import Path
H=Path(__file__).resolve().parent
R=H.parents[3]
hash=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((H/'source-review-manifest.json').read_text(encoding='utf8'))
for src in m['sources']:assert hash(Path(src['local_pdf_path']))==src['sha256']
for a in m['artifacts']:
 f=H/a['path'];assert hash(f)==a['sha256'];p=json.loads(f.read_text(encoding='utf8'))
 assert p['target']==a['target']
 source=next(s for s in m['sources'] if s['id']==a['source_id']);assert p['source']['document_sha256']==source['sha256'];assert p['source']['source_url']==source['url']
 assert len(p['source']['pdf_pages'])==len(p['source']['printed_pages'])
 assert '\ufffd' not in f.read_text(encoding='utf8') and '\u00c2\u00b7' not in f.read_text(encoding='utf8')
 seen=[]
 for step in p['steps']:
  assert step['id'] not in seen
  assert step['depends_on']==([] if not seen else [seen[-1]])
  assert step['source_pdf_pages'] and set(step['source_pdf_pages'])<=set(p['source']['pdf_pages'])
  assert step['verification'] and step['source_links']
  for match in re.finditer(r'PDF\s*(\d+)',step['instruction']):assert int(match[1]) in step['source_pdf_pages'],(step['id'],match[0])
  seen.append(step['id'])
 by={s['id']:s for s in p['steps']}
 assert seen.index('engine-exhaust-suspension-release')<seen.index('engine-exhaust-silencer-remove')
 assert seen.index('engine-exhaust-joints-final')<seen.index('engine-exhaust-suspension-refit')<seen.index('engine-oil-flow')
 assert '85Nm' in by['engine-mount-torque']['instruction']
 assert '.63L' in by['engine-oil-fill']['instruction'] and '1.20' not in by['engine-oil-fill']['instruction']
 assert 'LOCTITE' not in by['engine-sprocket-final']['instruction']
 assert 'before proceeding' in by['engine-initial-record']['instruction']
 for op in p['external_operations']:assert op['step_id'] in seen
 for src in p['supplemental_sources']:assert hash(Path(src['local_path']))==src['sha256']
 if '--approved' in sys.argv:
  assert p['source']['review_status']=='APPROVED' and p['status']=='SOURCE_REVIEWED_BOUNDED_PROCEDURE'
  assert hash(R/m['independent_review']['path'])==m['independent_review']['sha256']
  review=json.loads((H/'independent-review-v1.json').read_text(encoding='utf8'));assert review['status']=='APPROVED'
  assert review['document_sha256']==source['sha256']
  assert any(x['path']==a['path'] and x['sha256']==a['sha256'] for x in review['artifacts'])
print('PASS: exact source/artifact hashes, target, ordered prerequisites, locators, source changes and external closure boundaries')
