import pdfplumber,re,sys
from tech_data_2020_2025 import lines_of, clean, join
def hdr_text(h):
    h=re.sub(r'\s+',' ',h).strip()
    m=re.match(r'^(?:Once )?After (.+?) / Every (.+)$',h,re.I)
    if m: return ('once after '+m.group(1), 'every '+m.group(2))
    low=h[0].lower()+h[1:]
    if low.startswith('every '): return ('once after '+low[6:], low)
    return ('once '+low, low)
def parse(path):
    pdf=pdfplumber.open(path); out=[]; problems=[]; seen=False
    for pi,pg in enumerate(pdf.pages):
        L=lines_of(pg)
        if not L: continue
        head=' '.join(w['text'] for w in L[0]).upper()
        if 'SERVICE SCHEDULE' not in head:
            if seen: break
            continue
        seen=True
        foot=[w['text'] for w in L[-1] if w['text'].isdigit() and (w['b'] or len(L[-1])==1)]
        printed=foot[0] if foot else '?'
        body=L[1:-1]
        segs=[];seg=None
        for l in body:
            txt=' '.join(w['text'] for w in l)
            marks=[w for w in l if w['text'] in('○','●') and w['x0']>240]
            if all(w['b'] for w in l) and l[0]['x0']>200 and not marks and re.search(r'hours?|race|months|year',txt):
                if seg is None or seg['rows']: seg={'h':[],'hx':[],'rows':[]}; segs.append(seg)
                seg['h'].append(txt); seg['hx'].append(max(w['x1'] for w in l)); continue
            if l[0]['b'] and re.match(r'^\d+\.\d+$',l[0]['text']): seg=None; continue
            if seg is None: continue
            lab=[w for w in l if w not in marks]
            if lab and lab[0]['text'] in('○','●'): continue  # legend
            labt=clean(' '.join(w['text'] for w in lab))
            if marks: seg['rows'].append({'lab':labt,'m':[(w['x0'],w['text']) for w in marks]})
            elif labt and seg['rows']: seg['rows'][-1]['lab']=join(seg['rows'][-1]['lab'],labt)
        for seg in segs:
            # Each header line ends where its column starts; the bottom header line is the leftmost column.
            hs=[hdr_text(h) for h in reversed(seg['h'])]; hx=list(reversed(seg['hx']))
            if any(b<=a for a,b in zip(hx,hx[1:])): problems.append((pi+1,'header order',seg['h'])); continue
            bad=False; rows=[]
            for r in seg['rows']:
                iv=[]
                for x,t in sorted(r['m']):
                    k=min(range(len(hx)),key=lambda k:abs(hx[k]-7.3-x))   # a mark sits 7.3 pt left of its header's right edge
                    if abs(hx[k]-7.3-x)>3: bad=True; break
                    iv.append(hs[k][0 if t=='○' else 1])
                if bad: break
                rows.append((pi+1,printed,r['lab'].rstrip('.').strip(),iv))
            if bad: problems.append((pi+1,'mark off column',seg['h'])); continue
            out+=rows
    merged={}
    for pdfp,pr,lab,iv in out:
        if lab in merged:
            for v in iv:
                if v not in merged[lab][2]: merged[lab][2].append(v)
        else: merged[lab]=[pdfp,pr,list(iv)]
    res=[]
    for lab,(pdfp,pr,iv) in merged.items():
        iv=[v for v in iv if v.startswith('once')]+[v for v in iv if not v.startswith('once')]
        res.append((pdfp,pr,'Service schedule / '+lab,'; '.join(iv)))
    return res,problems
if __name__=='__main__':
    r,p=parse(sys.argv[1]); print('PROBLEMS',p)
    for x in r: print(x)
