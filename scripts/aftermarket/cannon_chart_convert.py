"""Turn Cannon Racecraft's printed spring application chart (a PDF the owner supplied) into a specialty research file.

usage: cannon_chart_convert.py <chart.pdf> <research root>
Needs pdfplumber. The PDF is not kept in the repo; only the facts in its table rows are written. Each row is year range,
model, fork spring part number + rates, shock spring part number + rates. A row is given to a bike only when its model
name is in MODELS below (exact chart wording -> roster models); every other row is listed under `unread`. Years are the
chart's own range, kept only where the roster has that bike. The chart prints no units (rates are read as kg/mm, the
convention the same numbers follow everywhere else) and says "all springs by even rates": a printed range is expanded to
its even steps when that gives fewer than 20 rates, otherwise the range is kept as printed.
"""
import sys,os,json,re,collections
import pdfplumber
pdf_path,root=sys.argv[1],sys.argv[2]
roster={tuple(r) for r in json.load(open(os.path.join(root,'roster-all.json')))}
URL='https://img1.wsimg.com/blobby/go/77a65b09-0aaa-4e4f-8c98-cdbee819e847/2024%20Catalog%20(3).pdf'
MODELS={
 'CRF 150R/RB EXP':[('Honda','CRF150R')],'CRF250R':[('Honda','CRF250R')],'CRF 250R':[('Honda','CRF250R')],'CRF 250X':[('Honda','CRF250X')],
 'CRF450R':[('Honda','CRF450R')],'CRF 450R':[('Honda','CRF450R')],'CRF450X':[('Honda','CRF450X')],
 'KX 65':[('Kawasaki','KX65')],'KX 85':[('Kawasaki','KX85')],'KX 100/112':[('Kawasaki','KX112')],'KX 250F':[('Kawasaki','KX250')],
 'KX250/250F':[('Kawasaki','KX250')],'KX250/ KX250F/X':[('Kawasaki','KX250'),('Kawasaki','KX250X')],'KX450F/450X':[('Kawasaki','KX450'),('Kawasaki','KX450X')],'KX 450F':[('Kawasaki','KX450')],
 '50 SX':[('KTM','50 SX')],'65 SX':[('KTM','65 SX')],'85 SX':[('KTM','85 SX 17/14'),('KTM','85 SX 19/16')],'125 SX':[('KTM','125 SX')],'150 SX':[('KTM','150 SX')],
 '250 SX/SX-F':[('KTM','250 SX'),('KTM','250 SX-F')],'250 XC/XC-F':[('KTM','250 XC'),('KTM','250 XC-F')],'300 XC-W':[('KTM','300 XC-W')],'300 XC':[('KTM','300 XC')],
 '350 SX-F / XC-F':[('KTM','350 SX-F'),('KTM','350 XC-F')],'350 SX-F':[('KTM','350 SX-F')],'450 XCF':[('KTM','450 XC-F')],'450 XC-F':[('KTM','450 XC-F')],
 '450 SX-F/XC-F':[('KTM','450 SX-F')],'450 SX-F':[('KTM','450 SX-F')],'500 XC-W/EXC':[('KTM','500 XC-W')],
 'RMZ250':[('Suzuki','RM-Z250')],'RMZ 250':[('Suzuki','RM-Z250')],'RMZ 450':[('Suzuki','RM-Z450')],
 'WR250F':[('Yamaha','WR250F')],'WR 450F':[('Yamaha','WR450F')],'YZ 65':[('Yamaha','YZ65')],'YZ 85':[('Yamaha','YZ85')],'YZ 125':[('Yamaha','YZ125')],
 'YZ250':[('Yamaha','YZ250')],'YZ 250':[('Yamaha','YZ250')],'YZ 250F':[('Yamaha','YZ250F')],'YZ 450F':[('Yamaha','YZ450F')]}
def years(s):
    m=re.fullmatch(r'\s*((?:19|20)\d\d)\s*(?:-\s*((?:19|20)\d\d))?\s*',s)
    if not m: return None
    a=int(m.group(1)); b=int(m.group(2) or a); return list(range(a,b+1)) if b>=a else None
def rates(s,step):
    """Printed rates -> list of numbers, or None when they are not a clean list or range."""
    s=s.strip()
    m=re.fullmatch(r'(\d*\.\d+)\s*-\s*(\d*\.\d+)(?:\s*EVEN RATES)?',s)
    if m:
        a,b=float(m.group(1)),float(m.group(2)); n=round((b-a)/step)
        if b<=a or abs(a+n*step-b)>1e-6 or n+1>=20: return None
        return [round(a+i*step,2) for i in range(n+1)]
    if re.fullmatch(r'[\d.,\s]+',s):
        v=[float(x) for x in re.findall(r'\d*\.\d+',s)]
        return v if len(v)>=2 and v==sorted(v) else None
    return None
rows=[];unread=[]
for pi,p in enumerate(pdfplumber.open(pdf_path).pages):
    for tb in p.extract_tables():
        for r in tb:
            c=[(x or '').replace('\n',' ').strip() for x in r]
            if len([x for x in c if x])<3 or c[0]=='YEAR': continue
            ne=[x for x in c if x]
            ys=years(c[0])
            # year | model [| model continued] | fork pn | fork rates | shock pn | shock rates, with empty spacer cells
            body=[x for x in c[1:] if x]
            pn_i=next((i for i,x in enumerate(body) if re.fullmatch(r'(\d{5,7}( SR)?|AIR|AER)(/(\d{5,7}|AIR|AER))?',x)),None)
            if ys is None or pn_i is None or pn_i==0: unread.append({'page':pi+1,'line':' | '.join(ne)}); continue
            model=' '.join(body[:pn_i]); rest=body[pn_i:]
            fork_pn=rest[0]; fork_rates=''; shock_pn=''; shock_rates=''
            k=1
            if k<len(rest) and not re.fullmatch(r'\d{5,7}( SR)?(/\d{5,7})?',rest[k]): fork_rates=rest[k]; k+=1
            if k<len(rest): shock_pn=rest[k]; k+=1
            if k<len(rest): shock_rates=rest[k]
            if model not in MODELS: unread.append({'page':pi+1,'line':' | '.join(ne),'why':'model not in the app or not mapped'}); continue
            rows.append({'page':pi+1,'years':ys,'model':model,'fork_pn':fork_pn,'fork_rates':fork_rates,'shock_pn':shock_pn,'shock_rates':shock_rates,'line':' | '.join(ne)})
prods=collections.OrderedDict()
def add(kind,pn,printed,row):
    step=0.02 if kind=='fork' else 0.2
    rl=rates(printed,step)
    coil=[x for x in pn.split('/') if x not in('AIR','AER')]
    if not coil: return
    key=(kind,pn,re.sub(r'\s+','',printed))
    name=f"Cannon Racecraft {'Fork Springs' if kind=='fork' else 'Shock Spring'} {'/'.join(coil)}"
    # Same part number is printed with different rate ranges for different bikes: keep them apart by name.
    if rl: name+=f" ({(f'{rl[0]:.2f}'.lstrip('0') if kind=='fork' else f'{rl[0]:.1f}')}-{(f'{rl[-1]:.2f}'.lstrip('0') if kind=='fork' else f'{rl[-1]:.1f}')})"
    cav=["Cannon's chart prints no unit; rates are read as kg/mm.","The chart says part numbers are not guaranteed: check the spring's dimensions with Cannon before ordering."]
    if rl is None and printed: cav.insert(0,f"Rates as printed: {printed}.")
    if not printed: cav.insert(0,'No rates printed for this row.')
    if 'AER' in pn or 'AIR' in pn: cav.insert(0,'Chart lists this beside the air fork (AER): the springs are for coil-spring forks or a coil conversion.')
    fmt=(lambda v:(f"{v:.2f}".lstrip('0') if kind=='fork' else f"{v:.1f}"))
    if 'AER' in pn or 'AIR' in pn: name+=' (coil conversion, air-fork models)'
    pr=prods.setdefault(key,{'id':f"cannon-{kind}-{'-'.join(coil)}-{len(prods)}",'category':'suspension','subcategory':f'{kind} spring','brand':'Cannon Racecraft','product':name,
        # The catalog merges records of one brand that share part numbers, and Cannon prints one part number with different
        # rate ranges for different bikes: the number is carried in the name and in each rate option instead.
        'part_numbers':[],'variants':[f"{fmt(v)} = {coil[0]}" for v in rl] if rl and len(coil)==1 else ([f"{fmt(v)} = {'/'.join(coil)}" for v in rl] if rl else []),
        'fits':[],'fitment_source_url':URL,'fitment_line':[],'what_it_changes':f"Replacement {kind} spring{'s' if kind=='fork' else ''} in a choice of rates to suit the rider.",
        'supporting_parts':'','caveats':' '.join(cav),'price':'','confidence':'medium'})
    pr['fitment_line'].append(row['line'])
    for mk,md in MODELS[row['model']]:
        ys=[y for y in row['years'] if (mk,md,y) in roster]
        if not ys: continue
        f=next((f for f in pr['fits'] if f['make']==mk and f['model']==md),None)
        if f: f['years']=sorted(set(f['years'])|set(ys))
        else: pr['fits'].append({'make':mk,'model':md,'years':ys,'notes':f"Chart: {row['line'].split(' | ')[0]} {row['model']}"})
for r in rows:
    add('fork',r['fork_pn'],r['fork_rates'],r)
    if r['shock_pn']: add('shock',r['shock_pn'],r['shock_rates'],r)
out=[p for p in prods.values() if p['fits']]
for p in out: p['fitment_line']=' ; '.join(p['fitment_line'])
json.dump({'slice':"Cannon Racecraft: the maker's printed spring application chart (fork and shock spring part numbers and the rates offered, by bike and year)",
 'source':URL,'retrieved':'2026-11-20','notes':'Read from the PDF chart supplied by the owner; the PDF is not kept. No rider-weight recommendations are printed. Rows for bikes outside the app, or whose model wording is not mapped, are in unread.',
 'products':out,'unread':unread},open(os.path.join(root,'specialty','cannon-racecraft.json'),'w'),indent=1)
print(len(rows),'rows read;',len(out),'products;',len(unread),'unread;',sum(len(f['years']) for p in out for f in p['fits']),'bike-year fits')
