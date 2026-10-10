import json,re,hashlib,pathlib
p=pathlib.Path(__file__).parent
j=json.loads((p/'2025-kx450.json').read_text())
raw=json.loads((p/'2025-kx450-raw.json').read_text())
hashes={}
(p/'source-captures').mkdir(exist_ok=True)
for g in raw:
 b=json.dumps({'name':g['name'],'url':g['url'],'rows':g['rows']},sort_keys=True,separators=(',',':')).encode()
 h=hashlib.sha256(b).hexdigest();hashes[g['url']]=h
 (p/'source-captures'/f'{h}.json').write_bytes(b)
facts=[];mappings=[]
for part in j['parts']:
 d=part['description']; value=None;unit=None;prop=None;qualifier='PARTIAL'
 rate=re.search(r'K=(\d+(?:\.\d+)?)N/MM',d)
 dims=re.search(r'(?<=,)\d+(?:\.\d+)?X\d+(?:\.\d+)?(?:X\d+(?:\.\d+)?)*(?=,|$|\()',d)
 if rate:
  prop='other';value=float(rate.group(1));unit='N/mm';qualifier='PARTIAL'
 elif dims:
  prop='dimensions';value=dims.group(0);unit=None
 elif re.search(r'(?:T=|L=)\d+(?:\.\d+)?',d):
  prop='dimensions';value=re.search(r'(?:T=|L=)\d+(?:\.\d+)?',d).group(0);unit=None
 else:continue
 fid=f"kawasaki-2025-kx450-{part['assembly_id']}-{part['callout']}-{prop}"
 conditions=['Exact OEM catalog label: '+d,'Catalog dimension notation only; not a complete drawing, tolerance, material grade or installation specification.']
 if not unit:conditions.append('Unit is not printed in this catalog label; no implicit mm/inch conversion has been made.')
 if part['remarks']:conditions.append('Catalog remarks: '+part['remarks'])
 if part['catalog_quantity_text']=='AR':conditions.append('As-required catalog item; installed quantity and selected size unknown.')
 facts.append(dict(id=fid,property=prop,joint=d+' (part '+part['part_number']+')',value=value,unit=unit,conditions=conditions,source_url=part['source_url'],locator=f"Part Item Information table; reference {part['callout']}; part {part['part_number']}",document_sha256=hashes[part['source_url']],document_revision='Live Kawasaki US parts catalog; captured 2026-09-13; publication revision not exposed',source_kind='webpage',hash_basis='SHA256 of canonical JSON serialization of browser-observed table name, URL and complete rows; not raw HTML bytes',review_status='APPROVED',field_completeness=qualifier,review_note='Exact US KX450MSFNN scope and full official row read. Value is bounded to explicit catalog notation. No torque, adjacent-year compatibility, units or tolerance inferred.'))
 mappings.append(dict(assembly_id=part['assembly_id'],callout=part['callout'],part_number=part['part_number'],fact_id=fid,property=prop,review_status='APPROVED',catalog_source_url=part['source_url'],review_note='Same exact official catalog occurrence supplies this partial field; complete dimension/tolerance specification remains unavailable.'))
j['facts']=facts;j['mappings']=mappings
j['gaps']=['Owner manual 99814-0003 public viewer destination recovered; viewer displays only skip-link, manual body unavailable. No new torque values approved.','All catalog parts captured; engine/WP/Showa torque, procedures, full tolerances and exact torque-to-joint mappings remain incomplete.','Partial catalog dimension strings retain null units where source label does not print units. No dimension or spring rate establishes torque.','2022–2026 KX250 and other KX450 years not inherited from2025.','Supersession discrepancy 92055-1011 versus dealer replacement92055-1021 unresolved.']
j['manual_source']={'catalog_url':'https://www.kawasaki.com/en-us/owner-center/service-manuals/2025/KX450MSFNN','item':'99814-0003','viewer_url':'https://pws.ktivs.net/dispeBook?file=99814-0003&lang_code=EN','observed_iframe_url':'https://pws.ktivs.net/proxy/manuals/99814-0003-o5kx450msf-us-en_ebook-e1cdd78aa5d28e4144984271960ae3b9/index.html','status':'BODY_UNAVAILABLE','repair_manual_item':'99830-0153-05','purchase_authorized':False}
(p/'2025-kx450.json').write_text(json.dumps(j,indent=2))
print({'facts':len(facts),'mappings':len(mappings),'spring_rates':sum(f['unit']=='N/mm' for f in facts)})
