"""Author exact-2025 candidates from reviewed source comparisons, never approve them."""
import copy, hashlib, json, re
from pathlib import Path
import fitz

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
OLD=ROOT/'docs/research/workshop-pass7/yamaha-hydraulics'
PDF=Path('C:/Users/kylej/AppData/Local/Temp/D02-2819U-10_02.pdf')
SHA='5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac'
URL='https://library.ymcapps.net/library/om/contents/pdf/10/D02-2819U-10_02.pdf'
assert hashlib.sha256(PDF.read_bytes()).hexdigest()==SHA
page_map={7:[7],90:[88],108:[106],109:[107],110:[108],111:[109],112:[110],131:[128],134:[131],136:[133],137:[134],138:[135],166:[163,164]}
page_map.update({n:[n-3] for n in range(139,161)})
book=fitz.open(PDF)
def write(path,value):path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def pages(values):return sorted({p for v in values for p in page_map[v]})
def references(text):
    def fix(m):
        return 'PDF'+re.sub(r'\d+',lambda n:'–'.join(map(str,page_map[int(n[0])])),m[1])
    text=re.sub(r'(diagram|shown on|marked on|NEW on|from|on)(\s*)(1[3-6]\d(?:/1[3-6]\d)*)',lambda m:m[1]+m[2]+'/'.join('/'.join(map(str,page_map.get(int(n),[int(n)]))) for n in m[3].split('/')),text)
    return re.sub(r'PDF\s*(\d+(?:[/,–-]\d+)*)',fix,text)
def transform(value):
    if isinstance(value,str):
        value=value.replace('2026','2025')
        value=re.sub(r'D03-2819U-10_02\.pdf#page=(\d+)',lambda m:'D02-2819U-10_02.pdf#page='+str(page_map[int(m[1])][0]),value)
        return references(value)
    if isinstance(value,list):return [transform(v) for v in value]
    if isinstance(value,dict):return {k:transform(v) for k,v in value.items()}
    return value
artifacts=[]
for name in ['front-caliper-rebuild-v1','rear-caliper-rebuild-v1','front-master-rebuild-v1','rear-master-rebuild-v1']:
    original=OLD/(name+'.procedure.json')
    data=transform(json.loads(original.read_text(encoding='utf-8')))
    data['target']['model_year']=2025
    target=HERE/(name+'.procedure.json')
    if target.exists() and json.loads(target.read_text(encoding='utf-8'))['source']['review_status']=='APPROVED':raise RuntimeError('Frozen candidate cannot be rebuilt')
    data['source'].update(source_url=URL,document_sha256=SHA,document_revision='D02-2819U-10 / LIT-11626-38-16; first edition March 2024',review_status='PENDING_INDEPENDENT_REVIEW',review_note='Exact2025 text comparison reviewed; diagram/material review by independent agent pending. No neighboring-year applicability asserted.')
    data['source']['pdf_pages']=pages(data['source']['pdf_pages'])
    data['source']['printed_pages']=list(dict.fromkeys('Symbols (unnumbered)' if n==7 else book[n-1].get_text().strip().splitlines()[-1] for n in data['source']['pdf_pages']))
    if name=='rear-caliper-rebuild-v1':data['required_parts'][0]['purpose']=data['required_parts'][0]['purpose'].replace('front-circuit','rear-circuit')
    for step in data['steps']:
        step['source_pdf_pages']=pages(step['source_pdf_pages'])
        if 163 in step['source_pdf_pages'] and 164 in step['source_pdf_pages']:
            step['source_links']=list(dict.fromkeys(step.get('source_links',[])+[URL+'#page=163',URL+'#page=164']))
    data.pop('operation_dependencies',None)
    data['authoring_template']={'artifact':str(original.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(original.read_bytes()).hexdigest(),'role':'Structure only; exact2025 source is the evidence authority.'}
    data['publication_status']='CANDIDATE_NOT_IMPORTED'
    data['integration_status']='PENDING_INDEPENDENT_REVIEW'
    write(target,data)
    artifacts.append({'path':target.name,'kind':'procedure','sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'source_id':'yamaha25','target':data['target']})
write(HERE/'source-review-manifest.json',{'schema_version':1,'status':'PENDING_INDEPENDENT_REVIEW','sources':[{'id':'yamaha25','url':URL,'sha256':SHA,'local_pdf_path':str(PDF)}],'artifacts':artifacts})
write(HERE/'page-comparison-map.json',{'status':'SOURCE_COMPARISON_NOT_AUTOMATIC_APPROVAL','page_map_2026_to_2025':page_map,'reviewed_differences':['2025 rear pad springs are quantity2 in one callout; preserve both illustrated locations.','2025 front master holder upper-first instructions span163–164.','Symbol7 adds wheel-bearing grease B; brake S remains silicone and BF brake fluid.','Other compared hydraulic service text matches apart from locators; diagrams require independent review.']})
print('Four candidates written for independent review')
