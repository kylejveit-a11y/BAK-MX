# Honda pass 2 — CRF250R/RX and CRF450R/RX: 2020–2021 R/RX, RX 2022–2026, 2027 — review (2026-10-25)

Status: prepared for loading, NOT loaded. `claims.sql` = 3,195 rows (2020–2026); `claims_2027.sql` = 665 rows (2027 CRF250R/RX
and CRF450R/RX, kept apart; whether 2027 Honda enters the bike list is decided later). Nothing was written to any database.

## Sources (Honda CDN `https://cdn.powersports.honda.com/documentum/MWOM/<file>`, copies from Kyle's Dropbox)

| File | Document | SHA-256 (first 16) | Used for |
|---|---|---|---|
| ml.remawmom.2020_31k95620_crf250r_rx.pdf | 2020 CRF250R/RX Owner's Manual 31K95620 (full manual with setup data; no 2020 handbook exists) | 57a3fa62dd48d056 | 2020 CRF250R, CRF250RX |
| ml.remawmom.2020_31mke630_crf450r_rx_rwe.pdf | 2020 CRF450R/RX/RWE Owner's Manual 31MKE630 | b459f7ff3ab7fb6d | 2020 CRF450R, CRF450RX |
| ml.remawmom.2021_crf250r-rx_61k95x01_ch_web.pdf | CRF250R/RX Competition Handbook, issue March 2020 (MY2021 per file name) | 56cec4bfbad03cc8 | 2021 CRF250R, CRF250RX |
| ml.remawmom.2021_crf450r-rx-rwe_ch_61mkex00_web.pdf | CRF450R/RX/RWE Competition Handbook, issue June 2020 | 1e97eb2010892b2b | 2021 CRF450R, CRF450RX |
| ml.remawmom.2022_crf250r_rx_competition_handbook.pdf | 2022 CRF250R/RX CH | 6bb82e92779c1a6d | 2022 CRF250RX |
| ml.remawmom.2022_crf450r_rx_rwe_competition_handbook.pdf | 2022 CRF450R/RX/RWE CH | 24cf776173f95eab | 2022 CRF450RX |
| ml.remawmom.ak952323chen.pdf | 2023 CRF250R/RX CH | 9572b4ee71a7029b | 2023 CRF250RX |
| ml.remawmom.amker2323chen.pdf | 2023 CRF450R/RX/RWE CH | 29bd02fc18fd2ff0 | 2023 CRF450RX |
| ml.remawmom.ak952424chen.pdf | 2024 CRF250R/RX CH | 3388e50048f0a99e | 2024 CRF250RX |
| ml.remawmom.amker2424chen.pdf | 2024 CRF450R/RX/RWE CH | 15551ba9b237cfff | 2024 CRF450RX |
| ml.remawmom.ak952525chen.pdf | 2025 CRF250R/RX/RWE CH | 648251e727fadcf3 | 2025 CRF250RX |
| ml.remawmom.amker2525chen.pdf | 2025 CRF450R/RX/RWE/R-S CH | 81d5baf97ec65b28 | 2025 CRF450RX |
| ml.remawmom.ak952626chen.pdf | 2026 CRF250R/RX/RWE CH | 93db2951a84fcd97 | 2026 CRF250RX |
| ml.remawmom.amker2626chen.pdf | 2026 CRF450R/RX/RWE CH | 676df763129d63c4 | 2026 CRF450RX |
| ml.remawmom.ak952727chen.pdf (local copy AK952727CHEN.pdf) | 2027 CRF250R/RX/HRC Works Edition CH | 72a3380a429a6548 | 2027 CRF250R, CRF250RX |
| ml.remawmom.amker2727chen.pdf | 2027 CRF450R/RX/HRC Works Edition CH, issue Feb 2026 | 03e24e426dc007cf | 2027 CRF450R, CRF450RX |
| ml.remawmom.ak952323omen.pdf, amker2323omen, ak952525omen, amker2525omen, amker2626omen | 2023/2025 CRF250 and 2023/2025/2026 CRF450 owner's manuals | see facts files | spec-table rows only (below) |

All 2022–2026 handbook hashes equal the hashes cited by the loaded R rows. For 2023 and 2025 RX and 2026 CRF450RX the handbook is
the primary source; the owner's manual of the same year supplies only rows the handbook does not print (`Specifications / …`
dimensions, tank, tires, gear ratios, compression ratio, battery, fuse, and spark-plug gap). Those rows carry their own `source`
block in the facts file and their own URL/hash in the SQL. Side note: the hash September's notes give for the "2025 CRF250R
handbook" (`0f7db013…2efac0`) is the hash of the 2025 CRF250R/RX/RWE owner's manual.

## Method

`extract_pass2.py <pdf folder>` writes the 22 facts files. Handbook torque tables: `torque_table.py` (reproduces all 61 loaded
2022 CRF250R rows with identical values). 2020 owner's-manual torque tables: `om2020_torque.py` (numbered item list beside the
figures; rows with one value printed across two model rows — CRF450 items 21 fuel pump and 23 fuel tank — were entered by hand
after checking the page image). Cylinder/clutch tables parsed by label; everything else listed by hand. Every value is asserted
against the text layer of its cited page (the script stops on a miss) and every page used was rendered (`pdftoppm -r 90–130`) and
compared with the rows: torque pages, cylinder/clutch tables, optional-parts/spring tables, fork-oil tables, every suspension
standard-position page, race-sag and spring-install pages, chain pages, every maintenance schedule (R and RX), and the
owner's-manual spec tables. Statement form `"<joint>: <value> <unit>. <conditions>"`, domain `service`, status `VERIFIED`,
`has_conflict` false, uuid5 ids, `ON CONFLICT (id) DO NOTHING`; evidence_record has the key set of the existing Honda text-layer
rows, inner `status` `STAGED` as on every existing Honda row.

## R vs RX mapping

- One model only when the page labels it (`CRF250RX:`, a section heading, a table column/row, a torque tag). RWE, R-S, HRC-WE
  values are never emitted; `CRF450R/RWE`, `CRF250R/HRC-WE` go to R; `CRF450R/RX` to both.
- Values printed once without a label (engine/clutch tables, valve clearance, oil, idle, coolant, tires, rim runout, damper fill,
  throttle freeplay, race sag except 2027 CRF450, 2020 CRF450 fork compression 8 clicks) go to every covered model and the
  condition says so. Race sag is printed once for all variants in every book except 2027 CRF450 (labelled R/RX).
- Schedules: RX column = each race/3.5 h, 2/7.5, 4/15, 6/22.5, 8/30; R = each race/2.5 h, 3/7.5, 6/15, 9/22.5, 12/30. Sidestand
  RX only; clutch fluid only on hydraulic-clutch 450s 2021+ (2020 CRF450 has none; CRF250 clutch fluid is RWE/HRC-WE only).
  2027 CRF450 adds crankshaft, seal plate and clutch center damper rows and moves spark plug/piston intervals (checked).
- Optional springs stored as `optional soft/stiff` with a not-stock condition.

## Notable RX vs R differences (all labelled, all present)

- Springs softer on RX every year (e.g. 2022–2027 CRF250RX 4.6 / 48 N/mm vs R 4.8 / 50; 2020 CRF450RX 4.8 / 52 vs R 5.0 / 56).
- Damping standards, spring install length, fork oil, chain (O-ring DID 520MXV5 / RK 520EXU on RX), plate limit (13.3/13.5 mm),
  sprocket (CRF450RX 50T vs R 49T 2020–2026), tank 8.0 L (8.5 L in 2020) vs 6.3 L, 18-in rear tire, final drive 3.846 vs 3.769.
- 2027 CRF250R changes vs 2026 R: fork 10/15 clicks, HSC 1 1/2 turns, LSC 7, fork oil 328 cm3; RX: fork comp 12, oil 337 cm3.
- Shared-value check against the loaded R rows (2022–2026, both families): 1,121 RX rows matched a loaded R joint; every value
  marked shared equals the R value; the only differences (11–12 per bike) are labelled springs, damper positions and spring
  install length.

## Left out, and why

- Spark plug optional types (e.g. SILMAR10A-9S "extended high speed" in 2020 CRF450; standard only stored).
- 2022–2026 CRF250 oil "at draining" middle line (printed twice as "at draining"), as in the earlier pass.
- Optional sprockets, adjuster ranges, preload per turn, fork oil for optional springs, remaining-oil tables, 2020 handlebar and
  wheelbase tuning tables, all RWE/R-S/HRC-WE values, owner's-manual values the handbook of the same year already prints.
- Torque rows printed without a value ("–").
- 2027 CRF450 clutch: only stack thickness 32.8 mm and plate warpage 0.15 mm are printed (both kept).
