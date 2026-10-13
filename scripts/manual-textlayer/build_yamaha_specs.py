"""Specification-table payloads for stage_manual_rows from Yamaha Owner's Service Manuals.

usage: build_yamaha_specs.py jobs.txt outdir
jobs.txt: MODEL|YEAR|CODE|PDF path   (one bike-year per line; a manual shared by two models appears twice)
Each bike-year: chapter-2 rows (yamaha_specs.parse), the sag figure (yamaha_specs.sag), the damper cross-check
(yamaha_dampers.check: every Soft / STD / Hard value must equal Minimum / Standard / Maximum in the adjustment section,
otherwise the bike-year is not written), then one JSON payload with the hash the loader must reproduce."""
import hashlib,json,os,re,sys,pdfplumber
sys.path.insert(0,os.path.dirname(__file__))
import yamaha_specs,yamaha_dampers
REF=('docs/research/expansion/yamaha/TEXT_LAYER_REVIEW_2026-10-13.md; {code}; OEM PDF fetched from the manufacturer library and hashed; '
     'specification table read from the document text layer with the reader checked row-for-row against the rows loaded on 2026-10-09 '
     '(four manuals, identical); all damper values cross-checked against the adjustment section of the same document; '
     'no same-scope value on file to conflict.')
os.makedirs(sys.argv[2],exist_ok=True); n=0; cache={}
for line in open(sys.argv[1]):
    model,yr,code,path=line.rstrip('\n').split('|')
    if path not in cache:
        pdf=pdfplumber.open(path); t=re.sub(r'\s+',' ',' '.join((pdf.pages[i].extract_text() or '') for i in range(6)))
        ed=re.search(r'(?:First|1st) [Ee]dition,? ([A-Z][a-z]+ \d{4})',t); lit=re.search(r'LIT-\d+-\d+-\d+',t)
        cache[path]=(hashlib.sha256(open(path,'rb').read()).hexdigest(), ed.group(1) if ed else None, lit.group(0) if lit else None, yamaha_specs.sag(path))
    sha,ed,lit,sagrow=cache[path]
    rows,problems=yamaha_specs.parse(path,model)
    if sagrow: rows.append(sagrow)
    mism,found=yamaha_dampers.check(path,rows,model)
    dampers=sum(1 for r in rows if 'Adjustment value from the start position' in r[2])
    if mism or dampers<12 or not ed or not lit:
        print('SKIP',model,yr,code,'dampers',dampers,'mismatch',mism,'edition',ed,lit); continue
    paths=[r[2] for r in rows]
    if len(paths)!=len(set(paths)): print('SKIP',model,yr,code,'duplicate path',[p for p in paths if paths.count(p)>1]); continue
    lines=[f'{p}|{pr}|{path}|{v}|{u or ""}' for p,pr,path,v,u in rows]
    lines.sort(key=lambda l: hashlib.sha256(l.split('|')[2].encode()).hexdigest())
    want=hashlib.sha256('\n'.join(lines).encode()).hexdigest()
    n+=1
    json.dump({'make':'Yamaha','model':model,'yr':int(yr),'url':f'https://library.ymcapps.net/library/om/contents/pdf/10/{code}_02.pdf',
               'sha':sha,'rev':f'{code} / {lit}; First edition {ed}','ref':REF.format(code=code),'want':want,'n':len(lines),
               'delta':'\n'.join('+|'+l for l in lines)},open(f'{sys.argv[2]}/{n}.json','w'))
    print(model,yr,code,len(lines),'dampers',dampers,'problems',problems)
print('payloads',n)
