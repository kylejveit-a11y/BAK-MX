# Kawasaki KX suspension facts: text-layer re-check, 2026-10-30

The suspension pass of 2026-10-2x read the Front / Rear Suspension chapters of the KX owner's manuals from the e-book text layer
(`search.xml` on Kawasaki's manual server). Its clicker standard settings were later re-read from the page images and verified;
the rest of that pass (fork oil amounts and ranges, fork oil type, spring rates, optional springs, usable click ranges, preload
nut positions, fork height, standard air pressure) stayed STAGED. The page images are no longer served (403), so those rows
were re-checked against a fresh download of the same text layer:

- Every row's value must appear on the page named in its locator (whitespace-insensitive), or every figure and unit of the
  value must appear on that page (the text layer sometimes reorders a line, e.g. "KHL15-11 (1 L): P/No. 44091-0020").
- Every metric / imperial pair printed in the value must agree (mL / US oz, mm / in, N/mm / kgf/mm).
- A row whose bike already has a VERIFIED row for the same setting was left alone (no same-setting conflicts possible).
- The SHA-256 of each text layer as downloaded on 2026-10-30 is recorded in `doc_hashes_textlayer_2026-10-30.json` and on each
  row as `document_sha256` / `approved_document_sha256`.

Result: 301 rows over 20 bike-years. 231 matched their page verbatim, 68 matched by figures and units,
2 had a wrong page in the locator and were corrected after the value was found elsewhere in the same manual
(KX450 2026 rear rebound usable range: page 163 (KX450M column); KX250 2020 optional springs: pages 150-151).
All rows passed the conversion check. Promotion SQL: `promote_textlayer_2026-10-30.sql` (guarded `status='STAGED'`).

| Bike-year | Rows |
|---|---|
| KX250 2020 | 16 |
| KX250 2021 | 16 |
| KX250 2022 | 16 |
| KX250 2023 | 16 |
| KX250 2024 | 16 |
| KX250 2025 | 15 |
| KX250X 2021 | 16 |
| KX250X 2022 | 15 |
| KX250X 2023 | 15 |
| KX250X 2024 | 15 |
| KX250X 2025 | 15 |
| KX450 2020 | 13 |
| KX450 2021 | 12 |
| KX450 2024 | 15 |
| KX450 2025 | 15 |
| KX450 2026 | 15 |
| KX450X 2021 | 15 |
| KX450X 2024 | 15 |
| KX450X 2025 | 15 |
| KX450X 2026 | 15 |
