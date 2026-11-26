"""KTM carbureted two-stroke wiring 2011-2016 (125 SX, 150 SX, 250 SX), read by eye from KTM's wiring diagram
sheets (owner-supplied 2026-11-26). Four sheets were looked at (2011 125/150 SX; 125/150 SX 2012-2015;
250 SX 2012-2014; 250 SX EU/USA 2012-2016, year ranges as printed in each title block) and all read the same.
Facts only; pages are not stored. Medium confidence. usage: python3 scripts/knowledge/wiring10.py"""
import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File
F=File('wiring10_ktm_2t_2011_2016','w-k2','KTM 125/150/250 SX 2011-2016 wiring (wiring pass 2026-11)','KTM',['125 SX','150 SX','250 SX'],list(range(2011,2017)))
s=F.src('manufacturer','KTM repair manual wiring diagram sheets, 125/150 SX and 250 SX','https://www.ktm.com','2015')
for models,years in ((['125 SX','150 SX'],[2011,2012,2013,2014,2015]),(['250 SX'],[2012,2013,2014,2015,2016])):
    F.R('ecu_electronics','Complete wiring: CDI, ignition and kill switch',models,years,
     f"The {years[0]}-{years[-1]} {' and '.join(models)} has no battery and one small harness around the CDI controller, which has an 18-pin plug. Pin 1, white/blue: ignition coil. Pin 2, brown: frame ground. Pins 6 and 7, black/red and white/red: alternator (the coil that powers the ignition), through a 4-pin plug at the engine. Pins 10 and 11, red and green: crankshaft position sensor, through the same 4-pin plug. Pin 5, black/yellow: kill switch, which grounds that wire to stop the engine. Pin 14, white/black, and pin 4, gray: the ignition curve connector; the two wires end in a single-pin plug pair, and joining or separating them selects the ignition curve. KTM's colour letters: bl black, br brown, bu blue, gn green, gr gray, or orange, pk pink, pu violet, rd red, wh white, ye yellow.",
     {'cdi_pin_1':'wh-bu ignition coil','cdi_pin_2':'br ground','cdi_pins_6_7':'bl-rd, wh-rd alternator','cdi_pins_10_11':'rd, gn crankshaft position sensor','cdi_pin_5':'bl-ye kill switch','cdi_pins_14_4':'wh-bl, gr ignition curve connector'},'OEM',s,'medium','Read from the wiring diagram by eye; check the diagram on the bike before cutting, splicing or back-probing. Which curve the joined and separated positions select is not shown on the diagram.')
F.write()
