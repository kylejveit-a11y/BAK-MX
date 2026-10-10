"""Validate the frozen local review manifest; never regenerate approval hashes."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def validate(root=ROOT):
    manifest = json.loads((root / 'source-review-manifest.json').read_text(encoding='utf-8'))
    sources = {s['id']: s for s in manifest['sources']}
    for source in sources.values():
        assert digest(Path(source['local_pdf_path'])) == source['sha256'], 'Source PDF changed'
    for artifact in manifest['artifacts']:
        path = (root / artifact['path']).resolve()
        assert path.parent == root.resolve(), 'Artifact escapes review directory'
        assert digest(path) == artifact['sha256'], 'Reviewed artifact changed: ' + path.name
        if artifact.get('kind') != 'procedure':
            continue
        p = json.loads(path.read_text(encoding='utf-8'))
        source = sources[artifact['source_id']]
        assert p['source']['document_sha256'] == source['sha256']
        assert p['source']['source_url'] == source['url']
        assert p['target'] == artifact['target']
        assert p['scope_confirmed'] is True
        assert p['status'] == 'SOURCE_REVIEWED_BOUNDED_PROCEDURE'
        assert p['source']['review_status'] == 'APPROVED'
        assert p['steps'], 'No steps'
        seen = set()
        for step in p['steps']:
            assert step['id'] not in seen
            assert set(step['depends_on']) <= seen
            assert step['source_pdf_pages'] and set(step['source_pdf_pages']) <= set(p['source']['pdf_pages'])
            assert step['verification'] and step['instruction']
            if step['diagram_reference_required']:
                assert step['source_links']
                assert all(link.startswith(source['url'] + '#page=') for link in step['source_links'])
            seen.add(step['id'])
    return len([a for a in manifest['artifacts'] if a.get('kind') == 'procedure'])

if __name__ == '__main__':
    print(f'PASS: {validate()} reviewed procedures; source and artifact hashes; scope and ordered steps')
