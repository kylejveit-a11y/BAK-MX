"""Helper for the pre-2020 platform-generation research files (2026-11 knowledge push).
Each pre2020/<name>.py lists compact records and writes docs/research/knowledge/<name>.json in the standard research format."""
import json,os
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
class File:
    def __init__(s,name,prefix,slice_,make,models,years):
        s.name,s.prefix,s.recs,s.n=name,prefix,[],0
        s.head={'slice':slice_,'platform':{'make':make,'models':models,'years':years}}
        s.sources=set();s.conflicts=[];s.not_found=[]
    def src(s,type_,name,url,date): s.sources.add(url); return {'type':type_,'name':name,'url':url,'date':date}
    def R(s,domain,topic,models,years,statement,values,tier,source,conf='medium',notes='',make=None):
        s.n+=1; a={'models':models if isinstance(models,list) else [models],'years':list(years)}
        if make: a['make']=make
        s.recs.append({'id':f'{s.prefix}-{s.n:03d}','domain':domain,'topic':topic,'applies_to':a,'statement':statement,'values':values or {},'tier':tier,'source':source,'confidence':conf,'notes':notes})
    def write(s):
        d=dict(s.head,records=s.recs,conflicts=s.conflicts,not_found=s.not_found,sources=sorted(s.sources))
        json.dump(d,open(os.path.join(root,'docs/research/knowledge',s.name+'.json'),'w'),ensure_ascii=False,indent=1)
        print(s.name,len(s.recs),'records')
