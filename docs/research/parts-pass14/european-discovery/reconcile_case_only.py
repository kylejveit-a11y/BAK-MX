"""Resolve only verified case-only diagram/table identifier differences; retain raw evidence."""
import json,pathlib,time
B=pathlib.Path(__file__).resolve().parent
for p in (B/'captures').glob('*/*.json'):
 if time.time()-p.stat().st_mtime<30:continue
 d=json.loads(p.read_text());changed=False
 if len(d['assemblies'])!=d.get('expected_assembly_count'):continue
 for a in d['assemblies']:
  missing=a.get('diagram_missing_part_numbers',[])
  if not missing or a.get('error'):continue
  parts=[x['part_number'] for x in d['parts'] if x['assembly_id']==a['id']]
  matches={x:next((v for v in parts if v.casefold()==x.casefold()),None) for x in missing}
  if not all(matches.values()) or a.get('captured_occurrences')!=a.get('expected_occurrences'):continue
  a['diagram_raw_case_differences']=matches;a['diagram_missing_part_numbers']=[];a['enumeration_checked']=True;a['reconciliation_note']='Diagram hotspot and table identifiers differ only in letter case. Original table identifiers and exact hotspot spellings retained; no part substitution inferred.';changed=True
 if changed:
  d['catalog_complete']=all(a.get('enumeration_checked') for a in d['assemblies']);p.write_text(json.dumps(d,indent=2)+'\n');print(p.name,d['catalog_complete'])
