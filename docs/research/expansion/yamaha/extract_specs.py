import json,re,pdfplumber,pathlib
out=pathlib.Path(__file__).parent
configs=[('2024-yz250f',49,54),('2023-yz450f',47,52)]
for key,start,end in configs:
 base=json.loads((out/(key+'.json')).read_text()); rows=[];section='';sub='';adjunit=None;plate=''
 with pdfplumber.open(base['local_pdf_path']) as pdf:
  for pn in range(start-1,end):
   for line in pdf.pages[pn].extract_text_lines():
    if line['top']<50 or line['top']>760:continue
    left=pdfplumber.utils.extract_text([c for c in line['chars'] if c['x0']<315],x_tolerance=1).strip()
    right=pdfplumber.utils.extract_text([c for c in line['chars'] if c['x0']>=315],x_tolerance=1).strip()
    if left.startswith('EAM') or 'SPECIFICATIONS' in left:continue
    if not left:
     if right and rows:rows[-1]['raw_value']+=' '+right
     continue
    if not right:
     if re.match(r'^(limit|\(|wheel\))',left) and rows:rows[-1]['label']+=' '+left;continue
     if line['x0']<70:section=left;sub='';plate='';adjunit=None
     else:sub=left;adjunit=None
     continue
    if line['x0']<80:sub=''
    if left.startswith(('Friction plate','Clutch plate')):plate=left.replace(' thickness','')
    label=left
    if section=='Clutch' and left in ['Wear limit','Plate quantity','Warpage limit']:label=plate+' '+left.lower()
    if left.startswith('Unit for'):adjunit=right
    context=' / '.join(filter(None,[section,sub]))
    rows.append(dict(context=context,label=label,raw_value=right,page=pn+1,printed='2-'+str(pn+1-start+2),adjustment_unit=adjunit))
 facts=[]
 for row in rows:
  joint=(row['context']+' / '+row['label']).replace('\uf0b4','×'); raw=row['raw_value'].replace('\uf0b0','°').replace('\uf057','Ω').replace('\uf0b4','×')
  cond=['Exact US standard-model OEM configuration; measurement/assembly procedure and its prerequisites remain required.']
  if 'limit' in joint.lower():cond.append('Service or wear limit, not a nominal manufacturing target; measure using the OEM procedure.')
  if joint=='Piston / Diameter':cond.append('Piston diameter measuring point: '+next(r['raw_value'] for r in rows if r['label']=='Measuring point (from piston skirt bottom)')+' from piston skirt bottom; follow OEM measurement orientation.')
  if 'Valve clearance (cold)' in joint:cond.append('Measure valve clearance with engine cold.')
  if 'Idling condition' in joint:cond.append('Idling-condition table: coolant 70–80 °C and engine idle 1900–2100 r/min; fuel pressure is specified at idle.')
  if 'measured on cold tires' in joint:cond.append('Measure cold tire pressure on the specified stock tires.')
  if 'Maintenance Stand' in joint:cond.append('Drive chain slack is specified with motorcycle on maintenance stand; preserve OEM measurement location.')
  if 'Engine oil' in joint and any(x in joint for x in ['Oil change','filter removal','disassembled']):cond.append('Retain the stated oil-change/filter-removal/disassembled fill condition; verify level by OEM procedure.')
  if 'suspension' in joint.lower():
   cond.append('Stock OEM suspension only; do not apply to aftermarket/revalved components or tune around an unresolved fault.')
   if 'Quantity (' in joint:cond.append('This is the specification-table quantity for the named fork leg; do not confuse total leg oil with outer-chamber adjustment volume. Consult fill/bleed procedure.')
  if 'Adjustment value from the start position' in joint:cond.append('Adjustment is measured from the OEM start position; '+str(row['adjustment_unit'])+' units. Confirm start-position procedure before adjusting.')
  val=raw.split(' (')[0] if re.match(r'^\d',raw) and 'ratio' not in joint.lower() else raw; unit=None
  match=re.fullmatch(r'([0-9.]+(?:–[0-9.]+)?) (mm|L|cm³|kPa|A|Ω|r/min|°C|°|pcs)',val)
  if match:
   val=match[1];unit=match[2]
   if '–' not in val:val=float(val)
  if 'Adjustment value from the start position' in joint:unit=row['adjustment_unit'].lower() if row['adjustment_unit'] else None
  f=dict(id='yamaha-'+key+'-spec-'+str(len(facts)+1).zfill(3),property='specification',joint=joint,value=val,unit=unit,conditions=cond,source_url=base['facts'][0]['source_url'],locator=f"PDF page {row['page']}; printed {row['printed']}; {joint}",document_sha256=base['facts'][0]['document_sha256'],document_revision=base['facts'][0]['document_revision'],review_status='APPROVED',review_note='Six engine/chassis specification pages rendered and visually reviewed; contextual labels, range versus limit, cold/idle/stand conditions and OEM component scope preserved.',raw_value=raw)
  facts.append(f)
 result={k:base[k] for k in ['target','local_pdf_path','scope_confirmed']};result.update(facts=facts,assemblies=[],parts=[],mappings=[],catalog_complete=False,gaps=['Selected specification section only; complete part mapping and remaining service procedures still required.'],source_section=dict(pdf_pages=[start,end],expected_rows=len(rows),extracted_rows=len(facts),enumeration_checked=True))
 (out/(key+'-specs.json')).write_text(json.dumps(result,indent=2)+'\n')
 print(key,len(facts))
 for f in facts: print(f['id'].rsplit('-',1)[1],f['joint'],'=',f['value'],f['unit'])
