"""WP factory setting sheets (clickers, oil, air pressure or springs by rider weight, and the factory shim stacks).
First file: the two US-market sheets for the 2025 KTM 450 SX-F, read from the sheets' own text with wp_sheet_parse.py.
A sheet belongs to one fork or shock article number; the rider matches that number on the component.
usage: python3 scripts/knowledge/wp_sheets1.py FORK.pdf SHOCK.pdf   (the PDFs are not stored)"""
import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'));sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from _lib import File
from wp_sheet_parse import parse
F=File('wp_sheets1_ktm450_2025','wp-a','WP factory setting sheets: 2025 KTM 450 SX-F US fork and shock (2026-11)','KTM',['450 SX-F'],[2025])
M=['450 SX-F'];Y=[2025]
lb=lambda kg:'-'.join(str(round(int(x)*2.2046)) for x in kg.split('-'))
def stack(v): return ', '.join(d+(f" ({q} of them)" if q>1 else '') for q,d in v)
NAMES={'shims piston midvalve / compression':'Mid-valve compression','shims piston midvalve / rebound':'Mid-valve rebound','shims piston basevalve / compression':'Base valve compression','shims piston basevalve / rebound':'Base valve rebound',
       'shims piston 1 / compression':'Main piston compression','shims piston 1 / rebound':'Main piston rebound','details compression unit / description':'Compression adjuster unit'}
END=" Sizes are inner x outer diameter x thickness in mm, in the order printed; an 8-digit number is a KTM part. Match the article number on the component and record the stack you find before changing it."
for f in sys.argv[1:]:
    o=parse(f);a=o['article'];s=F.src('manufacturer',f"WP setting list {a}",'https://www.ktmshop.se/documents/'+o['file'],'2025')
    w=o['weights_kg']
    if o['kind']=='fork':
        F.R('suspension',f"Fork setting sheet {a}: clickers, air pressure by rider weight, oil",M,Y,
          f"WP's setting sheet for the 2025 450 SX-F US fork (article {a}, shared with the Factory Edition): compression {o['comp'][1]} clicks out standard ({o['comp'][0]} comfort, {o['comp'][2]} sport); rebound {o['reb'][1]} clicks out standard ({o['reb'][0]} comfort, {o['reb'][2]} sport). Air pressure by rider weight: {o['air_bar'][0]} bar ({round(float(o['air_bar'][0])*14.5038)} psi) for {lb(w[0])} lb, {o['air_bar'][1]} bar ({round(float(o['air_bar'][1])*14.5038)} psi) standard for {lb(w[1])} lb, {o['air_bar'][2]} bar ({round(float(o['air_bar'][2])*14.5038)} psi) for {lb(w[2])} lb. Service fill: {o['cart_oil_ml']} ml in the right damper cartridge, {o['outer_r_ml']} ml in each outer tube (190 to 250 ml allowed), {o['grease_g']} g of grease in the left air cartridge, SAE {o['oil_sae']} oil. Fork travel 310 mm, fork length 950 mm.",
          {'article':a,'comp_clicks':o['comp'],'reb_clicks':o['reb'],'air_bar':o['air_bar'],'rider_kg':w,'cartridge_oil_ml':o['cart_oil_ml'],'outer_tube_ml':o['outer_r_ml'],'oil_sae':o['oil_sae']},'OEM',s,'high')
    else:
        sp=o['springs']
        F.R('suspension',f"Shock setting sheet {a}: clickers, sag, springs by rider weight, gas pressure",M,Y,
          f"WP's setting sheet for the 2025 450 SX-F US shock (article {a}, shared with the Factory Edition): low-speed compression {o['lsc'][1]} clicks out standard ({o['lsc'][0]} comfort, {o['lsc'][2]} sport); high-speed compression {o['hsc'][1]} turns out standard ({o['hsc'][0]} comfort, {o['hsc'][2]} sport); rebound {o['reb'][1]} clicks out standard ({o['reb'][0]} comfort, {o['reb'][2]} sport). Static sag {o['static_sag']} mm, rider sag {o['rider_sag']} mm, spring preload 8 mm. Springs by rider weight: {sp[0][0]} N/mm for {lb(w[0])} lb (KTM {sp[0][2]}), {sp[1][0]} N/mm standard for {lb(w[1])} lb (KTM {sp[1][2]}), {sp[2][0]} N/mm for {lb(w[2])} lb (KTM {sp[2][2]}); all 240 mm long. Gas pressure {o['gas_bar']} bar ({round(int(o['gas_bar'])*14.5038)} psi), SAE {o['oil_sae']} oil. Shock length 456.3 mm, stroke 140.1 mm.",
          {'article':a,'lsc_clicks':o['lsc'],'hsc_turns':o['hsc'],'reb_clicks':o['reb'],'static_sag_mm':o['static_sag'],'rider_sag_mm':o['rider_sag'],'springs':sp,'gas_bar':o['gas_bar'],'oil_sae':o['oil_sae']},'OEM',s,'high')
    part='fork' if o['kind']=='fork' else 'shock'
    F.R('suspension',f"{part.capitalize()} factory shim stacks, article {a}",M,Y,
      f"Factory valve stacks for the 2025 450 SX-F US {part} (WP article {a}). "+' '.join(f"{NAMES.get(k,k)}: {stack(v)}." for k,v in o['stacks'].items())+END,
      {'article':a,'stacks':o['stacks']},'OEM',s,'high')
F.write()
