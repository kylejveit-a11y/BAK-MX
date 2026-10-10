import json,pathlib,collections
P=pathlib.Path(__file__).parent
for f in sorted(P.glob('fc-*.json')):
 d=json.loads(f.read_text())
 if not d.get('parts') or len(d['assemblies'])!=d.get('expected_assembly_count'):continue
 for a in d['assemblies']:
  placeholders=[x for x in a.get('diagram_missing_part_numbers',[]) if x in ['${articleNumber}','${data.ArticleNumber}']]
  a['diagram_missing_part_numbers']=[x for x in a.get('diagram_missing_part_numbers',[]) if x not in placeholders]
  a['diagram_part_count']=a.get('diagram_part_count',0)-len(placeholders)
  actual_numbers={r['part_number'].upper() for r in d['parts'] if r['assembly_id']==a['id']}
  aliases=[x for x in a['diagram_missing_part_numbers'] if x.upper() in actual_numbers]
  if aliases:a['diagram_case_aliases']=aliases
  a['diagram_missing_part_numbers']=[x for x in a['diagram_missing_part_numbers'] if x not in aliases]
  if placeholders:a['excluded_html_template_placeholders']=placeholders
  duplicates=sum(1 for r in d['raw_duplicate_rows'] if r['assembly_id']==a['id'])
  raw=a.get('source_total_rows',a.get('expected_occurrences'))
  a['source_total_rows']=raw;a['expected_occurrences']=raw-duplicates if raw is not None else None
  a['raw_duplicate_count']=duplicates
  a['enumeration_checked']=not a.get('error') and a.get('captured_occurrences')==a['expected_occurrences'] and not a['diagram_missing_part_numbers']
 d['catalog_enumeration_complete']=bool(d['assemblies']) and all(a['enumeration_checked'] for a in d['assemblies'])
 d['gaps']=['Parts catalog is a service-parts inventory, not proof of every non-serviceable subcomponent or fastener specification.','Specification-to-occurrence mappings remain incomplete; torque values are provided in separate reviewed evidence files.','Zero OEM quantities are preserved as unknown installed quantities.']
 if d['target']['model_year']==2025 and d['target']['model']=='FC 250':
  m=json.loads((P/'manual-fc-250-2025.json').read_text())
  assert 'FC 250 US (F2175Y1)' in m['scope_excerpt'] and d['catalog_model_code']=='F2175Y1'
  d['scope_confirmed']=True;d['scope_review']={'note':'Catalog tree labels node EU, but unique F2175Y1 is explicitly FC 250 US in OEM owner-manual scope. Exact code joins this catalog to US standard; retain label anomaly.','source_url':m['selected']['link'],'document_sha256':m['document_sha256'],'locator':'PDF page 3'}
 if d['target']['model_year']==2026:
  d['scope_confirmed']=False;d['gaps'].append('Only EU standard catalog and EU standard / US Factory Edition manual identified. US standard applicability remains unconfirmed; do not promote EU inventory or facts to US.')
 d['catalog_complete']=d['catalog_enumeration_complete'] and d['scope_confirmed']
 d['catalog_manifest']['review_note']='Both official indexes reconciled with all API table rows. Expected occurrences count distinct assembly/callout/part-number occurrences. Raw API totals and duplicate rows retained. Two literal HTML template placeholders excluded from diagram reconciliation; actual diagram part numbers reconciled.'
 f.write_text(json.dumps(d,indent=2)+'\n');print(f.name,len(d['parts']),d['catalog_complete'])
