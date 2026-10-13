# Yamaha maintenance intervals, text-layer extraction, 2026-10-13

Review record for the service-schedule rows loaded on 2026-10-13 for 64 YZ bike-years: the 56 whose US Owner's Service Manual
was already on file (the specification rows came from the same documents on 2026-10-09, see `TEXT_LAYER_REVIEW_2026-10-09.md`),
plus eight 2020-2021 bike-years whose manuals were found in Yamaha's library on 2026-10-13 (`TEXT_LAYER_REVIEW_2026-10-13.md`).
Same documents, same SHA-256 hashes, same document revisions; only the MAINTENANCE INTERVALS table (chapter 3) was read.

## What was added

4,970 verified service-interval facts across 64 bike-years. Each cell is the number of schedule rows stored.

| Model | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 |
|---|---|---|---|---|---|---|---|---|
| Yamaha YZ125 | 67 (a) | 63 | 63 | 63 | 63 | 63 | 63 | 63 |
| Yamaha YZ125X | 68 (a) | 64 | 64 | 64 | 64 | 64 | 64 | 64 |
| Yamaha YZ250 | 67 (a) | 63 (b) | 63 | 63 | 63 | 63 | 63 | 63 |
| Yamaha YZ250X | 68 (a) | 64 (b) | 64 | 64 | 64 | 64 | 64 | 64 |
| Yamaha YZ250F | 90 | 90 | 90 | 90 | 90 | 90 | 90 | 94 |
| Yamaha YZ250FX | 93 | 93 | 93 | 93 | 93 | 93 | 93 | 93 |
| Yamaha YZ450F | 90 | 90 | 90 | 89 | 89 | 89 | 94 | 94 |
| Yamaha YZ450FX | 91 | 91 | 91 | 91 | 90 | 90 | 90 | 95 |

(a) 2020 two-stroke manuals (`B0V-28199-11` covers YZ125 and YZ125X, `B9U-28199-11` covers YZ250 and YZ250X) print the older
table: the item in capitals with its routines beneath, filled dots as marks, no dealer asterisk, and a Remarks column.
Remarks go with the routine they are printed against ("remarks: Every one year" on "Brakes – Replace brake fluid"), or with the
item when they are not aligned with a routine ("Cylinder head – Remarks"). These manuals print the third and fifth columns as
"Every third (about 7.5 hours)" / "Every fifth (about 12.5 hours)", without the word "race"; the values keep the printed wording.
(b) One manual (`BF1-2819U-10`) covers the 2021 YZ250 and YZ250X; the one model-specific item ("Sidestand (YZ250X)") is kept
for the YZ250X only.

One row per item and routine: `Service schedule / <item> – <routine>` with the marked intervals as the value, for example
`Service schedule / Valve – Check the valve clearances: after break-in; every third race (about 7.5 hours); marked for a Yamaha dealer`.
Where the manual prints text across the interval columns instead of a mark ("Every one year", "Every 2 years", "Every 45 hours")
that text is the first interval entry. A bracketed note printed across the columns ("(After washing the motorcycle or riding in
the rain)") is kept with the routine. The asterisk (items the manual says a Yamaha dealer should do) becomes "marked for a Yamaha dealer".

## Method

`scripts/manual-textlayer/yamaha_schedule.py`, `build_yamaha_schedule.py`.

1. Pages headed MAINTENANCE INTERVALS. The table's own rule lines define the cells: rules starting in the item-number column
   separate items, rules spanning the routine column separate routines, vertical rules separate the five interval columns.
   Manuals to model year 2024 draw full-width rules; 2025-on manuals draw one rule segment per cell. The header labels are read
   from the header band of every page and the page is rejected unless they contain "break-in" and "required".
2. A check mark is the Symbol-font glyph (U+F0D6 in the older manuals, 0xD6 in the newer ones); its x position chooses the column.
3. An item continued on the next page keeps its name.
   The 2020 two-stroke layout has its own reader (`parse_old`): item bands from the rules in the item column, routines from the
   indented lines, marks matched to a routine by vertical position, remarks matched the same way.
4. Payloads are loaded through `private.stage_manual_rows` with an empty base; the database rebuilds the rows and stores them
   only when the SHA-256 of the rebuilt table equals the hash computed where the PDF was read (64 of 64 matched).
5. Rows are staged, pass the evidence gate, then verified. Conditions for these rows come from the Yamaha branch of
   `private.manual_conditions` (migration `20261013020000`), which quotes the table's own notice.

## Checks that were run

- Three pages rendered and compared mark-for-mark with the extracted rows: 2025 YZ250F page 86 (items 1-10), 2020 YZ450F
  page 79 (items 30-42) and 2020 YZ250 page 60 (older layout, "Outside nuts and bolts" to "Protector guide"). Every mark and every text entry matched; the "Every one year" entry on the 2020 page was missed by the
  first version of the extractor and the fix was then applied to all 56 manuals.
- Row counts are stable across years of the same model and change only where the manual changes (hydraulic clutch rows on the
  2026-2027 YZ450F and 2027 YZ250F / YZ450FX, a battery row on 2025-on four-strokes).
- No path is printed twice in any manual; no value contains a separator character.

## Left out on purpose

- The torque-check points table referenced by the notice (already covered by the tightening-torque rows where loaded).
- The wording "Replace fiver" on the 2020 YZ450F exhaust row is the manual's own.
