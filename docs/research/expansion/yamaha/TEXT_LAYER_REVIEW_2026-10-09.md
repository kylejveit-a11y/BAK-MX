# Yamaha specification tables — text-layer review, 2026-10-09

Scope: US Yamaha Owner's Service Manuals published in Yamaha's own Owner's Manual Library
(`library.ymcapps.net`, reached from the "Owner Manuals" link on yamahamotorsports.com).
Facts only are stored, each with the document URL, SHA-256, PDF page and printed page. No manual is redistributed.

## What was added

9,396 verified facts across 59 bike-years:

| Model | Years | Facts |
|---|---|---|
| YZ450F | 2018–2027 | 1,169 |
| YZ250F | 2019–2027 | 1,224 |
| YZ125 | 2021–2027 | 1,173 |
| YZ250 | 2022–2027 | 1,022 |
| YZ450FX | 2021–2027 | 1,313 |
| YZ250FX | 2021–2027 | 1,272 |
| YZ125X | 2021–2027 | 1,180 |
| YZ250X | 2022–2027 | 1,043 |

For each bike this is the full chapter 2 specification table (engine, carburetor jetting on two-strokes, clutch,
gearing, wheels, tires, brakes, suspension clicker positions Soft / STD / Hard, preload, chain) plus the rider sag
figure and, where the manual prints it cleanly, the standard fork and shock spring rates.
2018–2020 manuals use an older layout; for those only tuning and service-quantity rows were taken (72–90 rows each).
2024 YZ250F, 2023 YZ450F and 2026 YZ450F already had a visually reviewed table; only sag (and 2026 spring rates) was added.

List what is on file, with the document hash each bike was read from:

```sql
select model, model_year, count(*) facts, min(source_url) url,
       min(evidence_record#>>'{source,document_sha256}') sha256, min(evidence_record#>>'{source,document_revision}') revision
from claims where manufacturer='Yamaha' and evidence_record#>>'{review,reviewer_id}' like '%text-layer%'
group by 1,2 order by 1,2;
```

## Method

1. The PDF is fetched in a browser from Yamaha's library and hashed (SHA-256) before anything is read.
   Where the database already recorded a hash for that manual, the two were compared.
2. The text layer of the specification chapter is parsed into rows: section / sub-section / label, value, unit, PDF page, printed page.
3. Rows whose value lost a symbol in the text layer (°, Ω in 2021–2024 manuals) are dropped, not guessed.
   That removes caster angle, injector resistance and idle coolant temperature for those years.
4. The rows are sent to the database as a difference against a bike already loaded. The database rebuilds the full
   table and stores it only if its hash equals the hash computed where the PDF was read
   (`private.stage_yamaha_specs`, migration `20261009050000`). A typing slip in between cannot be stored.
5. Rows are inserted STAGED, pass the same evidence gate as every other fact, then are promoted.

## Checks that were run

- The parser was run on the 2026 YZ450F manual and compared with the 180 rows a previous pass reviewed visually: 180 of 180 agree (including the `1+1/4` turn value).
- In every manual loaded, all fifteen damper values (fork rebound, fork compression, shock rebound, fast and slow compression; Soft / STD / Hard)
  were compared with the "Minimum / Standard / Maximum" block in the adjustment section of the same manual. A manual was loaded only if all fifteen agree.
- The sag figure (90–100 mm) is repeated in the suspension setting chart of each manual.
- No row path occurs twice for a bike.

## What this review is not

These rows were machine-read from the document's own text layer with the checks above. They were not each compared by eye against a rendered page.
The weakest rows are free-text ones (oil grade, fuel type). Numbers in the suspension tables are the best-checked.

## Two manuals changed on Yamaha's server

The file now served for the 2026 YZ450F (`D03-2819U-10`) hashes to `7c728673…e73bd`; facts loaded in September cite `b5cbf756…a6fbd`.
The specification table is unchanged (179 of 180 rows identical, the other is a label format). New rows cite the hash actually read.

## Published by Yamaha but not loaded yet

| Manual | Why |
|---|---|
| YZ450F 2016–2017, YZ250F 2016–2018 (`B11`, `1SM`) | Multi-region table layout; parser output was wrong, so nothing was stored |
| YZ125 2016–2020, YZ250 2017–2020 (`1SR`, `1SS`, `B0V-28199`, `B9U`) | Older layout, specification chapter not recognised |
| YZ250 2021 (`BF1-2819U-10`) | One manual covers YZ250 and YZ250X with mixed values per row; failed the damper cross-check |
| YZ85 / YZ85LW 2016–2027, YZ65 2018–2027 | Short owner's manuals in a different layout; need their own reader |
| Maintenance interval charts, all models | The chart's tick marks lose their column in the text layer; needs position-aware reading |

The full list of published manuals is in `docs/research/manual-index/yamaha-us.tsv`.
