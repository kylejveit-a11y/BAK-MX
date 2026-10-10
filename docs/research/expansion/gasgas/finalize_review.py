import pathlib,json,re
OUT=pathlib.Path(__file__).parent
for p in OUT.glob('torques-*.json'):
 j=json.loads(p.read_text())
 for f in j['facts']:
  # Names such as oil nozzle are not lubricant instructions.
  explicit='Engine oil' in f['joint'] or re.search('oil|lubricat',f.get('source_value_text',''),re.I)
  if j['target']['model']=='MC 250F' and j['target']['model_year']==2025 and f['joint'] in ['Nut, cylinder head','Screw, camshaft bearing bridge']:explicit=True
  if f['joint']=='Cylinder-head main screw':explicit=True
  if not explicit:f['conditions']=[c for c in f['conditions'] if not(c.startswith('Oil/lubrication') or c.startswith('Engine oil as specified') or c.startswith('Lubricate with engine oil'))]
  if f['review_status']=='APPROVED':f['review_file']='docs/research/expansion/gasgas/REVIEW.md';f['local_pdf_path']=j['manual_source']['local_pdf']
 p.write_text(json.dumps(j,indent=2,ensure_ascii=False)+'\n')
# 2026 MC450F visually checked pages137–143, matching standard-model-only validity scope.
p=OUT/'torques-450f-2026.json';j=json.loads(p.read_text());seen={}
for f in j['facts']:
 f['review_status']='APPROVED';f['review_note']='OEM US portal worldwide manual valid for MC450F F0301Z5; PDF pages137–143 individually rendered and checked against extracted values and conditions.';f['review_file']='docs/research/expansion/gasgas/REVIEW.md';f['local_pdf_path']=j['manual_source']['local_pdf'];f['reviewer_id']='BAK-MX-GasGas-source-review';f['reviewed_at']='2026-09-13T00:00:00Z'
 if 'Engine oil' in f['joint']:
  f['joint']='Cylinder-head main screw';f['conditions']=['Thread/size: M10×1.25','Apply engine oil to collar and thread before tightening','Tighten in ordered stages: 10 Nm, 30 Nm, 50 Nm','Tightening order and replacement rules require the applicable repair procedure']
 key=(f['joint'],f['source_thread'],str(f['value']))
 if key in seen:f['review_status']='DUPLICATE';f['review_note']='Source repeats identical joint, value, size and conditions; canonical '+seen[key]
 else:seen[key]=f['id']
j['scope_confirmed']=True
p.write_text(json.dumps(j,indent=2,ensure_ascii=False)+'\n')
