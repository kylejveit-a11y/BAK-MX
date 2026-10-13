"""Triumph owner's handbook "Scheduled Maintenance Table" (TF 250-X / TF 450-RC Edition public US handbooks).

The table's grid lines give the row bands, the bullet glyphs ("•") the marks, and the seven interval columns are named by
the header words above each bullet column ("After the first operating hour", "Every 2.5 hours of race Riding Conditions",
"Every 15 operating hours", ... "Every 24 months"). A shaded band with one centred phrase is a category heading
(Lubrication, Fuel System and Engine Management, ...). Items marked * are, per the handbook, subject to an additional labour charge above the basic service.
usage: triumph_schedule.py handbook.pdf"""
import pdfplumber,re,sys
def parse(path):
    pdf=pdfplumber.open(path); out=[]; problems=[]; seen=False; cat=None; pending=None
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        text=' '.join(w['text'] for w in ws)
        if 'Operation description' not in text:
            if seen: break
            continue
        seen=True
        dots=[c for c in pg.chars if c['text']=='•']
        if not dots: problems.append((pi+1,'no marks')); continue
        vx=sorted({round(l['x0']) for l in pg.lines if abs(l['x0']-l['x1'])<1 and l['x0']>100 and l['bottom']-l['top']>5})
        vl=[]
        for x in vx:
            if vl and x-vl[-1]<=3: continue
            vl.append(x)
        if len(vl)!=8: problems.append((pi+1,'columns',vl)); continue
        cx=[(a+b)/2 for a,b in zip(vl,vl[1:])]                        # the seven interval columns from the grid's vertical rules
        hdr_top=min(w['top'] for w in ws if w['text']=='Operation')
        rules=sorted({round(l['top']) for l in pg.lines if abs(l['top']-l['bottom'])<1 and l['x0']<35 and l['top']>hdr_top-20})
        bands=[]
        for r in rules:
            if bands and r-bands[-1]<=2: continue
            bands.append(r)
        hdr_bot=bands[1] if len(bands)>1 else hdr_top+30            # the header band is the first grid row
        labels=[]
        for k,x in enumerate(cx):
            lo=(cx[k-1]+x)/2 if k else x-16; hi=(x+cx[k+1])/2 if k<6 else x+18
            band=[w for w in ws if bands[0]<w['top']+w['height']/2<hdr_bot and lo<=w['x0']+w['width']/2<hi]
            rows={}
            for w in band: rows.setdefault(round(w['top']/3),[]).append(w)
            labels.append(' '.join(' '.join(w['text'] for w in sorted(rows[r],key=lambda w:w['x0'])) for r in sorted(rows)))
        if not labels[0].startswith('After the first') or not labels[-1].startswith('Every 24'): problems.append((pi+1,'header',labels)); continue
        labels=[l[0].lower()+l[1:] for l in labels]
        # every grid row is bounded by the rules in the operation column; a row with no operation text and a centred
        # phrase is a category heading; the bullets in the row are its marks
        for t1,t2 in zip(bands[1:],bands[2:]):
            inb=[w for w in ws if t1<w['top']+w['height']/2<t2 and w['text']!='•']
            op=[w for w in inb if w['x0']<125]; mid=[w for w in inb if w['x0']>=125]
            marks=sorted({min(range(7),key=lambda k:abs(cx[k]-c['x0'])) for c in dots if t1<c['top']+c['height']/2<t2})
            if not op:
                if mid and not marks: cat=' '.join(w['text'] for w in sorted(mid,key=lambda w:w['x0']))
                continue
            rows={}
            for w in op: rows.setdefault(round(w['top']/3),[]).append(w)
            name=' '.join(' '.join(w['text'] for w in sorted(rows[r],key=lambda w:w['x0'])) for r in sorted(rows))
            dealer='*' in name; name=re.sub(r'\s*\*','',name).strip()
            if not marks: problems.append((pi+1,'no mark',name)); continue
            vals=[labels[k] for k in marks]+(['marked * (subject to an additional labour charge above the basic service, as the handbook notes)'] if dealer else [])
            out.append((pi+1,str(pi+1),f'Service schedule / {cat} / {name}' if cat else f'Service schedule / {name}','; '.join(vals)))
    return out,problems
if __name__=='__main__':
    o,p=parse(sys.argv[1]); print('PROBLEMS',p,len(o))
    for r in o: print(r)
