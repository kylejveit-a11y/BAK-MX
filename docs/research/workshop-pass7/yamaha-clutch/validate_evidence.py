from pathlib import Path
import json,hashlib
P=Path(__file__).resolve().parent
m=json.loads((P/'evidence-manifest.json').read_text())
for a in m['artifacts']:assert hashlib.sha256((P/a['path']).read_bytes()).hexdigest()==a['sha256']
for a in m['inherited']:assert hashlib.sha256((P.parents[3]/a['path']).read_bytes()).hexdigest()==a['sha256']
d=json.loads((P/'review.json').read_text())
for s in d['sources']:assert hashlib.sha256(Path(s['local_path']).read_bytes()).hexdigest()==s['sha256']
assert not d['external_messages_sent'] and not d['database_writes']
print('PASS source bytes, review integrity, prior continuity and unsent status')
