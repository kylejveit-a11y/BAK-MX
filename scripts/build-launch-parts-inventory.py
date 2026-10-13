"""Read-only-source reconciliation of launch parts inventories; no database or service claims."""
import hashlib,json,re
from pathlib import Path
from collections import Counter
B=Path('docs/research/parts-pass14')
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def key(t):return (t['manufacturer'],t['model'],t.get('model_year',t.get('year')),t.get('region','US'),t.get('variant','standard'))
def target(t):return dict(zip(['manufacturer','model','model_year','region','variant'],key(t)))
roster=read(B/'launch-targets.json');planned={key(r):r for r in roster['rows']}
for binding in roster['source_bindings']:
 assert sha(Path(binding['path']))==binding['sha256'], binding['path']
assert len(planned)==len(roster['rows']), 'Duplicate roster targets'
catalogs=[];errors=[]
baseline=read(Path('docs/research/parts/inventory.json'))
for r in baseline['targets']:
 catalogs.append({'target':r['target'],'path':'docs/research/parts/inventory.json','source':'Legacy reviewed inventory','complete':r['inventory_complete'],'assemblies':r['assembly_rows'],'expected_assemblies':r['expected_total_assemblies'],'occurrences':r['part_rows'],'new_this_pass':False,'scope':'Existing exact-scope review retained'})
del baseline
# Official Kawasaki: reconcile the saved index with every source table, retaining AR and alternatives.
kb=B/'kawasaki';(kb/'inventories').mkdir(exist_ok=True)
for ip in sorted(kb.glob('*-index.json')):
 idx=read(ip)
 if key(idx['target']) not in planned:continue
 groups=list({x['url']:x for x in idx['links']}.values());assemblies=[];missing=[]
 for g in groups:
  aid=re.search(r'/parts/(\d+)/',g['url'])[1];p=kb/f"{idx['target']['model_year']}-{idx['target']['model']}-{aid}.json"
  if not p.exists():missing.append(g['url']);continue
  d=read(p)
  assert key(d['target'])==key(idx['target']) and d['assembly_url']==g['url']
  assert d['headers']==['ITEM NAME','REF #','PART NUMBER','QUANTITY','DESTINATION','REMARKS']
  assert all(len(x)==6 for x in d['rows'])
  rows=[{'occurrence_index':i+1,'description':r[0],'callout':r[1],'part_number':r[2] or None,'catalog_quantity':int(r[3]) if r[3].isdigit() else None,'catalog_quantity_raw':r[3],'quantity_basis':'EXPLICIT_OEM_TABLE','destination':r[4],'remarks':r[5],'installed_whole_bike_quantity':None} for i,r in enumerate(d['rows'])]
  # Some captures recorded the page's "VIEW DIAGRAM" link text as the name and site-relative picture paths.
  # The real diagram name is the page heading already saved in the same evidence file ("2026 KX 450 - Air Cleaner").
  name=d['name']
  if name.strip().upper()=='VIEW DIAGRAM':
   heading=next((h for h in reversed(d.get('headings',[])) if ' - ' in h),None);assert heading,str(p);name=heading.split(' - ',1)[1].strip()
  pictures=[('https://www.kawasaki.com'+u if u.startswith('/') else u) for u in d['diagram_urls']]
  assemblies.append({'id':aid,'name':name,'url':g['url'],'rows':rows,'diagram_urls':pictures,'evidence_file':str(p),'evidence_sha256':sha(p)})
 out={'target':idx['target'],'source':'Kawasaki official US catalog','index_url':idx['url'],'index_sha256':sha(ip),'status':'ALL_INDEXED_PAGES_CAPTURED' if not missing else 'PARTIAL','counts':{'indexed_assemblies':len(groups),'captured_assemblies':len(assemblies),'occurrences':sum(len(a['rows']) for a in assemblies)},'missing':missing,'errors':[],'assemblies':assemblies}
 op=kb/'inventories'/f"{idx['target']['model_year']}-{idx['target']['model']}.json";op.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
 catalogs.append({'target':idx['target'],'path':str(op),'sha256':sha(op),'source':out['source'],'complete':not missing,'assemblies':len(assemblies),'expected_assemblies':len(groups),'occurrences':out['counts']['occurrences'],'new_this_pass':True,'scope':'Exact official US model code '+idx['model_code'],'unknown_quantities':sum(r['catalog_quantity'] is None for a in assemblies for r in a['rows'])})
# MotoSport parser outputs bind each observed public source capture.
for p in B.rglob('inventory.json'):
 d=read(p)
 if d.get('source')!='MotoSport public OEM catalog' or key(d['target']) not in planned:continue
 for a in d['assemblies']:
  ep=p.parent/a['evidence_file'];assert sha(ep)==a['evidence_sha256'],str(ep)
 index_bound=sha(p.parent/'index.json')==d['index_sha256']
 # An in-progress capture may have refreshed its index before rebuilding the inventory; it can never count as complete.
 assert index_bound or d['status']!='ALL_INDEXED_PAGES_CAPTURED', str(p)
 complete=index_bound and d['status']=='ALL_INDEXED_PAGES_CAPTURED' and not d['missing'] and not d['errors'] and d['counts']['captured_assemblies']==d['counts']['indexed_assemblies']
 catalogs.append({'target':target(d['target']),'path':str(p),'sha256':sha(p),'source':d['source'],'complete':complete,'assemblies':d['counts']['captured_assemblies'],'expected_assemblies':d['counts']['indexed_assemblies'],'occurrences':d['counts']['occurrences'],'new_this_pass':True,'scope':'Exact retailer catalog fitment; quantities retain explicit retailer-attributed OEM recommendation, not whole-bike totals','unknown_quantities':sum(r['catalog_quantity'] is None for a in d['assemblies'] for r in a['rows'])})
# New explicit-US official European catalogs. Regional alternatives cannot substitute.
for p in (B/'european-discovery/captures').rglob('*.json'):
 d=read(p)
 if key(d['target']) not in planned:continue
 if d.get('catalog_region')!='US':continue
 groups=d.get('assemblies',[]);counts=Counter(x['assembly_id'] for x in d.get('parts',[]))
 duplicate_counts=Counter()
 for duplicate in d.get('raw_duplicate_rows',[]):
  raw=duplicate['row'];match=next((x for x in d['parts'] if x['assembly_id']==duplicate['assembly_id'] and x['callout']==str(raw['SequenceNumber']) and x['part_number']==raw['ArticleNumber']),None)
  assert match and match['description']==raw['ArticleDescription'] and match.get('catalog_quantity')==raw['Quantity'] and match.get('additional_text','')==raw.get('ArticleAdditionalText',''), 'Nonidentical catalog duplicate needs reconciliation'
  duplicate_counts[duplicate['assembly_id']]+=1
 complete=bool(d.get('catalog_complete') and d.get('scope_confirmed') and groups and len(groups)==d.get('expected_assembly_count') and all(a.get('enumeration_checked') and counts[a['id']]+duplicate_counts[a['id']]==a.get('expected_occurrences') for a in groups))
 catalogs.append({'target':d['target'],'path':str(p),'sha256':sha(p),'source':'Official '+d['target']['manufacturer']+' US catalog','complete':complete,'assemblies':sum(a.get('enumeration_checked',False) for a in groups),'expected_assemblies':d.get('expected_assembly_count'),'occurrences':len(d.get('parts',[])),'new_this_pass':True,'scope':d.get('catalog_label'),'unknown_quantities':sum(x.get('catalog_quantity') is None for x in d.get('parts',[]))})
# Official catalogs the manufacturer lists only under an EU market label, for models also sold in the US.
# Used only where no exact-US catalog exists; the source name carries the market so the rider is told.
for p in (B/'european-discovery/captures-eu').rglob('*.json'):
 d=read(p)
 if key(d['target']) not in planned or d.get('catalog_region')!='EU':continue
 groups=d.get('assemblies',[]);counts=Counter(x['assembly_id'] for x in d.get('parts',[]));dup=Counter(x['assembly_id'] for x in d.get('raw_duplicate_rows',[]))
 complete=bool(d.get('catalog_complete') and groups and len(groups)==d.get('expected_assembly_count') and all(a.get('enumeration_checked') and counts[a['id']]+dup[a['id']]==a.get('expected_occurrences') for a in groups))
 catalogs.append({'target':d['target'],'path':str(p),'sha256':sha(p),'source':'Official '+d['target']['manufacturer']+' catalog (EU market listing)','complete':complete,'assemblies':sum(a.get('enumeration_checked',False) for a in groups),'expected_assemblies':d.get('expected_assembly_count'),'occurrences':len(d.get('parts',[])),'new_this_pass':False,'scope':'EU market listing: '+str(d.get('catalog_label')),'unknown_quantities':sum(x.get('catalog_quantity') is None for x in d.get('parts',[]))})
rows=[]
for k,r in planned.items():
 sources=[c for c in catalogs if key(c['target'])==k]
 selected=max(sources,key=lambda c:(c['complete'],c['occurrences'],c['new_this_pass'])) if sources else None
 rows.append({'target':target(r),'original_60_target':r['original_60_target'],'identity_status':r['identity_status'],'catalog_inventory_complete':bool(selected and selected['complete']),'status':'CATALOG_ENUMERATED' if selected and selected['complete'] else 'PARTIAL_CAPTURE' if selected and selected['occurrences'] else 'INDEX_ONLY' if selected and selected['expected_assemblies'] else 'NOT_CAPTURED','selected_inventory':selected,'other_inventory_sources':[c for c in sources if c is not selected],'gaps':([] if selected and selected['complete'] else ['Capture and reconcile every group in the exact catalog index.'])+(['Explicit catalog quantity is unavailable for some entries; unknown is preserved.'] if selected and selected.get('unknown_quantities',0) else [])+(['Exact year/market identity remains unverified in the roster.'] if 'UNVERIFIED' in r['identity_status'] and not(selected and selected['complete']) else [])})
complete=[r for r in rows if r['catalog_inventory_complete']]
summary={'planned_acquisition_slots':len(rows),'families':len(roster['families']),'complete_catalog_inventories':len(complete),'original_60_complete':sum(r['original_60_target'] for r in complete),'new_completed_targets':sum(r['selected_inventory']['new_this_pass'] and not any(not c['new_this_pass'] and c['complete'] for c in r['other_inventory_sources']) for r in complete),'selected_captured_occurrences':sum((r['selected_inventory'] or {}).get('occurrences',0) for r in rows),'complete_by_brand':dict(Counter(r['target']['manufacturer'] for r in complete))}
result={'schema_version':1,'status':'PAUSED_AT_USER_REQUEST_AFTER_CURRENT_BATCH','scope':'Parts inventory only; percentages refer only to reconciled catalog indexes, never installed-piece totals or engineering specification coverage.','summary':summary,'database_writes':False,'rows':rows}
(B/'INVENTORY_STATUS.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
md=['# Launch parts inventory checkpoint','','Paused at the userÃ¢â‚¬â„¢s request after finishing active batches. Existing captures were preserved; no rebuild guides or database changes were made.','',f"{len(complete)} complete catalog inventories across {len(rows)} planned acquisition slots; {summary['original_60_complete']} of the original60 targets. {summary['new_completed_targets']} targets newly completed this pass. Unknown or not-yet-established model-years remain explicit acquisition slots, not asserted production bikes.",'','Catalog-complete means every listed group and part entry is captured. It does not mean every possible installed piece or specification is known. Optional items, supersessions, nested kits, AR and unavailable quantities remain distinct.','','| Brand | Model | Year | Inventory | Captured / indexed groups | Part entries |','|---|---|---:|---|---:|---:|']
for r in rows:
 t=r['target'];s=r['selected_inventory'] or {};md.append(f"| {t['manufacturer']} | {t['model']} | {t['model_year']} | {r['status']} | {s.get('assemblies',0)} / {s.get('expected_assemblies') or '?'} | {s.get('occurrences',0)} |")
md+=['','See INVENTORY_STATUS.json for exact source paths, hashes, alternate captures and gaps. Source captures and acquisition scripts are resumable; do not restart finished catalogs.']
(B/'INVENTORY_STATUS.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
print(json.dumps(summary))
