"""Deep bike knowledge research files -> per bike-year rows for public.bike_knowledge.

usage: python3 scripts/knowledge/build_rows.py OUT.json
Reads docs/research/knowledge/*.json (platform-generation research, see BIKE_KNOWLEDGE_STANDARD.md), expands each
record to every roster bike-year it applies to, validates enums and writes the row list. Records that apply to no roster
bike are reported, not loaded. Ids are stable: <record id>|<model>|<year>."""
import json,glob,os,re,sys,collections
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
roster={(a,b,c) for a,b,c in json.load(open(os.path.join(root,'docs/research/aftermarket/roster-2020-2027.json')))}
DOMAINS={'identity','engine_architecture','power_feel','ecu_electronics','engine_mods','chassis','suspension','drivetrain','maintenance','known_issues','setups'}
TIERS={'OEM','MEASURED','TUNER','DERIVED','COMMUNITY'};CONF={'high','medium','low'}
# Rider-facing text never names testers, magazines or tuners (the source field keeps them for audit).
MAG=r"MXA|Motocross Action|Dirt Rider|Dirt Bike(?: Magazine)?|Vital(?: MX)?|Racer X|Cycle News|Cycle World|ADB|Australasian Dirt Bike|Swapmoto|Ultimate Motorcycling|MotoOnline|Transworld Motocross|Moto Related|MX Large|Motorcycle\.com"
TUN=r"Pro Circuit|Race Tech|Twisted Development|Twisted|XPR|Slavens|Factory Connection|REP|Enzo|GYTR tuners?"
PER=r"Keefer|Stevie|Jeff Emig|Ricky Carmichael|Travis Preston"
def anon(t):
    t=str(t)
    for pat,word in ((MAG,'a magazine'),(TUN,'a tuner'),(PER,'a tester')):
        t=re.sub(r"\b(?:the )?(?:"+pat+r")(?:'s)?\b",word,t)
    t=re.sub(r"\b(a|an) a (magazine|tuner|tester)\b",r"a \2",t)
    t=re.sub(r"\ba (magazine|tuner)( and a \1)+\b",r"\1s",t)
    t=re.sub(r"\b[Aa] magazine (testers|editors|riders)\b",r"magazine \1",t)
    t=re.sub(r"\bfrom a tuner\)",'from a tuner)',t)
    return re.sub(r"(^|[.!?]\s+)a (magazine|tuner|tester)",lambda m:m.group(1)+'A '+m.group(2),t)
rows=[];skipped=collections.Counter();seen=set()
for f in sorted(glob.glob(os.path.join(root,'docs/research/knowledge/*.json'))):
    d=json.load(open(f));make=d['platform']['make']
    for r in d['records']:
        dom,tier,conf=r.get('domain'),r.get('tier'),r.get('confidence','medium')
        if dom not in DOMAINS or tier not in TIERS or conf not in CONF or not str(r.get('statement','')).strip():skipped['invalid']+=1;continue
        a=r.get('applies_to') or {};rmake=a.get('make') or make
        hit=0
        for model0 in a.get('models') or []:
            mk,model=rmake,model0
            for brand in ('Husqvarna','GasGas','KTM','Yamaha','Honda','Kawasaki','Triumph','Suzuki'):
                if model0.startswith(brand+' '):mk,model=brand,model0[len(brand)+1:]
            for y in a.get('years') or []:
                if (mk,model,y) not in roster:continue
                rid=f"{r['id']}|{mk}|{model}|{y}"
                if rid in seen:continue
                seen.add(rid);hit+=1
                src=r.get('source') or {}
                rows.append({'id':rid,'manufacturer':mk,'model':model,'model_year':y,'domain':dom,'topic':anon(r.get('topic',''))[:120],
                  'statement':anon(r['statement'])[:1200],'vals':r.get('values') or {},'tier':tier,'confidence':conf,'notes':anon(r.get('notes',''))[:800],
                  'source':{'type':src.get('type',''),'name':src.get('name',''),'url':src.get('url',''),'date':src.get('date','')},'research_id':r['id'],'status':'APPROVED'})
        if not hit:skipped['no roster bike']+=1
json.dump(rows,open(sys.argv[1],'w'),ensure_ascii=False)
print(len(rows),'rows',dict(collections.Counter(r['domain'] for r in rows)),dict(collections.Counter(r['tier'] for r in rows)),'skipped',dict(skipped))
