"""Apply the damper cross-check to staged payloads and write the final numbered load set.
usage: finalize_payloads.py <stage dir with per-document folders, *.report.json and *.dampers> <out dir>"""
import sys,json,glob,hashlib,os,re
def h(s): return hashlib.sha256(s.encode()).hexdigest()
src,out=sys.argv[1:3]; os.makedirs(out,exist_ok=True)
unconf={}
for f in glob.glob(src+'/*.dampers'):
    for l in open(f):
        j=json.loads(l); unconf[(j['make'],j['model'],j['yr'])]=[g for g,_ in j['unconfirmed']]
reports={}
for f in glob.glob(src+'/*.report.json'):
    for r in json.load(open(f)): reports[(r['make'],r['model'],int(r['yr']))]=r
i=0; summary=[]
for f in sorted(glob.glob(src+'/*/*.json')):
    j=json.load(open(f)); key=(j['make'],j['model'],j['yr']); rep=reports[key]
    if len(rep['dropped'])>10: summary.append({'make':j['make'],'model':j['model'],'yr':j['yr'],'doc':j['doc'],'skipped':'%d paths printed with two values; variants not separable'%len(rep['dropped'])}); continue
    rows=[l[2:].split('|') for l in j['delta'].split('\n')]
    groups={}
    for r in rows:
        m=re.match(r'^(.*damping) / (Comfort|Standard|Sport)$',r[2])
        if m: groups.setdefault(m.group(1),set()).add(m.group(2))
    bad={g for g,s in groups.items() if len(s)<3}|set(unconf.get(key,[]))
    keep=[r for r in rows if not any(r[2].startswith(g+' / ') for g in bad)]
    lines=['|'.join(r) for r in sorted(keep,key=lambda r:h(r[2]))]
    j.update(want=h('\n'.join(lines)),delta='\n'.join('+|'+l for l in lines),n=len(keep))
    json.dump(j,open(f'{out}/{i}.json','w'),ensure_ascii=False)
    summary.append({'i':i,'make':j['make'],'model':j['model'],'yr':j['yr'],'doc':j['doc'],'n':len(keep),'sched':sum(1 for r in keep if r[2].startswith('Service')),'damp':sum(1 for r in keep if re.search(r'damping / (Comfort|Standard|Sport)$',r[2])),'damper_groups_withheld':sorted(bad),'conflicts_dropped':len(rep['dropped']),'flagged_dropped':len(rep['flagged'])}); i+=1
json.dump(summary,open(out+'.summary.json','w'),indent=1)
print(i,'payloads',sum(s.get('n',0) for s in summary),'rows; skipped',[ (s['model'],s['yr']) for s in summary if 'skipped' in s],'; withheld groups',sum(len(s.get('damper_groups_withheld',[])) for s in summary))
