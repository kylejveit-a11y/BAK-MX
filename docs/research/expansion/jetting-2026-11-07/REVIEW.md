# Jetting charts and fuel / engine-management facts, 2026-11-07

Data intake for the fuel and weather guidance (`shared/fuel-weather.ts`). Public official sources only: Yamaha's owner's
manual library, the KTM / Husqvarna / GasGas manual CDN, and Kawasaki's online manual viewer (text layer). Nothing behind
a login, paywall or bot check was read and no block was worked around. Nothing was written to any database; every payload
below is hash-guarded in the format of the earlier passes (`private.stage_manual_rows`: `want` = SHA-256 of the sorted
`pdf page|printed page|path|value|` lines, lines sorted by the SHA-256 of the path; `sha` = SHA-256 of the source document).
Downloaded PDFs were deleted after reading; the hashes are kept in `charts.jsonl` / `doc_hashes.json` / `facts.json`.

Before starting, the verified claims were checked (Supabase, SELECT only) for `Carburetor tuning /` rows, other jetting
rows (the CRF150R 2020 chart is on file as `Carburetor Adjustments for Altitude & Temperature /`), stock carburetor rows
(`Carburetor /`) and fuel / map / traction / launch rows, so nothing already verified is repeated.

## Part 1: carburetor jetting charts

### Yamaha YZ125, YZ125X, YZ250, YZ250X (`yamaha/`, 29 payloads, 196 rows)

Owner's Service Manual chapter 10 (chapter 7 in the 2020 manuals), "ROAD CONDITION AND EXAMPLES OF CARBURETOR SETTING":
General and Sandy condition x Under 10 °C (winter), 15-25 °C (spring, autumn), Over 25 °C or Over 30 °C (summer). Yamaha
prints no altitude axis. Reader: `scripts/manual-textlayer/yamaha_jetting.py` (cells placed by the x position of the six
temperature headers; a value split over two lines is joined; °C/°F checked), builder `build_yamaha_jetting.py`.

Path `Carburetor tuning / <general|sandy> condition / <band>`; value: main jet, jet needle-clip position (Yamaha's code with
the clip groove, e.g. NYDF-2), pilot jet, pilot air screw, power jet where printed.

Checks before a bike-year was written:
- second read of every single-line row with `pdftotext -layout` (all equal);
- the general-condition 15-25 °C column must equal the stock settings already verified for that bike-year (main jet, jet
  needle, pilot jet, power jet, and the pilot air screw where the chart prints turns out): all 29 match;
- rows marked A / B: only the row whose legend reads "For USA and CAN" is kept (2020 manuals);
- page images of the 2020 YZ250 and 2021 YZ250 / YZ250X pages were looked at by eye.

Pilot air screw: from 2021 most charts print values relative to the ex-factory setting ("0", "+1/4", "-1/8") under a TIP
saying they are added to the ex-factory turns; those are stored as "turn from the ex-factory setting" plus one row
`Carburetor tuning / pilot air screw chart values`. Where a chart prints absolute turns (2-1/4) while the same TIP says the
values are added to the ex-factory turns (YZ125 2021, YZ125X 2021-2022), the air screw row is not stored (it would read as
4-1/2 turns). The 2020 chart and the 2026-2027 YZ125 chart print absolute turns with no TIP: stored as "turns out".

Not loaded: YZ250 2021 and YZ250X 2021-2022 (manuals BF1-2819U-10 / -11): the chart prints two jet needle rows with no
market mark or legend; which one is the US setting cannot be told.

### KTM, Husqvarna, GasGas (`ktm-group/`, 10 payloads, 348 rows)

- 125 XC 2021-2022 (21_3214209, 22_3214411): the "Carburetor tuning (125 XC US)" heading holds two charts, "For normal cross
  country circuits" and "For fast circuits with a large portion of high-load riding" (both "Do not use on sandy terrain").
  Read page by page with `jetting.parse_page`; each kept under its own name. Main jet, idling jet and idle air screw rows
  matched a second read with pdftotext. ("32,5" printed with a decimal comma is stored as 32.5; `build_jetting.clean`
  now handles two-digit values.)
- 85 SX 17/14 and 19/16 2020-2021, TC 85 2020-2021: the chart is a picture (image 402814-01), byte-identical in all four
  manuals. Transcribed cell by cell from the image and compared with two tesseract reads per cell (2x and 3x with
  threshold): 34 of 35 cells identical; one idling jet (301-750 m, 25-36 °C) read 45 by eye and by the 2x read and 49 by the
  3x read: 45 kept (the jet range is 42 / 45 / 48). The highlighted standard cell (301-750 m, 16-24 °C: 2 turns, 48, NRK C,
  clip 3, 142) equals the stock settings on file. The picture prints °F and feet rounded differently (e.g. -2 … 20 °F for
  -20 … -7 °C); band labels use the °F / ft that the text-layer charts of later years print for the same °C / metre bands.
  This chart is not the same as the 2021 MC 85 chart (several cells differ).
- GasGas MC 125 2023 and MC 250 2023 (23_3215094, 23_3215095): carbureted, chart in the text layer, not in the
  2026-11-03 pass. Read with `jetting.py`; second read matched.

### Per bike-year status (carbureted roster bike-years 2020-2027)

| Bike | Before | Added now | Not available |
|---|---|---|---|
| Yamaha YZ125 | none | 2020-2027 (2021: no air screw row) | |
| Yamaha YZ125X | none | 2020-2027 (2021-22: no air screw row) | |
| Yamaha YZ250 | none | 2020, 2022-2027 | 2021 (two unmarked needle rows) |
| Yamaha YZ250X | none | 2020, 2023-2027 | 2021-2022 (two unmarked needle rows) |
| Yamaha YZ65, YZ85 | none | | 2020-2027: US owner's manuals have no tuning chapter and no jet specifications; no service manual in Yamaha's US library. Stock jetting is not on file either. |
| KTM 50 SX / Husqvarna TC 50 / GasGas MC 50 | 2024-2027 | | 2020-2023 (MC 50 2021-2023): no chart in the manual |
| KTM 65 SX, TC 65, MC 65 | all years | | |
| KTM 85 SX 17/14, 19/16 | 2022-2027 | 2020-2021 | |
| Husqvarna TC 85 | 2022-2027 | 2020-2021 | |
| GasGas MC 85 | 2021-2027 | | |
| KTM 125 SX, 150 SX, 250 SX (carb years 2020-2022) | all | | |
| KTM 125 XC (carb years 2021-2022) | none | 2021-2022 (two charts) | |
| Husqvarna TC 125, TC 250 (2020-2022) | all | | |
| GasGas MC 125 | 2021-2022 | 2023 | |
| GasGas MC 250 | 2022 | 2023 | |
| Honda CRF150R | 2020-2026 | | |
| Kawasaki KX85 | 2023-2025 | | 2020-2022, 2026-2027 |
| Kawasaki KX65 | none | | 2020-2027 |
| Kawasaki KX112 | none | | 2022-2027 |

Kawasaki: the viewer's page images now return 403 and the text layer (search.xml) prints table cells out of order (two
altitude rows interleaved), so the altitude / temperature tables cannot be read without guessing. Kyle's screenshots of the
TUNING pages (as for the 2024 KX85) would unlock them.

## Part 2: fuel-injected bikes (`fi/`)

### KTM, Husqvarna, GasGas (`fi/ktm-group/`, 257 payloads, 2,141 rows; 249 FI bike-years, 2,117 rows)

`scripts/manual-textlayer/ktm_fi_facts.py` on the owner's manual of every roster bike-year (177 manuals, all downloaded from
the CDN, hashed, read, deleted). The text is cut into numbered sections and a section is used only when its heading has no
validity note or one that applies to the US standard model (`validity.applies`). Values are built from the printed words:

- `Fuel / Fuel standard` (DIN EN 228 (ROZ 95) or (ROZ 95/RON 95/PON 91)), only from the ROZ 95 fuel entry (the RON 95/97 entry
  is the Brazil fuel); `Fuel / Ethanol` (up to 10% ethanol, E10, safe); `Fuel / Fuels not to use` (methanol M15/M85/M100 or
  more than 10% ethanol E15/E25/E85/E100). Fuel rows are also given for the carbureted bike-years (8 payloads).
- `Engine management / Mapping / STANDARD | ADVANCED` (indicator lamp A white / B green where printed), change while riding,
  and (TBI two-strokes) mapping also changes the exhaust control response.
- `Engine management / Traction control / ...` (TC button, on/off during the ride, ≤ 4,000 rpm when pressing the button,
  last setting kept at restart, reduces rear-wheel slip particularly in the wet).
- `Engine management / Launch control / ...` (stationary, idle, neutral; MAP + TC buttons to 2022, TC + QS buttons later;
  cancels when the throttle closes more than 1/3 after full throttle or after 3 minutes without a start; off a few seconds
  after the start; engine off at least 10 seconds before re-arming).
- `Engine management / Quickshifter / switch`, `Engine management / Throttle grip guide plate` (characteristic changed by
  swapping the guide plate; a second plate is supplied).

Missing wording in some years (e.g. the TC-button sentence in 2020-2022 SX-F, the mapping names in some TBI manuals, all
engine-management sentences in GasGas EX/MC two-stroke 2025-2027 manuals) is simply not stored. Not stored at all: the
Connectivity Unit Offroad section (the manual does not say whether it is fitted as standard or what it adjusts); no KTM-group
manual names a tuning tool that changes fuel or ignition.

### Yamaha (`fi/yamaha/`, 45 payloads, 239 rows)

`scripts/manual-textlayer/yamaha_fi_facts.py`: maps 1 and 2 (identical as shipped, set with the Power Tuner app; map 2
indicator), mode switch, launch control (function, activation, start gear, turns off in 3rd), Power Tuner (smartphone app over
the CCU wireless network; settings designed for a standard vehicle), gasohol (ethanol up to 10%, methanol not recommended).
Fuel grade and "E10 acceptable" were already verified for every Yamaha bike-year and are not repeated. No traction control
section exists in these owner's service manuals. YZ250F / YZ450F / YZ250FX / YZ450FX 2020-2027 all have payloads; WR250F
2025, WR450F 2022 and WR450F 2027 are missing because Yamaha's library answered 502 to every attempt (nothing was worked
around); the WR manuals 2020-2023 print only the gasohol sentence of this set.

### Kawasaki (`fi/kawasaki/`, 25 payloads, 244 rows)

`scripts/manual-textlayer/kawasaki_fi_facts.py` on the viewer text layer (search.xml) of the KX250 / KX450 / KX250X / KX450X
manuals 2020-2026: minimum antiknock index 90 ((RON+MON)/2), ethanol up to 10% approved, never more than 10% ethanol or 5%
methanol, up to 15% MTBE; DFI couplers (three settings, to 2024 KX250 and to 2023 KX450); Power Mode Full / Mild, KTRC modes,
launch control and the RIDEOLOGY THE APP KX DFI setting (2024-on KX450). Only prose sentences are used; in manuals shared by
two models a sentence printed within 250 characters of a model code is dropped (this removed the 2026 KX450 / KX450X power
mode rows). Coupler colours are not stored (the colour / setting table is out of order in the text layer).

### Not done

- Honda CRF250R/RX, CRF450R/RX: engine mode, HSTC, launch control and ethanol rows are on file for 2020, 2023, 2025 and 2026
  (450) only. Honda's CDN refuses automated downloads; the handbooks Kyle downloaded earlier (listed in
  `docs/research/expansion/honda/pass2/REVIEW.md`) would cover 2021, 2022, 2024, 2027.
- Suzuki RM-Z: no public US owner's manual found in this pass; the tuning tool and coupler rows already on file come from
  Suzuki product pages.
- Triumph: maps, traction, launch and quickshifter rows already on file.

## Loaded (2026-11-07)
All 366 payloads loaded with private.stage_manual_rows from the pinned commit bca7b6f0 (every hash matched): 544 carburetor
chart rows and 2,624 fuel-injection rows; all 3,168 passed the evidence gate and were promoted to VERIFIED.
