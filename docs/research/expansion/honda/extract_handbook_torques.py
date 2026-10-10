from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).parent
catalog=json.loads((ROOT/'honda-official-manual-catalog.json').read_text())['documents']
for d in catalog:
 if d['type']!='COMPETITION_HANDBOOK':continue
 year,model=d['model_year'],d['model'];pdf=Path(f'/tmp/{year}-{model}-ch.pdf');txt=Path(str(pdf)+'.txt')
 if not txt.exists():continue
 pages=txt.read_text().split('\f');records=[];unparsed=[]
 start=next(i for i,p in enumerate(pages) if 'STANDARD TORQUE VALUES' in p)
 end=start+1
 while 'LUBRICATION POINTS' not in pages[end]:end+=1
 for pi in range(start,end):
  lines=pages[pi].splitlines(); enabled=pi>start;prev=None
  for line in lines:
   if 'ENGINE & FRAME TORQUE VALUES' in line:enabled=True
   if not enabled:continue
   m=re.match(r'^\s*(\S.*?)\s{2,}(\d+)\s+(BC[\d.]+|[\d.]+)\s+([\d.]+)\s+\([^)]*\)\s*(.*)$',line)
   if m:
    joint,qty,thread,value,note=m.groups();joint=' '.join(joint.split())
    if joint.startswith('CRF') or re.search(r'CRF\d+RX',joint) and '/' not in joint or ('(CRF250RWE)' in joint):prev=None;continue
    joint=re.sub(r'\s+CRF\d+R(?:/(?:RWE)?)?$','',joint)
    if joint=='Radiator shroud upper':joint+=' bolt'
    joint=re.sub(r'\s*\(CRF\d+R/(?:RX|RWE)\)','',joint)
    row={'id':f'honda-{year}-{model.lower()}-torque-'+re.sub(r'[^a-z0-9]+','-',joint.lower()).strip('-'),'property':'torque','joint':joint,'value':float(value),'unit':'N·m','thread_diameter':thread,'manual_quantity':int(qty),'conditions':[note] if note else [],'source_url':d['url'],'locator':f'PDF page {pi+1}; printed '+('2-3' if pi==start else f'2-{3+pi-start}')+'; ENGINE & FRAME TORQUE VALUES','document_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'document_revision':d['title'],'review_status':'PENDING','review_note':'Exact-year OEM publication. Named fastener only. Associated procedure and catalog occurrence mapping remain required.'}
    records.append(row);prev=row
   elif prev and line.strip():
    # Only far-right remark column continuation; keep complete assembly conditions.
    tail=line.strip() if len(line)-len(line.lstrip())>=70 else ''
    if tail and not re.search(r'TORQUE|REMARKS|N·m|lbf',tail) and not re.fullmatch(r'\d-\d+',tail):prev['conditions'].append(tail)
    left=line[:50].strip()
    if left in ('screw','screws'):prev['joint']+=' '+left
    if left=='(CRF250RWE)':records.remove(prev);prev=None
  
 unique={}
 for r in records:
  r['conditions']=[' '.join(r['conditions'])] if r['conditions'] else []
  r['conditions']+=['Use OEM installation procedure; torque alone is not a complete service instruction.']
  if r['id'] in unique:
   old=unique[r['id']]
   if old['value']!=r['value']:old['review_status']='CONFLICTED';old['review_note']+=' Duplicate torque disagreement.'
   old.setdefault('additional_locators',[]).append(r['locator'])
  else:unique[r['id']]=r
 target={'manufacturer':'Honda','model':model,'model_year':year,'variant':'standard','region':'US'}
 result={'target':target,'assemblies':[],'parts':[],'facts':list(unique.values()),'mappings':[],'gaps':['Parts catalog enumeration and exact occurrence mapping incomplete.','These named fasteners do not cover every engine or chassis fastener.','Raw table extraction requires visual review before promotion.'],'catalog_complete':False,'scope_confirmed':True,'source_document':{'url':d['url'],'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'bytes':pdf.stat().st_size,'torque_pdf_pages':list(range(start+1,end+1))}}
 (OUT/f'{year}-{model.lower()}.json').write_text(json.dumps(result,indent=2)+'\n');print(year,model,len(result['facts']))
