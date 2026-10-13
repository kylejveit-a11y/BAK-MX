# Yamaha maintenance intervals, text-layer extraction, 2026-10-13

Review record for the service-schedule rows loaded on 2026-10-13 for the 56 YZ bike-years whose US Owner's Service Manual
was already on file (the specification rows came from the same documents on 2026-10-09, see `TEXT_LAYER_REVIEW_2026-10-09.md`).
Same documents, same SHA-256 hashes, same document revisions; only the MAINTENANCE INTERVALS table (chapter 3) was read.

## What was added

4,389 verified service-interval facts across 56 bike-years. Each cell is the number of schedule rows stored.

| Model | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 |
|---|---|---|---|---|---|---|---|---|
| Yamaha YZ125 |  | 63 | 63 | 63 | 63 | 63 | 63 | 63 |
| Yamaha YZ125X |  | 64 | 64 | 64 | 64 | 64 | 64 | 64 |
| Yamaha YZ250 |  |  | 63 | 63 | 63 | 63 | 63 | 63 |
| Yamaha YZ250X |  |  | 64 | 64 | 64 | 64 | 64 | 64 |
| Yamaha YZ250F | 90 | 90 | 90 | 90 | 90 | 90 | 90 | 94 |
| Yamaha YZ250FX |  | 93 | 93 | 93 | 93 | 93 | 93 | 93 |
| Yamaha YZ450F | 90 | 90 | 90 | 89 | 89 | 89 | 94 | 94 |
| Yamaha YZ450FX |  | 91 | 91 | 91 | 90 | 90 | 90 | 95 |

Empty cells are bike-years with no manual on file yet (2020 YZ125 / YZ125X / YZ250FX / YZ450FX, 2020-2021 YZ250 / YZ250X).

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
4. Payloads are loaded through `private.stage_manual_rows` with an empty base; the database rebuilds the rows and stores them
   only when the SHA-256 of the rebuilt table equals the hash computed where the PDF was read (56 of 56 matched).
5. Rows are staged, pass the evidence gate, then verified. Conditions for these rows come from the Yamaha branch of
   `private.manual_conditions` (migration `20261013020000`), which quotes the table's own notice.

## Checks that were run

- Two pages rendered and compared mark-for-mark with the extracted rows: 2025 YZ250F page 86 (items 1-10) and 2020 YZ450F
  page 79 (items 30-42). Every mark and every text entry matched; the "Every one year" entry on the 2020 page was missed by the
  first version of the extractor and the fix was then applied to all 56 manuals.
- Row counts are stable across years of the same model and change only where the manual changes (hydraulic clutch rows on the
  2026-2027 YZ450F and 2027 YZ250F / YZ450FX, a battery row on 2025-on four-strokes).
- No path is printed twice in any manual; no value contains a separator character.

## Left out on purpose

- The torque-check points table referenced by the notice (already covered by the tightening-torque rows where loaded).
- The wording "Replace fiver" on the 2020 YZ450F exhaust row is the manual's own.
