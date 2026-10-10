from pathlib import Path
import json,hashlib
R=Path(__file__).parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=read(R/'source-review-manifest.json')
for src in m['sources']:assert sha(Path(src['local_pdf_path']))==src['sha256']
for a in m['artifacts']:
 assert sha(R/a['path'])==a['sha256']
 d=read(R/a['path']);seen=set()
 assert d['target']==a['target'] and d['entry_state'] and d['exit_state']
 assert d['source']['printed_pages']==[str(p) for p in d['source']['pdf_pages']]
 for s in d['steps']:
  assert s['id'] not in seen and set(s['depends_on'])<=seen
  assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
  assert s['verification'] and isinstance(s['record_required'],bool)
  seen.add(s['id'])
 by={s['id']:s for s in d['steps']}
 for sid in ['plug-two','plugs','filter-in','fill','level','topup']:assert by[sid]['record_required']
 assert 'screw A' in by['drain']['instruction']
 assert 'NEW seal ring' in by['plugs']['instruction']
 assert 'one minute' in by['level']['instruction']
 assert 'Do not add another 1.20 L' in by['topup']['instruction']
 assert len(d['steps'])==12
print('PASS: source hash, procedure hash, exact target, 12 ordered steps, page references and critical observation requirements')
