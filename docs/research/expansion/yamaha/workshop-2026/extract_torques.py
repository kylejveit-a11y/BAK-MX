import pdfplumber,json,hashlib,re,pathlib
out=pathlib.Path(__file__).parent
discovery=json.loads((out.parent/'2026-yz450f-discovery-20260913.json').read_text());doc=discovery['documents'][0]
for code,model,year,start,revision in [('D03','YZ450F',2026,56,doc['document_revision'])]:
 publication='D03-2819U-10';pdfpath=doc['local_pdf_path'];sha=hashlib.sha256(open(pdfpath,'rb').read()).hexdigest();facts=[]
 assert sha==doc['document_sha256']
 with pdfplumber.open(pdfpath) as pdf:
  for pn in range(start,start+7):
   table=max(pdf.pages[pn].extract_tables(),key=len)
   assert len(table[0])==5,(code,pn,table[0])
   for rownum,row in enumerate(table[1:],1):
    joint,thread,qty,torque,remarks=[' '.join((v or '').replace('-\n','').split()) for v in row]
    assert joint and thread and qty.isdigit(),(code,pn,row)
    cond=['OEM general rule (PDF page 56; printed 2-9): components at room temperature; clean dry threads unless a specific instruction requires otherwise; multi-fastener assemblies use progressive crisscross tightening unless a specified sequence overrides it.', 'Exact OEM joint and stock configuration only; consult linked service procedure for order, tool and replacement requirements.']
    if 'LT' in remarks:cond.append('Apply locking agent (LOCTITE); grade and application location require the joint procedure, not inferred from the table.')
    if re.search(r'\bE\b',remarks):cond.append('Engine-oil lubrication is specified by the table; use joint procedure for application location.')
    if re.search(r'\bM\b',remarks):cond.append('Molybdenum disulfide grease specified by the table; use joint procedure for application location.')
    if 'LS' in remarks:cond.append('Lithium-soap-based grease specified; use joint procedure for application location.')
    if 'Stake' in remarks:cond.append('Stake the nut after tightening according to the service procedure.')
    if 'lock washer' in remarks:cond.append('Use the specified lock washer.')
    if '\uf072' in remarks or '△' in remarks or re.search(r'\br\b',remarks):cond.append('Check tightening after break-in or before each race, per table marking.')
    status='APPROVED'; prop='torque'; unit='N·m';val=None;note='Rendered OEM table visually reviewed; source identity explicitly US publication for exact model/year. Numerical data only; no catalog part mapping inferred. This review covers the specification table; detailed joint-procedure reconciliation remains a separate task.'
    if torque=='See TIP.':
     prop='installation';unit=None
     if joint=='Lower ring nut':val='Approximately 38 N·m initial seating; loosen one revolution; retighten to 7 N·m using steering nut wrench.';cond.append('Do not use 38 N·m as final service torque.')
     elif joint=='Primary drive gear nut':
      prop='torque';unit='N·m';val=170.0;cond.append('First remove oil from crankshaft threads, washer contact surface, and nut threads/contact surface; then apply molybdenum disulfide grease to those same surfaces. PDF page 60; printed 2-13. Do not inherit 2025 130 N·m.')
     elif model=='YZ250F':
      val='30 N·m initial ordered pass; individually remove and retighten each bolt to 15 N·m + 60 degrees; then all bolts another 60 degrees in source order.'
      status='CONFLICTED';cond.append('Table symbol specifies molybdenum disulfide grease; procedure TIP specifies molybdenum disulfide oil. Lubricant unresolved; do not present as installation-ready.');note='Source-internal lubricant contradiction; manufacturer clarification or superseding documentation required.'
     elif code=='B2W':
      val='40 N·m in specified order; remove bolts; retighten to 23 N·m in specified order; then 90 degrees diagonally, followed by 60 degrees in specified order.'
      cond.append('Molybdenum disulfide grease on threads, seats and both washer faces during both tightening passes. Illustrated sequence is required.')
     else:
      val='36 N·m initial ordered pass; individually remove and retighten each bolt to 18 N·m + 90 degrees; then all bolts another 60 degrees in source order.'
      cond.append('Molybdenum disulfide grease on threads, seats and both faces of plain washers at both passes. Preserve illustrated order; do not loosen all bolts together.')
    else:
     m=re.match(r'([\d.]+) N·m',torque);assert m,(code,pn,row);val=float(m[1])
    locator=f'PDF page {pn+1}; printed 2-{10+pn-start}; '+joint+'; thread '+thread
    if torque=='See TIP.':locator+=f'; TIP printed 2-{(16 if code in ["D01","D02","DR8","D03"] else 15) if joint=="Lower ring nut" else (13 if joint=="Primary drive gear nut" else 12)}'
    facts.append(dict(id=f'yamaha-{model.lower()}-{year}-torque-{len(facts)+1:03d}',property=prop,joint=joint,thread=thread,joint_quantity=int(qty),value=val,unit=unit,conditions=cond,source_url=f'https://library.ymcapps.net/library/om/contents/pdf/10/{publication}_02.pdf',locator=locator,document_sha256=sha,document_revision=revision,review_status=status,review_note=note,raw_remarks=remarks))
 target=dict(manufacturer='Yamaha',model=model,model_year=year,variant='standard',region='US')
 result=dict(local_pdf_path=pdfpath,target=target,assemblies=[],parts=[],facts=facts,mappings=[],gaps=['Catalog inventory not complete.','Torque table values are joint-level facts; part-number mapping remains separate.','Detailed engine, frame teardown and fork/shock rebuild procedure extraction incomplete; no cross-year inheritance.'],catalog_complete=False,scope_confirmed=True,review_basis='All seven full torque-table pages 57-63 and symbol legend page 7 visually inspected; exact US publication cover and copyright text inspected. Facts-only extraction, no source/manual redistribution.')
 existing=out/f'{year}-{model.lower()}.json'
 if existing.exists():
  old=json.loads(existing.read_text())
  for key in ['assemblies','parts','catalog_manifest','catalog_scope_confirmed']:
   if key in old:result[key]=old[key]
 assert len(facts)==163, len(facts)
 (out/f'{year}-{model.lower()}-torques.json').write_text(json.dumps(result,indent=2)+'\n')
 print(code,len(facts),sum(f['review_status']=='APPROVED' for f in facts),sha)

