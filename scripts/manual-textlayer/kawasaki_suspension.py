"""Kawasaki Owner's Manual front and rear suspension adjustment sections: the boxed standard settings
("Standard Rebound Damping Adjuster Setting / 12 clicks *", "Standard High Speed Compression Damping Adjuster Setting /
1-1/8 turns *", "Standard Fork Oil Amount ..."), read by OCR of the page images, each page column by column.

Each standard click / turn value is checked against the usable range the same page prints
("*: Number of turns counterclockwise usable range 16 clicks or less"): a value outside it is dropped.
usage: kawasaki_suspension.py page.jpg [page.jpg ...]"""
import os,re,subprocess,sys,tempfile
from PIL import Image
def page(path):
    """Page image as greyscale at the viewer's base width of 900 px (some manuals are served at 1247 px)."""
    im=Image.open(path).convert('L')
    return im if im.width==900 else im.resize((900,round(im.height*900/im.width)),Image.LANCZOS)
import numpy as np
def runs(mask):
    """Longest run of True along axis 1 for every row of a 2-D boolean array (vectorised)."""
    m=mask.astype(np.int32); out=np.zeros(m.shape[0],dtype=np.int32); cur=np.zeros(m.shape[0],dtype=np.int32)
    for j in range(m.shape[1]):
        cur=(cur+1)*m[:,j]; out=np.maximum(out,cur)
    return out
def erase_rules(im):
    """The boxed values are lost to OCR unless the box rules are erased first."""
    a=np.array(im); dark=a<160; b=a.copy()
    for y in np.nonzero(runs(dark)>=150)[0]: b[max(0,y-1):y+2,:]=255        # a horizontal rule, not a line of text
    for x in np.nonzero(runs(dark.T)>=40)[0]: b[:,max(0,x-1):x+2]=255        # a vertical rule
    return Image.fromarray(b)
def has_box(im):
    """A page column with a boxed standard setting has at least two long horizontal rules."""
    a=np.array(im); return (runs(a<160)>=150).sum()>=2
def ocr(im,psm=6):
    im=erase_rules(im)
    im=im.resize((im.width*3,im.height*3),Image.LANCZOS)
    with tempfile.NamedTemporaryFile(suffix='.png',delete=False) as f: im.save(f.name); n=f.name
    r=subprocess.run(['tesseract',n,'-','--psm',str(psm)],capture_output=True,text=True); os.remove(n)
    return r.stdout
def columns(path):
    im=page(path)
    cols=[im.crop((30,40,465,625)),im.crop((440,40,890,625))]
    return [ocr(c) if has_box(c) else '' for c in cols]
VAL=re.compile(r'(\d+(?:[-+]\d+/\d+)?|\d+/\d+)\s*(clicks?|turns?)(?:\s+out)?\s*[*"”]?',re.I)
RANGE=re.compile(r'(\d+(?:[-+]\d+/\d+)?)\s*(clicks?|turns?)\s+or\s+(?:less|more)',re.I)   # "16 clicks or less" (2022-on) / "20 clicks or more" (2021)
def frac(v):
    m=re.match(r'^(\d+)(?:[-+](\d+)/(\d+))?$',v)
    if m: return int(m.group(1))+(int(m.group(2))/int(m.group(3)) if m.group(2) else 0)
    m=re.match(r'^(\d+)/(\d+)$',v)
    return int(m.group(1))/int(m.group(2)) if m else None
NAMES=['Rebound damping','Compression damping','High speed compression damping','Low speed compression damping']
CODE=re.compile(r'^K[XC]\s?(\d{3})\s?([A-Z])(?![A-Za-z0-9])[_\W]*(.*)$')
def parse(pages,side,code=None):
    """pages: [(page number, image path)], side: 'Front suspension' or 'Rear suspension', code: the model code (KX252D) that
    picks the row when one manual prints a setting per model ("KX252C 11 clicks *" / "KX252D 13 clicks *")."""
    out=[]; problems=[]
    text=[]
    for pi,path in pages:
        cols=columns(path)
        for col in cols: text.append((pi,col,'\n'.join(cols)))
    for pi,col,page in text:
        lines=[re.sub(r'^[^A-Za-z0-9*]+','',l.strip()) for l in col.split('\n')]
        for i,l in enumerate(lines):
            m=re.match(r'^Standard\s+(.*?)\s*(?:Adjuste\w*\s+)?Settings?\s*$',l)
            two=re.match(r'^Standard\s+(.*)$',l) and i+1<len(lines) and re.match(r'^(?:Adjuste\w*\s+)?Settings?\s*$',lines[i+1])
            if not (m or two): continue
            j=i+1
            if m: name=m.group(1).strip()
            else: name=re.sub(r'\s*Adjuste\w*\W*$','',re.match(r'^Standard\s+(.*)$',l).group(1)).strip(); j+=1
            name=re.sub(r'Dampin\w*','Damping',name)
            if not re.search(r'Damping',name): continue
            name=name[0]+name[1:].lower()                          # "High speed compression damping"
            import difflib
            snap=difflib.get_close_matches(name,NAMES,n=1,cutoff=0.8)   # an OCR slip in the heading ("Re sound damping")
            if not snap: problems.append((pi,'unknown damper name',name)); continue
            name=snap[0]
            while j<len(lines) and not lines[j]: j+=1
            coded=[]; k=j
            while k<len(lines) and (CODE.match(lines[k]) or not lines[k]):
                m2=CODE.match(lines[k])
                if m2: coded.append(('KX'+m2.group(1)+m2.group(2),m2.group(3)))
                k+=1
            if coded:                                              # one row per model code
                mine=[t for c,t in coded if c==code]
                if len(mine)!=1: problems.append((pi,'model row not found',name,code,coded)); continue
                v=VAL.search(mine[0])
            else: v=VAL.search(lines[j]) if j<len(lines) else None
            if not v: problems.append((pi,'no value after',l,lines[j] if j<len(lines) else '')); continue
            val,unit=v.group(1),v.group(2).lower().rstrip('s')
            rng=[r for r in RANGE.findall(page)]
            ok=[r for r in rng if r[1].lower().rstrip('s')==unit and frac(val) is not None and frac(r[0]) is not None and frac(val)<=frac(r[0])]
            if not ok: problems.append((pi,'value outside the usable range printed',name,val,unit,rng)); continue
            out.append((pi,f'{side} / {name} / Standard setting',val,unit,f'counterclockwise from the fully seated position; usable range {ok[0][0]} {unit}s or less'))
    return out,problems
if __name__=='__main__':
    side=sys.argv[1]
    pages=[(int(re.search(r'p(\d+)',p).group(1)),p) for p in sys.argv[2:]]
    o,pr=parse(pages,side); print('PROBLEMS',pr,len(o))
    for r in o: print(r)
