"""Explicit exact-source2027 setup adaptation; preserve every prior approved byte."""
import json,hashlib,copy,fitz,re
from pathlib import Path
B=Path(__file__).resolve().parent;D=B/'2027';D.mkdir(exist_ok=True)
rd=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pdf=Path('C:/Users/kylej/AppData/Local/Temp/bakmx-pass13/D05-2819U-10_02.pdf');h='ee02280139498348008b90fa4fed317228500c47caf76eb1712d1669e19d1578';assert sha(pdf)==h
book=fitz.open(pdf);url='https://library.ymcapps.net/library/om/contents/pdf/10/D05-2819U-10_02.pdf';arts=[]
# Each mapped page was separately read/rendered in D05: no offset inference.
pages={113:117,114:118,115:119,116:120,117:121,390:412,391:413}
for name in ['fork-baseline-v1','shock-baseline-v1','rider-sag-preload-v1']:
 old=B/'2026'/(name+'.procedure.json');d=copy.deepcopy(rd(old));out=D/old.name
 if out.exists():assert rd(out)['publication_status']!='APPROVED'
 d['target']['model_year']=2027;d['id']='yamaha-2027-yz250f-'+name
 d['status']='SOURCE_REVIEW_CANDIDATE';d['publication_status']='PENDING_INDEPENDENT_REVIEW'
 d['applicability']['included']='Exact standard US2027 Yamaha YZ250F with original stock suspension.'
 for st in d['steps']:
  st['source_pdf_pages']=sorted({pages[n] for n in st['source_pdf_pages']})
  if name=='fork-baseline-v1' and st['id']=='compression':
   st['instruction']=st['instruction'].replace('13 clicks','12 clicks');st['source_pdf_pages']=[118,119]
  if name=='fork-baseline-v1' and st['id']=='verify':st['instruction']=st['instruction'].replace('compression 13','compression 12')
  if name=='shock-baseline-v1':
   if st['id']=='rebound':st['instruction']=st['instruction'].replace('12 clicks','13 clicks')
   if st['id']=='high':st['instruction']=st['instruction'].replace('1 1/2','1 5/8')
   if st['id']=='low':st['instruction']=st['instruction'].replace('12 clicks','8 clicks')
   if st['id']=='verify':st['instruction']=st['instruction'].replace('rebound 12','rebound 13').replace('1 1/2','1 5/8').replace('compression 12 clicks','compression 8 clicks')
  if name=='rider-sag-preload-v1' and st['id']=='preload':st['instruction']=st['instruction'].replace('starting preload is 8.0 mm','starting preload is 7.0 mm')
  st['source_links']=[url+'#page='+str(n) for n in st['source_pdf_pages']]
 ns=sorted({1,4}|{n for st in d['steps'] for n in st['source_pdf_pages']})
 labels=[]
 for n in ns:
  found=[(z[1],v) for z in book[n-1].get_text('blocks') for v in re.findall(r'(?m)^\d+-\d+$',z[4])]
  labels.append(str(n)+': '+(max(found)[1] if found else 'front matter'))
 d['source']={'source_url':url,'document_sha256':h,'document_revision':'D05-2819U-10 / LIT-11626-40-30','pdf_pages':ns,'printed_pages':labels,'review_status':'PENDING_INDEPENDENT_REVIEW','review_note':'Exact2027 cover, setup text117–121/412–413 and rendered118–121/412–413 checked independently of2026. Split compression diagram119 retained.'}
 d['remaining_gaps']=['Engine/frame access and rebuilding, fork internals and shock internals are not provided by this setup operation.','The2027 redesigned components require independent service review; no2026 engine approval inherited.']
 d['authored_adaptation']={'structural_reference_sha256':sha(old),'reason':'Original sequence reused only after all19 setup actions were compared to exact D05 instructions. Exact2027 values and links replace earlier configuration; no cross-year mechanical approval.'}
 wr(out,d);arts.append({'path':out.name,'kind':'procedure','source_id':'yamaha-us-2027-yz250f-oem','sha256':sha(out),'target':d['target'],'step_count':len(d['steps'])})
wr(D/'source-review-manifest.json',{'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':'yamaha-us-2027-yz250f-oem','url':url,'sha256':h,'local_pdf_path':str(pdf)}],'artifacts':arts})
wr(D/'author-review.json',{'status':'AUTHOR_REVIEWED','cover':'2027 YZ250FV US LIT-11626-40-30','source_sha256':h,'text_pages':[117,118,119,120,121,412,413],'visual_pages':[118,119,120,121,412,413],'settings':{'fork_rebound':12,'fork_compression':12,'shock_rebound':13,'shock_high_turns':'1 5/8','shock_low_clicks':8,'preload_standard_mm':7,'preload_range_mm':[1.5,18],'preload_mm_per_turn':1.5,'sag_mm':[90,100],'bleed_torque_Nm':1.3},'source_precision':'Compression diagram is119 while table118; shock new photographs120/121; sag uses molded triangular rear-fender mark412. No invented preload locknut torque.'})
print([(a['path'],a['sha256']) for a in arts])
