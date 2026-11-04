"""Honda CRF150R Competition Handbook: "Adjustments for Altitude & Temperature" jetting charts (standard muffler and the
optional AMA-compliant muffler), read from `pdftotext -layout`.

Each chart: 7 temperature columns (Cent. and Fahr. ranges as printed), 5 elevation bands, and per cell the pilot screw
opening (PS), slow jet (SJ), needle clip position (JN CLIP), jet needle (JN) and main jet (MJ). Every row must carry exactly
7 values or the chart is not returned. The elevation bands are taken from the printed metre/foot labels.

usage: honda_jetting.py <pdf> [...]   prints one JSON object per handbook: {doc, sha, charts:{name:[bands]}, problems}"""
import sys,re,json,subprocess,hashlib,os
ROWS=[('PS','PS:'),('SJ','SJ:'),('CLIP','JN CLIP:'),('JN','JN:'),('MJ','MJ:')]
NUM=r'[–-]?\d+'
def num(s): return float(s.replace('–','-').replace(',',''))
def chart(lines,start,problems,name):
    # header: "Cent." and "Fahr." lines
    i=start
    while i<len(lines) and 'Cent.' not in lines[i]: i+=1
    if i+1>=len(lines) or 'Fahr.' not in lines[i+1]: problems.append(f'{name}: no temperature header'); return None,start
    c=re.findall(rf'({NUM})°\s+({NUM})°',lines[i]); f=re.findall(rf'({NUM})°\s+({NUM})°',lines[i+1])
    if len(c)!=7 or len(f)!=7: problems.append(f'{name}: {len(c)}/{len(f)} temperature columns'); return None,i
    for (c0,c1),(f0,f1) in zip(c,f):
        if abs(num(c0)*9/5+32-num(f0))>2.5 or abs(num(c1)*9/5+32-num(f1))>2.5: problems.append(f'{name}: °C/°F header disagree {c0},{c1} vs {f0},{f1}'); return None,i
    temps=[{'c':[num(a),num(b)],'f':[num(x),num(y)]} for (a,b),(x,y) in zip(c,f)]
    rows=[];j=i+2;side=[]
    while j<len(lines) and len(rows)<25:
        l=lines[j]
        for key,lab in ROWS:
            m=re.search(r'(?:^|\s)'+re.escape(lab)+r'\s+(.*)$',l)
            if m and not (key=='JN' and 'JN CLIP:' in l):
                vals=re.sub(r'(\d)\s+(st|nd|rd|th)\b',r'\1\2',m.group(1).strip())
                toks=re.split(r'\s+',vals)
                rows.append((key,toks)); side.append(l[:m.start()]); break
        else:
            if rows: side.append(l)
        j+=1
    if len(rows)!=25: problems.append(f'{name}: {len(rows)} setting rows, expected 25'); return None,j
    bad=[(k,t) for k,t in rows if len(t)!=7]
    if bad: problems.append(f'{name}: rows without 7 values {bad[:2]}'); return None,j
    labels=' '.join(side)
    m=[num(x) for x in re.findall(r'(\d[\d,]*)\s*m\b',labels)]; ft=[num(x) for x in re.findall(r'\((\d[\d,]*)\s*ft\)',labels)]
    if 'Sea level' in labels and len(ft)==9: ft.append(0)
    if len(m)==9 and 'Sea level' in labels: m.append(0)
    if len(m)!=10 or len(ft)!=10: problems.append(f'{name}: elevation labels {m} {ft}'); return None,j
    bands=[]
    for k in range(5):
        hi,lo=m[2*k],m[2*k+1]; fhi,flo=ft[2*k],ft[2*k+1]
        if any(abs(a*3.28084-b)>max(60,b*0.03) for a,b in ((hi,fhi),(lo,flo))): problems.append(f'{name}: metres/feet disagree {hi},{fhi} {lo},{flo}'); return None,j
        cells=[]
        for col in range(7):
            s={key:toks[col] for key,toks in rows[5*k:5*k+5]}
            cells.append({'temp':temps[col],'settings':s})
        bands.append({'m':[lo,hi],'ft':[flo,fhi],'cells':cells})
    bands.sort(key=lambda b:b['m'][0])
    if bands[0]['m'][0]!=0 or any(b['m'][0]-a['m'][1]!=1 for a,b in zip(bands,bands[1:])): problems.append(f'{name}: bands not continuous'); return None,j
    return bands,j
def parse(path):
    pages=subprocess.run(['pdftotext','-q','-layout',path,'-'],capture_output=True,text=True).stdout.split('\f')
    out={'doc':os.path.basename(path),'sha':hashlib.sha256(open(path,'rb').read()).hexdigest(),'charts':{},'problems':[]}
    for pi,t in enumerate(pages):
        lines=t.split('\n')
        for i,l in enumerate(lines):
            name=None
            if re.match(r'^\s*Standard muffler\s*$',l): name='standard'
            elif re.match(r'^\s*Optional Muffler\s*$',l): name='optional AMA-compliant muffler'
            if not name: continue
            b,_=chart(lines,i,out['problems'],name)
            if b:
                printed=next((x.strip() for x in reversed(lines) if re.fullmatch(r'\s*\d-\d+\s*',x)),'?')
                for x in b: x['pdf']=pi+1; x['printed']=printed
                out['charts'][name]=b
    return out
if __name__=='__main__':
    for a in sys.argv[1:]: print(json.dumps(parse(a),ensure_ascii=False))
