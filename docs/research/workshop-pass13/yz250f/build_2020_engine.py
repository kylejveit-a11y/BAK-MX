"""Exact2020 authoring; explicit section mapping and checked mechanical differences."""
import json,hashlib,copy,fitz,re
from pathlib import Path
B=Path(__file__).resolve().parent;D=B/'2020-engine';D.mkdir(exist_ok=True)
rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
code='B7B-28199-11_02';h='0a680d50262a0cab7323e3b97bf0565d358a726852610ee41ed48d747a4cd054';pdf=Path('C:/Users/kylej/AppData/Local/Temp')/(code+'.pdf');assert sha(pdf)==h
book=fitz.open(pdf);url='https://library.ymcapps.net/library/om/contents/pdf/10/'+code+'.pdf'
mapping={1:1,4:4,52:48,61:57,91:82,219:198,220:199,221:200,222:201,223:202,224:203,226:206,227:207,228:208,229:209,231:211,232:212,233:213,234:214,235:215,236:216,237:217,238:218,239:219,240:220,241:221}
arts=[]
for name in ['top-end-teardown-inspection-v1','original-head-valve-reassembly-v1']:
 old=B/'2026-engine'/(name+'.procedure.json');d=copy.deepcopy(rd(old));out=D/old.name
 if out.exists():assert rd(out)['publication_status']!='APPROVED'
 d['id']='yamaha-2020-yz250f-'+name;d['target']['model_year']=2020;d['applicability']['included']=d['applicability']['included'].replace('US2026','US2020');d['status']='SOURCE_REVIEW_CANDIDATE';d['publication_status']='PENDING_INDEPENDENT_REVIEW'
 if name.startswith('top-end'):
  d['steps'][0]['instruction']=d['steps'][0]['instruction'].replace('US 2026','US 2020');d['preflight'][1]='Head-bolt preparation remains conflicted: PDF57 summary specifies molybdenum disulfide oil while dedicated209 specifies molybdenum disulfide grease. Resolve before later head installation; this procedure selects neither.'
 for st in d['steps']:
  st['source_pdf_pages']=sorted({mapping[n] for n in st['source_pdf_pages']});st['instruction']=st['instruction'].replace('90890-04200','90890-04019')
  if st['id']=='cam-lobes':st['instruction']=st['instruction'].replace('33.460','33.750')+' Measure camshaft runout on the illustrated supports with a dial indicator; the limit is 0.030 mm. Record the reading and replace a failed camshaft.'
  if st['id']=='valve-runout':st['instruction']=st['instruction'].replace('0.020','0.010')
  if st['id']=='ring-check':st['instruction']=st['instruction'].replace('replacement of the complete oil-ring set','replacement of all piston rings').replace('limit 0.50 mm','standard installed gap 0.15–0.25 mm, service limit 0.50 mm')
  if st['id']=='stem-guide':st['instruction']+=' Standard stem-to-guide clearance is intake 0.010–0.037 mm and exhaust 0.025–0.052 mm; retain both the standard ranges and wear limits in the inspection record.'
  if st['id']=='seat-contact':st['instruction']+=' Standard contact width is 0.90–1.10 mm for either valve type.'
  if st['id']=='timing-condition':st['source_pdf_pages']=sorted(set(st['source_pdf_pages']+[203]))
  if 216 in st['source_pdf_pages'] and name.startswith('original-head'):st['source_pdf_pages']=sorted(set(st['source_pdf_pages']+[217]))
  st['source_links']=[url+'#page='+str(n) for n in st['source_pdf_pages']]
 for t in d['required_tools']:t['name']=t['name'].replace('90890-04200','90890-04019')
 ns=sorted({1,4}|{n for st in d['steps'] for n in st['source_pdf_pages']});labels=[]
 for n in ns:
  found=[(z[1],v) for z in book[n-1].get_text('blocks') for v in re.findall(r'(?m)^\d+-\d+$',z[4])];labels.append(str(n)+': '+(max(found)[1] if found else 'front matter'))
 d['source']={'source_url':url,'document_sha256':h,'document_revision':code.replace('_02','')+' / LIT-11626-33-11','pdf_pages':ns,'printed_pages':labels,'review_status':'PENDING_INDEPENDENT_REVIEW','review_note':'Exact2020 mechanical text and diagrams reviewed, with changed cam, valve and ring requirements. Independent review pending.'}
 d['authored_adaptation']={'structural_reference_sha256':sha(old),'method':'Exact2020 section review with explicit page map and independent numeric differences; no inferred whole-bike compatibility.'}
 wr(out,d);arts.append({'path':out.name,'kind':'procedure','source_id':'yamaha-us-2020-yz250f-oem','sha256':sha(out),'target':d['target'],'step_count':len(d['steps'])})
wr(D/'source-review-manifest.json',{'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':'yamaha-us-2020-yz250f-oem','url':url,'sha256':h,'local_pdf_path':str(pdf)}],'artifacts':arts})
wr(D/'author-source-comparison.json',{'status':'AUTHOR_REVIEWED','source_sha256':h,'page_map':mapping,'visual_pages':[199,200,201,208,214,216,217,218,220],'text_review':'Exact2020 engine197–221, specification48/49, summary57 and cold-check82 read; layouts and changed dimensions reviewed visually. Explicit section mapping, not constant offset.','meaningful_differences':['Exhaust cam minimum33.750 versus later33.460 mm; cam runout0.030 mm.','Valve stem runout0.010 versus later0.020 mm.','Compressor90890-04019;22mm04108/YM04108.','Top-ring normal installed gap0.15–0.25 mm; excessive oil-rail gap replaces all piston rings.','Head57 oil versus209 grease contradiction retained; no head installation or closed-engine claim.'],'mechanical_text_pages_sha256':{str(n):hashlib.sha256(book[n-1].get_text().encode()).hexdigest() for n in [48,49,57,82]+list(range(197,222))}})
print([(a['path'],a['sha256']) for a in arts])
