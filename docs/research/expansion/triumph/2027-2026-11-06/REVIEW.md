# Triumph 2027 TF 250-X / TF 450-X and 2025 TF 250-X VIN split: owner's handbook pass, 2026-11-06

Source rule as before: only the US English owner's handbooks Triumph publishes without sign-in on the Handbooks page of
triumphtechnicalinformation.com (listing and PDFs through the public API that page uses). Service manuals were not opened. No account was used.
Facts only, no handbook sentences copied, no value invented. Nothing was written to the database; every file here is a payload or a report.
The PDFs were downloaded to a scratch folder, hashed, read and deleted.

## Documents

| Handbook | API document id | Bytes | PDF pages | SHA-256 | Covers (portal listing on 2026-11-06) |
|---|---|---:|---:|---|---|
| 3850823-US | 6ab239eb1685389dfa339f9a | 11287372 | 226 | e1cf3fb2e9210c91e441e610e69d1705daf93c16867729745e8ae5a7f87b77cc | TF250-X 2027 (ZB3) **and now TF450-X 2027 (ZD3)** |
| 3850672-US | 697b0a68aa5a3d37f2aa2ef0 | 9973068 | 248 | 384f437964981d64de075a220d87fdf7d74b5c35529940d44d14f4d14ffdc317 | TF250-X 2025 from VIN CF3825, TF250-X 2026, TF450-X 2026, TF450RC Edition 2025 |
| 3850529-US | 697b08172114eb1a98f6704f | 9534471 | 228 | c615b7b3a97d3329beeb7a7fe6dfb869fb5d45d0855690a78d8d7a8e3d04bd42 | TF250-X 2023-2024, TF250-X 2025 VIN BS4847 to before CC7868 |
| 3850699-US | 697b1c4ec47604be99a352a4 | 56626302 | 230 | 793bf0e713f0597d77a66ba1239e858ff2a42ac06b75f765891a2619becd5c30 | TF250-C / TF450-C 2026 (used for the guided jobs and the row check only) |
| 3850136-US | 697b112531d8347c29c5ce2b | 12194614 | 256 | 301b80987eade7c883daecdf14bf38a92641369e54776f8a38f86077c19fe559 | TF250-E / TF450-E 2026 (guided jobs and row check only) |

All five hashes equal the ones already on file (HANDBOOK_REVIEW_2026-10-13.md, gaps/triumph/sources.json). New since the
2026-10-30 source hunt: the portal now attaches 3850823 to the TF450-X 2027 product (ZD3) as well, so the TF 450-X 2027 rows below
come from a handbook Triumph lists for that bike. No new addendum is listed for any Triumph off-road product. PDF page = printed page
in all five handbooks.

## Payloads (for `private.stage_manual_rows`, empty base)

Same format as `scripts/manual-textlayer/build_triumph.py` / `build_triumph_schedule.py`: `make, model, yr, url, sha, rev, ref, want, delta, n`;
each delta line is `+|pdf|printed|path|value|`, `want` is the SHA-256 of the lines ordered by SHA-256 of the path. All eight `want`
values were recomputed independently from the delta before handing over. Row ids are `md5(make|model|yr|textlayer|path)`, so these
cannot collide with the source-hunt rows (different paths and id scheme) and re-loading is a no-op.

| File | Bike | Rows | What |
|---|---|---:|---|
| tf-250-x-2027-specifications.json | TF 250-X 2027 | 58 | Specifications chapter (pp. 214-217): engine, lubrication incl. oil capacity dry / wet with and without filter and the recommended oil, cooling, fuel, ignition and plug, transmission and all gear ratios, tyres and pressures, electrical, rake/trail, torque table, fluids incl. brake fluid; plus the factory clicker settings (p. 65 shock, p. 71 fork) |
| tf-450-x-2027-specifications.json | TF 450-X 2027 | 57 | Same for the TF450-X tables (pp. 218-222, 65, 71) |
| tf-250-x-2027-schedule.json, tf-450-x-2027-schedule.json | each 2027 bike | 64 each | Scheduled Maintenance Table pp. 94-96, printed once for both models: includes **Valve clearances - check/adjust** (after the first hour, every 45 and 90 h, marked *), oil/filter/strainers, air filter, plug, clutch, fork and shock service, bearings, brakes, chain, battery, ECM |
| tf-250-x-2027-handbook-facts.json, tf-450-x-2027-handbook-facts.json | each 2027 bike | 13 each | Facts the 2026 bikes have from the hand pass and 2027 lacked: front/rear disc run-out limit, rear pad minimums (inner/outer), engine maps, map switch, traction control, launch control on/off, quickshifter, quickshifter reset, fault light, break-in throttle limits |
| tf-250-x-2025-vin-before-CC7868.json | TF 250-X 2025 | 10 | From 3850529: rows printed differently in the two 2025 handbooks, each path naming "frames before VIN CC7868" |
| tf-250-x-2025-vin-from-CF3825.json | TF 250-X 2025 | 11 | From 3850672: the same rows, each path naming "frames from VIN CF3825" |

The 2027 specification and schedule rows use exactly the paths of the 2026 text-layer rows, so the app reads 2027 like 2026. The
source-hunt pass (2026-10-30) already holds many of the same 2027 values under its own wording (e.g. "Lubrication / Oil capacity (dry fill)");
the values agree, this adds the vocabulary the 2026 rows and the coverage matcher use. Why 2027 showed "no oil capacity": the coverage
flag needs the words "engine oil" next to "capacity"; the source-hunt rows say only "Oil capacity". Expect the same flags as 2026 after loading.

### 2027 values that changed against the 2026 handbook (3850672) and are now in the rows

| Item | 2026 (3850672) | 2027 (3850823) | Page |
|---|---|---|---|
| TF 250-X shock rebound / low-speed / high-speed | 11 / 11 clicks / 7/8 turn | 13 / 13 clicks / 1 1/2 turns | 65 |
| TF 250-X fork compression / rebound | 10 / 12 clicks | 12 / 12 clicks | 71 |
| TF 450-X shock rebound / low-speed / high-speed | 12 / 14 clicks / 1 1/4 turn | 12 / 12 clicks / 1 1/4 turn | 65 |
| TF 450-X fork compression / rebound | 14 / 12 clicks | 13 / 11 clicks | 71 |
| Engine maps | MAP 1 standard, MAP 2 full power | **MAP 1 full power, MAP 2 softened** (switch still lit on MAP 2) | 36 |
| Quickshifter reset | long press | engine running, clutch in, 1st gear, pedal held down, hold switch | 48 |
| Fault light | separate MIL | quickshifter switch light is the MIL | 28 |
| Disc run-out service limit (front and rear) | 0.002 in (0.05 mm) | 0.007 in (0.182 mm) | 155, 156 |
| Schedule: steering free-operation check | 1st h, 15, 45, 90 h | adds every 30 h | 95 |
| Schedule: rear suspension unit leak/wear check | 15, 45, 90 h | adds every 30 h | 95 |
| Holeshot device | described (if equipped) | not in the 2027 handbook | - |

The schedule was parsed from the grid by `triumph_schedule.py` (64 rows, no problems) and page 95 was rendered and compared mark for
mark with the parsed rows (the two changed rows above included); identical.

## TF 250-X 2025: rows by VIN

Triumph lists the 2025 TF 250-X twice: "VIN BS4847 < CC7868" with handbook 3850529 and "VIN CF3825 >" with 3850672. The earlier pass kept
only rows both print identically and withheld seven. Running `build_triumph.py`'s comparison again, plus the maintenance-chapter values
the gap pass compares, gives these differences. Each is now its own row; the VIN range is in the path, so it is in the statement the
app shows (`stage_manual_rows` builds the statement as `path: value`). For the shock rows the range sits right after "Shock absorber" so
the damping and sag condition texts still attach and the domain stays "suspension".

| Row | Frames before VIN CC7868 (3850529) | Frames from VIN CF3825 (3850672) |
|---|---|---|
| Shock rebound damping, standard | 12 clicks (p. 70) | 11 clicks (p. 74) |
| Shock low-speed compression, standard | 10 clicks (p. 70) | 11 clicks (p. 74) |
| Shock high-speed compression, standard | 1 turn (p. 70) | 7/8 turn (p. 74) |
| Riding sag | 4.1 in (105 mm) (p. 69) | 4.02 in (102 mm) (p. 72) |
| Engine idle speed | 2200 - 2400 rpm (p. 117) | 2250 - 2350 rpm (p. 125) |
| Drive chain wear limit, 20 links | 12.5 in (317.5 mm) (p. 141) | 12.6 in (320 mm) (p. 151) |
| Front disc thickness, standard | 0.13 in (3.20 mm) (p. 157) | 0.12 in (3.00 mm) (p. 170) |
| Cooling system capacity | 0.63 gallon (2.4 liters) (p. 214) | 0.25 gallons (0.95 liters) (p. 232) |
| Displacement | 15.3 cu in (250 cc) (p. 214) | 15.2 cu in (249.9 cc) (p. 232) |
| Clutch type | "Wet, multiplate" (p. 215) | "Wet multiplate" (p. 233) |
| Rear tyre size | not printed (the row carries the rim size "19 x 1.85", left out as before) | 100/90-19 (p. 234) |

Notes:
- The coolant capacity in 3850529 (2.4 L) is what that handbook prints and is the value already stored for the 2024 bike; it is far
  from the 0.95 L of every later handbook. Stored as printed, but worth a look before a rider tops up by volume.
- Displacement and clutch type differ only in rounding and punctuation; they are split anyway so the "identical rows only" rule stays simple.
- Riding sag, idle speed, chain wear limit and front disc thickness were never withheld rows (the riding sag table on p. 72 of 3850672
  is not read by the settings parser, and the other three are maintenance-chapter values); they are added because a 2025 rider needs them.
- **Already loaded and not VIN-qualified:** three VERIFIED 2025 TF 250-X rows from the gap pass carry the CF3825-onward shock settings
  without a VIN range: `93b4de23-2cf9-5bb6-9a36-e5e2d3d12f2b` (rebound 11 clicks), `b5704a4a-974f-5948-8719-88692e05c699`
  (low-speed 11 clicks), `ddec5b92-0fe5-5660-bde0-da45e8db4306` (high-speed 7/8 turn), all from 3850672 p. 74. A rider with a frame before
  CC7868 is shown the wrong stock shock settings by those rows. Suggest demoting them or rewriting their statements to name the VIN range
  once these payloads are loaded. No database change was made here.

## Reviewed-rows check (`reviewed-rows-check.json`)

Task: the 1085 Triumph claims with status REVIEWED (suspension pass 2026-10-26 and gap pass) have no `document_sha256` and
`conflicts_checked=false`. Read with SELECT only.

- The 1085 rows were matched to the local insert files they came from (`suspension-pass/claims.sql`, `gaps/triumph/claims_0.sql`);
  md5 over `id|statement|source_locator` of the 1085 rows equals the database value (`cf11caff5521ccd25c445d0a2d99dad3`).
- Documents: 697b08 (226 rows), 697b0a (348), 697b11 (243), 697b1c (238), 6ab239 (30). Each was downloaded and hashed; the SHA-256 per row
  is the hash of its own source URL's PDF (table above).
- Page check: schedule rows were compared with the Scheduled Maintenance Table parsed from that PDF's grid (value must be identical);
  every other row must have each figure of its value (or, for text values, each word longer than three letters) in the text of the
  page(s) its locator names. Result: 1085 of 1085 `matches_page: true`. The check is per page, not per table cell, so a figure printed
  elsewhere on the same page would also pass; the suspension rows were additionally compared with VERIFIED rows (below).
- Conflict check: against every VERIFIED Triumph row for the same bike and year with the same joint (995 rows had one) and, through a
  mapping of the other wording ("... standard setting" against "Shock absorber / ... / Standard" and the source-hunt names, fork oil
  volumes, spring options, static sag), against VERIFIED rows of the other passes (30 more pairs). No value conflict:
  `conflicts_with_verified` is null for all 1085. Two 2027 rows ("Rear shock / Spring selection by rider weight") differ from their
  VERIFIED twin only by the "kg"/"lbs" labels; noted per row.
- TF 250-X 2025: 113 REVIEWED rows; each was checked against the other 2025 handbook. All 113 are printed the same in both
  (none of them is one of the VIN-split rows above), so they hold for every 2025 frame; noted per row.
- The weight bands "75 - 85 (143 - 187)" in the 2024-2026 spring-selection rows are a misprint in those handbooks (143 should be 165);
  the rows reproduce it as printed. 3850823 prints 165 - 187.

## Not available from the handbooks (left out)

- Riding sag for 2027: the 2027 handbook gives the riding sag method (p. 60) but no figure. Static sag 1.42 in (36 mm) is printed (p. 64).
- Valve clearance figures (intake/exhaust mm) for any Triumph: only the schedule interval is in the owner's handbooks; the check and the
  clearances are in the licensed service manual. The schedule row "Valve clearances - check/adjust" is what the coverage audit counts as
  the valve-clearance flag for 2026, and is now in the 2027 payloads.
- Holeshot device for 2027: not described in 3850823.
- TF 250-E / TF 450-E / TF 250-C / TF 450-C 2027: no handbook on the portal (E products listed without documents; C 2027 not listed).

## Loaded (2026-11-06)
- All 8 payloads loaded with private.stage_manual_rows (every hash matched, 290 rows); 289 promoted to VERIFIED. Held back: the
  2.4 L cooling-system capacity printed in handbook 3850529 (2025 frames before CC7868); the same 2.4 L row for 2024 was also set
  back to REVIEWED. It is implausible for a 250 and riders should fill by level (the coolant job now says so).
- The 1085 REVIEWED rows got document_sha256, approved_document_sha256, rights.reference and conflicts_checked from
  reviewed-rows-check.json; 1084 passed the evidence gate and were promoted (the 2.4 L row excluded).
- The three 2025 TF 250-X shock rows without a VIN range (93b4de23, b5704a4a, ddec5b92) were set back to REVIEWED; the VIN-scoped
  rows replace them.
