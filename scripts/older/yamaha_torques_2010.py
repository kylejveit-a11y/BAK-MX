"""Tightening torques of the 2010-2013 Yamaha four-stroke Owner's Service Manuals (YZ250F, YZ450F, WR250F, WR450F).

Their chapter-2 tables have the columns Part to be tightened | Thread size | Q'ty | Tightening torque Nm | m•kg | ft•lb, ruled
per row, under ENGINE / CHASSIS / ELECTRICAL headings; the torque-check mark is a "△" printed left of the table. Each N·m value
must agree with the m•kg (N·m / 10 or / 9.80665) and ft•lb on its row (yamaha_torques.conv_ok); "Refer to TIP." rows and rows
of any other shape are left out. Same row format as yamaha_torques.py.
usage: yamaha_torques_2010.py manual.pdf"""
import re,sys,os,pdfplumber
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','manual-textlayer'))
from yamaha_torques import conv_ok,MARK,join_lines
SEC={'ENGINE':'Engine','CHASSIS':'Chassis','ELECTRICAL':'Electrical'}
def read(path):
    pdf=pdfplumber.open(path); out=[]; problems=[]; seen=False; section=None
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(x_tolerance=1.5,y_tolerance=2)
        if 'TIGHTENING TORQUES' not in ' '.join(w['text'] for w in ws if w['top']<30):
            if seen: break
            continue
        printed=next((w['text'] for w in ws if re.fullmatch(r'\d-\d+',w['text']) and w['top']>700),'?')
        heads=sorted((w['top'],SEC[w['text']]) for w in ws if w['text'] in SEC and w['x0']<80 and 40<w['top']<760)
        marks=[w for w in ws if w['text'].startswith('△') and w['x0']<70]
        for t in pg.find_tables():
            rows=t.extract(); cells=t.rows
            if not rows or not any(r and r[0]=='Part to be tightened' for r in rows): continue
            seen=True
            hs=[s for y,s in heads if y<t.bbox[1]]
            if hs: section=hs[-1]
            for r,c in zip(rows,cells):
                if not r or len(r)!=6 or r[0] in (None,'Part to be tightened'): continue
                item,thread,qty,nm,kg,lb=[join_lines((x or '').replace('•','·')) for x in r]
                if not (item and thread and re.fullmatch(r'\d+',qty) and re.fullmatch(r'\d+(\.\d+)?',nm) and kg and lb):
                    problems.append(('shape',pi+1,r)); continue
                if not conv_ok(nm,kg,lb): problems.append(('conversion mismatch',pi+1,item,nm,kg,lb)); continue
                if section is None: problems.append(('no section',pi+1,item)); continue
                y0,y1=c.bbox[1],c.bbox[3]
                rem=[MARK] if any(y0-2<=(m['top']+m['bottom'])/2<=y1+2 for m in marks) else []
                detail=f'{thread}, qty {qty}'+('; remark: '+', '.join(rem) if rem else '')
                p=f'Tightening torques / {section} / {item} ({detail})'
                if '|' in p: continue
                out.append((pi+1,printed,p,nm,'N·m'))
        if heads: section=heads[-1][1]
    paths=[o[2] for o in out]; dup={p for p in paths if paths.count(p)>1}
    for p in dup: problems.append(('same path',p,sorted({o[3] for o in out if o[2]==p})))
    keep=[];sp=set()
    for o in out:
        if o[2] in dup and (len({x[3] for x in out if x[2]==o[2]})>1 or o[2] in sp): continue
        sp.add(o[2]); keep.append(o)
    return keep,problems
if __name__=='__main__':
    o,p=read(sys.argv[1]); print('PROBLEMS',p)
    for x in o: print(x)
    print(len(o),'rows')
