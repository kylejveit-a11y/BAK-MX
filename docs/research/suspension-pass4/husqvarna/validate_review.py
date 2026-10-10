"""Validate frozen exact-model review; never refresh approval hashes."""
from pathlib import Path
import json
import hashlib

ROOT = Path(__file__).resolve().parent

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def validate(root=ROOT):
    m=json.loads((root/'source-review-manifest.json').read_text())
    source=m['sources'][0]
    assert sha(Path(source['local_pdf_path']))==source['sha256'], 'Source changed'
    for a in m['artifacts']:
        f=root/a['path']
        assert sha(f)==a['sha256'], 'Reviewed artifact changed'
        if a['kind']!='procedure':
            continue
        p=json.loads(f.read_text())
        assert p['target']==a['target']
        assert p['source']['source_url']==source['url']
        assert p['source']['document_sha256']==source['sha256']
        assert p['source']['review_status']=='APPROVED'
        assert p['scope_confirmed'] is True
        seen=set()
        for step in p['steps']:
            assert step['id'] not in seen
            assert set(step['depends_on'])<=seen
            assert set(step['source_pdf_pages'])<=set(p['source']['pdf_pages'])
            assert step['instruction'] and step['verification']
            assert all(link.startswith(source['url']+'#page=') for link in step['source_links'])
            seen.add(step['id'])
    print('PASS: approved exact model, immutable source/artifacts and ordered steps')

if __name__=='__main__':
    validate()
