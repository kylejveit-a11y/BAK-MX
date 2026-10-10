import json,pathlib
P=pathlib.Path(__file__).parent
pages={'250-2022':131,'250-2023':133,'250-2024':142,'250-2025':134,'450-2022':135,'450-2023':149,'450-2024':156,'450-2025':144}
for key,page in pages.items():
 cc,yr=map(int,key.split('-'));meta=json.loads((P/f'manual-fc-{key}.json').read_text());facts=[]
 def add(prop,joint,val,unit,conditions=None,status='APPROVED',note=None):
  facts.append(dict(id=f'fc-{key}-spec-{len(facts)+1}',property=prop,joint=joint,value=val,unit=unit,conditions=conditions or [],source_url=meta['selected']['link'],locator=f'PDF page {page}, engine technical data: {joint}',document_sha256=meta['document_sha256'],document_revision=meta['document_article']+' / '+meta['document_revision'],review_status=status,review_note=note or 'Visually reviewed original OEM table and US standard scope on PDF page 3. Source transcription only; no cross-year inheritance.'))
 add('displacement','Engine',249.91 if cc==250 else 449.9,'cm3')
 add('stroke','Engine',52.3 if cc==250 and yr==2022 else 48.5 if cc==250 else 63.4,'mm')
 add('bore','Cylinder',78 if cc==250 and yr==2022 else 81 if cc==250 else 95,'mm')
 add('compression_ratio','Engine','14.4:1' if cc==250 and yr==2022 else '14.5:1' if cc==250 else '12.75:1' if yr==2022 else '13.1:1' if yr==2023 else '13.6:1','ratio')
 add('valve_diameter','Intake valve',32.5 if cc==250 else 40,'mm')
 add('valve_diameter','Exhaust valve',26.5 if cc==250 and yr==2022 else 27.5 if cc==250 else 33,'mm')
 add('valve_clearance','Intake valve','0.08–0.15' if cc==250 else '0.10–0.15','mm',['At 20 °C'])
 add('valve_clearance','Exhaust valve','0.12–0.19' if cc==250 else '0.12–0.17','mm',['At 20 °C'])
 if not (cc==450 and yr==2024):add('idle_speed','Engine','2250–2350' if cc==250 or yr==2022 else '2100–2200' if yr==2023 else '2200–2300','rpm')
 add('primary_transmission','Primary transmission','24:73' if cc==250 and yr==2022 else '24:72' if cc==250 else '31:76' if yr==2022 else '29:72','tooth pair',['Driving:driven teeth; not the numerical reduction ratio'])
 gears=['13:32','16:32','17:28','19:26','21:25'] if cc==250 else ['16:32','18:30','20:28','22:26','24:24'] if yr==2022 else ['14:28','16:26','18:24','21:24','22:21']
 for n,g in enumerate(gears,1):
  if cc==450 and yr==2025 and n==1:add('transmission_tooth_pair','Gear 1','2:28 PM','unresolved',status='CONFLICTED',note='Original rendered OEM table contains malformed time-like value 2:28 PM. Do not repair by borrowing another year. Requires independent exact-target evidence.')
  else:add('transmission_tooth_pair',f'Gear {n}',g,'tooth pair',['Driving:driven teeth; standard FC five-speed transmission'])
 add('alternator_voltage','Alternator',12 if yr<2024 else 14,'V')
 add('alternator_power','Alternator',77 if cc==450 and yr==2025 else 70,'W')
 # Plug specification is next page for 2025 FC450; do not extend this reviewed-page scope.
 if not(cc==450 and yr==2025):
  add('spark_plug_identity','Spark plug','NGK LMAR9AI-8' if yr==2022 else 'NGK LMAR9AI-10','model')
  add('spark_plug_gap','Spark plug',0.8 if yr==2022 else 1,'mm')
 obj=dict(target=meta['target'],source_metadata=meta,assemblies=[],parts=[],facts=facts,mappings=[],gaps=['Stock fork/shock and other service specifications still being enumerated.'],catalog_complete=False,scope_confirmed=True)
 (P/f'fc-{key}-specs.json').write_text(json.dumps(obj,indent=2)+'\n')
print('Engine specs saved')
