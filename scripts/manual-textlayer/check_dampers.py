"""Cross-check: every Comfort/Standard/Sport damper triple staged for a bike must also be printed, as a triple,
in the adjustment sections of the same manual (the pages before the technical-data chapter).
usage (from the PDF directory): check_dampers.py <payload.json> ..."""
import sys,json,re,pdfplumber,collections
by=collections.defaultdict(list)
for f in sys.argv[1:]:
    j=json.load(open(f)); j['_f']=f; by[j['doc']].append(j)
for doc,js in by.items():
    p=pdfplumber.open(doc+'.pdf')
    first=min(int(l.split('|')[1]) for j in js for l in j['delta'].split('\n') if not l.split('|')[3].startswith('Service'))
    t='\n'.join((pg.extract_text(x_tolerance=1.2) or '') for pg in p.pages[:first-1])
    t=re.sub(r'\n\(\d+ ?°\)','',t)
    trip=set(re.findall(r'Comfort (\S+ (?:clicks?|turns?))[^\n]*\n(?:[^\n]*\n)?\s*(?:\S+ )?Standard (\S+ (?:clicks?|turns?))[^\n]*\n(?:[^\n]*\n)?\s*Sport (\S+ (?:clicks?|turns?))',t))
    for j in js:
        d={l.split('|')[3]:l.split('|')[4] for l in j['delta'].split('\n')}
        groups={k.rsplit(' / ',1)[0] for k in d if re.search(r'damping / (Comfort|Standard|Sport)$',k)}
        miss=[]
        for g in sorted(groups):
            tr=tuple(re.sub(r' \(.*','',d.get(g+' / '+x,'?')) for x in('Comfort','Standard','Sport'))
            if tr not in trip: miss.append([g,list(tr)])
        print(json.dumps({'f':j['_f'],'make':j['make'],'model':j['model'],'yr':j['yr'],'groups':len(groups),'unconfirmed':miss}),flush=True)
