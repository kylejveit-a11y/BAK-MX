import json,hashlib
from pathlib import Path
OUT=Path(__file__).parent;m=json.loads((OUT/'source-review-manifest.json').read_text(encoding='utf8'));p=json.loads((OUT/m['artifacts'][0]['path']).read_text(encoding='utf8'))
for s in m['sources']:assert hashlib.sha256(Path(s['local_pdf_path']).read_bytes()).hexdigest()==s['sha256']
for a in m['artifacts']:assert hashlib.sha256((OUT/a['path']).read_bytes()).hexdigest()==a['sha256']
assert p['target']['model_year']==2025 and p['settings']['fork_projection_mm']==5
ids=[s['id'] for s in p['steps']];assert len(ids)==len(set(ids))==53
seen=[]
for s in p['steps']:
 assert s['depends_on']==seen[-1:];seen.append(s['id']);assert set(s['source_pdf_pages'])<=set(p['source']['pdf_pages']);assert s['verification']
 if s['diagram_reference_required']:assert s['source_links']
 for l in s['source_links']:assert l['url'].split('#')[0]==p['source']['source_url'] and int(l['url'].split('=')[-1]) in s['source_pdf_pages']
for side in ['left','right']:
 def step(k):return next(s for s in p['steps'] if s['id']==side+'-'+k)
 assert '275 cm' in step('outer-fill')['instruction'];assert '216 cm' in step('fill')['instruction'];assert '90890-01502' in step('tubes')['instruction']
 assert '492.0 mm' in step('inspect')['instruction'] and '0.2 mm' in step('inspect')['instruction']
 for name in ['inspect','renew','fill','bleed','level','base-seat','purge','spring','adjuster','adjuster-torque','outer-fill']:assert step(name)['record_required']
 assert 'scraper' not in step('seal-stack')['instruction'].lower()
assert ids.index('wheel-refit')<ids.index('seat-torque')<ids.index('verify')
s=json.dumps(p,ensure_ascii=False)
for forbidden in ['D03-2819U','280.0','90890-01917','2 mm projection','no internal-service claim']:assert forbidden not in s
print('PASS: exact2025 source/hash,53 steps, both leg sequences, year differences and closure')
