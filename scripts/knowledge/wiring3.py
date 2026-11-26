"""Yamaha electrical data for every owner's service manual in the index: wire colour code and component list from the
wiring diagram legend, the labelled test values from the electrical chapter, and the fault-code table. Built from
docs/research/electrical/yamaha-electrical.json, which yamaha_electrical_extract.py read from each manual's own text.
Automated reading, so medium confidence; the hand-read 2024 YZ250F set (wiring1.py) stays as the checked reference.
usage: python3 scripts/knowledge/wiring3.py"""
import sys,os,json,re
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File,root
D=json.load(open(os.path.join(root,'docs/research/electrical/yamaha-electrical.json')))
F=File('wiring3_yamaha','w-y3','Yamaha electrical data from owner\'s service manuals, all indexed model-years (wiring pass 2026-11)','Yamaha',['YZ250F'],list(range(2010,2028)))
SKIP_LABEL=re.compile(r'^(System voltage|Fuel system voltage)$')
def clean(lab,v):
    v=re.sub(r'\s+',' ',re.sub(r'\((?![^)]*\))[^)]*$','',v)).strip()
    v=re.sub(r'\s*\([^)]*\)','',v).strip()
    v=re.sub(r'\s+',' ',re.sub(r'[^\x00-\x7f–]',' ',v)).strip()
    if not re.search(r'\d',v) or v.startswith(('•','-')) or not re.match(r'^[\d(]',v): return None
    if 'resistance' in lab.lower():
        m=re.match(r'^([\d.,–-]+)\s*(k)?\s*(at [\d. CF–-]+)?',v)
        if not m: return None
        v=m.group(1)+(' kilohms' if m.group(2) else ' ohms')+((' '+m.group(3).replace(' C',' C').strip()) if m.group(3) else '')
    v=re.sub(r'(\d) C\b',r'\1 C',v)
    return v
n=0
for pub,o in sorted(D.items(),key=lambda x:(x[1]['year'],x[1]['model'])):
    model=o['model'].split(' /')[0].strip();y=o['year']
    if pub=='BMF-2819U-10': continue   # 2024 YZ250F, hand-read in wiring1.py
    s=F.src('manufacturer',f"Yamaha {y} {model} owner's service manual ({pub})",f'https://library.ymcapps.net/library/om/contents/pdf/10/{pub}_02.pdf',str(y-1))
    made=False
    comps=[c for c in (o.get('components') or []) if 2<len(c)<60 and not re.search(r'\d{3,}|WIRING|COLOR',c)]
    cols=o.get('colors') or {}
    if len(comps)>=5 and len(cols)>=5:
        F.R('ecu_electronics','Wiring diagram: components and wire colour code',[model],[y],
          f"The {y} {model} wiring diagram shows these parts: "+', '.join(comps)+". Yamaha's wire colour letters: "+', '.join(f"{k} {v.lower()}" for k,v in cols.items() if '/' not in k)+". Two letters with a slash mean a base colour with a stripe (B/W is black with a white stripe).",
          {'components':comps,'colours':cols},'OEM',s,'medium','Read automatically from the legend of the wiring diagram.');made=True
    vals=[]
    for lab,vs in o['values'].items():
        if SKIP_LABEL.match(lab): continue
        cv=[c for c in (clean(lab,v) for v in vs) if c]
        if 'temperature sensor' in lab.lower() and len(cv)==2 and not all(' at ' in c for c in cv):
            cv=[re.sub(r' at .*','',cv[0])+' at the lower test temperature',re.sub(r' at .*','',cv[1])+' at the higher one']
        elif 'temperature sensor' in lab.lower() and not all(' at ' in c for c in cv): cv=[]
        if cv: vals.append((lab,cv))
    if len(vals)>=3:
        F.R('ecu_electronics','Electrical test values',[model],[y],
          f"Electrical test values Yamaha prints for the {y} {model}: "+'; '.join(f"{lab[0].lower()+lab[1:]} {' and '.join(cv)}" for lab,cv in vals)+". Measure with the coupler unplugged unless the manual says otherwise, probing from the back of the coupler.",
          {lab:cv for lab,cv in vals},'OEM',s,'medium','Read automatically from the labelled specification boxes in the electrical chapter; the probe wire colours are not included.');made=True
    codes={int(k):v for k,v in (o.get('fault_codes') or {}).items() if v and len(v)>8}
    if len(codes)>=5:
        F.R('ecu_electronics','Fault codes',[model],[y],
          f"Fault codes on the {y} {model}: "+'; '.join(f"{k} {v.rstrip('.')}" for k,v in sorted(codes.items()))+'.',
          {'codes':sorted(codes)},'OEM',s,'medium','Read automatically from the self-diagnostic function table.');made=True
    n+=made
F.write();print(n,'manuals with at least one record')
