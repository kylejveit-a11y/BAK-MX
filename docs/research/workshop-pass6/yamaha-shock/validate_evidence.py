from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def validate(root=R):
 m=json.loads((root/'evidence-manifest.json').read_text())
 for a in m['artifacts']:assert sha(root/a['path'])==a['sha256'],'Artifact changed'
 for s in m['source_captures']:assert sha(Path(s['path']))==s['sha256'],'Capture changed'
 repo=R.parents[3];p=m['prior_review'];assert sha(repo/p['path'])==p['sha256'],'Prior review changed'
 e=json.loads((root/'evidence-review.json').read_text())
 assert e['decision']=='INTERNAL_REBUILD_INCOMPLETE_NO_EXECUTABLE_PROCEDURE'
 assert e['target']==dict(manufacturer='Yamaha',model='YZ450F',model_year=2026,region='US',variant='standard')
 assert e['year_inheritance']=='NONE' and not e['database_writes']
 assert next(s for s in e['sources'] if s['id']=='kyb-2026-release')['admissible_capture'] is False
 assert next(s for s in e['sources'] if s['id']=='yamaha-us-fiche')['admissible_capture'] is False
 print('PASS: source captures, prior review and exact incomplete scope preserved')
if __name__=='__main__':validate()
