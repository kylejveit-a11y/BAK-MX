"""Kawasaki KX owner's manuals (Kawasaki's online viewer, page images) -> stage_manual_rows payloads.

usage: build_kawasaki.py jobs.txt capture_dir outdir [MODEL|YEAR,...]   (the optional list restricts the run)
jobs.txt lines: MODEL|YEAR|MANUAL_ITEM|MODEL_CODE   (the model code picks the column in a manual shared by two models)
capture_dir/<MANUAL_ITEM>/: info.json (viewer base URL, page ids, menu), pNNN.jpg page images (see docs for the capture)

Per bike-year: SPECIFICATIONS pages (kawasaki_specs), Periodic Maintenance Chart pages (kawasaki_chart), Front / Rear
Suspension pages (kawasaki_suspension). The document hash is the SHA-256 of the page images used, in page order."""
import hashlib,json,os,re,sys
sys.path.insert(0,os.path.dirname(__file__))
import kawasaki_specs,kawasaki_chart,kawasaki_suspension
REF=('docs/research/expansion/kawasaki/OWNERS_MANUAL_REVIEW_2026-10-13.md; {item}; owner\'s manual page images fetched from Kawasaki\'s '
     'online manual viewer and hashed; specification table, periodic maintenance chart and standard suspension settings read by '
     'OCR with the checks described there (imperial conversion, gear-tooth ratio, usable-range and grid checks); '
     'no same-scope value on file to conflict.')
def section_pages(menu,n,pred,only_first=False):
    for i,(name,p) in enumerate(menu):
        if pred(name.strip()):
            nxt=next((q for m,q in menu[i+1:] if q>p),p+8)
            return list(range(p,min(nxt,n+1)))
    return []
os.makedirs(sys.argv[3],exist_ok=True); n=len([f for f in os.listdir(sys.argv[3]) if re.fullmatch(r'\d+\.json',f)]); report=[]
only=set(sys.argv[4].split(',')) if len(sys.argv)>4 else None
for line in open(sys.argv[1]):
    if not line.strip(): continue
    model,yr,item,code=line.rstrip('\n').split('|')
    if only and f'{model}|{yr}' not in only: continue
    d=f'{sys.argv[2]}/{item}'; info=json.load(open(f'{d}/info.json')); menu=[(a,int(b)) for a,b in info['menu']]; N=len(info['ids'])
    pg=lambda p:(p,f'{d}/p{p:03d}.jpg')
    spec_pages=[pg(p) for p in section_pages(menu,N,lambda s:s.startswith('SPECIFICATIONS'))]
    chart_pages=[pg(p) for p in section_pages(menu,N,lambda s:s.startswith('Periodic Maintenance Chart'))]
    # the 2025-on menus list sub-headings; the suspension chapters run from "Front Suspension" to "Rear Suspension" and from
    # there to the tuning chapter's "Suspension" entry
    fs=next((p for n_,p in menu if n_.strip().startswith('Front Suspension')),None)
    rs=next((p for n_,p in menu if n_.strip().startswith('Rear Suspension')),None)
    ts=next((p for n_,p in menu if n_.strip()=='Suspension' and rs and p>rs),(rs or 0)+40)
    front=[pg(p) for p in range(fs,rs)] if fs and rs else []
    rear=[pg(p) for p in range(rs,min(ts,N+1))] if rs else []
    rows=[]; problems=[]
    o,pr=kawasaki_specs.parse(spec_pages,code); problems+=[('specs',)+tuple(p) for p in pr]
    for p,path,v,u,checked in o: rows.append((p,path,v,u))
    sec=None; nchart=0
    for p,path in chart_pages:
        o,pr=kawasaki_chart.parse(path,sec); problems+=[('chart',p)+tuple(x) for x in pr]
        for s,op,val in o:
            if not s: problems.append(('chart',p,'no section',op)); continue
            rows.append((p,f'Service schedule / {s} / {op}',val,None)); nchart+=1; sec=s
    nsusp=0
    for side,pages in (('Front suspension',front),('Rear suspension',rear)):
        o,pr=kawasaki_suspension.parse(pages,side); problems+=[('suspension',)+tuple(p) for p in pr]
        for p,path,v,u,note in o: rows.append((p,path,v,u)); nsusp+=1
    paths=[r[1] for r in rows]; dup=[p for p in set(paths) if paths.count(p)>1]
    if dup:
        problems.append(('duplicate paths',dup)); rows=[r for r in rows if r[1] not in dup]
    used=sorted({p for p,_ in spec_pages+chart_pages+front+rear})
    h=hashlib.sha256()
    for p in used: h.update(open(f'{d}/p{p:03d}.jpg','rb').read())
    sha=h.hexdigest()
    lines=[f'{p}|{p}|{path}|{v}|{u or ""}' for p,path,v,u in rows]
    lines.sort(key=lambda l: hashlib.sha256(l.split('|')[2].encode()).hexdigest())
    want=hashlib.sha256('\n'.join(lines).encode()).hexdigest()
    nspec=len(rows)-nchart-nsusp
    report.append({'model':model,'yr':yr,'item':item,'rows':len(rows),'specs':nspec,'schedule':nchart,'suspension':nsusp,'problems':problems})
    if nspec<20 or nchart<40 or nsusp<3:
        print('SKIP',model,yr,item,nspec,nchart,nsusp); continue
    n+=1
    json.dump({'make':'Kawasaki','model':model,'yr':int(yr),'url':f'https://pws.ktivs.net/dispeBook?file={item}&lang_code=EN','sha':sha,
               'rev':f"Owner's manual {item} ({model} {yr}); page images from Kawasaki's online manual viewer, pages {used[0]}-{used[-1]}",
               'ref':REF.format(item=item),'want':want,'n':len(lines),'delta':'\n'.join('+|'+l for l in lines)},open(f'{sys.argv[3]}/{n}.json','w'))
    print(model,yr,item,'rows',len(rows),'specs',nspec,'schedule',nchart,'suspension',nsusp,'problems',len(problems))
json.dump(report,open(f'{sys.argv[3]}/report{"-"+str(len(only)) if only else ""}.json','w'),indent=1)
print('payloads',n)
