import sys,collections,json
import tech_data_2020_2025 as td, tech_data_2025_plus as td2, service_schedule as ss
PLAN=[('25_3240038_en_BA',td2,[('85 SX 17/14',2025),('85 SX 19/16',2025)]),('26_3240229_en_BA',td2,[('85 SX 17/14',2026),('85 SX 19/16',2026)]),('27_3240375_en_BA',td2,[('85 SX 17/14',2027),('85 SX 19/16',2027)]),
('20_3214000_en_OM',td,[('125 SX',2020),('150 SX',2020)]),('21_3214209_en_OM',td,[('125 SX',2021),('150 SX',2021)]),('22_3214411_en_OM',td,[('125 SX',2022),('150 SX',2022)]),
('23_3214638_en_OM',td,[('125 SX',2023)]),('24_3214832_en_OM',td,[('125 SX',2024)]),('25_3240041_en_OM',td,[('125 SX',2025),('150 SX',2025)]),('26_3240232_en_BA',td2,[('125 SX',2026)]),('27_3240379_en_BA',td2,[('125 SX',2027)])]
if __name__=='__main__':
    out={}
    for d,mod,mys in PLAN:
        rows=mod.parse(d+'.pdf')
        for m,y in mys:
            f,q=mod.facts(rows,m)
            c=collections.Counter(p for _,p,_ in f)
            vals=collections.defaultdict(set)
            for _,p,v in f: vals[p].add(v)
            conf=[p for p,s in vals.items() if len(s)>1]
            print(d,m,y,len(f),'conflicts',conf[:6],'bad',[p for p in c if p.startswith('!')][:3])
            print('    secs',dict(collections.Counter(p.split(' / ')[0] for _,p,_ in f)))
            print('    notes',sorted(x for x in q if not x.startswith(('DROPPED','VARIANT','NOLABEL'))),[x for x in q if x.startswith(('DROPPED','VARIANT','NOLABEL'))])
            out[f'{d}|{m}|{y}']=[(r['pdf'],r['printed'],p,v) for r,p,v in f]
    json.dump(out,open(sys.argv[1],'w'),ensure_ascii=False,indent=0)
