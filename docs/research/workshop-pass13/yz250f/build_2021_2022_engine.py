"""Exact B7B12/13 source-reviewed pair; preserve actual tool and oil-ring differences."""
import json,hashlib,copy,fitz,re
from pathlib import Path
B=Path(__file__).resolve().parent
rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
C={2021:('B7B-2819U-12_02','c2f65141ab95bdbe20d7bdd027bfdde93d2d79dbcb4ff0ccb54140ed7fb0578b','LIT-11626-34-25'),2022:('B7B-2819U-13_02','17e7cc840c86a2afe05fbe38a5197778932470ad4d57e0a78b08eed3e386bc4f','LIT-11626-35-11')}
mapping={1:1,4:4,52:48,61:57,91:82,219:201,220:202,221:203,222:204,223:205,224:206,226:208,227:209,228:210,229:211,231:213,232:214,233:215,234:216,235:217,236:218,237:219,238:220,239:221,240:222,241:223}
for y,(code,h,lit) in C.items():
 D=B/(str(y)+'-engine');D.mkdir(exist_ok=True);pdf=Path('C:/Users/kylej/AppData/Local/Temp')/(code+'.pdf');assert sha(pdf)==h;book=fitz.open(pdf);url='https://library.ymcapps.net/library/om/contents/pdf/10/'+code+'.pdf';arts=[]
 for name in ['top-end-teardown-inspection-v1','original-head-valve-reassembly-v1']:
  old=B/'2026-engine'/(name+'.procedure.json');d=copy.deepcopy(rd(old));out=D/old.name
  if out.exists():assert rd(out)['publication_status']!='APPROVED'
  d['id']=f'yamaha-{y}-yz250f-'+name;d['target']['model_year']=y;d['applicability']['included']=d['applicability']['included'].replace('US2026','US'+str(y));d['status']='SOURCE_REVIEW_CANDIDATE';d['publication_status']='PENDING_INDEPENDENT_REVIEW'
  if name.startswith('top-end'):
   d['steps'][0]['instruction']=d['steps'][0]['instruction'].replace('US 2026','US '+str(y));d['preflight'][1]='Head-bolt preparation remains conflicted: PDF57 summary specifies molybdenum disulfide oil while dedicated211 specifies molybdenum disulfide grease. Resolve before later head installation; this procedure selects neither.'
  for st in d['steps']:
   st['source_pdf_pages']=sorted({mapping[n] for n in st['source_pdf_pages']});st['source_links']=[url+'#page='+str(n) for n in st['source_pdf_pages']]
   if y==2021:
    st['instruction']=st['instruction'].replace('90890-04200','90890-04019')
    if st['id']=='ring-check':st['instruction']=st['instruction'].replace('replacement of the complete oil-ring set','replacement of all piston rings')
  if y==2021:
   for t in d['required_tools']:t['name']=t['name'].replace('90890-04200','90890-04019')
  ns=sorted({1,4}|{n for st in d['steps'] for n in st['source_pdf_pages']});labels=[]
  for n in ns:
   found=[(z[1],v) for z in book[n-1].get_text('blocks') for v in re.findall(r'(?m)^\d+-\d+$',z[4])];labels.append(str(n)+': '+(max(found)[1] if found else 'front matter'))
  d['source']={'source_url':url,'document_sha256':h,'document_revision':code.replace('_02','')+' / '+lit,'pdf_pages':ns,'printed_pages':labels,'review_status':'PENDING_INDEPENDENT_REVIEW','review_note':'Exact B7B numerical inspection text, component diagrams and year-specific tool/oil-ring disposition reviewed; independent review pending.'}
  d['authored_adaptation']={'structural_reference_sha256':sha(old),'method':'All mechanical paragraphs compared to exact B7B source;2021 tool and all-ring replacement differences retained. No inferred whole-bike compatibility.'}
  wr(out,d);arts.append({'path':out.name,'kind':'procedure','source_id':f'yamaha-us-{y}-yz250f-oem','sha256':sha(out),'target':d['target'],'step_count':len(d['steps'])})
 wr(D/'source-review-manifest.json',{'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':f'yamaha-us-{y}-yz250f-oem','url':url,'sha256':h,'local_pdf_path':str(pdf)}],'artifacts':arts})
 wr(D/'author-source-comparison.json',{'status':'AUTHOR_REVIEWED','source_sha256':h,'page_map':mapping,'visual_pages':[218,222] if y==2021 else [202,203,210,213,218,219,220],'text_review':'Exact2022 complete201–223 block compared to independently read2023 counterpart; only printed-page labels and internal page references differ. Exact2021 block compared with2022; all differences read, tool/ring exceptions applied. Exact47/48 wear specs and57 conflict checked separately.','meaningful_differences':['2021 valve compressor90890-04019 versus2022 90890-04200; US YM-04019 and22mm attachment unchanged.','2021 PDF222 excessive oil-rail gap replaces ALL piston rings;2022 replaces oil ring as a set. Numerical rail reuse limit remains unknown.','2021/22 intake-guide height10.8–11.2 on215 differs2024; guide renewal remains excluded.','Head57 oil versus211 grease contradiction retained; no closed-head/startup claim.'],'mechanical_text_pages_sha256':{str(n):hashlib.sha256(book[n-1].get_text().encode()).hexdigest() for n in [47,48,57,82]+list(range(201,224))}})
 print(y,[(a['path'],a['sha256']) for a in arts])
