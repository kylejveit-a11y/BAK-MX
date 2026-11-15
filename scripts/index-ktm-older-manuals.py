"""List the official English owner's manuals for KTM 2010-2019 (and Husqvarna 2014-2019) from the brands' own manual pages
(the JSON endpoints their manual finder calls). Ordinary public requests, nothing bypassed. Writes manual-index/ktm-group-us-older.tsv.
usage: python3 scripts/index-ktm-older-manuals.py"""
import json,re,sys,time,urllib.parse,urllib.request
SITES={'KTM':'https://www.ktm.com/en-us/service/manuals/_jcr_content/root/responsivegrid_1_col/bikemanuals',
       'Husqvarna':'https://www.husqvarna-motorcycles.com/en-us/service/manuals/_jcr_content/root/responsivegrid_1_col/bikemanuals'}
FAM={'KTM':['85 SX 17/14','85 SX 19/16','125 SX','150 SX','250 SX','300 SX','250 SX-F','350 SX-F','450 SX-F','125 XC','250 XC','300 XC','250 XC-F','350 XC-F','450 XC-F','150 XC-W','250 XC-W','300 XC-W','450 XCF-W','500 XC-W','350 XCF-W'],
     'Husqvarna':['TC 85','TC 125','TC 250','FC 250','FC 350','FC 450','TX 125','TX 300','FX 350','FX 450','TE 150','TE 250','TE 300','FE 350','FE 450','FE 501']}
YEARS={'KTM':range(2010,2020),'Husqvarna':range(2014,2020)}
def get(url):
    for a in range(3):
        try:
            with urllib.request.urlopen(url,timeout=40) as r: return json.load(r)
        except Exception as e:
            if a==2: raise
            time.sleep(2)
out=[]
for make,base in SITES.items():
    for fam in FAM[make]:
        for yr in YEARS[make]:
            name=f'{fam} {yr}'; time.sleep(0.4)
            try: d=get(base+'.manuals.json?modelName='+urllib.parse.quote(name))
            except Exception as e: print('ERR',make,name,e,file=sys.stderr); continue
            ms=(d.get('data') or {}).get('manuals') or []
            us=[m for m in ms if re.search(r'\bUS \(en\)',m['title'])] or [m for m in ms if '(en)' in m['title']]
            if not us: continue
            doc=us[0]['link'].rsplit('/',1)[1].removesuffix('.pdf')
            if '_OM' not in doc: continue
            out.append((make,fam,yr,doc,us[0]['title']))
            print(make,fam,yr,doc,us[0]['title'],flush=True)
with open('docs/research/manual-index/ktm-group-us-older.tsv','w') as f:
    f.write('# Official English owner\'s manuals from the KTM and Husqvarna US manual finders (bikemanuals.manuals.json), listed '+time.strftime('%Y-%m-%d')+'.\n')
    f.write('# URL: https://azwecdnepstoragewebsiteuploads.azureedge.net/<document>.pdf  status: todo = listed, not read yet\nmake\tmodels\tyear\tdocument\tstatus\ttitle\n')
    for make,fam,yr,doc,t in out: f.write(f'{make}\t{fam}\t{yr}\t{doc}\ttodo\t{t}\n')
print(len(out),'manuals')
