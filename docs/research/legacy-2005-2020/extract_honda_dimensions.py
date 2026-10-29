"""Seven exact-page dimension rows only. No cross-year inheritance or live writes."""
import pathlib,sys,json,re,hashlib,datetime
import fitz,pdfplumber
src=pathlib.Path(sys.argv[1]);out=pathlib.Path(__file__).parent/'honda';out.mkdir(exist_ok=True);manifest=[];issues=[]
for r in sorted(json.loads((src/'honda-dimension-jobs.json').read_text()),key=lambda r:(r['year'],r['model'])):
 f=src/pathlib.Path(r['local_path']).name;assert hashlib.sha256(f.read_bytes()).hexdigest()==r['sha256'];pdf=pdfplumber.open(f);doc=fitz.open(f)
 for n,pg in enumerate(r['spec_pages']):
  model=r['model'];year=r['year']
  if model=='CR85R_RB':model=['CR85R','CR85RB'][n]
  elif model=='CRF150R':model=['CRF150R','CRF150RB'][n]
  assert model in doc[pg-1].get_text() or model in '\n'.join(p.get_text() for p in list(doc)[:5])
  facts=[];tables=pdf.pages[pg-1].extract_tables()
  if not tables:issues.append(dict(year=year,model=model,page=pg,issue='No ruled table'));continue
  txt=doc[pg-1].get_text(); footer=re.findall(r'Technical\s+Information\s+(\d{1,3})',txt) or re.findall(r'(\d{1,3})\s+Technical\s+Information',txt)
  if not footer and (year,model)==(2019,'CRF450R'):footer=['unreadable in source'];issues.append(dict(year=year,model=model,page=pg,issue='Printed footer has missing glyphs; PDF page used'))
  assert len(footer)==1,(year,model,footer)
  rows=[row for table in tables for row in table]
  if (year,model)==(2014,'CRF250R'):
   rows=[[m[1],m[2]+' in',m[3]+' mm'] for m in re.finditer(r'(Overall length|Overall width|Overall height|Wheelbase|Seat height|Footpeg height|Ground clearance)\n([\d.]+) in\n([\d,]+) mm',doc[pg-1].get_text())]
  for row in rows:
   label=' '.join((row[0] or '').split())
   if label not in ['Overall length','Overall width','Overall height','Wheelbase','Seat height','Footpeg height','Foot peg height','Ground clearance']:continue
   metric=' '.join(next((c for c in reversed(row[1:]) if c), '').split());match=re.fullmatch(r'([\d,]+)\s*mm',metric)
   if not match:
    # Exact model tag, allowing a shared R/RWE value only when explicitly printed.
    match=re.search(r'(?<![A-Z0-9])'+model+r'(?:/RWE)?:\s*([\d,]+)\s*mm',metric)
   assert match,(year,model,label,metric)
   joint='Dimension / '+label;value=match[1].replace(',','')
   facts.append(dict(id=f'honda-{year}-{model.lower()}-'+re.sub('[^a-z0-9]+','-',joint.lower()).strip('-'),property='dimensions',joint=joint,value=value,unit='mm',conditions=['Exact US stock model only; RX and RWE variants excluded from this target.'],source_url=r['source_url'],locator=f'PDF page {pg}; printed page {footer[0]}',document_sha256=r['sha256'],document_revision=f'{year} Honda {r["model"]} Owner’s Manual & Competition Handbook',retrieved_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),review_status='PENDING',review_note='Selected dimension rows visually inspected. Independent identity and cross-corpus conflict review pending; remaining specifications not extracted.',reviewer_id='codex-source-inspection-20261016',approval_reference=None))
  assert len(facts)==7,(year,model,len(facts))
  target=dict(manufacturer='Honda',model=model,model_year=year,variant='standard',region='US');name=f'{year}-{model.lower()}-candidates.json'
  (out/name).write_text(json.dumps(dict(target=target,assemblies=[],parts=[],facts=facts,mappings=[]),ensure_ascii=False,indent=2)+'\n')
  manifest.append(dict(target=target,file='honda/'+name,source_url=r['source_url'],document_sha256=r['sha256'],facts=len(facts),status='CANDIDATES_ONLY',database_imported=False,source_pdf_redistributed=False))
(out/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print('Models',len(manifest),'facts',sum(r['facts'] for r in manifest),'issues',issues)
