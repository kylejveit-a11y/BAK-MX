"""Kawasaki Owner's Manual SPECIFICATIONS pages, read by OCR from the page images of Kawasaki's online manual viewer.

Each page is OCR'd at 3x (tesseract, TSV with word boxes). A line is label + value where the value starts at the value
column (x >= 383 px of the 900 px page). Section headings are the all-capitals lines (DIMENSIONS, ENGINE, ...); a label
ending in ":" with no value groups the indented per-model rows that follow ("KX252C 2 180 mm (85.83 in.)"), and the
model code picks the row for the requested model.

Every metric value with an imperial conversion in brackets is checked against that conversion (mm/in, kg/lb, L/US gal,
cm³/cu in, kPa/psi, N·m/ft·lb or in·lb); an OCR slip in either number fails the check and drops the row. Values without a
conversion (ratios, part numbers, text) are kept as read, and are the rows to look at by eye.

usage: kawasaki_specs.py --code KX252C page.jpg [page.jpg ...]"""
import os,re,subprocess,sys,tempfile
from PIL import Image
def page(path):
    """Page image as greyscale at the viewer's base width of 900 px (some manuals are served at 1247 px)."""
    im=Image.open(path).convert('L')
    return im if im.width==900 else im.resize((900,round(im.height*900/im.width)),Image.LANCZOS)
CONV={('mm','in'):25.4,('kg','lb'):0.45359,('L','US gal'):3.7854,('cm³','cu in'):16.387,('kPa','psi'):6.8948,('N·m','ft·lb'):1.3558,('N·m','in·lb'):0.11298,('mL','US oz'):29.574,('km/h','mph'):1.6093}
def tsv(path):
    im=page(path); im=im.resize((im.width*3,im.height*3),Image.LANCZOS)
    with tempfile.NamedTemporaryFile(suffix='.png',delete=False) as f: im.save(f.name); n=f.name
    r=subprocess.run(['tesseract',n,'-','--psm','6','tsv'],capture_output=True,text=True); os.remove(n)
    lines={}
    for row in r.stdout.split('\n')[1:]:
        c=row.split('\t')
        if len(c)<12 or not c[11].strip(): continue
        key=(int(c[2]),int(c[3]),int(c[4])); lines.setdefault(key,[]).append((int(c[6])/3,int(c[7])/3,c[11]))
    return [sorted(v) for k,v in sorted(lines.items())]
def fix(s):
    s=s.replace('Ib','lb').replace('cm?','cm³').replace('cm3','cm³').replace('cm®','cm³').replace('cm*','cm³').replace('N-m','N·m').replace('N·m','N·m').replace('ft-lb','ft·lb').replace('in-lb','in·lb')
    s=s.replace('—','-').replace('–','-')
    s=re.sub(r'cm³[®*]',r'cm³',s); s=re.sub(r'US 0[2z]\.\)','US oz.)',s); s=s.replace('US gt)','US qt)'); s=re.sub(r'\bFl \(Fuel','FI (Fuel',s)
    return s
def metric(v):
    """'2 180 mm (85.83 in.)' -> ('2180','mm','85.83','in') ; None when no bracketed conversion."""
    m=re.match(r'^([\d][\d ,.]*?)\s*(mm|kg|L|cm³|kPa|N·m|mL|km/h|°)\s*\(([\d.,]+)\s*(in|lb|US gal|cu in|psi|ft·lb|in·lb|US oz|mph)\.?\)\s*$',v)
    if not m: return None
    return m.group(1).replace(' ','').replace(',',''),m.group(2),m.group(3).replace(',',''),m.group(4)
def check(num,unit,imp,iunit):
    f=CONV.get((unit,iunit))
    if f is None: return False
    try: a=float(num)/f; b=float(imp)
    except ValueError: return False
    dec=len(imp.split('.')[1]) if '.' in imp else 0
    return abs(a-b)<=0.5*10**-dec+abs(b)*0.002
def parse(pages,code=None):
    rows=[]; problems=[]; section=None; groups=[]            # groups: [(indent, name)] nested by indent
    MODEL=re.compile(r'^K[XC]\d{3}[A-Z]:?$')
    for pi,path in pages:
        lines=tsv(path)
        base=min((l[0][0] for l in lines if l[0][1]>40 and l[0][0]<300),default=0)   # odd and even pages have different margins
        for words in lines:
            x0=words[0][0]-base; text=fix(' '.join(w[2] for w in words))
            if words[0][1]<40 or re.search(r'SPECIFICATIONS|subject to change',text): continue
            left=[w for w in words if w[0]<383]; right=[w for w in words if w[0]>=383]
            label=fix(' '.join(w[2] for w in left)).strip(); value=fix(' '.join(w[2] for w in right)).strip()
            if not label:
                if value and rows: rows[-1][3]+=' '+value          # value wrapped to the next line
                continue
            if label==label.upper() and re.search('[A-Z]{4}',label) and not right:
                section=label.title().replace("'S","'s"); groups=[]; continue
            if not right:
                if label.endswith(':'):
                    groups=[g for g in groups if g[0]<x0-4]
                    if MODEL.match(label): groups.append((x0,'@'+('KX'+label[2:-1])))     # a per-model block
                    else: groups.append((x0,label[:-1]))
                    continue
                if rows and x0>=80: rows[-1][2]+=' '+label; continue   # label wrapped
                problems.append(('line without value',pi,label)); continue
            if MODEL.match(label):
                if code and 'KX'+label[2:]!=code: continue
                if not groups: problems.append(('model row without group',pi,text)); continue
                rows.append([pi,section,' / '.join(g[1] for g in groups),value]); continue
            groups=[g for g in groups if g[0]<x0-4]                 # a row at a group's own indent ends that group
            if any(g[1].startswith('@') and g[1][1:]!=code for g in groups): continue     # the other model's block
            rows.append([pi,section,' / '.join([g[1] for g in groups if not g[1].startswith('@')]+[label.rstrip(':')]),value])
    out=[]
    for pi,section,label,value in rows:
        if not section: problems.append(('no section',pi,label)); continue
        mt=metric(value)
        if mt:
            num,unit,imp,iunit=mt
            if not check(num,unit,imp,iunit): problems.append(('conversion mismatch',pi,label,value)); continue
            out.append((pi,f'{section} / {label}',num,unit,True))
        else:
            r=re.match(r'^(\d+\.\d{3})\s*[:.,]?\s*\((\d+)/(\d+)\)$',value)
            if r:
                if abs(float(r.group(1))-int(r.group(2))/int(r.group(3)))>0.0006: problems.append(('ratio mismatch',pi,label,value)); continue
                value=f'{r.group(1)} ({r.group(2)}/{r.group(3)})'
            # a value with no conversion to check it against is kept only when it reads cleanly
            if re.search(r"[^A-Za-z0-9 .,/()\-:@°%+×'’&;®³]",value) or re.search(r'\s=|=\s|\s\*\s',value):
                problems.append(('unreadable value',pi,label,value)); continue
            if re.search(r'Caster',label) and not re.fullmatch(r'\d{2}\.\d°',value):
                problems.append(('caster not d.d°',pi,label,value)); continue
            out.append((pi,f'{section} / {label}',value,None,False))
    return out,problems
if __name__=='__main__':
    code=sys.argv[sys.argv.index('--code')+1] if '--code' in sys.argv else None
    pages=[(int(re.search(r'p(\d+)',p).group(1)),p) for p in sys.argv[1:] if p.endswith('.jpg')]
    o,pr=parse(pages,code); print('PROBLEMS',pr,len(o))
    for r in o: print(r)
