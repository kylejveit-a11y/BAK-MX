"""Specification payloads for stage_manual_rows from the older-layout (2020 two-stroke) Yamaha Owner's Service Manuals.

usage: build_yamaha_specs_2020.py jobs.txt outdir
jobs.txt: MODEL|YEAR|CODE|PDF path   (a manual shared by two models appears twice)
Each bike-year: chapter-2 rows (yamaha_specs_2020.parse), the damper settings from the adjustment procedures
(yamaha_specs_2020.dampers, all five dampers with Soft / STD / Hard required), the sag figure (yamaha_specs.sag).
A bike-year with a reader problem other than a printed conversion that does not check or a market list naming no model, a duplicate path, fewer than 120
table rows, or no edition / LIT number is not written."""
import hashlib,json,os,re,sys,pdfplumber
sys.path.insert(0,os.path.dirname(__file__))
import yamaha_specs,yamaha_specs_2020
REF=('docs/research/expansion/yamaha/TEXT_LAYER_REVIEW_2026-10-13.md; {code}; OEM PDF fetched from the manufacturer library and hashed; '
     'older-layout specification tables read from the document text layer (USA market column only, model rows selected, every mm value '
     'checked against its printed inch conversion); damper Soft / STD / Hard from the adjustment procedures of the same document; '
     'no same-scope value on file to conflict.')
os.makedirs(sys.argv[2],exist_ok=True); n=len([f for f in os.listdir(sys.argv[2]) if re.fullmatch(r'\d+\.json',f)]); cache={}
for line in open(sys.argv[1]):
    if not line.strip(): continue
    model,yr,code,path=line.rstrip('\n').split('|')
    if path not in cache:
        pdf=pdfplumber.open(path); t=re.sub(r'\s+',' ',' '.join((pdf.pages[i].extract_text() or '') for i in range(6)))
        ed=re.search(r'(?:First|1st) [Ee]dition,? ([A-Z][a-z]+ \d{4})',t); lit=re.search(r'LIT-\d+-\d+-\d+',t)
        cache[path]=(hashlib.sha256(open(path,'rb').read()).hexdigest(), ed.group(1) if ed else None, lit.group(0) if lit else None, yamaha_specs.sag(path))
    sha,ed,lit,sagrow=cache[path]
    rows,problems=yamaha_specs_2020.parse(path,model)
    hard=[p for p in problems if p[0] not in ('conversion mismatch','ambiguous market lines')]
    damp,dpr=yamaha_specs_2020.dampers(path,model)
    ntable=len(rows)
    rows=rows+[(p,'?' if pr is None else pr,a,v,u) for p,pr,a,v,u in damp]
    if sagrow: rows.append(sagrow)
    paths=[r[2] for r in rows]; dup=sorted({p for p in paths if paths.count(p)>1})
    if hard or dpr or len(damp)!=15 or dup or ntable<120 or not ed or not lit:
        print('SKIP',model,yr,code,'table',ntable,'dampers',len(damp),'problems',hard,dpr,'dup',dup,'edition',ed,lit); continue
    # printed page for the damper rows: the page footer of that PDF page
    pdf=pdfplumber.open(path)
    def printed(p):
        ws=pdf.pages[p-1].extract_words(); return next((w['text'] for w in ws if re.fullmatch(r'\d+-\d+',w['text']) and w['top']>700),'?')
    rows=[(p,printed(p) if pr=='?' else pr,a,v,u) for p,pr,a,v,u in rows]
    lines=[f'{p}|{pr}|{a}|{v}|{u or ""}' for p,pr,a,v,u in rows]
    lines.sort(key=lambda l: hashlib.sha256(l.split('|')[2].encode()).hexdigest())
    want=hashlib.sha256('\n'.join(lines).encode()).hexdigest()
    n+=1
    json.dump({'make':'Yamaha','model':model,'yr':int(yr),'url':f'https://library.ymcapps.net/library/om/contents/pdf/10/{code}_02.pdf',
               'sha':sha,'rev':f'{code} / {lit}; First edition {ed}','ref':REF.format(code=code),'want':want,'n':len(lines),
               'delta':'\n'.join('+|'+l for l in lines)},open(f'{sys.argv[2]}/{n}.json','w'))
    print(model,yr,code,len(lines),'table',ntable,'dampers',len(damp),'conversion problems',problems)
print('payloads',n)
