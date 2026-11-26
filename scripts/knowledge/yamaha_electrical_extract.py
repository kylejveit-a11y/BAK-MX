import re,json,sys
def extract(layout,raw):
    o={};rawb=raw;raw=re.sub(r'\n{2,}','\n',raw)
    pages=layout.split('\f')
    # wiring legend page
    for p in pages:
        if 'WIRING DIAGRAM' in p and 'COLOR CODE' in p and re.search(r'\n\s*1\.\s',p):
            comps=[];colors={}
            for l in p.splitlines():
                m=re.match(r'\s*(\d{1,2})\.\s+(.+?)(?:\s{3,}|$)',l)
                if m: comps.append([int(m.group(1)),m.group(2).strip()])
                elif comps and re.match(r'\s{4,}[A-Za-z(]',l) and not re.search(r'\s{3,}[A-Z][a-z]?(/[A-Z][a-z]?)?\s{3,}',l[:40]):
                    c=re.match(r'\s+([A-Za-z()][^ ]*(?: [A-Za-z()][^ ]*)*)',l)
                    if c and len(l)-len(l.lstrip())<8: comps[-1][1]+=' '+c.group(1)
                for a,b in re.findall(r'\b([A-Z][a-z]?(?:/[A-Z][a-z]?)?)\s{2,}([A-Z][a-z]+(?: [a-z]+)?(?:/[A-Z][a-z]+(?: [a-z]+)?)?)\s*$',l):
                    colors[a]=b
            m=re.search(r'\n\s*(YZ\w+)\s+(20\d\d)',p); o['legend_model']=m.groups() if m else None
            seen=set();o['components']=[c for n,c in comps if not (n in seen or seen.add(n))];o['colors']=colors;break
    # labelled values (raw text keeps each table cell on its own line)
    vals={}
    for m in re.finditer(r'(?m)^((?:[A-Z][A-Za-z/().-]*)(?: [A-Za-z/().-]+){0,7}? (?:resistance|voltage(?: \(DC\))?|spark gap|idling speed|peak voltage))\n(?:voltage\n)?([^\n]{1,70})\n([^\n]{0,60})',raw):
        lab=re.sub(r'\s+',' ',m.group(1)).strip();v=m.group(2).strip();nx=m.group(3).strip()
        if not re.search(r'\d',v) or re.search(r'[a-z]{4,} [a-z]{4,}',v): continue
        if re.match(r'^(at |\(|[\d.– ]+ ?(at|k)?)',nx) and re.search(r'at \d+|F\)',nx): v=v+' '+nx
        vals.setdefault(lab,[])
        if v not in vals[lab]: vals[lab].append(v)
    m=re.search(r'Throttle position sensor input\s*\n?\s*voltage\s*\n\s*([\d.–-]+ ?V)',raw)
    if m: vals['Throttle position sensor input voltage']=[m.group(1)]
    m=re.search(r'Spark plug cap resistance[\s\S]{0,80}?Resistance\n([^\n]+)',raw)
    if m: vals['Spark plug cap resistance']=[m.group(1).strip()]
    m=re.search(r'Fuel injector resistance[\s\S]{0,80}?Resistance\n([^\n]+)',raw)
    if m: vals['Fuel injector resistance']=[m.group(1).strip()]
    o['values']=vals
    k=raw.find('CHECKING THE FUSES',raw.find('CHECKING THE FUSES')+30)
    o['fuses']=[list(x) for x in re.findall(r'\n(Main|Spare|Reserve|[A-Z][a-z]+(?: [a-z]+){0,3})\n+(\d+(?:\.\d)? A)\n+(\d)\n',raw[k:k+6000])] if k>0 else []
    b=re.findall(r'(\d+\.\d+) V or more\s*\S*\s*The battery is normal',raw); o['battery_ok_v']=b[0] if b else None
    # fault codes
    codes={}
    i=layout.rfind('SELF-DIAGNOSTIC FUNCTION TABLE (FOR FUEL INJECTION')
    j=layout.find('DIAGNOSTIC CODE: SENSOR OPERATION TABLE',i+50) if i>=0 else -1
    if i>=0 and j>i:
        L=[l for l in layout[i:j].splitlines() if l.strip() and not re.match(r'\s*(Fault code|EAM\d+|SELF-DIAG|\d+-\d+\s*$)',l)]
        pg=r'(?:\s{3,}\d+-\d+)?\s*$';pend=None;k=0
        while k<len(L):
            l=L[k];m=re.match(r'\s{0,3}(\d{1,2})(?:\s{3,}(\S.*?))?'+pg,l)
            if m:
                n=int(m.group(1));t=(m.group(2) or '').strip()
                if re.match(r'^\d+-\d+$',t): t=''
                if pend and (not t or not pend.rstrip().endswith('.')): t=(pend+' '+t).strip()
                pend=None
                if not t.endswith('.') and k+1<len(L) and not re.match(r'\s{0,3}\d{1,2}(\s{3,}|\s*$)',L[k+1]):
                    t=(t+' '+re.sub(pg,'',L[k+1]).strip()).strip();k+=1
                codes[n]=re.sub(r'- ','',re.sub(r'\s+',' ',t)) if t else ''
            else: pend=re.sub(pg,'',l).strip()
            k+=1
    o['fault_codes']=codes
    return o
if __name__=='__main__':
    print(json.dumps(extract(open(sys.argv[1]).read(),open(sys.argv[2]).read()),indent=1,ensure_ascii=False))
