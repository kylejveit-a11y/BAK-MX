"""Validate the five independently reviewed tuning/drive artifacts before integration."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def validate():
    count = 0
    for folder in ['yamaha-tuning', 'yamaha-drive']:
        directory = ROOT / folder
        manifest = read(directory / 'source-review-manifest.json')
        assert manifest['status'] == manifest['independent_review']['decision'] == 'APPROVED'
        sources = {s['id']: s for s in manifest['sources']}
        for source in sources.values():
            assert sha(Path(source['local_pdf_path'])) == source['sha256']
        for artifact in manifest['artifacts']:
            path = directory / artifact['path']
            assert sha(path) == artifact['sha256'], f'Changed reviewed artifact: {path}'
            procedure = read(path)
            source = sources[artifact['source_id']]
            assert procedure['target'] == artifact['target']
            assert procedure['source']['review_status'] == 'APPROVED'
            assert procedure['source']['document_sha256'] == source['sha256']
            assert procedure['source']['source_url'] == source['url']
            assert procedure['source']['printed_pages']
            for dependency in procedure.get('operation_dependencies', []):
                assert sha(REPO / dependency['artifact']) == dependency['sha256']
            seen = set()
            ids = [step['id'] for step in procedure['steps']]
            for index, step in enumerate(procedure['steps']):
                assert step['id'] not in seen
                assert set(step['depends_on']) <= seen
                assert step['verification'] and step['instruction']
                assert set(step['source_pdf_pages']) <= set(procedure['source']['pdf_pages'])
                for branch in step.get('branches', []):
                    assert ids.index(branch['next_step']) > index
                seen.add(step['id'])
            count += 1
    assert count == 5
    print('PASS: five approved exact-bike artifacts, source bytes, dependency hashes and forward routes')

if __name__ == '__main__':
    validate()
