import pathlib,json
O=pathlib.Path(__file__).parent;j=json.loads((O/'mc-450f-2025.json').read_text());t=json.loads((O/'torques-450f-2025.json').read_text())
# Explicit assembly/callout/location selections. No generic part-number or bolt-size torque propagation.
selections=[
('66976','11','Spoke nipple, front wheel',None),('66976','21','Screw, front brake disc',None),('66976','32','Screw, wheel spindle, front',None),
('68020','9','Spoke nipple, rear wheel',None),('68020','12','Screw, rear brake disc',None),('68020','22','Nut, rear sprocket screw',None),('68020','44','Nut, wheel spindle, rear',None),
('58162','15','Nut, inner clutch hub',None),
('57522','5','Nut, water pump impeller',None),('57522','13','Screw, water pump cover','M6×25'),('57522','15','Screw, water pump cover','M6×20'),
('58190','5','Screw, valve cover',None),('58190','8','Exhaust flange screw',None),('58190','17','Cylinder-head main screw',None),('58190','19','Screw, cylinder head','M6×75'),('58190','27','Coolant temperature sensor',None),
('58188','5','Stator screw',None),('58188','6','Screw, rotor',None),('58188','13','Spark plug',None),('58188','16','Screw, ignition cover',None),('58188','19','Screw plug, alternator cover',None),
('58189','2','Screw, starter motor',None),
('58168','4','Screw, oil filter cover',None),('58168','23','Plug, oil screen',None),('58168','27','Screw plug, oil pressure control valve',None),('58168','30','Screw plug, crankcase',None),('58168','38','Screw, lock washer, oil pump idler gear',None),
('58123','13','Oil drain plug with magnet',None),('58123','20','Screw, engine case',None),('58123','22','Screw, engine case',None),
('68185','16','Screw, clutch slave cylinder',None),('68185','17','Screw, clutch slave cylinder',None),
('68022','20','Front sprocket screw',None),('58163','18','Shift star screw',None),('58163','21','Detent arm screw',None),('58163','36','Screw, gear position sensor',None)]
ms=[]
for a,c,name,size in selections:
 ps=[p for p in j['parts'] if p['assembly_id']==a and p['callout']==c];fs=[f for f in t['facts'] if f['joint']==name and (size is None or f['source_thread']==size) and f['review_status']=='APPROVED'];assert len(ps)==len(fs)==1,(a,c,name);p=ps[0];f=fs[0]
 ms.append({'assembly_id':a,'callout':c,'part_number':p['part_number'],'fact_id':f['id'],'property':'torque','review_status':'APPROVED','reviewed_catalog_description':p['description'],'catalog_source_url':p['source_url'],'review_note':'Exact standard F0301Y5 assembly location/callout checked against OEM named torque joint; full catalog description and applicable thread agree. Do not propagate this mapping to identical part numbers in other joints.'})
out={'target':j['target'],'scope_confirmed':True,'catalog_complete':True,'assemblies':[],'parts':[],'facts':[],'mappings':ms,'gaps':['Shift lever callout2 M6x15 conflicts with manual torque entry M6x16: excluded.','Pressure/suction pump-cover screw lengths do not match table: excluded.','Remaining fastener mappings and workshop procedures pending.']}
(O/'mappings-450f-2025.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n');print(len(ms))
