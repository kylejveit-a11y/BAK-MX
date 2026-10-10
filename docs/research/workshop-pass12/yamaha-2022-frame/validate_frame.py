import json,hashlib,re,sys
from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parents[3]
def sha(x):return hashlib.sha256(x.read_bytes()).hexdigest()
m=json.loads((H/'frame-source-review-manifest.json').read_text(encoding='utf8'));a=m['artifacts'][0];f=H/a['path'];assert sha(f)==a['sha256'];p=json.loads(f.read_text(encoding='utf8'));src=m['sources'][0]
assert sha(Path(src['local_pdf_path']))==src['sha256']==p['source']['document_sha256'];assert src['url']==p['source']['source_url'];assert p['target']==a['target'] and p['target']['model_year']==2022
for dep in p['operation_dependencies']:assert sha(R/dep['artifact'])==dep['sha256']
for source in p['supplemental_sources']:assert sha(Path(source['local_path']))==source['sha256']
seen=[]
for s in p['steps']:
 assert s['id'] not in seen and s['depends_on']==([] if not seen else [seen[-1]])
 assert s['source_pdf_pages'] and set(s['source_pdf_pages'])<=set(p['source']['pdf_pages'])
 assert s['verification'] and s['source_links']
 for match in re.finditer(r'PDF\s*(\d+(?:/\d+)*)',s['instruction']):assert set(map(int,match[1].split('/')))<=set(s['source_pdf_pages']),(s['id'],match[0])
 seen.append(s['id'])
assert len(seen)==153
assert seen.index('front-bar-off')<seen.index('front-legs-remove')
by={s['id']:s for s in p['steps']}
assert seen.index('engine-exhaust-suspension-release')<seen.index('engine-exhaust-silencer-remove')
assert seen.index('rear-link-torque')<seen.index('engine-exhaust-joints-final')<seen.index('engine-exhaust-suspension-refit')<seen.index('engine-oil-flow')
assert seen.index('rear-hardware')<seen.index('front-seat-torque')<seen.index('engine-oil-flow')
for id in ['engine-initial-record','rear-renew-new-seals','front-renew-seals-in','engine-final-checks']:assert by[id]['record_required'] and not by[id].get('branches')
assert '5 mm' in by['front-height-clamps']['instruction'] and '4.25mm' in by['eyes-renew-lower-eye-in']['instruction']
assert '85Nm' in by['engine-mount-torque']['instruction']
assert '40Nm' in by['front-bar-refit']['instruction'] and 'upper-holder bolts untouched' in by['front-bar-off']['instruction']
assert 'chain remains removed' in by['rear-refit']['verification'][0]
assert all(op['step_id'] in seen for op in p['external_operations'])
assert not any(c in f.read_text(encoding='utf8') for c in ['\ufffd','\u00c2\u00b7'])
if '--approved' in sys.argv:
 assert p['source']['review_status']=='APPROVED' and p['status']=='SOURCE_REVIEWED_BOUNDED_PROCEDURE'
 ref=m['independent_review'];assert sha(R/ref['path'])==ref['sha256'];review=json.loads((R/ref['path']).read_text(encoding='utf8'));assert review['status']=='APPROVED';assert sha(R/review['peer_review']['path'])==review['peer_review']['sha256'];assert review['document_sha256']==src['sha256'];assert any(x['path']==a['path'] and x['sha256']==a['sha256'] for x in review['artifacts'])
print('PASS:153 ordered steps, source/artifact/dependency hashes, exact2022 changes, suspended access closure and non-bypassable external records')
