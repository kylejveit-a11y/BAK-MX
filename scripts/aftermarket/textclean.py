"""Rider-facing text from research notes: testers and magazines are never named (their findings read as "testers found"),
internal research references are dropped, and brand strings are normalised to the name riders know."""
import re
NAMES=re.compile(r"\b(Kris Keefer|Keefer Inc\.? Testing|Keefer|Motocross Action \(MXA\)|Motocross Action|MXA|Vital MX|Dirt Bike Test|Dirt Bike magazine|Dirt Bike|Bones Bacon|Cycle News|Racer X|Swapmoto Live|Swapmoto|Transmoto|MotoOnline|Ultimate Motorcycling|Dirt Rider|Dirt Action|PulpMX|Slavens|Teknik)('s)?\b")
# "MXA (Dec 2022): ..." / "Swapmoto Live tester (2020 KTM 450 SX-F): ..." / "Keefer: ..." -> the finding only
SOURCE_PREFIX=re.compile(r"^\s*(?:[A-Z][\w .&'-]{0,40}?)(?:\s*\([^)]{0,80}\))?\s*:\s+")
# research bookkeeping that means nothing to a rider ("see the JT chain entry", "part number format follows ...")
BOOKKEEPING=re.compile(r"\b(see the [^.;]* entry|catalogue search example|part number format|search-result titles?|this entry|the brief|in scope list|cycle gear item number)\b",re.I)
def drop_bookkeeping(s):
    parts=re.split(r'(?<=[.;])\s+(?=[A-Z0-9(])',str(s or ''))
    return ' '.join(p for p in parts if not BOOKKEEPING.search(p)).strip()
def anon(s):
    s=drop_bookkeeping(s)
    s=re.sub(r'\s{2,}',' ',re.sub(r'[^.;]*\b[\w-]+\.json\b[^.;]*[.;]?',' ',s)).strip()   # sentences about our own research files
    m=SOURCE_PREFIX.match(s)
    if m and (NAMES.search(m.group(0)) or re.search(r'\b(tester|forum|thread|owner|review|test)\b',m.group(0),re.I)): s=s[m.end():]
    s=re.sub(r'\s*\((?:[^)]*\b(?:pass-?\d|item|record|id)\b[^)]*)\)','',s,flags=re.I)   # internal research references
    s=re.sub(r'\btesters?( testers?)+\b','testers',NAMES.sub('testers',s))
    s=re.sub(r'(^|[.!?]\s+)testers\b',lambda m:m.group(1)+'Testers',s)
    return s[:1].upper()+s[1:]
def short(s,n):
    s=anon(re.sub(r'\s+',' ',str(s or '')).strip().replace(' at capture',' when checked'))
    return s if len(s)<=n else s[:n-1].rsplit(' ',1)[0]+'…'
# research brand strings -> the name on the box
BRAND_ALIAS={'wpsuspension':'WP','wpprocomponents':'WP','repsuspension':'REP Suspension','showa':'Showa','getathena':'GET','get':'GET',
             'vortexwithfmfexhaust':'Vortex','twisteddevelopmentvortex':'Twisted Development','husqvarnagasgas':'Husqvarna','gasgasktm':'KTM',
             'hondadealer':'Honda','kawasakioemkybmade':'Kawasaki','yamahaoem':'Yamaha','scottsperformancebrp':'Scotts / BRP','brpscottsdamper':'Scotts / BRP',
             'factorychassispartsfcp':'FCP','asvinventions':'ASV','guts':'Guts Racing','nuetechtubliss':'TUbliss','nuetechnitromousse':'Nitro Mousse',
             'r1industriessilberturbos':'R1 Industries','technicaltouchusa':'Technical Touch','enzoracing':'Enzo Racing','haanhubsdidstxorexcela60rims':'Haan Wheels'}
def brand_name(b):
    b=re.sub(r'\s+',' ',str(b or '')).strip()
    k=re.sub(r'[^a-z0-9]','',b.lower()); k2=re.sub(r'[^a-z0-9]','',re.sub(r'\s*\(.*?\)','',b).lower())
    return BRAND_ALIAS.get(k) or BRAND_ALIAS.get(k2) or re.sub(r'\s*\((?!.*\b(?:with|made)\b).*?\)\s*$','',b).strip() or b
# fuel-system specific parts: carburetor jetting only applies to carbureted bikes, injection parts only to injected ones
CARB=re.compile(r'\b(carb(uretor|urettor)?s?|jet ?kits?|jetting|main ?jets?|pilot ?jets?|power ?jet|jet needles?|needles?|float bowl|pwk|mikuni|lectron|keihin pwk|choke)\b',re.I)
INJECTION=re.compile(r'\b(injectors?|fuel injection|injection|throttle body|fuel pump|ecu remap|remap|re-?flash|ecu flash|efi|tbi|tpi|fi calibration|power tuner|connectivity unit)\b',re.I)
