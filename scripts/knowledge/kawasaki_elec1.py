"""Kawasaki KX electrical basics 2014-2027 from the owner's manual text layers (docs/research/electrical/kawasaki-electrical.json,
built by kawasaki_elec_extract.py): ignition and spark plug, battery and main fuse, DFI fault codes, launch control and map
selection. Years with identical content are merged. Wire-by-wire diagrams are not in the text layer and are not included.
usage: python3 scripts/knowledge/kawasaki_elec1.py"""
import sys,os,json,re,collections
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File,root
D=json.load(open(os.path.join(root,'docs/research/electrical/kawasaki-electrical.json')))
F=File('kawasaki_elec1','w-kw1','Kawasaki KX electrical basics from the owner\'s manuals (wiring pass 2026-11)','Kawasaki',['KX450','KX250','KX450X','KX250X','KX112','KX85','KX65'],list(range(2014,2028)))
s=F.src('manufacturer',"Kawasaki KX owner's manuals (US English e-book text layer)",'https://www.kawasaki.com/en-us/owner-center/service-manuals','2026')
N="From Kawasaki's owner's manual for this model year. The wire-by-wire diagram is printed in the manual and is not reproduced here."
BASE={'KX450F':'KX450','KX450H':'KX450','KX450J':'KX450','KX450M':'KX450','KX450K':'KX450X','KX450N':'KX450X','KX250Z':'KX250','KX252A':'KX250','KX252B':'KX250','KX252C':'KX250','KX252E':'KX250','KX252D':'KX250X','KX252F':'KX250X','KX85C':'KX85','KX85E':'KX85','KX112A':'KX112','KX112B':'KX112','KX65A':'KX65','KX65C':'KX65'}
SIB={'KX450K':'KX450X','KX450N':'KX450X','KX252D':'KX250X','KX252F':'KX250X','KX112A':'KX112','KX112B':'KX112'}
PROB={'Throttlesensor':'throttle sensor','Intakeairpressuresensor':'intake air pressure sensor','Intakeairtemperaturesensor':'intake air temperature sensor','Watertemperaturesensor':'water temperature sensor','Crankshaftsensor':'crankshaft sensor','Gearpositionswitch':'gear position switch','Vehicle-downsensor':'vehicle-down (tip-over) sensor','Fuelinjector':'fuel injector','Downstreaminjector':'downstream injector','Upstreaminjector':'upstream injector','Fuelpump':'fuel pump','Ignitioncoil':'ignition coil','Mainrelay':'main relay','Battery':'battery'}
def prob(p):
    p=p.replace('Problems','');p=re.sub(r'^F(?=[A-Z])','',p)
    for k,v in PROB.items():
        if p.startswith(k):return v+(' voltage abnormal' if 'voltageabnormal' in p else ' fault or its wiring open or shorted')
    return None
def timing(t): m=re.match(r'(\d+)°BTDC@(\d+)',t);return f"{m.group(1)}° BTDC at {int(m.group(2)):,} rpm"
def recs(o):
    R={}
    # A ignition and plug
    a=[]
    if o.get('ignition'):a.append('Ignition: '+{'DigitalDC-CDI':'digital DC-CDI','DigitalCDI':'digital CDI','CDI':'CDI'}[o['ignition']])
    if o.get('timing'):a.append('Ignition timing: '+' and '.join(timing(t) for t in o['timing'])+(' (the manual prints both figures)' if len(o['timing'])>1 else ''))
    if o.get('plug'):a.append(f"Standard spark plug: {o['plug']}"+(', solid-post terminal' if (o.get('terminal') or '').startswith('Solid') else ''))
    g=o.get('gaps') or []
    if len(g)==1:a.append('Plug gap: '+g[0])
    elif len(g)==2:a.append(f"Plug gap: {g[0]} for the standard plug; the manual also lists {g[1]} for its alternative plug"+(' (NGK BR9EVX)' if 'BR9EVX' in (o.get('gap_plugs') or '') else ''))
    if o.get('plug_torque'):
        m=re.match(r'([\d.]+)N·m\(([\d.]+)kgf·m,([\d.]+)(in|ft)·lb\)',o['plug_torque'])
        if m:a.append(f"Spark plug torque: {m.group(1)} N·m ({m.group(3)} {m.group(4)}·lb)")
    m=re.match(r'NGK([A-Z]+\d+[A-Z]+-\d)',o.get('colder_plug') or '')
    if m:a.append(f"Colder option listed: NGK {m.group(1)}")
    if not o.get('battery') and o.get('kick'):a.append('Kick start, no battery listed')
    if len(a)>=2:R['ign']=('Ignition system, spark plug and plug gap','. '.join(a)+'.')
    # B battery / fuse
    if o.get('battery'):
        m=re.match(r'([\d.]+)V([\d.]+)Ah',o['battery']);b=[f"Battery: {m.group(1)} V, {m.group(2)} Ah"+(' lithium-ion' if 'Lithium' in o['battery'] else '')]
        if o.get('charge_v'):
            v=re.match(r'([\d.]+)Vto([\d.]+)V',o['charge_v']);b.append(f"Charge only with a charger made for lithium batteries, never a lead-acid charger: {v.group(1)} to {v.group(2)} V"+(f" at {o['charge_a'].replace('A',' A')}" if o.get('charge_a') else ''))
            b.append(f"Check the battery before riding or every two weeks and charge it when it reads under {m.group(1)} V")
        if len(o.get('main_fuse_a') or [])==1:
            w=o.get('fuse_where') or ''
            where=' in the starter relay behind the right radiator shroud' if 'starterrelay' in w and 'rightradiatorshroud' in w else (' behind the right radiator shroud, with a spare' if 'rightradiatorshroud' in w else '')
            b.append(f"Main fuse: {o['main_fuse_a'][0]} A{where}. Disconnect the battery negative cable before pulling it. A blown main fuse means the starter does nothing")
        if o.get('acc_conn'):b.append('The cross-country (X) version has electric accessory connectors; see the manual for their location and fuse')
        R['bat']=('Battery, charging and main fuse','. '.join(b)+'.')
    # C codes
    pairs=[(n,prob(p)) for c in o['codes'] for n,p in zip(c['nums'],c['probs']) if len(c['nums'])==len(c['probs'])]
    if pairs and all(p for _,p in pairs):
        R['codes']=('DFI fault codes (blink codes)','When the fuel injection system has a fault, the warning indicator light flashes a two-digit service code as long and short blinks: read the tens digit, then the ones digit. The manual's self-diagnosis section shows the steps for this model year. Several stored codes play lowest number first. Codes: '+'; '.join(f"{n} {p}" for n,p in pairs)+'. If the part and its wiring check good, check the ECU power and ground before blaming the ECU.')
    # D maps / launch
    d=[]
    if o.get('dfi_couplers'):
        d.append("Engine maps are chosen with three plug-in DFI connectors at the right front of the frame: green is the standard map; white and black are the hard-track and soft-track maps (the manual's table shows which colour is which). Change it with the engine stopped. With no connector fitted the ECU runs the standard map, but keep one plugged in to keep dirt and water out")
        if o.get('fi_cal_kit'):d.append("Custom maps need Kawasaki's optional KX FI Calibration Kit")
        if o.get('has_launch'):d.append('Launch control mode is fitted; it adjusts ignition timing to help on slippery starts')
    if o.get('has_app'):
        d.append('Power mode (full or mild) and KTRC traction control (off, mode 1 or the stronger mode 2) are set with the two handlebar buttons, with the throttle closed and the engine idling. Custom fuel and ignition settings are made in the Rideology app through the communication unit on the bike')
        if o.get('launch'):
            l=o['launch'];d.append(f"Launch control: engine running in neutral, 1st or 2nd, press both buttons together and the left indicator turns purple. It blinks slowly from {int(l[0]):,} to {int(l[1]):,} rpm and fast at {int(l[2]):,} rpm or more. It switches off when you shift into 3rd")
    if d:R['maps']=('Engine map selection and launch control','. '.join(d)+'.')
    return R
M=collections.OrderedDict()
for o in D:
    if not o.get('year') or o.get('code') not in BASE:continue
    models=[BASE[o['code']]]+[SIB[x] for x in o.get('siblings',[]) if x in SIB and SIB[x]!=BASE[o['code']]]
    for k,(topic,body) in recs(o).items():
        for md in dict.fromkeys(models):
            if k=='bat' and 'X) version' in body and not md.endswith('X'):body2=body.replace(' The cross-country (X) version has electric accessory connectors; see the manual for their location and fuse.','')
            else:body2=body
            M.setdefault((md,topic,body2),[]).append(o['year'])
def span(ys):
    ys=sorted(set(ys));out=[];a=b=ys[0]
    for y in ys[1:]+[None]:
        if y is not None and y==b+1:b=y;continue
        out.append(str(a) if a==b else f"{a}-{b}");a=b=y
    return ', '.join(out)
for (md,topic,body),ys in M.items():
    F.R('ecu_electronics',topic,[md],sorted(set(ys)),f"{span(ys)} Kawasaki {md}. {body}",{},'OEM',s,'medium',N)
F.write()
for r in F.recs:
    if any(m in r['applies_to']['models'] for m in ('KX450','KX85','KX65')):print('-',r['statement'][:520])
