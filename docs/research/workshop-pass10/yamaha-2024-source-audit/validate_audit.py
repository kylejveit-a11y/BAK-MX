"""Read-only audit integrity validation; no publication permission."""
import hashlib,json
from pathlib import Path
B=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((B/'audit-manifest.json').read_text(encoding='utf8'))
for s in m['sources']:assert sha(Path(s['local_path']))==s['sha256']
for a in m['artifacts']:assert sha(B/a['path'])==a['sha256']
d=json.loads((B/'reviewed-differences.json').read_text(encoding='utf8'))
assert d['target']['model_year']==2024 and d['status']=='SOURCE_DIFFERENCE_AUDIT_ONLY_NOT_PROCEDURE_APPROVAL'
assert d['source_sha256']==m['sources'][0]['sha256']
print('PASS: exact source bytes and audit hashes; no procedure approval')
