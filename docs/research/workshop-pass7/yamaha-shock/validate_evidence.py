from pathlib import Path
import json,hashlib
P=Path(__file__).resolve().parent
m=json.loads((P/'evidence-manifest.json').read_text())
for a in m['artifacts']:assert hashlib.sha256((P/a['path']).read_bytes()).hexdigest()==a['sha256']
for a in m['inherited']:assert hashlib.sha256((P.parents[3]/a['path']).read_bytes()).hexdigest()==a['sha256']
d=json.loads((P/'evidence-review.json').read_text())
assert d['decision']=='INCOMPLETE_NO_NEW_EXECUTABLE_INTERNAL_SERVICE_EVIDENCE' and not d['external_messages_sent'] and not d['database_writes']
print('PASS original review hashes, prior continuity and incomplete/unsent state; no external source-byte verification asserted')
