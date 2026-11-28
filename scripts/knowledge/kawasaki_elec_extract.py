"""Electrical facts from Kawasaki's KX owner's manual text layers (the e-book search text, no spaces between words):
ignition system and timing, spark plug, gap and terminal, battery, main fuse, DFI service (blink) codes, launch control
and the DFI setting connectors. Each field is taken only where its labelled pattern is found; anything else stays absent.
usage: python3 scripts/knowledge/kawasaki_elec_extract.py DIR [DIR...] > docs/research/electrical/kawasaki-electrical.json"""
import re,sys,os,json,glob,collections
YR=dict(zip('EFGHJKLMNPRSTV',range(2014,2028)));YR.update({'D':2013})
def pages(f):
    t=open(f,errors='ignore').read()
    return [(int(n),re.sub(r'<!\[CDATA\[|\]\]>|<[^>]+>','',p)) for n,p in re.findall(r'<text page="(\d+)"[^>]*>(.*?)</text>',t,re.S)]
def one(f):
    P=pages(f);A=''.join(x for _,x in P);o={'file':os.path.basename(f)}
    m=re.search(r'o5(kx\d+)([a-z])([a-z])f?-',o['file'].lower()) or re.search(r'o5(kx\d+)([a-z])([a-z])',o['file'].lower())
    if m:o['code']=(m.group(1)+m.group(2)).upper();o['year']=YR.get(m.group(3).upper())
    m=re.match(r'(\d{4})-(KX\d+)F?\.xml',o['file'])
    if m:o['year']=int(m.group(1));o['code']=m.group(2)+'_'
    names=collections.Counter(re.findall(r'KX\d{2,3}[FX]?(?=[^0-9A-Za-z]|[A-Z][a-z])',A[:6000]+A[-3000:]));o['names']=names.most_common(3)
    spec=A
    m=re.search(r'(DigitalDC-CDI|DigitalCDI|CDI)((?:\d+°BTDC@\d+r/min\(rpm\))+)',A)
    if m:o['ignition']=m.group(1);o['timing']=re.findall(r'\d+°BTDC@\d+r/min\(rpm\)',m.group(2))
    m=re.search(r'NGK([A-Z]+\d+[A-Z0-9]*?(?:-\d+)?)(Solid-post|Screw[a-z-]*|Stud[a-z-]*|Threaded[a-z-]*|Solid[a-z-]*)',A)
    if m:o['plug']='NGK '+m.group(1);o['terminal']=m.group(2)
    m=re.search(r'(\d+(?:\.\d)?V\d+(?:\.\d)?Ah(?:\(10HR\))?,?(?:Lithium-ionbattery)?)',A)
    if m:o['battery']=m.group(1)
    for mm in re.finditer('SparkPlugGap',A):
        x=A[mm.start():mm.start()+520]
        g=re.findall(r'(\d\.\d{1,3}?)[–-]?(\d\.\d{1,3})mm\((\d\.\d{2,3}?)[–-]?(\d\.\d{2,3})in\.\)',x)
        names=re.search(r'SparkPlugGap((?:(?:NGK)?[A-Z]+\d+[A-Z0-9]*(?:-\d+)?){1,3}?)(?=A\.Gap|If|\d\.\d)',x)
        if g:o['gaps']=[f"{a}-{b} mm ({c}-{d} in)" for a,b,c,d in g];o['gap_plugs']=names.group(1) if names else None;break
    m=re.search(r'TighteningTorqueSparkPlug:(\d+(?:\.\d)?N·m\([^)]*\))',A)
    if m:o['plug_torque']=m.group(1)
    m=re.search(r'Colder(NGK[A-Z]+\d+[A-Z0-9]*-\d+|NGK[A-Z]+\d+[A-Z]*)',A)
    if m:o['colder_plug']=m.group(1)
    o['main_fuse_a']=sorted(set(int(x) for x in re.findall(r'[Mm]ainfuse(\d+)A',A)))
    o['acc_fuse_a']=sorted(set(int(x) for x in re.findall(r'[Aa]ccessoryfuse(\d+)A',A)))
    m=re.search(r'(Themainfuse[^.]*\.)',A)
    if m:o['fuse_where']=m.group(1)
    m=re.search(r'Chargingvoltage(\d+\.\dVto\d+\.\dV)',A)
    if m:o['charge_v']=m.group(1)
    m=re.search(r'Chargingcurrent(\d+(?:\.\d)?A)',A)
    if m:o['charge_a']=m.group(1)
    codes=[]
    for _,x in P:
        if 'ServiceCode' in x and ('malfunction' in x or 'abnormal' in x) and 'Problems' in x:
            probs=re.findall(r'([A-Z][A-Za-z/-]+?(?:malfunction,wiringopenorshort|voltageabnormal|malfunction(?!,)))',x)
            m=re.search(r'(?<![\d.])((?:\d\d){%d,%d})(\d[A-F])?(?![\d.])'%(max(1,len(probs)-1),len(probs)),x)
            nums=(re.findall(r'\d\d',m.group(1))+([m.group(2)] if m.group(2) else [])) if m else []
            codes.append({'nums':nums,'probs':probs})
    o['codes']=codes
    m=re.search(r'EngineSpeed\(r/min(?:\(rpm\)\))?(\d+)[–-](\d{4,5}?)(\d{4,5})ormore',A)
    if m:o['launch']=(m.group(1),m.group(2),m.group(3))
    o['has_launch']='LaunchControlMode' in A;o['has_ktrc']='KTRC' in A;o['has_app']='RIDEOLOGY' in A;o['has_powermode']='PowerMode' in A
    o['dfi_couplers']=bool(re.search(r'DFISettingDataSelection',A)) and bool(re.search(r'WhiteGreenBlack|GreenWhiteBlack|GreenBlackWhite',A))
    o['coupler_where']=(re.search(r'Changetheconnector(onthe[a-z]+)tosuit',A) or [None,None])[1]
    o['fi_cal_kit']='KXFICalibration' in A
    o['siblings']=sorted(set(re.findall(r'KX(?:450[KN]|252[DF]|250X|450X|112[AB]?)',A)))
    o['acc_conn']='ElectricAccessoryConnectors' in A
    o['kick']='Kickpedal' in A or 'kickpedal' in A or 'Primarykick' in A;o['estart']='Electricstarter' in spec
    return o
out=[one(f) for d in sys.argv[1:] for f in sorted(glob.glob(os.path.join(d,'*.xml')))]
json.dump(out,sys.stdout,ensure_ascii=False,indent=1)
