"""Explicit mechanically reviewed BMF page map, not an offset-based inheritance."""
import json,hashlib,copy,fitz,re
from pathlib import Path
B=Path(__file__).resolve().parent;D=B/'2024-engine';D.mkdir(exist_ok=True)
rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pdf=Path('C:/Users/kylej/AppData/Local/Temp/BMF-2819U-10_02.pdf');h='e88dc0d7a05400f011ce7a147d005e7e3e4aef282f3455840c05ac99c83d9330';assert sha(pdf)==h
book=fitz.open(pdf);url='https://library.ymcapps.net/library/om/contents/pdf/10/BMF-2819U-10_02.pdf'
page_map={1:1,4:4,52:50,61:59,91:89,219:213,220:214,221:215,222:216,223:217,224:218,226:220,227:221,228:222,229:223,231:225,232:226,233:227,234:228,235:229,236:230,237:231,238:232,239:233,240:234,241:235}
arts=[]
for name in ['top-end-teardown-inspection-v1','original-head-valve-reassembly-v1']:
 old=B/'2026-engine'/(name+'.procedure.json');d=copy.deepcopy(rd(old));out=D/old.name
 if out.exists():assert rd(out)['publication_status']!='APPROVED'
 d['id']='yamaha-2024-yz250f-'+name;d['target']['model_year']=2024;d['applicability']['included']=d['applicability']['included'].replace('US2026','US2024')
 d['status']='SOURCE_REVIEW_CANDIDATE';d['publication_status']='PENDING_INDEPENDENT_REVIEW'
 if name.startswith('top-end'):
  d['steps'][0]['instruction']=d['steps'][0]['instruction'].replace('US 2026','US 2024')
  d['preflight'][1]='Head-bolt preparation remains conflicted: PDF59 summary specifies molybdenum disulfide oil while dedicated223 specifies molybdenum disulfide grease. Resolve before later head installation; this procedure selects neither.'
 for st in d['steps']:
  st['source_pdf_pages']=sorted({page_map[n] for n in st['source_pdf_pages']});st['source_links']=[url+'#page='+str(n) for n in st['source_pdf_pages']]
 # The lobe and journal checks share216 in BMF; chain/tensioner begins217.
 for st in d['steps']:
  if st['id']=='cam-disposition':
   st['source_pdf_pages']=sorted(set(st['source_pdf_pages']+[216]));st['source_links']=[url+'#page='+str(n) for n in st['source_pdf_pages']]
 ns=sorted({1,4}|{n for st in d['steps'] for n in st['source_pdf_pages']});labels=[]
 for n in ns:
  found=[(z[1],v) for z in book[n-1].get_text('blocks') for v in re.findall(r'(?m)^\d+-\d+$',z[4])];labels.append(str(n)+': '+(max(found)[1] if found else 'front matter'))
 d['source']={'source_url':url,'document_sha256':h,'document_revision':'BMF-2819U-10 / LIT-11626-37-44','pdf_pages':ns,'printed_pages':labels,'review_status':'PENDING_INDEPENDENT_REVIEW','review_note':'Exact BMF cam/head/valve/piston text and critical diagrams independently checked; independent review pending.'}
 d['authored_adaptation']={'structural_reference_sha256':sha(old),'method':'Explicit reviewed section map; numerical wear limits, tool identities, part counts, orientation and lubrication separately checked against BMF. Reassembly conflict retained.'}
 wr(out,d);arts.append({'path':out.name,'kind':'procedure','source_id':'yamaha-us-2024-yz250f-oem','sha256':sha(out),'target':d['target'],'step_count':len(d['steps'])})
wr(D/'source-review-manifest.json',{'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':'yamaha-us-2024-yz250f-oem','url':url,'sha256':h,'local_pdf_path':str(pdf)}],'artifacts':arts})
wr(D/'author-source-comparison.json',{'status':'AUTHOR_REVIEWED','source_sha256':h,'page_map':page_map,'visual_pages':[214,215,216,222,225,230,231,232],'text_pages':[49,50,59,213,214,215,216,217,218,222,223,225,226,227,228,229,230,231,233,234,235],'meaningful_differences':['Specifications are49/50 rather than51/52; source52 is chassis and must not be retained.','BMF numerical cam checks are consolidated216; actual8-bolt cap diagram214 and timing/removal215 verified.','BMF head conflict is59 oil versus223 grease; no installation chosen.','Numbers within these bounded inspection/accepted-original assembly steps match exact BMF, including32.130/33.460 lobes,10Nm cap with E preparation,.028–.062 journal fit,77mm bore,.030–.055 piston fit and4mm measurement point.','2024 guides do not claim model-family compatibility or shared complete-bike architecture.']})
print([(a['path'],a['sha256']) for a in arts])
