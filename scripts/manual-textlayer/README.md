# Owner's-manual text-layer extraction (KTM group)

Reads the technical-data chapter and the service schedule of an English KTM / Husqvarna / GasGas owner's manual
PDF with glyph positions (pdfplumber) and produces hash-guarded payloads for `private.kg` /
`private.stage_manual_rows` (migration `20261010010000`). Facts only; the PDFs are never stored or redistributed.

- `tech_data_2020_2025.py`: manuals with the "TECHNICAL DATA" / "TECHNICAL SPECIFICATIONS" page header.
- `tech_data_2025_plus.py`: manuals with the "Technical specifications" header (new authoring system).
- `service_schedule.py`: both layouts. Column = header line order (bottom header line is the leftmost column);
  open circle = one-time, filled circle = periodic.
- `validity.py`: decides whether a printed validity note ("All SX models", "125 XC US", "Big wheel", ...)
  applies to the US standard model being loaded. Rows whose note does not match are not stored.
- `plan.py` / `build_payloads.py`: document list and payload builder. A path printed with two different values
  for one bike is dropped, never guessed.

Usage: download the PDFs into an empty directory, then
`python3 scripts/manual-textlayer/build_payloads.py <pdf dir> <out dir>` (run from the PDF directory).
Method and results: `docs/research/expansion/ktm-group/TEXT_LAYER_REVIEW_2026-10-13.md`.
