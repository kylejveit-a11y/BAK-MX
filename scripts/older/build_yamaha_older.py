"""Payloads for Yamaha 2010-2019 Owner's Service Manuals (docs/research/older/yamaha-2010-2019).

usage (from the PDF directory): build_yamaha_older.py jobs.txt outdir
jobs.txt: MODEL|YEAR|CODE|PDF path (a manual shared by two models appears twice)

Per bike-year, every reader is the one already used for the 2020+ manuals:
- specification table: the newer-layout reader (yamaha_specs.parse + sag + yamaha_dampers.check, damper values must agree with the
  adjustment procedures) when it passes; otherwise the ruled-table reader of the 2020 two-stroke manuals (yamaha_specs_2020: USA
  market column only, every mm value checked against its inch conversion, dampers from the adjustment procedures), which is the
  layout of the 2010-2017 manuals;
- tightening torques: yamaha_torques.read (N·m checked against m·kg and ft·lb on the same line).
A path printed twice is dropped. A bike-year with no edition / LIT number on its cover pages is not written.
Payload lines: pdf|printed|path|value|unit, sorted by sha256(path); want = sha256 of the lines."""
import hashlib,json,os,re,sys,pdfplumber
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','manual-textlayer'))
import yamaha_specs,yamaha_specs_2020,yamaha_dampers,yamaha_torques
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import yamaha_dampers_older,yamaha_torques_2010
REF=('docs/research/older/yamaha-2010-2019/REVIEW.md; {code}; OEM PDF from the Yamaha owner\'s manual library, hashed; specification table '
     '({reader}), damper settings from the adjustment procedures (US value only) of the same document, tightening torques with every N·m checked against '
     'the printed m·kg and ft·lb; fail-closed.')
def h(s): return hashlib.sha256(s.encode()).hexdigest()
def main():
    jobs,outdir=sys.argv[1:3]; os.makedirs(outdir,exist_ok=True); n=0; report=[]; cache={}
    for line in open(jobs):
        if not line.strip() or line.startswith('#'): continue
        model,yr,code,path=line.rstrip('\n').split('|')[:4]
        if path not in cache:
            pdf=pdfplumber.open(path); t=re.sub(r'\s+',' ',' '.join((pdf.pages[i].extract_text() or '') for i in range(min(6,len(pdf.pages)))))
            ed=re.search(r'(?:First|1st) [Ee]dition,? ([A-Z][a-z]+,? \d{4})',t); lit=re.search(r'LIT-\d+-\d+-\d+',t)
            cache[path]=(hashlib.sha256(open(path,'rb').read()).hexdigest(),ed.group(1) if ed else None,lit.group(0) if lit else None,t)
        sha,ed,lit,cover=cache[path]
        pdf=pdfplumber.open(path)
        def printed(p):
            ws=pdf.pages[p-1].extract_words(); return next((w['text'] for w in ws if re.fullmatch(r'\d+-\d+',w['text']) and w['top']>700),'?')
        rep={'model':model,'yr':int(yr),'code':code,'notes':[]}
        # covers print the model with its year letter (YZ450FG, YZ250H2); a suffix starting F/X would name another model
        suf=r'(?:[A-EG-WYZ]\d?)?' if not model.endswith(('F','X')) else r'(?:[A-Z]\d?)?'
        if not re.search(r'(?<![\w])'+re.escape(model)+suf+r'(?![\w])',cover): rep['notes'].append('MODEL NOT ON COVER')
        # specification table: the older ruled layout prints "MAINTENANCE SPECIFICATIONS" page headers, the newer one does not
        heads=' '.join(' '.join(w['text'] for w in pg.extract_words() if w['top']<30) for pg in pdf.pages[25:60])
        old='MAINTENANCE SPECIFICATIONS' in heads; spec=[]; reader=None
        damp,dpr=yamaha_dampers_older.dampers(path); rep['damper_problems']=[str(x) for x in dpr]
        damp=[(p,printed(p),a,v,u) for p,_,a,v,u in damp]
        try:
            if not old:
                rows,prob=yamaha_specs.parse(path,model)
                if any('Adjustment value from the start position' in r[2] for r in rows):     # 2018+: dampers in the table, checked
                    mism,_=yamaha_dampers.check(path,rows,model)
                    if mism: rep['notes'].append('damper check failed: '+str(mism)[:200]); rows=[]
                    damp=[]
                if len(rows)>=120: spec=rows; reader='newer-layout reader'; rep['notes']+=[str(x) for x in prob]
                else: rep['notes'].append(f'newer reader: {len(rows)} rows')
            else:
                m2=model if model in yamaha_specs_2020.MODELS else None
                rows,prob=yamaha_specs_2020.parse(path,m2 or model)
                if len(rows)>=80: spec=rows; reader='ruled-table reader, USA column'; rep['notes']+=[str(x) for x in prob]
                else: rep['notes'].append(f'older reader: {len(rows)} rows')
        except Exception as e: rep['notes'].append('spec reader: '+repr(e)[:120])
        if spec:
            s=yamaha_specs.sag(path)
            if s: spec.append(s)
            spec+=damp; rep['dampers']=len(damp)
        try: tq,tprob=yamaha_torques.read(path,model if model in ('YZ125X','YZ250X','YZ125','YZ250') else None)
        except Exception as e: tq=[]; tprob=[('torques',repr(e)[:80])]
        if not tq:                                             # 2010-2013 four-strokes: Nm | m•kg | ft•lb columns
            try: tq,tprob=yamaha_torques_2010.read(path)
            except Exception as e: tq=[]; tprob=[('torques 2010',repr(e)[:80])]
        rep['torque_problems']=[str(p) for p in tprob if p[0]!='group']
        rows=spec+tq
        paths=[r[2] for r in rows]; dup={p for p in paths if paths.count(p)>1}
        rows=[r for r in rows if r[2] not in dup and '|' not in r[2]+str(r[3]) and str(r[3]).strip()]
        rep.update(spec=len(spec),torques=len(tq),dropped_dup=sorted(dup),reader=reader)
        if not ed or not lit or not rows:
            rep['notes'].append(f'NOT WRITTEN edition={ed} lit={lit} rows={len(rows)}'); report.append(rep); print(rep); continue
        lines=sorted((f'{p}|{pr}|{a}|{v}|{u or ""}' for p,pr,a,v,u in rows),key=lambda l:h(l.split('|')[2]))
        n+=1
        json.dump({'make':'Yamaha','model':model,'yr':int(yr),'doc':code,'sha':sha,
                   'url':f'https://library.ymcapps.net/library/om/contents/pdf/10/{code}_02.pdf',
                   'rev':f'{code} / {lit}; First edition {ed}','ref':REF.format(code=code,reader=reader or 'none: torques only'),
                   'want':h('\n'.join(lines)),'n':len(lines),'delta':'\n'.join('+|'+l for l in lines)},open(f'{outdir}/{n}.json','w'),ensure_ascii=False)
        rep['i']=n; report.append(rep)
        print(n,model,yr,code,reader,'spec',len(spec),'torques',len(tq),'dup',len(dup),'notes',len(rep['notes']),'tq-prob',len(rep['torque_problems']))
    json.dump(report,open(outdir.rstrip('/')+'.report.json','w'),indent=1,ensure_ascii=False)
if __name__=='__main__': main()
