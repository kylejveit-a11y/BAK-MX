"""2024 authoring from an individually reviewed step ledger. Never transfers approval."""
import copy, hashlib, json
from pathlib import Path
OUT=Path(__file__).parent
ROOT=OUT.parents[3]
PDF=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-11_02.pdf')
SHA='6e784b3b15fe1e131f0e385676ca2873e74d783ee2499ce561e595bcea9ca9be'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-11_02.pdf'
TEMPLATE=ROOT/'docs/research/workshop-pass9/yamaha-2025-engine/top-end-bench-v1.procedure.json'
TEMPLATE_SHA='168f728aa9c092015bac846833b06502964ed223fa58dc58295219240ccf8eb6'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert sha(PDF)==SHA and sha(TEMPLATE)==TEMPLATE_SHA
DEST=OUT/'top-end-bench-v1.procedure.json'
assert not DEST.exists() or json.loads(DEST.read_text(encoding='utf-8'))['publication_status']!='APPROVED','Frozen artifact'
# Exact 2024 locators, individually checked against rendered pages. These are not calculated offsets.
PAGES={
'entry':[85,213],'cover':[91,206],'timing-access':[85,207],'tdc':[85,208],
'clearances-before':[85],'tensioner-out':[207,208],'cams-out':[208],'tensioner-check':[210],
'head-out':[214,215],'head-condition':[215],'cylinder-out':[226,230],'piston-out':[227],
'bore':[227],'piston-fit':[228],'ring-side':[228],'ring-end':[228,229],
'pin-fit':[48,229],'parts-accepted':[48,227,228,229],'lifters-out':[220],'sealing-before':[220],
'valves-out':[220,221],'valve-guide-fit':[48,221,222],'seats':[222],'springs-lifters':[223,224],
'head-path':[221,222,223,224],'guides-prepare':[221,222,223],'guides-out':[221,222],
'guides-in':[221,222],'guides-ream':[48,221,222],'seats-reface':[221,223],
'lap-coarse':[223],'lap-fine':[222,223],'running-valves':[222,223],'valves-in':[224],
'cotters':[224,225],'sealing-final':[220,222,223],'pads-return':[225],'cam-lobes':[209],
'cam-clearance':[209],'cam-disposition':[209,210],'rings-in':[229],'piston-in':[229,230],
'ring-clock':[230],'cylinder-in':[226,230],'head-in':[215,216],'head-bolt-prep':[216],
'head-first':[216],'head-second':[216,217],'head-final':[8,216,217],
'first-cams':[210,211],'first-caps':[207,211],'first-tensioner':[207,211,212],
'first-timing':[212],'first-measure':[85,87],'adjust-path':[85,86,87],
'adjust-cams-out':[86,207,208],'adjust-select':[86,88,89],'adjust-pads-in':[86,87],
'adjust-cams':[210,211],'adjust-caps':[207,211],'adjust-tensioner':[207,211,212],
'adjust-timing':[212],'adjust-measure':[85,87],'adjust-accept':[87],'cover-in':[206,212],
'ports-close':[91,207,212],'exit':[85,87,212,217,223,230]}
d=copy.deepcopy(json.loads(TEMPLATE.read_text(encoding='utf-8')))
assert set(PAGES)=={s['id'] for s in d['steps']}
d['id']='yamaha-2024-yz450f-top-end-bench-v1'
d['target']['model_year']=2024
d['publication_status']='PENDING_INDEPENDENT_REVIEW'
d['applicability']['included']='Exact standard US 2024 YZ450F stock top-end parts; retained sound head/caps/lifters and sound lower engine.'
d['entry_state'][0]='Exact 2024 engine removed, drained, cold at room temperature and securely supported.'
d['required_tools'][-1]['name']='For guide renewal: oven/temperature measurement, 5.5 mm remover/installer set 90890-04016; YM-01122 remover only; guide installer 90890-04015 / YM-04015; reamer 90890-01196 / YM-01196; arranged professional seat refacing'
for s in d['steps']:
 s['source_pdf_pages']=PAGES[s['id']]
 s['source_links']=[URL+'#page='+str(p) for p in PAGES[s['id']]]
 s['origin']='Original authored summary checked against exact 2024 OEM text and rendered diagrams; workflow structure reused only after source review. No inherited year approval.'
 if s['id']=='entry':s['instruction']=s['instruction'].replace('US 2025 YZ450F','US 2024 YZ450F')
 if s['id']=='exit':s['instruction']=s['instruction'].replace('exact 2025 engine','exact 2024 engine')
 if s['id']=='guides-in':s['instruction']=s['instruction'].replace('illustrated guide installer and remover','illustrated 5.5 mm guide installer 90890-04015 / YM-04015 and remover')
pages=sorted({p for s in d['steps'] for p in s['source_pdf_pages']})
labels={8:'Symbols (unnumbered)',48:'2-3',85:'3-7',86:'3-8',87:'3-9',88:'3-10',89:'3-11',91:'3-13'}
labels.update({p:'5-'+str(p-196) for p in range(206,231)})
d['source']=dict(source_url=URL,document_sha256=SHA,document_revision='BHR-2819U-11 / LIT-11626-37-11; YZ450FR 2024',pdf_pages=pages,printed_pages=[labels[p] for p in pages],review_status='PENDING_INDEPENDENT_REVIEW',review_note='Author visually checked exact 2024 PDF 8, 47–48, 85–91 and 206–230, including head/cam orders, guide installation, lapping/new-running-valve distinction, measurement diagrams and both actual pad charts. Independent review pending.')
save(DEST,d)
ledger=dict(schema_version=1,status='AUTHOR_SOURCE_REVIEWED',source_sha256=SHA,template_sha256=TEMPLATE_SHA,template_usage='Structure and original prose only. Exact 2024 step pages, numeric values, preparation and diagrams reviewed independently; no approval inherited.',step_review=[dict(step_id=s['id'],source_pdf_pages=PAGES[s['id']],review='Exact 2024 text and rendered source checked; shared method supported by this source, not presumed generation inheritance.') for s in d['steps']],differences=['2024 source explicitly lists separate guide installer 90890-04015 / YM-04015 on PDF 222; required tools and installation instruction now identify it.','Top-end values, head/cam sequences, fit measurements, new-guide/new-valve requirements and chart-based adjustment independently agree with the retained structure.','Bench scope excludes lower timing-drive replacement and assembled-bike refit/commissioning. These are separate exact-year operations.'])
save(OUT/'top-end-author-review-v1.json',ledger)
save(OUT/'source-review-manifest.json',dict(schema_version=1,status='PENDING_INDEPENDENT_REVIEW',sources=[dict(id='yamaha-us-2024-yz450f-oem',source_id='yamaha-us-2024-yz450f-oem',url=URL,sha256=SHA,local_pdf_path=str(PDF),pdf_pages=pages)],artifacts=[dict(path=DEST.name,kind='procedure',sha256=sha(DEST),source_id='yamaha-us-2024-yz450f-oem',target=d['target'],review_status='PENDING_INDEPENDENT_REVIEW')],author_review=dict(path='top-end-author-review-v1.json',sha256=sha(OUT/'top-end-author-review-v1.json'))))
print(len(d['steps']),sha(DEST))
