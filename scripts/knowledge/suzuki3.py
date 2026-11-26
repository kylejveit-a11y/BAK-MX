"""Suzuki RM-Z250 and RM-Z450, model years 2010, 2011, 2013 and 2014, from Suzuki Motor Poland's own owner's manuals
(Polish-language editions on suzuki.pl, supplied by the owner 2026-11-26). Only values printed for that year are
used; anything that looked like a misprint or did not read cleanly is left out. Medium confidence because these are
Polish-market editions. usage: python3 scripts/knowledge/suzuki3.py"""
import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File
F=File('suzuki3_rmz_2010_2014','s-z3','Suzuki RM-Z250 and RM-Z450 2010-2014 from Suzuki Poland owner\'s manuals (2026-11)','Suzuki',['RM-Z250','RM-Z450'],[2010,2011,2013,2014])
U={('RM-Z250',2010):'l0/RM-Z250L0.pdf',('RM-Z450',2010):'l0/RM-Z450L0.pdf',('RM-Z250',2011):'l1/RM-Z250L1.pdf',('RM-Z450',2011):'l1/RM-Z450L1.pdf',('RM-Z250',2013):'l3/RM-Z250%20L3.pdf',('RM-Z450',2013):'l3/RM-Z450%20L3.pdf',('RM-Z250',2014):'l4/RM-Z250%20L4.pdf',('RM-Z450',2014):'l4/RM-Z450%20L4.pdf'}
N='Polish-market edition of the owner\'s manual; a US bike can differ in small details.'
VAL="Valve clearance, engine cold: intake 0.09 to 0.16 mm, exhaust 0.17 to 0.24 mm."
D={
 ('RM-Z250',2010):dict(spec="249 cc DOHC four-stroke, 77.0 x 53.6 mm, 13.5:1 compression, fuel injected, kick start, five-speed. Ready-to-ride weight 105 kg (231 lb), seat 955 mm, wheelbase 1,475 mm. Fuel tank 6.5 L. Gear ratios 2.153, 1.764, 1.470, 1.238, 1.090; final gearing 13/49.",
   svc=VAL+" Idle 2,100 plus or minus 50 r/min. Spark plug NGK CR8EIA-10. Engine oil 850 ml at a change, 900 ml with the filter, 1,000 ml after an overhaul. Coolant 950 ml. Chain 114 links, slack 35 to 45 mm. Rear axle nut 90 Nm (66 lb-ft)."),
 ('RM-Z250',2011):dict(spec="249 cc DOHC four-stroke, 77.0 x 53.6 mm, 13.5:1 compression, fuel injected. Seat 955 mm, wheelbase 1,475 mm. Fuel tank 6.5 L. Chain DID 520DMA4, 114 links.",
   svc=VAL+" Spark plug NGK CR8EIA-10. Coolant 950 ml. Chain slack 35 to 45 mm. Rear axle nut 100 Nm (74 lb-ft)."),
 ('RM-Z250',2013):dict(spec="249 cc DOHC four-stroke, 77.0 x 53.6 mm, fuel injected, five-speed. Seat 955 mm, wheelbase 1,475 mm. Chain DID 520DMA4, 114 links. 310 mm of travel at both ends.",
   svc="Chain slack 35 to 45 mm. Rear axle nut 100 Nm (74 lb-ft). The valve clearance figure for this year is not confirmed here."),
 ('RM-Z250',2014):dict(spec="249 cc DOHC four-stroke, 77.0 x 53.6 mm, 13.5:1 compression, fuel injected, kick start, five-speed. Ready-to-ride weight 106.5 kg (235 lb), seat 955 mm, wheelbase 1,475 mm, steering head angle 29 degrees 20 minutes, trail 130 mm. Gear ratios 2.153, 1.764, 1.470, 1.238, 1.090; final gearing 13/49. Chain DID 520DMA4, 114 links.",
   svc=VAL+" Idle 2,100 plus or minus 50 r/min. Chain slack 35 to 45 mm. Rear axle nut 100 Nm (74 lb-ft)."),
 ('RM-Z450',2010):dict(spec="449 cc DOHC four-stroke, 96.0 x 62.1 mm, 12.2:1 compression, fuel injected, kick start, five-speed. Ready-to-ride weight 112 kg (247 lb), seat 955 mm, wheelbase 1,480 mm. Tires 80/100-21 and 110/90-19. Fuel tank 6.2 L. Gear ratios 1.800, 1.471, 1.235, 1.050, 0.909; final gearing 13/50.",
   svc=VAL+" Idle 2,000 plus or minus 100 r/min. Spark plug NGK DIMR8A10. Engine oil 1,050 ml at a change, 1,100 ml with the filter, 1,200 ml after an overhaul. Coolant 950 ml. Chain 114 links, slack 40 to 50 mm. Rear axle nut 100 Nm (74 lb-ft)."),
 ('RM-Z450',2011):dict(spec="449 cc DOHC four-stroke, 96.0 x 62.1 mm, 12.5:1 compression, fuel injected. Seat 955 mm, wheelbase 1,480 mm. Fuel tank 6.2 L. Chain DID 520MXV4, 114 links.",
   svc=VAL+" Spark plug NGK DIMR8A10. Engine oil 1,050 ml at a change. Coolant 950 ml. Chain slack 40 to 50 mm. Rear axle nut 100 Nm (74 lb-ft). Tire pressure 70 to 110 kPa (10 to 16 psi) cold. Compression 400 kPa (58 psi) or more with the automatic decompressor working."),
 ('RM-Z450',2013):dict(spec="449 cc DOHC four-stroke, 96.0 x 62.1 mm, fuel injected, five-speed. Seat 955 mm, wheelbase 1,495 mm. Chain DID 520MXV4, 114 links. 310 mm of travel at both ends.",
   svc=VAL+" Chain slack 40 to 50 mm. Rear axle nut 100 Nm (74 lb-ft). Tire pressure 70 to 110 kPa (10 to 16 psi) cold. Compression 300 kPa (43 psi) or more with the automatic decompressor working."),
 ('RM-Z450',2014):dict(spec="449 cc DOHC four-stroke, 96.0 x 62.1 mm, 12.5:1 compression, fuel injected, kick start, five-speed. Ready-to-ride weight 112 kg (247 lb), seat 955 mm, wheelbase 1,495 mm, steering head angle 29 degrees 40 minutes, trail 125 mm. Gear ratios 1.800, 1.470, 1.235, 1.050, 0.909; final gearing 13/50. Chain DID 520MXV4, 114 links.",
   svc=VAL+" Idle 2,100 plus or minus 50 r/min. Spark plug NGK DIMR8A10, tightened to 11 Nm. Engine oil SAE 10W-40 JASO MA: 1,050 ml at a change, 1,100 ml with the filter, 1,200 ml after an overhaul; drain plug 12 Nm. Coolant 1,100 ml. Chain slack 40 to 50 mm. Rear axle nut 100 Nm (74 lb-ft). Spoke nipples 6 Nm; rim lock 14 Nm front, 17 Nm rear. Tire pressure 70 to 110 kPa (10 to 16 psi) cold. Compression 300 kPa (43 psi) or more with the automatic decompressor working. Oil pressure 50 kPa at 4,000 r/min with oil at 50 C."),
}
for (m,y),d in sorted(D.items(),key=lambda x:(x[0][1],x[0][0])):
    s=F.src('manufacturer',f"Suzuki {y} {m} owner's manual, Suzuki Motor Poland edition",'https://suzuki.pl/old-pdf/moto/instrukcje/'+U[(m,y)],str(y-1))
    F.R('identity',f'{m} {y} engine, size and gearing',[m],[y],f"The {y} {m}: "+d['spec'],{},'OEM',s,'medium',N)
    F.R('maintenance',f'{m} {y} service values',[m],[y],f"Service values for the {y} {m}. "+d['svc'],{},'OEM',s,'medium',N)
F.write()
