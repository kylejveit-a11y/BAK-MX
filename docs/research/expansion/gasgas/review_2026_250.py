import json,pathlib,re,copy
P=pathlib.Path(__file__).parent/'torques-250f-2026.json';j=json.loads(P.read_text())
for f in j['facts']:
 if f['review_status']=='EXCLUDED_VARIANT' or '(EX 250F)' in f['joint']:
  f['review_status']='EXCLUDED_VARIANT';continue
 f['review_status']='APPROVED';f['review_note']='GasGas US portal supplies worldwide OEM manual expressly including MC 250F F0201Z5; exact standard model code. PDF pages 137–144 visually reviewed, all numeric entries and conditions compared to structured extraction. Part occurrence mapping is separate.'
 f['reviewer_id']='BAK-MX-GasGas-source-review';f['reviewed_at']='2026-09-13T00:00:00Z'
 if 'Engine oil' in f['joint']:
  f['joint']=f['joint'].replace('  Engine oil','').replace(' Engine oil','');f['conditions']=[c for c in f['conditions'] if not c.startswith('Oil/lubrication')];f['conditions'].append('Lubricate with engine oil as indicated by the OEM torque table')
 if '180°' in f['source_value_text']:
  f['value']='10 Nm, then 30 Nm, then 180 degrees';f['unit']='Nm + degrees';f['conditions'].append('Final 180-degree angle stage is mandatory; numeric torque values alone are incomplete. Use exact tightening order and replacement rules from repair procedure.')
 for c in list(f['conditions']):
  if c.startswith('Oil/lubrication'):f['conditions'].remove(c);f['conditions'].append('Engine oil as specified in OEM table')
for pg,joint,size in [(139,'Crankshaft fixing screw','M8'),(140,'Oil plug','M24×3')]:
 f=copy.deepcopy(j['facts'][0]);f.update(id=f'gasgas-250f-2026-hand-tight-p{pg}',property='installation',joint=joint,value='hand-tight',unit=None,source_thread=size,source_value_text='hand-tight',conditions=['Thread/size: '+size],locator=f'PDF page {pg}, engine tightening table, {joint}',review_status='APPROVED');j['facts'].append(f)
j['scope_confirmed']=True;j['gaps']=['Part occurrence mappings pending.','Some engine tightening order, reuse/replacement and internal suspension procedures require workshop documentation.']
P.write_text(json.dumps(j,indent=2,ensure_ascii=False)+'\n');print({s:sum(f['review_status']==s for f in j['facts']) for s in set(f['review_status'] for f in j['facts'])})
