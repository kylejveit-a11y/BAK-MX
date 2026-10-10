import pdfplumber,json,pathlib,re
O=pathlib.Path(__file__).parent
for model,pages in [(450,[149,150,152,154]),(250,[147,148,150,152])]:
 base=json.loads((O/f'torques-{model}f-2025.json').read_text());facts=[];src=base['manual_source']
 def add(pg,ti,ri,joint,value,conditions=None,status='APPROVED'):
  facts.append({'id':f'gasgas-{model}f-2025-spec-p{pg}-t{ti+1}-r{ri+1}','property':'other','joint':joint,'value':value,'unit':None,'conditions':conditions or [],'source_url':src['link'],'locator':f'PDF page {pg}, table {ti+1}, row {ri+1}','document_sha256':src['sha256'],'document_revision':base['facts'][0]['document_revision'],'review_status':status,'review_file':'docs/research/expansion/gasgas/REVIEW.md','local_pdf_path':src['local_pdf'],'review_note':'Exact OEM worldwide standard-model table and numeric/text cell visually reviewed. No cross-model/year inheritance.','reviewer_id':'BAK-MX-GasGas-source-review','reviewed_at':'2026-09-13T00:00:00Z'})
 with pdfplumber.open(src['local_pdf']) as pdf:
  pg=pages[0];rows=pdf.pages[pg-1].extract_tables({'text_x_tolerance':1})[0];gear=False
  names=['Displacement','Stroke','Bore','Compression ratio','Valve diameter, intake','Valve diameter, exhaust','Intake at: 20 °C','Exhaust at: 20 °C','Idle speed','Primary transmission','Spark plug','Alternator']
  for ri,row in enumerate(rows):
   name,val=row
   if name.startswith('Gear ratios'):gear='All MC-F' in name
   if name in names:add(pg,0,ri,('Valve clearance, '+name if 'at: 20' in name else name),val.replace('\n',' '))
   elif gear and val and re.match(r'[1-5](st|nd|rd|th)',name):add(pg,0,ri,'Transmission tooth pair, '+name,val,status='PENDING' if 'PM' in val else 'APPROVED')
  pg=pages[1];ts=pdf.pages[pg-1].extract_tables({'text_x_tolerance':1})
  for ri,row in enumerate(ts[0]):
   if row[0] in ['Plug gap of spark plug','idle speed']:add(pg,0,ri,row[0],row[-1])
  for ri,row in enumerate(ts[1]):
   if row[-1] and row[0]:add(pg,1,ri,re.sub(r'\(p\. \d+\)','',row[0]).replace('\n',' '),row[-1],['OEM capacity table; complete service fill/check procedure still applies'])
  context=''
  for ri,(name,val) in enumerate(ts[2]):
   if val is None:context=name;continue
   if name in ['front','rear']:
    if 'EX' not in context:add(pg,2,ri,context+', '+name,val)
   elif name=='(All MC-F models)':add(pg,2,ri,context+', standard MC-F',val)
   elif name in ['Triple clamp offset','Steering head angle','Chain']:add(pg,2,ri,name,val)
  pg=pages[2];ts=pdf.pages[pg-1].extract_tables({'text_x_tolerance':1})
  add(pg,0,0,'Battery identity',ts[0][0][1]);add(pg,0,1,'Battery rated voltage and capacity','12 V; 2.0 Ah',['Lithium-ion, HJTZ5S-FP-C'])
  for ri,r in enumerate(ts[1]):add(pg,1,ri,'Fuse part '+r[1],r[2])
  add(pg,3,0,'Standard fork part number',ts[3][0][1])
  for ti,prefix in [(4,'Standard fork')]:
   context=''
   for ri,(name,val) in enumerate(ts[ti]):
    if val is None:context=name;continue
    joint=prefix+', '+(context+', ' if name in ['Comfort','Standard','Sport'] else '')+name;add(pg,ti,ri,joint,val,['Damping click counts require the corresponding OEM adjustment reference direction'] if name in ['Comfort','Standard','Sport'] else [])
  context=''
  for ri,(name,val) in enumerate(ts[5]):
   if val is None:context=name;continue
   clean='240 ml nominal, +10/-50 ml tolerance' if '240' in val else val
   add(pg,5,ri,'Standard fork, '+context,clean,[re.sub(r'\(p\. \d+\)','',name),'Exact fork service procedure applies'])
  pg=pages[3];ts=pdf.pages[pg-1].extract_tables({'text_x_tolerance':1});add(pg,1,0,'Standard shock part number',ts[1][0][1]);context=''
  for ri,(name,val) in enumerate(ts[2]):
   if val is None:context=name;continue
   joint='Standard shock, '+(context+', ' if name in ['Comfort','Standard','Sport'] or name.startswith('Weight of rider') else '')+name
   add(pg,2,ri,joint,val,['Damping click/turn counts require the corresponding OEM adjustment reference direction'] if name in ['Comfort','Standard','Sport'] else [])
 base.update(facts=facts,assemblies=[],parts=[],mappings=[],catalog_complete=False,gaps=['Workshop service conditions and part mappings are tracked separately.']+(['OEM2025MC450F first gear printed as time 2:28 PM; no numerical correction inferred.'] if model==450 else []))
 (O/f'specs-{model}f-2025.json').write_text(json.dumps(base,indent=2,ensure_ascii=False)+'\n');print(model,len(facts))
