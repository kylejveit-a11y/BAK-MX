"""Triumph scheduled-maintenance payloads for stage_manual_rows (empty base; the handbook's specification rows are already on file).
usage: build_triumph_schedule.py jobs.txt pdfdir outdir
jobs.txt: MODEL|YEAR|DOCID|REV|REF2   (DOCID = Triumph technical-information document id; REV/REF2 as already on file for the bike)"""
import hashlib,json,os,sys
sys.path.insert(0,os.path.dirname(__file__))
import triumph_schedule
REF=('docs/research/expansion/triumph/HANDBOOK_REVIEW_2026-10-13.md;{ref2}; public US owner\'s handbook fetched from Triumph\'s '
     'technical-information site and hashed; Scheduled Maintenance Table read from the document text layer (grid rules, bullet marks, '
     'column headings); no same-scope value on file to conflict.')
os.makedirs(sys.argv[3],exist_ok=True); n=0; cache={}
for line in open(sys.argv[1]):
    if not line.strip(): continue
    model,yr,doc,rev,ref2=line.rstrip('\n').split('|')
    path=f'{sys.argv[2]}/{doc}.pdf'
    if doc not in cache:
        cache[doc]=(hashlib.sha256(open(path,'rb').read()).hexdigest(),)+triumph_schedule.parse(path)
    sha,rows,problems=cache[doc]
    paths=[r[2] for r in rows]
    if problems or len(paths)!=len(set(paths)) or len(rows)<40: print('SKIP',model,yr,doc,problems,len(rows)); continue
    lines=[f'{p}|{pr}|{path}|{v}|' for p,pr,path,v in rows]
    lines.sort(key=lambda l: hashlib.sha256(l.split('|')[2].encode()).hexdigest())
    want=hashlib.sha256('\n'.join(lines).encode()).hexdigest(); n+=1
    json.dump({'make':'Triumph','model':model,'yr':int(yr),'url':f'https://api.triumphtechnicalinformation.com/handbooks/documents/{doc}/pdf','sha':sha,'rev':rev,
               'ref':REF.format(ref2=ref2),'want':want,'n':len(lines),'delta':'\n'.join('+|'+l for l in lines)},open(f'{sys.argv[3]}/{n}.json','w'))
    print(model,yr,doc,len(lines))
print('payloads',n)
