import json,pathlib
P=pathlib.Path(__file__).parent/'torques-450f-2025.json';j=json.loads(P.read_text());seen={}
for f in j['facts']:
 if f['review_status']=='EXCLUDED_VARIANT':continue
 f['review_status']='APPROVED';f['review_note']='OEM-authored document retrieved through GasGas US owner-manual portal, worldwide manual expressly includes standard MC 450F F0301Y5. PDF pages 156–161 visually checked against structured extraction. Conditions and variant exclusions preserved; part occurrence mapping remains separate.'
 f['reviewer_id']='BAK-MX-GasGas-source-review';f['reviewed_at']='2026-09-13T00:00:00Z'
 if f['joint']=='Screw, pressure pump cover':
  f['review_status']='CONFLICTED';f['review_note']='2025 manual table prints M6×16; adjacent-generation 2026 manual gives M5×16. Do not correct from another year: reconcile with 2025 pump-cover OEM fastener before promotion.'
 if 'Engine oil' in f['joint']:
  f['joint']='Cylinder-head main screw';f['conditions']=['Thread/size: M10×1.25','Apply engine oil to collar and thread before tightening','Tighten in ordered stages: 10 Nm, 30 Nm, 50 Nm','Tightening order and replacement rules require the applicable repair procedure']
 key=(f['joint'],f['source_thread'],str(f['value']))
 if key in seen:f['review_status']='DUPLICATE';f['review_note']='Same joint, size, value and conditions repeated in source; canonical record '+seen[key]
 else:seen[key]=f['id']
j['scope_confirmed']=True;j['gaps']=['Part-number mappings pending catalog reconciliation.','Pressure pump cover M6×16 table entry requires exact 2025 catalog conflict resolution.','Owners-manual torque tables do not supply all workshop tightening orders, replacement rules or internal suspension specifications.']
P.write_text(json.dumps(j,indent=2,ensure_ascii=False)+'\n');print({s:sum(f['review_status']==s for f in j['facts']) for s in set(f['review_status'] for f in j['facts'])})
