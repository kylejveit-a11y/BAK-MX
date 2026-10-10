import json,pathlib
P=pathlib.Path(__file__).parent
rows={'250-2022':(134,134,.95,310,300,'14:51'),'250-2023':(136,136,.90,305,293,'14:51'),'250-2024':(145,'145–146',.95,305,293,'14:51'),'250-2025':('134–135',135,.90,305,293,'14:51'),'450-2022':(137,138,1.2,300,293,'13:49'),'450-2023':(152,152,.95,305,293,'13:51'),'450-2024':(159,159,.95,305,293,'13:51'),'450-2025':(145,'145–146',.95,305,293,'13:51')}
for key,(fluidpage,chassispage,coolant,front,rear,gears) in rows.items():
 meta=json.loads((P/f'manual-fc-{key}.json').read_text());facts=[];cc,yr=map(int,key.split('-'))
 def add(prop,joint,v,unit,page,conditions=[]):
  facts.append(dict(id=f'fc-{key}-service-spec-{len(facts)+1}',property=prop,joint=joint,value=v,unit=unit,conditions=conditions,source_url=meta['selected']['link'],locator=f'PDF page(s) {page}, technical data: {joint}',document_sha256=meta['document_sha256'],document_revision=meta['document_article']+' / '+meta['document_revision'],review_status='APPROVED',review_note='Source numerical table visually reviewed for exact US standard target. Capacity table is not a substitute for level-check/filling procedure. No interpolated model-year values.'))
 add('oil_capacity','Engine oil',1 if cc==250 else 1.2,'L',fluidpage,['OEM capacity table; SAE 10W/50','Follow oil-change and level-check procedure; not an unconditional refill instruction'])
 add('coolant_capacity','Cooling system',coolant,'L',fluidpage,['OEM capacity table; follow filling/bleeding procedure'])
 add('suspension_travel','Front suspension',front,'mm',chassispage,['Standard FC model'])
 add('suspension_travel','Rear suspension',rear,'mm',chassispage,['Standard FC model'])
 add('triple_clamp_offset','Triple clamp',22,'mm',chassispage)
 for side,v,w in [('Front',260,2.5),('Rear',220,3.5)]:
  add('brake_disc_diameter',side+' brake disc',v,'mm',chassispage)
  add('clearance_wear_limit',side+' brake disc thickness',w,'mm',chassispage,['Minimum disc thickness; inspect entire swept surface'])
 add('final_drive_tooth_pair','Final drive',gears,'tooth pair',chassispage,['Front:rear sprocket teeth','US standard factory gearing'])
 if yr<2025:
  add('fuel_tank_capacity','Fuel tank',6.8 if yr==2022 else 7.2,'L',fluidpage,['Approximate total capacity; standard FC, excludes FX'])
 obj=dict(target=meta['target'],source_metadata=meta,assemblies=[],parts=[],facts=facts,mappings=[],gaps=['Procedure steps, intervals, and full wear-limit enumeration remain separate.'],catalog_complete=False,scope_confirmed=True)
 (P/f'fc-{key}-service-specs.json').write_text(json.dumps(obj,indent=2)+'\n')
print('Service specification files saved')
