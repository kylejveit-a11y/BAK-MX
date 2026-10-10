"""Read-only integrity checks for the superseding Beta publication hold."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def validate(root=ROOT):
    manifest = json.loads((root / 'continuation-review-manifest.json').read_text())
    for item in manifest['artifacts']:
        assert digest(root / item['path']) == item['sha256'], 'Continuation artifact changed'
    for source in manifest['sources']:
        assert digest(Path(source['local_path'])) == source['sha256'], 'Continuation source changed'
    holds = json.loads((root / 'publication-hold.json').read_text())['holds']
    assert len(holds) == 1
    hold = holds[0]
    assert hold['status'] == 'HELD' and hold['auto_approval'] is False
    assert digest(root / hold['source_artifact']) == hold['source_artifact_sha256']
    original = json.loads((root / hold['source_artifact']).read_text(encoding='utf-8'))
    assert original['id'] == hold['procedure_id']
    overlay = json.loads((root / hold['conflict_overlay']).read_text())
    assert overlay['status'] == 'SUPERSEDING_CONFLICT_HOLD'
    assert overlay['supersedes_review_of']['sha256'] == hold['source_artifact_sha256']
    assert overlay['supplemental_sources'][0]['sha256'] == hold['new_source']['sha256']
    print('PASS: immutable historical guide, superseding hold, reviewed source and continuation hashes')

if __name__ == '__main__':
    validate()
