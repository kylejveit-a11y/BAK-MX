import json,pathlib,re
O=pathlib.Path(__file__).parent
for p in O.glob('mc-*.json'):
 j=json.loads(p.read_text())
 if len(j['assemblies'])!=j.get('expected_assembly_count'):continue
 model=j['target']['model'];y=j['target']['model_year'];manual=json.loads((O/f'manual-{model.split()[1][:-1]}-{y}.json').read_text());ww=any(' WW ' in m['title'] for m in manual.get('manuals',[]));code=j['catalog_model_code']
 j['catalog_manifest']={'source_url':f"https://sparepartsfinder.gasgas.com/Result/ExecuteSearch?modelIdentification={j['catalog_model_identifier']}&isEngine=False",'engine_source_url':f"https://sparepartsfinder.gasgas.com/Result/ExecuteSearch?modelIdentification={j['catalog_model_identifier']}&isEngine=True",'expected_assembly_ids':[a['id'] for a in j['assemblies']],'review_note':'All observed engine and chassis index links reconciled against complete OEM response Total and diagram PN sets. Literal JS template placeholders are not diagram points.'}
 for a in j['assemblies']:
  placeholders=[x for x in a.get('diagram_missing_part_numbers',[]) if x.startswith('${')];a['diagram_missing_part_numbers']=[x for x in a.get('diagram_missing_part_numbers',[]) if not x.startswith('${')];a['diagram_part_count']=a.get('diagram_part_count',0)-len(placeholders)
  rows=[r for r in j['parts'] if r['assembly_id']==a['id']];dups=[r for r in j['raw_duplicate_rows'] if r['assembly_id']==a['id']];a['raw_row_count']=len(rows)+len(dups)
  a.setdefault('source_expected_occurrences',a['expected_occurrences']+len(dups) if a.get('enumeration_review_note') and a.get('enumeration_checked') else a['expected_occurrences'])
  known={r['part_number'].upper() for r in rows};a['case_only_diagram_aliases']=[x for x in a['diagram_missing_part_numbers'] if x.upper() in known];a['diagram_missing_part_numbers']=[x for x in a['diagram_missing_part_numbers'] if x.upper() not in known]
  a['enumeration_checked']=a.get('error') is None and a['raw_row_count']==a['source_expected_occurrences'] and not a['diagram_missing_part_numbers'];a['expected_occurrences']=len(rows) if a['enumeration_checked'] else a['expected_occurrences']
  a['enumeration_review_note']='OEM Total includes duplicate table rows, retained separately; expected_occurrences is unique assembly/callout/PN count.'
 for part in j['parts']:part['quantity_basis']='OEM_CATALOG'
 j['catalog_complete']=all(a['enumeration_checked'] for a in j['assemblies']);j['scope_confirmed']=ww and not(model=='MC 250F' and y==2026)
 j['scope_review']={'manual_portal':manual['portal_url'],'basis':'WW English manual validity contains exact standard model code '+code if ww else 'EU-only portal classification; US equivalence unresolved'}
 j['gaps']=['Torque fact to part-occurrence mappings incomplete.','Dimensions not separately normalized yet.','Full repair procedures and internal suspension specifications incomplete.']+([] if j['scope_confirmed'] else ['US catalog applicability pending.'])
 if model=='MC 250F' and y==2026:j['gaps'].append('Catalog calls F0201Z5 AR; OEM manual identifies standard F0201Z5 and separate AR F0242Z5. Catalog label conflict unresolved.')
 p.write_text(json.dumps(j,indent=2,ensure_ascii=False)+'\n');print(p.name,len(j['parts']),j['catalog_complete'],j['scope_confirmed'])
