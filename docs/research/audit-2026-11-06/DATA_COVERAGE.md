# BAK MX data coverage audit, 2026-11-06

Read-only audit. What published specs we have, and do not have, for every bike-year a rider can pick in the garage.

**Inputs:** roster `shared/garage-models.ts` (86 models, 571 bike-years); fuel system `shared/fuel-system.ts`; spec flags
`claims-coverage.json` (503 rows; 9 of them are years not in the roster); guided jobs from `proceduresForBike(...standard, US)` in
`shared/procedures.ts`; research notes under `docs/research/`. `shared/bike-support.json` is empty, so it was not used.

The flags come from keyword matches over VERIFIED claims (see `scripts/research/gap_matrix.sql` for the matching style). A flag
means "at least one matching row", not "the full spec is there". Treat everything below as approximate (spot checks below).

## Summary

| | Bike-years | Share |
|---|---:|---:|
| In the roster | 571 | 100% |
| Every rider-facing spec present that applies and is published | 439 | 77% |
| ... of which a flag is missing only because the spec is not published, does not apply, or the matcher missed it | 111 | 19% |
| At least one real, fillable gap | 55 | 10% |
| **No verified data at all** | **77** | **13%** |
| Thin (< 40 rows; all Suzuki) | 14 | 2% |
| About 100 rows (Yamaha YZ65 / YZ85, owner's-manual-only bikes) | 16 | 3% |
| **No guided job at all** | **373** | **65%** |
| No guided engine job (oil, filter, plug, coolant, valves, clutch, top or bottom end) | 387 | 68% |
| No guided suspension job (fork or shock service, sag, clicker baseline) | 400 | 70% |

439 + 55 + 77 = 571. "Complete" means one matching row per spec kind, not a full table.

**The picture in one paragraph.** The motocross bikes riders pick most (KTM/Husqvarna/GasGas SX/TC/MC and SX-F/FC/MC-F, Yamaha
YZ, Honda CRF-R, Kawasaki KX) are close to complete on specs. The holes are: (1) the whole KTM-group enduro line (KTM XC-W and
XCF-W, Husqvarna TE and FE, GasGas EC) has nothing, 77 bike-years together with KX85/KX112 2027 and Suzuki 2023; their
owner's manuals are not even in `manual-index/ktm-group-us.tsv`; (2) Suzuki is a shell (2-38 rows per year) because
everything lives in paid service manuals; (3) mini carb jetting is missing for every Kawasaki mini except KX85 2023-25;
(4) a handful of core MX bike-years are missing suspension baselines (KTM 125 SX 2023, Husqvarna FC 250/450 2026, FC 450 2023).
Guided jobs are the much bigger gap: KTM, Husqvarna and GasGas have essentially no guided jobs (326 of 358 bike-years have none),
and no brand has both routine maintenance and rebuild jobs.

## How "applies" was decided

- **Valve clearance** only for 4-strokes (`garageModelInfo.engine`).
- **Carb jetting** only for carbureted bikes: `fuelSystem()` where it answers. Where it returns null: all 50/65/85/112 minis
  treated as carbureted (Kawasaki's 2027 KX85 spec sheet confirms "28mm Keihin carburetor"); KTM 125 XC 2021-22 carbureted
  (its manual prints carb charts); Yamaha YZ two-strokes 2027 assumed carbureted (Yamaha's 2027 YZ250 manual lists a Keihin
  PWK38, per `knowledge/load/p5-3.json`); all 4-strokes injected, including Suzuki RM-Z. **Unknown and left open:** KTM 150 XC-W
  2020-22 and Husqvarna TE 150 2020-27 (`fuelSystem` returns null; these may be TPI). Nothing is known about them anyway.
- **Not published by the maker** (not counted as a gap; from `expansion/gaps/DATA_HUNT_2026-10-30.md` and the jetting REVIEW
  files): Kawasaki sag on every KX; YZ65/YZ85 sag and spring rates (owner's manual only); Yamaha altitude/temperature jetting
  charts (Yamaha prints base jetting only); KTM 50 SX / TC 50 / MC 50 jetting chart before 2024.
- **Not applicable:** KX65 compression clickers (KX65 fork and shock have rebound adjusters only).
- **Matcher misses** (data is on file, flag says no): Yamaha 4-stroke fork oil and YZ65/YZ85 service schedule (spot checks 1, 2).

## Coverage by brand and model

"Rows (n)" is the claims-coverage row count per year. "Real gaps" lists specs with no flag that the maker does publish (or that
could not be ruled out). Years are model years.

### KTM

| Model | Type | Roster years | Rows (n) | Real gaps | Not published / not applicable / matcher miss | Guided jobs |
|---|---|---|---|---|---|---|
| 125 SX | 2T carb/EFI | 2020-27 | 231-285 | comp clickers 2023; rebound clickers 2023; sag 2023; spring rates 2023 | - | none |
| 150 SX | 2T carb/EFI | 2020-22, 2025 | 272-285 | none | - | none |
| 250 SX | 2T carb/EFI | 2020-26 | 258-276 | none | - | none |
| 250 SX-F | 4T EFI | 2020-27 | 261-293 | none | - | none |
| 300 SX | 2T EFI | 2023-26 | 258-274 | none | - | none |
| 350 SX-F | 4T EFI | 2020-27 | 263-303 | none | - | 2023-27: brakes, chain/sprockets, clutch, linkage/steering, wheel bearings |
| 450 SX-F | 4T EFI | 2020-27 | 247-1581 | none | - | 2023-27: bottom end, brakes, chain/sprockets, clicker baseline, clutch, engine R&R, fork oil/service, linkage/steering, sag/preload, shock service, top end, wheel bearings |
| 50 SX | 2T carb | 2020-27 | 240-274 | none | jetting chart (not published) 2020-23 | none |
| 65 SX | 2T carb | 2020-27 | 250-260 | none | - | none |
| 85 SX 17/14 | 2T carb | 2020-27 | 227-307 | jetting chart 2020-21 | - | none |
| 85 SX 19/16 | 2T carb | 2020-27 | 227-307 | jetting chart 2020-21 | - | none |
| 125 XC | 2T carb/EFI | 2021-25, 2027 | 251-280 | jetting chart 2021-22 | - | none |
| 250 XC | 2T EFI | 2020-27 | 251-275 | none | - | none |
| 250 XC-F | 4T EFI | 2020-27 | 266-300 | none | - | none |
| 300 XC | 2T EFI | 2020-27 | 251-275 | none | - | none |
| 350 XC-F | 4T EFI | 2020-25, 2027 | 267-300 | none | - | 2023-25, 2027: brakes, clutch, linkage/steering, wheel bearings |
| 450 XC-F | 4T EFI | 2020-27 | 250-295 | none | - | 2023-27: brakes, clutch, linkage/steering, wheel bearings |
| 150 XC-W | 2T EFI/fuel ? | 2020-27 | 0 | **no verified data 2020-27** | - | none |
| 250 XC-W | 2T EFI | 2020-27 | 0 | **no verified data 2020-27** | - | none |
| 300 XC-W | 2T EFI | 2020-27 | 0 | **no verified data 2020-27** | - | none |
| 450 XCF-W | 4T EFI | 2023-27 | 0 | **no verified data 2023-27** | - | none |

### Husqvarna

| Model | Type | Roster years | Rows (n) | Real gaps | Not published / not applicable / matcher miss | Guided jobs |
|---|---|---|---|---|---|---|
| FC 250 | 4T EFI | 2020-27 | 247-1152 | comp clickers 2026; rebound clickers 2026; sag 2026; spring rates 2026; fork oil 2026 | - | none |
| FC 350 | 4T EFI | 2020-25, 2027 | 263-290 | none | - | 2023-24, 2027: chain/sprockets, linkage/steering, wheel bearings |
| FC 450 | 4T EFI | 2020-27 | 237-1126 | comp clickers 2023, 2026; sag 2023, 2026; rebound clickers 2026; spring rates 2026; fork oil 2026 | - | 2023-25, 2027: chain/sprockets, clicker baseline, fork oil/service, linkage/steering, oil change, sag/preload, wheel bearings |
| TC 125 | 2T carb/EFI | 2020-26 | 258-281 | none | - | none |
| TC 150 | 2T EFI | 2025 | 261-261 | none | - | none |
| TC 250 | 2T carb/EFI | 2020-26 | 257-278 | none | - | none |
| TC 300 | 2T EFI | 2025 | 257-257 | none | - | none |
| TC 50 | 2T carb | 2020-27 | 242-270 | none | jetting chart (not published) 2020-23 | none |
| TC 65 | 2T carb | 2020-27 | 251-262 | none | - | none |
| TC 85 | 2T carb | 2020-27 | 230-313 | jetting chart 2020-21 | - | none |
| FX 350 | 4T EFI | 2020-22, 2024-27 | 264-293 | none | - | 2024: wheel bearings |
| FX 450 | 4T EFI | 2020-25, 2027 | 249-283 | none | - | 2023-24: linkage/steering, wheel bearings |
| TX 300 | 2T EFI | 2020-27 | 252-264 | none | - | none |
| FE 450 | 4T EFI | 2020-26 | 0 | **no verified data 2020-26** | - | none |
| TE 150 | 2T fuel ? | 2020-27 | 0 | **no verified data 2020-27** | - | none |
| TE 250 | 2T EFI | 2020-26 | 0 | **no verified data 2020-26** | - | none |
| TE 300 | 2T EFI | 2020-27 | 0 | **no verified data 2020-27** | - | none |

### GasGas

| Model | Type | Roster years | Rows (n) | Real gaps | Not published / not applicable / matcher miss | Guided jobs |
|---|---|---|---|---|---|---|
| MC 125 | 2T carb/EFI | 2021-26 | 256-285 | jetting chart 2023 | - | none |
| MC 250 | 2T carb/EFI | 2022-26 | 246-279 | jetting chart 2023 | - | none |
| MC 250F | 4T EFI | 2021-27 | 272-1137 | none | - | none |
| MC 350F | 4T EFI | 2022-25 | 276-285 | none | - | none |
| MC 450F | 4T EFI | 2021-27 | 257-1129 | none | - | 2025-27: chain/sprockets, wheel bearings |
| MC 50 | 2T carb | 2021-27 | 198-272 | none | jetting chart (not published) 2021-23 | none |
| MC 65 | 2T carb | 2021-27 | 256-259 | none | - | none |
| MC 85 | 2T carb | 2021-27 | 270-313 | none | - | none |
| EX 250 | 2T EFI | 2022-25 | 248-265 | none | - | none |
| EX 250F | 4T EFI | 2021-25 | 274-286 | none | - | none |
| EX 300 | 2T EFI | 2021-27 | 248-265 | none | - | none |
| EX 350F | 4T EFI | 2021-25 | 274-288 | none | - | none |
| EX 450F | 4T EFI | 2021-25 | 256-281 | none | - | none |
| EC 250 | 2T EFI | 2021-25 | 0 | **no verified data 2021-25** | - | none |
| EC 300 | 2T EFI | 2021-27 | 0 | **no verified data 2021-27** | - | none |
| EC 450F | 4T EFI | 2024-25 | 0 | **no verified data 2024-25** | - | none |

### Yamaha

| Model | Type | Roster years | Rows (n) | Real gaps | Not published / not applicable / matcher miss | Guided jobs |
|---|---|---|---|---|---|---|
| YZ125 | 2T carb | 2020-27 | 365-379 | sag 2020 | jetting chart (Yamaha prints base jetting only) 2020-27 | 2020-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, premix/jetting check, linkage/steering, shock service, top end, wheel bearings |
| YZ250 | 2T carb | 2020-27 | 379-386 | sag 2020 | jetting chart (Yamaha prints base jetting only) 2020-27 | 2020-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, premix/jetting check, linkage/steering, shock service, top end, wheel bearings |
| YZ250F | 4T EFI | 2019-27 | 332-454 | spring rates 2019; service schedule 2019 | fork oil (matcher miss, data on file) 2019-27 | 2019-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, linkage/steering, sag/preload, shock service, top end, wheel bearings |
| YZ450F | 4T EFI | 2018-27 | 347-454 | spring rates 2018-19; service schedule 2018-19 | fork oil (matcher miss, data on file) 2018-27 | 2018-27: bottom end, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine R&R, fork oil/service, linkage/steering, sag/preload, shock service, top end, valve clearance, wheel bearings |
| YZ65 | 2T carb | 2020-27 | 101-102 | gearing (all) | sag (not published) 2020-27; spring rates (not published) 2020-27; jetting chart (Yamaha prints base jetting only) 2020-27; service schedule (matcher miss, data on file) 2020-27 | none |
| YZ85 | 2T carb | 2020-27 | 96-100 | gearing (all) | sag (not published) 2020-27; spring rates (not published) 2020-27; jetting chart (Yamaha prints base jetting only) 2020-27; service schedule (matcher miss, data on file) 2020-27 | none |
| YZ125X | 2T carb | 2020-27 | 370-382 | sag 2020 | jetting chart (Yamaha prints base jetting only) 2020-27 | 2020-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, premix/jetting check, linkage/steering, shock service, top end, wheel bearings |
| YZ250FX | 4T EFI | 2020-27 | 436-470 | spring rates 2024 | fork oil (matcher miss, data on file) 2020-27 | 2020-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, linkage/steering, sag/preload, shock service, top end, wheel bearings |
| YZ250X | 2T carb | 2020-27 | 382-390 | sag 2020 | jetting chart (Yamaha prints base jetting only) 2020-27 | 2020-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, premix/jetting check, linkage/steering, shock service, top end, wheel bearings |
| YZ450FX | 4T EFI | 2020-27 | 442-476 | none | fork oil (matcher miss, data on file) 2020-27 | 2020-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, linkage/steering, sag/preload, shock service, top end, wheel bearings |
| WR250F | 4T EFI | 2020-27 | 559-589 | none | - | 2020-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, linkage/steering, sag/preload, shock service, top end, wheel bearings |
| WR450F | 4T EFI | 2020-27 | 562-593 | none | - | 2020-27: bottom end, clicker baseline, clutch, engine R&R, fork oil/service, linkage/steering, sag/preload, shock service, top end, wheel bearings |

### Honda

| Model | Type | Roster years | Rows (n) | Real gaps | Not published / not applicable / matcher miss | Guided jobs |
|---|---|---|---|---|---|---|
| CRF150R | 4T EFI | 2020-26 | 232-306 | none | - | none |
| CRF250R | 4T EFI | 2020-27 | 300-551 | none | - | 2021-27: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, fork oil/service, linkage/steering, oil change, sag/preload, spark plug, valve clearance, wheel bearings |
| CRF450R | 4T EFI | 2020-27 | 605-728 | none | - | 2021-27: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, fork oil/service, linkage/steering, oil change, sag/preload, spark plug, valve clearance, wheel bearings |
| CRF250RX | 4T EFI | 2020-27 | 335-406 | none | - | 2021-27: air filter, brakes, clicker baseline, clutch, coolant, fork oil/service, linkage/steering, oil change, sag/preload, wheel bearings |
| CRF450RX | 4T EFI | 2020-27 | 407-499 | none | - | 2021-27: air filter, brakes, clicker baseline, clutch, coolant, fork oil/service, linkage/steering, oil change, sag/preload, wheel bearings |

### Kawasaki

| Model | Type | Roster years | Rows (n) | Real gaps | Not published / not applicable / matcher miss | Guided jobs |
|---|---|---|---|---|---|---|
| KX112 | 2T carb | 2022-27 | 197-201 | **no verified data 2027**; jetting chart (all) | sag (not published) 2022-26 | 2022-26: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, fork oil/service, premix/jetting check, oil change, sag/preload, spark plug |
| KX250 | 4T EFI | 2020-26 | 208-332 | none | sag (not published) 2020-25; sag flagged present 2026, unverified (spot-check 3) | 2020-26: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, oil change, sag/preload, spark plug, valve clearance |
| KX450 | 4T EFI | 2020-26 | 283-603 | none | sag (not published) 2020-25; sag flagged present 2026, unverified (spot-check 3) | 2020-26: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, oil change, sag/preload, spark plug, valve clearance |
| KX65 | 2T carb | 2020-27 | 148-153 | jetting chart (all) | comp clickers (fork and shock have no compression adjuster) 2020-27; sag (not published) 2020-27 | 2020-27: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, fork oil/service, premix/jetting check, oil change, sag/preload, spark plug |
| KX85 | 2T carb | 2020-27 | 189-210 | **no verified data 2027**; jetting chart 2020-22, 2026 | sag (not published) 2020-26 | 2020-26: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, fork oil/service, premix/jetting check, oil change, sag/preload, spark plug |
| KX250X | 4T EFI | 2021-26 | 270-333 | none | sag (not published) 2021-25; sag flagged present 2026, unverified (spot-check 3) | 2021-26: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, oil change, sag/preload, spark plug, valve clearance |
| KX450X | 4T EFI | 2021-26 | 285-332 | none | sag (not published) 2021-25; sag flagged present 2026, unverified (spot-check 3) | 2021-26: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, oil change, sag/preload, spark plug, valve clearance |

### Suzuki

| Model | Type | Roster years | Rows (n) | Real gaps | Not published / not applicable / matcher miss | Guided jobs |
|---|---|---|---|---|---|---|
| RM-Z250 | 4T EFI | 2020-27 | 2-38 | **no verified data 2023**; comp clickers (all); rebound clickers (all); sag (all); spring rates (all); fork oil (all); valve clearance (all); oil capacity (all); tire pressure (all); torques (all); service schedule (all); gearing 2020-22; spark plug 2020-22; coolant (all) | - | none |
| RM-Z450 | 4T EFI | 2020-27 | 2-37 | **no verified data 2023**; comp clickers (all); rebound clickers (all); sag (all); spring rates (all); fork oil (all); valve clearance (all); oil capacity (all); tire pressure (all); torques (all); service schedule (all); gearing 2020-22, 2024; spark plug 2020-22, 2024; coolant (all) | - | none |

### Triumph

| Model | Type | Roster years | Rows (n) | Real gaps | Not published / not applicable / matcher miss | Guided jobs |
|---|---|---|---|---|---|---|
| TF 250-X | 4T EFI | 2024-27 | 128-226 | valve clearance 2027; oil capacity 2027; service schedule 2027 | - | 2024-26: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, idle speed, oil change, sag/preload, spark plug |
| TF 450-RC Edition | 4T EFI | 2025 | 231-231 | none | - | 2025: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, idle speed, oil change, sag/preload, spark plug |
| TF 450-X | 4T EFI | 2026-27 | 127-221 | valve clearance 2027; oil capacity 2027; service schedule 2027 | - | 2026: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, idle speed, oil change, sag/preload, spark plug |
| TF 250-C | 4T EFI | 2026 | 224-224 | none | - | 2026: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, idle speed, oil change, sag/preload, spark plug |
| TF 450-C | 4T EFI | 2026 | 223-223 | none | - | 2026: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, idle speed, oil change, sag/preload, spark plug |
| TF 250-E | 4T EFI | 2026 | 224-224 | none | - | 2026: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, engine map, fork oil/service, idle speed, oil change, sag/preload, spark plug |
| TF 450-E | 4T EFI | 2026 | 217-217 | none | - | 2026: air filter, brakes, chain/sprockets, clicker baseline, clutch, coolant, fork oil/service, idle speed, oil change, sag/preload, spark plug |

## Guided jobs (proceduresForBike, standard US)

373 of 571 bike-years have no guided job. By brand:

| Brand | Bike-years with any job | What exists | Job families missing across the brand |
|---|---|---|---|
| KTM | 19 of 153 (350/450 SX-F 2023-27, 350/450 XC-F 2023-27) | Chassis jobs (bearings, linkage, brakes, chain) and hydraulic clutch; full engine + fork + shock rebuild only on 450 SX-F 2025-26 | Every two-stroke and every mini: nothing. No oil change, air filter, spark plug, coolant or valve-clearance job on any KTM. No jetting job for the carbureted SX / 85 SX / 65 SX / 50 SX. |
| Husqvarna | 10 of 115 (FC/FX 350/450, scattered years) | Bearings, linkage, chain; FC 450 2025 has oil change, fork air, sag and damping baseline | Every TC, TE, TX, FE and FC 250: nothing. No valve, plug, filter, coolant, top-end or shock job anywhere. |
| GasGas | 3 of 90 (MC 450F 2025-27) | Two shared wheel-bearing jobs | Everything else, all 16 models. |
| Honda | 28 of 39 (CRF250R/450R/RX 2021-27) | Full routine maintenance (oil, filter, coolant, plug, valves on R models, clutch), fork oil, sag, clicker baseline, chassis | CRF150R (all years) and every 2020 model: nothing. No top end, bottom end, engine removal or shock service. No spark plug or valve job on the RX models. |
| Kawasaki | 46 of 48 (all but KX85/KX112 2027) | Routine maintenance, fork oil, sag/preload, clicker baseline, DFI map, carb baseline on minis | No top end, bottom end, engine removal, shock service, wheel bearings or linkage/steering on any Kawasaki. Valve clearance only on the 4-strokes (correct). |
| Yamaha | 83 of 99 (all big bikes; not YZ65/YZ85) | Rebuild-heavy: top end, bottom end, engine removal, fork and shock service, bearings, clicker baseline, sag on 4-strokes | No oil change, air filter or spark plug job on any Yamaha. Valve clearance, coolant, brakes and chain only on YZ450F 2026. YZ65 / YZ85: nothing. Sag/preload job missing on the YZ two-strokes. |
| Triumph | 9 of 11 (not 2027) | Routine maintenance, fork oil, sag, clicker baseline, engine map, idle | No valve-clearance check, no rebuild, bearing or shock-service job. 2027 TF 250-X / TF 450-X: nothing. |
| Suzuki | 0 of 16 | - | Everything. |

The most common rider jobs (oil change, air filter, valve check, fork oil, sag) are missing for the three best-selling brands in
the roster (KTM, Husqvarna, GasGas: 358 bike-years, 63% of the roster).

## Top 20 gaps to fill

Ranked by (how common the bike is with US riders) x (how often riders ask for that spec) x (bike-years affected). Weights used:
core MX bikes 3, minis and CRF150R 2.5, off-road models 2, Suzuki / 150 SX / TC 150 / TC 300 1.5, Triumph 1; clicker baselines
and sag 5, springs, oil, valves and jetting 4, tire pressure, torques and fork oil 3, schedule and plug 2, coolant and gearing 1.5.
Items with the same source were grouped. Specs the maker does not publish are left out, except item 20, which is a decision.

| # | Gap | Bike-years | Missing | Where the data would come from |
|---:|---|---:|---|---|
| 1 | KTM 250 XC-W / 300 XC-W 2020-27 | 16 | Everything: clickers, sag, springs, fork oil, oil, tire pressure, torques, schedule, plug, coolant | KTM US owner's manuals (same KTM manual CDN as the SX/XC manuals already read). Not listed in `manual-index/ktm-group-us.tsv`; add them, then run `scripts/manual-textlayer/` as for XC. |
| 2 | Husqvarna TE 250 / TE 300 2020-27 | 15 | Everything | Husqvarna US owner's manuals, same method. |
| 3 | KTM 450 XCF-W 2023-27, Husqvarna FE 450 2020-26, GasGas EC 450F 2024-25 | 14 | Everything, including valve clearance | KTM / Husqvarna / GasGas owner's manuals, same method. |
| 4 | GasGas EC 250 / EC 300 2021-27 | 12 | Everything | GasGas owner's manuals, same method. |
| 5 | KTM 150 XC-W / Husqvarna TE 150 2020-27 | 16 | Everything; also whether 2020-22 (KTM) and 2020-27 (Husqvarna) are carb or injected (`fuelSystem` returns null) | Owner's manuals (technical data page states the fuel system), then KTM/Husqvarna US spec pages. |
| 6 | Husqvarna FC 250 2026, FC 450 2026; FC 450 2023 | 3 | Clickers, sag, springs, fork oil (2026); compression clickers and sag (2023) | Owner's manuals 26_3402884_en_BA, 26_3402886_en_BA, 23_3402633_en_OM are marked "partial" in the manual index: render and read the suspension pages. |
| 7 | KTM 125 SX 2023 | 1 | Clickers, sag, springs | The US manual prints fork/shock data for the EU model and 125 XC only (`TEXT_LAYER_REVIEW_2026-10-13.md`). Try KTM US 2023 125 SX spec web page or a KTM US setup sheet; do not borrow from the TC 125 / MC 125. |
| 8 | Kawasaki KX65 jetting 2020-27 | 8 | Altitude/temperature jetting chart | KX65 owner's manual TUNING pages. Kawasaki's viewer serves page images to a browser only: same screenshot method Kyle used for KX85 (`kawasaki/jetting/REVIEW_2026-11-04.md`). |
| 9 | Kawasaki KX112 jetting 2022-27 | 6 | Jetting chart | 2024 KX85/KX112 manual 99803-0399 printed page 162 (missing from the screenshots), then check each year's text layer. |
| 10 | Kawasaki KX85 jetting 2020-22, 2026-27 | 5 | Jetting chart | 2020-22 manuals print a different table (capture it); 2026 is a new manual (KX85E). |
| 11 | Suzuki RM-Z250 / RM-Z450 suspension 2020-27 | 16 | Clickers, sag, springs, fork oil | Only in Suzuki's paid service manuals (RM-Z250 #99500-46K00-01E, RM-Z450 #99500-37K00-01E, genuinesuzukimanuals.com). Purchase is Kyle's call. |
| 12 | Suzuki RM-Z250 / RM-Z450 engine and service 2020-27 | 16 | Oil capacity, valve clearance, torques, schedule, coolant, tire pressure; 2023 has no rows at all | Same service manuals; suzukicycles.com 2023 spec sheet for the basics. |
| 13 | KTM 85 SX 17/14 and 19/16, Husqvarna TC 85 2020-21 jetting | 6 | Jetting chart | The chart is a picture in those owner's manuals: render the page and transcribe with a second read. |
| 14 | Kawasaki KX85 / KX112 2027 | 2 | Everything verified | 48 spec-sheet rows already staged as REVIEWED in `expansion/new-bikes/claims_2.sql` (not in coverage, so not promoted); 2027 owner's manual for clickers, oil and torques when Kawasaki posts it. |
| 15 | Yamaha YZ125, YZ250, YZ125X, YZ250X 2020 | 4 | Sag (and confirm spring rates) | 2020 owner's service manuals B0V-28199-11 and B9U-28199-11, marked "todo" in `manual-index/yamaha-us.tsv`. |
| 16 | GasGas MC 125 / MC 250 2023 jetting | 2 | Jetting chart | 2023 owner's manual 23_3215094_en_OM (indexed, but not in `ktm-group/jetting/docs.tsv`) and the 2023 MC 250 manual. `fuelSystem` says carbureted until 2024. |
| 17 | KTM 125 XC 2021-22 jetting | 2 | Jetting chart | Owner's manuals 21_3214209_en_OM, 22_3214411_en_OM print two charts under one heading: render the page to tell them apart. |
| 18 | Triumph TF 250-X / TF 450-X 2027 | 2 | Valve clearance, oil capacity, schedule (about 128 rows vs 220 for 2026) | 2027 handbooks on the Triumph portal (already used for the 255 2027 rows). |
| 19 | Yamaha YZ450F 2018-19, YZ250F 2019, YZ250FX 2024 | 4 | Spring rates; schedule (2018-19) | Yamaha owner's service manuals (full spec tables for these years are already on file per `DATA_HUNT_2026-10-30.md`; check why no spring row matched). |
| 20 | Kawasaki sag, every KX (48 bike-years) | 48 | Sag | Kawasaki does not publish it. Decision, not data: show a clearly labelled tester baseline (e.g. 104-105 mm rider sag for the 2025-26 KX250 in `suspension-knowledge/specialist/baselines.json`) or the general rule. |

Lower priority, not ranked: YZ65 / YZ85 gearing (no sprocket rows on file); 50 SX / TC 50 / MC 50 jetting before 2024 (not printed);
Yamaha two-stroke altitude jetting (Yamaha prints base jetting only; base settings are in the knowledge layer for some years).

## Spot checks of the claims-coverage flags

Checked against statements in `expansion/published-claims.json`, the `claims*.sql` files, `knowledge/load/*.json` and the
jetting `load/` files. These files hold only part of the live claims table, so a flag could not be checked for every year.

1. **False negative: Yamaha 4-stroke fork oil** (YZ250F, YZ450F, YZ250FX, YZ450FX, every year flagged missing). The data is
   there under Yamaha's wording: "Front suspension / Quantity (left): 476 cm³" (YZ450F 2023), "486 cm³" (YZ250F 2024, YZ450F
   2026), all in `published-claims.json`; 2027 YZ450F "501.0 cm³ per leg" in `knowledge/load/p5-3.json`. The matcher looks for
   "fork oil" or "fork ... oil amount", so "Front suspension / Quantity" never matches. The WR models pass only because their rows
   add "total fork oil per leg". Other years assumed the same wording, not checked.
2. **False negative: YZ65 / YZ85 service schedule.** YZ65 2024 has 22 rows such as "Periodic maintenance and lubrication chart /
   Piston - Replace.: Every fifth race" (`expansion/new-bikes/claims_3.sql`; that file's 101 rows equal the n of 101). The matcher
   wants "maintenance chart" or "service schedule", and Yamaha puts "and lubrication" in the middle.
3. **Probable false positive: Kawasaki 2026 sag** (KX250, KX450, KX250X, KX450X 2026 flagged present, 2020-25 missing).
   `DATA_HUNT_2026-10-30.md` says Kawasaki prints no sag or ride-height figure in any KX owner's manual 2020-2027, and no
   Kawasaki statement in the repo contains "sag" or "ride height" (the only "sag" hits in the Kawasaki SQL are inside "usage").
   The only 2026 KX sag numbers in the repo are tester baselines (104-105 mm) in `suspension-knowledge/specialist/baselines.json`.
   Needs a live query: `select statement from claims where manufacturer='Kawasaki' and model_year=2026 and statement ~* '\msag\M|ride height'`.
4. **Weak positive: Yamaha sag.** 67 Yamaha spring-rate claims (`expansion/yamaha/springs/claims.sql`) end with "set race sag
   after any spring change", which matches the sag pattern without giving a number. For YZ125 2021 and 2023-27 the flag can be
   lit by that sentence alone. The real figure (sunken length 90-100 mm) is in the knowledge layer (`knowledge/load/p6y-0.json`
   for 2021, `p5-2.json` for 2027), so riders do get it, but the claims flag cannot be trusted year by year. The 2020 "missing"
   is consistent: no spring row for 2020 and the 2020 manuals are still "todo".
5. **Correct "missing", but not a gap: KX65 compression clickers.** `expansion/gaps/kawasaki-minis/claims_0.sql`: "Front fork /
   Rebound damping adjuster positions: 4 positions"; 2027 spec sheet (`new-bikes/claims_2.sql`): "33mm leading axle telescopic
   fork with 4-way rebound damping" and "stepless 3-turns rebound damping" on the shock. No compression adjuster exists.
6. **Correct "missing", real gap: KTM 125 SX 2023 suspension.** `ktm-group/TEXT_LAYER_REVIEW_2026-10-13.md`: "the manual prints
   fork and shock data for the EU model and the 125 XC only, so no suspension rows were stored for the US 125 SX."
7. **Correct "missing", avoidable: GasGas MC 125 / MC 250 2023 jetting.** The 2023 MC 125 manual is indexed as loaded for specs,
   but the jetting pass (`ktm-group/jetting/docs.tsv`) stops at 2022 for the GasGas MC 125/250, so the chart was never read.

Also noted: claims-coverage has rows for 9 bike-years that are not in the roster (GasGas MC 125 2027, Husqvarna TC 125/250/300
2027, KTM 125 XC 2026, 250 SX 2027, 300 SX 2027, 350 XC-F 2026, Kawasaki KX250 2027). Either the roster is missing them or the
claims are for years riders cannot pick.

## Method notes

- Scripts used for this audit were run from the scratchpad, not committed: roster x `fuelSystem` x `proceduresForBike` dump, the
  gap join against claims-coverage, and a statement corpus built from the repo's claims and knowledge files (about 78,000 rows) for the spot checks.
- Job families were grouped from guided-job titles (for example "Change the engine oil and filter" = oil change).
- The live `claims` table was not queried. Where this file says "not on file", it means not in claims-coverage.json.
