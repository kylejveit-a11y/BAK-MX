"""Honda CRF250R / CRF450R 2010-2016 ECM pinouts, read by eye from the wiring diagram page of each year's
owner's manual (owner-supplied 2026-11-26). Every one of the 14 diagrams was looked at; they fall into three
groups that read the same. Medium confidence; pages are not stored. usage: python3 scripts/knowledge/wiring8.py"""
import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File
F=File('wiring8_honda_2010_2016','w-h4','Honda CRF250R/CRF450R 2010-2016 ECM pinouts (wiring pass 2026-11)','Honda',['CRF250R','CRF450R'],list(range(2010,2017)))
COL={'Bl':'black','Y':'yellow','Bu':'blue','G':'green','R':'red','W':'white','Br':'brown','O':'orange','Lg':'light green','P':'pink','Gr':'gray'}
MEAN={'IG':'ignition coil','PG':'power ground','INJ':'fuel injector','LG':'logic ground','PCP1':'No.1 crank position sensor','PCP2':'No.2 crank position sensor','PCM':'crank sensor ground','TA':'intake air temperature signal','VCC':'5 V sensor supply','WARN':'warning light (MIL)','ENG STOP':'engine stop switch','TW':'coolant temperature signal','SG':'sensor ground','IGP':'power in','INJ-V':'injector supply','K-LINE':'diagnostic line','SCS':'service check','PB':'intake pressure (MAP) signal','TH':'throttle position signal','MODE SW':'mode select button','MODE LED':'mode indicator light'}
A=[(1,'IG','Y/Bu'),(2,'PG','G'),(5,'INJ','Bl/Bu'),(6,'LG','G/P'),(7,'PCP2','W/Y'),(9,'TA','Gr/Bu'),(10,'PCM','G/W'),(11,'PCP1','Bu/Y'),(12,'PG','G'),(14,'VCC','R/Y'),(15,'WARN','W/Bu'),(19,'ENG STOP','Bl/W'),(20,'TW','P'),(22,'SG','G/R'),(23,'IGP','Bl'),(24,'INJ-V','P/Y'),(25,'K-LINE','O/Bl'),(27,'SCS','Br'),(32,'PB','Lg/Y'),(33,'TH','Y/G')]
B=[(1,'IG','Y/Bu'),(5,'INJ','Bl/Bu'),(6,'LG','G/W'),(9,'TA','Gr/Bu'),(11,'PCP1','Bu/Y'),(12,'PG','G/W'),(14,'VCC','R/Y'),(18,'WARN','W/Bu'),(19,'ENG STOP','Bl/W'),(20,'TW','P'),(22,'SG','G/R'),(23,'IGP','Bl'),(24,'INJ-V','P/Y'),(25,'K-LINE','O/Bl'),(27,'SCS','Br'),(29,'PCP2','W/Y'),(32,'PB','Lg/Y'),(33,'TH','Y/G')]
C=sorted(B+[(7,'MODE LED','W/G'),(21,'MODE SW','Lg')])
def col(c): return '/'.join(COL[x] for x in c.split('/'))
for years,pins,extra in (([2010,2011,2012],A,''),([2013,2014],B,''),([2015,2016],C," The mode select button's own wires are red and light green; pushing it joins the two.")):
    s=F.src('manufacturer',f"Honda CRF250R and CRF450R owner's manuals {years[0]}-{years[-1]}, wiring diagram pages",'https://powersports.honda.com/downloads/owners-manuals',str(years[-1]))
    parts='; '.join(f"{n} {sig} ({MEAN[sig]}), {col(c)}" for n,sig,c in pins)
    F.R('ecu_electronics','ECM connector pinout',['CRF250R','CRF450R'],years,
        f"ECM 33-pin connector on the {years[0]}-{years[-1]} CRF250R and CRF450R, as pin, Honda's signal label and wire colour: {parts}. Pins not listed are empty. Wire colours are base/stripe. The engine stop switch joins black/white to red/yellow when pushed.{extra}",
        {str(n):f"{sig} {c}" for n,sig,c in pins},'OEM',s,'medium','Read from the wiring diagram by eye; check the diagram on the bike before cutting, splicing or back-probing.')
    g=lambda k:' and '.join(dict.fromkeys(col(c) for n,sig,c in pins if sig==k))
    F.R('ecu_electronics','Sensor and switch wire colours at the ECM',['CRF250R','CRF450R'],years,
        f"Wire colours at the ECM on the {years[0]}-{years[-1]} CRF250R and CRF450R: 5 V sensor supply {g('VCC')}; sensor ground {g('SG')}; throttle position signal {g('TH')}; intake pressure signal {g('PB')}; intake air temperature signal {g('TA')}; coolant temperature signal {g('TW')}; No.1 crank sensor {g('PCP1')}; No.2 crank sensor {g('PCP2')}; fuel injector {g('INJ')} with {g('INJ-V')} supply; ignition coil {g('IG')}; engine stop switch {g('ENG STOP')}; warning light {g('WARN')}; diagnostic line {g('K-LINE')}. The throttle and intake pressure sensors share the 5 V supply and the sensor ground; the two temperature sensors return on the sensor ground. Honda's colour letters: Bl black, Y yellow, Bu blue, G green, R red, W white, Br brown, O orange, Lb light blue, Lg light green, P pink, Gr gray.",
        {},'OEM',s,'medium','Derived from the ECM pin labels on the wiring diagram.')
F.write()
