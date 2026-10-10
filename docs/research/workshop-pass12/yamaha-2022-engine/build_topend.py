"""Exact B2W source-based top-end authoring; explicit reviewed step ledger."""
import copy,hashlib,json
from pathlib import Path
OUT=Path(__file__).parent;ROOT=OUT.parents[3]
PDF=Path('C:/Users/kylej/AppData/Local/Temp/B2W-2819U-12_02.pdf')
SHA='54b246fb2956c8970193b54cce160544ece74a7259169a188b6aacd8c9dd4608'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/B2W-2819U-12_02.pdf'
TEMPLATE=ROOT/'docs/research/workshop-pass11/yamaha-2023-engine/top-end-bench-v1.procedure.json'
TEMPLATE_SHA='5465c9014294095e4ca146287c352444baccc5c0ffc3ccf016dc19e74a27a8ee'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert sha(PDF)==SHA and sha(TEMPLATE)==TEMPLATE_SHA
DEST=OUT/'top-end-bench-v1.procedure.json'
assert not DEST.exists() or json.loads(DEST.read_text(encoding='utf-8'))['publication_status']!='APPROVED'
PAGES={
'entry':[82,199,206,218],'cover':[88,199],'timing-access':[200,201],'tdc':[82,201],
'clearances-before':[82],'tensioner-out':[200,201],'cams-out':[200,201,202],
'tensioner-check':[203],'head-out':[206,208],'head-condition':[208],
'cylinder-out':[218,219],'piston-out':[219],'bore':[219],'piston-fit':[48,219,220],
'ring-side':[220],'ring-end':[220,221],'pin-fit':[48,221],'parts-accepted':[219,220,221],
'lifters-out':[212],'sealing-before':[212],'valves-out':[211,212,213],
'valve-guide-fit':[48,213,214],'seats':[214,215],'springs-lifters':[48,215,216],
'head-path':[213,214,215,216],'guides-prepare':[214,215],'guides-out':[213,214],
'guides-in':[213,214],'guides-ream':[48,213,214],'seats-reface':[213,215],
'lap-coarse':[215],'lap-fine':[214,215],'running-valves':[215],
'valves-in':[8,211,216],'cotters':[216,217],'sealing-final':[212,215],
'pads-return':[217],'cam-lobes':[202],'cam-clearance':[202],
'cam-disposition':[202,203],'rings-in':[221],'piston-in':[221,222],
'ring-clock':[222],'cylinder-in':[218,222],'head-in':[206,208,209],
'head-bolt-prep':[8,209],'head-first':[209],'head-second':[209,210],
'head-final':[54,206,209,210],'first-cams':[200,203,204],'first-caps':[200,204],
'first-tensioner':[200,204,205],'first-timing':[205],'first-measure':[82,84],
'adjust-path':[82,83,84],'adjust-cams-out':[83,200,201,202],
'adjust-select':[83,85,86],'adjust-pads-in':[83,84],
'adjust-cams':[200,203,204],'adjust-caps':[200,204],
'adjust-tensioner':[200,204,205],'adjust-timing':[205],
'adjust-measure':[82,84],'adjust-accept':[82,84],'cover-in':[199,205],
'ports-close':[8,88,200,205],'exit':[82,84,205]}
d=copy.deepcopy(json.loads(TEMPLATE.read_text(encoding='utf-8')))
assert set(PAGES)=={s['id'] for s in d['steps']}
d['id']='yamaha-2022-yz450f-top-end-bench-v1';d['target']['model_year']=2022
d['publication_status']='PENDING_INDEPENDENT_REVIEW'
d['applicability']['included']='Exact standard US2022 YZ450F stock top-end parts; retained sound head/caps/lifters and sound lower engine.'
d['entry_state'][0]='Exact2022 engine removed, drained, cold at room temperature and securely supported.'
d['required_parts'][7]['name']='ThreeBond 1215 / Yamaha bond No.1215 for head-cover gasket'
for s in d['steps']:
 s['source_pdf_pages']=PAGES[s['id']];s['source_links']=[URL+'#page='+str(p) for p in PAGES[s['id']]]
 s['origin']='Original authored summary verified against exact US2022 B2W text and rendered diagrams; structural reuse only, no inherited approval.'
 if s['id']=='entry':s['instruction']=s['instruction'].replace('US 2023 YZ450F','US 2022 YZ450F')
 if s['id']=='exit':s['instruction']=s['instruction'].replace('exact 2023 engine','exact 2022 engine')
 if s['id']=='head-out':s['instruction']=s['instruction'].replace('M6×45 mm','M6×35 mm').replace('M10×129 mm','M10×149 mm')
 if s['id']=='springs-lifters':s['instruction']=s['instruction'].replace('37.34 mm','35.55 mm')
 if s['id']=='cam-disposition':s['instruction']=s['instruction'].replace('22.002–22.015 mm','21.959–21.972 mm')
 if s['id']=='head-first':
  s['instruction']=s['instruction'].replace('36 N·m','40 N·m');s['verification']=['All four main bolts initially tightened to 40 N·m in the illustrated order.']
 if s['id']=='head-second':
  s['instruction']=s['instruction'].replace('18 N·m','23 N·m');s['verification']=['Each main bolt individually regreased, tightened to 23 N·m and turned 90° before the next is loosened.']
 if s['id']=='head-final':
  s['instruction']='In installation order 1–4 turn each main bolt a further 60°. Tighten the two small bolts at installation positions 5 and 6 to 10 N·m with clean, dry threads. The oil-passage plugs remain installed; their separate locking-agent arrows do not apply to these small head bolts.'
  s['verification']=['Final 60° on all four main bolts and 10 N·m on both small head bolts recorded.']
 if s['id'] in ['cams-out','adjust-cams-out']:
  s['instruction']+=' Account for and retain the two illustrated cam retaining clips without dropping them into the chain cavity.'
 if s['id'] in ['first-caps','adjust-caps']:
  s['instruction']='Protect the head cavity while fitting both retained cam clips so neither can fall inside; account for and remove that cloth before continuing. Install matching caps and dowels. Oil bolt threads and contact surfaces. Tighten evenly to 10 N·m in two or three stages using the exact seven-bolt numbered sequence in the diagram.'
  s['verification']=['Both clips, matching caps and seven bolts seated; 10 N·m sequence recorded; protective cloth removed.']
 if s['id']=='cover-in':s['instruction']=s['instruction'].replace('ThreeBond 1541C','ThreeBond 1215 / Yamaha bond No.1215')
 if s['id']=='ports-close':s['instruction']=s['instruction'].replace(', oil the screw threads,',',')
pages=sorted({p for s in d['steps'] for p in s['source_pdf_pages']})
labels={8:'Symbols (unnumbered)',48:'2-3',54:'2-9'}
labels.update({p:'3-'+str(p-76) for p in range(82,89)})
labels.update({p:'5-'+str(p-186) for p in range(199,223)})
d['source']=dict(source_url=URL,document_sha256=SHA,document_revision='B2W-2819U-12 / LIT-11626-35-03; US YZ450FN 2022',pdf_pages=pages,printed_pages=[labels[p] for p in pages],review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact2022 text and rendered diagrams checked for all operations; independent review pending.')
save(DEST,d)
review=dict(schema_version=1,status='AUTHOR_SOURCE_REVIEWED',source_sha256=SHA,template_sha256=TEMPLATE_SHA,step_review=[dict(step_id=s['id'],source_pdf_pages=PAGES[s['id']],review='Exact2022 text and diagrams checked.') for s in d['steps']],differences=['Head40 then individual23+90 then all60; small10Nm clean/dry. Separate oil plug LT is not inherited.','Seven cam cap bolts, two clips, exact new diagram; journal21.959–21.972mm.','Exhaustspring minimum35.55mm; cover1215.','Head bolts M6x35 and M10x149. Access-screw O-rings LS; no engine-oil thread instruction inherited.','Piston/lobe/clearance ranges individually checked and supported, not assumed different or inherited. Actual-fit ambiguity preserved.'])
save(OUT/'top-end-author-review-v1.json',review)
save(OUT/'source-review-manifest.json',dict(schema_version=1,status='PENDING_INDEPENDENT_REVIEW',sources=[dict(id='yamaha-us-2022-yz450f-oem',source_id='yamaha-us-2022-yz450f-oem',url=URL,sha256=SHA,local_pdf_path=str(PDF),pdf_pages=pages)],artifacts=[dict(path=DEST.name,kind='procedure',sha256=sha(DEST),source_id='yamaha-us-2022-yz450f-oem',target=d['target'],review_status='PENDING_INDEPENDENT_REVIEW')],author_review=dict(path='top-end-author-review-v1.json',sha256=sha(OUT/'top-end-author-review-v1.json'))))
print(len(d['steps']),sha(DEST))
