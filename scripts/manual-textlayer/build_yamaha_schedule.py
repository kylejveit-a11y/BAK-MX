"""Turn yamaha_schedule.py output into stage_manual_rows payloads (one JSON per bike-year).

usage: build_yamaha_schedule.py rows.json revs.txt outdir
rows.json : {"MODEL|YEAR": {"code","sha","rows":[[pdf,printed,path,val],...],"problems":[...]}} from a run of yamaha_schedule.parse
revs.txt  : MODEL|YEAR|<document revision string already on file for the bike's specification rows>
Each payload carries an empty base ('Yamaha:none'), every row as a '+' delta line, and the hash the loader must reproduce."""
import hashlib,json,re,sys,os
rows=json.load(open(sys.argv[1])); revs={}
for l in open(sys.argv[2]):
    m,y,r=l.rstrip('\n').split('|',2); revs[f'{m}|{y}']=r
os.makedirs(sys.argv[3],exist_ok=True)
REF=('docs/research/expansion/yamaha/SCHEDULE_REVIEW_2026-10-13.md; {code}; OEM PDF fetched from the manufacturer library and hashed; '
     'maintenance-interval table read from the document text layer using the table rule lines and check-mark glyphs; '
     'item and routine counts cross-checked against the printed table; no same-scope value on file to conflict.')
n=0
for key,d in sorted(rows.items()):
    if d['problems']: print('SKIP',key,d['problems']); continue
    model,yr=key.split('|')
    byp={}
    for pdf,printed,path,val in d['rows']:
        # a manual shared by two models marks a model-specific item "(YZ250X)": keep it for that model only
        m=re.match(r'Service schedule / (.*?) \((YZ\w+)\) – (.*)$',path)
        if m:
            if m.group(2)!=model: continue
            path=f'Service schedule / {m.group(1)} – {m.group(3)}'
        # a bracketed note the manual prints across the interval columns belongs to the routine, not the interval
        parts=val.split('; ')
        if parts[0].startswith('('): path=path+' '+parts[0][0]+parts[0][1:]; parts=parts[1:]; val='; '.join(parts)
        if not val: print('EMPTY',key,path); continue
        if path in byp:
            if byp[path][2]!=val: print('CONFLICT',key,path,byp[path][2],'|',val); byp.pop(path)
            continue
        byp[path]=(pdf,printed,val)
    lines=[f'{v[0]}|{v[1]}|{p}|{v[2]}|' for p,v in byp.items()]
    lines.sort(key=lambda l: hashlib.sha256(l.split('|')[2].encode()).hexdigest())
    want=hashlib.sha256('\n'.join(lines).encode()).hexdigest()
    n+=1
    json.dump({'make':'Yamaha','model':model,'yr':int(yr),'url':f"https://library.ymcapps.net/library/om/contents/pdf/10/{d['code']}_02.pdf",
               'sha':d['sha'],'rev':revs[key],'ref':REF.format(code=d['code']),'want':want,'n':len(lines),
               'delta':'\n'.join('+|'+l for l in lines)},open(f'{sys.argv[3]}/{n}.json','w'))
    print(key,d['code'],len(lines))
print('payloads',n)
