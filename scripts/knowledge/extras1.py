"""2025 KTM 450 SX-F: engine, electrical and fuelling replacement options, what is dealer-only, and setting-shim sizes.
From a parts workbook the owner supplied 2026-11-26 (a third-party catalog review). KTM numbers were checked against BAK's
own factory parts list for this bike; the aftermarket listings were not re-checked on the makers' pages, so they stay low
or medium confidence. usage: python3 scripts/knowledge/extras1.py"""
import sys,os,json
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File
F=File('extras1_ktm450_2025','x-e1','2025 KTM 450 SX-F replacement-part options and setting shims (owner-supplied catalog review, 2026-11)','KTM',['450 SX-F'],[2025])
R=F.R;M=['450 SX-F'];Y=[2025]
def S(url): return F.src('dealer','Parts catalog review supplied by the owner',url,'2026-11-26')
NOTE='Listing as recorded in a November 2026 catalog review; confirm fitment on the seller page before ordering.'
R('maintenance','Engine and chassis parts with no aftermarket replacement (dealer only)',M,Y,
 "For the 2025 450 SX-F a November 2026 review of maker and retailer catalogs found no aftermarket replacement for these, so they come from a KTM dealer: the complete crankshaft, the matched engine case set, the balancer shaft, the shift drum, shift forks and shafts, the gearbox mainshaft, countershaft and gears, the oil pump rotors and drive, the main frame and subframe, and the main wiring harness. Protective covers and guards exist for the cases and frame but do not replace them. That is a finding from one search, not proof that nothing exists.",
 {'ktm_numbers':{'crankshaft_complete':'A48030018000','engine_case_complete':'A48030000044','balancer_shaft':'A48030057000 / 79430057101','shift_drum_5_speed':'A47034012000','main_shaft_complete':'A47033001000','countershaft':'79333010000','frame':'A46003001200C1','subframe':'A46003002000','main_harness':'A46011075100'}},
 'DERIVED',S('https://www.bunburyktm.com.au/partFinder/fiche/ktm/2025/450-sx-f-us/crankshaft-piston'),'low','KTM numbers match the factory parts list BAK holds for this bike.')
R('maintenance','Crank, water pump and cam chain tensioner service parts',M,Y,
 "Aftermarket service options listed for the 2025 450 SX-F: a connecting rod kit (ProX 03.6436) that rebuilds the existing crank rather than replacing it; a water pump rebuild kit (Vertex 821011), whose listing does not show a new pump shaft; and a manual cam chain tensioner (Tokyomods 15-014) in place of the automatic one. A manual tensioner has to be set and re-checked by hand. No aftermarket valve guide or valve spring was found listed for this year; the nearest guide kit stops at 2018.",
 {'conrod_kit':'ProX 03.6436','ktm_conrod_repair_kit':'79530015044','water_pump_kit':'Vertex 821011','ktm_water_pump_kit':'79435055015','ktm_pump_shaft_seal':'0760123073','ktm_pump_rotor':'81235055020','manual_tensioner':'Tokyomods 15-014','ktm_tensioner':'59036003000','ktm_valve_spring':'78936028000'},
 'COMMUNITY',S('https://www.cyclegear.com/parts/pro-x-connecting-rod-kit-ktm-husqvarna-gas-gas-450cc-2016-2025'),'low',NOTE)
R('engine_mods','Big-bore kits: 470, 480 and 500 cc',M,Y,
 "Three big-bore routes are listed for the 450 SX-F engine. A 470 cc piston, cam and gasket kit uses a 97 mm piston and needs your own cylinder machined and re-plated. A 480 cc kit comes with a new 98 mm cylinder, piston and gaskets, and its maker says no case work is needed. A 500 cc kit comes with a 100 mm cylinder and needs the cases bored, and its maker recommends a larger injector. All three need mapping to suit, and none is legal for 450-class racing.",
 {'470_kit':'Daniel Crower Racing KTM-SXF-BBK, 97 mm piston, customer cylinder machined and plated','480_kit':'Geisick Performance, 98 mm cylinder included, no case modification stated','500_kit':'Geisick Performance, 100 mm cylinder included, case boring required','ktm_cylinder_and_piston':'A48030038000'},
 'TUNER',S('https://www.geisickperformance.com/product-page/ktm-gas-gas-husqvarna-500cc-big-bore-kit'),'low',NOTE+' The 480 and 500 kits are published for the KTM 450 family from 2016 on, not for this year by name.')
R('engine_mods','Race cylinder head, second injector and throttle body options',M,Y,
 "Listed engine-top and fuelling upgrades for this engine: a CNC race-prepared cylinder head sold head-only for 2022.5 to 2025 (you supply or buy valves, springs, retainers and seals, and it needs an ECU setup to match); a second-injector kit sold with a modified airbox, fuel feed and a mapped aftermarket ECU; a 700 cc/min primary injector for modified engines; an insert-and-valve kit that modifies the stock throttle body; and an aluminium fuel rail that reuses the stock hose and hardware. A billet twin-injector throttle body is marketed for 2019 to 2025 KTM 450s, but the listing does not confirm the standard SX-F or its wiring. No ready-to-fit complete aftermarket head was found.",
 {'ktm_cylinder_head_complete':'A48036020044','ktm_injector':'79041023144','ktm_fuel_pipe':'79041013044','ktm_throttle_body':'A46041001000'},
 'TUNER',S('https://www.td-racing.com/products/2023-24-ktm-450sxf-race-head-head-only'),'low',NOTE)
R('ecu_electronics','Charging and ignition replacement parts',M,Y,
 "Aftermarket electrical replacements listed for the 2025 450 SX-F: stators cross-referenced to the factory stator (a 110 W unit, an 85 W lighting stator supplied with a new pickup coil, and an 80 W stator with pickup); a rectifier/regulator listed for this exact model and year; and an external ignition coil cross-referenced to the factory coil number, reusing the original plug cap. A separately sold pickup coil with confirmed 2025 fitment was not found. A replacement throttle position sensor is cross-referenced to the factory number, but its seller lists years only to 2023, so treat it as unconfirmed for 2025.",
 {'ktm_stator':'79239004200','stator_110w':"Rick's Motorsport Electrics 21-0092H",'stator_85w_with_pickup':'Steahly Off Road L-RSKTM350','stator_80w_with_pickup':'RMSTATOR RMS010-107562','ktm_regulator':'77211034000','regulator':"Rick's Motorsport Electrics 10-043",'ktm_ignition_coil':'58439006000','ignition_coil':'RMSTATOR RMS060-109051','ktm_tps':'79041077044'},
 'COMMUNITY',S('https://ricksmotorsportelectrics.com/OEM-Style-KTM-Rectifier-Regulator-10_043'),'low',NOTE+' Higher-output stators change charging load; check regulator suitability.')
R('chassis','Throttle tube and supermoto front brake options',M,Y,
 "An aluminium throttle tube is listed for the 2025 450 SX-F (some handlebars and wrap-around handguards need an extra insert), and a stock-ratio aluminium tube is listed for 2017 to 2026 KTM four-strokes. A 320 mm supermoto front brake kit (rotor, four-piston caliper, adapter, line and radial master cylinder) is listed for this bike, but it needs a supermoto front wheel, and hub width and spoke clearance decide whether it fits. Its radial master cylinder is not confirmed for use with the stock motocross brake.",
 {'ktm_throttle_housing':'A46002010025','ktm_front_master_cylinder':'77713001044','supermoto_master_cylinder':'Moto-Master 213012'},
 'COMMUNITY',S('https://www.g2ergo.com/model/4-stroke-250-350-450-500-all-models-17-26/'),'low',NOTE)
sh=json.load(open(sys.argv[1])) if len(sys.argv)>1 else {}
fmt=lambda o,t:f"{o:g} x {t:.2f}"
import collections
R('suspension','How to read the setting-shim size lists',M,Y,
 "KTM's parts list for the 2025 450 SX-F carries a page of setting shims: every round shim size KTM offers for re-valving the fork and shock, not the stack fitted to the bike. Many of those sizes can also be bought as aftermarket 10-packs matched by inner diameter, outer diameter and thickness. The packs are coded SH, then inner diameter, then thickness in hundredths of a millimetre, then outer diameter, then 10 for the pack size, so a 6 x 28 x 0.20 shim is SH06 2028 10. A dimension match is not a fitment guarantee: shim shape and the stack it goes into still have to suit, and a stack should only be changed by someone who has recorded the original.",
 {'pack_maker':'Race Tech','code_pattern':'SH<inner dia 2 digits> <thickness x100, 2 digits><outer dia 2 digits> 10'},'DERIVED',S('https://www.bunburyktm.com.au/partFinder/fiche/ktm/2025/450-sx-f-us/wp-shims-for-setting'),'low',"Pack codes follow the pattern recorded in the review and were not checked on the pack maker's chart.")
for i,d in sh.items():
    if not d['y']: continue
    by=collections.OrderedDict()
    for o,t in sorted(d['y'],key=lambda x:(x[1],x[0])): by.setdefault(t,[]).append(o)
    R('suspension',f'Setting shims, {i} mm inner diameter: sizes sold in aftermarket 10-packs',M,Y,
      f"Setting shims for the 2025 450 SX-F with a {i} mm inner diameter that match an aftermarket 10-pack, as thickness then outer diameters in mm: "+'; '.join(f"{t:.2f}: "+', '.join(f"{o:g}" for o in os_) for t,os_ in by.items())+". "
      +(f"{len(d['n'])} other {i} mm sizes on KTM's list had no matching pack and come from KTM." if d['n'] else ''),
      {'inner_diameter_mm':float(i),'matched_sizes':len(d['y']),'pack_maker':'Race Tech','sizes_without_pack':[fmt(o,t) for o,t in d['n']][:60]},
      'DERIVED',S('https://www.bunburyktm.com.au/partFinder/fiche/ktm/2025/450-sx-f-us/wp-shims-for-setting'),'low','Shim sizes are on the factory parts list BAK holds; pack matches were not checked on the pack maker\'s chart.')
un=[f"{i} mm: {len(d['n'])}" for i,d in sh.items() if not d['y'] and d['n']]
if un: R('suspension','Setting shims with no aftermarket pack found',M,Y,
      "Some shims on KTM's setting list for the 2025 450 SX-F had no matching aftermarket pack in a November 2026 review and are ordered from KTM by size. Count by inner diameter: "+', '.join(un)+". Most 10 mm shims are in this group.",{},'DERIVED',S('https://www.bunburyktm.com.au/partFinder/fiche/ktm/2025/450-sx-f-us/wp-shims-for-setting'),'low')
F.write()
