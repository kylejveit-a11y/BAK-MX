"""Every brand listed for any in-scope bike, across all family catalogs -> companies/ALL_BRANDS.md.

usage: all_brands.py <aftermarket dir>
Reads each family's parts.csv (built by build_catalog.py). Brand names are grouped case-insensitively with punctuation
ignored; the most common spelling is shown. Also marks whether the brand is in the researched company registry
(companies/COMPANIES.md)."""
import csv,os,re,sys,glob,collections
root=sys.argv[1]
fams={'ktm-family':'KTM group','triumph':'Triumph','yamaha':'Yamaha','honda':'Honda','kawasaki':'Kawasaki'}
key=lambda b:re.sub(r'[^a-z0-9]','',b.lower())
names=collections.defaultdict(collections.Counter); fam=collections.defaultdict(set); src=collections.defaultdict(collections.Counter); cats=collections.defaultdict(collections.Counter)
for d,label in fams.items():
    f=os.path.join(root,d,'parts.csv')
    if not os.path.exists(f): continue
    for r in csv.DictReader(open(f)):
        b=(r['brand'] or '').strip()
        if not b: continue
        k=key(b); names[k][b]+=1; fam[k].add(label); src[k][r['source']]+=1
        if r['category']: cats[k][r['category'].split(' / ')[0]]+=1
reg=open(os.path.join(root,'companies','COMPANIES.md')).read().lower() if os.path.exists(os.path.join(root,'companies','COMPANIES.md')) else ''
regk=set(key(x) for x in re.findall(r'^\|\s*([^|]+?)\s*\|',reg,re.M))
L=['# Every aftermarket brand listed for the app\'s bikes','',
   f'{len(names)} brands with at least one part listed for an in-scope bike (2020-2027 motocross and cross-country), from dealer and retailer catalogs and research. '
   'Listings counts every listing across families (a part listed for two families counts twice). "Registry" marks brands also profiled in COMPANIES.md. Built by scripts/aftermarket/all_brands.py.','',
   '| Brand | Listings | Families | Main categories | Sources | Registry |','|---|---|---|---|---|---|']
for k in sorted(names,key=lambda k:(-sum(names[k].values()),k)):
    L.append(f"| {names[k].most_common(1)[0][0].replace('|','/')} | {sum(names[k].values())} | {', '.join(x for x in fams.values() if x in fam[k])} | {', '.join(c for c,_ in cats[k].most_common(4)).replace('|','/')} | {', '.join(f'{s} {n}' for s,n in src[k].most_common())} | {'yes' if k in regk else ''} |")
open(os.path.join(root,'companies','ALL_BRANDS.md'),'w').write('\n'.join(L)+'\n')
print(len(names),'brands;',sum(1 for k in names if k in regk),'in registry')
