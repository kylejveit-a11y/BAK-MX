"""Exact 2023 lower-bench source-reviewed authoring; no approval inheritance."""
import copy,hashlib,json
from pathlib import Path
OUT=Path(__file__).parent; ROOT=OUT.parents[3]
PDF=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-10_02.pdf')
SHA='9a8605e26301ba1d0d1d21e93d23cca721bdcdbece6188775626a8819332aa9f'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-10_02.pdf'
TEMPLATE=ROOT/'docs/research/workshop-pass10/yamaha-2024-engine/lower-engine-bench-v1.procedure.json'
TEMPLATE_SHA='15a08ca72cf2c86a03d4458dd6ecc501b44738cc2fc4b817d560e1f3fe354d1e'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert sha(PDF)==SHA and sha(TEMPLATE)==TEMPLATE_SHA
DEST=OUT/'lower-engine-bench-v1.procedure.json'
assert not DEST.exists() or json.loads(DEST.read_text(encoding='utf-8'))['publication_status']!='APPROVED'
PAGES={
'entry':[240,242,261,268],'generator-cover-out':[231,233],'rotor-out':[234],
'clutch-out':[240,241,244],'boss-out':[241,244],'right-cover-out':[92,93,242],
'release-out':[243],'shift-out':[250,251,252],'drive-out':[255,256,257],
'pump-out':[259,260],'chain-out':[261,265,269],'cases-open':[262,265],
'transmission-out':[271,272,273,274],'crank-out':[268,269],'case-clean':[22,262,265,266],
'bearings':[8,22,263,264,266],'drive-seal':[22,263,266],'crank-check':[269,270],
'gearbox-check':[274,275],'gearbox-build':[8,22,271,272,273,275,276],
'crank-in':[263,264,268,269,270],'transmission-in':[276,277],'shift-bars-in':[277],
'nozzles-strainer':[8,261,262,266,267],'cases-close':[262,266,267],
'chain-in':[261,265,269],'pump-inspect':[260],'pump-build':[22,259,260],
'drives-inspect':[245,257],'balancer-in':[22,255,257,258],'primary-in':[8,22,255,256,258],
'shift-inspect':[252],'shift-restore':[8,250,252,253],'shift-shaft':[22,250,253],
'release-check':[245,246],'release-in':[243,246,247],'right-cover-in':[242,246,247],
'filter-in':[92,93,242],'clutch-inspect':[244,245,246],
'clutch-base':[240,241,247],'clutch-nut':[8,240,247,248],
'clutch-pack':[241,248],'pressure-plate':[22,248,249],'clutch-cover':[240,249],
'rotor-check':[234,235],'generator-cover-in':[93,231,235],'exit':[47,93,261,267,277]}
d=copy.deepcopy(json.loads(TEMPLATE.read_text(encoding='utf-8')))
assert set(PAGES)=={s['id'] for s in d['steps']}
d['id']='yamaha-2023-yz450f-lower-engine-bench-v1';d['target']['model_year']=2023
d['publication_status']='PENDING_INDEPENDENT_REVIEW'
d['applicability']['included']='Exact standard US 2023 YZ450F stock lower engine with sound retained cases.'
for s in d['steps']:
 s['source_pdf_pages']=PAGES[s['id']];s['source_links']=[URL+'#page='+str(p) for p in PAGES[s['id']]]
 s['origin']='Original authored summary independently checked against exact 2023 OEM text and rendered diagrams; structural workflow reuse only, without inherited approval.'
 if s['id']=='entry':s['instruction']=s['instruction'].replace('US 2024 YZ450F','US 2023 YZ450F')
 if s['id']=='exit':s['instruction']=s['instruction'].replace('exact 2024 top-end','exact 2023 top-end')
pages=sorted({p for s in d['steps'] for p in s['source_pdf_pages']})
labels={8:'Symbols (unnumbered)',22:'1-10',47:'2-2',92:'3-14',93:'3-15'}
labels.update({p:'5-'+str(p-196) for p in range(231,278)})
d['source']=dict(source_url=URL,document_sha256=SHA,document_revision='BHR-2819U-10 / LIT-11626-36-32; YZ450FP 2023',pdf_pages=pages,printed_pages=[labels[p] for p in pages],review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact 2023 text and rendered diagrams reviewed for every cited lower-engine operation. Independent review pending.')
save(DEST,d)
review=dict(schema_version=1,status='AUTHOR_SOURCE_REVIEWED',source_sha256=SHA,template_sha256=TEMPLATE_SHA,template_usage='Original structure and prose only; all 47 instructions and verification statements read against exact 2023 text and diagrams.',step_review=[dict(step_id=s['id'],source_pdf_pages=PAGES[s['id']],review='Exact 2023 text and rendered diagrams checked.') for s in d['steps']],differences=['General bearing, seal and circlip instructions are PDF22/printed1-10, not 2024 PDF23.','2023 circlip procedure spans275–276; both pages retained. Shift cam and shift drum refer to the illustrated indexed assembly; no parts interchangeability claim.','Exact2023 confirms primary120Nm engine oil, boss105Nm LOCTITE with washer/nut stack, shiftseal0–0.1mm LS, crank-only M arrow, identical depicted gearbox stacks and depths; no approval inherited from2024.','2023 PDF244 repeats pressure-plate damage inspection alongside spring check, also245. All pressure plates remain inspected.'])
save(OUT/'lower-author-review-v1.json',review)
save(OUT/'lower-source-review-manifest.json',dict(schema_version=1,status='PENDING_INDEPENDENT_REVIEW',sources=[dict(id='yamaha-us-2023-yz450f-oem',source_id='yamaha-us-2023-yz450f-oem',url=URL,sha256=SHA,local_pdf_path=str(PDF),pdf_pages=pages)],artifacts=[dict(path=DEST.name,kind='procedure',sha256=sha(DEST),source_id='yamaha-us-2023-yz450f-oem',target=d['target'],review_status='PENDING_INDEPENDENT_REVIEW')],author_review=dict(path='lower-author-review-v1.json',sha256=sha(OUT/'lower-author-review-v1.json'))))
print(len(d['steps']),sha(DEST))
