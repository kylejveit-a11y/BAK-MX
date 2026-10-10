"""Verify tampered candidate rejection in a disposable mirror, never shared artifacts."""
from pathlib import Path
import tempfile, subprocess, shutil, sys, json
BASE=Path(__file__).parent
REL=Path('docs/research/workshop-pass9/yamaha-2025-engine')
with tempfile.TemporaryDirectory(prefix='bakmx-lower-integrity-') as tmp:
    dest=Path(tmp)/REL
    dest.mkdir(parents=True)
    for name in ['validate_lower.py','lower-source-review-manifest.json','lower-engine-bench-v1.procedure.json']:
        shutil.copyfile(BASE/name,dest/name)
    if (BASE/'lower-runtime-source-review-manifest.json').exists():
        shutil.copyfile(BASE/'lower-runtime-source-review-manifest.json',dest/'lower-runtime-source-review-manifest.json')
    manifest=json.loads((dest/'lower-source-review-manifest.json').read_text(encoding='utf-8'))
    if manifest.get('independent_review'):
        ref=manifest['independent_review']['path']
        review_dest=Path(tmp)/ref
        review_dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(BASE.parents[3]/ref,review_dest)
    clean=subprocess.run([sys.executable,str(dest/'validate_lower.py')],capture_output=True,text=True)
    assert clean.returncode==0, clean.stderr
    artifact=dest/'lower-engine-bench-v1.procedure.json'
    d=json.loads(artifact.read_text(encoding='utf-8'))
    d['steps'][0]['instruction']+=' This deliberate test mutation must be rejected.'
    artifact.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    altered=subprocess.run([sys.executable,str(dest/'validate_lower.py')],capture_output=True,text=True)
    assert altered.returncode!=0 and ('mismatch' in altered.stderr.lower()), altered.stderr
print('PASS: clean mirror validates; changed mechanical text is rejected; shared files untouched')
