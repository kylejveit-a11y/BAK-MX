# Owner's-manual text-layer extraction

Reads the technical-data chapter and the service schedule of a manufacturer's owner's manual PDF with glyph positions
(pdfplumber) and produces hash-guarded payloads for `private.kg` / `private.stage_manual_rows` (migration `20261010010000`).
Facts only; the PDFs are never stored or redistributed.

KTM, Husqvarna, GasGas:

- `tech_data_2020_2025.py`: manuals with the "TECHNICAL DATA" / "TECHNICAL SPECIFICATIONS" page header.
- `tech_data_2025_plus.py`: manuals with the "Technical specifications" header (new authoring system).
- `service_schedule.py`: both layouts. A mark sits 7.3 pt left of the right edge of its column header;
  open circle = one-time, filled circle = periodic.
- `validity.py`: decides whether a printed validity note ("All SX models", "125 XC US", "All SX-F except US", "Big wheel", ...)
  applies to the US standard model being loaded. Run it directly for its self-test. Notes it does not understand drop their rows.
- `plan.py` / `build_payloads.py`: the two-stroke minis and 125/150 documents.
- `build_from_index.py`: every document in `docs/research/manual-index/ktm-group-us.tsv` with a given status; writes a report
  per document (dropped conflicts, flagged shapes, notes seen).
- `check_dampers.py`, `finalize_payloads.py`: damper cross-check against the adjustment section, then the final load set.

Triumph:

- `triumph_handbook.py`, `build_triumph.py`: Specifications chapter and factory suspension settings from the public US handbooks.

Yamaha:

- `yamaha_schedule.py`: the MAINTENANCE INTERVALS table of the Owner's Service Manual. The table's own rule lines define
  the cells (full-width rules to 2024, one segment per cell from 2025) and the check mark is a Symbol-font glyph.
  Text printed across the interval columns ("Every one year") is kept as its own interval entry.
  The 2020 two-stroke manuals use an older table (items in capitals, dots, a Remarks column): `parse_old`, `--old`.
- `build_yamaha_schedule.py`: payloads for `stage_manual_rows` with an empty base.
- `yamaha_specs.py`: the chapter 2 specification table (general, engine, chassis) and the rider-sag figure; `--model` picks a
  model in a manual shared by two. Checked line for line against the rows loaded on 2026-10-09.
- `yamaha_dampers.py`: Minimum / Standard / Maximum from the adjustment procedures, compared with every Soft / STD / Hard row.
- `build_yamaha_specs.py`: jobs file `MODEL|YEAR|CODE|PDF` → payloads; a bike-year that fails the damper check is not written.
- Yamaha's library lists manuals per model and year through the JSON endpoints its web app calls
  (`parts.yamaha-motor.co.jp/ypec_b2c/services/omb2c/model_year_list/` and `model_list/`, POST, `baseCode` 6150, `langId` 02).

Usage: download the PDFs into an empty directory and run the builders from that directory, for example
`python3 scripts/manual-textlayer/build_from_index.py docs/research/manual-index/ktm-group-us.tsv todo <out dir>`.
A path printed with two different values for one bike is dropped, never guessed.
Method and results: `docs/research/expansion/ktm-group/TEXT_LAYER_REVIEW_2026-10-13.md`,
`docs/research/expansion/triumph/HANDBOOK_REVIEW_2026-10-13.md`, `docs/research/expansion/yamaha/SCHEDULE_REVIEW_2026-10-13.md`
and `docs/research/expansion/yamaha/TEXT_LAYER_REVIEW_2026-10-13.md`.
