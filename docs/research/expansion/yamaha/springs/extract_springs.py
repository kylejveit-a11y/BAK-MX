"""Yamaha owner's service manuals -> fork and shock spring facts (standard rate, the optional rates Yamaha lists with
part numbers, fork oil standard amount and adjustment range). Reads the setting-parts pages column by column with
pdftotext so the two-column layout doesn't mix. Writes springs.json beside this file. Nothing here touches a database.
usage: python3 extract_springs.py <dir with Yamaha OSM PDFs named MODEL_YEAR_CODE.pdf>"""
import glob,hashlib,json,os,re,subprocess,sys
HERE=os.path.dirname(os.path.abspath(__file__))
def page_texts(pdf):
    t=subprocess.run(['pdftotext','-layout',pdf,'-'],capture_output=True,text=True).stdout.split('\f');return t
def col(pdf,p,x):
    return subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-x',str(x),'-y','0','-W','306','-H','792','-layout',pdf,'-'],capture_output=True,text=True).stdout
PN=r'[0-9A-Z]{3}-[0-9A-Z]{5}-[0-9A-Z]{2}'
out=[]
for pdf in sorted(glob.glob(os.path.join(sys.argv[1],'*.pdf'))):
    name=os.path.basename(pdf)[:-4];model,year,code=name.split('_')[0],int(name.split('_')[1]),name.split('_',2)[2]
    sha=hashlib.sha256(open(pdf,'rb').read()).hexdigest()
    pages=page_texts(pdf);rec={'model':model,'model_year':year,'code':code,'sha256':sha,'front':None,'rear':None,'notes':[]}
    for heading,key in (('FRONT FORK SETTING PARTS','front'),('REAR SHOCK ABSORBER SETTING PARTS','rear')):
        hits=[i+1 for i,p in enumerate(pages) if heading in p]
        for p in hits:
            for x in (0,306):
                c=col(pdf,p,x)
                if heading not in c:continue
                body=c.split(heading,1)[1]
                body=re.split(r'\n\s*TIP\b',body)[0]
                m=re.search(r'STD spring rate\s+(?:\(?N/mm\)?\s+)?([0-9]+(?:\.[0-9]+)?)',body,re.I)
                if not m: continue
                std=float(m.group(1))
                rates=[]
                if key=='front':
                    for r in re.finditer(r'^\s*(?:SOFT|STIFF)?\s*([0-9]\.[0-9]{1,2})\s+('+PN+r'\*?)',body,re.M):rates.append({'rate':float(r.group(1)),'part_number':r.group(2).rstrip('*')})
                else:
                    seen=[]
                    for r in re.finditer(r'^\s*(?:SOFT|STIFF)?\s*([0-9]{2}(?:\.[0-9])?)\s*(?:$|\s{2,}|'+PN+')',body,re.M):
                        v=float(r.group(1))
                        if 20<=v<=90 and v not in seen:seen.append(v)
                    rates=[{'rate':v} for v in seen]
                if key=='rear' and not rates:
                    other=col(pdf,p,306 if x==0 else 0)
                    if re.search(PN,other):
                        seen=[]
                        for r in re.finditer(r'^\s*(?:SOFT|STIFF)?\s*([0-9]{2}(?:\.[0-9])?)\s*(?:$|\s{2,}|'+PN+')',other.split('TIP')[0],re.M):
                            v=float(r.group(1))
                            if 30<=v<=80 and v not in seen:seen.append(v)
                        rates=[{'rate':v} for v in seen]
                if key=='rear':rates=sorted(rates,key=lambda o:o['rate'])
                rec[key]={'std_rate_n_mm':std,'options':rates,'pdf_page':p}
                break
            if rec[key]:break
    # fork oil standard amount + range (per fork leg, as the manual states)
    full='\n'.join(pages)
    m=re.search(r'Standard oil amount\s+([0-9]{3})\s*cm³[^\n]*\n(?:.*\n){0,2}?\s*Extent of adjustment\s+([0-9]{3})[–-]([0-9]{3})\s*cm³',full)
    if m:rec['fork_oil']={'standard_cm3':int(m.group(1)),'range_cm3':[int(m.group(2)),int(m.group(3))]}
    out.append(rec);print(model,year,rec['front'] and rec['front']['std_rate_n_mm'],rec['front'] and len(rec['front']['options']),rec['rear'] and rec['rear']['std_rate_n_mm'],rec['rear'] and [o['rate'] for o in rec['rear']['options']],rec.get('fork_oil'))
json.dump(out,open(os.path.join(HERE,'springs.json'),'w'),indent=1)
