"""Fuel and engine-management facts from Kawasaki KX owner's manuals, read from the viewer's text layer (search.xml).

The text layer carries each page's words without spaces; prose sentences keep their order, tables do not. Only prose
sentences are matched, with spaces removed from the patterns, and each value is built from fixed wording plus the numbers
captured. In a manual shared by two models a match is dropped when a model code (KX252C, KX450N, ...) is printed within
250 characters of it, because the sentence may then be about one of the two models only.
The page number is the viewer page; the printed page is the number printed beside the running head.

usage: kawasaki_fi_facts.py <search.xml> [--shared]   prints {rows: [[viewer page, printed, path, value]], problems}"""
import re, sys, json

def pages(path):
    t = open(path, encoding='utf-8').read()
    return [(int(p), s) for p, s in re.findall(r'<text page="(\d+)"[^>]*><!\[CDATA\[(.*?)\]\]>', t, re.S)]

def printed(s):
    m = re.search(r'(?:GENERALINFORMATION|MAINTENANCEANDADJUSTMENT|TROUBLESHOOTINGGUIDE|TUNING|STORAGE)(\d{1,3})(?!\d)', s) or \
        re.search(r'(?<!\d)(\d{1,3})(?:GENERALINFORMATION|MAINTENANCEANDADJUSTMENT|TUNING)', s)
    return m.group(1) if m else '?'

def P(s):
    """pattern without spaces; a hyphen may be printed at a line break inside any word"""
    out = ''
    for ch in s.replace(' ', ''):
        out += (re.escape(ch) if ch not in '()' else '\\' + ch) + '-?'
    return out

FACTS = [
    ('Fuel / Minimum antiknock index', r'Useclean,freshunleadedgasolinewithamini-?mumAntiknock[iI]ndexof(\d+)\.',
     lambda m: f'unleaded, antiknock index (RON + MON)/2 of at least {m.group(1)}'),
    ('Fuel / Ethanol', P('Gasoline containing up to 10% ethanol') + r'.{0,120}?' + P('is approved for use'),
     lambda m: 'gasoline with up to 10% ethanol (gasohol) is approved'),
    ('Fuel / Ethanol and methanol limit', P('Never use “gasohol” with more than 10% ethanol, or more than 5% methanol'),
     lambda m: 'never gasohol with more than 10% ethanol or more than 5% methanol'),
    ('Fuel / MTBE', P('You may use gasoline containing up to') + r'(\d+)%MTBE',
     lambda m: f'gasoline with up to {m.group(1)}% MTBE may be used'),
    ('Engine management / Power mode / settings', P('Full Power: The highest engine power output is achieved') + r'.{0,200}?' + P('Mild Power: The engine power and throttle response are milder than full power'),
     lambda m: 'Full Power (highest engine output) and Mild Power (milder power and throttle response)'),
    ('Engine management / Power mode / button', P('The power mode button is located on the left switch housing'),
     lambda m: 'power mode button on the left switch housing'),
    ('Engine management / Power mode / when it can be changed', P('The power mode can be changed only when the throttle is fully closed and the engine is idle'),
     lambda m: 'only with the throttle fully closed and the engine at idle'),
    ('Engine management / Power mode / during launch control', P('The power mode cannot be changed while launch control is active'),
     lambda m: 'cannot be changed while launch control is active'),
    ('Engine management / KTRC / modes', P('KTRC determines the traction control characteristics with two mode selections. KTRC can also be set to OFF'),
     lambda m: 'two modes, or OFF'),
    ('Engine management / KTRC / mode 1', P('Mode 1: Modes with modest slip suppression'),
     lambda m: 'modest slip suppression'),
    ('Engine management / KTRC / mode 2', P('Mode 2: The system intervenes early and the wheelspin is more suppressed than in mode 1. This mode is used in low grip situations'),
     lambda m: 'intervenes earlier and suppresses wheelspin more than mode 1; for low grip'),
    ('Engine management / KTRC / when it can be changed', P('The KTRC mode can be changed only when the throttle is fully closed and the engine is idle'),
     lambda m: 'only with the throttle fully closed and the engine at idle'),
    ('Engine management / Launch control / function', P('The launch control mode can be used to adjust ignition timing to help riders get better starts on slippery terrain'),
     lambda m: 'adjusts ignition timing for better starts on slippery terrain'),
    ('Engine management / Launch control / activation', P('Start the engine and shift into neutral, first or second gear. • When the power mode button and the KTRC mode button are pushed simultaneously, the left indicator turns purple and the system is activated'),
     lambda m: 'engine running in neutral, first or second gear; push the power mode button and the KTRC mode button together (left indicator purple)'),
    ('Engine management / Launch control / activation', P('The launch control mode can be set when the engine is running and in neutral, 1st or 2nd gear. When activated, it only functions in 1st and 2nd gear. • When pushing the launch control mode button for over two seconds'),
     lambda m: 'engine running in neutral, 1st or 2nd gear; push the launch control mode button for over two seconds; works only in 1st and 2nd gear'),
    ('Engine management / Launch control / deactivation', P('When shifting into 3rd, the system is deactivated automatically'),
     lambda m: 'automatically when shifting into 3rd gear'),
    ('Engine management / Launch control / modes while active', P('When launch control mode is activated, power mode and KTRC mode are set to dedicated settings'),
     lambda m: 'power mode and KTRC use dedicated settings while launch control is active'),
    ('Engine management / DFI setting / app', P('the DFI settings can be changed in Power Modes “Full Power” and “Mild Power” respectively by using the dedicated app') + r'"?RIDEOLOGYTHEAPPKX"?' + P('downloaded to the smart device and connecting to the communication unit installed in the vehicle'),
     lambda m: 'DFI settings of each power mode (Full Power, Mild Power) are changed with the RIDEOLOGY THE APP KX app through the communication unit on the vehicle'),
    ('Engine management / DFI setting / couplers', P('Three DFI settings are available to suit various track conditions. They are easily activated by changing the wiring connector on the side of the frame'),
     lambda m: 'three DFI settings for track conditions (soft, standard, hard), selected by changing the wiring connector on the side of the frame with the engine stopped'),
]
NEED = {'Engine management / DFI setting / couplers': P('Change the connector on the right front of the frame to suit the track condition with the engine stopped'),
        'Engine management / DFI setting / couplers#2': r'ConnectorColorSoftStandardHard|SoftStandardHard'}

def facts(path, shared=False):
    pg = pages(path); rows = {}; probs = []
    allt = ''.join(s for _, s in pg)
    for p, pat, val in FACTS:
        for n, s in pg:
            if '......' in s: continue
            for m in re.finditer(pat, s):
                if shared and re.search(r'KX\d{3}[A-Z]\b|KX\d{3}[A-Z](?=[A-Z])', s[max(0, m.start() - 250): m.end() + 250]):
                    probs.append(f'{p}: model code near the sentence (shared manual), dropped'); continue
                if p in NEED and not (re.search(NEED[p], allt) and re.search(NEED[p + '#2'], allt)): continue
                v = val(m)
                if p in rows and rows[p] and rows[p][3] != v: probs.append(f'{p}: two values'); rows[p] = None; continue
                if p not in rows: rows[p] = [n, printed(s), p, v]
    return [r for r in rows.values() if r], probs

if __name__ == '__main__':
    r, pr = facts(sys.argv[1], '--shared' in sys.argv)
    print(json.dumps({'rows': r, 'problems': pr}, ensure_ascii=False, indent=1))
