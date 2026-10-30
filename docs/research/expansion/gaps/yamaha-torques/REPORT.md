# Yamaha tightening torques (chapter 2), text-layer extraction, 2026-10-30

This pass fills the gaps left after `docs/research/expansion/yamaha/TEXT_LAYER_REVIEW_2026-10-13.md`. Those Owner's Service
Manuals had their chapter-2 specification table and service schedule loaded, but the chapter-2 TIGHTENING TORQUES tables
(engine and chassis) were never read. Each bike-year had 0–6 torque facts on file, all from the suspension-setting section.
Source: Yamaha's own Owner's Manual Library (https://library.ymcapps.net/library/om/contents/pdf/10/<publication>_02.pdf).
The PDFs were fetched, hashed (doc_hashes.json), read and deleted. Nothing from the manuals is stored beyond the extracted rows.

## Folder contents
- 1.json … 57.json: one payload per bike-year for private.stage_manual_rows (keys make, model, yr, url, sha, rev, ref, want,
  n, delta), the same shape as build_yamaha_specs.py, for an empty base. Payloads 1–48 and 50–57 hold torque rows only.
  Payloads 49 (YZ250F 2019), 53 (YZ450F 2018) and 54 (YZ450F 2019) also carry the full chapter-2 spec table
  (~74 rows were on file for these).
- jobs.txt (MODEL|YEAR|CODE; 57 bike-years, 54 documents). doc_hashes.json ({code: sha256}).
- Reader: scripts/manual-textlayer/yamaha_torques.py (--build jobs outdir).
- load_2026-10-30.sql: how the payloads were loaded (http_get from a pinned commit into private.stage_manual_rows) and promoted.

Totals: 8,591 torque rows. Add 634 spec-table rows (205 + 217 + 212, each including the sag figure and 15 cross-checked
damper values), for 9,225 rows in all. The loader's ON CONFLICT DO NOTHING on md5(make|model|yr|textlayer|path) skips paths
already on file. That affects only the three spec payloads; every "Tightening torques / …" path is new.

## Method
1. Pages headed TIGHTENING TORQUES. The GENERAL TIGHTENING TORQUE chart is not read. The table's own vertical rules
   (x ≈ 235/278/309/490 pt) give the columns Item | Thread size | Q'ty | Tightening torques | Remarks. The per-cell horizontal
   rules of the item column give the row bands, so wrapped items and two-line remarks stay in their row. A block is a span of
   the thread-size rule that the Q'ty and torque rules also span. The Remarks rule is not required, because merged remark
   cells interrupt it.
2. Section from the heading above the block: ENGINE/CHASSIS TIGHTENING TORQUES, or ENGINE/CHASSIS/ELECTRICAL in the 2020
   two-strokes. A heading printed below the last table on a page carries over to the next page.
3. Path: "Tightening torques / <Engine|Chassis|Electrical> / <Part> (<thread>, qty <n>; remark: <remarks>)". Remarks are
   kept as printed:
   - Boxed symbols are decoded only when the manual's own SYMBOLS page defines them (LT = apply locking agent (LOCTITE),
     E = engine oil, M = molybdenum disulfide oil or grease, LS, G, ...).
   - Free text as printed ("Use a lock washer.", "Stake.", "Copper washer", "YPVS", "TORX").
   - The torque-check mark becomes "torque-check mark (check after break-in and before each race)". It is a Wingdings glyph,
     a "△" (2020 two-strokes), or in BR9-28199-10 a vector shape matched by size against the shape beside the TIP line.
4. Value = N·m as printed, unit N·m. kgf·m/m·kg and lb·ft/ft·lb are not stored but are checked:
   - kgf·m against N·m/10 or N·m/9.80665;
   - lb·ft against N·m×0.7376 or kgf·m×7.233.
   The tolerance is half a last-digit unit plus 0.5 %/1 %. A mismatch drops the row.
5. "See TIP." / "Refer to TIP." (cylinder head bolt, primary drive gear nut, lower/steering ring nut): the value is
   "TIP: <TIP text for that part>" with no unit. Every N·m figure inside it is conversion-checked.
6. Model tags ("Sidestand (YZ125X)", "Sidestand bolt (YZ250X)") keep the row for that model only. No value carried a tag.
7. 2020 two-stroke group headings ("Power valve:", "Silencer:") are prefixed only while the following rows share the first
   row's remark (YPVS) or name the group. A bare one-word item after a group with no remark is dropped.
8. A path printed twice with two values would be dropped. None occurred.
9. Thin bike-years: yamaha_specs.parse + yamaha_specs.sag + yamaha_dampers.check. All three passed 15/15, with no reader
   problems.
10. The loader hash was re-simulated for all 57 payloads (sorted by sha256(path), n, unique ids). 57/57 match.

Publication codes: those of the manuals already loaded (manual-index/yamaha-us.tsv). For YZ250F 2019 and YZ450F 2018-2019,
the library model_list endpoint (POST, baseCode 6150, langId 02, destination USA) confirmed B7B-28199-10, BR9-28199-10 and
BR9-28199-11.

### Reader fixes found in review (all 54 documents re-run afterwards)
- B0V-28199-11 (YZ125/YZ125X 2020) p. 2-13: a merged remark cell broke the Remarks rule, so a 29-row chassis block was skipped
  and the page-2-14 chassis rows were labelled Engine.
- B7B-2819U-12 (YZ250F 2021): the CHASSIS heading at the foot of p. 2-12 did not carry over, so all 163 rows were labelled
  Engine.
- BR9-28199-10 (YZ450F 2018): the torque-check mark is a vector shape, so no row carried it.
After the fix, only these four bike-years changed. No N·m value changed.

## Rows per bike-year (torque rows; spec rows where added)
- YZ125: 2020 132, 2021 134, 2022 134, 2023 134, 2024 135, 2025 136, 2026 136, 2027 136
- YZ125X: 2020 133, 2021 135, 2022 135, 2023 135, 2024 136, 2025 137, 2026 137, 2027 137
- YZ250: 2020 140, 2021 143, 2022 143, 2023 143, 2024 144, 2025 145, 2026 145, 2027 145
- YZ250X: 2020 141, 2021 144, 2022 144, 2023 144, 2024 145, 2025 146, 2026 146, 2027 146
- YZ250FX: 2020 164, 2021 164, 2022 164, 2023 163, 2024 164, 2025 168, 2026 167, 2027 167
- YZ450FX: 2020 167, 2021 167, 2022 167, 2023 166, 2024 166, 2025 166, 2026 165, 2027 168
- YZ250F: 2019 164 + 205 spec, 2020 164, 2021 163, 2027 164
- YZ450F: 2018 164 + 217 spec, 2019 163 + 212 spec, 2020 163, 2021 163, 2027 164

## Dropped rows (14, all in the two 2020 two-stroke manuals)
- B0V-28199-11 (YZ125, YZ125X 2020): p. 2-12 "Fiber" M6 ×4 10 Nm (ambiguous group); p. 2-14 "Drive chain puller adjust bolt
  and locknut" 19 Nm printed as 13 ft·lb (19 N·m = 14.0 lb·ft); p. 2-15 "Seat" 19 Nm / 13 ft·lb (same).
- B9U-28199-11 (YZ250, YZ250X 2020): p. 2-11 "Fiber" (ambiguous group); p. 2-12 "Lower handlebar holder" 40 Nm printed as
  22 ft·lb (40 N·m = 29.5 lb·ft); p. 2-13 drive chain puller 19/13; p. 2-14 Seat 19/13.
N·m and m·kg agree on these lines; only the printed lb·ft is off. They are dropped by rule and nothing was substituted.

## Spot-check
3 random torque rows per bike-year (171): each PDF page opened with pdfplumber and checked for the part-name words, the
thread size and the N·m figure. 171/171 confirmed. The main session independently re-checked a further sample on
re-downloaded PDFs before promotion (see load_2026-10-30.sql).

## Two-stroke fork oil and spring rates
Not added. The chapter-2 tables are already loaded in full and docs/research/expansion/yamaha/springs/ covers spring rates for
YZ125/125X/250/250X 2021-2027. Follow-up: check for spring-rate rows on file for the 2020 two-strokes (B0V-28199-11,
B9U-28199-11), which are not in the springs package.

## YZ65 / YZ85
Yamaha's library lists one publication per model-year, all 80-page Owner's Manuals (YZ65 2020-2025 and 2027, none for 2026;
YZ85 2020-2027; YZ85LW 2022-2027 shares the YZ85 document). Opened D99-28199-12 (sha256
95c9ce9ac38b9472be37b6e2b38cec8677e335089d69b1e51f3f2e07e1367bb2) and DA8-28199-10 (sha256
1c179cbadb51f4a9c5eec9b2e2292544e0225a89104c4c49bf2af6cb88acbc8b): no tightening-torque table, no spring rates, no fork oil
amount or level. Finding: Yamaha publishes no Owner's Service Manual for YZ65/YZ85 2020-2027 in its public library, so spring
rates, fork oil, sag and a torque table for these models are "not published by Yamaha in a public document". Not filled from
any other source.
