"""Honda ECM pinouts for every competition handbook on file (2021-2026 CRF250R/RX, CRF450R/RX, CRF450X), read from
the text layer of each wiring diagram (docs/research/electrical/honda-ecm-pinouts.json). The automated reading
matched the hand-read 2025 CRF450R on all 27 wired pins. Medium confidence. usage: python3 scripts/knowledge/wiring4.py"""
import sys,os,json,re
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File,root
D=json.load(open(os.path.join(root,'docs/research/electrical/honda-ecm-pinouts.json')))['handbooks']
F=File('wiring4_honda_pinouts','w-h2','Honda ECM pinouts from competition handbook wiring diagrams 2021-2026 (wiring pass 2026-11)','Honda',['CRF450R'],list(range(2021,2027)))
MODELS={'CRF250R_RX':['CRF250R','CRF250RX'],'CRF250R_RX_RWE':['CRF250R','CRF250RX'],'CRF450R_RX_RWE':['CRF450R','CRF450RX'],'CRF450R_RX_RWE_R-S':['CRF450R','CRF450RX'],'CRF450X':['CRF450X']}
MEAN=[(r'^IGP$','power in'),(r'^PG ?\d?$|^PG$','power ground'),(r'^LG$','logic ground'),(r'^SG$','sensor ground'),(r'^VCC$','5 V sensor supply'),(r'^TH$','throttle position signal'),(r'^PB$','intake pressure (MAP) signal'),(r'^TA$','intake air temperature signal'),(r'^TW$','coolant temperature signal'),(r'^PCP$|^PCM$|^PCS$','crank position sensor'),(r'INJ','fuel injector'),(r'^IG$','ignition coil'),(r'^FLP$','fuel pump'),(r'^FLR$','fuel pump relay'),(r'^K-LINE$','diagnostic line'),(r'^SCS$','service check'),(r'^WARN$','warning indicator'),(r'^GP$','gear position'),(r'^BA$','bank angle (tip-over) sensor'),(r'CAN','CAN data line'),(r'CL SW','clutch switch'),(r'ST.?SW|START SW','starter switch'),(r'ST.?RLY|STARTER RLY|RELAY START','starter relay'),(r'RELAY MAIN','main relay'),(r'STOP','engine stop switch'),(r'MODE IND','mode indicator light'),(r'MODE SW','mode select switch'),(r'HSTC IND','HSTC indicator light'),(r'HSTC SW','HSTC switch')]
COL={'Bl':'black','Y':'yellow','Bu':'blue','G':'green','R':'red','W':'white','Br':'brown','O':'orange','Lb':'light blue','Lg':'light green','P':'pink','Gr':'gray'}
def colour(c): return '/'.join(COL[x] for x in c.split('/'))
def mean(s):
    for pat,m in MEAN:
        if re.search(pat,s): return m
    return None
for name,v in sorted(D.items()):
    y=int(name[:4]);key=name[5:]
    if key not in MODELS or (y==2025 and key.startswith('CRF450R_')): continue   # 2025 CRF450R/RX is hand-read in wiring2.py
    models=MODELS[key];pins=v['pins']
    if len(pins)<20: continue
    s=F.src('manufacturer',f"Honda {y} {key.replace('_','/')} competition handbook, wiring diagram (PDF page {v['page']})",'https://powersports.honda.com/downloads/owners-manuals',str(y-1))
    parts=[]
    for k in sorted(pins,key=lambda x:int(x[2:])):
        sig,c=pins[k];m=mean(sig)
        parts.append(f"{k} {sig}"+(f" ({m})" if m and m.lower()!=sig.lower() else '')+f", {colour(c)}")
    F.R('ecu_electronics','ECM connector pinout',models,[y],f"ECM pinout on the {y} {' and '.join(models)}, as pin, Honda's signal label and wire colour: "+'; '.join(parts)+". Wire colours are base/stripe.",
        {k:f"{a} {b}" for k,(a,b) in pins.items()},'OEM',s,'medium','Read automatically from the labels on the wiring diagram; check the diagram on the bike before cutting, splicing or back-probing.')
    sens=[]
    def w(pat):
        return [colour(c) for k,(sg,c) in sorted(pins.items(),key=lambda x:int(x[0][2:])) if re.search(pat,sg)]
    for label,pat in (('5 V sensor supply',r'^VCC$'),('sensor ground',r'^SG$'),('throttle position signal',r'^TH$'),('intake pressure signal',r'^PB$'),('intake air temperature signal',r'^TA$'),('coolant temperature signal',r'^TW$'),('crank position sensor',r'^PC[PMS]$'),('fuel injector (ECM side)',r'INJ'),('ignition coil (ECM side)',r'^IG$'),('gear position',r'^GP$'),('engine stop switch',r'STOP'),('starter switch',r'ST.?SW|START SW'),('diagnostic line',r'^K-LINE$')):
        c=w(pat)
        if c: sens.append(f"{label} {' and '.join(dict.fromkeys(c))}")
    if len(sens)>=6:
        F.R('ecu_electronics','Sensor and switch wire colours at the ECM',models,[y],f"Wire colours at the ECM on the {y} {' and '.join(models)}: "+'; '.join(sens)+". The three-wire sensors share the 5 V supply and the sensor ground. Honda's colour letters: Bl black, Y yellow, Bu blue, G green, R red, W white, Br brown, O orange, Lb light blue, Lg light green, P pink, Gr gray.",
            {},'OEM',s,'medium','Derived from the ECM pin labels on the wiring diagram.')
F.write()
