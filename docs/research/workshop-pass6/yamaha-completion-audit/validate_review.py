import hashlib,json
from pathlib import Path
P=Path(__file__).parent; R=P.parents[3]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((P/'source-review-manifest.json').read_text())
assert m['status']=='APPROVED'
for s in m['sources']:assert sha(Path(s['local_pdf_path']))==s['sha256']
for a in m['artifacts']:
    p=P/a['path'];assert sha(p)==a['sha256']; d=json.loads(p.read_text())
    assert d['target']==a['target'] and d['source']['review_status']=='APPROVED'
    assert d['publication_status']=='APPROVED' and len(d['steps'])==14
    for ref in d['operation_dependencies']:assert sha(R/ref['artifact'])==ref['sha256']
    seen=set()
    for s in d['steps']:
        assert s['id'] not in seen and set(s['depends_on'])<=seen
        assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
        assert isinstance(s['verification'],list) and s['verification']
        if s['diagram_reference_required']:assert s['source_links']
        seen.add(s['id'])
    ids=[s['id'] for s in d['steps']]
    assert ids.index('left-bearing')<ids.index('spacer-right')<ids.index('seals-in')<ids.index('refit')<ids.index('seat')<ids.index('torque')
    seal=next(s for s in d['steps'] if s['id']=='seals-in')
    assert seal['record_required'] and '0 mm' in seal['instruction'] and 'OUTWARD' in seal['instruction']
    for sid in ['left-bearing','spacer-right']:
        bearing=next(s for s in d['steps'] if s['id']==sid)
        assert 25 in bearing['source_pdf_pages'] and 'manufacturer marks or size symbols facing outward' in bearing['instruction']
    assert '1-13' in d['source']['printed_pages'] and 25 in m['independent_review']['pages']
print('PASS: approved source and artifact hashes; exact target; inherited dependency; 14 ordered steps; bearing/seal order, diagram links, 0 mm seal observation and axle closure.')
