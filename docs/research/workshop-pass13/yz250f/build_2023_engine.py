"""BSB-only reviewed candidate; guide renewal differences remain excluded and recorded."""
import json,hashlib,copy,fitz,re
from pathlib import Path
B=Path(__file__).resolve().parent;D=B/'2023-engine';D.mkdir(exist_ok=True)
rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pdf=Path('C:/Users/kylej/AppData/Local/Temp/BSB-2819U-10_02.pdf');h='d0a100edf6abb20bc424fe6f0924e007993abb0a81c0893ea09088efa3689217';assert sha(pdf)==h
book=fitz.open(pdf);url='https://library.ymcapps.net/library/om/contents/pdf/10/BSB-2819U-10_02.pdf'
mapping={1:1,4:4,52:46,61:55,91:80,219:198,220:199,221:200,222:201,223:202,224:203,226:205,227:206,228:207,229:208,231:210,232:211,233:212,234:213,235:214,236:215,237:216,238:217,239:218,240:219,241:220}
arts=[]
for name in ['top-end-teardown-inspection-v1','original-head-valve-reassembly-v1']:
 old=B/'2026-engine'/(name+'.procedure.json');d=copy.deepcopy(rd(old));out=D/old.name
 if out.exists():assert rd(out)['publication_status']!='APPROVED'
 d['id']='yamaha-2023-yz250f-'+name;d['target']['model_year']=2023;d['applicability']['included']=d['applicability']['included'].replace('US2026','US2023')
 d['status']='SOURCE_REVIEW_CANDIDATE';d['publication_status']='PENDING_INDEPENDENT_REVIEW'
 if name.startswith('top-end'):
  d['steps'][0]['instruction']=d['steps'][0]['instruction'].replace('US 2026','US 2023')
  d['preflight'][1]='Head-bolt preparation remains conflicted: PDF55 summary specifies molybdenum disulfide oil while dedicated208 specifies molybdenum disulfide grease. Resolve before later head installation; this procedure selects neither.'
 for st in d['steps']:
  st['source_pdf_pages']=sorted({mapping[n] for n in st['source_pdf_pages']});st['source_links']=[url+'#page='+str(n) for n in st['source_pdf_pages']]
 ns=sorted({1,4}|{n for st in d['steps'] for n in st['source_pdf_pages']});labels=[]
 for n in ns:
  found=[(z[1],v) for z in book[n-1].get_text('blocks') for v in re.findall(r'(?m)^\d+-\d+$',z[4])];labels.append(str(n)+': '+(max(found)[1] if found else 'front matter'))
 d['source']={'source_url':url,'document_sha256':h,'document_revision':'BSB-2819U-10 / LIT-11626-36-26','pdf_pages':ns,'printed_pages':labels,'review_status':'PENDING_INDEPENDENT_REVIEW','review_note':'Exact BSB wear specs45/46, cam198–203, head205–216 and piston217–220 independently checked. No guide-renewal applicability inherited.'}
 d['authored_adaptation']={'structural_reference_sha256':sha(old),'method':'Exact source-reviewed bounded instruction reuse only;2023 engine visual configuration and intake-guide installed height differ from2024. Original retained guides only, no guide-renewal action.'}
 wr(out,d);arts.append({'path':out.name,'kind':'procedure','source_id':'yamaha-us-2023-yz250f-oem','sha256':sha(out),'target':d['target'],'step_count':len(d['steps'])})
wr(D/'source-review-manifest.json',{'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':'yamaha-us-2023-yz250f-oem','url':url,'sha256':h,'local_pdf_path':str(pdf)}],'artifacts':arts})
wr(D/'author-source-comparison.json',{'status':'AUTHOR_REVIEWED','source_sha256':h,'page_map':mapping,'visual_pages':[199,200,207,210,215,216,217],'text_pages':[45,46,55,198,199,200,201,202,203,205,206,207,208,211,212,213,214,215,216,218,219,220],'meaningful_differences':['2023 intake-guide installed height is10.8–11.2mm on212 versus2024 11.8–12.2mm on227. No guide renewal included in these operations.','2023 engine and timing-access views differ; correct199/200 diagrams linked.','Source55 oil versus208 grease head-bolt conflict retained.','Exact bounded inspection numbers, original-part positions, spring orientation and new stem seals match; this does not establish whole-bike or interchangeable-head applicability.']})
print([(a['path'],a['sha256']) for a in arts])
