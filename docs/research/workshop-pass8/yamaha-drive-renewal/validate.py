import hashlib,json
from pathlib import Path
p=Path(__file__).resolve().parent;root=p.parents[3]
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
m=json.loads((p/'source-review-manifest.json').read_text(encoding='utf8'))
for s in m['sources']:assert sha(Path(s['local_pdf_path']))==s['sha256']
e=m['artifacts'][0];f=p/e['path'];assert sha(f)==e['sha256'];d=json.loads(f.read_text(encoding='utf8'))
assert d['source']['review_status']=='APPROVED' and d['integration_status']=='ROOT_SOURCE_AND_CLOSURE_REVIEW_APPROVED'
for dep in d['operation_dependencies']:assert sha(root/dep['artifact'])==dep['sha256']
ids=[s['id'] for s in d['steps']];assert len(ids)==len(set(ids))==e['step_count']==16
for i,s in enumerate(d['steps']):assert s['depends_on']==([ids[i-1]] if i else []) and s['verification'] and s['source_pdf_pages']
def before(*names):assert [ids.index(x) for x in names]==sorted(ids.index(x) for x in names)
before('front-release','chain-remove','wheel-remove','rear-install','wheel-refit','chain-install','axle-secure','front-secure','cover','final')
assert d['target']=={'manufacturer':'Yamaha','model':'YZ450F','model_year':2026,'region':'US','variant':'standard'}
assert all(bad not in f.read_text(encoding='utf8') for bad in ['\ufffd','Â·','â€'])
assert all(next(s for s in d['steps'] if s['id']==n)['record_required'] for n in ['prepare','rear-install','slack','axle-secure','front-secure','final'])
print('PASS16 steps; exact source/dependency hashes, identity, chain-assisted holding sequence, wheel closure and required records')
