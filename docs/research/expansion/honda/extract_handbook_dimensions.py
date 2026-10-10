from pathlib import Path
import re,json,hashlib
OUT=Path(__file__).parent
engine_names=['Cylinder bore diameter','Cylinder bore diameter','Cylinder sealing face warpage','Piston outside diameter','Piston outside diameter','Piston pin bore diameter','Piston pin bore diameter','Piston pin outside diameter','Piston pin outside diameter','Top piston ring end gap','Top piston ring end gap','Oil ring side rail end gap','Oil ring side rail end gap','Top ring to piston groove clearance','Connecting rod small end diameter','Connecting rod small end diameter']
clutch_names=['Clutch friction disc thickness','Clutch friction disc thickness','Clutch plate warpage','Clutch spring free length','Clutch spring free length']
for tf in sorted(OUT.glob('20*-crf*r.json')):
 t=json.loads(tf.read_text());target=t['target'];y,m=target['model_year'],target['model'];pdf=Path(f'/tmp/{y}-{m}-ch.pdf');pages=Path(str(pdf)+'.txt').read_text().split('\f');facts=[];inspected=[]
 def add(joint,value,unit,pi,property='dimensions',conditions=None):
  f={'id':f'honda-{y}-{m.lower()}-spec-'+re.sub('[^a-z0-9]+','-',joint.lower()).strip('-'),'property':property,'joint':joint,'value':value,'unit':unit,'conditions':conditions or [],'source_url':t['source_document']['url'],'locator':f'PDF page {pi+1}; '+(re.findall(r'^\s*(\d-\d+)\s*$',pages[pi],re.M)[-1] if re.findall(r'^\s*(\d-\d+)\s*$',pages[pi],re.M) else 'named specification table'),'document_sha256':t['source_document']['sha256'],'document_revision':t['facts'][0]['document_revision'],'review_status':'PENDING','review_note':'Exact-year OEM handbook; pending table visual review.'};facts.append(f)
 for label,needle in [('engine','CYLINDER/PISTON SPECIFICATIONS'),('clutch','CLUTCH SPECIFICATIONS')]:
  pi=next(i for i,s in enumerate(pages) if needle in s);s=pages[pi][pages[pi].rfind(needle):];matches=re.findall(r'(STANDARD|SERVICE LIMIT):\s*([\d.]+(?:\s*[–−-]\s*[\d.]+)?)\s*mm',s)
  names=engine_names if label=='engine' else (['Clutch lever free play']+clutch_names if m=='CRF250R' else clutch_names)
  assert len(matches)==len(names),(y,m,label,len(matches));inspected.append(pi+1)
  depth=re.search(r'Piston O\.D\. at\s*([\d.]+)\s*mm',s)
  for joint,(state,val) in zip(names,matches):
   cond=['OEM standard engine/components only; inspect using the associated measurement procedure.']
   if joint=='Piston outside diameter':assert depth;cond.append(f'Measure {depth.group(1)} mm above the bottom of the piston skirt, following OEM orientation.')
   add(joint+' — '+state.lower(),val.replace('–','-'),'mm',pi,'clearance_wear_limit' if state=='SERVICE LIMIT' or 'clearance' in joint.lower() or 'gap' in joint else 'dimensions',cond)
  if label=='clutch':
   assert 'Replace the clutch springs as a set' in pages[pi]
   add('Clutch spring replacement grouping','Replace as a set',None,pi,'replacement_rule')
   assert 'Replace the clutch friction discs and clutch plates as a' in pages[pi]
   add('Clutch friction disc and plate replacement grouping','Replace as a set',None,pi,'replacement_rule')
  if label=='engine':
   assert 'Do not polish the piston pin' in pages[pi]
   add('Piston pin surface treatment','Do not polish',None,pi,'installation')
 pi=next(i for i,s in enumerate(pages) if 'OPTIONAL PARTS' in s and 'SPRING RATE' in s);s=pages[pi];inspected.append(pi+1)
 rates=re.findall(r'([\d.]+)\s+N/mm',s);assert len(rates)==6,(y,m,rates)
 for joint,val in zip(['Fork optional soft spring rate','Fork standard spring rate','Fork optional stiff spring rate','Shock optional soft spring rate','Shock standard spring rate','Shock optional stiff spring rate'],rates):
  add(joint,float(val),'N/mm',pi,'spring_rate',['Applies to the standard R model configuration identified by this table; optional rates are alternatives, not stock specification.','Factory springs may be unmarked; marks alone do not prove spring identity.'])
 pi=next(i for i,s in enumerate(pages) if 'WHEEL RIM RUNOUT:' in s);s=pages[pi];inspected.append(pi+1)
 pressures=re.findall(r'(?:FRONT|REAR):\s*(\d+) kPa',s);assert len(pressures)==2
 for side,val in zip(['Front','Rear'],pressures):add(side+' tire pressure',float(val),'kPa',pi,'pressure',['OEM cold-tire baseline; measure tires cold. Terrain and aftermarket tires require contextual review.'])
 segment=s[s.index('WHEEL RIM RUNOUT:'):];runouts=re.findall(r'(?:Radial|Axial):\s*([\d.]+)\s*mm',segment);assert len(runouts)==4,(y,m,runouts)
 for side,val in zip(['Front radial','Front axial','Rear radial','Rear axial'],runouts):add(side+' wheel rim runout — service limit',float(val),'mm',pi,'clearance_wear_limit')
 assert len({f['id'] for f in facts})==len(facts)
 d={'target':target,'assemblies':[],'parts':[],'facts':facts,'mappings':[],'gaps':['Catalog occurrence mapping incomplete.','These four tables do not cover all dimensions, capacities or installation procedures.'],'catalog_complete':False,'scope_confirmed':True,'source_document':{**t['source_document'],'specification_pdf_pages':inspected}}
 (OUT/(tf.stem+'-specs.json')).write_text(json.dumps(d,indent=2)+'\n');print(tf.stem,len(facts),inspected,flush=True)
