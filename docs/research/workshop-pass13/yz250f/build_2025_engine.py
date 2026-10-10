"""Exact D01 source comparison then bounded candidate authoring; no inherited approval."""
import json,hashlib,fitz,copy,difflib
from pathlib import Path
B=Path(__file__).resolve().parent;D=B/'2025-engine';D.mkdir(exist_ok=True)
rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pdf=Path('C:/Users/kylej/AppData/Local/Temp/D01-2819U-10_02.pdf');h='fc8a31623daae1c746126688fac22c0b0698611a03dc98083876d2a3516a96da';assert sha(pdf)==h
book=fitz.open(pdf);ref=fitz.open('C:/Users/kylej/AppData/Local/Temp/DR8-2819U-10_02.pdf');url='https://library.ymcapps.net/library/om/contents/pdf/10/D01-2819U-10_02.pdf';arts=[];audit={}
for name in ['top-end-teardown-inspection-v1','original-head-valve-reassembly-v1']:
 old=B/'2026-engine'/(name+'.procedure.json');d=copy.deepcopy(rd(old));out=D/old.name
 if out.exists():assert rd(out)['publication_status']!='APPROVED'
 for n in d['source']['pdf_pages']:
  txt=book[n-1].get_text();prior=ref[n-1].get_text()
  if n not in [1,52]:assert txt==prior,'Unreviewed source difference: '+str(n)
  audit[str(n)]={'source_text_sha256':hashlib.sha256(txt.encode()).hexdigest(),'exact_text_equal_2026':txt==prior}
 d['id']='yamaha-2025-yz250f-'+name;d['target']['model_year']=2025
 d['applicability']['included']=d['applicability']['included'].replace('US2026','US2025')
 d['status']='SOURCE_REVIEW_CANDIDATE';d['publication_status']='PENDING_INDEPENDENT_REVIEW'
 if name.startswith('top-end'):d['steps'][0]['instruction']=d['steps'][0]['instruction'].replace('US 2026','US 2025')
 for st in d['steps']:st['source_links']=[url+'#page='+str(n) for n in st['source_pdf_pages']]
 d['source']['source_url']=url;d['source']['document_sha256']=h;d['source']['document_revision']='D01-2819U-10 / LIT-11626-38-27';d['source']['review_status']='PENDING_INDEPENDENT_REVIEW';d['source']['review_note']='Exact D01 source text for each mechanical page compared, values read and critical cam/head/valve diagrams independently rendered; independent review pending.'
 d['authored_adaptation']={'structural_reference_sha256':sha(old),'method':'Exact mechanical source-page text equality verified, not assumed model-year compatibility. All existing bounded exclusions preserved. Candidate requires independent approval.'}
 wr(out,d);arts.append({'path':out.name,'kind':'procedure','source_id':'yamaha-us-2025-yz250f-oem','sha256':sha(out),'target':d['target'],'step_count':len(d['steps'])})
wr(D/'source-review-manifest.json',{'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':'yamaha-us-2025-yz250f-oem','url':url,'sha256':h,'local_pdf_path':str(pdf)}],'artifacts':arts})
wr(D/'author-source-comparison.json',{'status':'AUTHOR_REVIEWED','source_sha256':h,'pages':audit,'visual_pages':[220,228,229,236,237],'meaningful_differences':['Exact cover/model/revision2025.','PDF52 starts at exhaust clearance;2026 contains preceding intake row. Cited bore/ring/valve wear facts on52 unchanged; these guides do not prescribe cold valve-clearance adjustment.','Mechanical cam/head/valve/piston instructions and head preparation contradiction match exact text; no conflict resolution invented.'],'scope':'Prepared engine teardown/inspection24 and accepted original detached-head assembly9 only; no completed whole-engine rebuild.'})
print([(a['path'],a['sha256']) for a in arts])
