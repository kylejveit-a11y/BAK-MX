"""Bounded dimensions/curb-weight extraction; exact source per year, PENDING only.
Run with a directory containing source-discovery.json and the named PDFs.
No maintenance values or cross-country model rows are extracted.
"""
import pathlib,sys,json,re,hashlib,datetime
import fitz
src=pathlib.Path(sys.argv[1]);out=pathlib.Path(__file__).parent/'yamaha';out.mkdir(exist_ok=True)
manifest=[]
for r in sorted(json.loads((src/'source-discovery.json').read_text()),key=lambda r:(r['year'],r['model'])):
 if r['manufacturer']!='Yamaha' or 'general_spec_page' not in r:continue
 model=r['model'];year=r['year'];f=src/f'{year}_{model.lower()}.pdf';data=f.read_bytes();assert hashlib.sha256(data).hexdigest()==r['sha256']
 pdf=fitz.open(f);pg=r['general_spec_page'];t=pdf[pg-1].get_text();facts=[]
 # These exact reviewed pages list the US MX model before its X counterpart.
 # YZ250 grouped model blocks: take only first MX dimension block.
 text=t
 if model=='YZ250':
  dims=t[t.index('Dimensions'):];end=dims.index('YZ250X');text=dims[:end]+'\n'+t[t.index('Weight:'):]
 for label in ['Overall length','Overall width','Overall height','Seat height','Wheelbase','Ground clearance','Curb weight']:
  pattern=re.escape(label)+r':?\s*(?:'+re.escape(model)+r'\s*)?([0-9,]+)\s*(mm|kg)'
  matches=list(re.finditer(pattern,text,re.I));assert matches,(year,model,label)
  if model not in ['YZ125','YZ250']:assert len(matches)==1,(year,model,label,'ambiguous')
  val,unit=matches[0].groups();val=val.replace(',','')
  joint=('Weight / ' if unit=='kg' else 'Dimension / ')+label
  facts.append(dict(id=f'yamaha-{year}-{model.lower()}-'+re.sub('[^a-z0-9]+','-',joint.lower()).strip('-'),property='dimensions' if unit=='mm' else 'other',joint=joint,value=val,unit=unit,conditions=['Exact US motocross model; excludes X cross-country variants.','Curb weight is not dry weight.'] if unit=='kg' else ['Exact US motocross model; excludes X cross-country variants.'],source_url=r['source_url'],locator=f'PDF page {pg}; printed page '+('9-1' if model in ['YZ65','YZ85'] else '2-1'),document_sha256=r['sha256'],document_revision=r['source_url'].split('/')[-1],retrieved_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),review_status='PENDING',review_note='Selected general-specification rows visually inspected. Exact year follows existing Yamaha US manual index; independent identity/conflict review pending. No other pages extracted.',reviewer_id='codex-source-inspection-20261016',approval_reference=None))
 assert len(facts)==7
 target=dict(manufacturer='Yamaha',model=model,model_year=year,variant='standard',region='US');name=f'{year}-{model.lower()}-candidates.json'
 (out/name).write_text(json.dumps(dict(target=target,assemblies=[],parts=[],facts=facts,mappings=[]),ensure_ascii=False,indent=2)+'\n')
 manifest.append(dict(target=target,file='yamaha/'+name,source_url=r['source_url'],document_sha256=r['sha256'],facts=len(facts),status='CANDIDATES_ONLY',database_imported=False,source_pdf_redistributed=False))
(out/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print('Models',len(manifest),'facts',sum(r['facts'] for r in manifest))
