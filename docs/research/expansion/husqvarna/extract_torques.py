import pdfplumber,pathlib,json,re,hashlib
OUT=pathlib.Path(__file__).parent;TMP=pathlib.Path('/tmp/hq-manuals')
def clean(s):
 return re.sub(r'\s+',' ',(s or '').replace('-\n','').replace('\n',' ')).strip()
for meta in OUT.glob('manual-fc-*.json'):
 m=json.loads(meta.read_text());pdf=pdfplumber.open(m['temporary_pdf']);target=m['target'];name=f"fc-{target['model'].split()[1]}-{target['model_year']}";facts=[];pages=[];domain='unknown'
 scope=pdf.pages[2].extract_text(x_tolerance=1);m['scope_page']=3;m['scope_excerpt']=scope[scope.find('This document'):];m['document_revision']=m['scope_excerpt'].splitlines()[-1];m['document_article']=re.findall(r'\d{7}en',scope)[-1] if re.findall(r'\d{7}en',scope) else None
 for i in range(100,len(pdf.pages)):
  p=pdf.pages[i];text=p.extract_text(x_tolerance=1)
  # Dedicated specification pages only; row content independently checked below.
  if not re.search('TECHNICAL DATA|Technical specifications',text,re.I):continue
  for tab in p.find_tables():
   rows=tab.extract(x_tolerance=1);valid=[r for r in rows if r and len(r)>=2 and r[-1] and re.search(r'\d\s*N\s*m',r[-1])]
   if len(valid)<3 or len(valid)<len(rows)*.7:continue
   before=p.crop((0,0,p.width,tab.bbox[1])).extract_text(x_tolerance=1) or ''
   headings=re.findall(r'(engine|chassis)\s+tightening torques',before,re.I)
   if headings:domain=headings[-1].lower()
   if i+1 not in pages:pages.append(i+1)
   for ridx,r in enumerate(rows):
    if not r or len(r)<2 or not r[-1] or not re.search(r'\d\s*N\s*m',r[-1]):continue
    if len(r)==3 and re.match(r'^(?:M\d|EJOT|K\d|PT)',clean(r[1])):joint=clean(r[0]);thread=clean(r[1]);right=r[2]
    else:
     left=(r[0] or '').splitlines();threadline=next((z for z in left if re.match(r'^(?:M\d|EJOT|K\d|PT)',z.strip())), '');thread=threadline.strip();joint=clean('\n'.join(z for z in left if z!=threadline and 'Engine oil' not in z));right=r[-1]
    if not joint:continue
    vals=re.findall(r'(\d+(?:[.,]\d+)?(?:\s*[–…−-]\s*\d+(?:[.,]\d+)?)?)\s*N\s*m',right)
    degrees=re.findall(r'(\d+)\s*°',right);lock=re.findall(r'Loctite\s*[®]?\s*(\d+)',right)
    conditions=['Thread: '+thread];conditions+=['Loctite '+v for v in lock]
    if re.search(r'oil',right,re.I):conditions.append(clean(right[right.lower().find('oil')-30:]))
    if (len(vals)>1 and not re.search(r'Nm\s*[.…–-]+\s*\d',right)) or degrees:conditions.append('Tightening stages must be followed in source order; sequence/procedure separately required.')
    if joint.lower().startswith('remaining'):conditions.append('Only remaining fasteners in named system; specific joint exceptions take precedence.')
    value=float(vals[0].replace(',','.')) if len(vals)==1 and re.fullmatch(r'\d+(?:[.,]\d+)?',vals[0]) and not degrees else {'torque_stages_Nm':vals,'angle_stages_degrees':degrees,'source_stage_cell':clean(right)}
    variant_exception=bool(re.search(r'\bFX\b|Factory|Rockstar|Heritage',joint))
    facts.append({'id':name+'-torque-'+str(i+1)+'-'+str(ridx+1)+'-'+str(len(facts)+1),'property':'torque','joint':joint,'thread':thread,'domain':domain,'value':value,'unit':'Nm','conditions':conditions,'source_url':m['selected']['link'],'locator':f"PDF page {i+1}, torque table row {ridx+1}: {joint}",'document_sha256':m['document_sha256'],'document_revision':m['document_article']+' / '+m['document_revision'],'review_status':'PENDING','review_note':'OEM table extracted; visual review and exact standard-model applicability confirmation pending.','source_value_cell':clean(right),'source_row':r,'excluded_variant_candidate':variant_exception})
 m['torque_table_pdf_pages']=pages;meta.write_text(json.dumps(m,indent=2)+'\n');(OUT/(name+'-torques.json')).write_text(json.dumps({'target':target,'facts':facts,'scope_confirmed':m['scope_confirmed_by_selector'],'catalog_complete':False,'source_metadata':m},indent=2)+'\n');print(name,len(facts),pages,flush=True)
