import json,re,pathlib,collections
OUT=pathlib.Path(__file__).parent
for p in OUT.glob('fc-*-torques.json'):
 d=json.loads(p.read_text());target=d['target'];year=target['model_year'];model=target['model'];reviewed=year<=2025;fs=d['facts'];clean=[]
 for f in fs:
  raw=f.get('source_row',[]);right=f['source_value_cell'];cond=['Thread: '+f['thread']]
  locks=re.findall(r'Loctite\s*®?\s*(\d+)',right);cond+=['Loctite '+x for x in locks]
  if re.search('oil|degreas|diagon|gap|shaft|impeller',right,re.I):cond.append('Source installation condition: '+right)
  if raw and 'Engine oil' in (raw[0] or ''):cond.append('Engine oil on specified fastener; follow the source procedure for application surfaces.')
  if 'LH' in f['thread']:cond.append('Left-hand thread.')
  if f['joint'].lower().startswith('remaining'):cond.append('Applies only to remaining fasteners in the named system after excluding all specifically listed joints.')
  if re.search('hand.?tight',right,re.I):f['value']='hand-tight';f['unit']=None
  else:
   range_match=re.search(r'(\d+(?:\.\d+)?)\s*(?:Nm\s*)?[.…–-]{1,}\s*(\d+(?:\.\d+)?)\s*Nm',right)
   stages=re.findall(r'(\d+(?:\.\d+)?)\s*Nm',right);angles=re.findall(r'(\d+)\s*°',right)
   if range_match:f['value']=range_match[1]+'–'+range_match[2]
   elif len(stages)>1 or angles:
    f['value']=' → '.join([x+' Nm' for x in stages]+[x+'°' for x in angles]);cond.append('Follow stated tightening stages in order. '+right)
   elif stages:f['value']=float(stages[0])
  f['conditions']=cond
  if reviewed:f.update(review_status='APPROVED',review_note='OEM manual linked by official selector; PDF scope page and complete torque-table pages visually reviewed. Exact standard-US model identity and table conditions retained. No KTM inheritance. Factual extraction only; source document not redistributed.')
  else:f.update(review_status='PENDING',review_note='Official 2026 manual scope lists EU standard and US Factory Edition only. Standard-US applicability is unconfirmed; no runtime promotion.')
  if f.get('excluded_variant_candidate'):f.update(review_status='EXCLUDED',review_note='This row explicitly applies to another variant/model such as FX; excluded from standard FC target.')
  if not f['thread'] or re.fullmatch(r'\d+\.',f['thread'] or ''):f.update(review_status='PENDING',review_note='Merged table row requires manual reconstruction; not a complete standalone specification.')
  if year>=2023 and re.search(r'angle lever|linkage lever',f['joint'],re.I):f.update(review_status='CONFLICTED',review_note='Manual lists M16x1.5 linkage hardware; exact model catalog lists M14x1.5 hardware. Torque cannot be assigned until the joint/revision conflict is resolved.')
  if year==2025 and model=='FC 450' and 'pressure pump cover' in f['joint'].lower():f.update(review_status='CONFLICTED',review_note='2025 owner table specifies M6x16; exact lubrication catalog/previous OEM table identifies M5. Confirm thread and procedure before assigning torque.')
  clean.append(f)
 # Manually reconstructed split rows following visual review of full pages.
 if year==2025:
  if model=='FC 450':
   base=next(f for f in clean if 'cylinder head' in f['joint'].lower() and ('M10' in f['thread'] or 'M10' in f['joint']))
   clean=[f for f in clean if f is not base];base.update(joint='Main cylinder-head screws',thread='M10×1.25',value='10 Nm → 30 Nm → 50 Nm',conditions=['Thread: M10×1.25','Apply engine oil to collar and thread before tightening.','Tighten in three torque stages: 10, 30, then 50 Nm.','Bolt sequence requires the model-specific service procedure.'],locator='PDF pages 160–161, cylinder-head screw row continued across pages',review_status='APPROVED',review_note='Split torque row manually reconstructed after visual inspection of both page segments; all stages and oil treatment retained.');clean.append(base)
  else:
   for label,thread,val,pg,conditions in [('camshaft bearing bridge','M7×1','5 Nm → 14 Nm',142,['Engine oil','First stage 5 Nm, second stage 14 Nm; follow model-specific sequence.']),('Nut, cylinder head','M10×1.25','10 Nm → 30 Nm → 180°',142,['Engine oil','First stage 10 Nm, second stage 30 Nm, third stage 180 degrees; follow model-specific sequence.'])]:
    selected=[f for f in clean if label.lower() in f['joint'].lower() and (label.startswith('camshaft') or 'M10' in f['thread'])]
    if selected:
     base=selected[0];clean=[f for f in clean if f not in selected];base.update(thread=thread,value=val,conditions=['Thread: '+thread]+conditions,review_status='APPROVED',locator=f'PDF page {pg}, {label}, all numbered tightening stages',review_note='Merged torque row manually reconstructed after visual review; all stages and engine-oil condition preserved.');clean.append(base)
 # Exact joint+thread duplicates with divergent torque are unresolved source conflicts.
 groups=collections.defaultdict(list)
 for f in clean:groups[(f['joint'].lower(),f['thread'].lower())].append(f)
 for key,group in groups.items():
  if len({str(f['value']) for f in group})>1:
   for f in group:f.update(review_status='CONFLICTED',review_note='Same joint/thread appears with conflicting torque values in this exact manual; preserve both, do not silently choose.')
 d['facts']=clean;d['review_summary']=dict(collections.Counter(f['review_status'] for f in clean));d['visual_reviewed_pdf_pages']=d['source_metadata']['torque_table_pdf_pages'] if reviewed else [3];p.write_text(json.dumps(d,indent=2)+'\n');print(p.name,d['review_summary'])
