"""Honda CRF150R wiring, read by eye from the wiring diagram page of Honda's handbook (owner-supplied 2026-11-26).
The 2021-2026 pages carry the same text layer; the 2012-2020 pages are drawings, each looked at by eye and found to be the same diagram.
Medium confidence; the page is not stored. usage: python3 scripts/knowledge/wiring7.py"""
import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File
F=File('wiring7_crf150r','w-h3','Honda CRF150R 2012-2026 wiring (wiring pass 2026-11)','Honda',['CRF150R'],list(range(2012,2027)))
s=F.src('manufacturer','Honda CRF150R competition handbook, wiring diagram pages 2012-2026','https://powersports.honda.com/downloads/owners-manuals','2024')
F.R('ecu_electronics','Complete wiring: ignition, stop button and throttle sensor',['CRF150R'],list(range(2012,2027)),
 "The 2012-2026 CRF150R has no battery and a very small harness: an ignition control module with a 6-pin and a 4-pin connector, an exciter coil and ignition pulse generator on the engine, a direct ignition coil on the plug, a throttle position sensor and the engine stop button. Exciter coil: white and blue. Ignition pulse generator: blue/yellow and green/white. Direct ignition coil: black/yellow from the module and green ground. Throttle position sensor: black/blue, yellow and black at the module (blue, yellow and black on the sensor's own pigtail). Engine stop button: black/white and black/green; pressing it joins the two, and black/green ties into the green ground. Module 6-pin connector wires: green, black, green/white, black/blue, yellow, blue/yellow. Module 4-pin connector wires: blue, black/white, white, black/yellow. Honda's colour letters: Bl black, Y yellow, Bu blue, G green, R red, W white, Br brown, O orange, Lb light blue, Lg light green, P pink, Gr gray.",
 {'exciter_coil':'W, Bu','pulse_generator':'Bu/Y, G/W','ignition_coil':'Bl/Y, G','tps':'Bl/Bu, Y, Bl (sensor side Bu, Y, Bl)','stop_button':'Bl/W, Bl/G','icm_6p':'G, Bl, G/W, Bl/Bu, Y, Bu/Y','icm_4p':'Bu, Bl/W, W, Bl/Y'},'OEM',s,'medium','Read from the wiring diagram by eye; check the diagram on the bike before cutting, splicing or back-probing.')
F.write()
