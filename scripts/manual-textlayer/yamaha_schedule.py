"""Yamaha Owner's Service Manual: the MAINTENANCE INTERVALS table (chapter 3).
The table's own rule lines define the cells: rules starting in the item-number column separate items, rules
spanning the routine column separate routines, vertical rules separate the interval columns. 2020–2024 manuals
draw full-width rules and the check mark as SymbolMT U+F0D6; 2025+ manuals draw one rule segment per cell and the
check mark as SymbolMT 0xD6 (the Symbol-font check). Both are handled by the same geometry."""
import pdfplumber,re,sys
KEEP_HYPHEN={'break','lithium','soap','molybdenum','self','anti','pre','re','non','two','four','dust','oil','water','air','fuel','cross'}
MARK=''
def clean(s): return re.sub(r'\s+',' ',s.replace('\uf020',' ')).strip()   # U+F020 is the Symbol-font space
def join_lines(words):
    """Words of one cell, in reading order, with hyphenated line breaks joined."""
    rows={}
    for w in words: rows.setdefault(round(w['top']/4),[]).append(w)
    out=''
    for k in sorted(rows):
        t=' '.join(w['text'] for w in sorted(rows[k],key=lambda w:w['x0']))
        if out.endswith('-') and t[:1].islower():
            # a line-break hyphen is dropped unless it is a real compound (break-in, lithium-soap-based ...)
            keep=out.rsplit(' ',1)[-1][:-1].lower() in KEEP_HYPHEN
            out=out+t if keep else out[:-1]+t
        else: out=out+' '+t if out else t
    return clean(out)
def parse(path):
    pdf=pdfplumber.open(path); out=[]; problems=[]; seen=False; pending=None
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        head=' '.join(w['text'] for w in ws if w['top']<30)
        if 'MAINTENANCE INTERVALS' not in head:
            if seen: break
            continue
        seen=True
        hx=sorted({(round(e['top'],1),round(e['x0']),round(e['x1'])) for e in pg.edges if e['orientation']=='h' and e['x1']-e['x0']>=10})
        from collections import Counter
        vc=Counter()
        for e in pg.edges:
            if e['orientation']=='v' and e['x0']>290: vc[round(e['x0'])]+=e['bottom']-e['top']
        vx=sorted(x for x,n in vc.items() if n>15)      # one long rule, or per-cell segments (a last page may hold one item)
        # collapse doubled rules
        def collapse(vals,tol):
            o=[]
            for v in vals:
                if o and v-o[-1]<=tol: continue
                o.append(v)
            return o
        cols=collapse(vx,4)
        if len(cols)!=6: problems.append((pi+1,'columns',cols)); continue
        # header labels: words between the table top rule and the first item rule, per column band
        full=collapse(sorted({h[0] for h in hx if h[1]<=70 and h[0]>40}),3)          # item separators
        all_rules=collapse(sorted({h[0] for h in hx if h[0]>40 and h[1]<=175 and h[2]>=300}),3)   # routine separators
        nums=[w for w in ws if w['x0']<78 and re.fullmatch(r'\d+',w['text']) and w['top']>60]
        if not nums or len(full)<2: problems.append((pi+1,'no item rows')); continue
        first_item=max(r for r in full if r<nums[0]['top'])
        item_rules=[r for r in full if r>=first_item]
        header_top=max(r for r in full if r<first_item)
        labels=[]
        for a,b in zip(cols,cols[1:]):
            labels.append(join_lines([w for w in ws if a<=w['x0']<b and header_top<w['top']<first_item]).replace('breakin','break-in'))
        if not any('break-in' in l for l in labels) or not any('required' in l for l in labels): problems.append((pi+1,'header',labels)); continue
        printed=next((w['text'] for w in ws if re.fullmatch(r'\d-\d+',w['text']) and w['top']>700),'?')
        marks=[c for c in pg.chars if c['text']==MARK or (c['text']=='Ö' and 'Symbol' in c['fontname'])]
        bands=list(zip(item_rules,item_rules[1:]))
        for t1,t2 in bands:
            cell=[w for w in ws if t1<w['top']<t2]
            num=[w for w in cell if w['x0']<78 and re.fullmatch(r'\d+',w['text'])]
            name=join_lines([w for w in cell if 85<=w['x0']<170 and w['text']!='*'])
            star=any(w['text']=='*' for w in cell if w['x0']<90)
            if not num and pending and not name: item=pending       # an item continued from the previous page
            else: item={'name':name,'star':star}
            pending=item
            subs=[r for r in all_rules if t1<r<t2]
            edges=[t1]+subs+[t2]
            for s1,s2 in zip(edges,edges[1:]):
                rw=[w for w in cell if 170<=w['x0']<cols[0] and s1<w['top']<s2 and w['text']!='•']
                if not rw: continue
                text=join_lines(rw)
                ks=sorted({next(k for k in range(5) if cols[k]<=c['x0']<cols[k+1]) for c in marks if s1<c['top']<s2 and cols[0]<=c['x0']<cols[5]})
                vals=[labels[k][0].lower()+labels[k][1:] for k in ks]
                # text printed across the interval columns instead of a mark ("Every one year") is kept as its own entry
                extra=join_lines([w for w in cell if cols[0]<=w['x0']<cols[5] and s1<w['top']<s2 and w['text'] not in (MARK,'Ö')])
                if extra: vals.insert(0,extra[0].lower()+extra[1:])
                if not vals: continue
                out.append((pi+1,printed,'Service schedule / '+item['name']+' – '+text.rstrip('.'),'; '.join(vals)+('; marked for a Yamaha dealer' if item['star'] else '')))
    return out,problems
if __name__=='__main__':
    o,p=parse(sys.argv[1]); print('PROBLEMS',p,len(o))
    for x in o: print(x)
