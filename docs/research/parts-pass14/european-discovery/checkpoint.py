"""Read captures without mutation; write resumable acquisition and integrity report."""
import json,pathlib,hashlib,datetime
B=pathlib.Path(__file__).resolve().parent;rows=[]
roster=json.loads((B.parent/'launch-targets.json').read_text());planned={(x['manufacturer'],x['model'],x['model_year']) for x in roster['rows'] if x.get('planned')}
for p in (B/'captures').glob('*/*.json'):
 try:d=json.loads(p.read_text())
 except (json.JSONDecodeError,UnicodeDecodeError):continue
 a=d['assemblies'];parts=d['parts'];ids={x['id'] for x in a};errors=[]
 if not d.get('scope_confirmed') or d.get('catalog_region')!='US' or '<US>' not in d.get('catalog_label',''):errors.append('US applicability unsupported')
 if any(x['assembly_id'] not in ids for x in parts):errors.append('orphan assembly occurrence')
 if len({(x['assembly_id'],x['callout'],x['part_number']) for x in parts})!=len(parts):errors.append('duplicate occurrence')
 for x in a:
  if x.get('enumeration_checked'):
   count=sum(z['assembly_id']==x['id'] for z in parts)
   if count!=x['captured_occurrences']:errors.append('captured occurrence mismatch '+x['id'])
   duplicate_count=sum(z['assembly_id']==x['id'] for z in d.get('raw_duplicate_rows',[]))
   if count+duplicate_count!=x['expected_occurrences']:errors.append('raw row count not explained by duplicate ledger '+x['id'])
   if x.get('diagram_missing_part_numbers'):errors.append('diagram mismatch '+x['id'])
 if d['catalog_complete'] and (len(a)!=d['expected_assembly_count'] or not all(x.get('enumeration_checked') for x in a)):errors.append('invalid completion')
 target=d['target'];isplanned=(target['manufacturer'],target['model'],target['model_year']) in planned
 rows.append({'path':str(p.relative_to(B)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'target':target,'planned':isplanned,'catalog_complete':d['catalog_complete'],'captured_assemblies':len(a),'expected_assemblies':d['expected_assembly_count'],'parts_occurrences':len(parts),'errors':errors,'assembly_errors':[{'id':x['id'],'error':x['error']} for x in a if x.get('error')]})
report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete_catalogs':sum(x['catalog_complete'] for x in rows),'in_progress_or_incomplete':sum(not x['catalog_complete'] for x in rows),'part_occurrences':sum(x['parts_occurrences'] for x in rows),'catalogs':rows,'scope':'Public exact-US OEM catalog occurrences, including optional and accessory alternatives. Not installed bike totals; no torque or compatibility inference.'}
report['planned_complete_catalogs']=sum(x['planned'] and x['catalog_complete'] for x in rows);report['supplemental_unused_catalogs']=sum(not x['planned'] for x in rows)
(B/'CAPTURE_STATE.json').write_text(json.dumps(report,indent=2)+'\n');print({k:v for k,v in report.items() if k!='catalogs'})
assert not any(x['errors'] for x in rows)
