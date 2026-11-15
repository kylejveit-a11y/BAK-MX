"""KTM-group owner's manuals before 2020: the TECHNICAL DATA chapter, read from the pdftotext -layout text of each page.
Same output as tech_data_2020_2025.facts: (row, path, value) with row = {pdf, printed}; paths use the 2020+ naming
("Fork / Compression damping / Standard", "Engine tightening torques / Screw, ... (M5)").
A value is kept only when every unit it prints agrees with its own conversion in brackets; anything the reader
does not understand (step-wise torques, tables, wrapped values it cannot rebuild) is left out, never guessed.
usage: tech_data_pre2020.py <pdf> <model>   (prints the facts for that US model)"""
import re,subprocess,sys,collections
import validity as V

ORD={'1st':'First','2nd':'Second','3rd':'Third','4th':'Fourth','5th':'Fifth','6th':'Sixth'}
SKIP_SECS=('Tires','Electrical system','Carburetor tuning')
HEAD=re.compile(r'^\s*(\d{1,2})\s+TECHNICAL DATA\b\s*(\d+)?\s*$')
SEC=re.compile(r'^(\d{1,2}\.\d{1,2})\s{2,}(\S.*)$')
GRP=re.compile(r'^(\d{1,2}\.\d{1,2}\.\d{1,2})\s{2,}(\S.*)$')

def pages(path):
    txt=subprocess.run(['pdftotext','-layout',path,'-'],capture_output=True,text=True,check=True).stdout
    return txt.split('\f')

def page_offset(pgs):
    """Printed page = PDF page - offset; read from the pages whose header carries a number."""
    c=collections.Counter()
    for i,p in enumerate(pgs):
        ls=[l for l in p.splitlines() if l.strip()]
        for l in ls[:3]:
            m=HEAD.match(l)
            if m and m.group(2): c[(i+1)-int(m.group(2))]+=1
        if ls and re.fullmatch(r'\s*\d{1,3}\s*',ls[-1]): c[(i+1)-int(ls[-1])]+=1     # page number printed alone at the foot
    return c.most_common(1)[0][0] if c else None

def parse(path):
    pgs=pages(path); off=page_offset(pgs); rows=[]; sec=None; grp=None; parent=None; last=None; seen=False
    for i,p in enumerate(pgs):
        lines=p.splitlines()
        first=next((l for l in lines if l.strip()),'')
        if not HEAD.match(first):
            if seen: break
            continue
        seen=True; pdf=i+1; printed=str(pdf-off) if off is not None else '?'
        for l in lines[lines.index(first)+1:]:
            if not l.strip() or re.fullmatch(r'\s*\d{1,3}\s*',l): continue
            l=re.sub(r'\bUSA\b','US',l)
            s=re.sub(r'\(\s*p\.\s*(\d+)\s*\)',r'(p. \1)',l.rstrip()); ind=len(s)-len(s.lstrip()); t=s.strip()
            if HEAD.match(s): continue
            m=GRP.match(t) if ind<3 else None
            if m: grp=m.group(2).strip(); parent=None; last=None; continue
            m=SEC.match(t) if ind<3 else None
            if m: sec=m.group(2).strip(); grp=None; parent=None; last=None; continue
            if not sec or sec.startswith(SKIP_SECS): continue
            parts=re.split(r'\s{2,}',t)
            if ind>=25:                       # value column only: a wrapped value or remark of the row above
                if last: last['cont'].append(t)
                continue
            if len(parts)==1:
                if last and (t[:1].islower() or t.endswith(('approx.',))):   # wrapped label: "flap", "cartridge"
                    last['label']+=' '+t; continue
                parent=t; last=None; continue
            label=parts[0]; rest=parts[1:]
            if ind>=3 and parent: label=parent+' / '+label
            elif ind<3: parent=None
            r={'pdf':pdf,'printed':printed,'sec':sec,'grp':grp,'label':label,'parts':rest,'cont':[]}
            rows.append(r); last=r
    return rows

UNITS=[(r'([\d.,]+) Nm \(([\d.,]+) lbf ft\)',1/1.3558),(r'([\d.,]+) mm \(([\d.,]+) in\)',1/25.4),(r'([\d.,]+) kg \(([\d.,]+) lb\.?\)',2.20462),
       (r'([\d.,]+) bar \(([\d.,]+) psi\)',14.5038),(r'([\d.,]+) ml \(([\d.,]+) fl\. oz\.\)',1/29.5735),(r'([\d.,]+) l \(([\d.,]+) qt\.\)',1.05669),
       (r'([\d.,]+) N/mm \(([\d.,]+) lb/in\)',5.71015),(r'([\d.,]+) cm³ \(([\d.,]+) cu in\)',1/16.387),(r'([\d.,]+) l \(([\d.,]+) US gal\)',0.264172)]
def units_ok(v):
    for pat,k in UNITS:
        for a,b in re.findall(pat,v):
            try: x=float(a.replace(',',''));y=float(b.replace(',',''))
            except ValueError: return False
            if x and abs(x*k-y)/max(abs(y),1e-9)>0.06: return False
    return True

def note_of(label):
    notes=[m for m in V.PAR.findall(label) if V.applies(m,'125 SX') is not None]
    base=V.PAR.sub(lambda m:'' if V.applies(m.group(1),'125 SX') is not None else m.group(0),label).strip()
    return base,notes

def facts(rows,model):
    out=[];notes=set()
    for r in rows:
        sub=None
        if r['grp']:
            if r['grp'].startswith('Carburetor tuning'): continue          # altitude/temperature charts: read separately, never as base values
            gbase,gnotes=note_of(r['grp'])
            if V.applies(r['grp'],model) is False or any(V.applies(n,model) is False for n in gnotes): continue
            if V.applies(r['grp'],model) is None and not gnotes and re.search(r'\b\d{2,3}\b.*\b(SX|XC|EXC|XCF|SMR|TC|FC|TE|FE|TX|FX)\b',r['grp']):
                notes.add('GROUP? '+r['grp']); continue            # a model list it cannot read: fail closed
            if gbase and V.applies(gbase,'125 SX') is None and V.applies(gbase,model) is None:
                sub=re.sub(r'^(Carburetor|Fork|Shock absorber)\s*-\s*','',gbase).strip(); sub=sub[:1].upper()+sub[1:]
        if r['label'].endswith(',') or r['label']=='approx.' or r['label'].count('(')!=r['label'].count(')'): continue   # wrapped two-line labels
        base,ns=note_of(r['label'])
        if any(V.applies(n,model) is False for n in ns): continue
        if any(V.applies(n,model) is None for n in ns): notes.update(ns); continue
        parts=[x for x in r['parts'] if x not in ('–','-')]
        if not parts: continue
        sec=r['sec']; tor=sec.endswith('tightening torques')
        base=re.sub(r'\b(\d)(st|nd|rd|th) gear\b',lambda m:ORD[m.group(1)+m.group(2)]+' gear',base)
        if tor:
            if len(parts)<2 or r['cont']: continue      # step-wise or wrapped torques are left out
            thread,val=parts[0],parts[1]; rem=parts[2:]
            if not re.match(r'^[\d.]+ Nm',val): continue
            path=f'{sec} / {base} ({thread})'; v=val+''.join('; '+x for x in rem)
        else:
            val=parts[0]
            if r['cont'] and not re.search(r'\(p\. \d+\)',' '.join(r['cont'])):
                val=' '.join([val]+r['cont'])                         # a wrapped text value ("... digital igni- tion adjustment")
            val=re.sub(r'(\w)- (\w)',r'\1\2',val)
            rem=[re.sub(r'\s*\(p\. \d+\)','',x).strip() for x in parts[1:]+[c for c in r['cont'] if re.search(r'\(p\. \d+\)',c)]]
            path=f'{sec} / {sub} / {base}' if sub else f'{sec} / {base}'; v=val+''.join('; '+x for x in rem if x)
        v=re.sub(r'\s*\(p\. \d+\)','',re.sub(r'\s+',' ',v)).strip(' ;')
        if not v or '(p.' in path: continue
        if not units_ok(v): notes.add('UNITS? '+path); continue
        out.append(({'pdf':r['pdf'],'printed':r['printed']},path,v))
    return out,notes

if __name__=='__main__':
    rows=parse(sys.argv[1]); f,q=facts(rows,sys.argv[2])
    for r,p,v in f: print(r['pdf'],r['printed'],'|',p,'=',v)
    print('notes:',sorted(q),file=sys.stderr)
