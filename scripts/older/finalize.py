"""Turn builder payloads into a load batch under docs/research/older/<batch>/: adds url/rev/ref, optional row filter, recomputes want.
usage: finalize.py <batch> <url template with {doc}> <rev template with {make} {yr} {art}> <stage dir> [--no-schedule] [--keep-models a,b] [--years y0-y1]"""
import sys,json,glob,hashlib,re,os
h=lambda s:hashlib.sha256(s.encode()).hexdigest()
batch,urlt,revt,stage=sys.argv[1:5]; args=sys.argv[5:]
nosched='--no-schedule' in args
keep_models=set(args[args.index('--keep-models')+1].split(',')) if '--keep-models' in args else None
yrs=tuple(map(int,args[args.index('--years')+1].split('-'))) if '--years' in args else None
out=f'docs/research/older/{batch}'; os.makedirs(out,exist_ok=True)
start=len(glob.glob(out+'/[0-9]*.json')); i=start; total=0
for f in sorted(glob.glob(stage+'/*.json'),key=lambda p:int(os.path.basename(p)[:-5])):
    d=json.load(open(f))
    if keep_models and d['model'] not in keep_models: continue
    if yrs and not (yrs[0]<=int(d['yr'])<=yrs[1]): continue
    lines=[l[2:] for l in d['delta'].split('\n') if l]
    if nosched: lines=[l for l in lines if not l.split('|')[2].startswith('Service schedule')]
    lines=[l for l in lines if not re.search(r'\b(EU|AUS|AU)\b|models /',l.split('|')[2])]
    lines=sorted(lines,key=lambda l:h(l.split('|')[2]))
    if not lines: continue
    art=d['doc'].split('_')[1] if '_' in d['doc'] else d['doc']
    i+=1; total+=len(lines)
    rec={'make':d['make'],'model':d['model'],'yr':int(d['yr']),'doc':d['doc'],'sha':d['sha'],'url':urlt.format(doc=d['doc']),
         'rev':revt.format(make=d['make'],yr=d['yr'],art=art,doc=d['doc']),
         'ref':f'docs/research/older/{batch}/REVIEW.md; {d["doc"]}; text-layer extraction, units checked against printed conversions, US rows by printed validity, fail-closed.',
         'want':h('\n'.join(lines)),'delta':'\n'.join('+|'+l for l in lines),'n':len(lines)}
    json.dump(rec,open(f'{out}/{i}.json','w'),ensure_ascii=False)
print(batch,'payloads',start+1,'..',i,'rows',total)
