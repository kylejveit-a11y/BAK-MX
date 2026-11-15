"""Payloads for Honda CRF 2010-2019 owner's manuals (docs/research/older/honda-2010-2019).

usage: assemble_honda_older.py <pdf dir> <index tsv> <outdir>
Reads every manual with honda_older.read(path, model) and keeps only rows that pass these rules (fail-closed):
- A manual shared by two models (2018 CRF450R with CRF450RX, 2019 CRF250R/RX, 2019 CRF450R/RX/RWE) is loaded once per model; a
  value tagged for the other model ("(CRF450RX)") is left out, and so is any specification-table row that names a model.
- Specification table: only from manuals whose column edges come from the table's own "Item" headings (2010-2017). The 2018-on
  layout and the two-table CRF150R/RB and CRF250X/450X tables are not read. Labels that swallowed a number, end in ":", or start
  in lower case (a wrapped line) are left out.
- Torques: an item that ran into the next item's number ("... nut (U-nut) 16 Fork ...") is left out.
- Page check: every number in every value must be printed on its own PDF page.
Damper paths are written as "Fork / ..." and "Shock absorber / ..." so they file under suspension."""
import hashlib,json,os,re,subprocess,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import honda_older as h,pdfplumber
def sha(s): return hashlib.sha256(s.encode()).hexdigest()
SHARED={'2018_31mke610_crf450r.pdf':['CRF450R','CRF450RX'],'2019_31k95610_crf250r_rx.pdf':['CRF250R','CRF250RX'],
        '2019_31mke620_crf450r_rx_rwe.pdf':['CRF450R','CRF450RX']}
NO_SPECS=('CRF150R','CRF250X','CRF450X')
REF=("docs/research/older/honda-2010-2019/REVIEW.md; {code}; OEM PDF from powersports.honda.com owner's manuals, hashed; specification "
     "table (English/metric agreement checked), damper standard settings from the adjustment procedures, torque table with N·m checked "
     "against lbf·ft and kgf·m; every number found on its own page; fail-closed.")
def tag_drop(text,model):
    for t in re.findall(r'\(?(CRF\d{3}[A-Z/]*)\)?:?',text):
        if not h.tag_ok(t.strip('():'),model): return True
    return False
def keep(r,model,col_ok):
    pg,pr,path,val,unit=r; last=path.split(' / ')[-1]
    if path.startswith('Specifications'):
        if not col_ok or model in NO_SPECS: return 'specs not read for this layout'
        if 'CRF' in path+str(val): return 'model-tagged spec row'
        if re.search(r'\d',last) or last.endswith(':') or last.endswith(',') or path.split(' / ')[1][:1].islower(): return 'label swallowed a value or wrapped'
        if last[:1].islower() and 'capacity' not in path.split(' / ')[-2]: return 'label swallowed a value or wrapped'
        if re.match(r'^(x |\(|travel|from )',str(val)): return 'value is a wrapped label'
    elif path.startswith('Torque'):
        if re.search(r'\)\s+\d+\s|\s\d+\s+[A-Z][a-z]',path): return 'item ran into the next item'
        if tag_drop(path,model): return 'tagged for the other model'
    return None
def main():
    pdfdir,index,out=sys.argv[1:4]; os.makedirs(out,exist_ok=True)
    jobs=[]
    for l in open(index):
        if l.startswith(('#','year')) or not l.strip(): continue
        yr,model,f=l.rstrip('\n').split('\t')[:3]
        short=f.replace('ml.remawmom.','')
        for m in SHARED.get(short,[model]): jobs.append((int(yr),m,f))
    i=0;tot=0;report=[]
    for yr,model,f in sorted(jobs,key=lambda j:(j[1],j[0])):
        path=os.path.join(pdfdir,f); pdf=pdfplumber.open(path)
        bounds,items=h.columns(pdf)
        rows,prob=h.read(path,model)
        txt={}
        def page(p):
            if p not in txt: txt[p]=re.sub(r'\s+',' ',subprocess.run(['pdftotext','-layout','-f',str(p),'-l',str(p),path,'-'],capture_output=True,text=True).stdout).replace(',','')
            return txt[p]
        kept=[];drop=[]
        for r in rows:
            why=keep(r,model,items is not None)
            if not why:
                nums=re.findall(r'\d+(?:\.\d+)?',str(r[3]).replace(',',''))
                if any(not re.search(r'(?<![\d.])'+re.escape(n)+r'(?![\d])',page(r[0])) for n in nums): why='number not on its page'
            if why: drop.append((why,r[2],r[3])); continue
            p=re.sub(r'^Specifications / (?:Electrical|Spark plug : NGK) / Standard$','Specifications / Electrical / Spark plug, NGK (standard)',r[2])
            p=p.replace('Specifications / Spark plug : NGK / Spark plug gap','Specifications / Electrical / Spark plug gap')
            if re.match(r'Specifications / [^/]*:',p): drop.append(('label swallowed a value or wrapped',r[2],r[3])); continue
            p=re.sub(r'^Front suspension / ','Fork / ',re.sub(r'^Rear suspension / ','Shock absorber / ',p))
            kept.append((r[0],r[1],p,str(r[3]),r[4] or ''))
        ps=[k[2] for k in kept]; dup={p for p in ps if ps.count(p)>1}
        kept=[k for k in kept if k[2] not in dup and '|' not in k[2]+k[3]]
        if not kept: report.append({'model':model,'yr':yr,'rows':0}); continue
        code=re.search(r'_(31\w+?)_',f).group(1).upper()
        lines=sorted((f'{a}|{b}|{c}|{d}|{e}' for a,b,c,d,e in kept),key=lambda l:sha(l.split('|')[2]))
        i+=1; tot+=len(lines)
        json.dump({'make':'Honda','model':model,'yr':yr,'doc':code,'sha':hashlib.sha256(open(path,'rb').read()).hexdigest(),
                   'url':f'https://cdn.powersports.honda.com/documentum/MWOM/{f}',
                   'rev':f"Honda {model} {yr} Owner's Manual & Competition Handbook, publication {code} (US English PDF {f})",
                   'ref':REF.format(code=code),'want':sha('\n'.join(lines)),'n':len(lines),'delta':'\n'.join('+|'+l for l in lines)},
                  open(f'{out}/{i}.json','w'),ensure_ascii=False)
        c={k:sum(x[2].startswith(k) for x in kept) for k in ('Specifications','Fork','Shock absorber','Torque')}
        report.append({'i':i,'model':model,'yr':yr,'file':f,'rows':len(lines),**c,'dropped':len(drop),'drops':drop,'problems':[str(p) for p in prob]})
        print(i,model,yr,len(lines),c,'dropped',len(drop),flush=True)
    json.dump(report,open(out.rstrip('/')+'.report.json','w'),indent=1,ensure_ascii=False)
    print(i,'bike-years',tot,'rows')
if __name__=='__main__': main()
