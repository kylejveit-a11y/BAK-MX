"""Yamaha Owner's Service Manual, chapter 2 specification tables (GENERAL / ENGINE / CHASSIS SPECIFICATIONS).

Reads the label column (x < 315 pt) and the value column of every line, builds the path
"section / sub-section / label", drops the imperial conversion in brackets and splits a plain metric value from its unit.
Symbol-font glyphs (°, Ω, ×, ±) are mapped back from their Symbol code points; a Symbol glyph that is not in that
map drops its row. Electrical specifications and
tightening torques are not read here. Row conventions follow the rows loaded on 2026-10-09 (see TEXT_LAYER_REVIEW_2026-10-09.md).

usage: yamaha_specs.py manual.pdf [--model YZ250X]   (the model picks the column in a two-model manual)"""
import pdfplumber,re,sys
UNITS={'mm','L','cm³','kPa','kg','pcs','A','r/min','click','turn','N','V','W','kW','mm²','g','km/h','Ah','rpm','min','°','°C','Ω','N/mm'}
# Symbol-font glyphs: the text layer carries the Symbol code point (private-use in older manuals, the ASCII slot in 2025+ manuals)
SYMBOL={'\uf0b0':'°','\uf057':'Ω','\uf0b4':'×','\uf02d':'-','\uf0b1':'±','\uf020':' ','W':'Ω','°':'°','×':'×','´':'×','-':'-','±':'±',' ':' '}
PUA={'\uf0b0','\uf057','\uf0b4','\uf02d','\uf0b1','\uf020'}
IMPERIAL=re.compile(r'\s*\((?=[^()]*(?:\b(?:in|US|Imp\.?|psi|lb|lbf|ft|oz|mph|kgf|hp|cu\.?)\b|°F))[^()]*\)')
def norm_num(v):
    if re.fullmatch(r'-?\d+\.\d+',v):
        v=v.rstrip('0').rstrip('.')
    return v
def split_value(v):
    v=IMPERIAL.sub('',v).strip()
    m=re.fullmatch(r'(-?\d+(?:\.\d+)?(?:–-?\d+(?:\.\d+)?)?|\d+-\d+/\d+)\s+(\S+)',v)
    if m and m.group(2) in UNITS:
        n=m.group(1)
        return (norm_num(n) if '–' not in n else n), m.group(2)
    return v,None
def parse(path,model=None):
    pdf=pdfplumber.open(path); rows=[]; problems=[]; seen=False
    section=sub=plate=unit_for=None; prev=None
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        head=' '.join(w['text'] for w in ws if w['top']<30)
        if not re.search(r'(GENERAL|ENGINE|CHASSIS) SPECIFICATIONS',head):
            if seen: break
            continue
        seen=True
        printed=next((w['text'] for w in ws if re.fullmatch(r'\d-\d+',w['text']) and w['top']>700),'?')
        for line in pg.extract_text_lines():
            if line['top']<50 or line['top']>760: continue
            chars=[]; seen=set()
            lost=False
            for c in line['chars']:
                k=(c['text'],round(c['x0'],1),round(c['top'],1))
                if k in seen: continue                    # a ligature (fi) is reported twice at the same position
                seen.add(k)
                if 'Symbol' in c['fontname'] or c['text'] in ('\uf0b0','\uf057','\uf0b4','\uf02d','\uf0b1','\uf020'):
                    if c['text'] in SYMBOL: c=dict(c,text=SYMBOL[c['text']])
                    else: lost=True
                chars.append(c)
            left=pdfplumber.utils.extract_text([c for c in chars if c['x0']<315],x_tolerance=1).strip()
            right=pdfplumber.utils.extract_text([c for c in chars if c['x0']>=315],x_tolerance=1).strip()
            if re.match(r'^(EAM|EAS)\d',left) or 'SPECIFICATIONS' in left or re.fullmatch(r'\d-\d+',left): continue
            x=line['x0']
            if not left:
                if right and prev: prev['values'].append(right); prev['lost']|=lost   # value continued on the next line
                continue
            if not right or (x>=90 and left.startswith('(') and prev):
                if x>=90 or (x>=80 and re.match(r'^(\(|clearance|limit|wheel\))',left)):
                    if prev:
                        # wrapped label; a line-break hyphen inside a bracket "(in-" / "take)" is dropped, other hyphens are real
                        prev['label']=(prev['label'][:-1]+left) if re.search(r'\([a-z]+-$',prev['label']) and left[:1].islower() else prev['label']+' '+left
                        if right: prev['values'].append(right); prev['lost']|=lost
                    continue
                if x<70: section=left; sub=None; plate=None; unit_for=None
                else: sub=left; unit_for=None
                prev=None; continue
            if x<80 or (sub=='Coolant quantity' and left.startswith('Radiator cap')): sub=None   # a label at the sub-section indent ends the sub-section;
            # the manual indents the cap pressure under "Coolant quantity" although it is not a quantity (rows on file keep it under Cooling system)
            label=left
            if label=='Limit' and prev: label=prev['label']+' limit'       # 2020 manuals print the limit as its own row under the nominal value
            if section=='Clutch' and re.match(r'^(Friction|Clutch) plate( \d)? thickness$',label): plate=label.replace(' thickness','')
            if section=='Clutch' and label in ('Wear limit','Plate quantity','Warpage limit') and plate: label=plate+' '+label.lower()
            if label.startswith('Unit for'): unit_for=right
            prev={'pdf':pi+1,'printed':printed,'values':[right],'lost':lost,'unit_for':unit_for,'label':label,'section':section,'sub':sub}
            rows.append(prev)
    out=[]
    TAG=re.compile(r'\s*\((YZ\d+\w*)\)\s*$')
    for r in rows:
        r['path']=' / '.join(p for p in (r['section'],r['sub'],r['label']) if p)
        if r['lost']: problems.append(('lost symbol',r['path'])); continue
        # a manual shared by two models tags each model's value "(YZ250X)"; keep the requested model's lines, drop the row otherwise
        tagged=[(TAG.sub('',t),TAG.search(t).group(1)) for t in r['values'] if TAG.search(t)]
        if tagged:
            if not model: problems.append(('two-model value',r['path'],r['values'])); continue
            keep=[t for t,m in tagged if m==model]+[t for t in r['values'] if not TAG.search(t)]
            if not keep: continue                                          # the row belongs to the other model only
            r['values']=keep
        r['value']=(', ' if r['label']=='Model' else ' ').join(r['values'])   # model codes are listed one per line
        v,u=split_value(r['value'])
        if r['label'].startswith('Adjustment value from the start position') and r['unit_for']:
            m=re.fullmatch(r'(\S+)\s*\((Soft|STD|Hard)\)',v) or re.fullmatch(r'(\S+)',v)
            if m and len(m.groups())==2: v=m.group(1); r['path']=r['path']+' ('+m.group(2)+')'
            u=r['unit_for'].lower()
        out.append((r['pdf'],r['printed'],r['path'],v,u))
    return out,problems

def sag(path):
    """The rider-sag figure from the rear suspension setting section ("CHOOSING SET LENGTH ... Standard figure 90–100 mm"),
    read from the back of the manual. Returns one row or None."""
    pdf=pdfplumber.open(path); n=len(pdf.pages)
    for i in range(n-1,max(n-80,0),-1):
        pg=pdf.pages[i]; ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        if not any(w['text']=='figure' for w in ws): continue
        rows={}
        for w in ws:
            if 40<w['top']<760: rows.setdefault((w['x0']>=300,round(w['top']/3)),[]).append(w)
        lines=[' '.join(w['text'] for w in sorted(rows[k],key=lambda w:w['x0'])) for k in sorted(rows)]
        if not any('sunken length' in l for l in lines): continue        # the CHOOSING SET LENGTH procedure
        printed=next((w['text'] for w in ws if re.fullmatch(r'\d+-\d+',w['text']) and w['top']>700),'?')
        for j,l in enumerate(lines):
            if l.startswith('Standard figure'):
                m=re.search(r'(\d+–\d+) mm',' '.join(lines[j:j+2]))
                if m: return (i+1,printed,'Rear suspension setting / Choosing set length / Standard figure (sunken length, rider seated)',m.group(1),'mm')
    return None

if __name__=='__main__':
    model=sys.argv[sys.argv.index('--model')+1] if '--model' in sys.argv else None
    o,p=parse(sys.argv[1],model); print('PROBLEMS',p,len(o))
    for x in o: print(x)
