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
                if seg is None or seg['rows']: seg={'h':[],'rows':[]}; segs.append(seg)
                seg['h'].append(txt); continue
            if l[0]['b'] and re.match(r'^\d+\.\d+$',l[0]['text']): seg=None; continue
            if seg is None: continue
            lab=[w for w in l if w not in marks]
            if lab and lab[0]['text'] in('○','●'): continue  # legend
            labt=clean(' '.join(w['text'] for w in lab))
            if marks: seg['rows'].append({'lab':labt,'m':[(round(w['x0']),w['text']) for w in marks]})
            elif labt and seg['rows']: seg['rows'][-1]['lab']=join(seg['rows'][-1]['lab'],labt)
        for seg in segs:
            hs=[hdr_text(h) for h in reversed(seg['h'])]   # bottom line = leftmost column
            xs=sorted({x for r in seg['rows'] for x,_ in r['m']})
            cl=[]
            for x in xs:
                if cl and x-cl[-1][-1]<=4: cl[-1].append(x)
                else: cl.append([x])
            if len(cl)!=len(hs): problems.append((pi+1,len(cl),len(hs),seg['h'])); continue
            col={x:i for i,c in enumerate(cl) for x in c}
            for r in seg['rows']:
                iv=[hs[col[x]][0 if t=='○' else 1] for x,t in sorted(r['m'])]
                out.append((pi+1,printed,r['lab'].rstrip('.').strip(),iv))
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
