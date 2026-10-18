"""Deep bike knowledge research files -> per bike-year rows for public.bike_knowledge.

usage: python3 scripts/knowledge/build_rows.py OUT.json
Reads docs/research/knowledge/*.json (platform-generation research, see BIKE_KNOWLEDGE_STANDARD.md), expands each
record to every roster bike-year it applies to, validates enums and writes the row list. Records that apply to no roster
bike are reported, not loaded. Ids are stable: <record id>|<model>|<year>."""
import json,glob,os,re,sys,collections
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
roster={(a,b,c) for a,b,c in json.load(open(os.path.join(root,'docs/research/aftermarket/roster-2020-2027.json')))}
# The Garage offers some bikes before 2020 (e.g. 2018-19 YZ450F); its confirmed years are part of the roster too.
_gm=open(os.path.join(root,'shared/garage-models.ts')).read()
for _k,_ys in json.loads(re.search(r'const confirmedYears[^=]*=(\{.*?\});\n',_gm).group(1)).items():
    _mk,_md=_k.split('|',1);roster|={(_mk,_md,_y) for _y in _ys}
DOMAINS={'identity','engine_architecture','power_feel','ecu_electronics','engine_mods','chassis','suspension','drivetrain','maintenance','known_issues','setups'}
TIERS={'OEM','MEASURED','TUNER','DERIVED','COMMUNITY'};CONF={'high','medium','low'}
# Rider-facing text never names testers, magazines or tuners (the source field keeps them for audit).
MAG=r"MXA|Motocross Action|Dirt Rider|Dirt Bike(?: Magazine)?|Vital(?: MX)?|Racer X|Cycle News|Cycle World|ADB|Australasian Dirt Bike|Swapmoto|Ultimate Motorcycling|MotoOnline|Transworld Motocross|Moto Related|MX Large|Motorcycle\.com|Enduro21|MCNews|MCN|Bike Review|PulpMX|Transmoto|1000PS|Off-Road\.cc|Dirt Bike Test|BikeSocial|Motorcyclist|RideApart|Cycle Trader|Motorcycle Cruiser|ThumperTalk|KTMTalk|DirtBikeWorld|Dirt Bike Test|Vital MX forum"
TUN=r"Pro Circuit|Race Tech|Twisted Development|Twisted|XPR|Slavens|Factory Connection|REP|Enzo|GYTR tuners?"
PER=r"Keefer|Stevie|Jeff Emig|Travis Preston"
# Official manufacturer collaborations are product facts, not tester attributions (Triumph's RC Edition and Carmichael map).
KEEP=re.compile(r"Carmichael",re.I)
def anon(t,src=None):
    t=str(t)
    # Whatever name the row's own source carries is hidden too (shops and channels not in the lists above).
    for n in [x.strip() for x in re.split(r'[;/,()]| and | - | by | for | via ',str((src or {}).get('name','')))]:
        if str((src or {}).get('type','')) in ('calculation','manufacturer'):break  # our own working and OEM names are not testers
        if len(n)>=4 and n[:1].isupper() and not KEEP.search(n) and n.lower() not in ('owner','owners','forum','yamaha','ktm','honda','kawasaki','husqvarna','gasgas','triumph'):
            word={'magazine':'a magazine','tuner':'a tuner','race team':'a race team','forum':'owners','dealer':'a dealer'}.get(str((src or {}).get('type','')),'a tester')
            t=re.sub(r"\b"+re.escape(n)+r"(?:'s)?\b",word,t)
    for pat,word in ((MAG,'a magazine'),(TUN,'a tuner'),(PER,'a tester')):
        t=re.sub(r"\b(?:the )?(?:"+pat+r")(?:'s)?\b",word,t)
    t=re.sub(r"\b(a|an) a (magazine|tuner|tester)\b",r"a \2",t)
    t=re.sub(r"\b([Aa]) (magazine|tuner|tester)((?: dyno| test)?) (?:a|A) \2\b",r"\1 \2\3",t)
    t=re.sub(r"\ba (magazine|tuner)( and a \1)+\b",r"\1s",t)
    t=re.sub(r"\b[Aa] magazine (testers|editors|riders)\b",r"magazine \1",t)
    t=re.sub(r"\bfrom a tuner\)",'from a tuner)',t)
    return re.sub(r"(^|[.!?]\s+)a (magazine|tuner|tester|dealer|race team)",lambda m:m.group(1)+"A "+m.group(2),t)
rows=[];skipped=collections.Counter();seen=set()
for f in sorted(glob.glob(os.path.join(root,'docs/research/knowledge/*.json'))):
    d=json.load(open(f));make=d['platform']['make']
    for r in d['records']:
        dom,tier,conf=r.get('domain'),r.get('tier'),r.get('confidence','medium')
        if dom not in DOMAINS or tier not in TIERS or conf not in CONF or not str(r.get('statement','')).strip():skipped['invalid']+=1;continue
        a=r.get('applies_to') or {};rmake=a.get('make') or make
        makes=rmake if isinstance(rmake,list) else [rmake]  # multi-brand record: each bare model name belongs to whichever listed brand has it
        rmake=makes[0] if makes else make
        rosterModels={(a2,b2) for a2,b2,c2 in roster}
        hit=0
        # 'general' records (principles that hold for every engine in the file) apply to all of the file's platform models.
        models=[m for x in (a.get('models') or []) for m in ((d['platform'].get('models') or []) if x=='general' else [x])]
        # A fact that names another model of the same file (e.g. a YZ250X record comparing it with the YZ250) also belongs to that model.
        text=str(r.get('statement',''))+' '+str(r.get('topic',''))
        for pm in d['platform'].get('models') or []:
            short=re.sub(r'^(KTM|Husqvarna|GasGas|Yamaha|Honda|Kawasaki|Triumph) ','',pm)
            if pm not in models and re.search(r'(?<![A-Za-z0-9])'+re.escape(short)+r'(?![A-Za-z0-9-])',text):models.append(pm)
        for model0 in models:
            mk,model=next((m for m in makes if (m,model0) in rosterModels),rmake),model0
            # Sister bikes listed by model name only (e.g. 'FC 450' in a KTM file) belong to their own brand.
            if re.match(r'(FC|FE|FX|TC|TE|TX) ',model0):mk='Husqvarna'
            elif re.match(r'(MC|EX|EC) ',model0):mk='GasGas'
            for brand in ('Husqvarna','GasGas','KTM','Yamaha','Honda','Kawasaki','Triumph','Suzuki'):
                if model0.startswith(brand+' '):mk,model=brand,model0[len(brand)+1:]
            for y in (a.get('years') or d['platform'].get('years') or []):
                if (mk,model,y) not in roster:continue
                rid=f"{r['id']}|{mk}|{model}|{y}"
                if rid in seen:continue
                seen.add(rid);hit+=1
                src=r.get('source') or {}
                rows.append({'id':rid,'manufacturer':mk,'model':model,'model_year':y,'domain':dom,'topic':anon(r.get('topic',''),r.get('source'))[:120],
                  'statement':anon(r['statement'],r.get('source'))[:1200],'vals':r.get('values') or {},'tier':tier,'confidence':conf,'notes':anon(r.get('notes',''),r.get('source'))[:800],
                  'source':{'type':src.get('type',''),'name':src.get('name',''),'url':src.get('url',''),'date':src.get('date','')},'research_id':r['id'],'status':'HELD' if r.get('status')=='HELD' else 'APPROVED'})  # HELD: unverified fitment years etc.
        if not hit:skipped['no roster bike']+=1
json.dump(rows,open(sys.argv[1],'w'),ensure_ascii=False)
print(len(rows),'rows',dict(collections.Counter(r['domain'] for r in rows)),dict(collections.Counter(r['tier'] for r in rows)),'skipped',dict(skipped))
