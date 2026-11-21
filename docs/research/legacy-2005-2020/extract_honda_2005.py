"""Reproduce bounded 2005 candidates from three exact Honda PDFs; never imports/promotes.
Usage: python extract_honda_2005.py /temporary/pdf/directory
Requires pdfplumber. See REVIEW.md for visual checks and deliberate exclusions.
"""
import sys,json,hashlib,re,pathlib,datetime
import pdfplumber
OUT=pathlib.Path(__file__).parent
SRC=pathlib.Path(sys.argv[1]); now=datetime.datetime.now(datetime.timezone.utc).isoformat()
JOBS=[('CRF250R','crf250r',143),('CRF450R','crf450r',147),('CR85R','cr85r_rb',111),('CR85RB','cr85r_rb',112)]
issues=[]; manifest=[]
for model,stem,page in JOBS:
 file=SRC/f'2005_{stem}.pdf'; sha=hashlib.sha256(file.read_bytes()).hexdigest(); pdf=pdfplumber.open(file)
 cover=pdf.pages[0].extract_text(); assert '2005' in cover and ('CR85/85RB' if stem=='cr85r_rb' else model) in cover
 url=f'https://owners.honda.com/assets/ownerlink/model/own_man/powersports/2005/2005_{stem}.pdf'
 rev=f'2005 Honda {"CR85/85RB EXPERT" if stem=="cr85r_rb" else model} Owner’s Manual & Competition Handbook'
 facts=[]
 def add(joint,value,unit=None,pg=page,conditions=None):
  if not value: raise ValueError(joint)
  fid='honda-2005-'+model.lower()+'-spec-'+re.sub('[^a-z0-9]+','-',joint.lower()).strip('-')
  assert fid not in [f['id'] for f in facts],fid
  facts.append({'id':fid,'property':'dimensions' if joint.startswith('Dimension /') or unit=='mm' else 'other','joint':joint,'value':value,'unit':unit,'conditions':['Exact 2005 US stock model only; no cross-year or aftermarket inheritance.']+(conditions or []),'source_url':url,'locator':f'PDF page {pg}; printed page {pg-4}','document_sha256':sha,'document_revision':rev,'retrieved_at':now,'review_status':'PENDING','review_note':'Source page visually inspected; candidate only, cross-corpus conflict and independent promotion review pending.','reviewer_id':'codex-source-inspection-20261016','approval_reference':None})
 for table in pdf.pages[page-1].extract_tables():
  section=None; skip_follow=False
  for raw in table[1:]:
   label=raw[0]; vals=raw[-2:]
   if not label: continue # merged capacities and spark-plug variants handled explicitly below
   label=' '.join(label.split())
   if label in ['Dimension','Frame','Engine','Carburetor','Drive train','Electrical']: section=label;continue
   if label.startswith(('Engine oil capacity','Transmission oil','Spark plug')):continue
   if not any(vals):
    if label=='Type Piston valve': label='Type'; vals=['Piston valve',None]
    elif label=='Identification number FCR01B':label='Identification number';vals=['FCR01B',None]
    else:issues.append({'model':model,'page':page,'issue':'unparsed row','label':label});continue
   if label.startswith('Fork oil'):
    issues.append({'model':model,'page':page,'issue':'Fork oil requires adjustment-section reconciliation; retained as gap, not published'});continue
   if 'suspension' in label or 'tire size' in label or 'brake, swept' in label:
    issues.append({'model':model,'page':page,'issue':'Compound specification row deferred for atomic extraction and procedure conditions','label':label});continue
   val=' '.join((vals[1] or vals[0]).split())
   if label=='Fuel capacity': val={'CRF250R':'7.3','CRF450R':'7.2','CR85R':'5.3','CR85RB':'5.3'}[model]; unit='L'
   else:
    unit=None
    m=re.fullmatch(r'(.+?)\s*(mm|kg|cm3|liter)',val)
    if m:val=m[1].replace(',','');unit={'cm3':'cm³','liter':'L'}.get(m[2],m[2])
   if label=='lgnition':label='Ignition'
   add(section+' / '+label,val,unit)
 # Explicit merged-cell mapping checked against page image; no guessing from extraction order.
 if model.startswith('CRF'):
  for lab,val in [('After draining','660'),('After draining and oil filter change','690'),('After disassembly','850')]:add('Engine / Engine oil capacity / '+lab,val,'cm³')
  if model=='CRF450R':
   for lab,val in [('After draining','590'),('After disassembly','670')]:add('Engine / Transmission oil capacity / '+lab,val,'cm³')
  else:
   add('Engine / Transmission oil capacity / After disassembly','700','cm³')
   issues.append({'model':model,'page':page,'issue':'After-draining transmission oil row prints 0.63 Imp qt alongside 600 cm3; incompatible conversion. Entire row withheld pending procedure reconciliation.'})
  plugs= [('Standard NGK','R0409 B-8'),('Extended high speed NGK','R0409 B-9')] if model=='CRF250R' else [('Standard NGK','IFR8H11'),('Standard DENSO','VK24PRZ11'),('Extended high speed NGK','IFR9H11'),('Extended high speed DENSO','VK27PRZ11')]
  for lab,val in plugs:add('Electrical / Spark plug / '+lab,val)
  front,rear,sag=(98,112,113) if model=='CRF250R' else (102,116,117)
  entries=[('Front rebound damping STD','8' if model=='CRF250R' else '7','click',front),('Front compression damping STD','10','click',front),('Rear high speed compression STD','1.75–2.25' if model=='CRF250R' else '1.5–2','turn',rear),('Rear low speed compression STD','7' if model=='CRF250R' else '6','click',rear),('Rear rebound damping STD','9' if model=='CRF250R' else '7–10','click',rear)]
  for lab,val,unit,pg in entries:add('Suspension / '+lab,val,unit,pg,['Counterclockwise out from gently seated full-hard position; retain factory range where given.','Set both fork legs equally for front settings; align shock adjuster punch marks for rear settings.'])
  add('Suspension / Standard race sag','100','mm',sag,['Normal racing weight including fuel and fluids; rider wearing normal protective gear; use the manual measurement procedure.'])
 else:
  add('Engine / Transmission oil capacity / After draining','550','cm³');add('Engine / Transmission oil capacity / At disassembly','600','cm³')
  add('Electrical / Spark plug / Standard','NGK BR10EG')
  for lab,val in [('Rear compression damping STD','1.75' if model=='CR85R' else '0.75'),('Rear rebound damping STD','1.25' if model=='CR85R' else '0.5')]:
   add('Suspension / '+lab,val,'turn',85,['Approximate turns counterclockwise from gently seated full-hard position; align punch and reference marks.'])
  add('Suspension / Standard race sag','85','mm',86,['Normal racing weight; rider in protective gear. Standard figure only; contradictory tuning example excluded.'])
  issues.append({'model':model,'page':86,'issue':'Standard sag is 85 mm but text calls 90 mm a decrease. The tuning example is excluded; standard figure agrees with arithmetic example.'})
 target={'manufacturer':'Honda','model':model,'model_year':2005,'variant':'standard','region':'US'}
 out={'target':target,'assemblies':[],'parts':[],'facts':facts,'mappings':[]}
 (OUT/f'2005-{model.lower()}-candidates.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 manifest.append({'target':target,'file':f'2005-{model.lower()}-candidates.json','source_url':url,'document_sha256':sha,'document_revision':rev,'pdf_pages':len(pdf.pages),'retrieved_at':now,'facts':len(facts),'status':'CANDIDATES_ONLY','database_imported':False,'source_pdf_redistributed':False})
(OUT/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(OUT/'issues.json').write_text(json.dumps(issues,indent=2)+'\n')
print(json.dumps({'models':len(manifest),'candidate_facts':sum(x['facts'] for x in manifest),'issues':len(issues),'per_model':{x['target']['model']:x['facts'] for x in manifest}},indent=2))
