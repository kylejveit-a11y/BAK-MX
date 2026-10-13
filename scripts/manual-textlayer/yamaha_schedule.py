"""Yamaha Owner's Service Manual: the MAINTENANCE INTERVALS table (chapter 3).
The table's own rule lines define the cells: rules starting in the item-number column separate items, rules
spanning the routine column separate routines, vertical rules separate the interval columns. 2020–2024 manuals
draw full-width rules and the check mark as SymbolMT U+F0D6; 2025+ manuals draw one rule segment per cell and the
check mark as SymbolMT 0xD6 (the Symbol-font check). Both are handled by the same geometry."""
import pdfplumber,re,sys
KEEP_HYPHEN={'break','lithium','soap','molybdenum','self','anti','pre','non','two','four','dust','oil','water','air','fuel','cross'}
MARK=''
def clean(s): return re.sub(r'\s+',' ',s.replace('\uf020',' ')).strip()   # U+F020 is the Symbol-font space
def join_lines(words):
    """Words of one cell, in reading order, with hyphenated line breaks joined."""
    rows={}
    for w in words: rows.setdefault(round(w['top']/4),[]).append(w)
    out=''
    for k in sorted(rows):
        t=' '.join(w['text'] for w in sorted(rows[k],key=lambda w:w['x0']))
        out=hyphen_join(out,t) if out else t
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
# ---------------------------------------------------------------------------------------------------------------
# 2020 two-stroke manuals (YZ125 / YZ125X, YZ250 / YZ250X; B0V-28199-11, B9U-28199-11) print the older table:
# the item in capitals with its routines indented beneath it, filled dots (MS-Gothic "●") as marks, no item
# numbers or asterisks, and a Remarks column whose text belongs to the item as a whole.
ACRONYMS={'YPVS','CDI','VIN','SX'}
def title(s):
    return ' '.join(w if (w in ACRONYMS or re.match(r'\(?YZ\d',w)) else (w.capitalize() if i==0 else w.lower()) for i,w in enumerate(s.split()))
def hyphen_join(a,b):
    """Join two printed lines. A line-break hyphen is dropped unless it is a real compound (break-in, lithium-soap-based ...);
    the continuation must be lower case, or upper case after an upper-case fragment (YAMA-/LUBE, CONNECT-/ING ROD)."""
    frag=a.rsplit(' ',1)[-1][:-1]
    if a.endswith('-') and frag and (b[:1].islower() or (b[:1].isupper() and frag.isupper())):
        return a+b if frag.lower() in KEEP_HYPHEN else a[:-1]+b
    return a+' '+b
def parse_old(path):
    pdf=pdfplumber.open(path); out=[]; problems=[]; seen=False; pending=None
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        head=' '.join(w['text'] for w in ws if w['top']<30)
        if 'MAINTENANCE INTERVALS' not in head:
            if seen: break
            continue
        seen=True
        from collections import Counter
        vc=Counter()
        for e in pg.edges:
            if e['orientation']=='v' and 200<e['x0']<400: vc[round(e['x0'])]+=e['bottom']-e['top']
        cols=[]
        for x in sorted(x for x,n in vc.items() if n>100):
            if cols and x-cols[-1]<=4: continue
            cols.append(x)
        if len(cols)!=6: problems.append((pi+1,'columns',cols)); continue
        rem_x=cols[5]
        rules=[]
        for t in sorted({round(e['top'],1) for e in pg.edges if e['orientation']=='h' and e['x0']<=70 and e['x1']>=540 and e['top']>40}):
            if rules and t-rules[-1]<=3: continue
            rules.append(t)
        marks=[c for c in pg.chars if c['text']=='●']
        if not marks or len(rules)<3: problems.append((pi+1,'no marks or rules')); continue
        header_top=max(r for r in rules if r<marks[0]['top']-10 and any(w['text']=='Item' and r<w['top'] for w in ws))
        first_item=min(r for r in rules if r>header_top and r>max(w['top'] for w in ws if w['text']=='Item'))
        labels=[]
        for a,b in zip(cols,cols[1:]):
            labels.append(join_lines([w for w in ws if a<=w['x0']<b and header_top<w['top']<first_item]).replace('break -in','break-in').replace('re- quired','required').replace('re-quired','required'))
        if not any('break-in' in l for l in labels) or not any('required' in l for l in labels): problems.append((pi+1,'header',labels)); continue
        printed=next((w['text'] for w in ws if re.fullmatch(r'\d-\d+',w['text']) and w['top']>700),'?')
        bands=[r for r in rules if r>=first_item]
        for t1,t2 in zip(bands,bands[1:]):
            cell=[w for w in ws if t1<w['top']<t2 and w['x0']<rem_x]
            left=[w for w in cell if w['x0']<cols[0]]
            lines={}
            for w in left: lines.setdefault(round(w['top']/4),[]).append(w)
            name_rows=[]; routines=[]; hold=''
            def marked(top): return any(abs(c['top']-top)<5 and cols[0]<=c['x0']<cols[5] for c in marks)
            for k in sorted(lines):
                row=sorted(lines[k],key=lambda w:w['x0']); text=' '.join(w['text'] for w in row); top=row[0]['top']
                if text==text.upper() and re.search('[A-Z]',text) and row[0]['x0']<72: name_rows.append(text)
                elif marked(top): routines.append((top,hyphen_join(hold,text) if hold else text)); hold=''
                elif routines and not hold: routines[-1]=(routines[-1][0],hyphen_join(routines[-1][1],text))   # wrapped line
                else: hold=hyphen_join(hold,text) if hold else text                                        # line before its mark
            if hold: problems.append((pi+1,'routine without mark',hold))
            name=None
            for t in name_rows: name=hyphen_join(name,t) if name else t
            name=title(name) if name else (pending['name'] if pending else None)
            if not name: problems.append((pi+1,'no item name',t1)); continue
            # Remarks: each printed line goes to the routine it is aligned with; following lines continue that remark;
            # lines aligned with no routine belong to the item as a whole.
            rl={}
            for w in [w for w in ws if t1<w['top']<t2 and rem_x<=w['x0']<560]: rl.setdefault(round(w['top']/4),[]).append(w)
            remarks={}; cur=None
            for k in sorted(rl):
                row=sorted(rl[k],key=lambda w:w['x0']); text=' '.join(w['text'] for w in row)
                hit=[i for i,(top,_) in enumerate(routines) if abs(top-row[0]['top'])<6]
                if hit: cur=hit[0]
                elif cur is None: cur=-1
                remarks[cur]=hyphen_join(remarks[cur],text) if cur in remarks else text
            item={'name':name}; pending=item
            for i,(top,text) in enumerate(routines):
                ks=sorted({next(k for k in range(5) if cols[k]<=c['x0']<cols[k+1]) for c in marks if abs(c['top']-top)<5 and cols[0]<=c['x0']<cols[5]})
                vals=[labels[k][0].lower()+labels[k][1:] for k in ks]
                if i in remarks: vals.append('remarks: '+clean(remarks[i]))
                out.append((pi+1,printed,'Service schedule / '+name+' – '+text.rstrip('.'),'; '.join(vals)))
            if -1 in remarks and name_rows: out.append((pi+1,printed,'Service schedule / '+name+' – Remarks',clean(remarks[-1])))
    return out,problems

if __name__=='__main__':
    o,p=(parse_old if '--old' in sys.argv else parse)(sys.argv[1]); print('PROBLEMS',p,len(o))
    for x in o: print(x)

