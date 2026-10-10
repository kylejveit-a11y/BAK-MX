"""Read-only source comparison: candidates for review, never procedure inheritance."""
import hashlib,json,re,difflib
from pathlib import Path
import fitz
B=Path(__file__).parent;R=B.parents[3]
S={2024:Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-11_02.pdf'),2025:Path('C:/Users/kylej/AppData/Local/Temp/D02-2819U-10_02.pdf')}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(S[2024])=='6e784b3b15fe1e131f0e385676ca2873e74d783ee2499ce561e595bcea9ca9be'
assert sha(S[2025])=='5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac'
docs={y:fitz.open(p) for y,p in S.items()}
def row(p,i):
 t=p.get_text();lines=t.strip().splitlines();foot=next((x for x in reversed(lines) if re.fullmatch(r'\d+-\d+',x.strip())),None)
 return {'pdf_page':i+1,'printed_page':foot,'anchors':re.findall(r'EAM\d+',t),'text_sha256':hashlib.sha256(t.encode()).hexdigest(),'text':t}
idx={y:[row(p,i) for i,p in enumerate(d)] for y,d in docs.items()}
def norm(t):return re.sub(r'\s+',' ',re.sub(r'E(?:AM|WA|CA)\d+','',t)).strip()
artifacts=[];used=set()
for p in (R/'docs/research/workshop-pass9').rglob('*.procedure.json'):
 d=json.loads(p.read_text(encoding='utf8'))
 if d.get('target',{}).get('model_year')!=2025 or 'D02-' not in d.get('source',{}).get('source_url',''):continue
 if d.get('publication_status')!='APPROVED':continue
 pages=d['source']['pdf_pages'];used.update(pages)
 artifacts.append({'path':str(p.relative_to(R)).replace('\\','/'),'sha256':sha(p),'id':d['id'],'source_pdf_pages_2025':pages})
mapping=[]
for n in sorted(used):
 a=idx[2025][n-1];chapter=(a['printed_page']or'').split('-')[0]
 candidates=[b for b in idx[2024] if (b['printed_page']or'').split('-')[0]==chapter] if chapter else idx[2024][:15]
 scores=[]
 for b in candidates:
  sim=difflib.SequenceMatcher(None,norm(a['text']).split(),norm(b['text']).split(),autojunk=True).ratio()
  shared=sorted(set(a['anchors'])&set(b['anchors']))
  scores.append((sim,b,shared))
 best=sorted(scores,key=lambda x:x[0],reverse=True)[:3]
 mapping.append({'pdf_2025':n,'printed_2025':a['printed_page'],'anchors_2025':a['anchors'],'candidate_matches_2024':[{'pdf_page':b['pdf_page'],'printed_page':b['printed_page'],'text_similarity':round(sc,4),'shared_section_anchors':anchors} for sc,b,anchors in best],'review_status':'CANDIDATE_LOCATOR_ONLY','warning':'Text similarity and shared anchors do not establish drawing, hardware, preparation or procedure equivalence.'})
def compact(x):return {k:v for k,v in x.items() if k!='text'}
def save(name,d): (B/name).write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
save('source-page-index.json',{'status':'SOURCE_INDEX_ONLY','sources':[{'year':y,'local_path':str(S[y]),'sha256':sha(S[y]),'page_count':len(docs[y]),'url':'https://library.ymcapps.net/library/om/contents/pdf/10/'+S[y].name} for y in S],'pages':{str(y):[compact(x) for x in v] for y,v in idx.items()}})
save('approved-2025-page-map-candidates.json',{'status':'NOT_REVIEWED_NOT_FOR_PUBLICATION','reference_artifacts':artifacts,'mapping':mapping})
a=json.loads((R/'docs/research/expansion/yamaha/2024-yz450f.json').read_text());b=json.loads((R/'docs/research/expansion/yamaha/2025-yz450f.json').read_text())
def key(x):return (x['joint'],x.get('thread'),x.get('joint_quantity'))
aa={key(x):x for x in a['facts'] if x.get('property')=='torque'};bb={key(x):x for x in b['facts'] if x.get('property')=='torque'}
def remarks(x):return x.get('raw_remarks','').replace('\uf072','r')
changes=[]
for k in sorted(set(aa)|set(bb),key=str):
 x=aa.get(k,{});y=bb.get(k,{})
 if (x.get('value'),remarks(x))==(y.get('value'),remarks(y)):continue
 changes.append({'joint':k[0],'thread':k[1],'quantity':k[2],'2024':{z:x.get(z) for z in ['value','unit','raw_remarks','locator']},'2025':{z:y.get(z) for z in ['value','unit','raw_remarks','locator']},'status':'SAVED_TABLE_DIFFERENCE_REQUIRES_DIAGRAM_REVIEW'})
save('saved-torque-table-differences.json',{'status':'AUDIT_ONLY_NO_PUBLICATION','normalization':'Private-use pre-race check glyph normalized to r solely for comparison; no preparation symbol removed. Key includes joint, thread and quantity.','records_2024':len(aa),'records_2025':len(bb),'differences':changes})
print('Indexed',len(idx[2024]),'2024 pages; mapped',len(mapping),'referenced2025 pages; torque differences',len(changes))
