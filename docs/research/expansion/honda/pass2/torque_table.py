"""Parse Honda competition-handbook ENGINE & FRAME TORQUE VALUES tables from pdftotext -layout text.
Returns rows: dict(name, tag, qty, thread, value, remarks, pdf_page)."""
import re
TAG=r'(?:CRF\d{3}R[A-Z]*(?:\s?HRC-WE)?(?:/(?:RX|RWE|R|HRC-WE|CRF\d{3}R[A-Z]*))*/?|RWE|HRC-WE)'
ROW=re.compile(r'^(?P<left>.*?)\s+(?P<qty>\d{1,2})\s+(?P<thr>BC\d+(?:\.\d+)?|\d+(?:\.\d+)?|–|-)\s+(?P<tq>\d+(?:\.\d+)?|–|-)(?:\s*\(\s*[\d.]+\s*,\s*[\d.]+\s*\))?(?P<rem>.*)$')
def segs(line):
    return [(m.start(),m.group().strip()) for m in re.finditer(r'\S(?:.*?\S)?(?=\s{3,}|\s*$)',line)]
def parse(pages,start_pdf_page=None):
    s=next(i for i,x in enumerate(pages) if 'ENGINE & FRAME TORQUE VALUES' in x)
    e=s
    while 'LUBRICATION' not in pages[e]: e+=1
    rows=[];
    for pi in range(s,e):
        lines=pages[pi].splitlines();enabled=pi>s;remcol=90;prev=None;group=None
        for line in lines:
            if 'ENGINE & FRAME TORQUE VALUES' in line: enabled=True;continue
            if not enabled: continue
            if 'REMARKS' in line: remcol=line.index('REMARKS');prev=None;group=None;continue
            if re.search(r"Q'TY|DIA\. \(mm\)|N·m \(kgf",line): continue
            if re.fullmatch(r'\s*\d-\d+\s*',line) or not line.strip(): continue
            m=ROW.match(line)
            if m and m.group('left').strip()!='' or (m and re.match(r'\s{20,}'+TAG,line)):
                left=m.group('left').rstrip();rem=m.group('rem').strip()
                parts=[(st,t) for st,t in segs(left)]
                name='';tag=None
                for st,t in parts:
                    if re.fullmatch(TAG,t): tag=t
                    else: name=(name+' '+t).strip()
                inl=re.search(r'\s*\(('+TAG+r')\)\s*$',name)
                if inl: tag=inl.group(1);name=name[:inl.start()].strip()
                r={'name':name,'tag':tag,'qty':int(m.group('qty')),'thread':m.group('thr'),'value':None if m.group('tq') in '–-' else float(m.group('tq')),
                   'remarks':[rem] if rem else [],'pdf_page':pi+1,'line':line.rstrip()}
                if tag and group and (name=='' or name[0].islower()):
                    if name:
                        group['base']=group['base']+' '+name
                        for g in group['members']: g['name']=group['base']
                    r['name']=group['base'];group['members'].append(r)
                elif tag and parts and not re.fullmatch(TAG,parts[0][1]) and not inl:
                    group={'base':name,'members':[r]}
                else:
                    group=None
                rows.append(r);prev=r;continue
            # continuation line
            if re.fullmatch(r'\s*(Maintenance|MAINTENANCE|Frame/ ?Body Panels|FRAME/ ?BODY PANELS|Setting Information|SETTING INFORMATION|Engine|ENGINE|Frame|FRAME)\s*',line): prev=None;group=None;continue
            for st,t in segs(line):
                if prev is None: break
                if st>=remcol-12:
                    if not re.search(r'TORQUE|REMARKS',t): prev['remarks'].append(t)
                elif re.fullmatch(r'\(?'+TAG+r'\)?',t):
                    tg=t.strip('()')
                    if prev['tag'] and prev['tag'].endswith('/'): prev['tag']+=tg
                    elif t.startswith('('): prev['tag']=tg
                    else: prev['tag']=(prev['tag'] or '')+tg
                elif st<40:
                    if group and prev in group['members'] and prev['tag']:
                        group['base']+=' '+t
                        for g in group['members']: g['name']=group['base']
                    else:
                        inl=re.search(r'\s*\(('+TAG+r')\)\s*$',t)
                        if inl: prev['tag']=inl.group(1);t=t[:inl.start()].strip()
                        if t: prev['name']+=' '+t
    for r in rows:
        r['remarks']=' '.join(r['remarks']).replace('','').strip()
        r['remarks']=re.sub(r'\s+',' ',r['remarks'])
    return rows,list(range(s+1,e+1))

def applies(tag,model):
    """model e.g. CRF250R / CRF250RX. Returns True/False."""
    if not tag: return True
    t=tag.replace(' ','')
    fam=model[:6]  # CRF250 / CRF450
    toks=[]
    for k in t.split('/'):
        if not k: continue
        if k.startswith('CRF'): toks.append(k)
        else: toks.append(fam+k if not k.startswith('R') or k in('R','RX','RWE') else fam+k)
    toks=[x.replace('CRF450RHRC-WE','CRF450R HRC-WE') for x in toks]
    return model in toks
