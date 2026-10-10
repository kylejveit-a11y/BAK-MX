"""Refresh integration metadata/hashes without changing source approval decisions."""
import hashlib,json
from pathlib import Path
p=Path(__file__).resolve().parent
def write(f,v):f.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
m=json.loads((p/'source-review-manifest.json').read_text(encoding='utf8'))
for f in p.glob('*.procedure.json'):
 d=json.loads(f.read_text(encoding='utf8'))
 if 'steering' in f.name:
  d['completeness']='Both steering bearing/race sets renewed with attributed fitting-tool technique and complete OEM front-end access, preload and closure; closed controls/hydraulics retained.'
 if 'swingarm' in f.name:
  d['completeness']='Four swingarm and six linkage bearings renewed with matched bushes/collars, thrust bearings and new seals; exact depth records and complete bike-level rear assembly closure. Shock eyes/internal damper excluded.'
 if 'shock-eye' in f.name:
  d['completeness']='Upper and lower shock-eye bearing/bushing and seal renewal with complete assembled-bike access and closure. Spring/preload and gas/oil circuits remain untouched.'
  d['renewal_policy']='New upper bushing/stopper, both upper O-rings and seals, lower bearing/bushing and both lower seals. Inspect collars; replace damaged parts. Never reuse removed NEW-marked seals or stopper.'
  d['preflight']=['Exact stock bike confirmed.','Undamaged sealed shock with correct new eye parts and fitting local support/tools.','Bike and swingarm securely supported.','Fuel handling equipment and both specified greases ready.']
  d['critical_stop_conditions']=['Unstable bike, swingarm or local bearing support.','Damaged mounting-eye seat, leaking shock or bent/damaged rod.','Tool cannot fit without loading pressure body or shock rod.','Fuel contamination, damaged joint or connection that will not latch.']
  d['affected_components']=['shock','suspension']
 for s in d.get('supplemental_sources',[]):
  s['local_path']=s['local_pdf_path']
  s['attribution']='Motion Pro, Inc., official tool instructions'
  s['scope']='Standard tool operation only; exact Yamaha geometry, stack, grease exceptions, depths and closure control. Actual adapter fit must be checked; no model compatibility assertion.'
 assert '\ufffd' not in json.dumps(d,ensure_ascii=False),f
 write(f,d)
m['artifacts']=[]
for f in p.glob('*.procedure.json'):
 d=json.loads(f.read_text(encoding='utf8'));m['artifacts'].append({'path':f.name,'kind':'procedure','sha256':sha(f),'source_id':'yamaha-yz450f-2026-oem','target':d['target'],'step_count':len(d['steps'])})
write(p/'source-review-manifest.json',m)
