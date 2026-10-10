import pdfplumber,json,hashlib,re,pathlib
out=pathlib.Path(__file__).parent
for code,model,year,start,revision in [('B7B','YZ250F',2022,54,'B7B-2819U-13 / LIT-11626-35-11; First edition April 2021'),('B2W','YZ450F',2022,54,'B2W-2819U-12 / LIT-11626-35-03; First edition March 2021'),('BSB','YZ250F',2023,52,'BSB-2819U-10 / LIT-11626-36-26; First edition March 2022'),('BMF','YZ250F',2024,56,'BMF-2819U-10 / LIT-11626-37-44; First edition June 2023'),('BHR','YZ450F',2023,54,'BHR-2819U-10 / LIT-11626-36-32; First edition July 2022'),('BHR11','YZ450F',2024,54,'BHR-2819U-11 / LIT-11626-37-11; First edition February 2023'),('D01','YZ250F',2025,58,'D01-2819U-10 / LIT-11626-38-27; First edition April 2024'),('D02','YZ450F',2025,56,'D02-2819U-10 / LIT-11626-38-16; First edition March 2024'),('DR8','YZ250F',2026,58,'DR8-2819U-10 / LIT-11626-39-37; First edition May 2025')]:
 publication={'B2W':'B2W-2819U-12','B7B':'B7B-2819U-13','BHR11':'BHR-2819U-11'}.get(code,code+'-2819U-10'); pdfpath='/tmp/'+(publication if code in ['B2W','B7B','BHR11','D01','D02','DR8'] else code)+'.pdf'; sha=hashlib.sha256(open(pdfpath,'rb').read()).hexdigest();facts=[]
 with pdfplumber.open(pdfpath) as pdf:
  for pn in range(start,start+(7 if code in ['D01','D02','DR8'] else 6)):
   table=max(pdf.pages[pn].extract_tables(),key=len)
   assert len(table[0])==5,(code,pn,table[0])
   for rownum,row in enumerate(table[1:],1):
    joint,thread,qty,torque,remarks=[' '.join((v or '').replace('-\n','').split()) for v in row]
    assert joint and thread and qty.isdigit(),(code,pn,row)
    cond=['Exact OEM joint and stock configuration only; consult linked service procedure for order, tool and replacement requirements.']
    if 'LT' in remarks:cond.append('Apply locking agent (LOCTITE); grade and application location require the joint procedure, not inferred from the table.')
    if re.search(r'\bE\b',remarks):cond.append('Engine-oil lubrication is specified by the table; use joint procedure for application location.')
    if re.search(r'\bM\b',remarks):cond.append('Molybdenum disulfide grease specified by the table; use joint procedure for application location.')
    if 'LS' in remarks:cond.append('Lithium-soap-based grease specified; use joint procedure for application location.')
    if 'Stake' in remarks:cond.append('Stake the nut after tightening according to the service procedure.')
    if 'lock washer' in remarks:cond.append('Use the specified lock washer.')
    if '\uf072' in remarks or '△' in remarks or re.search(r'\br\b',remarks):cond.append('Check tightening after break-in or before each race, per table marking.')
    status='APPROVED'; prop='torque'; unit='N·m';val=None;note='Rendered OEM table visually reviewed; source identity explicitly US publication for exact model/year. Numerical data only; no catalog part mapping inferred. No conflicting same-scope value found in prior approved Yamaha facts.'
    if torque=='See TIP.':
     prop='installation';unit=None
     if joint=='Lower ring nut':val='Approximately 38 N·m initial seating; loosen one revolution; retighten to 7 N·m using steering nut wrench.';cond.append('Do not use 38 N·m as final service torque.')
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
    if torque=='See TIP.':locator+=f'; TIP printed 2-{(16 if code in ["D01","D02","DR8"] else 15) if joint=="Lower ring nut" else 12}'
    facts.append(dict(id=f'yamaha-{model.lower()}-{year}-torque-{len(facts)+1:03d}',property=prop,joint=joint,thread=thread,joint_quantity=int(qty),value=val,unit=unit,conditions=cond,source_url=f'https://library.ymcapps.net/library/om/contents/pdf/10/{publication}_02.pdf',locator=locator,document_sha256=sha,document_revision=revision,review_status=status,review_note=note,raw_remarks=remarks))
 target=dict(manufacturer='Yamaha',model=model,model_year=year,variant='standard',region='US')
 result=dict(local_pdf_path=pdfpath,target=target,assemblies=[],parts=[],facts=facts,mappings=[],gaps=['Catalog inventory not complete.','Torque table values are joint-level facts; part-number mapping remains separate.','2026 YZ450F manual remains unacquired; no cross-year inheritance.'],catalog_complete=False,scope_confirmed=True,review_basis='All six or seven full torque-table pages and symbol legend visually inspected; exact US publication cover and copyright text inspected. Facts-only extraction, no source/manual redistribution.')
 existing=out/f'{year}-{model.lower()}.json'
 if existing.exists():
  old=json.loads(existing.read_text())
  for key in ['assemblies','parts','catalog_manifest','catalog_scope_confirmed']:
   if key in old:result[key]=old[key]
 (out/f'{year}-{model.lower()}.json').write_text(json.dumps(result,indent=2)+'\n')
 print(code,len(facts),sum(f['review_status']=='APPROVED' for f in facts),sha)
