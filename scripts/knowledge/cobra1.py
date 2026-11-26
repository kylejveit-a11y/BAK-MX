"""Cobra CX50 JR / SR / FWE / P3 and CX65 backfill, 2010-2026, from the Specifications tables of Cobra's owner
manuals (cobramoto.com, parsed 2026-11-26 into docs/research/cobra/cobra-manual-specs.json). Values are carried
as printed. Identical years are merged into one record. usage: python3 scripts/knowledge/cobra1.py"""
import sys,os,json,re,collections
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File,root
D=json.load(open(os.path.join(root,'docs/research/cobra/cobra-manual-specs.json')))
F=File('cobra1_manuals','c-x1','Cobra owner-manual backfill 2010-2026 (2026-11)','Cobra',['CX50 JR','CX50 SR','CX50 FWE','CX50 P3','CX65'],list(range(2010,2027)))
def clean(v):
    v=v.replace('”',' in').replace('“','').replace('"',' in').replace('–','-').replace('’',"'").replace('±','+/-').replace('•','')
    v=re.sub(r'\s+\d$','',v);v=re.sub(r',\s*Free sag$','',v);v=re.sub(r'\s+',' ',v).strip(' ;,-')
    return re.sub(r' in\b(?=\S)',' in ',v)
CLS=[('susp',r'front fork|rear shock|std settings|adjustments|spring preload|fork oil|collapsed'),
     ('jet',r'carburet|jet|needle|slide|float|spark plug|gap|ignition timing'),
     ('drive',r'^speed|^transmission$|final drive|^chain'),
     ('fluid',r'fuel type|premix|coolant|transmission / clutch oil|quantity'),
     ('spec',r'wheelbase|wheel size|seat height|fuel tank|^type|cooling system|displacement|bore and stroke|ignition system|tire|pressure')]
def cls(k,parentcls):
    last=k.split(' / ')[-1].lower() if ' / ' in k and not re.match(r'(main jet|slow|speed|transmission) /',k.lower()) else k.lower()
    for c,p in CLS:
        if re.search(p,last): return c
    return parentcls
TOP={'spec':('identity','Specifications: engine, size and tyres'),'jet':('setups','Stock jetting, spark plug and ignition timing'),'drive':('drivetrain','Gearing, chain and clutch'),'fluid':('maintenance','Fuel, premix, coolant and gearbox oil'),'susp':('suspension','Stock fork and shock settings and fork oil')}
recs=collections.OrderedDict()   # (model,topicclass,statement_body) -> years
for name,v in sorted(D.items()):
    y=int(name[:4]);model=name[5:].replace('_',' ')
    groups=collections.defaultdict(list);pc=None;parent_top=None
    for k,val in v['gen']:
        if k=='_model': continue
        top=k.split(' / ')[0] if not re.match(r'(main jet|slow|speed|transmission) /',k.lower()) else k
        c=cls(k,pc if (' / ' in k and top==parent_top) else None) or 'spec'
        if not (' / ' in k and top==parent_top): parent_top=top
        pc=c if ' / ' not in k or top!=parent_top else pc
        if ' / ' in k and top==parent_top and k!=top: label=k[len(top)+3:]
        else: label=k
        val=clean(val);label=clean(label)
        if re.search(r' / (Quantity|Needle|Float Height|Needle clip position|Needle Clip Position|Gap|Pressure|Slide|Weight)$',label): label=label.rsplit(' / ',1)[1]
        if val: groups[c].append(f"{label}: {val}".replace('stroke, stroke,','stroke,'))
        elif re.search(r'\d',label): groups[c].append(label)
    if v.get('breakin_mix'): groups['fluid'].append(f"The break-in section says to mix at {v['breakin_mix']}")
    for c,items in groups.items():
        recs.setdefault((model,c,'; '.join(items)),[]).append(y)
    tq=[(clean(n),nm,ft) for n,ft,inlb,nm,rem in v['torque'] if not re.search(r'see the|\(SP\)',n,re.I) and float(ft)>0 and abs(float(nm)-float(ft)*1.356)/(float(ft)*1.356)<=0.2]   # rows whose Nm and ft-lb disagree are misprints: left out
    if len(tq)>=8:
        recs.setdefault((model,'torque','; '.join(f"{n} {nm} Nm ({ft} ft-lb)" for n,nm,ft in tq)),[]).append(y)
def yr(ys):
    ys=sorted(ys);out=[];a=b=ys[0]
    for x in ys[1:]+[None]:
        if x is not None and x==b+1: b=x;continue
        out.append(str(a) if a==b else f"{a}-{b}");a=b=x
    return ', '.join(out)
n=0
for (model,c,body),ys in recs.items():
    dom,topic=TOP.get(c,('maintenance','Torque values'))
    s=F.src('manufacturer',f"Cobra {model} owner's manuals {yr(ys)}",'https://cobramoto.com',str(max(ys)))
    lead={'spec':f"{yr(ys)} Cobra {model} specifications from the owner's manual. ",'jet':f"{yr(ys)} Cobra {model} stock carburetor and ignition settings from the owner's manual. ",'drive':f"{yr(ys)} Cobra {model} drivetrain from the owner's manual. ",'fluid':f"{yr(ys)} Cobra {model} fuel and fluids from the owner's manual. ",'susp':f"{yr(ys)} Cobra {model} stock suspension from the owner's manual. ",'torque':f"{yr(ys)} Cobra {model} torque values from the owner's manual. "}[c]
    tail=" The spark plug is tightened by feel after the gasket seats, as described in the manual." if c=='torque' else (" Cobra's manual also has a chart of fork and shock springs by rider weight." if c=='susp' else '')
    st=lead+body+'.'+tail
    if len(st)>1190: st=lead+body[:1190-len(lead)-len(tail)-4].rsplit(';',1)[0]+'.'+tail
    F.R(dom,topic,[model],sorted(ys),st,{},'OEM',s,'medium','Carried as printed in the manual\'s specification table; a few manuals carry over lines from an earlier year, so check the manual for the exact bike before ordering parts.');n+=1
F.write()
