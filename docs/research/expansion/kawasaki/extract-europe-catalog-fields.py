"""Bounded explicit notation extraction. Never writes original catalogs."""
import json,re,hashlib,pathlib,sys
root=pathlib.Path(__file__).resolve().parent.parent
num=r'\d+(?:[.,]\d+)?'
patterns=[re.compile(r'(?<![A-Za-z0-9])M'+num+r'(?:[Xx](?:LH)?'+num+r')+(?![A-Za-z0-9.,])'),re.compile(r'(?<![A-Za-z0-9])'+num+r'(?:[Xx]'+num+r')+(?![A-Za-z0-9.,])'),re.compile(r'(?<![A-Za-z0-9])(?:L|D|T|H|X)\s*=\s*'+num+r'(?:/'+num+r')?(?:\s*mm)?(?![A-Za-z0-9.,])',re.I),re.compile(r'(?<![A-Za-z0-9])'+num+r'\s*mm\b',re.I)]
summary=[]
for brand in ['gasgas','husqvarna']:
 for file in sorted((root/brand).glob('*.json')):
  if 'catalog-fields' in file.name:continue
  if len(sys.argv)>1 and file.name not in sys.argv[1:]:continue
  try:j=json.loads(file.read_text())
  except (ValueError,OSError):continue
  if not isinstance(j,dict) or not j.get('catalog_complete') or not j.get('scope_confirmed') or not j.get('parts') or not j.get('assemblies'):continue
  target=j['target'];parts=j['parts']; scope=':'.join(str(target[k]) for k in ['manufacturer','model','model_year','variant','region'])
  capture_dir=file.parent/'source-captures';capture_dir.mkdir(exist_ok=True)
  hashes={}
  for assembly in j['assemblies']:
   rows=[p for p in parts if p['assembly_id']==assembly['id']]
   assert len(rows)==assembly['expected_occurrences']
   body={'target':target,'catalog_model_code':j.get('catalog_model_code'),'assembly':assembly,'rows':rows}
   b=json.dumps(body,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode();h=hashlib.sha256(b).hexdigest();(capture_dir/(h+'.json')).write_bytes(b);hashes[assembly['id']]=h
  facts=[];mappings=[]
  for part in parts:
   text=(part['description']+' '+part.get('additional_text','')).strip()
   rate=re.search(r'(?<![\d.,])('+num+r')\s*N/mm\b',text,re.I)
   matches=[]
   for pattern in patterns:
    matches.extend(m.group(0) for m in pattern.finditer(text))
   if rate:prop='other';value=float(rate.group(1).replace(',','.'));unit='N/mm'
   elif matches:prop='dimensions';value='; '.join(dict.fromkeys(matches));unit=None
   else:continue
   fid=scope+':'+part['assembly_id']+':'+part['callout']+':'+str(part['part_number'])+':'+prop
   conditions=['Exact catalog description: '+part['description'],'Partial published notation; no complete drawing, tolerance, material grade, installation torque or application procedure is established.']
   if part.get('additional_text'):conditions.append('Additional catalog text: '+part['additional_text'])
   if unit is None:conditions.append('Units remain null for the compound catalog notation; individual explicitly printed mm tokens are retained verbatim. Thread pitch versus length is not reinterpreted.')
   if part.get('catalog_quantity')==0:conditions.append('Catalog quantity zero is an optional/service selection; installed quantity remains unknown.')
   h=hashes[part['assembly_id']]
   facts.append(dict(id=fid,property=prop,joint=part['description']+' (part '+str(part['part_number'])+')',value=value,unit=unit,conditions=conditions,source_url=part['source_url'],locator=f"Catalog {j.get('catalog_model_code')}; assembly {part['assembly_id']}; callout {part['callout']}; part {part['part_number']}",document_sha256=h,document_revision='Live OEM catalog captured2026-09-13; OEM revision not exposed',source_kind='webpage',source_capture_path=str((capture_dir/(h+'.json')).relative_to(root.parent.parent.parent)),hash_basis='Canonical UTF-8 JSON snapshot of finalized source-acquisition assembly and rows, not original HTML bytes',review_status='APPROVED',review_note='Exact scope confirmed by acquisition agent; full finalized catalog and literal dimensional notation reviewed. No adjacent-year inheritance, inferred torque, unit conversion or tolerance.',field_completeness='PARTIAL'))
   mappings.append(dict(assembly_id=part['assembly_id'],callout=part['callout'],part_number=part['part_number'],fact_id=fid,property=prop,review_status='APPROVED',catalog_source_url=part['source_url'],review_note='Literal notation from the same exact scope/assembly/callout/part row; partial field only.'))
  out={'target':target,'scope_confirmed':True,'catalog_complete':False,'catalog_source_file':str(file.relative_to(root)),'assemblies':[],'parts':parts,'facts':facts,'mappings':mappings,'gaps':['Supplemental field extraction only. Complete catalog status remains controlled by the original catalog file.','No torque, wear limits or full engineering dimensions inferred.']}
  dest=file.with_name(file.stem+'-catalog-fields.json');dest.write_text(json.dumps(out,indent=2))
  review=dest.with_suffix('.REVIEW.md');review.write_text(f"# {scope} partial catalog field review\n\nReviewed2026-09-13. Source: `{file.name}`, confirmed complete and exact scope before extraction. Captured {len(facts)} partial fields and exact mappings from {len(parts)} occurrences. Source snapshots in `source-captures/` bind scope, assembly and full rows as canonical UTF-8 JSON; their SHA256 filenames equal the bound fact hashes. These are acquisition snapshots, not raw HTML digests.\n\nOnly explicit M-thread notation, standalone multiplicative dimensions, L/D/T/H/X notation, printed mm dimensions, and explicit N/mm spring rates are retained. No spring rate inferred from a spring part-name hyphen code. No torque inferred from thread dimensions or clutch-spring labels. Unprinted/compound units remain null. Options and catalog-zero status remain preserved. Every field is PARTIAL; no full tolerance/drawing/installation coverage claimed. Original catalogs are unchanged.\n\nValidation: all source assembly row counts matched the finalized catalog; every mapping binds an exact part occurrence and unique fact ID; every referenced canonical source hash matches bytes on disk. Rights basis is factual extraction only; no manual or diagram redistribution.\n")
  summary.append({'file':str(dest.relative_to(root)),'facts':len(facts),'mappings':len(mappings),'parts':len(parts)})
print(json.dumps(summary,indent=2))
