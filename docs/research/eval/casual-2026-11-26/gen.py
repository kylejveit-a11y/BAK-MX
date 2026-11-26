import json,glob,random,re
random.seed(1126)
recs=[]
for f in sorted(glob.glob('/home/claude/bak-mx/docs/research/knowledge/load/push*.json')):
    recs+=json.load(open(f))
def cat(r):
    t=r['topic'].lower(); d=r['domain']
    if 'dyno' in t: return 'power'
    if 'shootout' in t or 'second-opinion' in t or 'third-opinion' in t or 'ranking' in t: return 'shootout'
    if 'used-bike' in t or 'which used' in t or 'used' in t: return 'used'
    if 'jetting' in t: return 'jetting'
    if 'gearing' in t or d=='drivetrain': return 'gearing'
    if 'differ' in t or 'against' in t or ' vs' in t: return 'compare'
    if d=='identity': return 'changes' if re.search(r'updat|redesign|chang|new',t) else 'layout'
    if d=='setups': return 'setup'
    if d=='known_issues': return 'issues'
    if d=='power_feel': return 'feel'
    if d=='ecu_electronics': return 'maps'
    if d=='engine_mods': return 'mods'
    if d=='maintenance': return 'maint'
    return 'handling'
Q={'power':["Just curious, how much power does my bike actually make?","What kind of horsepower numbers does this thing put down on a dyno?","My buddy says his bike makes more power than mine. What does mine really make?"],
'shootout':["How did my bike stack up against the others in its class when it was new?","Was my bike any good compared to the competition that year? What did the magazines think?","Where did my bike land in the shootouts for its year, and why?"],
'used':["I just picked this up used. What should I know about this model year?","Is this a good year of this bike to own? Anything it's known for?"],
'jetting':["What jetting do people usually end up running on this bike?","Is the stock jetting on my bike any good, or do most people change it?"],
'gearing':["What gearing do people like on this bike?","Is the stock gearing right for most riders on my bike?"],
'compare':["How is my bike different from its sister models? I never really understood the lineup.","What sets my bike apart from the motocross version or the other models it's related to?"],
'changes':["What was new on my bike for this model year?","Teach me a little about my bike. What did the factory change this year?"],
'layout':["Tell me about my bike. What's the basic layout and specs I should know?","I'm new to this bike. Give me the rundown on what it is."],
'setup':["What suspension settings did test riders settle on for my bike?","I like learning how other people set these up. What did the testers run for suspension on mine?"],
'issues':["What are the known weak spots on my bike?","Anything this bike is known to wear out or break that I should keep an eye on?"],
'feel':["How would you describe the power delivery on my bike?","What's the engine character like on this bike? How's it best ridden?"],
'maps':["Can you explain the maps and electronics on my bike and when to use each?","What do the different map settings on my bike actually do?"],
'mods':["What mods are actually worth doing on this bike?","If I wanted a little more out of the engine, what really works on my bike?"],
'maint':["How often do people service this bike in the real world?","What's the upkeep like on this bike?"],
'handling':["How does my bike handle? What's it good and bad at?","What's the chassis like on this bike? Any tricks to getting it to feel right?"]}
by={}
for r in recs: by.setdefault(cat(r),[]).append(r)
want={'power':18,'shootout':20,'used':10,'jetting':8,'gearing':5,'compare':12,'changes':14,'layout':8,'setup':16,'issues':14,'feel':10,'maps':5,'mods':4,'maint':2,'handling':8}
out=[];seen=set()
for c,n in want.items():
    pool=by.get(c,[]); random.shuffle(pool); k=0
    for r in pool:
        if k>=n: break
        t=random.choice(r['t']); key=(tuple(t),c)
        if key in seen: continue
        seen.add(key); k+=1
        nums=sorted(set(re.findall(r'\d+(?:\.\d+)?',r['statement'].replace(',',''))),key=len,reverse=True)
        nums=[x for x in nums if len(x.replace('.',''))>=2 and x!=str(t[2]) and not re.fullmatch(r'20[012]\d',x)]
        out.append({'i':len(out),'cat':c,'rid':r['research_id'],'row':r['research_id']+'|'+'|'.join(map(str,t)),'bike':{'manufacturer':t[0],'model':t[1],'model_year':t[2]},'q':random.choice(Q[c]),'topic':r['topic'],'statement':r['statement'],'nums':nums[:8]})
json.dump(out,open('questions.json','w'),indent=1)
print(len(out)); from collections import Counter; print(Counter(o['cat'] for o in out)); print(Counter(o['bike']['manufacturer'] for o in out))
for o in out[:6]: print(o['bike'],o['q'],'|',o['topic'])
