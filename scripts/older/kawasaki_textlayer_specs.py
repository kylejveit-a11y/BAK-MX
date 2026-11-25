"""Specifications and tightening torques from the e-book text layer (search.xml) of Kawasaki KX250F / KX450F owner's manuals 2014-2019.

Companion to kawasaki_textlayer_older.py (damper settings). The text layer has every space removed, so a value is only taken
when its shape and an independent check agree; anything else is skipped and reported (fail closed).
- Specification tables (dimensions, engine, transmission, frame, tyres, fork oil): the printed label list must be on the page in
  the expected order, the value list must match the block's shape exactly once, and every metric/imperial pair must convert
  (mm-in, kg-lb, L-gal/qt, mL-oz), every gear ratio must equal its tooth counts, and the overall ratio must equal
  primary x final x top gear.
- Torque table: fastener names are split only at known fastener words and every name must be in the known list; the N.m and
  kgf.m columns are printed as two unbroken digit strings, which are split jointly so that every pair converts
  (kgf.m = N.m / 9.80665, to the printed precision). The split must be unique and the count must equal the number of names.
- Inline "Tightening Torque <fastener>: n N.m (k kgf.m, x in.lb|ft.lb)": all three units must agree. A fastener printed with two
  different values in one manual is dropped, and so is a value whose label pairing is unclear (two labels ahead of two values).
Locator: e-book page and the printed page (e-book page minus the two cover pages, confirmed against the page footer).
- Service values (mode 'service'): idle speed, valve clearance, free play, chain slack and length, tyre pressure, plug gap, air-fork chamber
  pressures; each is anchored on its own sentence or single-value box and unit-checked.
usage: kawasaki_textlayer_specs.py <list.tsv: year model code file folder> <xml dir> <out dir> [service]"""
import re,sys,os,json,hashlib,itertools
h=lambda s:hashlib.sha256(s.encode()).hexdigest()
IN=25.4;LB=0.45359237;GAL=3.785411784;QT=0.946352946;OZ=29.5735296;KGF=9.80665
def near(a,b,dec):                                    # b is the printed conversion, with `dec` decimals; allow one unit of the last place
    return abs(a-b)<=10**-dec+1e-9
def dec(s): return len(s.split('.')[1]) if '.' in s else 0
def conv(metric,imp,f):                               # metric/f should print as imp
    return near(float(metric)/f,float(imp),dec(imp))
def printed(p,t,word):
    n=str(int(p)-2)
    return n if (n+word in t or word+n in t) else '?'
MMIN=r'([\d.]+)mm\(([\d.]+)in\.\)'
DIM=re.compile(MMIN*5+r'([\d.]+)kg\(([\d.]+)lb\)(\d\.\d)L\((\d\.\d)USgal\)')
ENG=re.compile(r'(4-stroke,DOHC,single-cylinder,liquid-cooled)(\d\d\.\d)×(\d\d\.\d)mm\((\d\.\d\d)×(\d\.\d\d)in\.\)(\d{3})cm³\((\d\d\.\d)cuin\.\)(\d\d\.\d):1'
               r'(FI\(FuelInjection\))(Primarykick|Electricstarter)(DigitalDC-CDI)(\d{1,2})°BTDC@(\d{4})r/min\(rpm\)(Forcedlubrication\(semi-drysump\))(NGK[A-Z0-9-]+?)(Solid-post)')
G=r'(\d\.\d{3})\((\d\d)/(\d\d)\)'
TRN=re.compile(r'(5-speed,constant-?mesh,returnshift)(Wet,multidisc)(Chaindrive)'+G*7+r'(\d{1,2}\.\d{3})(?:@Topgear|atTopgear|\(Topgear\))'
               r'(APISG,SH,SJ,SLorSMwithJASOMA,MA1orMA2)(SAE10W-40)(\d\.\d)L\((\d\.\d)USqt\)')
FRM=re.compile(r'(Tubular,semi-doublecradle)(\d\d)°toeitherside(\d\d\.\d)°'+MMIN)
ML=r'(\d{1,3})mL\(([\d.]+)USoz\.\)'
TIR=re.compile(r'(80/100-21)(\d\dM)/(DUNLOP|BRIDGESTONE)([A-Z0-9]+?)(1[0-2]0/[89]0-19)(\d\dM)/(DUNLOP|BRIDGESTONE)([A-Z0-9]+?)(21×1\.60)(19×\d\.\d\d)'
               r'(Telescopicfork\(upside-down\))(NewUni-trak®swingarm)'+MMIN*2+r'(KawasakiForkOil)([A-Z]{1,3}\d{2}(?:-\d\d)?)(?=\d{2,3}mL)')
FORK=[('Amount(LeftFrontFork):CylinderUnitOuterTubeAmount(RightFrontFork)',re.compile(ML*3),
       ['Amount (Left Front Fork) / Cylinder Unit','Amount (Left Front Fork) / Outer Tube','Amount (Right Front Fork)']),
      ('Amount:LeftFrontFork:CylinderUnitOuterTubeRightFrontFork:CylinderUnitOuterTubeBalanceChamber',re.compile(ML*5),
       ['Amount / Left Front Fork / Cylinder Unit','Amount / Left Front Fork / Outer Tube','Amount / Right Front Fork / Cylinder Unit',
        'Amount / Right Front Fork / Outer Tube','Amount / Right Front Fork / Balance Chamber']),
      ('Amount:CylinderUnitOuterTubeType',re.compile(ML*2),['Amount / Cylinder Unit','Amount / Outer Tube'])]
SPACE={'4-stroke,DOHC,single-cylinder,liquid-cooled':'4-stroke, DOHC, single-cylinder, liquid-cooled','FI(FuelInjection)':'FI (Fuel Injection)',
       'Primarykick':'Primary kick','Electricstarter':'Electric starter','DigitalDC-CDI':'Digital DC-CDI',
       'Forcedlubrication(semi-drysump)':'Forced lubrication (semi-dry sump)','5-speed,constantmesh,returnshift':'5-speed, constant mesh, return shift',
       'Wet,multidisc':'Wet, multi disc','Chaindrive':'Chain drive','APISG,SH,SJ,SLorSMwithJASOMA,MA1orMA2':'API SG, SH, SJ, SL or SM with JASO MA, MA1 or MA2',
       'SAE10W-40':'SAE 10W-40','Tubular,semi-doublecradle':'Tubular, semi-double cradle','Telescopicfork(upside-down)':'Telescopic fork (upside-down)',
       'NewUni-trak®swingarm':'New Uni-trak® swingarm','KawasakiForkOil':'Kawasaki Fork Oil'}
def one(rx,t,notes,what,p):
    m=rx.findall(t)
    if len(m)!=1: notes.append((what,'not exactly one match',p,len(m))); return None
    return rx.search(t).groups()
def specs(P,notes):
    out=[]
    def add(p,path,val): out.append((int(p),printed(p,P[p],'SPECIFICATIONS'),path,val))
    for p,t in P.items():
        if int(p)>16 or 'SPECIFICATIONS' not in t: continue
        if 'OverallLengthOverallWidthOverallHeightWheelbaseRoadClearanceCurbMassFuelTankCapacity' in t:
            g=one(DIM,t,notes,'dimensions',p)
            if g:
                for i,n,f,u,v in zip((0,2,4,6,8,10,12),('Overall Length','Overall Width','Overall Height','Wheelbase','Road Clearance','Curb Mass','Fuel Tank Capacity'),
                                     (IN,IN,IN,IN,IN,LB,GAL),('mm','mm','mm','mm','mm','kg','L'),('in.','in.','in.','in.','in.','lb','US gal')):
                    if conv(g[i],g[i+1],f): add(p,'Dimensions / '+n,f'{g[i]} {u} ({g[i+1]} {v})')
                    else: notes.append(('dimension pair does not convert, skipped',p,n,g[i],g[i+1]))
        if 'TypeBore×StrokeDisplacementCompressionRatioFuelSystemStartingSystemIgnitionSystemIgnitionTimingLubricationSystemSparkPlugSparkPlugTerminal' in t:
            g=one(ENG,t,notes,'engine',p)
            if g:
                ok=conv(g[1],g[3],IN) and conv(g[2],g[4],IN) and conv(g[5],g[6],16.387064)
                if not ok: notes.append(('engine conversion',p,g))
                else:
                    add(p,'Engine / Type',SPACE[g[0]]); add(p,'Engine / Bore x Stroke',f'{g[1]} x {g[2]} mm ({g[3]} x {g[4]} in.)')
                    add(p,'Engine / Displacement',f'{g[5]} cm³ ({g[6]} cu in.)'); add(p,'Engine / Compression Ratio',f'{g[7]}:1')
                    add(p,'Engine / Fuel System',SPACE[g[8]]); add(p,'Engine / Starting System',SPACE[g[9]]); add(p,'Engine / Ignition System',SPACE[g[10]])
                    add(p,'Engine / Ignition Timing',f'{g[11]}° BTDC @{g[12]} r/min (rpm)'); add(p,'Engine / Lubrication System',SPACE[g[13]])
                    add(p,'Engine / Spark Plug','NGK '+g[14][3:]); add(p,'Engine / Spark Plug Terminal',g[15])
        if 'TransmissionTypeClutchTypeDrivingSystemGearRatio:1st2nd3rd4th5thPrimaryReductionRatioFinalReductionRatioOverallDriveRatioEngineOil:TypeViscosityCapacity' in t:
            g=one(TRN,t,notes,'transmission',p)
            if g:
                r=[(g[3+3*i],g[4+3*i],g[5+3*i]) for i in range(7)]
                ok=all(abs(int(a)/int(b)-float(v))<0.00101 for v,a,b in r) and abs(float(r[4][0])*float(r[5][0])*float(r[6][0])-float(g[24]))<0.012 and conv(g[27],g[28],QT)
                if not ok: notes.append(('transmission check',p,g))
                else:
                    add(p,'Transmission / Transmission Type','5-speed, constant mesh, return shift'); add(p,'Transmission / Clutch Type',SPACE[g[1]]); add(p,'Transmission / Driving System',SPACE[g[2]])
                    for (v,a,b),n in zip(r,('Gear Ratio / 1st','Gear Ratio / 2nd','Gear Ratio / 3rd','Gear Ratio / 4th','Gear Ratio / 5th','Primary Reduction Ratio','Final Reduction Ratio')):
                        add(p,'Transmission / '+n,f'{v} ({a}/{b})')
                    add(p,'Transmission / Overall Drive Ratio',f'{g[24]} @Top gear'); add(p,'Transmission / Engine Oil / Type',SPACE[g[25]])
                    add(p,'Transmission / Engine Oil / Viscosity',SPACE[g[26]]); add(p,'Transmission / Engine Oil / Capacity',f'{g[27]} L ({g[28]} US qt)')
        if 'FRAMETypeSteeringAngleCasterTrail' in t:
            g=one(FRM,t,notes,'frame',p)
            if g:
                if not conv(g[3],g[4],IN): notes.append(('frame conversion',p,g))
                else:
                    add(p,'Frame / Type',SPACE[g[0]]); add(p,'Frame / Steering Angle',f'{g[1]}° to either side'); add(p,'Frame / Caster',f'{g[2]}°'); add(p,'Frame / Trail',f'{g[3]} mm ({g[4]} in.)')
        if 'TireSize/Type:FrontRearRimSize:FrontRearSuspension:FrontRearFrontSuspensionTravelRearWheelTravelFrontForkOil:Type' in t:
            g=one(TIR,t,notes,'tyres',p)
            if g:
                if not (conv(g[12],g[13],IN) and conv(g[14],g[15],IN)): notes.append(('travel conversion',p,g))
                else:
                    add(p,'Frame / Tire Size/Type / Front',f'{g[0]} {g[1]}/{g[2]} {g[3]}'); add(p,'Frame / Tire Size/Type / Rear',f'{g[4]} {g[5]}/{g[6]} {g[7]}')
                    add(p,'Frame / Rim Size / Front',g[8].replace('×',' x ')); add(p,'Frame / Rim Size / Rear',g[9].replace('×',' x '))
                    add(p,'Frame / Suspension / Front',SPACE[g[10]]); add(p,'Frame / Suspension / Rear',SPACE[g[11]])
                    add(p,'Frame / Front Suspension Travel',f'{g[12]} mm ({g[13]} in.)'); add(p,'Frame / Rear Wheel Travel',f'{g[14]} mm ({g[15]} in.)')
                    add(p,'Frame / Front Fork Oil / Type',f'Kawasaki Fork Oil {g[17]}')
                    tail=t[TIR.search(t).end():]
                    for lab,rx,names in FORK:
                        if lab in t:
                            m=rx.match(tail)
                            if not m or not all(conv(m.group(2*i+1),m.group(2*i+2),OZ) for i in range(len(names))): notes.append(('fork oil amounts',p,tail[:80]))
                            else:
                                for i,n in enumerate(names): add(p,'Frame / Front Fork Oil / '+n,f'{m.group(2*i+1)} mL ({m.group(2*i+2)} US oz.)')
                            break
                    else:
                        m=re.match(r'(\d{3})mL\(([\d.]+)USoz\.\)(\d{3})∼(\d{3})mL\(([\d.]+)∼([\d.]+)USoz\.\)',tail)
                        if 'Amount(PerForkLeg):InnerDamperInner/OuterTubes' in t and m and conv(m[1],m[2],OZ) and conv(m[3],m[5],OZ) and conv(m[4],m[6],OZ):
                            add(p,'Frame / Front Fork Oil / Amount (Per Fork Leg) / Inner Damper',f'{m[1]} mL ({m[2]} US oz.)')
                            add(p,'Frame / Front Fork Oil / Amount (Per Fork Leg) / Inner/Outer Tubes',f'{m[3]} ∼ {m[4]} mL ({m[5]} ∼ {m[6]} US oz.)')
                        else: notes.append(('fork oil layout not read',p))
                    if 'BRAKESTireSize' in t or 'Type:FrontRear' in t:
                        if t.count('SinglediscSingledisc')==1: add(p,'Brakes / Type / Front','Single disc'); add(p,'Brakes / Type / Rear','Single disc')
    return out
KNOWN=['Clutch Master Cylinder Clamp Bolts','Front Axle Clamp Bolts','Front Axle Nut','Rear Axle Nut','Spoke Nipples','Rear Sprocket Nuts','Brake Pedal Bolt',
       'Front Brake Disc Mounting Bolts','Front Caliper Mounting Bolts','Front Master Cylinder Clamp Bolts','Rear Brake Disc Mounting Bolts',
       'Rear Master Cylinder Mounting Bolts','Front Fork Clamp Bolts (Lower)','Front Fork Clamp Bolts (Upper)','Rear Shock Absorber Nut (Lower)',
       'Rear Shock Absorber Nut (Upper)','Rocker Arm Pivot Nut','Swingarm Pivot Shaft Nut','Tie-Rod Mounting Nuts','Handlebar Clamp Bolts',
       'Handlebar Holder Nuts','Steering Stem Head Nut','Steering Stem Nut','Rear Frame Mounting Bolts','Rear Frame Mounting Bolt']
def words(s): return re.sub(r'(?<=[a-z\)])(?=[A-Z\(])',' ',s)
NM=re.compile(r'\d{1,3}(?:\.\d)?'); KG=re.compile(r'\d{1,2}(?:\.\d{1,2})?')
def kgok(n,k):
    d=dec(k); return (d>0 or float(k)>=10) and abs(float(n)/KGF-float(k))<=0.5*10**-d+0.0011      # printed precision
def split(a,b,k):
    """All ways to cut digit strings a (N.m) and b (kgf.m) into k numbers each with every pair converting."""
    sols=[]
    def go(i,j,acc):
        if len(sols)>1: return
        if len(acc)==k:
            if i==len(a) and j==len(b): sols.append(list(acc))
            return
        for la in range(1,6):
            n=a[i:i+la]
            if len(n)<la or not NM.fullmatch(n) or (len(n)>1 and n[0]=='0' and n[1]!='.'): continue
            for lb in range(1,6):
                kk=b[j:j+lb]
                if len(kk)<lb or not KG.fullmatch(kk) or (len(kk)>1 and kk[0]=='0' and kk[1]!='.') or not kgok(n,kk): continue
                acc.append((n,kk)); go(i+la,j+lb,acc); acc.pop()
    go(0,0,[]); return sols
def table(P,notes):
    out=[]
    for p,t in P.items():
        if 'FastenerRemarks' not in t and not ('Fastener' in t and 'Remarks' in t and 'kgf·m' in t): continue
        m=re.search(r'((?:[A-Z][A-Za-z-]+?(?:Bolts?|Nuts?|Nipples)(?:\((?:Lower|Upper)\))?)+)(?=N·m|AL:)',t)
        a=re.search(r'N·m([\d.]+?)(?=kgf·m|\d\din·lb|[A-Z]|$)',t); b=re.search(r'kgf·m([\d.]+?)(?=ft·lb|\d\din·lb|[A-Z]|$)',t)
        if not (m and a and b): notes.append(('torque table not read',p)); continue
        names=[re.sub(r'^(Fastener )?(Remarks )?','',words(x)) for x in re.findall(r'[A-Z][A-Za-z-]+?(?:Bolts?|Nuts?|Nipples)(?:\((?:Lower|Upper)\))?(?=[A-Z]|$)',m.group(1))]
        bad=[n for n in names if n not in KNOWN]
        if bad: notes.append(('unknown fastener',p,bad)); continue
        # the N.m string can run into the first in.lb figure; try every prefix length and keep it only if exactly one works
        A=re.search(r'N·m([\d.]+)',t).group(1); B=re.search(r'kgf·m([\d.]+)',t).group(1); found=[]
        for ea in range(len(A),0,-1):
            for eb in range(len(B),0,-1):
                if len(A)-ea>3 or len(B)-eb>3: continue
                s=split(A[:ea],B[:eb],len(names))
                if s: found.append((ea,eb,s))
        full=[f for f in found if f[0]==len(A) and f[1]==len(B)]
        pick=full if full else found
        if len(pick)!=1 or len(pick[0][2])!=1: notes.append(('torque table split not unique',p,len(names),A,B,[(f[0],f[1],len(f[2])) for f in found])); continue
        for n,(nm,kg) in zip(names,pick[0][2][0]): out.append((int(p),printed(p,t,'MAINTENANCEANDADJUSTMENT'),'Torque table / '+n,f'{nm} N·m ({kg} kgf·m)'))
    return out
INL=re.compile(r'([A-Z][A-Za-z\-()]*?):(\d{1,3}(?:\.\d)?)N·m\((\d{1,2}(?:\.\d{1,2})?)kgf·m,(\d{1,3}(?:\.\d)?)(in|ft)·lb\)')
def inline(P,notes):
    out=[]
    for p,t in P.items():
        for m in re.finditer(r'(?:TighteningTorque|(?<=lb\)))((?:[A-Z][A-Za-z\-]*(?:\((?:[A-Z][a-z]+)\))?)+):(\d{1,3}(?:\.\d)?)N·m\((\d{1,2}(?:\.\d{1,2})?)kgf·m,(\d{1,4}(?:\.\d)?)(in|ft)·lb\)',t):
            name,nm,kg,im,u=m.groups()
            # two labels printed ahead of two values lose their pairing in the text layer: skip a value that follows an empty label or is followed by a bare value
            if t[:m.start()].endswith(':') or re.match(r'\d{1,3}(?:\.\d)?N·m\(',t[m.end():]): notes.append(('inline torque pairing unclear, skipped',p,name)); continue
            if 'TighteningTorque' in name: name=name.split('TighteningTorque')[-1]
            f=8.850746 if u=='in' else 0.7375621
            if not kgok(nm,kg) or abs(float(nm)*f-float(im))>0.5*10**-dec(im)+0.02*float(im): notes.append(('inline torque units disagree',p,m.group(0))); continue
            out.append((int(p),printed(p,t,'MAINTENANCEANDADJUSTMENT'),'Tightening torque (procedure) / '+words(name),f'{nm} N·m ({kg} kgf·m, {im} {u}·lb)'))
    return out
KPA=98.0665;PSI=6.894757
def service(P,notes):
    """Service values printed in sentences or single-value boxes; each has its own anchor and unit check."""
    out=[]
    def add(p,t,path,val): out.append((int(p),printed(p,t,'MAINTENANCEANDADJUSTMENT'),path,val))
    R=lambda a,b,c,d,f: conv(a,c,f) and conv(b,d,f)
    for p,t0 in P.items():
        if int(p)<20: continue
        t=t0.replace('','~').replace('∼','~')
        for m in re.finditer(r'adjusttheidlespeed(\d{4})~(\d{4})r/min\(rpm\)',t): add(p,t0,'Engine / Idle speed',f'{m[1]} ∼ {m[2]} r/min (rpm)')
        if 'StandardValveClearance' in t:
            v=list(re.finditer(r'(0\.\d\d)~(0\.\d\d)mm\((0\.\d{4})~(0\.\d{4})in\.\)',t))
            if len(v)==2 and t[:v[0].start()].endswith('Exhaust') and (t[:v[1].start()].endswith('Intake') or t[v[1].end():].startswith('Intake')) and all(R(*x.groups(),IN) for x in v):
                add(p,t0,'Valve clearance / Exhaust (standard)',f'{v[0][1]} ∼ {v[0][2]} mm ({v[0][3]} ∼ {v[0][4]} in.)'); add(p,t0,'Valve clearance / Intake (standard)',f'{v[1][1]} ∼ {v[1][2]} mm ({v[1][3]} ∼ {v[1][4]} in.)')
            else: notes.append(('valve clearance not read',p))
        for m in re.finditer(r'A\.ClutchLeverB\.AdjusterC\.(\d{1,2})~(\d{1,2})mm\((\d\.\d)~(\d\.\d)in\.\)',t):
            if R(*m.groups(),IN): add(p,t0,'Clutch / Lever free play',f'{m[1]} ∼ {m[2]} mm ({m[3]} ∼ {m[4]} in.)')
        for m in re.finditer(r'throttlegriphas(\d)~(\d)mm\((0\.\d\d)~(0\.\d\d)in\.\)ofplay',t):
            if R(*m.groups(),IN): add(p,t0,'Throttle / Grip free play',f'{m[1]} ∼ {m[2]} mm ({m[3]} ∼ {m[4]} in.)')
        for m in re.finditer(r'adjustthechainslack\(measuredbetweenthechainandtheswingarm\)to(\d\d)~(\d\d)mm\((\d\.\d)~(\d\.\d)in\.\)',t):
            if R(*m.groups(),IN) and 'muddyconditions' in t[max(0,m.start()-300):m.start()]: add(p,t0,'Drive chain / Slack for wet and muddy conditions',f'{m[1]} ∼ {m[2]} mm ({m[3]} ∼ {m[4]} in.), measured between the chain and the swingarm')
        if 'shouldbewithinthestandardvalue' in t and 'chainslack' in t:
            v=list(re.finditer(r'(?<![\d.])(\d\d)~(\d\d)mm\((\d\.\d)~(\d\.\d)in\.\)',t))
            if len(v)==1 and R(*v[0].groups(),IN): add(p,t0,'Drive chain / Slack (standard)',f'{v[0][1]} ∼ {v[0][2]} mm ({v[0][3]} ∼ {v[0][4]} in.), between the chain and the swingarm')
            else: notes.append(('chain slack not read',p,len(v)))
        for m in re.finditer(r'(\d{3}\.\d)~(\d{3}\.\d)mm\((\d\d\.\d\d)~(\d\d\.\d\d)in\.\)StandardServiceLimit(\d{3})mm\((\d\d\.\d)in\.\)',t):
            if '20-link' in t.lower().replace('link','-link').replace('--','-') or '20link' in t.lower():
                if R(m[1],m[2],m[3],m[4],IN) and conv(m[5],m[6],IN):
                    add(p,t0,'Drive chain / 20-link length (standard)',f'{m[1]} ∼ {m[2]} mm ({m[3]} ∼ {m[4]} in.)'); add(p,t0,'Drive chain / 20-link length (service limit)',f'{m[5]} mm ({m[6]} in.)')
        if 'TireAirPressure' in t:
            v=list(re.finditer(r'(\d{2,3})~(\d{2,3})kPa\((\d\.\d)~(\d\.\d)kgf/cm²,(\d\d)~(\d\d)psi\)',t))
            if len(v)==1 and R(v[0][1],v[0][2],v[0][3],v[0][4],KPA) and R(v[0][1],v[0][2],v[0][5],v[0][6],PSI): add(p,t0,'Tires / Air pressure adjustable range',f'{v[0][1]} ∼ {v[0][2]} kPa ({v[0][3]} ∼ {v[0][4]} kgf/cm², {v[0][5]} ∼ {v[0][6]} psi), checked cold')
            else: notes.append(('tire pressure not read',p,len(v)))
        if 'SparkPlugGap' in t:
            v=list(re.finditer(r'(0\.\d)~(0\.\d)mm\((0\.0\d{1,2})~(0\.0\d{1,2})in\.\)',t))
            if len(v)==1 and R(*v[0].groups(),IN): add(p,t0,'Engine / Spark plug gap',f'{v[0][1]} ∼ {v[0][2]} mm ({v[0][3]} ∼ {v[0][4]} in.)')
            else: notes.append(('spark plug gap not read',p,len(v)))
        ch=re.findall(r'(Inner|Outer|Balance)ChamberAirPressureAirPressure\(Standard[Ss]etting\)AdjustableRange',t)
        if len(ch)==1:
            std=list(re.finditer(r'(?<![~\d])(?<!\d\.)(\d{2,4})kPa\((\d{1,2}\.\d\d)kgf/cm²,(\d{2,3}(?:\.\d)?)psi\)',t)); rng=list(re.finditer(r'(?<![\d.])(\d{1,4})~(\d{3,4})kPa\(([\d.]+)~([\d.]+)kgf/cm²',t))
            if len(std)==1 and conv(std[0][1],std[0][2],KPA) and conv(std[0][1],std[0][3],PSI):
                add(p,t0,f'Fork / {ch[0]} chamber air pressure / Standard setting',f'{std[0][1]} kPa ({std[0][2]} kgf/cm², {std[0][3]} psi)')
                if len(rng)==1 and R(*rng[0].groups(),KPA) and float(rng[0][1])<=float(std[0][1])<=float(rng[0][2]): add(p,t0,f'Fork / {ch[0]} chamber air pressure / Adjustable range',f'{rng[0][1]} ∼ {rng[0][2]} kPa ({rng[0][3]} ∼ {rng[0][4]} kgf/cm²)')
            else: notes.append(('air chamber not read',p,ch,len(std)))
    return out
def rows(xml,mode='specs'):
    notes=[]; P=dict(re.findall(r'<text page="(\d+)"[^>]*><!\[CDATA\[(.*?)\]\]></text>',xml,re.S))
    out=service(P,notes) if mode=='service' else specs(P,notes)+table(P,notes)+inline(P,notes)
    seen={}
    for o in out: seen.setdefault(o[2],set()).add(o[3])
    clash=sorted(k for k,v in seen.items() if len(v)>1)
    if clash: notes.append(('printed with two values, dropped',clash))
    keep={};
    for o in out:
        if o[2] not in clash and o[2] not in keep: keep[o[2]]=o
    return list(keep.values()),notes
if __name__=='__main__':
    lst,xd,od=sys.argv[1:4]; mode=sys.argv[4] if len(sys.argv)>4 else 'specs'; os.makedirs(od,exist_ok=True); i=0
    for l in open(lst):
        y,m,code,f,folder=l.rstrip('\n').split('\t')[:5]
        if not folder or not y.isdigit(): continue
        raw=open(f'{xd}/{y}-{m}.xml','rb').read(); r,notes=rows(raw.decode('utf-8'),mode)
        model={'KX250F':'KX250','KX450F':'KX450'}.get(m,m)
        lines=sorted((f'{p}|{pr}|{a}|{v}|' for p,pr,a,v in r),key=lambda x:h(x.split('|')[2]))
        print(y,m,len(r),'unpaged',sum(1 for x in r if x[1]=='?'),notes)
        if not r: continue
        i+=1
        json.dump({'make':'Kawasaki','model':model,'yr':int(y),'doc':f,'sha':hashlib.sha256(raw).hexdigest(),
                   'url':f'https://pws.ktivs.net/dispeBook?file={f}&lang_code=EN',
                   'rev':f"Kawasaki {m} owner's manual {f} (US English e-book); text layer https://pws.ktivs.net/assets/{folder}/search.xml",
                   'ref':f'docs/research/older/kawasaki-2014-2019/SPECS.md; {f}; e-book text layer, shape and unit-conversion checked, fail-closed.',
                   'want':h('\n'.join(lines)),'n':len(lines),'delta':'\n'.join('+|'+x for x in lines)},open(f'{od}/{i}.json','w'),ensure_ascii=False)
