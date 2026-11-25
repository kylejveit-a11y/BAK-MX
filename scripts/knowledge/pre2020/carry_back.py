"""Generation carry-back (knowledge push 2026-11).
Second-hand records researched for the 2020+ roster often describe a platform generation that started before 2020
(e.g. KTM SX-F 2019-2022, Yamaha YZ125 2005-2021). This copies those records to the earlier roster years of the SAME generation.
Rules (fail closed):
- only second-hand tiers/sources (magazine, tuner, race team, forum); never rows read from a year's own manual or parts catalogue;
- the record must already apply to 2020 and to at least 3 roster years, or name an earlier year range in its topic;
- identity, suspension and setups records are taken only when their topic names a year range that reaches the target year;
- a topic that names 2020 or 2021 without naming an earlier year is treated as year-specific and skipped;
- ids in DROP were reviewed by hand and left out.
Every copy keeps the original statement (which names the year it was measured or tested on) and says in notes why it applies."""
import json,glob,re,os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from _lib import root
GEN={'YZ125':(list(range(2010,2020)),'2005-2021'),'YZ250':(list(range(2010,2020)),'2005-2021 engine and frame'),'YZ250X':([2016,2017,2018,2019],'2016-2023'),
 'YZ450FX':([2019],'2019-2020'),'WR450F':([2019],'2019-2020'),'YZ250F':([2019],'2019-2020 (unchanged for 2020)'),'CRF450R':([2019],'2017-2020, with the 2019 engine and chassis update'),
 'CRF450RX':([2019],'2017-2020, with the 2019 update'),'CRF150R':(list(range(2012,2020)),'2007-on, unchanged'),'KX450':([2019],'2019-2023'),
 '125 SX':([2019],'2019-2022'),'150 SX':([2019],'2019-2022'),'250 SX':([2019],'2019-2022'),'250 SX-F':([2019],'2019-2022'),'350 SX-F':([2019],'2019-2022'),'450 SX-F':([2019],'2019-2022'),
 '250 XC-F':([2019],'2019-2022'),'350 XC-F':([2019],'2019-2022'),'450 XC-F':([2019],'2019-2022'),'85 SX 17/14':([2018,2019],'2018-2024'),'85 SX 19/16':([2018,2019],'2018-2024'),
 'FC 250':([2019],'2019-2022'),'FC 350':([2019],'2019-2022'),'FC 450':([2019],'2019-2022'),'TC 125':([2019],'2019-2022'),'TC 250':([2019],'2019-2022'),'FX 350':([2019],'2019-2022'),'FX 450':([2019],'2019-2022')}
MAKE={'YZ':'Yamaha','WR':'Yamaha','CRF':'Honda','KX':'Kawasaki','FC':'Husqvarna','TC':'Husqvarna','FX':'Husqvarna'}
OKT={('MEASURED','magazine'),('TUNER','magazine'),('TUNER','tuner'),('TUNER','race team'),('COMMUNITY','forum'),('COMMUNITY','magazine'),('OEM','magazine'),('DERIVED','magazine'),('TUNER','tester'),('OEM','tuner'),('TUNER','dealer'),('COMMUNITY','dealer')}
DROP=set(l.split()[0] for l in open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'carry_drop.txt')) if l.strip() and not l.startswith('#')) if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)),'carry_drop.txt')) else set()
def early(txt,y):
    """True when the text names a year or year range that reaches target year y (<2020)."""
    for a,b in re.findall(r'\b(20[012]\d)\s*[-–]\s*(20[012]\d)\b',txt):
        if int(a)<=y<=int(b): return True
    return bool(re.search(r'\b%d\b'%y,txt))
FLOOR={'y2t8-005':2011}   # the statement itself says 'since 2011'
out=[];rep=[]
for f in sorted(glob.glob(os.path.join(root,'docs/research/knowledge/*.json'))):
    if os.path.basename(f).startswith(('pre2020_','carry_')): continue
    d=json.load(open(f))
    if not (isinstance(d,dict) and 'records' in d): continue
    for r in d['records']:
        a=r.get('applies_to') or {}; ys=a.get('years',[])
        if 2020 not in ys or (r['tier'],r['source'].get('type')) not in OKT or r['id'] in DROP: continue
        if r['id'].startswith(('fit','rfit','tire-','gear-')): continue
        topic=r['topic']
        for m0 in a.get('models',[]):
            m=re.sub(r'^(KTM|Husqvarna|GasGas|Yamaha|Honda|Kawasaki|Triumph) ','',m0)
            if m not in GEN: continue
            tys=[y for y in GEN[m][0] if y not in ys and y>=FLOOR.get(r['id'],0)]
            keep=[]
            for y in tys:
                named=early(topic,y)
                if re.search(r'\b202[0-9]\b',topic) and not named: continue          # year-specific topic
                if r['domain'] in ('identity','suspension','setups') and not named: continue
                if len(ys)<3 and not named and m not in ('YZ125','YZ250','YZ250X','CRF150R'): continue
                keep.append(y)
            if not keep: continue
            mk=next((v for k,v in MAKE.items() if m.startswith(k)),'KTM')
            n=dict(r); n['id']='gb-'+r['id']+'-'+re.sub(r'[^a-z0-9]','',m.lower()); n['applies_to']={'make':mk,'models':[m],'years':keep}
            n['notes']=((r.get('notes') or '')+' ').lstrip()+f'Carried to {keep[0]}'+(f'-{keep[-1]}' if len(keep)>1 else '')+f': same platform generation ({GEN[m][1]}); the statement names the year it was tested or measured on where that matters.'
            out.append(n); rep.append((n['id'],r['domain'],m,keep[0],keep[-1],topic[:70],r['statement'][:150]))
json.dump({'slice':'Generation carry-back: second-hand records for the 2020+ roster copied to earlier years of the same platform generation (knowledge push 2026-11); see scripts/knowledge/pre2020/carry_back.py for the rules',
 'platform':{'make':'KTM','models':sorted(GEN),'years':list(range(2010,2020))},'records':out,'conflicts':[],'not_found':[],'sources':[]},open(os.path.join(root,'docs/research/knowledge/carry_back.json'),'w'),ensure_ascii=False,indent=1)
print(len(out),'records')
if len(sys.argv)>1:
    for x in rep: print('\t'.join(map(str,x)))
