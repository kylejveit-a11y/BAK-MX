"""Author exact2023 bench from individually source-checked2024 structure; never transfers approval."""
import copy,hashlib,json,ast
from pathlib import Path
OUT=Path(__file__).parent;ROOT=OUT.parents[3]
PDF=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-10_02.pdf')
SHA='9a8605e26301ba1d0d1d21e93d23cca721bdcdbece6188775626a8819332aa9f'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-10_02.pdf'
TEMPLATE=ROOT/'docs/research/workshop-pass10/yamaha-2024-engine/top-end-bench-v1.procedure.json'
TEMPLATE_SHA='03bc4efc8716d92f28af1e88ed84cc79620432324ff0461283538443c4712997'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert sha(PDF)==SHA and sha(TEMPLATE)==TEMPLATE_SHA
DEST=OUT/'top-end-bench-v1.procedure.json'
assert not DEST.exists() or json.loads(DEST.read_text(encoding='utf-8'))['publication_status']!='APPROVED'
d=copy.deepcopy(json.loads(TEMPLATE.read_text(encoding='utf-8')))
ledger=json.loads((OUT/'top-end-reviewed-step-pages.json').read_text())
assert ledger['source_sha256']==SHA and ledger['template_sha256']==TEMPLATE_SHA
PAGES={r['step_id']:r['source_pdf_pages'] for r in ledger['steps']}
assert set(PAGES)=={s['id'] for s in d['steps']}
d['id']='yamaha-2023-yz450f-top-end-bench-v1';d['target']['model_year']=2023;d['publication_status']='PENDING_INDEPENDENT_REVIEW'
d['applicability']['included']='Exact standard US2023 YZ450F stock top-end parts; retained sound head/caps/lifters and sound lower engine.'
d['entry_state'][0]='Exact2023 engine removed, drained, cold at room temperature and securely supported.'
for s in d['steps']:
 s['source_pdf_pages']=PAGES[s['id']];s['source_links']=[URL+'#page='+str(p) for p in PAGES[s['id']]]
 s['origin']='Original authored summary checked against exact US2023 OEM text and rendered diagrams. Structure reused after per-step source review; no year approval or parts compatibility inherited.'
 if s['id']=='entry':s['instruction']=s['instruction'].replace('US 2024 YZ450F','US 2023 YZ450F')
 if s['id']=='exit':s['instruction']=s['instruction'].replace('exact 2024 engine','exact 2023 engine')
pages=sorted({p for s in d['steps'] for p in s['source_pdf_pages']});labels={8:'Symbols (unnumbered)',48:'2-3',85:'3-7',86:'3-8',87:'3-9',88:'3-10',89:'3-11',91:'3-13'};labels.update({p:'5-'+str(p-196) for p in range(206,231)})
d['source']=dict(source_url=URL,document_sha256=SHA,document_revision='BHR-2819U-10 / LIT-11626-36-32; YZ450FP2023; first edition July2022',pdf_pages=pages,printed_pages=[labels[p] for p in pages],review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact2023 author visual review PDF8/48/85–89/91/206–230. Head/cam orders, valve-guide and distinct lapping/running valves, actual shim charts, ring/pin/fit diagrams independently checked. Independent review pending.')
save(DEST,d)
author=dict(schema_version=1,status='AUTHOR_SOURCE_REVIEWED',source_sha256=SHA,template_sha256=TEMPLATE_SHA,step_ledger=dict(path='top-end-reviewed-step-pages.json',sha256=sha(OUT/'top-end-reviewed-step-pages.json')),differences=['2023 crank turning instruction starts211 and finishes212; both are bound to timing checks.','2023 piston clip warning fits229;230 retains exact orientation and gap diagram; both are bound.','Exact guide installer04015, head36 then individual18+90 then all60, numeric fits and procedures agree after direct review. This is not a parts-interchangeability claim.','No source approval inherited; this is a bench candidate with separate exact-year access/refit/commissioning.'])
save(OUT/'top-end-author-review-v1.json',author)
save(OUT/'source-review-manifest.json',dict(schema_version=1,status='PENDING_INDEPENDENT_REVIEW',sources=[dict(id='yamaha-us-2023-yz450f-oem',source_id='yamaha-us-2023-yz450f-oem',url=URL,sha256=SHA,local_pdf_path=str(PDF),pdf_pages=pages)],artifacts=[dict(path=DEST.name,kind='procedure',sha256=sha(DEST),source_id='yamaha-us-2023-yz450f-oem',target=d['target'],review_status='PENDING_INDEPENDENT_REVIEW')],author_review=dict(path='top-end-author-review-v1.json',sha256=sha(OUT/'top-end-author-review-v1.json'))))
print(len(d['steps']),sha(DEST))
