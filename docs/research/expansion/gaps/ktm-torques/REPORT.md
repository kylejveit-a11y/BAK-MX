# KTM, Husqvarna and GasGas 2023-2027: tightening-torque rows, 2026-10-30

Gap: bike-years from model year 2023 on were loaded on 2026-10-10, before the text-layer extractor could read the
"Engine tightening torques" and "Chassis tightening torques" tables, so they have no torque facts. The 55 English owner's
manuals these bike-years come from (`docs/research/manual-index/ktm-group-us.tsv`, document host
`https://azwecdnepstoragewebsiteuploads.azureedge.net/<doc>.pdf`) were downloaded again and read with the current extractor in
`scripts/manual-textlayer/`. Facts only: this folder holds the hash-guarded load payloads, the document hashes and this report.
The PDFs were deleted after the run; no manual text beyond the extracted rows is stored.

## What is here

- `0.json` … `99.json`: one `private.kg` payload per bike-year (fields `make`, `model`, `yr`, `doc`, `sha`, `want`, `delta`, `n`),
  the output of `finalize_payloads.py`. Each payload is the complete row set the extractor reads for that bike-year (technical
  data, service schedule, dampers and torques). The loader inserts with `ON CONFLICT DO NOTHING`, so rows already on file are
  skipped and only the new paths, the torques, are added. `want` is the SHA-256 the loader must reproduce from `delta`.
- `summary.json`: the finalize summary (rows, schedule rows, damper rows, damper groups withheld, conflicts and flags dropped).
- `doc_hashes.json`: SHA-256 of each of the 55 PDFs as downloaded on 2026-10-30. Every payload's `sha` matches.

Totals: 100 bike-years, 26,662 rows in the payloads, of which 12,132 are torque rows (5,054 engine, 7,078 chassis).
Every bike-year in the payloads gained torque rows. No payload was skipped by the finalize rule (more than ten conflicts).

## Method

Same pipeline as `docs/research/expansion/ktm-group/TEXT_LAYER_REVIEW_2026-10-13.md`:

1. Downloaded in five batches of eleven, SHA-256 recorded, processed from the PDF directory, PDFs deleted after each batch.
2. `build_from_index.py` run once with status `loaded` and once with status `partial`, the batch's document names as extra
   arguments, so every index row for these documents was processed whatever its status. Layout is picked per manual
   (`tech_data_2020_2025.py` for the "TECHNICAL DATA" header, `tech_data_2025_plus.py` for "Technical specifications").
3. KTM 85 SX 17/14 and 19/16 (2025, 2026, 2027): `build_from_index.py` requires the model name on the cover and the cover
   prints "85 SX" only, so these six bike-years were built with a short driver in the scratchpad that runs the same steps
   (`tech_data_2025_plus.parse`/`facts`, `service_schedule.parse`, `validity.strip`, the conflict drop, `build_from_index.flags`,
   the same payload and report format) with the cover check relaxed to "85 SX", as `plan.py` lists them. The driver is not in
   the repository; it is 40 lines and can be added if these bike-years are to be rebuilt later.
4. `check_dampers.py` on every staged payload while the PDFs were present, then `finalize_payloads.py` over all batches
   (withholds a damper group that is not printed as a Comfort/Standard/Sport triple in the adjustment section).
5. A path printed with two different values for one bike is dropped, never guessed. A row that fails a shape check is dropped.

### Changes to `scripts/manual-textlayer/build_from_index.py`

Two changes, both commented in the file with this date.

1. The PARTIAL bikes (GasGas MC 250F 2024, Husqvarna FC 250 2023/2024, FC 450 2023/2024) used to keep Fork and Shock
   absorber rows only; they now also keep rows whose path starts with "Engine tightening torques" or
   "Chassis tightening torques":

   ```python
   allr=[(r['pdf'],r['printed'],p,v) for r,p,v in f if not partial or p.startswith(('Fork','Shock absorber','Engine tightening torques','Chassis tightening torques'))]; ns=0
   ```

2. A new shape flag `torque` in `flags()`. A torque row is dropped when its value does not start with a torque figure
   (`12 Nm`, `10 … 12 Nm`), `hand-tight` or a printed tightening sequence (`Tightening sequence`, `1st stage`), or when its
   label carries stage numbers (`1.`, `2.`) from a multi-stage row:

   ```python
   if p.startswith(('Engine tightening torques','Chassis tightening torques')):
       if not re.match(r'^(\d+(\.\d+)? Nm|\d+(\.\d+)? … \d+(\.\d+)? Nm|hand-tight|Tightening sequence|1st (tightening )?stage)',v) or re.search(r'(^|[\s(])\d\.(\s|\)|$)',lab): f.append('torque')
   ```

   Reason: the new layout (2025 on) prints the cylinder-head and camshaft-bridge rows in stages over several lines
   ("Screw, cylinder head / 1. Apply oil to collar and thread / 2. 10 Nm / 3. 30 Nm / 4. 50 Nm"). The extractor read those as a
   single stage ("Nut, cylinder head (1. M10x1.25 Engine oil 2. 3.) = 10 Nm") or as a remark fragment ("= Apply oil to collar
   and", "= 180 °"); and where a row shares its line with a model variant ("Subframe screw 35 Nm / (All TX models) 33 Nm / Side
   stand screw Loctite 2701") the side-stand row came out with no torque figure ("= Loctite® 2701"). The flag was added after
   the first full run; it was applied to the staged payloads with the same `flags()` function (62 rows removed from 36
   bike-years) and five manuals (23_3214640, 23_3214642, 25_3215223, 25_3402802, 27_3402947; eleven bike-years) were then
   rebuilt from the PDF with the updated script: all eleven payloads matched the staged ones byte for byte (`want`, `delta`,
   `sha`, `n`).

   The old layout prints the same rows as one row with the sequence in the value column; those are kept as printed, e.g.
   "Nut, cylinder head (M10x1.25) = Tightening sequence: Tighten diagonally. 1st tightening stage 10 Nm (7.4 lbf ft) 2nd
   tightening stage 30 Nm (22.1 lbf ft) 3rd tightening stage 180°" (checked on 23_3214640 page 133 and 23_3214642 page 149).

## Per bike-year

Rows = all rows in the payload; the torque columns are the rows that are new for these bike-years. "Conflicts dropped" and
"Flagged dropped" count paths of every section (the torque ones are listed below). Documents 25_3215220 (MC 250 / EX 300 / EX 250)
and 25_3402801 (TC 125 / TC 150) serve two index rows each.

| Make | Model | Year | Document | Payload | Rows | Engine torques | Chassis torques | Conflicts dropped | Flagged dropped | Damper groups withheld |
|---|---|---|---|---|---|---|---|---|---|---|
| KTM | 125 SX | 2026 | 26_3240232_en_BA | 52 | 277 | 45 | 81 | 3 | 1 | 0 |
| KTM | 125 SX | 2027 | 27_3240379_en_BA | 94 | 268 | 44 | 71 | 1 | 1 | 0 |
| KTM | 125 XC | 2026 | 26_3240232_en_BA | 53 | 276 | 45 | 81 | 3 | 1 | 0 |
| KTM | 125 XC | 2027 | 27_3240379_en_BA | 95 | 266 | 44 | 71 | 1 | 1 | 0 |
| KTM | 250 SX | 2026 | 26_3240233_en_BA | 54 | 274 | 43 | 84 | 3 | 2 | 0 |
| KTM | 250 SX | 2027 | 27_3240380_en_BA | 96 | 258 | 39 | 72 | 1 | 2 | 0 |
| KTM | 250 SX-F | 2023 | 23_3214640_en_OM | 0 | 283 | 60 | 68 | 1 | 1 | 0 |
| KTM | 250 SX-F | 2024 | 24_3214834_en_OM | 4 | 286 | 63 | 69 | 1 | 1 | 0 |
| KTM | 250 SX-F | 2025 | 25_3240043_en_OM | 20 | 281 | 63 | 69 | 3 | 1 | 0 |
| KTM | 250 SX-F | 2026 | 26_3240234_en_BA | 43 | 269 | 54 | 70 | 1 | 3 | 0 |
| KTM | 250 SX-F | 2027 | 27_3240381_en_BA | 77 | 279 | 59 | 66 | 2 | 4 | 0 |
| KTM | 250 XC | 2026 | 26_3240233_en_BA | 56 | 275 | 43 | 84 | 3 | 2 | 0 |
| KTM | 250 XC | 2027 | 27_3240380_en_BA | 79 | 259 | 39 | 72 | 1 | 2 | 0 |
| KTM | 250 XC-F | 2023 | 23_3214640_en_OM | 1 | 286 | 60 | 69 | 1 | 1 | 0 |
| KTM | 250 XC-F | 2024 | 24_3214834_en_OM | 5 | 289 | 63 | 70 | 1 | 1 | 0 |
| KTM | 250 XC-F | 2025 | 25_3240043_en_OM | 21 | 289 | 63 | 70 | 7 | 1 | 0 |
| KTM | 250 XC-F | 2026 | 26_3240234_en_BA | 44 | 276 | 54 | 70 | 1 | 3 | 0 |
| KTM | 250 XC-F | 2027 | 27_3240381_en_BA | 78 | 279 | 59 | 66 | 2 | 4 | 0 |
| KTM | 300 SX | 2026 | 26_3240233_en_BA | 55 | 274 | 43 | 84 | 3 | 2 | 0 |
| KTM | 300 SX | 2027 | 27_3240380_en_BA | 97 | 258 | 39 | 72 | 1 | 2 | 0 |
| KTM | 300 XC | 2026 | 26_3240233_en_BA | 57 | 275 | 43 | 84 | 3 | 2 | 0 |
| KTM | 300 XC | 2027 | 27_3240380_en_BA | 80 | 259 | 39 | 72 | 1 | 2 | 0 |
| KTM | 350 SX-F | 2023 | 23_3214641_en_OM | 6 | 283 | 61 | 68 | 1 | 1 | 0 |
| KTM | 350 SX-F | 2024 | 24_3214835_en_OM | 8 | 282 | 63 | 69 | 1 | 1 | 0 |
| KTM | 350 SX-F | 2025 | 25_3240044_en_OM | 32 | 285 | 63 | 69 | 1 | 1 | 0 |
| KTM | 350 SX-F | 2026 | 26_3240235_en_BA | 73 | 277 | 55 | 78 | 1 | 3 | 0 |
| KTM | 350 SX-F | 2027 | 27_3240383_en_BA | 89 | 283 | 55 | 85 | 1 | 3 | 0 |
| KTM | 350 XC-F | 2023 | 23_3214641_en_OM | 7 | 285 | 61 | 69 | 1 | 1 | 0 |
| KTM | 350 XC-F | 2024 | 24_3214835_en_OM | 9 | 284 | 63 | 70 | 1 | 1 | 0 |
| KTM | 350 XC-F | 2025 | 25_3240044_en_OM | 34 | 289 | 63 | 70 | 1 | 1 | 0 |
| KTM | 350 XC-F | 2026 | 26_3240235_en_BA | 74 | 237 | 55 | 78 | 1 | 3 | 0 |
| KTM | 350 XC-F | 2027 | 27_3240383_en_BA | 91 | 291 | 55 | 85 | 3 | 3 | 0 |
| KTM | 450 SX-F | 2023 | 23_3214642_en_OM | 10 | 275 | 53 | 68 | 1 | 1 | 0 |
| KTM | 450 SX-F | 2024 | 24_3214836_en_OM | 2 | 282 | 58 | 69 | 1 | 2 | 0 |
| KTM | 450 SX-F | 2025 | 25_3240045_en_OM | 35 | 281 | 58 | 69 | 1 | 2 | 0 |
| KTM | 450 SX-F | 2026 | 26_3240236_en_BA | 63 | 284 | 48 | 85 | 2 | 4 | 0 |
| KTM | 450 SX-F | 2027 | 27_3240384_en_BA | 92 | 268 | 48 | 67 | 2 | 4 | 0 |
| KTM | 450 XC-F | 2023 | 23_3214642_en_OM | 11 | 276 | 53 | 69 | 1 | 1 | 0 |
| KTM | 450 XC-F | 2024 | 24_3214836_en_OM | 3 | 284 | 58 | 70 | 1 | 2 | 0 |
| KTM | 450 XC-F | 2025 | 25_3240045_en_OM | 36 | 285 | 58 | 70 | 5 | 2 | 0 |
| KTM | 450 XC-F | 2026 | 26_3240236_en_BA | 64 | 284 | 48 | 85 | 3 | 4 | 0 |
| KTM | 450 XC-F | 2027 | 27_3240384_en_BA | 93 | 269 | 48 | 67 | 2 | 4 | 0 |
| KTM | 85 SX 17/14 | 2025 | 25_3240038_en_BA | 41 | 247 | 44 | 55 | 0 | 0 | 0 |
| KTM | 85 SX 17/14 | 2026 | 26_3240229_en_BA | 60 | 249 | 43 | 58 | 0 | 0 | 0 |
| KTM | 85 SX 17/14 | 2027 | 27_3240375_en_BA | 98 | 247 | 40 | 58 | 0 | 0 | 0 |
| KTM | 85 SX 19/16 | 2025 | 25_3240038_en_BA | 42 | 247 | 44 | 55 | 0 | 0 | 0 |
| KTM | 85 SX 19/16 | 2026 | 26_3240229_en_BA | 61 | 249 | 43 | 58 | 0 | 0 | 0 |
| KTM | 85 SX 19/16 | 2027 | 27_3240375_en_BA | 99 | 247 | 40 | 58 | 0 | 0 | 0 |
| Husqvarna | FC 250 | 2023 | 23_3402631_en_OM | 12 | 225 | 60 | 73 | 0 | 1 | 0 |
| Husqvarna | FC 250 | 2024 | 24_3402713_en_OM | 13 | 228 | 63 | 73 | 0 | 1 | 0 |
| Husqvarna | FC 250 | 2025 | 25_3402803_en_BA | 62 | 278 | 54 | 73 | 1 | 3 | 0 |
| Husqvarna | FC 250 | 2026 | 26_3402884_en_BA | 75 | 242 | 54 | 76 | 1 | 3 | 0 |
| Husqvarna | FC 250 | 2027 | 27_3402945_en_BA | 81 | 282 | 59 | 75 | 6 | 3 | 0 |
| Husqvarna | FC 350 | 2025 | 25_3402804_en_BA | 58 | 276 | 53 | 73 | 1 | 4 | 0 |
| Husqvarna | FC 350 | 2027 | 27_3402947_en_BA | 82 | 276 | 55 | 72 | 6 | 5 | 0 |
| Husqvarna | FC 450 | 2023 | 23_3402633_en_OM | 14 | 177 | 53 | 68 | 1 | 2 | 0 |
| Husqvarna | FC 450 | 2024 | 24_3402715_en_OM | 16 | 217 | 58 | 67 | 1 | 2 | 0 |
| Husqvarna | FC 450 | 2025 | 25_3402805_en_BA | 45 | 268 | 52 | 68 | 3 | 6 | 0 |
| Husqvarna | FC 450 | 2026 | 26_3402886_en_BA | 76 | 232 | 48 | 73 | 1 | 3 | 0 |
| Husqvarna | FC 450 | 2027 | 27_3402948_en_BA | 84 | 264 | 48 | 73 | 10 | 5 | 0 |
| Husqvarna | FX 350 | 2025 | 25_3402804_en_BA | 59 | 273 | 53 | 73 | 1 | 4 | 0 |
| Husqvarna | FX 350 | 2026 | 26_3402885_en_BA | 65 | 277 | 55 | 71 | 1 | 3 | 1 |
| Husqvarna | FX 350 | 2027 | 27_3402947_en_BA | 83 | 282 | 55 | 72 | 1 | 5 | 0 |
| Husqvarna | FX 450 | 2023 | 23_3402633_en_OM | 15 | 268 | 53 | 68 | 3 | 2 | 0 |
| Husqvarna | FX 450 | 2024 | 24_3402715_en_OM | 17 | 276 | 58 | 68 | 2 | 2 | 0 |
| Husqvarna | FX 450 | 2025 | 25_3402805_en_BA | 46 | 268 | 52 | 68 | 3 | 6 | 0 |
| Husqvarna | FX 450 | 2027 | 27_3402948_en_BA | 85 | 274 | 48 | 73 | 1 | 5 | 0 |
| Husqvarna | TC 125 | 2025 | 25_3402801_en_BA | 37 | 261 | 42 | 71 | 1 | 1 | 0 |
| Husqvarna | TC 125 | 2026 | 26_3402882_en_BA | 66 | 262 | 45 | 71 | 1 | 1 | 1 |
| Husqvarna | TC 125 | 2027 | 27_3402943_en_BA | 86 | 269 | 44 | 76 | 1 | 1 | 1 |
| Husqvarna | TC 150 | 2025 | 25_3402801_en_BA | 31 | 261 | 42 | 71 | 1 | 1 | 0 |
| Husqvarna | TC 250 | 2025 | 25_3402802_en_BA | 38 | 256 | 41 | 70 | 1 | 1 | 0 |
| Husqvarna | TC 250 | 2026 | 26_3402883_en_BA | 67 | 261 | 44 | 70 | 1 | 1 | 0 |
| Husqvarna | TC 250 | 2027 | 27_3402944_en_BA | 87 | 256 | 40 | 69 | 1 | 1 | 0 |
| Husqvarna | TC 300 | 2025 | 25_3402802_en_BA | 39 | 256 | 41 | 70 | 1 | 1 | 0 |
| Husqvarna | TC 300 | 2027 | 27_3402944_en_BA | 88 | 256 | 40 | 69 | 1 | 1 | 0 |
| Husqvarna | TX 300 | 2025 | 25_3402802_en_BA | 40 | 255 | 41 | 70 | 1 | 1 | 0 |
| Husqvarna | TX 300 | 2026 | 26_3402883_en_BA | 68 | 262 | 44 | 70 | 1 | 1 | 0 |
| Husqvarna | TX 300 | 2027 | 27_3402944_en_BA | 90 | 257 | 40 | 69 | 1 | 1 | 0 |
| GasGas | EX 250 | 2025 | 25_3215220_en_BA | 33 | 254 | 41 | 69 | 1 | 0 | 0 |
| GasGas | EX 250F | 2024 | 24_3215160_en_OM | 19 | 286 | 63 | 69 | 1 | 1 | 0 |
| GasGas | EX 250F | 2025 | 25_3215221_en_BA | 23 | 269 | 54 | 63 | 2 | 4 | 0 |
| GasGas | EX 300 | 2025 | 25_3215220_en_BA | 30 | 254 | 41 | 69 | 1 | 0 | 0 |
| GasGas | EX 300 | 2026 | 26_3215267_en_BA | 51 | 261 | 44 | 69 | 1 | 1 | 0 |
| GasGas | EX 300 | 2027 | 27_3215289_en_BA | 72 | 259 | 40 | 76 | 1 | 1 | 1 |
| GasGas | EX 350F | 2025 | 25_3215222_en_BA | 25 | 274 | 53 | 68 | 1 | 5 | 0 |
| GasGas | EX 450F | 2025 | 25_3215223_en_BA | 27 | 270 | 53 | 64 | 1 | 4 | 0 |
| GasGas | MC 125 | 2025 | 25_3215219_en_BA | 28 | 262 | 42 | 71 | 1 | 1 | 0 |
| GasGas | MC 125 | 2026 | 26_3215266_en_BA | 49 | 266 | 45 | 72 | 1 | 1 | 1 |
| GasGas | MC 125 | 2027 | 27_3215288_en_BA | 71 | 271 | 44 | 77 | 1 | 1 | 1 |
| GasGas | MC 250 | 2025 | 25_3215220_en_BA | 29 | 255 | 41 | 69 | 1 | 0 | 0 |
| GasGas | MC 250 | 2026 | 26_3215267_en_BA | 50 | 260 | 44 | 69 | 1 | 1 | 0 |
| GasGas | MC 250F | 2024 | 24_3215160_en_OM | 18 | 223 | 63 | 68 | 0 | 1 | 0 |
| GasGas | MC 250F | 2025 | 25_3215221_en_BA | 22 | 268 | 54 | 63 | 2 | 4 | 0 |
| GasGas | MC 250F | 2026 | 26_3215268_en_BA | 47 | 272 | 54 | 71 | 1 | 3 | 1 |
| GasGas | MC 250F | 2027 | 27_3215290_en_BA | 69 | 280 | 59 | 72 | 1 | 3 | 1 |
| GasGas | MC 350F | 2025 | 25_3215222_en_BA | 24 | 271 | 53 | 68 | 1 | 5 | 0 |
| GasGas | MC 450F | 2025 | 25_3215223_en_BA | 26 | 267 | 53 | 64 | 1 | 4 | 0 |
| GasGas | MC 450F | 2026 | 26_3215269_en_BA | 48 | 269 | 48 | 73 | 1 | 4 | 1 |
| GasGas | MC 450F | 2027 | 27_3215291_en_BA | 70 | 270 | 48 | 74 | 1 | 4 | 1 |

## Bike-years in the index for these documents that produced no payload

The cover does not name the model, so nothing was read for it (same rule and same outcome as the 2026-10-13 review):

| Make | Model | Year | Document | Cover reads |
|---|---|---|---|---|
| KTM | 150 SX | 2026 | 26_3240232_en_BA | Owner's manual 2026 125 SX 125 XC |
| KTM | 150 SX | 2027 | 27_3240379_en_BA | Owner's manual 2027 125 SX 125 XC |
| Husqvarna | FC 350 | 2026 | 26_3402885_en_BA | Owner's manual 2026 FX 350 |
| Husqvarna | FX 450 | 2026 | 26_3402886_en_BA | Owner's manual 2026 FC 450, FC 450 Factory Edition |
| Husqvarna | TC 300 | 2026 | 26_3402883_en_BA | Owner's manual 2026 TC 250 TX 300 |
| GasGas | EX 250F | 2026 | 26_3215268_en_BA | Owner's manual 2026 MC 250F |
| GasGas | EX 250F | 2027 | 27_3215290_en_BA | Owner's manual 2027 MC 250F |
| GasGas | EX 450F | 2026 | 26_3215269_en_BA | Owner's manual 2026 MC 450F |
| GasGas | EX 450F | 2027 | 27_3215291_en_BA | Owner's manual 2027 MC 450F |
| GasGas | MC 250 | 2027 | 27_3215289_en_BA | Owner's manual 2027 EX 300 |

## Torque rows not stored, and why

Conflicts (one path, two printed values, no validity note that separates them):

| Path | Bike-years |
|---|---|
| Chassis tightening torques / Screw, throttle valve body hose clamp (M4): 2.8 Nm and 5 Nm | Husqvarna FC 450 2023, FX 450 2023, FC 450 2024, FX 450 2024 |
| Chassis tightening torques / Screw, subframe, bottom (M8) | KTM 125 SX, 125 XC, 250 SX, 300 SX, 250 XC, 300 XC, 450 SX-F, 450 XC-F 2026 |
| Chassis tightening torques / Screw, hose clamp, throttle body (M4) | KTM 125 SX, 125 XC, 250 SX, 300 SX, 250 XC, 300 XC 2026 |
| Chassis tightening torques / Screw, chain guide on swingarm, rear (M6x16): printed twice, once with a Loctite remark | KTM 250 SX-F, 250 XC-F, 450 SX-F, 450 XC-F 2027 |

Shape flags (the row as the extractor read it does not stand on its own):

| Path and value as read | Flag | Bike-years |
|---|---|---|
| Screw, camshaft bearing bridge (1. M7x1 Engine oil 2.) = 5 Nm; Nut, cylinder head (1. M10x1.25 Engine oil 2. 3.) = 10 Nm, and the other stage fragments of these rows (= 30 Nm, = 180 °, = Apply oil to collar and, Screw, cylinder head (4. …) = 50 Nm) | torque (multi-stage row in the new layout) | 32 bike-years: the 2025-2027 four-strokes read with the new layout |
| Screw, camshaft bearing bridge / Nut, cylinder head with "1st tightening stage … 2nd tightening stage" inside the label | longlabel | GasGas MC 250F / EX 250F 2025, Husqvarna FC 250 2025 |
| Screw, side stand attachment / side stand bracket / Side stand screw (M8, M8x26) = (24.3 ft ⋅ lb); Loctite® 2701 | shape (value starts with the unit conversion; the Nm figure is on a shared variant line) | 39 bike-years, 2025-2027 |
| Side stand screw (M8) = Loctite® 2701; Screw, side stand attachment (M8) = Loctite® 2701 | torque (no torque figure) | Husqvarna TC 250 / TC 300 / TX 300 2025, FC 350 / FX 350 2025 |
| Oil nozzle for the clutch lubrication (alternator cover sealing surface) (M4) = 0.8 Nm | longlabel (label over 75 characters) | 23 bike-years, 450 four-strokes |
| Spark plug (M10x1) = 10 Nm … 12 Nm; 8.9 ft ⋅ lb ) | parens | 11 bike-years, 450 four-strokes 2025-2027 |
| Nut, primary gear (M18LHx1.5) = 150 Nm; ) Loctite® 243 | parens | KTM 250 SX / 300 SX / 250 XC / 300 XC 2026 and 2027 |

Rows the extractor does not read at all (noted in the build reports, nothing stored): tightening-torque rows the new layout
splits by model inside one row (notes `VARIANT`: "Screw, subframe, bottom", "Screw, chain slider", "Subframe screw / Side stand
screw", triple-clamp and front-brake-caliper rows with forged/milled variants) and the "(All TX models) 33 Nm" / "45 Nm" variant
lines that have no label of their own (`NOLABEL`). These are the "Tightening-torque rows the manual splits by model inside one
row" the 2026-10-13 review already left out.

Every manual's torque tables were otherwise read. No manual had an unreadable torque table.

Non-torque rows also dropped in this run, for the record: the fuse rows (two fuse rows share one label, as before), tires
printed with a validity note the parser does not understand ("SX-F US, all special models", "All SX F models"), and the
duplicate fork/shock rows of the 2025 KTM XC-F and 2027 Husqvarna FC manuals. Ten shock high-speed compression groups were
withheld by the damper cross-check (GasGas MC 250F 2026/2027, MC 450F 2026/2027, MC 125 2026/2027, EX 300 2027; Husqvarna FX 350
2026, TC 125 2026/2027), as in the 2026-10-13 review. None of this is new: those rows are already on file or already withheld.

## Spot checks

34 torque rows (12 KTM, 12 Husqvarna, 10 GasGas, both layouts, one of them a KTM 85 SX) were picked at random from the payloads
and the PDF page named in the row was opened with pdfplumber: the printed label, the thread size on the following line (new
layout) or the same line (old layout), the torque figure and, where present, the Loctite / EJOT remark were on that page and
the printed page number matched. For the remarks the glyph positions were checked on 26_3240234 page 179 ("Front sprocket screw
60 Nm / M10 / Loctite 243" at 313, 326 and 338 pt, next row at 353 pt) and 27_3402948 page 164 (push rod ball joint). All 34
matched; none was corrected.

| Make | Model | Year | Document | PDF page | Printed page | Path | Value | Label and figure found on the page |
|---|---|---|---|---|---|---|---|---|
| GasGas | MC 250F | 2024 | 24_3215160_en_OM | 145 | 143 | Engine tightening torques / Screw, starter motor - intermediate gear (M6) | 10 Nm (7.4 lbf ft); Loctite 243™ | yes |
| GasGas | EX 250F | 2024 | 24_3215160_en_OM | 151 | 149 | Chassis tightening torques / Remaining nuts, chassis (M5) | 5 Nm (3.7 lbf ft) | yes |
| GasGas | EX 250F | 2024 | 24_3215160_en_OM | 144 | 142 | Engine tightening torques / Oil nozzle for conrod bearing lubrication (M4) | 2 Nm (1.5 lbf ft); Loctite 243™ | yes |
| Husqvarna | FC 250 | 2023 | 23_3402631_en_OM | 140 | 138 | Chassis tightening torques / Remaining nuts, chassis (M5) | 5 Nm (3.7 lbf ft) | yes |
| Husqvarna | FX 450 | 2024 | 24_3402715_en_OM | 157 | 155 | Engine tightening torques / Screw, alternator cover (M6x25) | 10 Nm (7.4 lbf ft) | yes |
| Husqvarna | FC 450 | 2024 | 24_3402715_en_OM | 167 | 165 | Chassis tightening torques / Screw, front wheel spindle (M20x1.5) | 35 Nm (25.8 lbf ft) | yes |
| KTM | 350 XC-F | 2024 | 24_3214835_en_OM | 154 | 152 | Chassis tightening torques / Screw, brake line guide on link fork (M6) | 4.5 Nm (3.32 lbf ft) | yes |
| KTM | 250 SX-F | 2024 | 24_3214834_en_OM | 160 | 158 | Chassis tightening torques / Screw, bottom shock absorber (M10) | 60 Nm (44.3 lbf ft); Loctite 2701™ | yes |
| KTM | 350 XC-F | 2024 | 24_3214835_en_OM | 153 | 151 | Chassis tightening torques / Screw, seat fixing (EJOT EJOFORM PT® K60x23/18) | 2.5 Nm (1.84 lbf ft) | yes |
| GasGas | EX 450F | 2025 | 25_3215223_en_BA | 161 | 161 | Chassis tightening torques / Spoke nipple, rear wheel (M4,5) | 6 Nm | yes |
| GasGas | MC 350F | 2025 | 25_3215222_en_BA | 143 | 143 | Chassis tightening torques / Nut, throttle cable on throttle body (M6) | 3 Nm | yes |
| Husqvarna | TC 300 | 2025 | 25_3402802_en_BA | 147 | 147 | Chassis tightening torques / Nut, throttle cable on throttle body (M6) | 3 Nm | yes |
| Husqvarna | TC 150 | 2025 | 25_3402801_en_BA | 135 | 135 | Engine tightening torques / Screw, reed valve support plate (EJOT DELTA PT® ‒ M3x12) | 1 Nm | yes |
| KTM | 250 SX-F | 2025 | 25_3240043_en_OM | 154 | 152 | Chassis tightening torques / Screw, shock absorber adjusting ring (M5) | 5 Nm (3.7 lbf ft) | yes |
| KTM | 85 SX 17/14 | 2025 | 25_3240038_en_BA | 129 | 129 | Chassis tightening torques / Screw, rear sprocket (M8) | 35 Nm; Loctite® 2701 | yes |
| GasGas | MC 450F | 2026 | 26_3215269_en_BA | 142 | 142 | Chassis tightening torques / Screw, intake air temperature sensor (K50x18) | 0.7 Nm; EJOT PT® | yes |
| GasGas | EX 300 | 2026 | 26_3215267_en_BA | 145 | 145 | Engine tightening torques / Screw, water pump cover (M6) | 10 Nm | yes |
| GasGas | MC 450F | 2026 | 26_3215269_en_BA | 137 | 137 | Engine tightening torques / Stator screw (M5) | 6 Nm; Loctite® 2701 | yes |
| Husqvarna | FX 350 | 2025 | 25_3402804_en_BA | 147 | 147 | Engine tightening torques / Stator screw (M5) | 6 Nm; Loctite® 2701 | yes |
| Husqvarna | FC 250 | 2025 | 25_3402803_en_BA | 143 | 143 | Engine tightening torques / Oil plug (M24x3) | hand-tight | yes |
| Husqvarna | FX 350 | 2025 | 25_3402804_en_BA | 145 | 145 | Chassis tightening torques / Screw, chain guide on swingarm, front (M6) | 10 Nm | yes |
| KTM | 85 SX 19/16 | 2026 | 26_3240229_en_BA | 129 | 129 | Chassis tightening torques / Screw, seat installation (M6) | 8 Nm | yes |
| KTM | 250 XC-F | 2026 | 26_3240234_en_BA | 181 | 181 | Chassis tightening torques / Screw, starter cable to starter relay (M6) | 6 Nm | yes |
| KTM | 250 SX-F | 2026 | 26_3240234_en_BA | 179 | 179 | Engine tightening torques / Front sprocket screw (M10) | 60 Nm; Loctite® 243 | yes |
| GasGas | MC 450F | 2027 | 27_3215291_en_BA | 139 | 139 | Engine tightening torques / Crankshaft speed sensor screw and cable retainer (M5) | 6 Nm; Loctite® 243 | yes |
| GasGas | EX 300 | 2027 | 27_3215289_en_BA | 134 | 134 | Engine tightening torques / Actuator cover screw (M5) | 5 Nm; Loctite® 243 | yes |
| Husqvarna | FC 250 | 2026 | 26_3402884_en_BA | 166 | 166 | Engine tightening torques / Screw, oil pump cover (M5) | 6 Nm; Loctite® 243 | yes |
| Husqvarna | FC 250 | 2026 | 26_3402884_en_BA | 168 | 168 | Engine tightening torques / Nut, inner clutch hub (M18x1.5) | 100 Nm | yes |
| KTM | 350 XC-F | 2026 | 26_3240235_en_BA | 168 | 168 | Chassis tightening torques / Remaining screws on chassis (M5) | 5 Nm | yes |
| KTM | 350 XC-F | 2026 | 26_3240235_en_BA | 171 | 171 | Chassis tightening torques / Nut, linkage lever on angle lever (M14x1.5) | 60 Nm | yes |
| Husqvarna | FX 450 | 2027 | 27_3402948_en_BA | 164 | 164 | Chassis tightening torques / Screw, push rod ball joint on the rear brake cylinder (M6) | 10 Nm; Loctite® 243 | yes |
| Husqvarna | TC 125 | 2027 | 27_3402943_en_BA | 151 | 151 | Chassis tightening torques / Combination switch screw (EJOT PT® ‒ K50x18) | 2 Nm | yes |
| KTM | 85 SX 19/16 | 2027 | 27_3240375_en_BA | 131 | 131 | Chassis tightening torques / Screw, clutch assembly on handlebar (M6) | 5 Nm | yes |
| KTM | 300 SX | 2027 | 27_3240380_en_BA | 152 | 152 | Engine tightening torques / Screw, drive chain front sprocket (M10) | 60 Nm; Loctite® 2701 | yes |

## Loading

`select private.kg(make, model, yr, doc, sha, null, null, want, '', delta)` per payload, as before; `want` is recomputed by the
loader over the whole `delta`, so a payload loads as a unit, and the rows already on file for the bike-year are skipped by
`ON CONFLICT DO NOTHING`. Expected inserts per bike-year: the torque columns of the table above (fewer where a torque path was
already on file). The 85 SX 2025-2027 and the 2025 manuals re-read on 2026-10-13 may already hold some torque rows; those are
skipped the same way.
