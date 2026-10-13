"""Payloads for private.stage_manual_rows from Triumph's public US owner's handbooks.
usage (from the PDF directory): build_triumph.py <out dir>"""
import sys,json,hashlib,os,collections
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import triumph_handbook as T
def h(s): return hashlib.sha256(s.encode()).hexdigest()
DOCS={'3850529':('697b08172114eb1a98f6704f','OHB_TF250-X and TF450RC Edition_3850529-US'),'3850672':('697b0a68aa5a3d37f2aa2ef0','OHB_TF250-X_TF450-X and TF450RC Edition_3850672-US'),
      '3850699':('697b1c4ec47604be99a352a4','OHB_TF250-C and TF450-C_3850699-US'),'3850136':('697b112531d8347c29c5ce2b','OHB_TF250-E and TF450-E_3850136-US')}
# (model, year, handbooks). Two handbooks = the model year is split by VIN; only rows both handbooks print identically are kept.
PLAN=[('TF 250-X',2024,['3850529']),('TF 250-X',2025,['3850672','3850529']),('TF 250-X',2026,['3850672']),('TF 450-RC Edition',2025,['3850672']),('TF 450-X',2026,['3850672']),
      ('TF 250-C',2026,['3850699']),('TF 450-C',2026,['3850699']),('TF 250-E',2026,['3850136']),('TF 450-E',2026,['3850136'])]
cache={}
def doc(k):
    if k not in cache:
        f=DOCS[k][0]+'.pdf'; s,p=T.settings(f); assert not p,(k,p)
        cache[k]=(T.parse(f),s,hashlib.sha256(open(f,'rb').read()).hexdigest())
    return cache[k]
def rows_for(k,model):
    rows,sets,_=doc(k); f,notes=T.facts(rows,model)
    out=[(r['pdf'],r['printed'],p,v) for r,p,v in f]+[(a,b,p,v) for a,b,p,v,ms in sets if T.norm_model(model) in ms]
    by=collections.defaultdict(set)
    for a,b,p,v in out: by[p].add((a,b,v))
    return {p:sorted(s)[0] for p,s in by.items() if len({x[2] for x in s})==1}, [p for p,s in by.items() if len({x[2] for x in s})>1], [n for n in notes if n.startswith('DROPPED')]
out=sys.argv[1]; os.makedirs(out,exist_ok=True); summary=[]
for i,(model,yr,ks) in enumerate(PLAN):
    d,conf,dropped=rows_for(ks[0],model); withheld=[]
    for k in ks[1:]:
        d2,_,_=rows_for(k,model)
        withheld=sorted(p for p in d if p not in d2 or d2[p][2]!=d[p][2]); d={p:x for p,x in d.items() if p not in withheld}
    keep=[(a,b,p,v) for p,(a,b,v) in d.items()]
    for a,b,p,v in keep: assert '|' not in p+v and '\n' not in p+v and b!='?' and v.strip(),(p,v)
    lines=[f'{a}|{b}|{p}|{v}|' for a,b,p,v in sorted(keep,key=lambda x:h(x[2]))]
    ident,title=DOCS[ks[0]]
    json.dump({'make':'Triumph','model':model,'yr':yr,'url':f'https://api.triumphtechnicalinformation.com/handbooks/documents/{ident}/pdf','sha':doc(ks[0])[2],
               'rev':"Triumph Owner's Handbook "+ks[0]+'-US','ref':'docs/research/expansion/triumph/HANDBOOK_REVIEW_2026-10-13.md; '+title+'; text-layer extraction with glyph positions, hash-guarded; rows selected by the model named in each table heading.',
               'want':h('\n'.join(lines)),'delta':'\n'.join('+|'+l for l in lines),'n':len(keep)},open(f'{out}/{i}.json','w'),ensure_ascii=False)
    summary.append({'i':i,'model':model,'yr':yr,'handbooks':ks,'n':len(keep),'suspension':sum(1 for k in keep if k[2].startswith(('Fork','Shock'))),'conflicts':conf,'dropped':dropped,'withheld_vin_split':withheld})
    print(summary[-1])
json.dump(summary,open(out+'.summary.json','w'),indent=1)
