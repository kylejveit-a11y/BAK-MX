import json,hashlib,sys,re
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def rd(p):return json.loads(p.read_text(encoding='utf8'))
m=rd(HERE/'source-review-manifest.json')
for source in m['sources']:assert sha(Path(source['local_pdf_path']))==source['sha256']
for a in m['artifacts']:
 p=HERE/a['path'];assert sha(p)==a['sha256'];d=rd(p)
 assert d['target']==a['target']=={'manufacturer':'Yamaha','model':'YZ450F','model_year':2024,'region':'US','variant':'standard'}
 assert d['source']['document_sha256']=='6e784b3b15fe1e131f0e385676ca2873e74d783ee2499ce561e595bcea9ca9be'
 assert sha(ROOT/d['editorial_template']['path'])==d['editorial_template']['sha256']
 ids=[s['id'] for s in d['steps']];assert len(ids)==len(set(ids))==a['step_count']
 rows={s['id']:s for s in d['steps']}
 for i,s in enumerate(d['steps']):
  assert s['depends_on']==([ids[i-1]] if i else [])
  assert s['verification'] and s['source_pdf_pages'] and s['source_links']
  for link in s['source_links']:
   u=link['url'] if isinstance(link,dict) else link
   assert 'D02-' not in u and 'D03-' not in u
  assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  for mention in re.finditer(r'PDF\s*(\d+(?:/\d+)*)',s['instruction']):assert set(map(int,mention[1].split('/')))<=set(s['source_pdf_pages'])
 assert 106 in rows['engine-torque']['source_pdf_pages']
 assert '50 N' in str(rows['engine-slack']) and '48 N' not in str(rows['engine-slack'])
 if len(ids)==151:
  assert '7 mm' in rows['front-height-clamps']['instruction']
  assert '5 mm' not in str(rows['front-height-clamps']['verification'])
  assert ids.index('rear-refit')<ids.index('front-seat-torque')
  assert ids.index('swingarm-off')<ids.index('engine-engine-in')
  assert ids.index('steering-renew-head-races-in')<ids.index('front-steering-grease')
  assert rows['rear-harness-route']['source_pdf_pages']==[64,65,66,67,72,73,117]
 assert 'four lower' in rows['engine-mounts-out']['instruction']
 assert rows['engine-exhaust-joints-final']['instruction'].count('12 N·m')==2
 assert '16 N·m' not in str(rows['engine-exhaust-joints-final']['verification'])
 assert '03269' in rows['control-renew-idle-check']['instruction'] and '03275' not in str(d['required_tools'])
 assert ids.index('engine-torque')<ids.index('engine-sprocket-final')<ids.index('engine-oil-flow')
 assert 'lithium-soap grease' in rows['engine-oil-fill']['instruction']
 assert '\ufffd' not in p.read_text(encoding='utf8') and '\u00c2\u00b7' not in p.read_text(encoding='utf8')
 if '--approved' in sys.argv:
  assert d['source']['review_status']=='APPROVED' and d['integration_status']=='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED'
  r=m['independent_review'];rp=HERE/r['path'];assert sha(rp)==r['sha256'];r=rd(rp)
  assert r['target']==d['target'] and r['source_sha256']==d['source']['document_sha256']
  assert any(x['path']==p.name and x['sha256']==a['sha256'] for x in r['artifacts'])
 print(p.name,len(ids),'source/target/closure/known-difference checks PASS')
