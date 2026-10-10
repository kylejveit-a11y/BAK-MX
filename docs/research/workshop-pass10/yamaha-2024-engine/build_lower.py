"""Exact 2024 lower-engine authoring; explicitly reviewed step ledger, no approval transfer."""
import copy,hashlib,json
from pathlib import Path
OUT=Path(__file__).parent;ROOT=OUT.parents[3]
PDF=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-11_02.pdf')
SHA='6e784b3b15fe1e131f0e385676ca2873e74d783ee2499ce561e595bcea9ca9be'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-11_02.pdf'
TEMPLATE=ROOT/'docs/research/workshop-pass9/yamaha-2025-engine/lower-engine-bench-v1.procedure.json'
TEMPLATE_SHA='47a147277f552cf86353a2277bfa5205b5d7719966c3e957cda86df0deb70e35'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert sha(PDF)==SHA and sha(TEMPLATE)==TEMPLATE_SHA
DEST=OUT/'lower-engine-bench-v1.procedure.json'
assert not DEST.exists() or json.loads(DEST.read_text(encoding='utf-8'))['publication_status']!='APPROVED','Frozen artifact'
PAGES={
'entry':[240,242,261,268],'generator-cover-out':[231,233],'rotor-out':[234],
'clutch-out':[240,241,244],'boss-out':[241,244],'right-cover-out':[92,93,242],
'release-out':[243],'shift-out':[250,251,252],'drive-out':[255,256,257],
'pump-out':[259,260],'chain-out':[261,265,269],'cases-open':[262,265],
'transmission-out':[271,272,273,274],'crank-out':[268,269],'case-clean':[23,262,265,266],
'bearings':[8,23,263,264,266],'drive-seal':[23,263,266],'crank-check':[269,270],
'gearbox-check':[274,275],'gearbox-build':[8,23,271,272,273,275,276],
'crank-in':[263,264,268,269,270],'transmission-in':[276,277],'shift-bars-in':[277],
'nozzles-strainer':[8,261,262,266,267],'cases-close':[262,266,267],
'chain-in':[261,265,269],'pump-inspect':[260],'pump-build':[23,259,260],
'drives-inspect':[245,257],'balancer-in':[23,255,257,258],'primary-in':[8,23,255,256,258],
'shift-inspect':[252],'shift-restore':[8,250,252,253],'shift-shaft':[23,250,253],
'release-check':[245,246],'release-in':[243,246,247],'right-cover-in':[242,246,247],
'filter-in':[92,93,242],'clutch-inspect':[244,245,246],
'clutch-base':[240,241,247],'clutch-nut':[8,240,247,248],
'clutch-pack':[241,248],'pressure-plate':[23,248,249],'clutch-cover':[240,249],
'rotor-check':[234,235],'generator-cover-in':[93,231,235],'exit':[47,93,261,267,277]}
d=copy.deepcopy(json.loads(TEMPLATE.read_text(encoding='utf-8')))
assert set(PAGES)=={s['id'] for s in d['steps']}
d['id']='yamaha-2024-yz450f-lower-engine-bench-v1';d['target']['model_year']=2024
d['publication_status']='PENDING_INDEPENDENT_REVIEW'
d['completeness']='Continuous bounded lower-bench route including required clutch/generator/shift/pump drives, case bearings, complete crank assembly and gearbox inspection/replacement. Separate top-end work, engine refitting and commissioning are required; pressed connecting-rod rebuilding is excluded.'
d['applicability']['included']='Exact standard US 2024 YZ450F stock lower engine with sound retained cases.'
d['required_tools'][1]['name']='Calibrated torque tools spanning 0.5–120 N·m; hand sockets and illustrated holding spanner'
for s in d['steps']:
 s['source_pdf_pages']=PAGES[s['id']];s['source_links']=[URL+'#page='+str(p) for p in PAGES[s['id']]]
 s['origin']='Original authored summary verified against exact 2024 OEM text and rendered diagrams; structural workflow reuse only, without inherited year approval.'
 if s['id']=='entry':s['instruction']=s['instruction'].replace('US 2025 YZ450F','US 2024 YZ450F')
 if s['id']=='exit':s['instruction']=s['instruction'].replace('exact 2025 top-end','exact 2024 top-end')
 if s['id']=='boss-out':s['instruction']=s['instruction'].replace('Remove spacer, washer, sleeve','Remove washer, sleeve')
 if s['id']=='shift-shaft':
  s['instruction']='Oil the shaft, then fit dowel/roller, return spring and collar in the diagram positions. Fit the correct new shift-shaft seal with lithium-soap-based grease on its lips, seating depth 0–0.1 mm at the illustrated datum. Keep its main lip toward the oil chamber and marked face outward. Confirm return action and shifting while rotating the transmission by hand.'
 if s['id']=='crank-in':s['instruction']=s['instruction'].replace('to both the crankshaft and balancer-shaft locations indicated by the arrows in the diagram','to the crankshaft location indicated by the arrow in the diagram')
 if s['id']=='primary-in':
  s['instruction']=s['instruction'].replace('Apply molybdenum disulfide grease to the washer contact and primary-nut threads/contact surface.','Apply engine oil to the washer contact and primary-nut threads/contact surface.').replace('130 N·m','120 N·m')
  s['verification']=['Engine-oil preparation, 120 N·m torque and damper closure recorded.']
 if s['id']=='clutch-base':
  s['instruction']='Fit washer, idle gear, collar, primary driven gear, washer, boss, six absorbers, sleeve and washer in the exact diagram order. Apply engine oil to the mainshaft and the washer, collar, driven-gear, absorber and sleeve locations marked by the oil arrows in the exploded diagram. Confirm every part is fully seated and correctly ordered before fitting the new nut.'
  s['verification']=['All washers, collar, absorbers and sleeve correctly located.']
 if s['id']=='clutch-nut':
  s['instruction']='Apply LOCTITE to the correct new boss nut and tighten to 105 N·m while holding the sleeve with clutch holder 90890-04199 / YM-91042 as illustrated. Stake the nut into the mainshaft cutouts after tightening.'
  s['verification']=['New nut, 105 N·m locking-agent preparation and stake recorded.']
 if s['id']=='clutch-pack':s['instruction']=s['instruction'].replace('The four blue-marked friction plates','The four friction plates marked with blue paint around the outer circumference of their pawls')
pages=sorted({p for s in d['steps'] for p in s['source_pdf_pages']})
labels={8:'Symbols (unnumbered)',23:'1-11',47:'2-2',92:'3-14',93:'3-15'}
labels.update({p:'5-'+str(p-196) for p in range(231,278)})
d['source']=dict(source_url=URL,document_sha256=SHA,document_revision='BHR-2819U-11 / LIT-11626-37-11; YZ450FR 2024',pdf_pages=pages,printed_pages=[labels[p] for p in pages],review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact 2024 text and rendered diagrams independently checked for all cited lower-engine sections. Changed primary preparation, clutch stack, shift-seal depth and crank grease arrows preserved. Independent reviewer approval pending.')
save(DEST,d)
ledger=dict(schema_version=1,status='AUTHOR_SOURCE_REVIEWED',source_sha256=SHA,template_sha256=TEMPLATE_SHA,template_usage='Structure and original prose only; every source instruction independently reviewed on exact 2024 pages. No calculated global page offset or inherited approval.',step_review=[dict(step_id=s['id'],source_pdf_pages=PAGES[s['id']],review='Exact 2024 text and rendered diagrams checked.') for s in d['steps']],differences=['Primary nut: 120 N·m with engine oil on washer contact and nut threads/contact; 2025 uses 130 N·m with molybdenum grease.','Clutch boss: washer then new nut; no separate 2025 spacer, step-catch warning or free-washer check inherited. Nut 105 N·m LOCTITE and staking retained from exact 2024.','Shift-shaft seal: 0–0.1 mm in 2024 PDF 250/251; 2025 PDF 255 has 0–1.0 mm. Both use LS. An initial low-resolution S reading for 2025 was withdrawn after enlarged source review; no grease discrepancy remains.','Crank diagram 2024 PDF 268/270 identifies M grease on crank only; 2025 diagram has additional balancer arrow. Bearings remain oiled per exact 2024 case diagrams.','Painted friction plates identified by blue paint around pawl circumference; exact 2024 pack diagram retained.'])
save(OUT/'lower-author-review-v1.json',ledger)
save(OUT/'lower-source-review-manifest.json',dict(schema_version=1,status='PENDING_INDEPENDENT_REVIEW',sources=[dict(id='yamaha-us-2024-yz450f-oem',source_id='yamaha-us-2024-yz450f-oem',url=URL,sha256=SHA,local_pdf_path=str(PDF),pdf_pages=pages)],artifacts=[dict(path=DEST.name,kind='procedure',sha256=sha(DEST),source_id='yamaha-us-2024-yz450f-oem',target=d['target'],review_status='PENDING_INDEPENDENT_REVIEW')],author_review=dict(path='lower-author-review-v1.json',sha256=sha(OUT/'lower-author-review-v1.json'))))
print(len(d['steps']),sha(DEST))
