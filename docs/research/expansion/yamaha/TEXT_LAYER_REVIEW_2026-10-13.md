# Yamaha specification tables, text-layer extraction, 2026-10-13

Follow-up to `TEXT_LAYER_REVIEW_2026-10-09.md`. The reader used on 2026-10-09 ran in a browser and was not kept; it was
rebuilt as `scripts/manual-textlayer/yamaha_specs.py` (specification chapter), `yamaha_dampers.py` (damper cross-check) and
`build_yamaha_specs.py` (payloads), and the 2020-2021 manuals that were still missing were found in Yamaha's Owner's Manual
Library through the library's own model-year lookup.

## What was added

| Bike | Manual | Rows | Dampers checked |
|---|---|---|---|
| YZ250FX 2020 | `BAJ-28199-10` / LIT-11626-33-34 | 209 | 15 of 15 |
| YZ450FX 2020 | `B3J-28199-11` / LIT-11626-33-25 | 214 | 15 of 15 |
| YZ250 2021 | `BF1-2819U-10` / LIT-11626-34-10 (covers YZ250 and YZ250X) | 173 | 15 of 15 |
| YZ250X 2021 | `BF1-2819U-10` / LIT-11626-34-10 | 174 | 15 of 15 |

Each is the full chapter 2 specification table (general, engine, chassis; electrical and tightening torques are not read here)
plus the rider-sag figure from the rear suspension setting section. The 2021 YZ250 / YZ250X manual, which failed the damper
cross-check on 2026-10-09 because one manual prints both models' values, is now read per model: a value tagged "(YZ250X)" goes
to that model only, an untagged value to both.

Compared with the 2026-10-09 rows, three row types are new: degree and ohm values (caster angle, coolant temperature, injector
resistance), which the earlier pass dropped because the text layer carries them as Symbol-font code points (now mapped back,
see below), and the carburetor "Type × quantity" row on the two-strokes.

## Method

1. Pages headed GENERAL / ENGINE / CHASSIS SPECIFICATIONS. The label column is x < 315 pt, the value column x ≥ 315 pt.
   Indentation gives section (x < 70), sub-section (a line without a value at x ≈ 75) and label; a label at the sub-section
   indent ends the sub-section. A wrapped label or a value continued on the next line is joined to its row.
2. The imperial conversion in brackets is dropped; a plain metric value is split from its unit, and a single number is
   normalised (`0.90` → `0.9`), ranges are kept as printed. Damper rows take their unit from the "Unit for adjustment" row.
3. Symbol-font glyphs: older manuals carry them as private-use code points (U+F0B0 °, U+F057 Ω, U+F0B4 ×, U+F0B1 ±),
   2025-on manuals as the ASCII slot of the Symbol font ("W" for Ω, "´" for ×). Both are mapped back; any other Symbol glyph
   drops its row.
4. 2020 four-stroke manuals print service limits as a separate "Limit" row under the nominal value; it is stored as
   "<label> limit". Clutch "Wear limit" / "Plate quantity" / "Warpage limit" rows are prefixed with the plate they follow.
5. Damper cross-check (`yamaha_dampers.py`): the adjustment procedures in chapter 3 ("ADJUSTING THE FRONT FORK LEGS",
   "ADJUSTING THE REAR SHOCK ABSORBER", two-column pages read column by column) print Minimum (soft) / Standard / Maximum (hard)
   for each damper, with a model tag where two models share the manual. Every Soft / STD / Hard value in the specification
   table must equal them, and all five damper groups must be present, or the bike-year is not written.
6. Payloads go through `private.stage_manual_rows` with an empty base; stored only when the rebuilt table's SHA-256 equals the
   hash computed where the PDF was read (4 of 4 matched). Staged, evidence gate, verified.

## Checks that were run

- Regression against the 2026-10-09 rows: the reader was run on four manuals already on file and compared with the stored
  rows line for line (page, printed page, path, value, unit). 2021 YZ450FX (180 rows), 2021 YZ250FX (179) and 2027 YZ450F (189)
  are identical; 2022 YZ250 (168) is identical apart from the new "Type × quantity" row. The degree / ohm rows are new on all four.
- 2020 YZ250FX page 52 (front and rear suspension, 35 rows) rendered and compared row for row: identical.
- No path occurs twice for a bike; every damper group has its Soft, STD and Hard value.

## 2020 two-strokes (added 2026-10-14)

| Bike | Manual | Rows | Dampers |
|---|---|---|---|
| YZ125 2020 | `B0V-28199-11` (covers YZ125 and YZ125X) | 180 | 15 |
| YZ125X 2020 | `B0V-28199-11` | 181 | 15 |
| YZ250 2020 | `B9U-28199-11` (covers YZ250 and YZ250X) | 179 | 15 |
| YZ250X 2020 | `B9U-28199-11` | 180 | 15 |

These manuals use an older layout, read by `yamaha_specs_2020.py` / `build_yamaha_specs_2020.py`:

1. GENERAL SPECIFICATIONS (item | value) and MAINTENANCE SPECIFICATIONS (item | Standard | Limit) are ruled tables; the
   table's own vertical rules give the columns. Where a value differs by market the Standard cell is split by an inner rule
   under a header such as "USA, CAN, EUROPE, NZ, ZA | AUS"; only the sub-column whose header names USA is read, and a split
   whose first column does not name USA stops the bike-year. Market-tagged value lines ("B9U5 (USA, CAN)") keep the USA line.
2. Model rows ("YZ250" / "YZ250X" sub-headings, or a "(YZ250X)" tag on the label) go to that model only.
3. A Limit-column value is stored as "<label> limit"; a label that already says "limit" ("Runout limit") keeps its name for
   the limit and its standard value is stored as "<name> (standard)". "Quantity" / "Operation" rows are named after the row
   they belong to ("Friction plate quantity", "Front brake operation").
4. Every millimetre value printed with an inch conversion is checked against it. Two rows fail and are not stored: the
   clutch housing radial clearance (B9U prints 0.03–0.05 mm as 0.0012–0.0022 in; B0V prints 0.01–0.04 mm as
   0.0006–0.0018 in). The B0V model-code row lists two US codes without naming the model, so it is not stored either.
5. The damper settings are not in the specification table in this layout. They are read from the adjustment procedures
   ("ADJUSTING THE FRONT FORK REBOUND DAMPING FORCE" ... "HIGH COMPRESSION DAMPING FORCE"): "Extent of adjustment" gives
   Maximum = fully turned in (stored as Hard 0) and Minimum = N clicks / turns out (Soft); "Standard position" gives the
   per-model standard (STD), stored as printed, including ranges ("10–13 clicks out") and tolerances ("1-5/8±1/6 turns").
   All five dampers with all three values are required. There is no second copy in the table to cross-check against.
6. The general and maintenance tables both print the carburetor type; one copy is kept when they agree, otherwise the
   bike-year stops. The YZ125 carburetor type is stored as printed ("TMXχ38SS/MIKUNI").
7. Rendered and compared by eye: B9U pages 2-1 (dimensions, market split) and 2-7 (chassis, market split, model rows), and
   the four standard-position blocks per manual.

Loaded through `private.stage_manual_rows` with an empty base: 4 of 4 hashes matched, 720 rows staged and verified.

## Still missing in the launch scope

None for Yamaha specification tables: every 2020-2027 motocross and cross-country model year in scope is on file.
