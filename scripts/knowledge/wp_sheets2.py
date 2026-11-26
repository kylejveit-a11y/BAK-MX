"""WP factory setting lists for KTM bikes in the Garage, 2010-2027: clickers, sag, pressures or springs by rider weight
and the factory shim stacks, one record set per sheet and model year. Built from docs/research/suspension/
wp-setting-sheets.json (facts read from the sheets' own text). Only sheets that parsed completely are used.
The listings come from a European KTM dealer's document index, so every record tells the rider to match the WP
article number on the fork or shock; a US bike can carry a different article. usage: python3 scripts/knowledge/wp_sheets2.py"""
import sys,os,json,re,collections
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File,root
D=json.load(open(os.path.join(root,'docs/research/suspension/wp-setting-sheets.json')))
F=File('wp_sheets2_ktm','wp-b','WP factory setting lists for KTM model-years in the Garage (2026-11)','KTM',['450 SX-F'],list(range(2010,2028)))
SKIP={'SL_A460C159Y406000_-_de-en.pdf','SL_A460C459Y408000_-_de-en.pdf'}  # loaded by wp_sheets1.py
def gname(k):
    k=k.lower();g='Mid-valve' if 'midvalve' in k else 'Base valve' if 'basevalve' in k else 'Second piston' if re.search(r'(kolben|piston) ?2',k) else 'Main piston' if re.search(r'kolben|piston',k) else 'Compression adjuster unit' if re.search(r'druckstufenventil|compression unit',k) else 'Nut' if 'nut' in k else 'Stack'
    side=' compression' if re.search(r'druckstufe$|compression$',k) else ' rebound' if re.search(r'zugstufe$|rebound$',k) else ''
    return g+(side if g in('Mid-valve','Base valve','Main piston','Second piston') else '')
def stack(v): return ', '.join(d+(f" ({q} of them)" if q>1 else '') for q,d in v)
lb=lambda kg:'-'.join(str(round(int(x)*2.2046)) for x in kg.split('-'))
psi=lambda b:round(float(b)*14.5038)
def tri(v,unit):
    if not v: return 'None'
    return f"{v[1]} {unit} standard ({v[0]} comfort, {v[2]} sport)" if len(v)==3 else 'None'
ok=lambda o:o and o.get('article') and o.get('stacks') and o['pairs_seen']==o['pairs_kept'] and ((o['kind']=='fork' and o.get('comp') and o.get('reb')) or (o['kind']=='shock' and o.get('lsc') and o.get('reb')))
by=collections.defaultdict(set);url={}
for r in D['index']:
    if r['file'] in SKIP: continue
    by[(r['file'],r['year'])].add(r['model']);url[r['file']]=r['url']
CAVEAT=" Match the article number on the {p} before using this: the listing comes from a European dealer index and a US bike can carry a different article."
n=0
for (f,y),models in sorted(by.items(),key=lambda x:(x[0][1],x[0][0])):
    o=D['sheets'].get(f)
    if not ok(o): continue
    a=o['article'];p=o['kind'];models=sorted(models);s=F.src('manufacturer',f"WP setting list {a}",url[f],str(y))
    named=''  # the sheet's own model line is kept in docs/research/suspension; it wraps across lines and is not quoted to riders
    if p=='fork':
        bits=[f"compression {tri(o['comp'],'clicks out')}",f"rebound {tri(o['reb'],'clicks out')}"]
        if o.get('air'): bits.append('air pressure by rider weight '+', '.join(f"{b} bar ({psi(b)} psi) for {lb(w)} lb" for w,b in o['air']))
        fl=o.get('fills') or {}
        if fl.get('cartridge_oil_ml'): bits.append(f"{fl['cartridge_oil_ml']} ml in the damper cartridge")
        if fl.get('outer_tube_ml'): bits.append(f"{fl['outer_tube_ml']} ml in each outer tube")
        if fl.get('air_chamber_mm'): bits.append(f"air chamber (oil level) {fl['air_chamber_mm']} mm")
    else:
        bits=[f"low-speed compression {tri(o['lsc'],'clicks out')}"]
        if o.get('hsc'): bits.append(f"high-speed compression {tri(o['hsc'],'turns out')}")
        bits.append(f"rebound {tri(o['reb'],'clicks out')}")
        if o.get('static_sag'): bits.append(f"static sag {o['static_sag']} mm")
        if o.get('rider_sag'): bits.append(f"rider sag {o['rider_sag']} mm")
        if o.get('springs'): bits.append('spring by rider weight '+', '.join(f"{r} N/mm for {lb(w)} lb" for w,r in o['springs']))
        if o.get('gas_bar'): bits.append(f"gas pressure {o['gas_bar']} bar ({psi(o['gas_bar'])} psi)")
    if o.get('oil_sae'): bits.append(f"SAE {o['oil_sae']} oil")
    bits=[b for b in bits if 'None' not in b]
    if len(bits)<2: continue
    F.R('suspension',f"WP {p} setting list {a}: factory settings",models,[y],f"WP setting list for the {y} {p} article {a}{named}: "+'; '.join(bits)+'.'+CAVEAT.format(p=p),
        {'article':a,**{k:o[k] for k in ('comp','reb','lsc','hsc','static_sag','rider_sag','gas_bar','air','springs','oil_sae','fills') if o.get(k)}},'OEM',s,'medium')
    F.R('suspension',f"WP {p} factory shim stacks, article {a}",models,[y],f"Factory valve stacks for the {y} WP {p} article {a}. "+' '.join(f"{gname(k)}: {stack(v)}." for k,v in o['stacks'].items())+" Sizes are inner x outer diameter x thickness in mm, in the order printed; an 8-digit number is a WP part."+CAVEAT.format(p=p)+" Record the stack you find before changing it.",
        {'article':a,'stacks':{gname(k):v for k,v in o['stacks'].items()}},'OEM',s,'medium')
    n+=1
F.write();print(n,'sheet-years')
