import hashlib,json
from pathlib import Path
p=Path(__file__).resolve().parent
root=p.parents[3]
sha=lambda q:hashlib.sha256(q.read_bytes()).hexdigest()
m=json.loads((p/'source-review-manifest.json').read_text(encoding='utf8'))
for source in m['sources']:
    assert sha(Path(source['local_pdf_path']))==source['sha256'],source['id']
for entry in m['artifacts']:
    f=p/entry['path'];assert sha(f)==entry['sha256'],f
    d=json.loads(f.read_text(encoding='utf8'));ids=[s['id'] for s in d['steps']]
    assert len(ids)==len(set(ids))==entry['step_count']
    assert d['target']=={'manufacturer':'Yamaha','model':'YZ450F','model_year':2026,'region':'US','variant':'standard'}
    for i,s in enumerate(d['steps']):
        assert s['depends_on']==([ids[i-1]] if i else [])
        assert s['verification'] and s['source_pdf_pages']
    for dep in d['operation_dependencies']:assert sha(root/dep['artifact'])==dep['sha256']
    assert '\ufffd' not in f.read_text(encoding='utf8')
    for source in d.get('supplemental_sources',[]):
        assert all(source.get(k) for k in ['attribution','scope','local_path','url','sha256'])
        assert sha(Path(source['local_path']))==source['sha256']
    if 'steering' in f.name:
        assert ids.index('head-races-in')<ids.index('lower-bearing-in')<ids.index('preload')
        assert all(next(s for s in d['steps'] if s['id']==n)['record_required'] for n in ['old-races-out','head-races-in','lower-bearing-in'])
    if 'swingarm' in f.name:
        assert ids.index('bearings-out')<ids.index('swingarm-bearings-in')<ids.index('swingarm-seals')<ids.index('grease-arm')
        assert ids.index('connecting-renew')<ids.index('link-refit')<ids.index('arm-close')
        assert all(next(s for s in d['steps'] if s['id']==n)['record_required'] for n in ['stack-record','bearings-out','swingarm-bearings-in','swingarm-seals','relay-renew','connecting-renew'])
    if 'spring' in f.name:
        assert ids.index('spring-unload')<ids.index('spring-remove')<ids.index('spring-install')<ids.index('initial-preload')<ids.index('shock-in')<ids.index('sag-measure')<ids.index('sag-adjust')
        assert all(next(s for s in d['steps'] if s['id']==n)['record_required'] for n in ['spring-unload','initial-preload','sag-measure','sag-adjust'])
    print('PASS',f.name,len(ids),'steps; source/dependency/artifact hashes, exact identity and sequence')
