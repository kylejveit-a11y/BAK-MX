"""Generate unapproved exact-source setup drafts for author/independent review."""
from pathlib import Path
import json
B=Path(__file__).resolve().parent
rows=json.loads((B/'parameter-review-candidates.json').read_text())
current={('YZ250FX',2025),('YZ250FX',2026),('YZ450FX',2026),('WR450F',2025)}
facts=[]
for r in rows:
 if (r['model'],r['year']) in current:continue
 values=[x['standard'].split()[0].replace('-','+') for x in r['settings']]
 assert len(values)==5
 facts.append(dict(code=r['code'],model=r['model'],year=r['year'],start=r['fork_page'],sag=r['sag_page'],fr=int(values[0]),fc=int(values[1]),sr=int(values[2]),hs=values[3],ls=int(values[4]),preload=int(float(r['preload'])),copyright=r['copyright_page'],datum=r['sag_reference'],measurement_only=r['rear_frame_access']))
script=(B/'build_current_setup.py').read_text()
begin=script.index('FACTS=[');end=script.index('\ndiscovery=',begin)
script=script[:begin]+'FACTS='+repr(facts)+script[end:]
script=script.replace("json.loads((T/'fx-discovery.json').read_text())", "sum([json.loads((T/n).read_text()) for n in ['fx-discovery.json','fx-older-discovery.json','remaining-discovery.json','latest-fx-discovery.json']],[])")
script=script.replace("assert 'U.S.A.' in book[2].get_text()", "assert 'U.S.A.' in book[f['copyright']-1].get_text()")
script=script.replace("book[2].get_text().split('First edition,')[1].split('\\n')[0].strip()", "book[f['copyright']-1].get_text().splitlines()[3]")
script=script.replace('identity_pages=[1,3]',"identity_pages=[1,f['copyright']]")
script=script.replace('author_rendered_pages=[a,a+3,g]',"author_rendered_pages=[], author_review_status='PENDING_FINAL_VISUAL_REVIEW'")
script=script.replace("'loaded':[g]","'loaded':[g,g+1]").replace("'remeasure':[a+1,a+2,g]","'remeasure':[a+1,a+2,g,g+1]")
script=script.replace("'bleed':[a+1]","'bleed':[a,a+1]")
script=script.replace("pages=sorted({1,3,*", "pages=sorted({1,f['copyright'],*")
script=script.replace("  pages=sorted", """  if f['datum']=='bolt':
   for st in d['steps']:
    st['instruction']=st['instruction'].replace('triangular rear-fender mark','rear-fender holding bolt').replace('triangular fender mark','fender holding bolt')
  if f['measurement_only'] and name=='rider-sag-preload-v1':
   d['title']='Measure stock rider sag'
   d['preflight']=[x for x in d['preflight'] if 'spring rings' not in x]
   d['required_tools']=[dict(name='Secure maintenance stand, helper and length measuring equipment')]
   retained=[]
   for st in d['steps']:
    if st['id'] not in ['inspect','extended','loaded','record']:continue
    st.pop('branches',None)
    if st['id']=='inspect':st['instruction']='Confirm smooth leak-free stock rear suspension before measuring. No spring rings or bodywork are removed in this measurement operation.'
    if st['id']=='loaded':st['instruction']=st['instruction'].split('If already within range')[0].strip()
    if st['id']=='record':
     st['depends_on']=['loaded'];st['instruction']='Record unloaded a, rider-loaded b and calculated sag. The target is 90–100 mm. Outside that range, arrange separate preload adjustment with the source-required rear-frame removal/refit and locknut service. Keep the bike assembled and the rings intact here. Recheck sag after break-in or spring settling.'
    retained.append(st)
   d['steps']=retained
   d['exit_state']=['Actual rider sag recorded; preload adjustment and rear-frame access remain separate work.']
  if f['year']==2020 and name=='shock-baseline-v1':
   extended=f['code'] in ['BAJ-28199-10','BAK-28199-10']
   for st in d['steps']:
    if st['id']=='rebound':st['source_pdf_pages']=[a+2,a+3]
    if extended and st['id'] in ['record','low','verify']:
     st['source_pdf_pages']=sorted(set(st['source_pdf_pages']+[a+4]))
     if st['id']=='record':st['instruction']=st['instruction'].replace(f'PDF {a+2}–{a+3}',f'PDF {a+2}–{a+4}')
    st['source_links']=[url+'#page='+str(n) for n in st['source_pdf_pages']]
  pages=sorted""")
script=script.replace("'current-source-facts.json'","'remaining-source-facts.json'").replace("'current-source-review-manifest.json'","'remaining-source-review-manifest.json'")
script=script.replace('Exact US manual author review; independent review pending.','Exact-source parameter extraction; final visual author review and independent review pending.')
exec(compile(script,str(B/'build_remaining_setup.py'),'exec'))
