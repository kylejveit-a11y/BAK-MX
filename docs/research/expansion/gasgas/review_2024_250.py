import json,pathlib,copy,re
P=pathlib.Path(__file__).parent/'torques-250f-2024.json';j=json.loads(P.read_text())
for f in j['facts']:
 if f['review_status']=='EXCLUDED_VARIANT':continue
 f.update(review_status='APPROVED',review_file='docs/research/expansion/gasgas/REVIEW.md',local_pdf_path=j['manual_source']['local_pdf'],reviewer_id='BAK-MX-GasGas-source-review',reviewed_at='2026-09-13T00:00:00Z',review_note='Official US portal worldwide manual expressly includes MC250F standard F0201X5. PDF144–146 and151–153 (printed142–144 and149–151) rendered and values/conditions checked individually.')
 if '180°' in f['source_value_text']:
  f['value']='10 Nm, then 30 Nm, then 180 degrees';f['unit']='Nm + degrees';f['conditions']=['Thread/size: '+f['source_thread'],'Tighten diagonally','Thread oiled','Ordered stages:10 Nm,30 Nm,180 degrees']
 elif f['joint']=='Screw, camshaft bearing bridge':f['conditions']=['Thread/size: '+f['source_thread'],'Tighten diagonally','Lubricate with engine oil','Ordered stages:5 Nm then14 Nm']
 elif f['joint']=='Screw, rotor':f['conditions']=['Thread/size: '+f['source_thread'],'Oil collar and thread','Degrease cone']
 elif f['joint']=='Nut, water pump impeller':f['conditions'].append('Apply Loctite243 also in gap between shaft and water-pump impeller')
f=copy.deepcopy(j['facts'][0]);f.update(id='gasgas-250f-2024-filler-plug-handtight',property='installation',joint='Filler plug',value='hand-tight',unit=None,source_thread='M24x3',source_value_text='hand-tight',conditions=['Thread/size: M24x3'],locator='PDF146/printed144, engine torque table, filler plug');j['facts'].append(f);j['scope_confirmed']=True;j['gaps']=['Exact part occurrence mappings remain pending; no torque copied across model years.']
P.write_text(json.dumps(j,indent=2,ensure_ascii=False)+'\n');print({s:sum(f['review_status']==s for f in j['facts']) for s in set(f['review_status'] for f in j['facts'])})
