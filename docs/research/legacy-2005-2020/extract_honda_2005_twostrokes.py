"""Exact 2005 CR125R/CR250R specification candidates; no import or approval."""
import pathlib,json,hashlib,re,sys,datetime
import pdfplumber
out=pathlib.Path(__file__).parent; src=pathlib.Path(sys.argv[1]); manifests=[]
for model in ['CR125R','CR250R']:
 f=src/f'2005_{model.lower()}.pdf';sha=hashlib.sha256(f.read_bytes()).hexdigest();pdf=pdfplumber.open(f)
 assert '2005' in pdf.pages[0].extract_text() and model in pdf.pages[0].extract_text()
 url=f'https://owners.honda.com/assets/ownerlink/model/own_man/powersports/2005/{f.name}'
 target=dict(manufacturer='Honda',model=model,model_year=2005,variant='standard',region='US');facts=[]
 def add(joint,value,unit=None):
  facts.append(dict(id='honda-2005-'+model.lower()+'-spec-'+re.sub('[^a-z0-9]+','-',joint.lower()).strip('-'),property='dimensions' if unit=='mm' else 'other',joint=joint,value=value,unit=unit,conditions=['Exact 2005 US stock model only; no cross-year or aftermarket inheritance.'],source_url=url,locator='PDF page 127; printed page 123',document_sha256=sha,document_revision=f'2005 Honda {model} Owner’s Manual & Competition Handbook',retrieved_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),review_status='PENDING',review_note='Specification page visually inspected. Independent review and procedure reconciliation pending.',reviewer_id='codex-source-inspection-20261016',approval_reference=None))
 for table in pdf.pages[126].extract_tables():
  section=None
  for raw in table[1:]:
   if not raw[0]:continue
   label=' '.join(raw[0].split())
   if label in ['Dimension','Frame','Engine','Carburetor','Drive train','Electrical']:section=label;continue
   if label.startswith(('Transmission oil','Spark plug','Fork oil')) or 'suspension' in label or 'tire size' in label or 'brake, swept' in label:continue
   value=' '.join((raw[-1] or raw[-2]).split());unit=None
   match=re.fullmatch(r'(.+?)\s*(mm|kg|cm3|liter)',value)
   if match:value=match[1].replace(',','');unit={'cm3':'cm³','liter':'L'}.get(match[2],match[2])
   if label=='lgnition':label='Ignition'
   add(section+' / '+label,value,unit)
 for label,value in [('After draining','0.57' if model=='CR125R' else '0.65'),('After disassembly','0.65' if model=='CR125R' else '0.70')]:add('Engine / Transmission oil capacity / '+label,value,'L')
 plugs=[('Standard NGK','BR9EG'),('Standard DENSO','W27ESR-V'),('Optional NGK','BR9EV'),('Optional DENSO','W27ESR-G')] if model=='CR125R' else [('Standard NGK','BR9EG-N-8')]
 for label,value in plugs:add('Electrical / Spark plug / '+label,value)
 filename=f'2005-{model.lower()}-candidates.json'
 (out/filename).write_text(json.dumps(dict(target=target,assemblies=[],parts=[],facts=facts,mappings=[]),ensure_ascii=False,indent=2)+'\n')
 manifests.append(dict(target=target,file=filename,source_url=url,document_sha256=sha,pdf_pages=len(pdf.pages),facts=len(facts),status='CANDIDATES_ONLY',database_imported=False,source_pdf_redistributed=False))
(out/'twostroke-source-manifest.json').write_text(json.dumps(manifests,indent=2)+'\n')
print([(m['target']['model'],m['facts']) for m in manifests])
