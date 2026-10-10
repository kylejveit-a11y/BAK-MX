"""Source-specific candidates. Refuses to overwrite approved operations."""
import copy, hashlib, json, re
from pathlib import Path
import fitz
B=Path(__file__).resolve().parent; R=B.parents[3]
T=Path('C:/Users/kylej/AppData/Local/Temp/bakmx-pass13')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
FACTS=[
 dict(code='DP3-2819U-10',model='YZ250FX',year=2026,start=116,sag=400,fr=7,fc=7,sr=10,hs='1+5/8',ls=10,preload=9),
 dict(code='DP1-2819U-10',model='YZ450FX',year=2026,start=112,sag=392,fr=8,fc=12,sr=8,hs='1',ls=10,preload=11),
 dict(code='BXA-2819U-10',model='YZ250FX',year=2025,start=114,sag=398,fr=7,fc=7,sr=10,hs='1+5/8',ls=10,preload=9),
 dict(code='BNK-2819U-11',model='WR450F',year=2025,start=124,sag=416,fr=7,fc=13,sr=10,hs='1+1/2',ls=10,preload=13),
]
discovery={x['code']:x for x in json.loads((T/'fx-discovery.json').read_text())}
art=[];sources=[];facts=[]
for f in FACTS:
 c=f['code'];meta=discovery[c];pdf=T/(c+'.pdf');assert sha(pdf)==meta['sha256'];book=fitz.open(pdf)
 assert f['model'] in book[0].get_text() and str(f['year']) in book[0].get_text()
 assert 'U.S.A.' in book[2].get_text()
 folder=B/(str(f['year'])+'-'+f['model'].lower());sid=f"yamaha-us-{f['year']}-{f['model'].lower()}-oem";url=meta['url'];a=f['start'];g=f['sag']
 sources.append(dict(source_id=sid,url=url,sha256=meta['sha256'],local_path=str(pdf)))
 facts.append(dict(**f,source_id=sid,sha256=meta['sha256'],url=url,identity_pages=[1,3],author_text_pages=[a-1,a,a+1,a+2,a+3,g,g+1],author_rendered_pages=[a,a+3,g],scope='Stock damping reset and measured original-spring preload only; no internal rebuild or year inheritance.'))
 for name in ['fork-baseline-v1','shock-baseline-v1','rider-sag-preload-v1']:
  old=R/'docs/research/workshop-pass12/yamaha-2022-suspension'/(name+'.procedure.json');out=folder/(name+'.procedure.json')
  if out.exists():assert json.loads(out.read_text(encoding='utf8'))['publication_status']!='APPROVED','Frozen operation'
  d=json.loads(old.read_text(encoding='utf8'));d['id']=f"yamaha-{f['year']}-{f['model'].lower()}-{name}"
  d['target'].update(model=f['model'],model_year=f['year']);d['status']='SOURCE_REVIEW_CANDIDATE';d['publication_status']='PENDING_INDEPENDENT_REVIEW'
  d['applicability']['included']=f"Exact standard US{f['year']} {f['model']} original stock suspension."
  if name=='rider-sag-preload-v1':d['preflight'].append('Both spring rings must be accessible on the assembled bike; arrange separate access/refit work if parts must be removed.')
  d['authoring_template']=dict(path=old.relative_to(R).as_posix(),sha256=sha(old),scope='Structure only; values, controls, sequence and sag datum reviewed in this exact manual.')
  d['source'].update(source_url=url,document_sha256=meta['sha256'],document_revision=c+'; '+book[2].get_text().split('First edition,')[1].split('\n')[0].strip(),review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact US manual author review; independent review pending.')
  maps={'fork-baseline-v1':{'inspect':[a-1],'record':[a],'bleed':[a+1],'rebound':[a],'compression':[a],'verify':[a-1,a,a+1]},'shock-baseline-v1':{'inspect':[a+1],'record':[a+2,a+3],'rebound':[a+2],'high':[a+2,a+3],'low':[a+3],'verify':[a+1,a+2,a+3]},'rider-sag-preload-v1':{'inspect':[a+1,g,g+1],'extended':[g],'loaded':[g],'free-length':[a+1],'adjust':[a+1,a+2,g,g+1],'remeasure':[a+1,a+2,g],'record':[a+1,a+2,g,g+1]}}
  for st in d['steps']:
   s=st['instruction'];i=st['id']
   if name=='fork-baseline-v1':
    s=s.replace('PDF 105',f'PDF {a+1 if i=="bleed" else a}').replace('lower rebound adjuster 9 clicks',f"lower rebound adjuster {f['fr']} clicks").replace('top compression adjuster 9 clicks',f"top compression adjuster {f['fc']} clicks").replace('rebound 9/compression 9',f"rebound {f['fr']}/compression {f['fc']}")
    if i in ['record','compression']:
     maps[name][i]=[a,a+1]
     if i=='record':s=s.replace(f'PDF {a}.',f'PDF {a}–{a+1}.')
   elif name=='shock-baseline-v1':
    s=s.replace('PDF 107–108',f'PDF {a+2}–{a+3}').replace('rebound 12 clicks',f"rebound {f['sr']} clicks").replace('7/8 turn',f"{f['hs']} turn").replace('screw 6 clicks',f"screw {f['ls']} clicks").replace('low-speed 6 clicks',f"low-speed {f['ls']} clicks")
   else:
    s=s.replace('PDF 354',f'PDF {g}').replace('PDF 106',f'PDF {a+1}').replace('rear-fender holding bolt','triangular rear-fender mark').replace('axle center/fender holding bolt','axle center/triangular fender mark').replace('stock reference is 7.0 mm',f"stock reference is {f['preload']}.0 mm")
    if i=='loaded':s=s.replace('If already within range and current preload is valid, record it without changing the spring.','If already within range, known actual free/installed measurements establish valid preload, and the locknut is secure, select the already-valid branch to the final record without changing the spring. Otherwise continue with free-length measurement.')
    if i=='record':s+=' If the already-valid branch was selected, preserve the actual prior free/installed measurements that established preload; do not substitute nominal lengths.'
   st.update(instruction=s,source_pdf_pages=maps[name][i],source_links=[url+'#page='+str(n) for n in maps[name][i]],origin='Exact-model OEM illustrated setup companion; setting records and repeatability prompts are workflow adaptations.')
  pages=sorted({1,3,*[p for s in d['steps'] for p in s['source_pdf_pages']]});d['source']['pdf_pages']=pages
  d['source']['printed_pages']=[str(p)+': '+next((x for x in book[p-1].get_text().splitlines() if re.fullmatch(r'\d+-\d+',x)),'front matter') for p in pages]
  write(out,d);art.append(dict(path=out.relative_to(R).as_posix(),sha256=sha(out),source_id=sid,target=d['target'],step_count=len(d['steps']),review_status=d['publication_status'],template_sha256=sha(old)))
write(B/'current-source-facts.json',facts)
write(B/'current-source-review-manifest.json',dict(schema_version=1,status='PENDING_INDEPENDENT_REVIEW',sources=sources,artifacts=art))
print(f'{len(art)} candidates; {sum(x["step_count"] for x in art)} steps')
