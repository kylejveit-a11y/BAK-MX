# KTM, Husqvarna and GasGas owner's manuals — text-layer review, 2026-10-10

Scope: English owner's manuals the three brands publish on their own sites ("Manuals" page of ktm.com, husqvarna-motorcycles.com
and gasgas.com, US region). All three serve the PDFs from one document host. Facts only are stored, each with the
document URL, SHA-256, PDF page and printed page. No manual is redistributed.

## What was added

7,288 verified facts across 52 bike-years. Each cell is facts / service-schedule rows / damper click settings.

| Model | 2023 | 2024 | 2025 | 2026 | 2027 |
|---|---|---|---|---|---|
| KTM 250 SX-F | 150/58/15 | 151/58/15 | 149/57/15 | 147/57/15 | 147/57/15 |
| KTM 250 XC-F | 153/58/15 | 156/58/15 | 155/57/15 | 143/57/9 | 143/57/9 |
| KTM 350 SX-F | 149/58/15 | 150/58/15 | 148/56/15 | 146/55/15 | 148/57/15 |
| KTM 350 XC-F | 151/58/15 | 156/58/15 | 154/56/15 | not loaded | 143/57/9 |
| KTM 450 SX-F | 148/57/15 | 149/58/15 | 88/57/15 (a) | 149/57/15 | 149/57/15 |
| KTM 450 XC-F | 149/57/15 | 154/58/15 | 155/57/15 | 147/57/12 | 144/57/9 |
| Husqvarna FC 250 | | | 86/55/15 (a) | 107/57/0 (b) | 146/57/15 |
| Husqvarna FC 350 | | | 141/55/15 | no manual listed | 146/57/15 |
| Husqvarna FC 450 | | | 86/55/15 (a) | 107/57/0 (b) | 144/57/15 |
| Husqvarna FX 350 | | | 140/55/15 | 149/57/15 | 149/57/15 |
| Husqvarna FX 450 | | | 143/56/15 | no manual listed | 147/57/15 |
| GasGas MC 250F | | | 86/55/15 (a) | 144/57/15 | 146/57/15 |
| GasGas MC 350F | | | 141/56/15 | no manual listed | no manual listed |
| GasGas MC 450F | | | 87/56/15 (a) | 147/57/15 | 147/57/15 |
| GasGas EX 250F / 350F / 450F | | | 143 / 142 / 143 | no manual listed | no manual listed |

(a) A visually reviewed table was already on file for this bike; only suspension rows (with the adjuster named) and the service schedule were added.
(b) The manual served for this year prints suspension data for the EU model and the Factory Edition only, so no suspension rows were stored for the US standard model.

Per bike this is the technical-data chapter (engine, gearing, capacities, chassis, fork, shock: Comfort / Standard / Sport
clicks and turns, sag, spring rates by rider weight, air pressure) and the full service schedule with each task's interval.

## Method

1. The PDF is fetched in a browser and hashed before anything is read.
2. Text is read with glyph positions. In the technical data, indentation and the value column decide what is a group, a label and a value.
   In the service schedule, each mark's horizontal position is matched to the column headers on the same page
   (open circle = one-time interval, filled circle = periodic), and the legend is confirmed on the page.
3. A manual covers several models and regions. A row is kept only if every printed validity note on its section, group and label
   matches the US standard model. Factory, Heritage and other special-edition rows are excluded.
4. Rows travel to the database as a difference against a bike already on file. The database rebuilds the table and stores it only when
   its hash equals the hash computed where the PDF was read (`private.stage_manual_rows`, migration `20261010010000`).
5. Rows are inserted STAGED, pass the evidence gate, then are promoted.

## Checks that were run

- Each fork and shock damping group (Comfort / Standard / Sport) was compared with the adjustment section of the same manual.
  A group that could not be matched there was not stored. That is why some cross-country bikes show 9 or 12 damper values instead of 15.
- A path that occurred twice for one bike was dropped unless exactly one of the two was marked US.
- The cover of each manual names the model.
- After a parser change, bikes already loaded were re-parsed and compared before anything new was sent.

## Left out on purpose

- First-gear ratio on several 2025–2027 manuals: the manufacturer's PDF prints a clock time ("2:28 PM") where the ratio belongs.
- Fork spring rates printed as 42–50 N/mm in two 2025 GasGas cross-country tables (a fork rate ten times too high as printed).
- Husqvarna FX 350 2025 "Fork air pressure 5 bar": printed, but not repeated anywhere else in the manual. Left staged, not verified.
- KTM 350 XC-F 2026: the manual names the model on the cover but carries no suspension section for it.
- Tire and fuel sub-tables.
- Truncated schedule text: where a task's parenthetical runs across a page break in the text layer, Husqvarna and GasGas rows keep the task
  without the parenthetical. A handful of 2024–2025 KTM rows keep the parenthetical cut short.

## Published but not loaded yet

| Manuals | Why |
|---|---|
| KTM 2020–2022 four-strokes | Two schedule tables with different columns per manual; the technical data loads but the schedule reader rejects it |
| Husqvarna and GasGas 2023–2024 | Older layout; the model filter does not yet separate FC from FX or MC from EX reliably |
| All two-strokes (KTM SX / XC, Husqvarna TC / TX, GasGas MC / EX) | Not read yet; carburetor and TBI sections need their own check |

The index of manuals found is in `docs/research/manual-index/ktm-group-us.tsv`.

## What this review is not

Rows were machine-read from the document's text layer with the checks above. They were not each compared by eye against a rendered page.
