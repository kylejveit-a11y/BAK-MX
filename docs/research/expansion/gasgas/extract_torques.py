import json,re,pathlib,pdfplumber,hashlib
OUT=pathlib.Path(__file__).parent
for meta in sorted(OUT.glob('manual-*.json')):
 d=json.loads(meta.read_text());ms=d.get('manuals',[])
 if not ms:continue
 m=ms[0];path=m['local_pdf'];texts=pathlib.Path(path[:-4]+'.txt').read_text().split('\f');year=d['year'];model=d['model'];scope=any(' WW ' in z['title'] for z in ms)
 revision=' / '.join(re.findall(r'\b321\d+en\b|\b\d{1,2}/\d{1,2}/202\d\b|\b\d{2}/202\d\b',texts[2])[-2:]);facts=[]
 with pdfplumber.open(path) as pdf:
  for i,page in enumerate(pdf.pages):
   if i<len(pdf.pages)*.7:continue
   if 'Nm' not in texts[i]:continue
   for ti,table in enumerate(page.extract_tables({'text_x_tolerance':1})):
    if sum('Nm' in (r[-1] or '') for r in table)<3:continue
    ri=0
    while ri<len(table):
     row=table[ri];start=ri;ri+=1
     if not row[0]:continue
     left=row[0];right=row[-1] or '';thread='';steps=[]
     while ri<len(table) and table[ri][0] is None:
      right+='; '+str(table[ri][-1] or '');steps.append(table[ri][-1]);ri+=1
     if 'Nm' not in right:continue
     if len(row)==3 and row[1] and not re.match(r'\d+\.',row[1]):thread=row[1]
     else:
      lines=left.splitlines();t=[x for x in lines if re.match(r'^(M\d|EJOT)',x)]
      if t:thread=t[0];left=left.replace(thread,'').strip()
     name=re.sub(r'-\n(?=[a-z])','',left).replace('\n',' '); vals=[float(x.replace(',','.')) for x in re.findall(r'(\d+(?:[.,]\d+)?)\s*Nm',right)]
     if not vals:continue
     variant_excluded=bool(re.search(r'FACTORY|PRADO|\(EX.?F\)',name))
     cond=[]
     if thread:cond.append('Thread/size: '+thread)
     for x in re.findall(r'Loctite[^\d]*(\d+)',right):cond.append('Loctite '+x)
     if 'Engine oil' in left or re.search('oil|lubricat',right,re.I):cond.append('Oil/lubrication instruction requires exact procedure review: '+right)
     if 'LH' in thread:cond.append('Left-hand thread')
     if 'remaining' in name.lower():cond.append('Only remaining fasteners after all named exceptions; not a generic thread-size default')
     staged=steps or 'stage' in right.lower() or '1.' in right
     if len(vals)>1:cond.append('Ordered tightening stages' if staged else 'Specified range')
     fact={'id':f'gasgas-{model.split()[1].lower()}-{year}-torque-p{i+1}-t{ti+1}-r{start+1}','property':'torque','joint':name,'value':vals if len(vals)>1 else vals[0],'unit':'Nm','conditions':cond,'source_url':m['link'],'locator':f'PDF page {i+1}, table {ti+1}, row {start+1}','document_sha256':m['sha256'],'document_revision':revision,'source_value_text':right,'source_thread':thread,'review_status':'EXCLUDED_VARIANT' if variant_excluded else 'PENDING','review_note':'OEM table extracted; per-row visual validation, US applicability and part mapping pending.','scope_worldwide_portal':scope}
     facts.append(fact)
 obj={'target':{'manufacturer':'GasGas','model':model,'model_year':year,'variant':'standard','region':'US'},'scope_confirmed':False,'catalog_complete':False,'assemblies':[],'parts':[],'facts':facts,'mappings':[],'gaps':['Torque extraction requires row review before promotion.'],'manual_source':m,'manual_portal_url':d['portal_url']}
 (OUT/f"torques-{model.split()[1].lower()}-{year}.json").write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n');print(year,model,len(facts),scope)
