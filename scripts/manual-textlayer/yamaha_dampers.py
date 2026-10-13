"""Cross-check of the damper click / turn settings in a Yamaha Owner's Service Manual.

The specification table (chapter 2) prints Soft / STD / Hard for each damper; the adjustment procedures in chapter 3
print the same values as Minimum (soft) / Standard / Maximum (hard) under headings such as
"ADJUSTING THE FRONT FORK REBOUND DAMPING FORCE". The pages are set in two columns, so each page is read column by column.
A manual shared by two models tags the Standard value "(YZ250X)".

check(pdf_path, spec_rows, model=None) -> list of (path, spec value, adjustment value) mismatches, plus the groups found.
usage: yamaha_dampers.py manual.pdf [--model YZ250X]   prints the blocks found."""
import pdfplumber,re,sys
SECTION=re.compile(r'^ADJUSTING THE (FRONT FORK|REAR SHOCK ABSORBER)')
SUB=re.compile(r'^(Rebound damping|Compression damping|Fast compression damping|Slow compression damping|High compression damping|Low compression damping)$')
MAP={'FRONT FORK':'Front suspension','REAR SHOCK ABSORBER':'Rear suspension'}
NAMES={'High compression damping':'Fast compression damping','Low compression damping':'Slow compression damping'}
VAL=re.compile(r'^(\d+(?:[-+]\d+/\d+)?|\d+/\d+)\s+(click|turn)\(s\)')
def column_lines(pdf):
    """Yield (page, text) lines in reading order: left column then right column of every page."""
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        for col in (lambda w:w['x0']<300, lambda w:w['x0']>=300):
            rows={}
            for w in ws:
                if col(w) and 40<w['top']<760: rows.setdefault(round(w['top']/3),[]).append(w)
            for k in sorted(rows): yield pi+1,' '.join(w['text'] for w in sorted(rows[k],key=lambda w:w['x0']))
def blocks(path):
    pdf=pdfplumber.open(path); out=[]; cur=None; state=None; section=None
    for page,text in column_lines(pdf):
        t=text.strip()
        m=SECTION.match(t)
        if m: section=MAP[m.group(1)]; cur=None; state=None; continue
        m=SUB.match(t)
        if m and section:
            # the sub-heading is printed twice (section heading, then the box title); a block with values is kept as is
            if cur and cur['group']==section+' / '+NAMES.get(m.group(1),m.group(1)) and cur['Soft'] is None: continue
            cur={'group':section+' / '+NAMES.get(m.group(1),m.group(1)),'page':page,'Soft':None,'STD':{},'Hard':None}; out.append(cur); state=None; continue
        if cur is None: continue
        if t.startswith('Minimum'): state='Soft'; continue
        if t.startswith('Standard'): state='STD'; continue
        if t.startswith('Maximum'): state='Hard'; continue
        if state:
            v=VAL.match(t)
            if v:
                val=v.group(1)
                if state=='STD': cur['STD']['*']=val; last='*'
                else: cur[state]=val
                continue
            tag=re.fullmatch(r'\((YZ\d+\w*)\)',t)
            if tag and state=='STD' and '*' in cur['STD']:
                cur['STD'][tag.group(1)]=cur['STD'].pop('*'); continue
            if t.startswith('*With') or t.startswith('TIP') or t.startswith('NOTICE'): state=None
    return out
def check(path,spec_rows,model=None):
    found=blocks(path); mism=[]; seen={}
    for b in found:
        if b['group'] in seen: continue
        seen[b['group']]=b
    for pdfp,printed,p,v,u in spec_rows:
        m=re.match(r'^(.*damping) / Adjustment value from the start position \((Soft|STD|Hard)\)$',p)
        if not m: continue
        b=seen.get(m.group(1))
        if not b: mism.append((p,v,'no adjustment block')); continue
        if m.group(2)=='STD':
            adj=b['STD'].get(model) if model and model in b['STD'] else b['STD'].get('*')
        else: adj=b[m.group(2)]
        if adj!=v: mism.append((p,v,adj))
    return mism,found
if __name__=='__main__':
    for b in blocks(sys.argv[1]): print(b)
