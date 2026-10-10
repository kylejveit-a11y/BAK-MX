"""Read-only artifact/source/branch validation. Never creates or approves a manifest."""
import hashlib, json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
BASE=Path(__file__).parent
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((BASE/'source-review-manifest.json').read_text(encoding='utf-8'))
if manifest.get('independent_review'):
    review_ref=manifest['independent_review']
    review_path=ROOT/review_ref['path']
    assert sha(review_path)==review_ref['sha256'], 'Independent review hash mismatch'
    review=json.loads(review_path.read_text(encoding='utf-8'))
    assert review['status']=='APPROVED' and not review['open_blocking_findings']
    assert sha(BASE/review['artifact'])==review['artifact_sha256'], 'Reviewed artifact mismatch'
sources={s['source_id']:s for s in manifest['sources']}
for source in sources.values():
    assert sha(Path(source['local_path']))==source['sha256'], 'Source byte mismatch'
for a in manifest['artifacts']:
    path=ROOT/a['path']
    assert sha(path)==a['sha256'], 'Artifact byte mismatch: '+a['path']
    d=json.loads(path.read_text(encoding='utf-8'))
    assert d['target']==a['target']
    assert d['target']==dict(manufacturer='Yamaha',model='YZ450F',model_year=2025,region='US',variant='standard')
    assert d['source']['document_sha256']==sources[a['source_id']]['sha256']
    assert d['source']['review_status']==a['review_status']==d['publication_status']
    assert d['source']['printed_pages'] and all('See ' not in p for p in d['source']['printed_pages'])
    assert d['entry_state'] and d['exit_state']
    ids=[s['id'] for s in d['steps']]
    assert len(ids)==len(set(ids))
    for i,s in enumerate(d['steps']):
        assert s['instruction'] and s['verification']
        assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
        assert s['depends_on']==([ids[i-1]] if i else [])
        assert all(d['source']['source_url']+'#page='+str(p) in s['source_links'] for p in s['source_pdf_pages'])
        for b in s.get('branches',[]):
            assert ids.index(b['next_step'])>i and b['condition']
    for dep in d.get('operation_dependencies',[]):
        assert sha(ROOT/dep['artifact'])==dep['sha256'], 'Dependency mismatch'
    if '--approved' in sys.argv:
        assert a['review_status']=='APPROVED' and manifest.get('independent_review'), 'Independent approval required'
print('PASS: read-only hashes, applicability, source pages, step dependencies and forward branches')
